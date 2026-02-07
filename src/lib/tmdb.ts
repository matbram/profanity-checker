import { Feature } from '@/types';
import { metadataCache } from './cache';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB provides a free API - we use the v3 API with api_key parameter
// For basic metadata we can use the OpenSubtitles features endpoint data
// and supplement with TMDB for posters and additional details

async function tmdbFetch(path: string, params: Record<string, string> = {}): Promise<Response> {
  const searchParams = new URLSearchParams({
    ...params,
    api_key: process.env.TMDB_API_KEY || '',
  });

  return fetch(`${TMDB_BASE}${path}?${searchParams}`);
}

export async function getMovieDetails(tmdbId: number): Promise<Partial<Feature> | null> {
  const cacheKey = `tmdb:movie:${tmdbId}`;
  const cached = metadataCache.get<Partial<Feature>>(cacheKey);
  if (cached) return cached;

  try {
    const res = await tmdbFetch(`/movie/${tmdbId}`);
    if (!res.ok) return null;

    const data = await res.json();
    const details: Partial<Feature> = {
      overview: data.overview,
      vote_average: data.vote_average,
      genres: data.genres?.map((g: { name: string }) => g.name),
      runtime: data.runtime,
      release_date: data.release_date,
      poster_url: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
      backdrop_url: data.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${data.backdrop_path}` : null,
      tagline: data.tagline,
    };

    metadataCache.set(cacheKey, details, 86400000); // 24hr
    return details;
  } catch {
    return null;
  }
}

export async function getTVDetails(tmdbId: number): Promise<Partial<Feature> | null> {
  const cacheKey = `tmdb:tv:${tmdbId}`;
  const cached = metadataCache.get<Partial<Feature>>(cacheKey);
  if (cached) return cached;

  try {
    const res = await tmdbFetch(`/tv/${tmdbId}`);
    if (!res.ok) return null;

    const data = await res.json();
    const details: Partial<Feature> = {
      overview: data.overview,
      vote_average: data.vote_average,
      genres: data.genres?.map((g: { name: string }) => g.name),
      release_date: data.first_air_date,
      poster_url: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
      backdrop_url: data.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${data.backdrop_path}` : null,
      tagline: data.tagline,
    };

    metadataCache.set(cacheKey, details, 86400000);
    return details;
  } catch {
    return null;
  }
}

export function getPosterUrl(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
