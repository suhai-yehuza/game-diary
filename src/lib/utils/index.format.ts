/**
 * Format large numbers into readable format
 * @param count - The number to format
 * @returns Formatted string (e.g., 1.2k, 50.1k, 2.3M)
 */
export function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    const thousands = count / 1000;
    // Round to 1 decimal place
    const rounded = Math.round(thousands * 10) / 10;
    // If the rounded value is a whole number, don't show decimal
    if (rounded === Math.floor(rounded)) {
      return `${Math.floor(rounded)}k`;
    }
    return `${rounded}k`;
  } else if (count < 1000000000) {
    const millions = count / 1000000;
    // Round to 1 decimal place
    const rounded = Math.round(millions * 10) / 10;
    // If the rounded value is a whole number, don't show decimal
    if (rounded === Math.floor(rounded)) {
      return `${Math.floor(rounded)}M`;
    }
    return `${rounded}M`;
  } else {
    const billions = count / 1000000000;
    // Round to 1 decimal place
    const rounded = Math.round(billions * 10) / 10;
    // If the rounded value is a whole number, don't show decimal
    if (rounded === Math.floor(rounded)) {
      return `${Math.floor(rounded)}B`;
    }
    return `${rounded}B`;
  }
}

export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Handle special cases
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          // Escape commas and quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getExportFilename = (prefix: string): string => {
  const date = new Date();
  return `${prefix}_${date.toISOString().split('T')[0]}`;
};
