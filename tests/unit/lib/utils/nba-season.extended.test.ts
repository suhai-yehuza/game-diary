import { describe, it, expect } from 'vitest';

import { getLatestNbaSeason, getRecentNbaSeasons } from '@/lib/utils/nba-season';

describe('NBA Season Utils Extended Tests', () => {
  describe('getLatestNbaSeason', () => {
    it('returns correct season based on current date', () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-indexed

      // NBA season starts in October (month 9), so before October is previous year
      const expectedSeason = currentMonth < 9 ? currentYear - 1 : currentYear;
      expect(getLatestNbaSeason()).toBe(expectedSeason);
    });

    it('returns consistent value for multiple calls', () => {
      const firstCall = getLatestNbaSeason();
      const secondCall = getLatestNbaSeason();
      expect(firstCall).toBe(secondCall);
    });

    it('handles custom date parameter', () => {
      // Test with a date in January (month 0) - should return previous year
      const janDate = new Date(2024, 0, 15); // January 15, 2024
      expect(getLatestNbaSeason(janDate)).toBe(2023);

      // Test with a date in December (month 11) - should return current year
      const decDate = new Date(2024, 11, 15); // December 15, 2024
      expect(getLatestNbaSeason(decDate)).toBe(2024);
    });
  });

  describe('getRecentNbaSeasons', () => {
    it('returns array of recent seasons', () => {
      const seasons = getRecentNbaSeasons(5);
      expect(Array.isArray(seasons)).toBe(true);
      expect(seasons.length).toBe(5);
    });

    it('returns seasons in descending order', () => {
      const seasons = getRecentNbaSeasons(3);
      expect(seasons[0]).toBeGreaterThan(seasons[1]);
      expect(seasons[1]).toBeGreaterThan(seasons[2]);
    });

    it('returns correct number of seasons', () => {
      expect(getRecentNbaSeasons(1).length).toBe(1);
      expect(getRecentNbaSeasons(10).length).toBe(10);
      expect(getRecentNbaSeasons(20).length).toBe(20);
    });

    it('returns latest season as first season', () => {
      const latestSeason = getLatestNbaSeason();
      const seasons = getRecentNbaSeasons(5);
      expect(seasons[0]).toBe(latestSeason);
    });

    it('returns consecutive years', () => {
      const seasons = getRecentNbaSeasons(5);
      for (let i = 1; i < seasons.length; i++) {
        expect(seasons[i - 1] - seasons[i]).toBe(1);
      }
    });

    it('handles zero count', () => {
      const seasons = getRecentNbaSeasons(0);
      expect(seasons.length).toBe(0);
    });

    it('handles negative count', () => {
      const seasons = getRecentNbaSeasons(-5);
      expect(seasons.length).toBe(0);
    });

    it('handles large count', () => {
      const latestSeason = getLatestNbaSeason();
      const seasons = getRecentNbaSeasons(100);
      expect(seasons.length).toBe(100);
      expect(seasons[0]).toBe(latestSeason);
      expect(seasons[99]).toBe(latestSeason - 99);
    });

    it('returns unique seasons', () => {
      const seasons = getRecentNbaSeasons(10);
      const uniqueSeasons = new Set(seasons);
      expect(uniqueSeasons.size).toBe(seasons.length);
    });

    it('handles custom date parameter', () => {
      // Test with a date in January 2024 - should start from 2023
      const janDate = new Date(2024, 0, 15);
      const seasons = getRecentNbaSeasons(3, janDate);
      expect(seasons[0]).toBe(2023);
      expect(seasons[1]).toBe(2022);
      expect(seasons[2]).toBe(2021);
    });
  });

  describe('Integration Tests', () => {
    it('latest season is included in recent seasons', () => {
      const latestSeason = getLatestNbaSeason();
      const recentSeasons = getRecentNbaSeasons(10);
      expect(recentSeasons).toContain(latestSeason);
    });

    it('recent seasons start from latest season', () => {
      const latestSeason = getLatestNbaSeason();
      const recentSeasons = getRecentNbaSeasons(5);
      expect(recentSeasons[0]).toBe(latestSeason);
    });
  });
});
