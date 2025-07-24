// Utility to get the latest NBA season (e.g., 2023 for 2023-24)
export function getLatestNbaSeason(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0=Jan, 6=July
  // NBA season starts in October, so before July is still the previous season
  return month < 6 ? year - 1 : year;
}

// Utility to get an array of recent NBA seasons, starting from the latest
export function getRecentNbaSeasons(count: number, date: Date = new Date()): number[] {
  const latest = getLatestNbaSeason(date);
  return Array.from({ length: count }, (_, i) => latest - i);
}
