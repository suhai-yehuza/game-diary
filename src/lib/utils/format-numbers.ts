/**
 * Utility function to format large numbers with K/M suffixes
 */
export const formatShort = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format number with commas for better readability
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};
