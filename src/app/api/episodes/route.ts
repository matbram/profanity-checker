import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { searchCache } from '@/lib/cache';

const log = createLogger('api/episodes');
const BASE_URL = 'https://api.opensubtitles.com/api/v1';

export async function GET(request: NextRequest) {
  const tmdbId = request.nextUrl.searchParams.get('tmdb_id');
  const season = request.nextUrl.searchParams.get('season');

  if (!tmdbId || !season) {
    return NextResponse.json({ error: 'tmdb_id and season are required' }, { status: 400 });
  }

  const cacheKey = `episodes:${tmdbId}:${season}`;
  const cached = searchCache.get<{ episodes: { number: number; title: string; subtitle_count: number }[] }>(cacheKey);
  if (cached) {
    log.info(`Episodes cache HIT for tmdb:${tmdbId} season:${season}`);
    return NextResponse.json(cached);
  }

  const apiKey = process.env.OPENSUBTITLES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      parent_tmdb_id: tmdbId,
      season_number: season,
      languages: 'en',
      order_by: 'episode_number',
    });

    log.info(`Fetching episodes: tmdb:${tmdbId} season:${season}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BASE_URL}/subtitles?${params}`, {
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ProfanityChecker v1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text();
      log.error(`Subtitle search failed: ${res.status}`, { body: body.substring(0, 500) });
      return NextResponse.json({ error: `Failed to fetch episodes: ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const data = json.data || [];

    const episodeMap = new Map<number, { number: number; title: string; subtitle_count: number }>();

    for (const item of data) {
      const attrs = item.attributes as Record<string, unknown>;
      const details = attrs?.feature_details as Record<string, unknown> | undefined;
      if (details?.episode_number) {
        const epNum = details.episode_number as number;
        if (episodeMap.has(epNum)) {
          episodeMap.get(epNum)!.subtitle_count++;
        } else {
          episodeMap.set(epNum, {
            number: epNum,
            title: (details.title as string) || `Episode ${epNum}`,
            subtitle_count: 1,
          });
        }
      }
    }

    const episodes = Array.from(episodeMap.values()).sort((a, b) => a.number - b.number);
    log.info(`Found ${episodes.length} episodes for tmdb:${tmdbId} season:${season}`);

    const result = { episodes };
    searchCache.set(cacheKey, result, 3600000);
    return NextResponse.json(result);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      log.error('Request timed out');
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    log.error(`Error: ${(error as Error).message}`);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
