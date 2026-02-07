import { NextRequest, NextResponse } from 'next/server';
import { searchFeatures } from '@/lib/opensubtitles';
import { searchDemoMovies } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Try OpenSubtitles API first
  try {
    console.log(`[search] Querying OpenSubtitles for: "${query}"`);
    const features = await searchFeatures(query);
    console.log(`[search] OpenSubtitles returned ${features.length} results`);

    if (features && features.length > 0) {
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
          source: 'opensubtitles',
        };
      });

      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('[search] OpenSubtitles API error:', (error as Error).message);
    console.error('[search] Falling back to demo data');
  }

  // Fallback: search demo data
  const demoResults = searchDemoMovies(query).map((movie) => ({
    id: movie.id,
    type: movie.type,
    title: movie.title,
    original_title: movie.original_title,
    year: movie.year,
    imdb_id: movie.imdb_id,
    tmdb_id: movie.tmdb_id,
    poster_url: movie.poster_url,
    subtitle_count: null,
    source: 'demo',
  }));

  return NextResponse.json({ results: demoResults });
}
