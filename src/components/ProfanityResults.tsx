'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import RatingBadge from './RatingBadge';

interface ProfanityResultsProps {
  result: AnalysisResult;
  onBack: () => void;
}

export default function ProfanityResults({ result, onBack }: ProfanityResultsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { feature, categories, totalProfanities, rating, ratingScore, summary } = result;

  const severityColor = (severity: string) => {
    if (severity === 'strong') return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', bar: '#ef4444' };
    if (severity === 'moderate') return { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', bar: '#f97316' };
    return { bg: '#fefce8', border: '#fef08a', text: '#ca8a04', bar: '#eab308' };
  };

  const episodeLabel = feature.season !== undefined && feature.episode !== undefined
    ? `S${feature.season}E${feature.episode}`
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#64748b] hover:text-[#0f172a] bg-transparent border-0 cursor-pointer text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Header card */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-52 flex-shrink-0 bg-[#f1f5f9]">
            {feature.poster_url ? (
              <img src={feature.poster_url} alt={feature.title} className="w-full h-full object-cover" style={{ maxHeight: '340px' }} />
            ) : (
              <div className="w-full h-56 md:h-full flex items-center justify-center text-[#94a3b8] text-sm">No poster</div>
            )}
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    {feature.title}
                    {episodeLabel && (
                      <span className="text-[#0891b2] ml-2 text-lg font-semibold">{episodeLabel}</span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0891b2]/8 text-[#0891b2] font-medium uppercase tracking-wide">
                      {feature.type === 'tvshow' ? 'TV Show' : 'Movie'}
                    </span>
                    {feature.year > 0 && <span className="text-sm text-[#64748b]">{feature.year}</span>}
                    {feature.genres && feature.genres.length > 0 && (
                      <span className="text-sm text-[#64748b]">{feature.genres.join(', ')}</span>
                    )}
                    {feature.runtime && feature.runtime > 0 && <span className="text-sm text-[#64748b]">{feature.runtime} min</span>}
                  </div>
                </div>
                <RatingBadge rating={rating} score={ratingScore} size="lg" />
              </div>
              {feature.tagline && <p className="text-[#94a3b8] italic mt-2 text-sm">&ldquo;{feature.tagline}&rdquo;</p>}
              {feature.overview && <p className="text-[#475569] mt-3 text-sm leading-relaxed line-clamp-3">{feature.overview}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0f172a]">{totalProfanities}</div>
          <div className="text-xs text-[#64748b] mt-0.5">Total Words</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0f172a]">{categories.length}</div>
          <div className="text-xs text-[#64748b] mt-0.5">Categories</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold" style={{
            color: rating === 'Clean' ? '#16a34a' : rating === 'Mild' ? '#ca8a04' : rating === 'Moderate' ? '#ea580c' : '#dc2626'
          }}>
            {rating}
          </div>
          <div className="text-xs text-[#64748b] mt-0.5">Rating</div>
        </div>
        {feature.vote_average !== undefined && feature.vote_average > 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#ca8a04]">{feature.vote_average.toFixed(1)}</div>
            <div className="text-xs text-[#64748b] mt-0.5">TMDB Score</div>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#0f172a]">{ratingScore}</div>
            <div className="text-xs text-[#64748b] mt-0.5">Severity Score</div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-[#0891b2]/8 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-[#0f172a]">AI Summary</h2>
          </div>
          <p className="text-[#475569] text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Visual severity breakdown */}
      {categories.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">At a Glance</h2>
          <div className="space-y-3">
            {categories.map((category) => {
              const pct = totalProfanities > 0 ? (category.totalCount / totalProfanities) * 100 : 0;
              const colors = severityColor(category.severity);
              return (
                <div key={category.name} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center flex-shrink-0">{category.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#0f172a] truncate">{category.name}</span>
                      <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: colors.text }}>
                        {category.totalCount}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                      <div
                        className="h-full rounded-full severity-bar"
                        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: colors.bar }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed categories */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0f172a]">Detailed Breakdown</h2>

        {categories.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 text-center shadow-sm">
            <div className="text-[#16a34a] text-lg font-semibold">Clean</div>
            <p className="text-[#64748b] text-sm mt-1">No profanity detected in this title.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => {
              const colors = severityColor(category.severity);
              return (
                <div key={category.name} className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#f8fafc] cursor-pointer bg-transparent border-0 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <h3 className="text-[#0f172a] text-sm font-medium">{category.name}</h3>
                        <p className="text-xs text-[#64748b]">
                          {category.words.length} word{category.words.length !== 1 ? 's' : ''} &middot; {category.totalCount} total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        {category.severity}
                      </span>
                      <svg className={`w-4 h-4 text-[#94a3b8] transition-transform ${expandedCategory === category.name ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedCategory === category.name && (
                    <div className="border-t border-[#e2e8f0] p-4 bg-[#f8fafc]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {category.words.map((word) => {
                          const wColors = severityColor(word.severity);
                          return (
                            <div key={word.word} className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 flex items-center justify-between">
                              <span className="text-[#0f172a] text-sm font-mono">{word.word}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: wColors.bg, color: wColors.text }}
                              >
                                {word.count}x
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-[#94a3b8] pb-6">
        Analyzed {new Date(result.analyzedAt).toLocaleString()} &middot; Powered by Gemini AI &middot; Subtitles from OpenSubtitles.com
      </div>
    </div>
  );
}
