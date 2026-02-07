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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#6b7280] hover:text-[#a78bfa] bg-transparent border-0 cursor-pointer text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Movie header card */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl overflow-hidden glow-accent">
        <div className="flex flex-col md:flex-row">
          {/* Poster */}
          <div className="md:w-64 flex-shrink-0">
            {feature.poster_url ? (
              <img
                src={feature.poster_url}
                alt={feature.title}
                className="w-full h-full object-cover md:rounded-l-3xl"
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-[#1e1e2e] flex items-center justify-center text-[#6b7280]">
                No poster available
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#e8e8f0]">{feature.title}</h1>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa] font-medium">
                      {feature.type === 'tvshow' ? 'TV Show' : 'Movie'}
                    </span>
                    {feature.year && (
                      <span className="text-[#6b7280]">{feature.year}</span>
                    )}
                    {feature.genres && feature.genres.length > 0 && (
                      <span className="text-[#6b7280]">
                        {feature.genres.join(', ')}
                      </span>
                    )}
                    {feature.runtime && (
                      <span className="text-[#6b7280]">{feature.runtime} min</span>
                    )}
                  </div>
                </div>
                <RatingBadge rating={rating} score={ratingScore} size="md" />
              </div>

              {feature.tagline && (
                <p className="text-[#6b7280] italic mt-3">&ldquo;{feature.tagline}&rdquo;</p>
              )}

              {feature.overview && (
                <p className="text-[#9ca3af] mt-4 text-sm leading-relaxed line-clamp-3">
                  {feature.overview}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1e1e2e]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#e8e8f0]">{totalProfanities}</div>
                <div className="text-xs text-[#6b7280]">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#e8e8f0]">{categories.length}</div>
                <div className="text-xs text-[#6b7280]">Categories</div>
              </div>
              {feature.vote_average !== undefined && feature.vote_average > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#fbbf24]">
                    {feature.vote_average.toFixed(1)}
                  </div>
                  <div className="text-xs text-[#6b7280]">TMDB Rating</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-[#e8e8f0]">AI Analysis Summary</h2>
          </div>
          <p className="text-[#9ca3af] leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#e8e8f0]">Profanity Breakdown</h2>

        {categories.length === 0 ? (
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">&#10024;</div>
            <h3 className="text-lg font-semibold text-emerald-400">Squeaky Clean!</h3>
            <p className="text-[#6b7280] mt-1">No profanity was detected in this title.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category.name ? null : category.name
                    )
                  }
                  className="w-full flex items-center justify-between p-5 hover:bg-[#16161f] cursor-pointer bg-transparent border-0 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="text-[#e8e8f0] font-semibold">{category.name}</h3>
                      <p className="text-sm text-[#6b7280]">
                        {category.words.length} unique word{category.words.length !== 1 ? 's' : ''} &middot;{' '}
                        {category.totalCount} total occurrence{category.totalCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        category.severity === 'strong'
                          ? 'bg-red-500/20 text-red-400'
                          : category.severity === 'moderate'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {category.severity}
                    </span>
                    <svg
                      className={`w-5 h-5 text-[#6b7280] transform transition-transform ${
                        expandedCategory === category.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {expandedCategory === category.name && (
                  <div className="border-t border-[#1e1e2e] p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {category.words.map((word) => (
                        <div
                          key={word.word}
                          className="bg-[#16161f] rounded-xl p-3 flex items-center justify-between"
                        >
                          <span className="text-[#e8e8f0] font-mono text-sm">
                            {word.word}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              word.severity === 'strong'
                                ? 'bg-red-500/20 text-red-400'
                                : word.severity === 'moderate'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            x{word.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-[#6b7280] pb-8">
        Analysis performed at {new Date(result.analyzedAt).toLocaleString()} &middot;
        Powered by Gemini AI &middot; Subtitles from OpenSubtitles.com
      </div>
    </div>
  );
}
