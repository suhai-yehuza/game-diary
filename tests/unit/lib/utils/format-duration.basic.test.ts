/// <reference types="vitest/globals" />

import { describe, it, expect } from 'vitest';

import { formatDuration } from '@/lib/utils/format-duration';

describe('formatDuration', () => {
  it('should format milliseconds correctly', () => {
    expect(formatDuration(500)).toBe('500.00ms');
    expect(formatDuration(1234)).toBe('1234.00ms (0m 1s)');
    expect(formatDuration(5678)).toBe('5678.00ms (0m 5s)');
  });

  it('should format seconds correctly', () => {
    expect(formatDuration(1000)).toBe('1000.00ms (0m 1s)');
    expect(formatDuration(30000)).toBe('30000.00ms (0m 30s)');
    expect(formatDuration(59999)).toBe('59999.00ms (0m 59s)');
  });

  it('should format minutes correctly', () => {
    expect(formatDuration(60000)).toBe('60000.00ms (1m 0s)');
    expect(formatDuration(120000)).toBe('120000.00ms (2m 0s)');
    expect(formatDuration(3540000)).toBe('3540000.00ms (59m 0s)');
  });

  it('should format hours correctly', () => {
    expect(formatDuration(3600000)).toBe('3600000.00ms (0m 0s, 1h)');
    expect(formatDuration(7200000)).toBe('7200000.00ms (0m 0s, 2h)');
    expect(formatDuration(3660000)).toBe('3660000.00ms (1m 0s, 1h)');
  });

  it('should handle zero milliseconds', () => {
    expect(formatDuration(0)).toBe('0.00ms');
  });

  it('should handle very small values', () => {
    expect(formatDuration(1)).toBe('1.00ms');
    expect(formatDuration(99)).toBe('99.00ms');
  });

  it('should handle large values', () => {
    expect(formatDuration(86400000)).toBe('86400000.00ms (0m 0s, 24h)');
    expect(formatDuration(90000000)).toBe('90000000.00ms (0m 0s, 25h)');
  });

  it('should handle decimal milliseconds', () => {
    expect(formatDuration(500.5)).toBe('500.50ms');
    expect(formatDuration(1234.567)).toBe('1234.57ms (0m 1s)');
  });

  it('should handle edge cases around minute boundaries', () => {
    expect(formatDuration(59999)).toBe('59999.00ms (0m 59s)');
    expect(formatDuration(60000)).toBe('60000.00ms (1m 0s)');
    expect(formatDuration(60001)).toBe('60001.00ms (1m 0s)');
  });

  it('should handle edge cases around hour boundaries', () => {
    expect(formatDuration(3599999)).toBe('3599999.00ms (59m 59s)');
    expect(formatDuration(3600000)).toBe('3600000.00ms (0m 0s, 1h)');
    expect(formatDuration(3600001)).toBe('3600001.00ms (0m 0s, 1h)');
  });
});
