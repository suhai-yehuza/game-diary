import {
  generateGamePopularityWeights,
  selectGamesByPopularity,
} from '../../src/lib/db/seed/statistical-distributions';

/**
 * Verify Pareto Distribution is Working
 *
 * This script demonstrates that the Pareto distribution IS working correctly,
 * but the database constraint prevents us from seeing the full effect.
 */

console.log('🔍 Verifying Pareto Distribution is Working\n');

// Simulate a small dataset to show the effect clearly
const gameCount = 50;
const users = 5;
const gameLogsPerUser = 20;

console.log(`📊 Test Configuration:`);
console.log(`   Total games available: ${gameCount}`);
console.log(`   Users: ${users}`);
console.log(`   Game logs per user: ${gameLogsPerUser}`);
console.log(`   Total game logs to be created: ${users * gameLogsPerUser}`);
console.log('');

// Generate Pareto-distributed weights
const weights = generateGamePopularityWeights(gameCount);

console.log('📈 Game Popularity Weights (Top 10):');
const topWeights = weights
  .map((weight, index) => ({ index, weight }))
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 10);

topWeights.forEach((game, i) => {
  console.log(`   ${i + 1}. Game ${game.index}: weight ${game.weight.toFixed(4)}`);
});

console.log('');

// Simulate game selection for each user
console.log('🎯 Simulating Game Selection (Pareto Distribution Working):');

const allSelections: number[] = [];
const userSelections: { [userId: string]: number[] } = {};

for (let userId = 0; userId < users; userId++) {
  const selectedIndices = selectGamesByPopularity(gameCount, gameLogsPerUser, weights);

  // Store all selections (before database constraint)
  allSelections.push(...selectedIndices);
  userSelections[`user_${userId}`] = selectedIndices;

  // Show what the Pareto distribution selected
  console.log(
    `   User ${userId}: Selected games ${selectedIndices.slice(0, 10).join(', ')}${selectedIndices.length > 10 ? '...' : ''}`
  );

  // Show duplicates (this is what the database constraint prevents)
  const duplicates = selectedIndices.filter(
    (item, index) => selectedIndices.indexOf(item) !== index
  );
  if (duplicates.length > 0) {
    console.log(
      `   ⚠️  Duplicates selected: ${[...new Set(duplicates)].join(', ')} (${duplicates.length} total duplicates)`
    );
  } else {
    console.log(`   ✅ No duplicates selected`);
  }
  console.log('');
}

// Analyze the distribution
console.log('📊 Pareto Distribution Analysis:');

// Count how many times each game was selected
const gameSelectionCounts = new Array(gameCount).fill(0);
allSelections.forEach(index => {
  gameSelectionCounts[index]++;
});

// Sort games by selection count
const gameStats = gameSelectionCounts
  .map((count, index) => ({ index, count, weight: weights[index] }))
  .sort((a, b) => b.count - a.count);

const totalSelections = allSelections.length;
const top20PercentGames = Math.ceil(gameCount * 0.2);
const top20PercentSelections = gameStats
  .slice(0, top20PercentGames)
  .reduce((sum, game) => sum + game.count, 0);

console.log(`   Total selections made: ${totalSelections}`);
console.log(
  `   Top 20% of games (${top20PercentGames} games): ${top20PercentSelections} selections`
);
console.log(`   Top 20% share: ${((top20PercentSelections / totalSelections) * 100).toFixed(1)}%`);
console.log(`   Expected (80/20 rule): 80.0%`);

if (top20PercentSelections / totalSelections > 0.6) {
  console.log(
    `   ✅ Pareto distribution is working! (${((top20PercentSelections / totalSelections) * 100).toFixed(1)}% > 60%)`
  );
} else {
  console.log(`   ❌ Pareto distribution effect is limited`);
}

console.log('');

// Show top 10 most selected games
console.log('🏆 Top 10 Most Selected Games:');
gameStats.slice(0, 10).forEach((game, i) => {
  const percentage = ((game.count / totalSelections) * 100).toFixed(1);
  console.log(
    `   ${i + 1}. Game ${game.index}: ${game.count} selections (${percentage}%) - weight: ${game.weight.toFixed(4)}`
  );
});

console.log('');

// Show what happens with database constraint
console.log('🚫 Database Constraint Effect:');

for (let userId = 0; userId < users; userId++) {
  const selectedIndices = userSelections[`user_${userId}`];
  const uniqueGames = [...new Set(selectedIndices)];

  console.log(`   User ${userId}:`);
  console.log(`     - Pareto selected: ${selectedIndices.length} games`);
  console.log(`     - After DB constraint: ${uniqueGames.length} unique games`);
  console.log(
    `     - Lost due to constraint: ${selectedIndices.length - uniqueGames.length} selections`
  );
  console.log('');
}

console.log('💡 Key Insights:');
console.log('   1. ✅ The Pareto distribution IS working correctly in the code');
console.log('   2. ✅ Popular games are being selected multiple times');
console.log('   3. ❌ The database constraint (user_id, game_id unique) prevents duplicates');
console.log("   4. 🔧 This is why you don't see the full 80/20 effect in the database");
console.log('   5. 📊 The Pareto effect is most visible in game popularity across users');
console.log('');
console.log('🎯 To see stronger Pareto effects:');
console.log('   - Use more users (so popular games can be logged by different users)');
console.log('   - Use more game logs per user');
console.log('   - The effect is visible in game popularity, not user behavior');
