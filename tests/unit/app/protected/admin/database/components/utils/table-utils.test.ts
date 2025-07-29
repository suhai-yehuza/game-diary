import { describe, it, expect } from 'vitest';

import {
  isRecordArray,
  formatValue,
} from '@/app/protected/admin/database/components/utils/table-utils';

describe('table-utils', () => {
  describe('isRecordArray', () => {
    it('returns true for array of objects', () => {
      const data = [
        { id: 1, name: 'test' },
        { id: 2, name: 'test2' },
      ];
      expect(isRecordArray(data)).toBe(true);
    });

    it('returns false for empty array', () => {
      const data: unknown[] = [];
      expect(isRecordArray(data)).toBe(true);
    });

    it('returns false for non-array', () => {
      const data = { id: 1, name: 'test' };
      expect(isRecordArray(data)).toBe(false);
    });

    it('returns false for array with non-object items', () => {
      const data = [{ id: 1 }, 'string', 123];
      expect(isRecordArray(data)).toBe(false);
    });

    it('returns false for array with null items', () => {
      const data = [{ id: 1 }, null];
      expect(isRecordArray(data)).toBe(false);
    });

    it('returns true for array with only objects', () => {
      const data = [{}, { id: 1 }, { name: 'test' }];
      expect(isRecordArray(data)).toBe(true);
    });
  });

  describe('formatValue', () => {
    it('formats null as N/A', () => {
      expect(formatValue(null, 'field')).toBe('N/A');
    });

    it('formats undefined as N/A', () => {
      expect(formatValue(undefined, 'field')).toBe('N/A');
    });

    it('formats string as is', () => {
      expect(formatValue('test string', 'field')).toBe('test string');
    });

    it('formats number as string', () => {
      expect(formatValue(123, 'field')).toBe('123');
    });

    it('formats boolean as Yes/No', () => {
      expect(formatValue(true, 'field')).toBe('Yes');
      expect(formatValue(false, 'field')).toBe('No');
    });

    it('formats Date as locale string', () => {
      const date = new Date('2023-01-01');
      expect(formatValue(date, 'field')).toBe(date.toLocaleDateString());
    });

    it('formats symbol as string', () => {
      const symbol = Symbol('test');
      expect(formatValue(symbol, 'field')).toBe(symbol.toString());
    });

    it('formats bigint as string', () => {
      const bigint = BigInt(123);
      expect(formatValue(bigint, 'field')).toBe('123');
    });

    it('formats object as JSON string', () => {
      const obj = { id: 1, name: 'test' };
      expect(formatValue(obj, 'field')).toBe(JSON.stringify(obj, null, 2));
    });

    it('formats array as JSON string', () => {
      const arr = [1, 2, 3];
      expect(formatValue(arr, 'field')).toBe(JSON.stringify(arr, null, 2));
    });

    it('handles circular reference gracefully', () => {
      const obj: any = { id: 1 };
      obj.self = obj;
      expect(formatValue(obj, 'field')).toBe('[Object]');
    });

    it('handles function as object', () => {
      const func = () => 'test';
      expect(formatValue(func, 'field')).toBe('() => "test"');
    });

    it('handles primitive values safely', () => {
      expect(formatValue('', 'field')).toBe('');
      expect(formatValue(0, 'field')).toBe('0');
      expect(formatValue(false, 'field')).toBe('No');
    });

    it('ignores field parameter', () => {
      expect(formatValue('test', 'ignored')).toBe('test');
      expect(formatValue(123, 'ignored')).toBe('123');
    });
  });
});
