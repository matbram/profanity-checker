import { SubtitleResult } from '@/types';
import { searchCache, subtitleCache } from './cache';
import { createLogger } from './logger';

const log = createLogger('opensubtitles');
const BASE_URL = 'https://api.opensubtitles.com/api/v1';

function getHeaders(): Record<string, string> {
  const apiKey = process.env.OPENSUBTITLES_API_KEY;
  log.debug(`API key check: ${apiKey ? `present (${apiKey.substring(0, 6)}...)` : 'MISSING'}`);
  if (!apiKey) {
    throw new Error('OPENSUBTITLES_API_KEY environment variable is not set');
  }
  return {
    'Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'ProfanityChecker v1.0',
  };
}

export async function searchFeatures(query: string): Promise<unknown[]> {
  const cacheKey = `features:${query.toLowerCase()}`;
  const cached = searchCache.get<unknown[]>(cacheKey);
  if (cached) {
    log.info(`searchFeatures cache HIT for "${query}" (${(cached as unknown[]).length} results)`);
    return cached;
  }
  log.info(`searchFeatures cache MISS for "${query}"`);

  const headers = getHeaders();
  const url = `${BASE_URL}/features?query=${encodeURIComponent(query)}`;
  log.info(`Fetching: GET ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const start = Date.now();
    const res = await fetch(url, { headers, signal: controller.signal });
    const elapsed = Date.now() - start;

    log.info(`Response: ${res.status} ${res.statusText} (${elapsed}ms)`, {
      headers: {
        'content-type': res.headers.get('content-type'),
        'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining'),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      log.error(`Non-OK response body: ${body.substring(0, 500)}`);
      throw new Error(`OpenSubtitles features search failed: ${res.status} - ${body}`);
    }

    const json = await res.json();
    const results = json.data || [];
    log.info(`Parsed ${results.length} features from response`, {
      total_count: json.total_count,
      total_pages: json.total_pages,
    });

    if (results.length > 0) {
      const first = results[0];
      log.debug('First result sample', {
        id: first.id,
        type: first.attributes?.feature_type,
        title: first.attributes?.title,
        year: first.attributes?.year,
        tmdb_id: first.attributes?.tmdb_id,
        img_url: first.attributes?.img_url ? 'present' : 'missing',
        seasons_count: first.attributes?.seasons_count,
      });
    }

    searchCache.set(cacheKey, results, 1800000);
    return results;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      log.error('Request TIMED OUT after 10s');
      throw new Error('OpenSubtitles request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchSubtitles(
  tmdbId: number,
  type: 'movie' | 'tvshow',
  language: string = 'en',
  season?: number,
  episode?: number
): Promise<SubtitleResult[]> {
  const cacheKey = `subtitles:${tmdbId}:${type}:${language}:s${season ?? ''}e${episode ?? ''}`;
  const cached = searchCache.get<SubtitleResult[]>(cacheKey);
  if (cached) {
    log.info(`searchSubtitles cache HIT for tmdb:${tmdbId} s${season}e${episode}`);
    return cached;
  }
  log.info(`searchSubtitles cache MISS for tmdb:${tmdbId}, type:${type}, lang:${language}, s${season}e${episode}`);

  const headers = getHeaders();
  const params = new URLSearchParams({
    languages: language,
    order_by: 'download_count',
    order_direction: 'desc',
  });

  if (type === 'tvshow' && season !== undefined && episode !== undefined) {
    params.set('parent_tmdb_id', tmdbId.toString());
    params.set('season_number', season.toString());
    params.set('episode_number', episode.toString());
  } else {
    params.set('tmdb_id', tmdbId.toString());
    if (type === 'movie') {
      params.set('type', 'movie');
    }
  }

  const url = `${BASE_URL}/subtitles?${params}`;
  log.info(`Fetching: GET ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res: Response;
  try {
    const start = Date.now();
    res = await fetch(url, { headers, signal: controller.signal });
    const elapsed = Date.now() - start;
    log.info(`Response: ${res.status} ${res.statusText} (${elapsed}ms)`);
  } catch (err) {
    clearTimeout(timeout);
    if ((err as Error).name === 'AbortError') {
      log.error('Subtitle search TIMED OUT after 10s');
      throw new Error('OpenSubtitles subtitle search timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text();
    log.error(`Subtitle search failed: ${res.status}`, { body: body.substring(0, 500) });
    throw new Error(`OpenSubtitles subtitle search failed: ${res.status} - ${body}`);
  }

  const json = await res.json();
  const results: SubtitleResult[] = (json.data || []).map((item: Record<string, unknown>) => {
    const attrs = item.attributes as Record<string, unknown>;
    const featureDetails = attrs.feature_details as Record<string, unknown> | undefined;
    return {
      id: item.id,
      subtitle_id: attrs.subtitle_id,
      language: attrs.language,
      download_count: attrs.download_count,
      ratings: attrs.ratings || 0,
      hearing_impaired: attrs.hearing_impaired,
      release: attrs.release,
      files: (attrs.files as Array<Record<string, unknown>>)?.map((f) => ({
        file_id: f.file_id,
        file_name: f.file_name,
      })) || [],
      episode_number: featureDetails?.episode_number as number | undefined,
    };
  });

  log.info(`Found ${results.length} subtitle results`, {
    top_download_count: results[0]?.download_count,
    top_ratings: results[0]?.ratings,
    top_file_count: results[0]?.files?.length,
  });

  searchCache.set(cacheKey, results, 3600000);
  return results;
}

export async function downloadSubtitle(fileId: number): Promise<string> {
  const cacheKey = `subtitle_content:${fileId}`;
  const cached = subtitleCache.get<string>(cacheKey);
  if (cached) {
    log.info(`downloadSubtitle cache HIT for file:${fileId} (${cached.length} chars)`);
    return cached;
  }
  log.info(`downloadSubtitle cache MISS for file:${fileId}`);

  const headers = getHeaders();

  // Step 1: Login
  log.info('Step 1/3: Logging in to OpenSubtitles...');
  const hasCredentials = !!(process.env.OPENSUBTITLES_USERNAME && process.env.OPENSUBTITLES_PASSWORD);
  log.debug(`Login credentials: ${hasCredentials ? 'present' : 'MISSING'}`);

  const loginStart = Date.now();
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      username: process.env.OPENSUBTITLES_USERNAME || '',
      password: process.env.OPENSUBTITLES_PASSWORD || '',
    }),
  });
  log.info(`Login response: ${loginRes.status} (${Date.now() - loginStart}ms)`);

  let authHeaders: Record<string, string> = { ...headers };

  if (loginRes.ok) {
    const loginData = await loginRes.json();
    log.info('Login successful', {
      user_id: loginData.user?.user_id,
      allowed_downloads: loginData.user?.allowed_downloads,
      level: loginData.user?.level,
    });
    authHeaders = {
      ...headers,
      'Authorization': `Bearer ${loginData.token?.substring(0, 20)}...`,
    };
  } else {
    const loginError = await loginRes.text();
    log.warn(`Login failed (will try download without auth): ${loginError.substring(0, 200)}`);
  }

  // Step 2: Request download link
  log.info(`Step 2/3: Requesting download link for file_id:${fileId}`);
  const dlStart = Date.now();
  const downloadRes = await fetch(`${BASE_URL}/download`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ file_id: fileId, sub_format: 'srt' }),
  });
  log.info(`Download link response: ${downloadRes.status} (${Date.now() - dlStart}ms)`);

  if (!downloadRes.ok) {
    const errorText = await downloadRes.text();
    log.error(`Download link request failed: ${errorText.substring(0, 500)}`);
    throw new Error(`Failed to get download link: ${downloadRes.status} - ${errorText}`);
  }

  const downloadData = await downloadRes.json();
  log.info('Download link received', {
    remaining: downloadData.remaining,
    reset_time: downloadData.reset_time,
    file_name: downloadData.file_name,
  });

  // Step 3: Download actual file
  log.info(`Step 3/3: Downloading subtitle file from CDN...`);
  const fileStart = Date.now();
  const fileRes = await fetch(downloadData.link);
  log.info(`File download response: ${fileRes.status} (${Date.now() - fileStart}ms)`);

  if (!fileRes.ok) {
    log.error(`File download failed: ${fileRes.status}`);
    throw new Error(`Failed to download subtitle file: ${fileRes.status}`);
  }

  const content = await fileRes.text();
  log.info(`Subtitle downloaded: ${content.length} chars, first 100: ${content.substring(0, 100).replace(/\n/g, '\\n')}`);

  subtitleCache.set(cacheKey, content, 86400000);
  return content;
}

export function parseSRT(srtContent: string): string {
  log.info(`Parsing SRT content (${srtContent.length} chars)`);
  const lines = srtContent.split('\n');
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) continue;

    const cleaned = trimmed
      .replace(/<[^>]*>/g, '')
      .replace(/\{[^}]*\}/g, '')
      .trim();

    if (cleaned) {
      textLines.push(cleaned);
    }
  }

  const result = textLines.join(' ');
  log.info(`SRT parsed: ${lines.length} lines -> ${textLines.length} text lines -> ${result.length} chars`);
  return result;
}
