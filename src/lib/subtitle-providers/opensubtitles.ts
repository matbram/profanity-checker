import { searchSubtitles, downloadSubtitle } from '@/lib/opensubtitles';
import { SubtitleProvider, SubtitleSearchParams, SubtitleCandidate } from './types';
import { createLogger } from '@/lib/logger';

const log = createLogger('provider:opensubtitles');

export class OpenSubtitlesProvider implements SubtitleProvider {
  name = 'opensubtitles';

  supports(): boolean {
    return true;
  }

  async search(params: SubtitleSearchParams): Promise<SubtitleCandidate[]> {
    if (!process.env.OPENSUBTITLES_API_KEY) {
      log.warn('OPENSUBTITLES_API_KEY not configured, skipping');
      return [];
    }

    try {
      const results = await searchSubtitles(
        params.tmdbId,
        params.type,
        params.language,
        params.season,
        params.episode
      );

      return results
        .filter(r => r.files.length > 0)
        .map(r => ({
          id: `os-${r.files[0].file_id}`,
          provider: this.name,
          language: r.language,
          release: r.release || r.files[0].file_name,
          download_count: r.download_count,
          hearing_impaired: r.hearing_impaired,
          download: () => downloadSubtitle(r.files[0].file_id),
        }));
    } catch (err) {
      log.error(`Search failed: ${(err as Error).message}`);
      return [];
    }
  }
}
