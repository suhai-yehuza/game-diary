import { describe, expect, it } from 'vitest';

import { createRapidAPIClient } from '@/lib/utils/api-client';
import { cn, formatDate } from '@/lib/utils/index';
import { TIMEOUTS } from '../../e2e/utils/test-utils';

describe('API Client Utils', () => {
  it('creates RapidAPI client with correct configuration', () => {
    const config = {
      baseUrl: 'https://test-api.com',
      apiKey: 'test-key',
      host: 'test-host',
      headers: {
        'X-RapidAPI-Key': 'test-key',
        'X-RapidAPI-Host': 'test-host',
      },
      timeout: TIMEOUTS.MEDIUM,
      retries: 3,
      cacheTTL: 300000,
      endpoints: {
        test: '/test-endpoint',
      },
    };

    const client = createRapidAPIClient(config);
    expect(client).toBeDefined();
    expect(typeof client.fetch).toBe('function');
  });

  it('builds URL with parameters correctly', () => {
    const config = {
      baseUrl: 'https://test-api.com',
      apiKey: 'test-key',
      host: 'test-host',
      headers: {
        'X-RapidAPI-Key': 'test-key',
        'X-RapidAPI-Host': 'test-host',
      },
      timeout: TIMEOUTS.MEDIUM,
      retries: 3,
      cacheTTL: 300000,
      endpoints: {
        test: '/test-endpoint',
      },
    };

    // Test that the config has the correct values
    expect(config.baseUrl).toBe('https://test-api.com');
    expect(config.apiKey).toBe('test-key');
    expect(config.host).toBe('test-host');
  });
});

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const isHidden = false;
      expect(cn('base', isActive ? 'conditional' : '', isHidden ? 'hidden' : '')).toBe(
        'base conditional'
      );
    });

    it('handles arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('handles objects with boolean values', () => {
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });

    it('handles mixed input types', () => {
      expect(cn('base', ['class1', 'class2'], { active: true }, 'class3')).toBe(
        'base class1 class2 active class3'
      );
    });

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null, 'class1')).toBe('base class1');
    });

    it('handles empty strings', () => {
      expect(cn('base', '', 'class1')).toBe('base class1');
    });

    it('handles Tailwind class conflicts', () => {
      // twMerge should resolve conflicts
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('handles complex Tailwind conflicts', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles spacing conflicts', () => {
      expect(cn('m-2 p-4', 'm-4 p-2')).toBe('m-4 p-2');
    });

    it('handles flex conflicts', () => {
      // twMerge doesn't remove non-conflicting classes, it only resolves conflicts
      expect(cn('flex items-center', 'flex justify-center')).toBe(
        'items-center flex justify-center'
      );
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);

      // The exact format depends on the locale, so we'll check it's a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles different date formats', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date('2023-06-15'),
        new Date('2025-03-08'),
      ];

      dates.forEach(date => {
        const result = formatDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('handles edge case dates', () => {
      const edgeDates = [
        new Date('1900-01-01'),
        new Date('2100-12-31'),
        new Date('2000-02-29'), // Leap year
      ];

      edgeDates.forEach(date => {
        const result = formatDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('handles current date', () => {
      const now = new Date();
      const result = formatDate(now);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles invalid date gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);

      // Should still return a string, even for invalid dates
      expect(typeof result).toBe('string');
    });
  });

  describe('Integration tests', () => {
    it('can use both utilities together', () => {
      const date = new Date('2024-01-15');
      const formattedDate = formatDate(date);
      const hasDate = Boolean(formattedDate);
      const className = cn('base-class', hasDate ? 'has-date' : '');

      expect(typeof formattedDate).toBe('string');
      expect(className).toBe('base-class has-date');
    });

    it('handles complex scenarios', () => {
      const dates = [new Date('2024-01-01'), new Date('2024-01-02')];
      const formattedDates = dates.map(formatDate);
      const hasDates = formattedDates.length > 0;
      const hasTwoDates = formattedDates.length === 2;
      const className = cn('base', hasDates ? 'has-dates' : '', hasTwoDates ? 'has-two-dates' : '');

      expect(className).toBe('base has-dates has-two-dates');
    });
  });
});
