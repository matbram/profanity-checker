import { NextRequest, NextResponse } from 'next/server';
import { parseSRT } from '@/lib/opensubtitles';
import { searchAllProviders } from '@/lib/subtitle-providers';
import { analyzeProfanity, calculateRating } from '@/lib/gemini';
import { analysisCache } from '@/lib/cache';
import { AnalysisResult, Feature } from '@/types';
import { createLogger } from '@/lib/logger';

const log = createLogger('api/analyze');

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

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
  log.info('Analysis cache MISS, starting streamed pipeline');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Controller may be closed
        }
      };

      try {
        // Step 0: Search all subtitle providers
        send({ step: 0, message: 'Searching for subtitles across multiple sources' });
        log.info(`Step 1: Searching all providers for tmdb_id:${feature.tmdb_id} type:${feature.type} s${season}e${episode}`);

        let candidates;
        try {
          candidates = await searchAllProviders({
            tmdbId: feature.tmdb_id,
            imdbId: feature.imdb_id,
            type: feature.type,
            title: feature.title,
            year: feature.year,
            language: 'en',
            season,
            episode,
          });
        } catch (err) {
          log.error(`Subtitle search failed: ${(err as Error).message}`);
          send({ step: 'error', error: `Subtitle search failed: ${(err as Error).message}` });
          controller.close();
          return;
        }

        if (!candidates.length) {
          log.warn('No subtitles found from any provider');
          send({ step: 'error', error: 'No subtitles found for this title.' });
          controller.close();
          return;
        }

        log.info(`${candidates.length} candidates from providers, trying downloads`);

        // Step 1: Download subtitles (try candidates from different providers)
        send({ step: 1, message: 'Downloading subtitle file' });
        let subtitleText = '';
        let subtitlesAttempted = 0;
        const maxAttempts = Math.min(candidates.length, 5);

        for (let i = 0; i < maxAttempts; i++) {
          const candidate = candidates[i];
          subtitlesAttempted++;
          log.info(`Trying candidate ${i + 1}/${maxAttempts} from ${candidate.provider}`, {
            id: candidate.id,
            release: candidate.release,
            download_count: candidate.download_count,
          });

          try {
            const rawContent = await candidate.download();

            // Step 2: Parse
            send({ step: 2, message: 'Parsing subtitle content' });
            const parsed = parseSRT(rawContent);

            if (parsed.length >= 100) {
              subtitleText = parsed;
              log.info(`Candidate ${i + 1} accepted (${candidate.provider}): ${parsed.length} chars`);
              break;
            } else {
              log.warn(`Candidate ${i + 1} too short (${parsed.length} chars), trying next`);
            }
          } catch (err) {
            log.warn(`Candidate ${i + 1} (${candidate.provider}) download failed: ${(err as Error).message}, trying next`);
          }
        }

        if (!subtitleText || subtitleText.length < 50) {
          log.warn(`No usable subtitle content after ${subtitlesAttempted} attempts`);
          send({ step: 'error', error: 'Could not download usable subtitles. Please try again later.' });
          controller.close();
          return;
        }

        // Step 3: Analyze with Gemini
        send({ step: 3, message: 'AI analyzing for profanity' });
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
          send({ step: 'error', error: `AI analysis failed: ${(err as Error).message}` });
          controller.close();
          return;
        }

        // Step 4: Categorize results
        send({ step: 4, message: 'Categorizing results' });
        const { rating, score } = calculateRating(categories);

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

        // Send final result
        send({ step: 'complete', result });
      } catch (error) {
        log.error(`Unhandled error: ${(error as Error).message}`, {
          stack: (error as Error).stack,
        });
        send({ step: 'error', error: `Analysis failed: ${(error as Error).message}` });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
