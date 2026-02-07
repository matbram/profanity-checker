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
    const { feature } = body as { feature: Feature };
    log.info('Analyze request received', {
      id: feature?.id,
      title: feature?.title,
      type: feature?.type,
      tmdb_id: feature?.tmdb_id,
    });

    if (!feature || !feature.tmdb_id) {
      log.error('Missing feature or tmdb_id in request');
      return NextResponse.json(
        { error: 'Feature with tmdb_id is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `analysis:${feature.tmdb_id}:${feature.type}`;
    const cached = analysisCache.get<AnalysisResult>(cacheKey);
    if (cached) {
      log.info('Analysis cache HIT, returning cached result');
      return NextResponse.json({ result: cached, fromCache: true });
    }
    log.info('Analysis cache MISS, starting full pipeline');

    // Step 1: Search for subtitles
    log.info(`Step 1: Searching subtitles for tmdb_id:${feature.tmdb_id} type:${feature.type}`);
    let subtitles;
    try {
      subtitles = await searchSubtitles(feature.tmdb_id, feature.type);
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

    const bestSubtitle = subtitles.find((s) => s.files.length > 0);
    if (!bestSubtitle || !bestSubtitle.files.length) {
      log.warn('Subtitles found but no downloadable files');
      return NextResponse.json(
        { error: 'No downloadable subtitle files found.' },
        { status: 404 }
      );
    }

    log.info('Best subtitle selected', {
      subtitle_id: bestSubtitle.subtitle_id,
      file_id: bestSubtitle.files[0].file_id,
      download_count: bestSubtitle.download_count,
      language: bestSubtitle.language,
    });

    // Step 2: Download subtitle
    log.info(`Step 2: Downloading subtitle file_id:${bestSubtitle.files[0].file_id}`);
    let subtitleText: string;
    try {
      const rawContent = await downloadSubtitle(bestSubtitle.files[0].file_id);
      subtitleText = parseSRT(rawContent);
    } catch (err) {
      log.error(`Download failed: ${(err as Error).message}`);
      return NextResponse.json(
        { error: `Failed to download subtitles: ${(err as Error).message}` },
        { status: 503 }
      );
    }

    if (!subtitleText || subtitleText.length < 50) {
      log.warn(`Subtitle content too short: ${subtitleText?.length || 0} chars`);
      return NextResponse.json(
        { error: 'Subtitle content too short for analysis.' },
        { status: 422 }
      );
    }

    // Step 3: Analyze with Gemini
    log.info(`Step 3: Sending ${subtitleText.length} chars to Gemini for analysis`);
    let categories, summary;
    try {
      const analysis = await analyzeProfanity(subtitleText, feature.title);
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

    const result: AnalysisResult = {
      feature,
      categories,
      totalProfanities: categories.reduce((sum, c) => sum + c.totalCount, 0),
      rating,
      ratingScore: score,
      summary,
      analyzedAt: new Date().toISOString(),
    };

    log.info('Analysis complete', {
      totalProfanities: result.totalProfanities,
      categories: result.categories.length,
      rating: result.rating,
      score: result.ratingScore,
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
