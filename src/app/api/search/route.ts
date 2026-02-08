import { NextRequest, NextResponse } from 'next/server';
import { searchFeatures } from '@/lib/opensubtitles';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb';
import { createLogger } from '@/lib/logger';

const log = createLogger('api/search');

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  log.info(`Search request received: q="${query}"`);

  if (!query || query.length < 2) {
    log.info('Query too short, returning empty');
    return NextResponse.json({ results: [] });
  }

  try {
    log.info(`Calling searchFeatures("${query}")`);
    const features = await searchFeatures(query);
    log.info(`searchFeatures returned ${features.length} results`);

    if (!features || features.length === 0) {
      log.info('No features found from OpenSubtitles');
      return NextResponse.json({ results: [], source: 'opensubtitles', message: 'No results from OpenSubtitles' });
    }

    const mapped = (features as Array<Record<string, unknown>>).map((item) => {
      const attrs = item.attributes as Record<string, unknown>;
      return {
        id: String(item.id),
        type: (attrs.feature_type === 'Tvshow' ? 'tvshow' : 'movie') as 'movie' | 'tvshow',
        title: attrs.title as string,
        original_title: (attrs.original_title || attrs.title) as string,
        year: attrs.year as number,
        imdb_id: attrs.imdb_id ? `tt${String(attrs.imdb_id).padStart(7, '0')}` : null,
        tmdb_id: attrs.tmdb_id as number,
        poster_url: (attrs.img_url as string) || null,
        subtitle_count: attrs.subtitle_count as number,
        season_count: (attrs.seasons_count || attrs.season_count || undefined) as number | undefined,
      };
    });

    // Fetch TMDB poster URLs in parallel for reliable images
    const results = await Promise.all(
      mapped.map(async (item) => {
        if (!item.tmdb_id) return item;
        try {
          const details = item.type === 'tvshow'
            ? await getTVDetails(item.tmdb_id)
            : await getMovieDetails(item.tmdb_id);
          if (details?.poster_url) {
            return { ...item, poster_url: details.poster_url };
          }
        } catch {
          // Fall back to OpenSubtitles img_url
        }
        return item;
      })
    );

    log.info(`Returning ${results.length} mapped results`);
    return NextResponse.json({ results, source: 'opensubtitles' });
  } catch (error) {
    const errMsg = (error as Error).message;
    log.error(`Search failed: ${errMsg}`);
    return NextResponse.json(
      {
        results: [],
        error: errMsg,
        source: 'error',
      },
      { status: 500 }
    );
  }
}
