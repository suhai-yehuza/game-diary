import { REACTION_EMOJIS } from '@/lib/types/constant.types';

/**
 * Format reaction count for display
 * Examples:
 * - 1234 -> "1.23k"
 * - 3253 -> "3.25k"
 * - 1500000 -> "1.50M"
 * - 999 -> "999"
 */
export function formatReactionCount(count: number): string {
  if (count >= 1_000_000_000) {
    return (count / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  }
  // For values very close to 1M (like 999999), format as 1M for better UX
  if (count >= 999_500) {
    return (count / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'k';
  }
  return count.toString();
}

/**
 * Format reaction count with emoji name for accessibility
 * Example: "3.25k Heart emojis"
 */
export function formatReactionCountWithEmoji(count: number, emojiName: string): string {
  const formattedCount = formatReactionCount(count);
  return `${formattedCount} ${emojiName} ${count === 1 ? 'emoji' : 'emojis'}`;
}

/**
 * Get emoji name for accessibility from emoji symbol
 * Uses REACTION_EMOJIS constant to map emoji symbols to readable names
 */
export function getEmojiName(emoji: string): string {
  // Create a reverse mapping from emoji symbols to their readable names using REACTION_EMOJIS
  const emojiToNameMap: Record<string, string> = Object.entries(REACTION_EMOJIS).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    // Convert keys like "THUMBS_UP" to "thumbs up" (lowercase)
    const readableName = key.toLowerCase().split('_').join(' ');

    acc[value] = readableName;
    return acc;
  }, {});

  return emojiToNameMap[emoji] || 'reaction';
}
