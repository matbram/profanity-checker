import { NextRequest, NextResponse } from 'next/server';
import { searchFeatures } from '@/lib/opensubtitles';
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

    const results = (features as Array<Record<string, unknown>>).map((item) => {
      const attrs = item.attributes as Record<string, unknown>;
      return {
        id: String(item.id),
        type: attrs.feature_type === 'Tvshow' ? 'tvshow' : 'movie',
        title: attrs.title,
        original_title: attrs.original_title || attrs.title,
        year: attrs.year,
        imdb_id: attrs.imdb_id ? `tt${String(attrs.imdb_id).padStart(7, '0')}` : null,
        tmdb_id: attrs.tmdb_id,
        poster_url: attrs.img_url || null,
        subtitle_count: attrs.subtitle_count,
      };
    });

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
