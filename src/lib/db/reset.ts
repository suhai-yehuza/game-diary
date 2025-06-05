import { sql } from 'drizzle-orm';

import { dbLogger } from '@/lib/logger';

import { db } from './index';
export async function resetDatabase() {
  dbLogger.info('Starting database reset...');

  try {
    // Drop all tables
    dbLogger.info('Dropping all tables...');
    await db.execute(sql`
      DROP TABLE IF EXISTS 
        game_logs,
        game_ratings,
        comments,
        reactions,
        friendships,
        nba_player_stats,
        game_stats,
        nba_players,
        nba_games,
        teams,
        seasons,
        users
      CASCADE;
    `);

    dbLogger.info('Creating tables...');

    // Create tables in the correct order (respecting foreign key constraints)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        emailAddress VARCHAR(255) NOT NULL,
        imageUrl VARCHAR(255),
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS seasons (
        id INTEGER PRIMARY KEY,
        year INTEGER NOT NULL,
        displayYear VARCHAR(255) NOT NULL,
        startDate TIMESTAMP WITH TIME ZONE NOT NULL,
        endDate TIMESTAMP WITH TIME ZONE NOT NULL,
        isCurrent BOOLEAN DEFAULT false,
        isPlayoffs BOOLEAN DEFAULT false,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        city VARCHAR(255),
        state VARCHAR(255),
        country VARCHAR(255),
        conference VARCHAR(255),
        division VARCHAR(255),
        logoUrl VARCHAR(255),
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nba_games (
        id VARCHAR(255) PRIMARY KEY,
        league VARCHAR(255) NOT NULL,
        season INTEGER REFERENCES seasons(id),
        season INTEGER NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        homeTeamId VARCHAR(255) REFERENCES teams(id),
        awayTeamId VARCHAR(255) REFERENCES teams(id),
        status JSONB,
        stage INTEGER,
        periods JSONB,
        arena JSONB,
        teams JSONB,
        scores JSONB,
        officials JSONB,
        "timesTied" INTEGER,
        "leadChanges" INTEGER,
        nugget TEXT,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nba_players (
        id VARCHAR(255) PRIMARY KEY,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        birth JSONB,
        nba JSONB,
        height JSONB,
        weight JSONB,
        college VARCHAR(255),
        affiliation VARCHAR(255),
        jersey VARCHAR(10),
        active BOOLEAN,
        pos VARCHAR(10),
        "seasonsActive" JSONB,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS game_stats (
        id VARCHAR(255) PRIMARY KEY,
        gameId VARCHAR(255) REFERENCES nba_games(id),
        homeTeamId VARCHAR(255) REFERENCES teams(id),
        awayTeamId VARCHAR(255) REFERENCES teams(id),
        homeTeamScore INTEGER,
        awayTeamScore INTEGER,
        home_fgm INTEGER,
        home_fga INTEGER,
        home_fgp DECIMAL,
        home_ftm INTEGER,
        home_fta INTEGER,
        home_ftp DECIMAL,
        home_tpm INTEGER,
        home_tpa INTEGER,
        home_tpp DECIMAL,
        home_off_reb INTEGER,
        home_defReb INTEGER,
        home_totReb INTEGER,
        home_assists INTEGER,
        home_steals INTEGER,
        home_blocks INTEGER,
        home_turnovers INTEGER,
        home_pFouls INTEGER,
        away_fgm INTEGER,
        away_fga INTEGER,
        away_fgp DECIMAL,
        away_ftm INTEGER,
        away_fta INTEGER,
        away_ftp DECIMAL,
        away_tpm INTEGER,
        away_tpa INTEGER,
        away_tpp DECIMAL,
        away_off_reb INTEGER,
        away_defReb INTEGER,
        away_totReb INTEGER,
        away_assists INTEGER,
        away_steals INTEGER,
        away_blocks INTEGER,
        away_turnovers INTEGER,
        away_pFouls INTEGER,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nba_player_stats (
        id VARCHAR(255) PRIMARY KEY,
        gameId VARCHAR(255) REFERENCES nba_games(id),
        playerId VARCHAR(255) REFERENCES nba_players(id),
        teamId VARCHAR(255) REFERENCES teams(id),
        points INTEGER,
        min VARCHAR(10),
        fgm INTEGER,
        fga INTEGER,
        fgp DECIMAL,
        ftm INTEGER,
        fta INTEGER,
        ftp DECIMAL,
        tpm INTEGER,
        tpa INTEGER,
        tpp DECIMAL,
        off_reb INTEGER,
        defReb INTEGER,
        totReb INTEGER,
        assists INTEGER,
        steals INTEGER,
        blocks INTEGER,
        turnovers INTEGER,
        pFouls INTEGER,
        plusMinus INTEGER,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_logs (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) REFERENCES users(id),
        gameId VARCHAR(255) REFERENCES nba_games(id),
        watchedSetting VARCHAR(50),
        watchedDate TIMESTAMP WITH TIME ZONE,
        ratingForGame INTEGER,
        ratingStars VARCHAR(10),
        watchedScope VARCHAR(50),
        classification VARCHAR(50),
        notes TEXT,
        tags TEXT[],
        watchedLocation VARCHAR(255),
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS game_ratings (
        gameId VARCHAR(255) PRIMARY KEY REFERENCES nba_games(id),
        averageRating DECIMAL,
        totalRatings INTEGER,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) REFERENCES users(id),
        parentId VARCHAR(255) NOT NULL,
        parentType VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS reactions (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) REFERENCES users(id),
        targetId VARCHAR(255) NOT NULL,
        targetType VARCHAR(50) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS friendships (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) REFERENCES users(id),
        friendId VARCHAR(255) REFERENCES users(id),
        status VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    dbLogger.info('Database reset completed successfully!');
  } catch (error) {
    dbLogger.error('Error resetting database:', error);
    throw error;
  }
}

// Run the reset if this file is executed directly
if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      dbLogger.error('Failed to reset database:', error);
      process.exit(1);
    });
}
