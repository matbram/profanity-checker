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

function proxyImg(url: string | null): string | null {
  if (!url) return null;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
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
        className="flex items-center gap-1.5 bg-transparent border-0 cursor-pointer text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Show header */}
      <div className="rounded-xl shadow-sm p-5 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex gap-4">
          {show.poster_url ? (
            <img
              src={proxyImg(show.poster_url)!}
              alt={show.title}
              className="w-16 h-24 rounded-lg object-cover flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-16 h-24 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-faint)' }}>
              N/A
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{show.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                TV Show
              </span>
              {show.year > 0 && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{show.year}</span>}
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Select a season and episode to analyze for profanity.
            </p>
          </div>
        </div>
      </div>

      {/* Season selector */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Season</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.max(seasonCount, 1) }, (_, i) => i + 1).map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
              style={{
                backgroundColor: selectedSeason === s ? 'var(--accent)' : 'var(--bg-card)',
                color: selectedSeason === s ? '#ffffff' : 'var(--text-secondary)',
                border: selectedSeason === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                boxShadow: selectedSeason === s ? '0 1px 2px rgba(0,0,0,0.05)' : undefined,
              }}
            >
              Season {s}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Episodes {isLoading ? '' : `(${episodes.length})`}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-error)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Failed to load episodes</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
          </div>
        ) : episodes.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No episodes with subtitles found for Season {selectedSeason}.</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>Try a different season or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {episodes.map(ep => (
              <button
                key={ep.number}
                onClick={() => onSelect(selectedSeason, ep.number)}
                className="rounded-xl p-4 text-left cursor-pointer transition-all group"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-muted)' }}>
                    E{ep.number}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {ep.subtitle_count} sub{ep.subtitle_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm font-medium truncate transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {ep.title}
                </p>
                <div className="flex items-center gap-1 mt-2 transition-colors" style={{ color: 'var(--text-faint)' }}>
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
