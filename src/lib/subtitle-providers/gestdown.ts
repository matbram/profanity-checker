import { SubtitleProvider, SubtitleSearchParams, SubtitleCandidate } from './types';
import { searchCache, subtitleCache } from '@/lib/cache';
import { createLogger } from '@/lib/logger';

const log = createLogger('provider:gestdown');

const API_BASE = 'https://api.gestdown.info';

interface GestdownShow {
  uniqueId: string;
  name: string;
}

interface GestdownSubtitle {
  subtitleId: string;
  version: string;
  completed: boolean;
  hearingImpaired: boolean;
  downloadCount: number;
}

export class GestdownProvider implements SubtitleProvider {
  name = 'gestdown';

  supports(type: 'movie' | 'tvshow'): boolean {
    return type === 'tvshow';
  }

  async search(params: SubtitleSearchParams): Promise<SubtitleCandidate[]> {
    if (params.type !== 'tvshow' || params.season === undefined || params.episode === undefined) {
      return [];
    }

    try {
      // Step 1: Find the show by name
      const showId = await this.findShow(params.title);
      if (!showId) {
        log.warn(`Show not found on Addic7ed: "${params.title}"`);
        return [];
      }

      // Step 2: Get subtitles for the episode
      const langMap: Record<string, string> = {
        en: 'english', fr: 'french', es: 'spanish', de: 'german',
        it: 'italian', pt: 'portuguese', nl: 'dutch', pl: 'polish',
        sv: 'swedish', no: 'norwegian', da: 'danish', fi: 'finnish',
      };
      const language = langMap[params.language] || params.language;

      const url = `${API_BASE}/subtitles/get/${showId}/${params.season}/${params.episode}/${language}`;
      log.info(`Fetching subtitles: ${url}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        log.warn(`Subtitle fetch failed: ${res.status}`);
        return [];
      }

      const json = await res.json();
      const subtitles: GestdownSubtitle[] = json.matchingSubtitles || json.subtitles || [];
      log.info(`Found ${subtitles.length} subtitles`);

      return subtitles
        .filter(sub => sub.completed)
        .map(sub => ({
          id: `gestdown-${sub.subtitleId}`,
          provider: this.name,
          language: params.language,
          release: sub.version || 'unknown',
          download_count: sub.downloadCount || 0,
          hearing_impaired: sub.hearingImpaired || false,
          download: () => this.downloadSubtitle(sub.subtitleId),
        }));
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        log.error('Request timed out');
      } else {
        log.error(`Search failed: ${(err as Error).message}`);
      }
      return [];
    }
  }

  private async findShow(title: string): Promise<string | null> {
    const cacheKey = `gestdown_show:${title.toLowerCase()}`;
    const cached = searchCache.get<string>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE}/shows/search/${encodeURIComponent(title)}`;
    log.info(`Searching show: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;

      const json = await res.json();
      const shows: GestdownShow[] = json.shows || [];
      if (shows.length === 0) return null;

      const show = shows[0];
      log.info(`Found show: "${show.name}" (${show.uniqueId})`);

      searchCache.set(cacheKey, show.uniqueId, 86400000);
      return show.uniqueId;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  private async downloadSubtitle(subtitleId: string): Promise<string> {
    const cacheKey = `gestdown_content:${subtitleId}`;
    const cached = subtitleCache.get<string>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE}/subtitles/download/${subtitleId}`;
    log.info(`Downloading: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }

      const content = await res.text();
      log.info(`Downloaded subtitle: ${content.length} chars`);

      subtitleCache.set(cacheKey, content, 86400000);
      return content;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
