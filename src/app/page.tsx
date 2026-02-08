'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import EpisodePicker from '@/components/EpisodePicker';
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
  season_count?: number;
}

type ViewState = 'search' | 'episode-select' | 'analyzing' | 'results';

export default function Home() {
  const [view, setView] = useState<ViewState>('search');
  const [selectedShow, setSelectedShow] = useState<SearchResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzeTitle, setAnalyzeTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const analyzeFeature = async (result: SearchResult, season?: number, episode?: number) => {
    setView('analyzing');
    setCurrentStep(0);
    const titleLabel = season !== undefined
      ? `${result.title} S${season}E${episode}`
      : result.title;
    setAnalyzeTitle(titleLabel);
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
        body: JSON.stringify({ feature, season, episode }),
      });

      const contentType = res.headers.get('content-type') || '';

      // Cache hit returns JSON directly
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Analysis failed.');
          setView('search');
          return;
        }
        setAnalysisResult(data.result);
        setView('results');
        return;
      }

      // Streaming response (SSE)
      if (!res.body) {
        setError('Streaming not supported by browser.');
        setView('search');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop()!;

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.step === 'complete') {
              setAnalysisResult(data.result);
              setView('results');
              return;
            } else if (data.step === 'error') {
              setError(data.error || 'Analysis failed.');
              setView('search');
              return;
            } else if (typeof data.step === 'number') {
              setCurrentStep(data.step);
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.step === 'complete') {
              setAnalysisResult(data.result);
              setView('results');
              return;
            } else if (data.step === 'error') {
              setError(data.error || 'Analysis failed.');
              setView('search');
              return;
            }
          } catch {
            // Skip
          }
        }
      }

      // If we got here without a result, something went wrong
      if (!analysisResult) {
        setError('Analysis ended without a result. Please try again.');
        setView('search');
      }
    } catch {
      setError('Network error. Please try again.');
      setView('search');
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'tvshow') {
      setSelectedShow(result);
      setView('episode-select');
    } else {
      analyzeFeature(result);
    }
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    if (selectedShow) {
      analyzeFeature(selectedShow, season, episode);
    }
  };

  const handleBack = () => {
    setView('search');
    setAnalysisResult(null);
    setSelectedShow(null);
    setError(null);
  };

  if (view === 'results' && analysisResult) {
    return <ProfanityResults result={analysisResult} onBack={handleBack} />;
  }

  if (view === 'analyzing') {
    return <LoadingAnalysis title={analyzeTitle} currentStep={currentStep} />;
  }

  if (view === 'episode-select' && selectedShow) {
    return (
      <EpisodePicker
        show={selectedShow}
        onSelect={handleEpisodeSelect}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="flex flex-col items-center pt-24 sm:pt-32 min-h-[80vh]">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Profanity<span style={{ color: 'var(--accent)' }}>Screen</span>
        </h1>
        <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Know what language is in any movie or show before you watch.
        </p>
      </div>

      <SearchBar onSelect={handleSelect} />

      {error && (
        <div className="mt-6 max-w-xl w-full rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--border-error)' }}>
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs bg-transparent border-0 cursor-pointer underline"
            style={{ color: 'var(--text-muted)' }}
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
          <div key={card.title} className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-muted)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
            <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
