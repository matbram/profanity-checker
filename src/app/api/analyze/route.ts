import { NextRequest, NextResponse } from 'next/server';
import { searchSubtitles, downloadSubtitle, parseSRT } from '@/lib/opensubtitles';
import { analyzeProfanity, calculateRating } from '@/lib/gemini';
import { analysisCache } from '@/lib/cache';
import { AnalysisResult, Feature } from '@/types';
import { createLogger } from '@/lib/logger';

const log = createLogger('api/analyze');

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, season, episode } = body as { feature: Feature; season?: number; episode?: number };
    log.info('Analyze request received', {
      id: feature?.id,
      title: feature?.title,
      type: feature?.type,
      tmdb_id: feature?.tmdb_id,
      season,
      episode,
    });

    if (!feature || !feature.tmdb_id) {
      log.error('Missing feature or tmdb_id in request');
      return NextResponse.json(
        { error: 'Feature with tmdb_id is required' },
        { status: 400 }
      );
    }

    // Check cache (include season/episode for TV shows)
    const cacheKey = `analysis:${feature.tmdb_id}:${feature.type}:s${season ?? ''}e${episode ?? ''}`;
    const cached = analysisCache.get<AnalysisResult>(cacheKey);
    if (cached) {
      log.info('Analysis cache HIT, returning cached result');
      return NextResponse.json({ result: cached, fromCache: true });
    }
    log.info('Analysis cache MISS, starting full pipeline');

    // Step 1: Search for subtitles
    log.info(`Step 1: Searching subtitles for tmdb_id:${feature.tmdb_id} type:${feature.type} s${season}e${episode}`);
    let subtitles;
    try {
      subtitles = await searchSubtitles(feature.tmdb_id, feature.type, 'en', season, episode);
    } catch (err) {
      log.error(`Subtitle search failed: ${(err as Error).message}`);
      return NextResponse.json(
        { error: `Subtitle search failed: ${(err as Error).message}` },
        { status: 502 }
      );
    }

    if (!subtitles.length) {
      log.warn('No subtitles found');
      return NextResponse.json(
        { error: 'No subtitles found for this title.' },
        { status: 404 }
      );
    }

    // Get candidates with downloadable files, sorted by download count
    const candidates = subtitles.filter((s) => s.files.length > 0);
    if (!candidates.length) {
      log.warn('Subtitles found but no downloadable files');
      return NextResponse.json(
        { error: 'No downloadable subtitle files found.' },
        { status: 404 }
      );
    }

    // Try up to 3 subtitles - use the best one that downloads successfully and has enough content
    let subtitleText = '';
    let subtitlesAttempted = 0;
    const maxAttempts = Math.min(candidates.length, 3);

    for (let i = 0; i < maxAttempts; i++) {
      const candidate = candidates[i];
      subtitlesAttempted++;
      log.info(`Trying subtitle ${i + 1}/${maxAttempts}`, {
        subtitle_id: candidate.subtitle_id,
        file_id: candidate.files[0].file_id,
        download_count: candidate.download_count,
        ratings: candidate.ratings,
      });

      try {
        const rawContent = await downloadSubtitle(candidate.files[0].file_id);
        const parsed = parseSRT(rawContent);

        if (parsed.length >= 100) {
          subtitleText = parsed;
          log.info(`Subtitle ${i + 1} accepted: ${parsed.length} chars`);
          break;
        } else {
          log.warn(`Subtitle ${i + 1} too short (${parsed.length} chars), trying next`);
        }
      } catch (err) {
        log.warn(`Subtitle ${i + 1} download failed: ${(err as Error).message}, trying next`);
      }
    }

    if (!subtitleText || subtitleText.length < 50) {
      log.warn(`No usable subtitle content after ${subtitlesAttempted} attempts`);
      return NextResponse.json(
        { error: 'Could not download usable subtitles. Please try again later.' },
        { status: 422 }
      );
    }

    // Step 3: Analyze with Gemini
    const titleLabel = season !== undefined && episode !== undefined
      ? `${feature.title} S${season}E${episode}`
      : feature.title;
    log.info(`Step 3: Sending ${subtitleText.length} chars to Gemini for "${titleLabel}"`);

    let categories, summary;
    try {
      const analysis = await analyzeProfanity(subtitleText, titleLabel);
      categories = analysis.categories;
      summary = analysis.summary;
    } catch (err) {
      log.error(`Gemini analysis failed: ${(err as Error).message}`);
      return NextResponse.json(
        { error: `AI analysis failed: ${(err as Error).message}` },
        { status: 502 }
      );
    }

    const { rating, score } = calculateRating(categories);

    // Enrich feature with season/episode info
    const enrichedFeature = {
      ...feature,
      ...(season !== undefined && { season }),
      ...(episode !== undefined && { episode }),
    };

    const result: AnalysisResult = {
      feature: enrichedFeature,
      categories,
      totalProfanities: categories.reduce((sum, c) => sum + c.totalCount, 0),
      rating,
      ratingScore: score,
      summary,
      analyzedAt: new Date().toISOString(),
      subtitlesUsed: subtitlesAttempted,
    };

    log.info('Analysis complete', {
      totalProfanities: result.totalProfanities,
      categories: result.categories.length,
      rating: result.rating,
      score: result.ratingScore,
      subtitlesAttempted,
    });

    analysisCache.set(cacheKey, result, 86400000);
    return NextResponse.json({ result, fromCache: false });
  } catch (error) {
    log.error(`Unhandled error: ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      { error: `Analysis failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
