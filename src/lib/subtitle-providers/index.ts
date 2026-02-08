import { SubtitleProvider, SubtitleSearchParams, SubtitleCandidate } from './types';
import { OpenSubtitlesProvider } from './opensubtitles';
import { SubDLProvider } from './subdl';
import { GestdownProvider } from './gestdown';
import { createLogger } from '@/lib/logger';

const log = createLogger('subtitle-manager');

export type { SubtitleSearchParams, SubtitleCandidate } from './types';

const providers: SubtitleProvider[] = [
  new OpenSubtitlesProvider(),
  new SubDLProvider(),
  new GestdownProvider(),
];

/**
 * Query all configured subtitle providers concurrently and return
 * a merged list of candidates, interleaved across providers for diversity.
 */
export async function searchAllProviders(
  params: SubtitleSearchParams
): Promise<SubtitleCandidate[]> {
  const applicable = providers.filter(p => p.supports(params.type));

  log.info(`Searching ${applicable.length} providers for "${params.title}" (${params.type})`, {
    providers: applicable.map(p => p.name),
    tmdbId: params.tmdbId,
    season: params.season,
    episode: params.episode,
  });

  const results = await Promise.allSettled(
    applicable.map(p => p.search(params))
  );

  const candidates: SubtitleCandidate[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const providerName = applicable[i].name;
    if (result.status === 'fulfilled') {
      log.info(`${providerName}: ${result.value.length} candidates`);
      candidates.push(...result.value);
    } else {
      log.error(`${providerName}: failed - ${result.reason}`);
    }
  }

  const sorted = interleaveByProvider(candidates);
  log.info(`Total: ${sorted.length} candidates from ${applicable.length} providers`);
  return sorted;
}

/**
 * Interleave candidates across providers so we try different sources
 * before exhausting one provider's download limits. Within each provider,
 * results are sorted by download count.
 */
function interleaveByProvider(candidates: SubtitleCandidate[]): SubtitleCandidate[] {
  const byProvider = new Map<string, SubtitleCandidate[]>();
  for (const c of candidates) {
    const list = byProvider.get(c.provider) || [];
    list.push(c);
    byProvider.set(c.provider, list);
  }

  // Sort each provider's candidates by download count descending
  for (const list of byProvider.values()) {
    list.sort((a, b) => b.download_count - a.download_count);
  }

  // Round-robin: take one from each provider in turn
  const result: SubtitleCandidate[] = [];
  const providerLists = Array.from(byProvider.values());
  let index = 0;
  let added = true;

  while (added) {
    added = false;
    for (const list of providerLists) {
      if (index < list.length) {
        result.push(list[index]);
        added = true;
      }
    }
    index++;
  }

  return result;
}
