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
        setError(data.error || 'Analysis failed. Please try again.');
        return;
      }

      setAnalysisResult(data.result);
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setAnalysisResult(null);
    setError(null);
  };

  // Show results
  if (analysisResult) {
    return <ProfanityResults result={analysisResult} onBack={handleBack} />;
  }

  // Show loading
  if (isAnalyzing) {
    return <LoadingAnalysis title={analyzeTitle} />;
  }

  // Show search
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#c4b5fd] bg-clip-text text-transparent">
          ProfanityScreen
        </h1>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          Find out exactly what profanity is in any movie or TV show.
          AI-powered subtitle analysis gives you a detailed breakdown before you watch.
        </p>
      </div>

      {/* Search */}
      <SearchBar onSelect={handleSelect} />

      {/* Error */}
      {error && (
        <div className="mt-6 max-w-2xl w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-[#6b7280] hover:text-[#a78bfa] bg-transparent border-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full max-w-3xl">
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-2xl">
            &#128269;
          </div>
          <h3 className="font-semibold text-[#e8e8f0] mb-2">Search Any Title</h3>
          <p className="text-sm text-[#6b7280]">
            Search thousands of movies and TV shows with instant autocomplete results.
          </p>
        </div>
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-2xl">
            &#129302;
          </div>
          <h3 className="font-semibold text-[#e8e8f0] mb-2">AI Analysis</h3>
          <p className="text-sm text-[#6b7280]">
            Gemini AI reads actual subtitles to catch every profanity, including misspellings.
          </p>
        </div>
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-2xl">
            &#128202;
          </div>
          <h3 className="font-semibold text-[#e8e8f0] mb-2">Detailed Reports</h3>
          <p className="text-sm text-[#6b7280]">
            Get categorized breakdowns with word counts, severity ratings, and at-a-glance scores.
          </p>
        </div>
      </div>
    </div>
  );
}
