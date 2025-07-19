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
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}
