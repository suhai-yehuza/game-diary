import { Star } from 'lucide-react';

import type { IRatingStarsProps } from '@/types';

export const RatingStars = ({ rating }: IRatingStarsProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          data-testid="star-icon"
          className={`w-4 h-4 ${star <= rating ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};
