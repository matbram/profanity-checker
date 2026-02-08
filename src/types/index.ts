export interface Feature {
  id: string;
  type: 'movie' | 'tvshow';
  title: string;
  original_title: string;
  year: number;
  imdb_id: string;
  tmdb_id: number;
  poster_url: string | null;
  overview?: string;
  vote_average?: number;
  genres?: string[];
  runtime?: number;
  release_date?: string;
  backdrop_url?: string | null;
  tagline?: string;
  season_count?: number;
  season?: number;
  episode?: number;
  episode_title?: string;
}

export interface SubtitleFile {
  file_id: number;
  file_name: string;
}

export interface SubtitleResult {
  id: string;
  subtitle_id: string;
  language: string;
  download_count: number;
  ratings: number;
  hearing_impaired: boolean;
  release: string;
  files: SubtitleFile[];
  episode_number?: number;
}

export interface ProfanityWord {
  word: string;
  count: number;
  category: string;
  severity: 'mild' | 'moderate' | 'strong';
}

export interface ProfanityCategory {
  name: string;
  words: ProfanityWord[];
  totalCount: number;
  severity: 'mild' | 'moderate' | 'strong';
  icon: string;
}

export interface AnalysisResult {
  feature: Feature;
  categories: ProfanityCategory[];
  totalProfanities: number;
  rating: 'Clean' | 'Mild' | 'Moderate' | 'Heavy' | 'Extreme';
  ratingScore: number;
  summary: string;
  analyzedAt: string;
  subtitlesUsed?: number;
}
