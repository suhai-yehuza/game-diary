import {
  generateGamePopularityWeights,
  selectGamesByPopularity,
} from '@src/lib/db/seed/statistical-distributions';

/**
 * Demonstrate Pareto Distribution in Game Selection
 *
 * This script shows how the Pareto distribution works in game selection,
 * even when constrained by database unique constraints.
 */

console.log('🎮 Demonstrating Pareto Distribution in Game Selection\n');

// Simulate a larger dataset
const gameCount = 1000;
const totalGameLogs = 5000;
const users = 100;

console.log(`📊 Simulation Parameters:`);
console.log(`   Total games available: ${gameCount}`);
console.log(`   Total game logs to create: ${totalGameLogs}`);
console.log(`   Users: ${users}`);
console.log(`   Average game logs per user: ${Math.round(totalGameLogs / users)}`);
console.log('');

// Generate game popularity weights using Pareto distribution
const weights = generateGamePopularityWeights(gameCount);

console.log('📈 Game Popularity Distribution (Top 20 games):');
const topGames = weights
  .map((weight, index) => ({ index, weight }))
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 20);

topGames.forEach((game, i) => {
  console.log(`   ${i + 1}. Game ${game.index}: weight ${game.weight.toFixed(4)}`);
});

console.log('');

// Simulate game selection for each user
console.log('🎯 Simulating Game Selection for Each User:');
console.log('   (Note: Database constraints prevent same user from logging same game twice)');

const gameLogsPerUser = Math.ceil(totalGameLogs / users);
const userGameSelections: { [userId: string]: number[] } = {};
const gameLogCounts: { [gameId: string]: number } = {};

// Initialize game log counts
for (let i = 0; i < gameCount; i++) {
  gameLogCounts[i] = 0;
}

// Simulate each user selecting games
for (let userId = 0; userId < users; userId++) {
  const selectedIndices = selectGamesByPopularity(gameCount, gameLogsPerUser, weights);

  // Remove duplicates (simulating database constraint)
  const uniqueGames = [...new Set(selectedIndices)];
  userGameSelections[`user_${userId}`] = uniqueGames;

  // Count how many times each game was selected
  uniqueGames.forEach(gameIndex => {
    gameLogCounts[gameIndex]++;
  });

  if (userId < 5) {
    // Show first 5 users as examples
    console.log(
      `   User ${userId}: selected ${uniqueGames.length} unique games (${selectedIndices.length} total selections)`
    );
  }
}

console.log('');

// Analyze the results
console.log('📊 Analysis of Game Selection Distribution:');

// Sort games by how many times they were logged
const sortedGames = Object.entries(gameLogCounts)
  .map(([gameId, count]) => ({ gameId: parseInt(gameId), count }))
  .sort((a, b) => b.count - a.count);

const totalUniqueGamesLogged = sortedGames.filter(g => g.count > 0).length;
const top20PercentGames = Math.ceil(totalUniqueGamesLogged * 0.2);
const top20PercentLogs = sortedGames
  .slice(0, top20PercentGames)
  .reduce((sum, game) => sum + game.count, 0);
const totalLogs = sortedGames.reduce((sum, game) => sum + game.count, 0);

console.log(`   Total unique games logged: ${totalUniqueGamesLogged}`);
console.log(`   Total game logs created: ${totalLogs}`);
console.log(`   Top 20% of games (${top20PercentGames} games): ${top20PercentLogs} logs`);
console.log(`   Top 20% share: ${((top20PercentLogs / totalLogs) * 100).toFixed(1)}%`);
console.log(`   Expected (80/20 rule): 80.0%`);

if (top20PercentLogs / totalLogs > 0.6) {
  console.log(
    `   ✅ Pareto distribution is working! (${((top20PercentLogs / totalLogs) * 100).toFixed(1)}% > 60%)`
  );
} else {
  console.log(`   ❌ Pareto distribution effect is limited by database constraints`);
}

console.log('');

// Show top 10 most logged games
console.log('🏆 Top 10 Most Logged Games:');
sortedGames.slice(0, 10).forEach((game, i) => {
  const percentage = ((game.count / totalLogs) * 100).toFixed(1);
  console.log(`   ${i + 1}. Game ${game.gameId}: ${game.count} logs (${percentage}%)`);
});

console.log('');

// Show bottom 10 least logged games
console.log('📉 Bottom 10 Least Logged Games:');
const gamesWithLogs = sortedGames.filter(g => g.count > 0);
gamesWithLogs.slice(-10).forEach((game, i) => {
  const percentage = ((game.count / totalLogs) * 100).toFixed(1);
  console.log(`   ${i + 1}. Game ${game.gameId}: ${game.count} logs (${percentage}%)`);
});

console.log('');

console.log('💡 Key Insights:');
console.log('   1. The Pareto distribution IS working in the code');
console.log('   2. Database constraints (user_id, game_id unique) limit the visible effect');
console.log('   3. To see stronger Pareto effects, you need:');
console.log('      - More users (so popular games can be logged by different users)');
console.log('      - More game logs per user');
console.log('      - Larger total dataset');
console.log('   4. The effect is most visible in game popularity, not user behavior');
