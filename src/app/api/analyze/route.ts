import { NextRequest, NextResponse } from 'next/server';
import { searchSubtitles, downloadSubtitle, parseSRT } from '@/lib/opensubtitles';
import { analyzeProfanity, calculateRating } from '@/lib/gemini';
import { analysisCache } from '@/lib/cache';
import { AnalysisResult, Feature, ProfanityCategory, ProfanityWord } from '@/types';
import { getDemoAnalysis, DEMO_MOVIES } from '@/lib/demo-data';

export const maxDuration = 120;

function buildResultFromDemo(feature: Feature): AnalysisResult | null {
  const demoAnalysis = getDemoAnalysis(feature.id);
  if (!demoAnalysis) return null;

  // Enrich feature with demo movie metadata
  const demoMovie = DEMO_MOVIES.find((m) => m.id === feature.id);
  if (demoMovie) {
    feature.overview = demoMovie.overview;
    feature.vote_average = demoMovie.vote_average;
    feature.genres = demoMovie.genres;
    feature.runtime = demoMovie.runtime;
    feature.tagline = demoMovie.tagline;
    feature.poster_url = demoMovie.poster_url;
  }

  const categoryIcons: Record<string, string> = {
    'Sexual/Crude': '🔞',
    'Religious/Profane': '⛪',
    'Slurs/Hate Speech': '🚫',
    'General Profanity': '🤬',
    'Violence/Threats': '⚔️',
    'Scatological': '💩',
    'Insults': '😤',
    'Substance References': '🚬',
  };

  const categorySeverity: Record<string, 'mild' | 'moderate' | 'strong'> = {
    'Sexual/Crude': 'strong',
    'Religious/Profane': 'mild',
    'Slurs/Hate Speech': 'strong',
    'General Profanity': 'moderate',
    'Violence/Threats': 'moderate',
    'Scatological': 'mild',
    'Insults': 'mild',
    'Substance References': 'mild',
  };

  // Group profanities into categories
  const categoryMap = new Map<string, ProfanityWord[]>();
  for (const prof of demoAnalysis.profanities) {
    if (!categoryMap.has(prof.category)) {
      categoryMap.set(prof.category, []);
    }
    categoryMap.get(prof.category)!.push({
      word: prof.word,
      count: prof.count,
      category: prof.category,
      severity: prof.severity,
    });
  }

  const categories: ProfanityCategory[] = [];
  for (const [name, words] of categoryMap) {
    words.sort((a, b) => b.count - a.count);
    categories.push({
      name,
      words,
      totalCount: words.reduce((sum, w) => sum + w.count, 0),
      severity: categorySeverity[name] || 'moderate',
      icon: categoryIcons[name] || '⚠️',
    });
  }
  categories.sort((a, b) => b.totalCount - a.totalCount);

  const { rating, score } = calculateRating(categories);

  return {
    feature,
    categories,
    totalProfanities: categories.reduce((sum, c) => sum + c.totalCount, 0),
    rating,
    ratingScore: score,
    summary: demoAnalysis.summary,
    analyzedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature } = body as { feature: Feature };

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `analysis:${feature.id}:${feature.type}`;
    const cached = analysisCache.get<AnalysisResult>(cacheKey);
    if (cached) {
      return NextResponse.json({ result: cached, fromCache: true });
    }

    // Check if this is a demo movie (id starts with "demo-")
    if (feature.id.startsWith('demo-')) {
      const demoResult = buildResultFromDemo(feature);
      if (demoResult) {
        analysisCache.set(cacheKey, demoResult, 86400000);
        return NextResponse.json({ result: demoResult, fromCache: false });
      }
    }

    // Try real API flow: OpenSubtitles + Gemini
    if (feature.tmdb_id) {
      try {
        // Step 1: Search for subtitles
        const subtitles = await searchSubtitles(feature.tmdb_id, feature.type);

        if (subtitles.length && subtitles[0].files.length) {
          const bestSubtitle = subtitles.find((s) => s.files.length > 0);

          if (bestSubtitle) {
            // Step 2: Download subtitle
            const rawContent = await downloadSubtitle(bestSubtitle.files[0].file_id);
            const subtitleText = parseSRT(rawContent);

            if (subtitleText && subtitleText.length >= 50) {
              // Step 3: Analyze with Gemini
              const { categories, summary } = await analyzeProfanity(subtitleText, feature.title);
              const { rating, score } = calculateRating(categories);

              const result: AnalysisResult = {
                feature,
                categories,
                totalProfanities: categories.reduce((sum, c) => sum + c.totalCount, 0),
                rating,
                ratingScore: score,
                summary,
                analyzedAt: new Date().toISOString(),
              };

              analysisCache.set(cacheKey, result, 86400000);
              return NextResponse.json({ result, fromCache: false });
            }
          }
        }
      } catch (apiError) {
        console.warn('API analysis failed, checking for demo fallback:', (apiError as Error).message);
      }
    }

    // If we reach here, try demo fallback even for non-demo IDs (match by tmdb_id)
    const matchingDemo = DEMO_MOVIES.find((m) => m.tmdb_id === feature.tmdb_id);
    if (matchingDemo) {
      const enrichedFeature = { ...feature, id: matchingDemo.id };
      const demoResult = buildResultFromDemo(enrichedFeature);
      if (demoResult) {
        analysisCache.set(cacheKey, demoResult, 86400000);
        return NextResponse.json({ result: demoResult, fromCache: false });
      }
    }

    return NextResponse.json(
      { error: 'Unable to analyze this title. Subtitles could not be retrieved. Please try a different title.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
