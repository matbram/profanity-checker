export interface SubtitleSearchParams {
  tmdbId: number;
  imdbId?: string;
  type: 'movie' | 'tvshow';
  title: string;
  year?: number;
  language: string;
  season?: number;
  episode?: number;
}

export interface SubtitleCandidate {
  id: string;
  provider: string;
  language: string;
  release: string;
  download_count: number;
  hearing_impaired: boolean;
  /** Downloads and returns raw SRT content */
  download: () => Promise<string>;
}

export interface SubtitleProvider {
  name: string;
  supports(type: 'movie' | 'tvshow'): boolean;
  search(params: SubtitleSearchParams): Promise<SubtitleCandidate[]>;
}
