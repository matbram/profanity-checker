'use client';

interface RatingBadgeProps {
  rating: 'Clean' | 'Mild' | 'Moderate' | 'Heavy' | 'Extreme';
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingBadge({ rating, score, size = 'md' }: RatingBadgeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-lg',
    lg: 'w-32 h-32 text-2xl',
  };

  const scoreSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const ratingClass = `rating-${rating.toLowerCase()}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${ratingClass} rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg`}
      >
        <span>{score}</span>
        <span className={`${scoreSizeClasses[size]} font-medium opacity-90`}>/100</span>
      </div>
      <span
        className={`font-semibold ${
          rating === 'Clean'
            ? 'text-emerald-400'
            : rating === 'Mild'
            ? 'text-amber-400'
            : rating === 'Moderate'
            ? 'text-orange-400'
            : rating === 'Heavy'
            ? 'text-red-400'
            : 'text-red-600'
        } ${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm'}`}
      >
        {rating}
      </span>
    </div>
  );
}
