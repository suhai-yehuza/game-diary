import { describe, it, expect } from 'vitest';

import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';

describe('formatNumberShort', () => {
  it('formats numbers less than 1000 as is', () => {
    expect(formatNumberShort(0)).toBe('0');
    expect(formatNumberShort(1)).toBe('1');
    expect(formatNumberShort(999)).toBe('999');
    expect(formatNumberShort(123)).toBe('123');
  });

  it('formats numbers 1000-999999 as K', () => {
    expect(formatNumberShort(1000)).toBe('1.00K');
    expect(formatNumberShort(1500)).toBe('1.50K');
    expect(formatNumberShort(999999)).toBe('1000.00K');
    expect(formatNumberShort(12345)).toBe('12.35K');
  });

  it('formats numbers 1000000-999999999 as M', () => {
    expect(formatNumberShort(1000000)).toBe('1.00M');
    expect(formatNumberShort(1500000)).toBe('1.50M');
    expect(formatNumberShort(999999999)).toBe('1000.00M');
    expect(formatNumberShort(12345678)).toBe('12.35M');
  });

  it('formats numbers 1000000000+ as B', () => {
    expect(formatNumberShort(1000000000)).toBe('1.00B');
    expect(formatNumberShort(1500000000)).toBe('1.50B');
    expect(formatNumberShort(999999999999)).toBe('1000.00B');
    expect(formatNumberShort(12345678901)).toBe('12.35B');
  });

  it('handles decimal numbers correctly', () => {
    expect(formatNumberShort(1234.56)).toBe('1.23K');
    expect(formatNumberShort(1234567.89)).toBe('1.23M');
    expect(formatNumberShort(1234567890.12)).toBe('1.23B');
  });

  it('handles edge cases', () => {
    expect(formatNumberShort(999)).toBe('999');
    expect(formatNumberShort(999999)).toBe('1000.00K');
    expect(formatNumberShort(999999999)).toBe('1000.00M');
    expect(formatNumberShort(999999999999)).toBe('1000.00B');
  });

  it('handles zero', () => {
    expect(formatNumberShort(0)).toBe('0');
  });

  it('handles very large numbers', () => {
    expect(formatNumberShort(Number.MAX_SAFE_INTEGER)).toBe('9007199.25B');
  });

  it('handles very small numbers', () => {
    expect(formatNumberShort(0.1)).toBe('0.1');
    expect(formatNumberShort(0.01)).toBe('0.01');
  });
});
