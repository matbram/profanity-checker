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
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#71717a] hover:text-[#a1a1aa] bg-transparent border-0 cursor-pointer text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Header card */}
      <div className="bg-[#131316] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-56 flex-shrink-0">
            {feature.poster_url ? (
              <img src={feature.poster_url} alt={feature.title} className="w-full h-full object-cover" style={{ maxHeight: '340px' }} />
            ) : (
              <div className="w-full h-56 md:h-full bg-[#1a1a1f] flex items-center justify-center text-[#52525b] text-sm">No poster</div>
            )}
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#fafafa]">{feature.title}</h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#06b6d4]/10 text-[#06b6d4] font-medium uppercase tracking-wide">
                      {feature.type === 'tvshow' ? 'TV Show' : 'Movie'}
                    </span>
                    {feature.year && <span className="text-sm text-[#71717a]">{feature.year}</span>}
                    {feature.genres && feature.genres.length > 0 && (
                      <span className="text-sm text-[#71717a]">{feature.genres.join(', ')}</span>
                    )}
                    {feature.runtime && <span className="text-sm text-[#71717a]">{feature.runtime} min</span>}
                  </div>
                </div>
                <RatingBadge rating={rating} score={ratingScore} size="md" />
              </div>
              {feature.tagline && <p className="text-[#52525b] italic mt-2 text-sm">&ldquo;{feature.tagline}&rdquo;</p>}
              {feature.overview && <p className="text-[#a1a1aa] mt-3 text-sm leading-relaxed line-clamp-3">{feature.overview}</p>}
            </div>
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#27272a]">
              <div className="text-center">
                <div className="text-xl font-bold text-[#fafafa]">{totalProfanities}</div>
                <div className="text-[10px] text-[#71717a] uppercase tracking-wide">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#fafafa]">{categories.length}</div>
                <div className="text-[10px] text-[#71717a] uppercase tracking-wide">Categories</div>
              </div>
              {feature.vote_average !== undefined && feature.vote_average > 0 && (
                <div className="text-center">
                  <div className="text-xl font-bold text-[#eab308]">{feature.vote_average.toFixed(1)}</div>
                  <div className="text-[10px] text-[#71717a] uppercase tracking-wide">TMDB</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-[#131316] border border-[#27272a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#fafafa] mb-2">AI Summary</h2>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#fafafa]">Profanity Breakdown</h2>

        {categories.length === 0 ? (
          <div className="bg-[#131316] border border-[#27272a] rounded-xl p-8 text-center">
            <div className="text-[#22c55e] text-lg font-semibold">Clean</div>
            <p className="text-[#71717a] text-sm mt-1">No profanity detected in this title.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.name} className="bg-[#131316] border border-[#27272a] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1f] cursor-pointer bg-transparent border-0 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <h3 className="text-[#fafafa] text-sm font-medium">{category.name}</h3>
                      <p className="text-xs text-[#71717a]">
                        {category.words.length} word{category.words.length !== 1 ? 's' : ''} &middot; {category.totalCount} total
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      category.severity === 'strong' ? 'bg-[#ef4444]/10 text-[#ef4444]'
                      : category.severity === 'moderate' ? 'bg-[#f97316]/10 text-[#f97316]'
                      : 'bg-[#eab308]/10 text-[#eab308]'
                    }`}>
                      {category.severity}
                    </span>
                    <svg className={`w-4 h-4 text-[#52525b] transition-transform ${expandedCategory === category.name ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedCategory === category.name && (
                  <div className="border-t border-[#27272a] p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {category.words.map((word) => (
                        <div key={word.word} className="bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 flex items-center justify-between">
                          <span className="text-[#fafafa] text-sm font-mono">{word.word}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            word.severity === 'strong' ? 'bg-[#ef4444]/10 text-[#ef4444]'
                            : word.severity === 'moderate' ? 'bg-[#f97316]/10 text-[#f97316]'
                            : 'bg-[#eab308]/10 text-[#eab308]'
                          }`}>
                            {word.count}x
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

      <div className="text-center text-[10px] text-[#52525b] pb-6">
        Analyzed {new Date(result.analyzedAt).toLocaleString()} &middot; Powered by Gemini AI &middot; Subtitles from OpenSubtitles.com
      </div>
    </div>
  );
}
