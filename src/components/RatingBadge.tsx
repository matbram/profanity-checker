'use client';

interface RatingBadgeProps {
  rating: 'Clean' | 'Mild' | 'Moderate' | 'Heavy' | 'Extreme';
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingBadge({ rating, score, size = 'md' }: RatingBadgeProps) {
  const sizeClasses = { sm: 'w-14 h-14 text-sm', md: 'w-20 h-20 text-lg', lg: 'w-28 h-28 text-2xl' };
  const scoreSizeClasses = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
  const ratingClass = `rating-${rating.toLowerCase()}`;
  const ratingColor =
    rating === 'Clean' ? 'var(--success)' : rating === 'Mild' ? 'var(--warning)' : rating === 'Moderate' ? 'var(--severity-moderate-text)' : rating === 'Heavy' ? 'var(--danger)' : '#991b1b';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`${sizeClasses[size]} ${ratingClass} rounded-full flex flex-col items-center justify-center text-white font-bold shadow-md`}>
        <span>{score}</span>
        <span className={`${scoreSizeClasses[size]} font-medium opacity-80`}>/100</span>
      </div>
      <span className={`font-semibold ${size === 'lg' ? 'text-base' : 'text-sm'}`} style={{ color: ratingColor }}>
        {rating}
      </span>
    </div>
  );
}
