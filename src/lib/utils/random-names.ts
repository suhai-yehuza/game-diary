/**
 * Random Name Generator Utility
 *
 * Generates random anonymous names for public comments and reactions
 * when users are not authenticated. Uses a combination of adjectives
 * and nouns to create fun, memorable names.
 */

// Adjectives for generating random names
const ADJECTIVES = [
  'Amazing',
  'Awesome',
  'Brilliant',
  'Cool',
  'Epic',
  'Fantastic',
  'Great',
  'Incredible',
  'Legendary',
  'Magnificent',
  'Outstanding',
  'Phenomenal',
  'Remarkable',
  'Spectacular',
  'Super',
  'Terrific',
  'Unbelievable',
  'Wonderful',
  'Excellent',
  'Fabulous',
  'Bold',
  'Brave',
  'Clever',
  'Creative',
  'Daring',
  'Dynamic',
  'Energetic',
  'Fearless',
  'Genius',
  'Heroic',
  'Innovative',
  'Intelligent',
  'Lively',
  'Passionate',
  'Powerful',
  'Quick',
  'Sharp',
  'Smart',
  'Swift',
  'Vibrant',
  'Wise',
  'Zealous',
  'Bright',
  'Cheerful',
  'Friendly',
  'Happy',
  'Joyful',
  'Lucky',
  'Merry',
  'Optimistic',
  'Positive',
  'Radiant',
  'Sunny',
  'Upbeat',
  'Vibrant',
  'Warm',
  'Welcoming',
];

// Nouns for generating random names
const NOUNS = [
  'Fan',
  'Supporter',
  'Enthusiast',
  'Lover',
  'Admirer',
  'Champion',
  'Hero',
  'Star',
  'Player',
  'Athlete',
  'Competitor',
  'Warrior',
  'Legend',
  'Master',
  'Expert',
  'Pro',
  'Guru',
  'Wizard',
  'Genius',
  'Artist',
  'Creator',
  'Builder',
  'Maker',
  'Craftsman',
  'Explorer',
  'Adventurer',
  'Pioneer',
  'Trailblazer',
  'Innovator',
  'Visionary',
  'Dreamer',
  'Achiever',
  'Winner',
  'Victor',
  'Champion',
  'Leader',
  'Captain',
  'Commander',
  'Boss',
  'Tiger',
  'Lion',
  'Eagle',
  'Falcon',
  'Hawk',
  'Wolf',
  'Bear',
  'Panther',
  'Jaguar',
  'Phoenix',
  'Dragon',
  'Thunder',
  'Lightning',
  'Storm',
  'Fire',
  'Ice',
  'Shadow',
  'Spirit',
  'Soul',
  'Heart',
  'Mind',
  'Sword',
  'Shield',
  'Arrow',
  'Blade',
  'Flame',
  'Wave',
  'Mountain',
  'Ocean',
  'Sky',
  'Star',
  'Moon',
  'Sun',
  'Wind',
  'Rain',
  'Snow',
];

// Basketball-specific terms for more relevant names
const BASKETBALL_TERMS = [
  'Slam',
  'Dunk',
  'Shot',
  'Score',
  'Basket',
  'Hoops',
  'Court',
  'Game',
  'Play',
  'Drive',
  'Pass',
  'Rebound',
  'Block',
  'Steal',
  'Assist',
  'Three',
  'Free',
  'Throw',
  'Buzzer',
  'Beater',
  'Clutch',
  'Player',
  'Guard',
  'Forward',
  'Center',
  'Point',
  'Shooting',
  'Power',
  'Small',
  'Big',
  'Man',
  'Woman',
  'Ball',
  'Rim',
  'Net',
  'Arena',
  'Stadium',
  'Gym',
  'Floor',
  'Wood',
  'Hardwood',
  'Champion',
  'MVP',
  'All-Star',
  'Rookie',
  'Veteran',
  'Captain',
  'Leader',
  'Coach',
  'Ref',
  'Fan',
];

/**
 * Generate a random anonymous name
 *
 * @param options - Configuration options for name generation
 * @returns A random anonymous name
 */
export function generateRandomAnonymousName(
  options: {
    useBasketballTerms?: boolean;
    includeNumbers?: boolean;
    maxLength?: number;
  } = {}
): string {
  const { useBasketballTerms = true, includeNumbers = true, maxLength = 20 } = options;

  // Choose which noun pool to use
  const nounPool = useBasketballTerms ? BASKETBALL_TERMS : NOUNS;

  // Get random adjective and noun
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = nounPool[Math.floor(Math.random() * nounPool.length)];

  // Generate base name
  let name = `${adjective}${noun}`;

  // Add random number if requested
  if (includeNumbers) {
    const number = Math.floor(Math.random() * 999) + 1;
    name = `${name}${number}`;
  }

  // Truncate if too long
  if (name.length > maxLength) {
    name = name.substring(0, maxLength);
  }

  return name;
}

/**
 * Generate multiple unique random names
 *
 * @param count - Number of names to generate
 * @param options - Configuration options for name generation
 * @returns Array of unique random names
 */
export function generateMultipleRandomNames(
  count: number,
  options: {
    useBasketballTerms?: boolean;
    includeNumbers?: boolean;
    maxLength?: number;
  } = {}
): string[] {
  const names = new Set<string>();

  while (names.size < count) {
    const name = generateRandomAnonymousName(options);
    names.add(name);
  }

  return Array.from(names);
}

/**
 * Generate a random anonymous name with fallback options
 *
 * This function tries to generate a name that's not already in use
 * by checking against existing names in the database.
 *
 * @param existingNames - Array of existing names to avoid duplicates
 * @param options - Configuration options for name generation
 * @returns A unique random anonymous name
 */
export function generateUniqueRandomName(
  existingNames: string[] = [],
  options: {
    useBasketballTerms?: boolean;
    includeNumbers?: boolean;
    maxLength?: number;
    maxAttempts?: number;
  } = {}
): string {
  const { maxAttempts = 10 } = options;
  const existingSet = new Set(existingNames.map(name => name.toLowerCase()));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const name = generateRandomAnonymousName(options);

    if (!existingSet.has(name.toLowerCase())) {
      return name;
    }
  }

  // If we can't generate a unique name, add timestamp
  const baseName = generateRandomAnonymousName(options);
  const timestamp = Date.now().toString().slice(-4);
  return `${baseName}${timestamp}`;
}

// Export some example names for testing
export const EXAMPLE_NAMES = [
  'AmazingDunk42',
  'EpicShot789',
  'LegendaryFan123',
  'BrilliantPlayer456',
  'AwesomeHoops321',
  'FantasticBasket654',
  'IncredibleCourt987',
  'MagnificentGame147',
  'OutstandingPlay258',
  'PhenomenalScore369',
];
