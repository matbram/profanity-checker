import { NextRequest, NextResponse } from 'next/server';
import { searchSubtitles, downloadSubtitle, parseSRT } from '@/lib/opensubtitles';
import { analyzeProfanity, calculateRating } from '@/lib/gemini';
import { analysisCache } from '@/lib/cache';
import { AnalysisResult, Feature } from '@/types';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature } = body as { feature: Feature };

    if (!feature || !feature.tmdb_id) {
      return NextResponse.json(
        { error: 'Feature with tmdb_id is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `analysis:${feature.tmdb_id}:${feature.type}`;
    const cached = analysisCache.get<AnalysisResult>(cacheKey);
    if (cached) {
      return NextResponse.json({ result: cached, fromCache: true });
    }

    // Step 1: Search for subtitles
    const subtitles = await searchSubtitles(feature.tmdb_id, feature.type);

    if (!subtitles.length || !subtitles[0].files.length) {
      return NextResponse.json(
        { error: 'No subtitles found for this title. Try a different movie or show.' },
        { status: 404 }
      );
    }

    // Pick the most downloaded subtitle with files
    const bestSubtitle = subtitles.find((s) => s.files.length > 0);
    if (!bestSubtitle) {
      return NextResponse.json(
        { error: 'No downloadable subtitles found.' },
        { status: 404 }
      );
    }

    // Step 2: Download subtitle
    let subtitleText: string;
    try {
      const rawContent = await downloadSubtitle(bestSubtitle.files[0].file_id);
      subtitleText = parseSRT(rawContent);
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download subtitles. The service may have rate limits - please try again later.' },
        { status: 503 }
      );
    }

    if (!subtitleText || subtitleText.length < 50) {
      return NextResponse.json(
        { error: 'Subtitle content too short for analysis.' },
        { status: 422 }
      );
    }

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

    // Cache for 24 hours
    analysisCache.set(cacheKey, result, 86400000);

    return NextResponse.json({ result, fromCache: false });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
