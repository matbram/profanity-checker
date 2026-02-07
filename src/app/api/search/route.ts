import { NextRequest, NextResponse } from 'next/server';
import { searchFeatures } from '@/lib/opensubtitles';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const features = await searchFeatures(query);

    const results = (features as Array<Record<string, unknown>>).map((item) => {
      const attrs = item.attributes as Record<string, unknown>;
      return {
        id: item.id,
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

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search. Please try again.' },
      { status: 500 }
    );
  }
}
