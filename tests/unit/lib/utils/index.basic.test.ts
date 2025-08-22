import { describe, it, expect } from 'vitest';

import { cn, formatDate } from '@/lib/utils';

describe('utils index', () => {
  describe('cn', () => {
    it('combines class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('handles conditional classes', () => {
      const result = cn('base', { conditional: true, other: false });
      expect(result).toBe('base conditional');
    });

    it('handles arrays of classes', () => {
      const result = cn('base', ['class1', 'class2']);
      expect(result).toBe('base class1 class2');
    });

    it('handles mixed inputs', () => {
      const result = cn('base', { conditional: true }, 'class1', ['class2', 'class3']);
      expect(result).toBe('base conditional class1 class2 class3');
    });

    it('handles empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles falsy values', () => {
      const result = cn('base', null, undefined, false, 0, '');
      expect(result).toBe('base');
    });

    it('merges Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });
  });

  describe('formatDate', () => {
    it('formats a date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });

    it('formats different dates', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-12-25');
      const result1 = formatDate(date1);
      const result2 = formatDate(date2);
      expect(result1).not.toBe(result2);
    });

    it('handles current date', () => {
      const now = new Date();
      const result = formatDate(now);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });
  });
});
