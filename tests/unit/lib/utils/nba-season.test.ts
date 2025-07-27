/// <reference types="vitest/globals" />

import { describe, it, expect } from 'vitest';

import { getLatestNbaSeason, getRecentNbaSeasons } from '@/lib/utils/nba-season';

describe('NBA Season Utilities', () => {
  describe('getLatestNbaSeason', () => {
    it('should return current year for dates in October or later', () => {
      const october2024 = new Date(2024, 9, 15); // Month 9 = October
      expect(getLatestNbaSeason(october2024)).toBe(2024);

      const november2024 = new Date(2024, 10, 15); // Month 10 = November
      expect(getLatestNbaSeason(november2024)).toBe(2024);

      const december2024 = new Date(2024, 11, 15); // Month 11 = December
      expect(getLatestNbaSeason(december2024)).toBe(2024);
    });

    it('should return previous year for dates before October', () => {
      const september2024 = new Date(2024, 8, 15); // Month 8 = September
      expect(getLatestNbaSeason(september2024)).toBe(2023);

      const august2024 = new Date(2024, 7, 15); // Month 7 = August
      expect(getLatestNbaSeason(august2024)).toBe(2023);

      const january2024 = new Date(2024, 0, 15); // Month 0 = January
      expect(getLatestNbaSeason(january2024)).toBe(2023);
    });

    it('should handle edge case at October 1st', () => {
      const october1st2024 = new Date(2024, 9, 1); // Month 9 = October
      expect(getLatestNbaSeason(october1st2024)).toBe(2024);
    });

    it('should handle edge case at September 30th', () => {
      const september30th2024 = new Date(2024, 8, 30); // Month 8 = September
      expect(getLatestNbaSeason(september30th2024)).toBe(2023);
    });

    it('should use current date when no date is provided', () => {
      const result = getLatestNbaSeason();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(2020);
      expect(result).toBeLessThan(2030);
    });
  });

  describe('getRecentNbaSeasons', () => {
    it('should return array of recent seasons', () => {
      const result = getRecentNbaSeasons(3);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toBeGreaterThan(result[1]);
      expect(result[1]).toBeGreaterThan(result[2]);
    });

    it('should return single season when count is 1', () => {
      const result = getRecentNbaSeasons(1);
      expect(result.length).toBe(1);
      expect(typeof result[0]).toBe('number');
    });

    it('should handle custom date', () => {
      const customDate = new Date(2024, 9, 15); // October 2024
      const result = getRecentNbaSeasons(2, customDate);
      expect(result).toEqual([2024, 2023]);
    });

    it('should handle edge cases', () => {
      const october1st2024 = new Date(2024, 9, 1); // October 1st
      expect(getRecentNbaSeasons(1, october1st2024)).toEqual([2024]);

      const september30th2024 = new Date(2024, 8, 30); // September 30th
      expect(getRecentNbaSeasons(1, september30th2024)).toEqual([2023]);
    });

    it('should handle zero count', () => {
      const result = getRecentNbaSeasons(0);
      expect(result).toEqual([]);
    });

    it('should handle negative count', () => {
      const result = getRecentNbaSeasons(-1);
      expect(result).toEqual([]);
    });
  });
});
