import { describe, it, expect } from 'vitest';

import { formatDuration } from '@/lib/utils/format-duration';

describe('formatDuration Extended Tests', () => {
  describe('formatDuration', () => {
    it('formats zero duration correctly', () => {
      expect(formatDuration(0)).toBe('0.00ms');
    });

    it('formats seconds only', () => {
      expect(formatDuration(1500)).toBe('1500.00ms (0m 1s)');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(90000)).toBe('90000.00ms (1m 30s)');
    });

    it('formats hours, minutes and seconds', () => {
      expect(formatDuration(3723000)).toBe('3723000.00ms (2m 3s, 1h)');
    });

    it('formats days, hours, minutes and seconds', () => {
      expect(formatDuration(90061000)).toBe('90061000.00ms (1m 1s, 25h)');
    });

    it('handles negative durations', () => {
      expect(formatDuration(-1000)).toBe('-1000.00ms');
    });

    it('handles very large durations', () => {
      expect(formatDuration(31536000000)).toBe('31536000000.00ms (0m 0s, 8760h)');
    });

    it('handles decimal seconds', () => {
      expect(formatDuration(1500.5)).toBe('1500.50ms (0m 1s)');
    });

    it('handles edge cases', () => {
      expect(formatDuration(1)).toBe('1.00ms');
      expect(formatDuration(999)).toBe('999.00ms');
      expect(formatDuration(1000)).toBe('1000.00ms (0m 1s)');
      expect(formatDuration(59999)).toBe('59999.00ms (0m 59s)');
      expect(formatDuration(60000)).toBe('60000.00ms (1m 0s)');
      expect(formatDuration(3599999)).toBe('3599999.00ms (59m 59s)');
      expect(formatDuration(3600000)).toBe('3600000.00ms (0m 0s, 1h)');
      expect(formatDuration(86399999)).toBe('86399999.00ms (59m 59s, 23h)');
      expect(formatDuration(86400000)).toBe('86400000.00ms (0m 0s, 24h)');
    });

    it('handles very small values', () => {
      expect(formatDuration(0.1)).toBe('0.10ms');
      expect(formatDuration(0.5)).toBe('0.50ms');
      expect(formatDuration(0.9)).toBe('0.90ms');
    });

    it('handles exact minute boundaries', () => {
      expect(formatDuration(60000)).toBe('60000.00ms (1m 0s)');
      expect(formatDuration(120000)).toBe('120000.00ms (2m 0s)');
      expect(formatDuration(180000)).toBe('180000.00ms (3m 0s)');
    });

    it('handles exact hour boundaries', () => {
      expect(formatDuration(3600000)).toBe('3600000.00ms (0m 0s, 1h)');
      expect(formatDuration(7200000)).toBe('7200000.00ms (0m 0s, 2h)');
      expect(formatDuration(10800000)).toBe('10800000.00ms (0m 0s, 3h)');
    });

    it('handles exact day boundaries', () => {
      expect(formatDuration(86400000)).toBe('86400000.00ms (0m 0s, 24h)');
      expect(formatDuration(172800000)).toBe('172800000.00ms (0m 0s, 48h)');
      expect(formatDuration(259200000)).toBe('259200000.00ms (0m 0s, 72h)');
    });

    it('handles mixed precision', () => {
      expect(formatDuration(3661000)).toBe('3661000.00ms (1m 1s, 1h)');
      expect(formatDuration(3661001)).toBe('3661001.00ms (1m 1s, 1h)');
      expect(formatDuration(3661500)).toBe('3661500.00ms (1m 1s, 1h)');
    });

    it('handles edge case around 1 second', () => {
      expect(formatDuration(999)).toBe('999.00ms');
      expect(formatDuration(1000)).toBe('1000.00ms (0m 1s)');
      expect(formatDuration(1001)).toBe('1001.00ms (0m 1s)');
    });

    it('handles edge case around 1 minute', () => {
      expect(formatDuration(59999)).toBe('59999.00ms (0m 59s)');
      expect(formatDuration(60000)).toBe('60000.00ms (1m 0s)');
      expect(formatDuration(60001)).toBe('60001.00ms (1m 0s)');
    });

    it('handles edge case around 1 hour', () => {
      expect(formatDuration(3599999)).toBe('3599999.00ms (59m 59s)');
      expect(formatDuration(3600000)).toBe('3600000.00ms (0m 0s, 1h)');
      expect(formatDuration(3600001)).toBe('3600001.00ms (0m 0s, 1h)');
    });

    it('handles edge case around 1 day', () => {
      expect(formatDuration(86399999)).toBe('86399999.00ms (59m 59s, 23h)');
      expect(formatDuration(86400000)).toBe('86400000.00ms (0m 0s, 24h)');
      expect(formatDuration(86400001)).toBe('86400001.00ms (0m 0s, 24h)');
    });
  });
});
