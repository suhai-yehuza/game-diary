// Helper to format ms as ms, min, sec, hours
export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  let result = `${ms.toFixed(2)}ms`;
  if (ms >= 1000) {
    result += ` (${minutes}m ${seconds}s`;
    if (hours > 0) result += `, ${hours}h`;
    result += ')';
  }
  return result;
}
