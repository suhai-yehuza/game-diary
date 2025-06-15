import { Star } from 'lucide-react';
import React from 'react';

import type { IStarRatingProps } from '@src/lib/types/game-log.types';
import { cn } from '@src/lib/utils';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export function StarRating({
  ratingForGame,
  maxRating = 5,
  size = 'md',
  className = '',
  onRatingChange,
}: IStarRatingProps) {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(ratingForGame);
  const hasHalfStar = ratingForGame % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  const sizeClasses = sizeMap[size] || sizeMap.md;

  const handleStarClick = (index: number) => {
    if (onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className={cn(sizeClasses, 'fill-gray-600 text-gray-600 cursor-pointer', className)}
        onClick={() => handleStarClick(i)}
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={cn(sizeClasses, 'text-gray-300 cursor-pointer', className)} />
        <Star
          className={cn(
            sizeClasses,
            'fill-gray-600 text-gray-600 absolute top-0 left-0 cursor-pointer',
            className
          )}
          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
          onClick={() => handleStarClick(fullStars)}
        />
      </div>
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        className={cn(sizeClasses, 'text-gray-300 cursor-pointer', className)}
        onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
      />
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
