import { describe, it, expect } from 'vitest';

import { formatDuration } from '@/lib/utils/format-duration';

describe('formatDuration Extended Tests', () => {
  describe('formatDuration', () => {
    it('formats zero duration correctly', () => {
      expect(formatDuration(0)).toBe('0.00ms');
    });

    it('formats seconds only', () => {
      expect(formatDuration(30)).toBe('30.00ms');
      expect(formatDuration(59)).toBe('59.00ms');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('60000.00ms (1m 0s)');
      expect(formatDuration(90000)).toBe('90000.00ms (1m 30s)');
      expect(formatDuration(125000)).toBe('125000.00ms (2m 5s)');
      expect(formatDuration(3599000)).toBe('3599000.00ms (59m 59s)');
    });

    it('formats hours, minutes and seconds', () => {
      expect(formatDuration(3600000)).toBe('3600000.00ms (0m 0s, 1h)');
      expect(formatDuration(3661000)).toBe('3661000.00ms (1m 1s, 1h)');
      expect(formatDuration(7325000)).toBe('7325000.00ms (2m 5s, 2h)');
      expect(formatDuration(86399000)).toBe('86399000.00ms (59m 59s, 23h)');
    });

    it('formats days, hours, minutes and seconds', () => {
      expect(formatDuration(86400000)).toBe('86400000.00ms (0m 0s, 24h)');
      expect(formatDuration(90061000)).toBe('90061000.00ms (1m 1s, 25h)');
      expect(formatDuration(93725000)).toBe('93725000.00ms (2m 5s, 26h)');
    });

    it('handles negative durations', () => {
      expect(formatDuration(-30)).toBe('-30.00ms');
      expect(formatDuration(-90000)).toBe('-90000.00ms');
      expect(formatDuration(-3661000)).toBe('-3661000.00ms');
    });

    it('handles very large durations', () => {
      expect(formatDuration(999999000)).toBe('999999000.00ms (46m 39s, 277h)');
      expect(formatDuration(1000000000)).toBe('1000000000.00ms (46m 40s, 277h)');
    });

    it('handles decimal seconds', () => {
      expect(formatDuration(30.5)).toBe('30.50ms');
      expect(formatDuration(90.7)).toBe('90.70ms');
    });

    it('handles edge cases', () => {
      expect(formatDuration(1)).toBe('1.00ms');
      expect(formatDuration(3601000)).toBe('3601000.00ms (0m 1s, 1h)');
      expect(formatDuration(86401000)).toBe('86401000.00ms (0m 1s, 24h)');
    });
  });
});
