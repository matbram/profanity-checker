import AdmZip from 'adm-zip';
import { SubtitleProvider, SubtitleSearchParams, SubtitleCandidate } from './types';
import { subtitleCache } from '@/lib/cache';
import { createLogger } from '@/lib/logger';

const log = createLogger('provider:subdl');

const API_BASE = 'https://api.subdl.com/api/v1';
const DL_BASE = 'https://dl.subdl.com';

interface SubDLSubtitle {
  release_name: string;
  name: string;
  lang: string;
  author: string;
  url: string;
  season: number;
  episode: number;
  language: string;
  hi: boolean;
}

export class SubDLProvider implements SubtitleProvider {
  name = 'subdl';

  supports(): boolean {
    return true;
  }

  async search(params: SubtitleSearchParams): Promise<SubtitleCandidate[]> {
    const apiKey = process.env.SUBDL_API_KEY;
    if (!apiKey) {
      log.warn('SUBDL_API_KEY not configured, skipping');
      return [];
    }

    const searchParams = new URLSearchParams({
      api_key: apiKey,
      tmdb_id: params.tmdbId.toString(),
      languages: params.language.toUpperCase(),
      subs_per_page: '30',
      type: params.type === 'tvshow' ? 'tv' : 'movie',
    });

    if (params.type === 'tvshow' && params.season !== undefined) {
      searchParams.set('season_number', params.season.toString());
      if (params.episode !== undefined) {
        searchParams.set('episode_number', params.episode.toString());
      }
    }

    const url = `${API_BASE}/subtitles?${searchParams}`;
    log.info(`Searching: ${url.replace(apiKey, '***')}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        log.error(`Search failed: ${res.status}`);
        return [];
      }

      const json = await res.json();
      if (!json.status || !json.subtitles) {
        log.warn('No subtitles in response');
        return [];
      }

      const subtitles: SubDLSubtitle[] = json.subtitles;
      log.info(`Found ${subtitles.length} subtitles`);

      return subtitles.map((sub, i) => ({
        id: `subdl-${i}-${sub.url}`,
        provider: this.name,
        language: sub.language?.toLowerCase() || params.language,
        release: sub.release_name || sub.name,
        download_count: 0, // SubDL doesn't expose download counts
        hearing_impaired: sub.hi || false,
        download: () => this.downloadAndExtract(sub.url),
      }));
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === 'AbortError') {
        log.error('Search timed out');
      } else {
        log.error(`Search failed: ${(err as Error).message}`);
      }
      return [];
    }
  }

  private async downloadAndExtract(subtitleUrl: string): Promise<string> {
    const cacheKey = `subdl_content:${subtitleUrl}`;
    const cached = subtitleCache.get<string>(cacheKey);
    if (cached) return cached;

    const url = `${DL_BASE}${subtitleUrl}`;
    log.info(`Downloading ZIP: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      // Find the first SRT file in the archive
      const srtEntry = entries.find(
        e => e.entryName.toLowerCase().endsWith('.srt') && !e.isDirectory
      );

      if (!srtEntry) {
        throw new Error('No SRT file found in ZIP archive');
      }

      const content = srtEntry.getData().toString('utf8');
      log.info(`Extracted SRT: ${content.length} chars from ${srtEntry.entryName}`);

      subtitleCache.set(cacheKey, content, 86400000);
      return content;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
