// Utility functions for table operations

export function isRecordArray(data: unknown): data is Record<string, unknown>[] {
  return Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null);
}

export function formatValue(value: unknown, _field: string): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  }
  // At this point, value should be a primitive that can be safely converted
  if (typeof value === 'object' && value !== null) {
    return '[Object]';
  }
  // Safe to convert primitive values
  return String(value as string | number | boolean | symbol | bigint);
}
