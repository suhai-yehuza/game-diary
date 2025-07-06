import {
  generateGamePopularityWeights,
  selectGamesByPopularity,
} from '@src/lib/db/seed/statistical-distributions';

/**
 * Debug Pareto Distribution Weights
 *
 * This script shows exactly what weights are being generated and why
 * the Pareto distribution isn't working as expected.
 */

console.log('🔍 Debugging Pareto Distribution Weights\n');

// Test with the same parameters as the seeding
const gameCount = 14068; // Total available games
const users = 50; // Number of users
const gameLogsPerUser = 40; // Game logs per user

console.log(`📊 Test Parameters:`);
console.log(`   Total games available: ${gameCount}`);
console.log(`   Users: ${users}`);
console.log(`   Game logs per user: ${gameLogsPerUser}`);
console.log(`   Total game logs to be created: ${users * gameLogsPerUser}`);
console.log('');

// Generate the weights
console.log('⚙️  Generating Game Popularity Weights...');
const weights = generateGamePopularityWeights(gameCount);

console.log('📈 Weight Analysis:');
console.log(`   Total weights: ${weights.length}`);
console.log(`   Sum of weights: ${weights.reduce((sum, w) => sum + w, 0).toFixed(6)}`);

// Analyze the weight distribution
const sortedWeights = [...weights].sort((a, b) => b - a);
const uniqueWeights = [...new Set(weights)].sort((a, b) => b - a);

console.log(`   Unique weight values: ${uniqueWeights.length}`);
console.log(`   Weight values: ${uniqueWeights.map(w => w.toFixed(6)).join(', ')}`);

// Show the distribution
const top20PercentCount = Math.ceil(gameCount * 0.2);
const bottom80PercentCount = gameCount - top20PercentCount;

console.log(
  `   Top 20% games (${top20PercentCount} games): weight ${uniqueWeights[0]?.toFixed(6) || 'N/A'}`
);
console.log(
  `   Bottom 80% games (${bottom80PercentCount} games): weight ${uniqueWeights[1]?.toFixed(6) || 'N/A'}`
);

console.log('');

// Test the selection process
console.log('🎯 Testing Game Selection Process...');

// Simulate multiple selections to see the distribution
const totalSelections = 10000;
const selections: number[] = [];

for (let i = 0; i < totalSelections; i++) {
  const selectedIndices = selectGamesByPopularity(gameCount, 1, weights);
  selections.push(selectedIndices[0]);
}

// Count selections for each game
const gameSelectionCounts = new Array(gameCount).fill(0);
selections.forEach(index => {
  gameSelectionCounts[index]++;
});

// Sort games by selection count
const gameStats = gameSelectionCounts
  .map((count, index) => ({ index, count, weight: weights[index] }))
  .sort((a, b) => b.count - a.count);

const top20PercentGames = Math.ceil(gameCount * 0.2);
const top20PercentSelections = gameStats
  .slice(0, top20PercentGames)
  .reduce((sum, game) => sum + game.count, 0);

console.log(`📊 Selection Results:`);
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
  const percentage = ((game.count / totalSelections) * 100).toFixed(3);
  console.log(
    `   ${i + 1}. Game ${game.index}: ${game.count} selections (${percentage}%) - weight: ${game.weight.toFixed(6)}`
  );
});

console.log('');

// Show bottom 10 least selected games
console.log('📉 Bottom 10 Least Selected Games:');
gameStats.slice(-10).forEach((game, i) => {
  const percentage = ((game.count / totalSelections) * 100).toFixed(3);
  console.log(
    `   ${gameStats.length - 9 + i}. Game ${game.index}: ${game.count} selections (${percentage}%) - weight: ${game.weight.toFixed(6)}`
  );
});

console.log('');

// Show the actual weight distribution
console.log('⚖️  Weight Distribution Analysis:');
const weightCounts = new Map<number, number>();
weights.forEach(weight => {
  weightCounts.set(weight, (weightCounts.get(weight) || 0) + 1);
});

weightCounts.forEach((count, weight) => {
  const percentage = ((count / gameCount) * 100).toFixed(1);
  console.log(`   Weight ${weight.toFixed(6)}: ${count} games (${percentage}%)`);
});

console.log('');

// Show the problem
console.log('🚨 Problem Analysis:');
console.log('   The current implementation creates a DISCRETE 80/20 split:');
console.log('   - 20% of games get exactly the same high weight');
console.log('   - 80% of games get exactly the same low weight');
console.log('   - This creates a "step function" instead of a smooth Pareto distribution');
console.log('');
console.log('   In a true Pareto distribution:');
console.log('   - Each game should have a different weight based on its rank');
console.log('   - The weights should follow a continuous power law');
console.log('   - This would create a smoother, more realistic distribution');
console.log('');
console.log('💡 Solution:');
console.log('   We need to modify generateGamePopularityWeights to create');
console.log('   a continuous Pareto distribution instead of a discrete split.');
