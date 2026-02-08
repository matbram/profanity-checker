'use client';

import { useState, useEffect } from 'react';

interface SearchResult {
  id: string;
  type: 'movie' | 'tvshow';
  title: string;
  original_title: string;
  year: number;
  imdb_id: string | null;
  tmdb_id: number;
  poster_url: string | null;
  subtitle_count: number;
  season_count?: number;
}

interface Episode {
  number: number;
  title: string;
  subtitle_count: number;
}

interface EpisodePickerProps {
  show: SearchResult;
  onSelect: (season: number, episode: number) => void;
  onBack: () => void;
}

export default function EpisodePicker({ show, onSelect, onBack }: EpisodePickerProps) {
  const seasonCount = show.season_count || 1;
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/episodes?tmdb_id=${show.tmdb_id}&season=${selectedSeason}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setEpisodes([]);
        } else {
          setEpisodes(data.episodes || []);
        }
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setEpisodes([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [show.tmdb_id, selectedSeason]);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#64748b] hover:text-[#0f172a] bg-transparent border-0 cursor-pointer text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Show header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 mb-6">
        <div className="flex gap-4">
          {show.poster_url ? (
            <img
              src={show.poster_url}
              alt={show.title}
              className="w-16 h-24 rounded-lg object-cover flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-16 h-24 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] text-[10px] flex-shrink-0">
              N/A
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0f172a] truncate">{show.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0891b2]/8 text-[#0891b2] font-medium uppercase tracking-wide">
                TV Show
              </span>
              {show.year > 0 && <span className="text-sm text-[#64748b]">{show.year}</span>}
            </div>
            <p className="text-sm text-[#64748b] mt-2">
              Select a season and episode to analyze for profanity.
            </p>
          </div>
        </div>
      </div>

      {/* Season selector */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-[#0f172a] mb-3">Season</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.max(seasonCount, 1) }, (_, i) => i + 1).map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all ${
                selectedSeason === s
                  ? 'bg-[#0891b2] text-white border-[#0891b2] shadow-sm'
                  : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#0891b2] hover:text-[#0891b2]'
              }`}
            >
              Season {s}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes */}
      <div>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-3">
          Episodes {isLoading ? '' : `(${episodes.length})`}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-[#fecaca] p-5 text-center">
            <p className="text-[#dc2626] text-sm font-medium">Failed to load episodes</p>
            <p className="text-[#64748b] text-xs mt-1">{error}</p>
          </div>
        ) : episodes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 text-center">
            <p className="text-[#64748b] text-sm">No episodes with subtitles found for Season {selectedSeason}.</p>
            <p className="text-[#94a3b8] text-xs mt-2">Try a different season or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {episodes.map(ep => (
              <button
                key={ep.number}
                onClick={() => onSelect(selectedSeason, ep.number)}
                className="bg-white rounded-xl border border-[#e2e8f0] p-4 text-left cursor-pointer hover:border-[#0891b2] hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#0891b2] bg-[#0891b2]/8 px-1.5 py-0.5 rounded">
                    E{ep.number}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">
                    {ep.subtitle_count} sub{ep.subtitle_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-[#0f172a] font-medium truncate group-hover:text-[#0891b2] transition-colors">
                  {ep.title}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[#94a3b8] group-hover:text-[#0891b2] transition-colors">
                  <span className="text-[10px]">Analyze</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
