import { SubtitleResult } from '@/types';
import { searchCache, subtitleCache } from './cache';

const BASE_URL = 'https://api.opensubtitles.com/api/v1';

function getHeaders(): Record<string, string> {
  const apiKey = process.env.OPENSUBTITLES_API_KEY;
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
  if (cached) return cached;

  const headers = getHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `${BASE_URL}/features?query=${encodeURIComponent(query)}`,
      { headers, signal: controller.signal }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenSubtitles features search failed: ${res.status} - ${body}`);
    }

    const json = await res.json();
    const results = json.data || [];
    searchCache.set(cacheKey, results, 1800000); // 30 min cache
    return results;
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchSubtitles(
  tmdbId: number,
  type: 'movie' | 'tvshow',
  language: string = 'en'
): Promise<SubtitleResult[]> {
  const cacheKey = `subtitles:${tmdbId}:${type}:${language}`;
  const cached = searchCache.get<SubtitleResult[]>(cacheKey);
  if (cached) return cached;

  const headers = getHeaders();

  const params = new URLSearchParams({
    tmdb_id: tmdbId.toString(),
    languages: language,
    order_by: 'download_count',
    type: type === 'tvshow' ? 'episode' : 'movie',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/subtitles?${params}`, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`OpenSubtitles subtitle search failed: ${res.status}`);
  }

  const json = await res.json();
  const results: SubtitleResult[] = (json.data || []).map((item: Record<string, unknown>) => {
    const attrs = item.attributes as Record<string, unknown>;
    return {
      id: item.id,
      subtitle_id: attrs.subtitle_id,
      language: attrs.language,
      download_count: attrs.download_count,
      hearing_impaired: attrs.hearing_impaired,
      release: attrs.release,
      files: (attrs.files as Array<Record<string, unknown>>)?.map((f) => ({
        file_id: f.file_id,
        file_name: f.file_name,
      })) || [],
    };
  });

  searchCache.set(cacheKey, results, 3600000); // 1hr cache
  return results;
}

export async function downloadSubtitle(fileId: number): Promise<string> {
  const cacheKey = `subtitle_content:${fileId}`;
  const cached = subtitleCache.get<string>(cacheKey);
  if (cached) return cached;

  const headers = getHeaders();

  // Step 1: Login to get bearer token
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      username: process.env.OPENSUBTITLES_USERNAME || '',
      password: process.env.OPENSUBTITLES_PASSWORD || '',
    }),
  });

  let authHeaders: Record<string, string> = { ...headers };

  if (loginRes.ok) {
    const loginData = await loginRes.json();
    authHeaders = {
      ...headers,
      'Authorization': `Bearer ${loginData.token}`,
    };
  }

  // Step 2: Request download link
  const downloadRes = await fetch(`${BASE_URL}/download`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ file_id: fileId, sub_format: 'srt' }),
  });

  if (!downloadRes.ok) {
    const errorText = await downloadRes.text();
    throw new Error(`Failed to get download link: ${downloadRes.status} - ${errorText}`);
  }

  const downloadData = await downloadRes.json();
  const link = downloadData.link;

  // Step 3: Download the actual file
  const fileRes = await fetch(link);
  if (!fileRes.ok) {
    throw new Error(`Failed to download subtitle file: ${fileRes.status}`);
  }

  const content = await fileRes.text();
  subtitleCache.set(cacheKey, content, 86400000); // 24hr cache
  return content;
}

export function parseSRT(srtContent: string): string {
  // Remove SRT formatting: sequence numbers, timestamps, HTML tags
  const lines = srtContent.split('\n');
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines, sequence numbers, and timestamps
    if (!trimmed) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) continue;

    // Remove HTML tags and formatting
    const cleaned = trimmed
      .replace(/<[^>]*>/g, '')
      .replace(/\{[^}]*\}/g, '')
      .trim();

    if (cleaned) {
      textLines.push(cleaned);
    }
  }

  return textLines.join(' ');
}
