'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
}

function proxyImg(url: string | null): string | null {
  if (!url) return null;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      setErrorMsg(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        console.error('[SearchBar] API error:', data.error);
        setErrorMsg(data.error || `Search failed (${res.status})`);
        setResults([]);
        setIsOpen(true);
        return;
      }

      if (data.error) {
        setErrorMsg(data.error);
      }

      setResults(data.results || []);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('[SearchBar] Fetch failed:', err);
      setErrorMsg(`Network error: ${(err as Error).message}`);
      setResults([]);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.title);
    setIsOpen(false);
    onSelect(result);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search any movie or TV show..."
          className="w-full pl-11 pr-11 py-3 rounded-xl text-[15px] shadow-sm focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute w-full mt-1.5 rounded-xl shadow-lg overflow-hidden z-50 max-h-[380px] overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer border-0 transition-colors"
              style={{
                backgroundColor: index === selectedIndex ? 'var(--bg-surface)' : undefined,
                borderTop: index > 0 ? '1px solid var(--border-light)' : undefined,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index === selectedIndex ? 'var(--bg-surface)' : ''; }}
            >
              <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)' }}>
                {result.poster_url ? (
                  <img src={proxyImg(result.poster_url)!} alt={result.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--text-faint)' }}>N/A</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{result.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                    {result.type === 'tvshow' ? 'TV' : 'Film'}
                  </span>
                  {result.year > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.year}</span>}
                </div>
              </div>
              <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute w-full mt-1.5 rounded-xl shadow-lg p-5 text-center z-50" style={{ backgroundColor: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
          {errorMsg ? (
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Error</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{errorMsg}</p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
