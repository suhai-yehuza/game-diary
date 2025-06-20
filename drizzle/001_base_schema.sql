-- Migration number: 0000
-- Description: Initial schema setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_versions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  checksum VARCHAR(64) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  error_message TEXT,
  rollback_script TEXT,
  rollback_executed BOOLEAN DEFAULT false
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name);

-- First, create the users table since it's referenced by other tables
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  emailAddress VARCHAR(255) NOT NULL,
  imageUrl VARCHAR(255),
  "inboundFriendshipIds" TEXT[] DEFAULT '{}',
  "outboundFriendshipIds" TEXT[] DEFAULT '{}',
  banned BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  password_enabled BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  email_verification_strategy VARCHAR(50),
  external_id VARCHAR(255),
  external_accounts JSONB DEFAULT '[]',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Then create other tables that don't have foreign key dependencies
CREATE TABLE IF NOT EXISTS seasons (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  displayYear VARCHAR(255) NOT NULL,
  startDate TIMESTAMP WITH TIME ZONE NOT NULL,
  endDate TIMESTAMP WITH TIME ZONE NOT NULL,
  isCurrent BOOLEAN DEFAULT false,
  isPlayoffs BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
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
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create tables that depend on seasons and teams
CREATE TABLE IF NOT EXISTS nba_games (
  id VARCHAR(255) PRIMARY KEY,
  league VARCHAR(255) NOT NULL,
  season INTEGER NOT NULL REFERENCES seasons(id),
  date JSONB NOT NULL,
  homeTeamId VARCHAR(255) REFERENCES teams(id),
  awayTeamId VARCHAR(255) REFERENCES teams(id),
  status JSONB,
  stage INTEGER,
  periods JSONB,
  arena JSONB,
  teams JSONB,
  scores JSONB,
  officials JSONB,
  timesTied INTEGER,
  leadChanges INTEGER,
  nugget TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS nba_players (
  id VARCHAR(255) PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255) NOT NULL,
  birth JSONB,
  nba JSONB,
  height JSONB,
  weight JSONB,
  college VARCHAR(255),
  affiliation VARCHAR(255),
  jersey VARCHAR(10),
  active BOOLEAN,
  pos VARCHAR(10),
  seasons_active JSONB,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create tables that depend on nba_games and teams
CREATE TABLE IF NOT EXISTS game_stats (
  id VARCHAR(255) PRIMARY KEY,
  gameId VARCHAR(255) REFERENCES nba_games(id),
  homeTeamId VARCHAR(255) REFERENCES teams(id),
  awayTeamId VARCHAR(255) REFERENCES teams(id),
  homeTeamScore INTEGER,
  awayTeamScore INTEGER,
  "homeFgm" INTEGER,
  "homeFga" INTEGER,
  "homeFgp" DECIMAL,
  "homeFtm" INTEGER,
  "homeFta" INTEGER,
  "homeFtp" DECIMAL,
  "homeTpm" INTEGER,
  "homeTpa" INTEGER,
  "homeTpp" DECIMAL,
  "homeOffReb" INTEGER,
  "homeDefReb" INTEGER,
  "homeTotReb" INTEGER,
  "homeAssists" INTEGER,
  "homeSteals" INTEGER,
  "homeBlocks" INTEGER,
  "homeTurnovers" INTEGER,
  "homePFouls" INTEGER,
  "awayFgm" INTEGER,
  "awayFga" INTEGER,
  "awayFgp" DECIMAL,
  "awayFtm" INTEGER,
  "awayFta" INTEGER,
  "awayFtp" DECIMAL,
  "awayTpm" INTEGER,
  "awayTpa" INTEGER,
  "awayTpp" DECIMAL,
  "awayOffReb" INTEGER,
  "awayDefReb" INTEGER,
  "awayTotReb" INTEGER,
  "awayAssists" INTEGER,
  "awaySteals" INTEGER,
  "awayBlocks" INTEGER,
  "awayTurnovers" INTEGER,
  "awayPFouls" INTEGER,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS nba_player_stats (
  id VARCHAR(255) PRIMARY KEY,
  gameId VARCHAR(255) REFERENCES nba_games(id),
  playerId VARCHAR(255) REFERENCES nba_players(id),
  teamId VARCHAR(255) REFERENCES teams(id),
  points INTEGER,
  minutes VARCHAR(10),
  "fieldGoalsMade" INTEGER,
  "fieldGoalsAttempted" INTEGER,
  "fieldGoalPercentage" DECIMAL,
  "freeThrowsMade" INTEGER,
  "freeThrowsAttempted" INTEGER,
  "freeThrowPercentage" DECIMAL,
  "threePointersMade" INTEGER,
  "threePointersAttempted" INTEGER,
  "threePointPercentage" DECIMAL,
  "offensiveRebounds" INTEGER,
  "defensiveRebounds" INTEGER,
  "totalRebounds" INTEGER,
  assists INTEGER,
  steals INTEGER,
  blocks INTEGER,
  turnovers INTEGER,
  fouls INTEGER,
  plusMinus INTEGER,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create tables that depend on users and nba_games
CREATE TABLE IF NOT EXISTS game_logs (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) REFERENCES users(id),
  "gameId" VARCHAR(255) REFERENCES nba_games(id),
  "ratingForGame" INTEGER NOT NULL,
  "watchedSetting" VARCHAR(50) NOT NULL,
  "watchedScope" VARCHAR(50) NOT NULL,
  "classification" VARCHAR(50) NOT NULL,
  "watchedDate" TIMESTAMP WITH TIME ZONE,
  "watchedLocation" VARCHAR(255),
  notes TEXT,
  tags TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS game_ratings (
  "gameId" VARCHAR(255) PRIMARY KEY REFERENCES nba_games(id),
  "averageRating" DECIMAL,
  "totalRatings" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) REFERENCES users(id),
  parentId VARCHAR(255) NOT NULL,
  parentType VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS reactions (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) REFERENCES users(id),
  targetId VARCHAR(255) NOT NULL,
  targetType VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS friendships (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) REFERENCES users(id),
  friendId VARCHAR(255) REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE DEFAULT NULL
); 