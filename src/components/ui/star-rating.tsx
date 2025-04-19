import { Star } from 'lucide-react';
import React from 'react';

import { StarRatingProps } from '@/lib/types';

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

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className={`w-${size} h-${size} fill-yellow-400 text-yellow-400 ${className}`}
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star
          className={`w-${size} h-${size} text-yellow-400 ${className}`}
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        />
        <Star
          className={`w-${size} h-${size} fill-yellow-400 text-yellow-400 absolute top-0 left-0 ${className}`}
          style={{ clipPath: 'inset(0 0 0 50%)' }}
        />
      </div>
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`w-${size} h-${size} text-yellow-400 ${className}`} />
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
