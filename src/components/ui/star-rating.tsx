import { Star } from 'lucide-react';
import React from 'react';

import { StarRatingProps } from '@/lib/types/generated/types';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  const sizeClasses = sizeMap[size] || sizeMap.md;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className={cn(sizeClasses, 'fill-gray-600 text-gray-600', className)}
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={cn(sizeClasses, 'text-gray-300', className)} />
        <Star
          className={cn(
            sizeClasses,
            'fill-gray-600 text-gray-600 absolute top-0 left-0',
            className
          )}
          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
        />
      </div>
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className={cn(sizeClasses, 'text-gray-300', className)} />);
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
