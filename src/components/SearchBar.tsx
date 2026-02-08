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
          <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="w-full pl-11 pr-11 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/20 text-[15px] shadow-sm"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-4 h-4 border-2 border-[#0891b2] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute w-full mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-lg overflow-hidden z-50 max-h-[380px] overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer border-0 transition-colors ${
                index === selectedIndex ? 'bg-[#f1f5f9]' : 'hover:bg-[#f8fafc]'
              } ${index > 0 ? 'border-t border-[#f1f5f9]' : ''}`}
              style={{ background: index === selectedIndex ? '#f1f5f9' : undefined }}
            >
              <div className="w-10 h-14 rounded-md overflow-hidden bg-[#f1f5f9] flex-shrink-0">
                {result.poster_url ? (
                  <img src={result.poster_url} alt={result.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-[10px]">N/A</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#0f172a] text-sm font-medium truncate">{result.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0891b2]/8 text-[#0891b2] font-medium uppercase tracking-wide">
                    {result.type === 'tvshow' ? 'TV' : 'Film'}
                  </span>
                  {result.year > 0 && <span className="text-xs text-[#64748b]">{result.year}</span>}
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-[#cbd5e1] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute w-full mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-lg p-5 text-center z-50">
          {errorMsg ? (
            <div>
              <p className="text-[#dc2626] text-sm font-medium">Error</p>
              <p className="text-[#64748b] text-xs mt-1">{errorMsg}</p>
            </div>
          ) : (
            <p className="text-[#64748b] text-sm">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
