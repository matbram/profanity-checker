'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import ProfanityResults from '@/components/ProfanityResults';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import { AnalysisResult } from '@/types';

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
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeTitle, setAnalyzeTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (result: SearchResult) => {
    setIsAnalyzing(true);
    setAnalyzeTitle(result.title);
    setError(null);
    setAnalysisResult(null);

    try {
      const feature = {
        id: result.id,
        type: result.type,
        title: result.title,
        original_title: result.original_title,
        year: result.year,
        imdb_id: result.imdb_id || '',
        tmdb_id: result.tmdb_id,
        poster_url: result.poster_url,
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed.');
        return;
      }

      setAnalysisResult(data.result);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setAnalysisResult(null);
    setError(null);
  };

  if (analysisResult) {
    return <ProfanityResults result={analysisResult} onBack={handleBack} />;
  }

  if (isAnalyzing) {
    return <LoadingAnalysis title={analyzeTitle} />;
  }

  return (
    <div className="flex flex-col items-center pt-24 sm:pt-32 min-h-[80vh]">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-[#fafafa] tracking-tight">
          Profanity<span className="text-[#06b6d4]">Screen</span>
        </h1>
        <p className="text-[#71717a] text-base max-w-md mx-auto leading-relaxed">
          Know what language is in any movie or show before you watch.
        </p>
      </div>

      <SearchBar onSelect={handleSelect} />

      {error && (
        <div className="mt-6 max-w-xl w-full bg-[#ef4444]/8 border border-[#ef4444]/20 rounded-xl p-4 text-center">
          <p className="text-[#fca5a5] text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-[#71717a] hover:text-[#a1a1aa] bg-transparent border-0 cursor-pointer underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full max-w-2xl">
        {[
          { title: 'Search Any Title', desc: 'Thousands of movies and TV shows with instant autocomplete.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          { title: 'AI Subtitle Analysis', desc: 'Gemini reads real subtitles to find every profanity.', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { title: 'Detailed Reports', desc: 'Categorized breakdowns, word counts, and severity scores.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        ].map((card) => (
          <div key={card.title} className="bg-[#131316] border border-[#27272a] rounded-xl p-5">
            <div className="w-9 h-9 mb-3 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
            <h3 className="font-medium text-sm text-[#fafafa] mb-1">{card.title}</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
