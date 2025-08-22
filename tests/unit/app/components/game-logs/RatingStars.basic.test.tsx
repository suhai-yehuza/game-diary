import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { RatingStars } from '@/app/components/game-logs/RatingStars';

describe('RatingStars', () => {
  it('renders 5 stars for any rating', () => {
    render(<RatingStars rating={3} />);
    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(5);
  });

  it('renders filled stars for rating 5', () => {
    render(<RatingStars rating={5} />);
    const stars = screen.getAllByTestId('star-icon');
    stars.forEach(star => {
      expect(star).toHaveClass('text-orange-400', 'fill-current');
    });
  });

  it('renders filled stars for rating 3', () => {
    render(<RatingStars rating={3} />);
    const stars = screen.getAllByTestId('star-icon');

    // First 3 stars should be filled
    for (let i = 0; i < 3; i++) {
      expect(stars[i]).toHaveClass('text-orange-400', 'fill-current');
    }

    // Last 2 stars should be gray
    for (let i = 3; i < 5; i++) {
      expect(stars[i]).toHaveClass('text-gray-300');
      expect(stars[i]).not.toHaveClass('text-orange-400', 'fill-current');
    }
  });

  it('renders no filled stars for rating 0', () => {
    render(<RatingStars rating={0} />);
    const stars = screen.getAllByTestId('star-icon');
    stars.forEach(star => {
      expect(star).toHaveClass('text-gray-300');
      expect(star).not.toHaveClass('text-orange-400', 'fill-current');
    });
  });

  it('renders no filled stars for negative rating', () => {
    render(<RatingStars rating={-1} />);
    const stars = screen.getAllByTestId('star-icon');
    stars.forEach(star => {
      expect(star).toHaveClass('text-gray-300');
      expect(star).not.toHaveClass('text-orange-400', 'fill-current');
    });
  });

  it('renders partial filled stars for rating 2.5', () => {
    render(<RatingStars rating={2.5} />);
    const stars = screen.getAllByTestId('star-icon');

    // First 2 stars should be filled
    for (let i = 0; i < 2; i++) {
      expect(stars[i]).toHaveClass('text-orange-400', 'fill-current');
    }

    // Last 3 stars should be gray
    for (let i = 2; i < 5; i++) {
      expect(stars[i]).toHaveClass('text-gray-300');
      expect(stars[i]).not.toHaveClass('text-orange-400', 'fill-current');
    }
  });

  it('renders all filled stars for rating greater than 5', () => {
    render(<RatingStars rating={7} />);
    const stars = screen.getAllByTestId('star-icon');
    stars.forEach(star => {
      expect(star).toHaveClass('text-orange-400', 'fill-current');
    });
  });

  it('applies correct CSS classes to all stars', () => {
    render(<RatingStars rating={3} />);
    const stars = screen.getAllByTestId('star-icon');
    stars.forEach(star => {
      expect(star).toHaveClass('w-4', 'h-4');
    });
  });

  it('renders stars in a flex container with gap', () => {
    render(<RatingStars rating={3} />);
    const container = screen.getAllByTestId('star-icon')[0].parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-1');
  });
});
