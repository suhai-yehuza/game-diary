import {
  generateGamePopularityWeights,
  selectGamesByPopularity,
} from '../../src/lib/db/seed/statistical-distributions';

/**
 * Clarify Pareto Distribution Effect Across Users
 *
 * This script shows how the Pareto distribution should work across different users,
 * and why the database constraint doesn't prevent the Pareto effect.
 */

console.log('🎯 Clarifying Pareto Distribution Effect\n');

// Simulate a realistic scenario
const gameCount = 100;
const users = 20;
const gameLogsPerUser = 10;

console.log(`📊 Scenario:`);
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
console.log('🎮 Simulating Game Selection Across Users:');

const allSelections: number[] = [];
const userSelections: { [userId: string]: number[] } = {};

for (let userId = 0; userId < users; userId++) {
  const selectedIndices = selectGamesByPopularity(gameCount, gameLogsPerUser, weights);

  // Store all selections
  allSelections.push(...selectedIndices);
  userSelections[`user_${userId}`] = selectedIndices;

  // Show what each user selected (first 5 games)
  console.log(
    `   User ${userId}: ${selectedIndices.slice(0, 5).join(', ')}${selectedIndices.length > 5 ? '...' : ''}`
  );
}

console.log('');

// Analyze the distribution
console.log('📊 Pareto Distribution Analysis:');

// Count how many times each game was selected across all users
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

// Show top 15 most selected games
console.log('🏆 Top 15 Most Selected Games (Across All Users):');
gameStats.slice(0, 15).forEach((game, i) => {
  const percentage = ((game.count / totalSelections) * 100).toFixed(1);
  console.log(
    `   ${i + 1}. Game ${game.index}: ${game.count} selections (${percentage}%) - weight: ${game.weight.toFixed(4)}`
  );
});

console.log('');

// Show how many users logged each popular game
console.log('👥 How Many Users Logged Each Popular Game:');
gameStats.slice(0, 10).forEach((game, i) => {
  const usersWhoLoggedThisGame = Object.values(userSelections).filter(userGames =>
    userGames.includes(game.index)
  ).length;
  console.log(
    `   ${i + 1}. Game ${game.index}: ${game.count} total logs by ${usersWhoLoggedThisGame} different users`
  );
});

console.log('');

// Show database constraint effect (should be minimal)
console.log('🚫 Database Constraint Effect (Per User):');

let totalDuplicates = 0;
for (let userId = 0; userId < users; userId++) {
  const selectedIndices = userSelections[`user_${userId}`];
  const uniqueGames = [...new Set(selectedIndices)];
  const duplicates = selectedIndices.length - uniqueGames.length;
  totalDuplicates += duplicates;

  if (duplicates > 0) {
    console.log(
      `   User ${userId}: ${duplicates} duplicates (${selectedIndices.length} → ${uniqueGames.length} unique games)`
    );
  }
}

if (totalDuplicates === 0) {
  console.log(`   ✅ No duplicates across any users - database constraint has no effect!`);
} else {
  console.log(`   ⚠️  Total duplicates across all users: ${totalDuplicates}`);
  console.log(`   📊 Duplicate rate: ${((totalDuplicates / totalSelections) * 100).toFixed(1)}%`);
}

console.log('');

// Show what the Pareto effect looks like in practice
console.log('💡 How Pareto Distribution Works in Practice:');
console.log('   1. ✅ Popular games get higher weights in the selection algorithm');
console.log('   2. ✅ Different users can log the same popular games');
console.log(
  '   3. ✅ The database constraint only prevents same user from logging same game twice'
);
console.log('   4. ✅ The Pareto effect is visible in game popularity across users');
console.log('   5. ✅ Popular games will have more total logs than unpopular games');
console.log('');
console.log('🎯 Expected Result:');
console.log('   - Popular games (high weights) will be logged by many users');
console.log('   - Unpopular games (low weights) will be logged by few users');
console.log('   - This creates the 80/20 effect: 20% of games get 80% of the logs');
console.log('');
console.log('🔍 To verify Pareto is working, check:');
console.log('   - Are popular games being logged by more users?');
console.log('   - Do the most logged games match the highest weight games?');
console.log('   - Is there a concentration of logs in the top 20% of games?');
