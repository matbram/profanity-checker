'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import RatingBadge from './RatingBadge';

interface ProfanityResultsProps {
  result: AnalysisResult;
  onBack: () => void;
}

function proxyImg(url: string | null): string | null {
  if (!url) return null;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export default function ProfanityResults({ result, onBack }: ProfanityResultsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { feature, categories, totalProfanities, rating, ratingScore, summary } = result;

  const severityColor = (severity: string) => {
    if (severity === 'strong') return { bg: 'var(--severity-strong-bg)', border: 'var(--severity-strong-border)', text: 'var(--severity-strong-text)', bar: 'var(--severity-strong-bar)' };
    if (severity === 'moderate') return { bg: 'var(--severity-moderate-bg)', border: 'var(--severity-moderate-border)', text: 'var(--severity-moderate-text)', bar: 'var(--severity-moderate-bar)' };
    return { bg: 'var(--severity-mild-bg)', border: 'var(--severity-mild-border)', text: 'var(--severity-mild-text)', bar: 'var(--severity-mild-bar)' };
  };

  const episodeLabel = feature.season !== undefined && feature.episode !== undefined
    ? `S${feature.season}E${feature.episode}`
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 bg-transparent border-0 cursor-pointer text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Header card */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-52 flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)' }}>
            {feature.poster_url ? (
              <img src={proxyImg(feature.poster_url)!} alt={feature.title} className="w-full h-full object-cover" style={{ maxHeight: '340px' }} />
            ) : (
              <div className="w-full h-56 md:h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-faint)' }}>No poster</div>
            )}
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                    {episodeLabel && (
                      <span className="ml-2 text-lg font-semibold" style={{ color: 'var(--accent)' }}>{episodeLabel}</span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                      {feature.type === 'tvshow' ? 'TV Show' : 'Movie'}
                    </span>
                    {feature.year > 0 && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature.year}</span>}
                    {feature.genres && feature.genres.length > 0 && (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature.genres.join(', ')}</span>
                    )}
                    {feature.runtime && feature.runtime > 0 && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature.runtime} min</span>}
                  </div>
                </div>
                <RatingBadge rating={rating} score={ratingScore} size="lg" />
              </div>
              {feature.tagline && <p className="italic mt-2 text-sm" style={{ color: 'var(--text-faint)' }}>&ldquo;{feature.tagline}&rdquo;</p>}
              {feature.overview && <p className="mt-3 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{feature.overview}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalProfanities}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total Words</div>
        </div>
        <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{categories.length}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Categories</div>
        </div>
        <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-2xl font-bold" style={{
            color: rating === 'Clean' ? 'var(--success)' : rating === 'Mild' ? 'var(--warning)' : rating === 'Moderate' ? 'var(--severity-moderate-text)' : 'var(--danger)'
          }}>
            {rating}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Rating</div>
        </div>
        {feature.vote_average !== undefined && feature.vote_average > 0 ? (
          <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>{feature.vote_average.toFixed(1)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>TMDB Score</div>
          </div>
        ) : (
          <div className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{ratingScore}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Severity Score</div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--accent-muted)' }}>
              <svg className="w-3 h-3" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Summary</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{summary}</p>
        </div>
      )}

      {/* Visual severity breakdown */}
      {categories.length > 0 && (
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>At a Glance</h2>
          <div className="space-y-3">
            {categories.map((category) => {
              const pct = totalProfanities > 0 ? (category.totalCount / totalProfanities) * 100 : 0;
              const colors = severityColor(category.severity);
              return (
                <div key={category.name} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center flex-shrink-0">{category.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{category.name}</span>
                      <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: colors.text }}>
                        {category.totalCount}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
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
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Detailed Breakdown</h2>

        {categories.length === 0 ? (
          <div className="rounded-xl p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-lg font-semibold" style={{ color: 'var(--success)' }}>Clean</div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No profanity detected in this title.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => {
              const colors = severityColor(category.severity);
              return (
                <div key={category.name} className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                    className="w-full flex items-center justify-between p-4 cursor-pointer bg-transparent border-0 text-left transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{category.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
                      <svg className={`w-4 h-4 transition-transform ${expandedCategory === category.name ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--text-faint)' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedCategory === category.name && (
                    <div className="p-4" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)' }}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {category.words.map((word) => {
                          const wColors = severityColor(word.severity);
                          return (
                            <div key={word.word} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                              <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{word.word}</span>
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

      <div className="text-center text-[10px] pb-6" style={{ color: 'var(--text-faint)' }}>
        Analyzed {new Date(result.analyzedAt).toLocaleString()} &middot; Powered by Gemini AI &middot; Subtitles from OpenSubtitles.com
      </div>
    </div>
  );
}
