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
