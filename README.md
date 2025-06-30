# 🏀 Game Diary

**Your personal space to track and share your pro game watching experiences**

A modern, full-stack web application for NBA fans to log their game-watching experiences, connect with friends, and analyze game statistics. Built with Next.js 14, TypeScript, and GraphQL.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![GraphQL](https://img.shields.io/badge/GraphQL-16.10-e10098?style=flat-square&logo=graphql)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🎯 Core Features

- **Game Logging**: Track your NBA game watching experiences with ratings, notes, and watch settings
- **User Profiles**: Personalized profiles with game logs, statistics, and social features
- **Friends System**: Connect with other fans, view friend activities, and build a community
- **Real-time NBA Data**: Live game scores, schedules, player stats, and team information
- **Search & Discovery**: Find games, users, and content with powerful search functionality
- **Comments & Reactions**: Engage with the community through comments and emoji reactions

### 📊 Analytics & Insights

- **Game Statistics**: Comprehensive NBA game stats and analytics
- **Team Performance**: Team standings, statistics, and performance tracking
- **Player Analytics**: Individual player stats and performance metrics
- **User Dashboard**: Personal analytics and watching patterns

### 🎨 User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with system preference support
- **Progressive Web App**: App-like experience with offline capabilities
- **Real-time Updates**: Live data updates and notifications
- **Intuitive Navigation**: Clean, organized interface with smooth transitions

### 🔐 Security & Admin

- **Authentication**: Secure user authentication with Clerk
- **Admin Dashboard**: Comprehensive admin panel for user and content management
- **Rate Limiting**: API protection with Redis-based rate limiting
- **Data Validation**: Input validation and sanitization throughout

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom components
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Apollo Client with local state

### Backend

- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Caching**: Redis with UpStash
- **Authentication**: Clerk
- **File Storage**: Integrated with Clerk for user images
- **Rate Limiting**: UpStash Rate Limiting

### Development & DevOps

- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Git Hooks**: Husky for pre-commit hooks
- **Deployment**: Vercel with preview deployments
- **Monitoring**: Built-in analytics and error tracking
- **Docker**: Containerized development environment

### External APIs

- **NBA Data**: RapidAPI for live NBA statistics and game data
- **Real-time Updates**: Server-sent events for live data

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- pnpm 8.x or higher
- PostgreSQL database (Neon recommended)
- Redis instance (UpStash recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/game-diary.git
cd game-diary
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."  # From Clerk Dashboard
CLERK_SECRET_KEY="sk_test_..."                   # From Clerk Dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"         # Custom sign-in page
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"         # Custom sign-up page

# Redis (UpStash)
UPSTASH_REDIS_REST_URL="https://..."             # From UpStash Dashboard
UPSTASH_REDIS_REST_TOKEN="..."                   # From UpStash Dashboard

# NBA API (RapidAPI)
RAPIDAPI_KEY="your_rapidapi_key"                 # From RapidAPI Dashboard
RAPIDAPI_HOST="api-nba-v1.p.rapidapi.com"        # NBA API Host

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com,admin2@example.com"  # Admin user emails

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"      # Development URL
NODE_ENV="development"                           # Environment
```

### 4. Database Setup

```bash
# Generate database schema
pnpm db:generate

# Run migrations
pnpm db:migrate:dev

# Seed the database (optional)
pnpm db:seed:dev
```

### Database Migrations

The application uses a robust migration system with version tracking, rollback support, and order verification:

#### Migration Features

- **Version Tracking**: Each migration is tracked in the `migration_versions` table
- **Checksum Verification**: Migrations are verified using SHA-256 checksums
- **Order Enforcement**: Migrations must be run in the correct order
- **Transaction Support**: Each migration runs in a transaction
- **Rollback Support**: Migrations can be rolled back individually or in batches

#### Migration Commands

```bash
# Run migrations
pnpm db:migrate          # Run all pending migrations
pnpm db:migrate:dev      # Run migrations in development
pnpm db:migrate:prod     # Run migrations in production

# 00
> pnpm db:generate
> pnpm db:migrate:dev
> pnpm db:setup:dev

# 01
> tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- \
  --batchSize=10 \
  --concurrency=10 \
  --seasons=2024 \
  --resetDb=true \
  --skipExternalDb=false \
  --skipApplicationDb=true \
  --enableMonitoring=true \
  --aggregate-output

# 02
> tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- \
  --batchSize=10 \
  --concurrency=10 \
  --resetDb=false \
  --seasons=2024 \
  --skipExternalDb=true \
  --skipApplicationDb=false \
  --enableMonitoring=true \
  --aggregate-output

# 03
> tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- \
  --batchSize=10 \
  --concurrency=10 \
  --seasons=2015,2016,2017,2018,2019,2020,2021,2022,2023 \
  --resetDb=false \
  --skipExternalDb=false \
  --skipApplicationDb=true \
  --appendingData=true \
  --enableMonitoring=true \
  --aggregate-output

# 04 Nightly runs
> tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- \
  --batchSize=10 \
  --concurrency=10 \
  --seasons=<currentSeason> \
  --resetDb=false \
  --skipExternalDb=false \
  --skipApplicationDb=true \
  --appendingData=true \
  --enableMonitoring=true \
  --aggregate-output

# Rollback migrations
pnpm db:migrate:rollback           # Rollback last migration
pnpm db:migrate:rollback 3         # Rollback last 3 migrations
pnpm db:migrate:rollback:dev       # Rollback in development
pnpm db:migrate:rollback:prod      # Rollback in production

# Reset database and run migrations
pnpm db:migrate:reset              # Reset and run all migrations
pnpm db:migrate:reset:dev          # Reset and run in development
pnpm db:migrate:reset:prod         # Reset and run in production
```

#### Migration Safety Features

- **Duplicate Prevention**: Migrations can only be run once
- **Modification Detection**: Modified migrations are detected via checksums
- **Error Handling**: Failed migrations are recorded with error messages
- **Execution Tracking**: Migration execution time and status are tracked
- **Rollback Support**: Each migration can include a rollback script

### 5. Generate GraphQL Types

```bash
pnpm codegen
```

### 6. Start Development Server

```bash
pnpm dev

DEBUG=* pnpm dev

pnpm test:e2e # Run end-to-end tests (auto-cleanup)
pnpm test:e2e:ui # Run e2e tests with interactive UI (keeps server running for debugging)
pnpm test:e2e:with-seed # With database seeding (if needed)
pnpm playwright test --reporter=line # Directly run with playwright bin

pnpm exec playwright show-report # Show test report
```

### 7. Development Workflow

```bash
# Start development server
pnpm dev

# Run tests
pnpm test              # Run unit tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# Code quality
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix linting issues
pnpm format            # Format code with Prettier
pnpm typecheck         # Type checking
pnpm fix               # Run all fixes (lint, format, typecheck)

# Database management
pnpm db:generate       # Generate database schema
pnpm db:migrate:dev    # Run migrations
pnpm db:seed:dev       # Seed database
pnpm db:studio         # Open Drizzle Studio

# GraphQL
pnpm codegen           # Generate GraphQL types
pnpm codegen:watch     # Watch for GraphQL changes
```

### 8. Dependency Management

The project uses a comprehensive dependency management system with automated updates, security checks, and version control.

#### Manual Dependency Management

```bash
# Check for outdated dependencies
pnpm deps:check        # List outdated packages
pnpm deps:audit        # Security audit
pnpm deps:fix          # Fix security issues
pnpm deps:clean        # Clean pnpm store
pnpm deps:interactive  # Interactive update
pnpm deps:manage       # Advanced dependency management
```

The `deps:manage` script provides an interactive way to:

- View outdated packages grouped by type
- Update dependencies to their latest versions
- Automatically update package.json
- Run post-update checks

#### Automated Updates

The project uses two automated update systems:

1. **Renovate Bot**

   - Weekly automated updates
   - Grouped updates by package type
   - Security vulnerability alerts
   - Automatic merging of safe updates
   - Configuration in `renovate.json`

2. **GitHub Actions**
   - Weekly dependency checks
   - Automated PR creation
   - Comprehensive testing
   - Security audits
   - Bundle size checks
   - Configuration in `.github/workflows/dependency-updates.yml`

#### Update Process

1. **Weekly Updates**

   - Renovate and GitHub Actions run weekly
   - Updates are grouped by package type
   - Security updates are prioritized

2. **Update Checks**

   - Type checking
   - Linting
   - Unit tests
   - E2E tests
   - Security audit
   - Bundle size check

3. **Update Workflow**
   ```mermaid
   graph TD
     A[Check Dependencies] --> B{Updates Available?}
     B -->|Yes| C[Create PR]
     B -->|No| D[End]
     C --> E[Run Tests]
     E --> F{Tests Pass?}
     F -->|Yes| G[Auto-merge]
     F -->|No| H[Manual Review]
   ```

#### Security Features

- Regular security audits
- Vulnerability alerts
- Automatic security updates
- Bundle size monitoring
- Type checking and linting

#### Version Control

- Exact versions in package.json
- Lockfile maintenance
- Version grouping
- Update tracking
- Rollback support

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard pages
│   ├── nba/                  # NBA-specific pages
│   ├── protected/            # Protected user areas
│   ├── sports/               # Sports category pages
│   ├── styles/               # Global styles
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── features/             # Feature-specific components
│   │   ├── games/            # Game-related components
│   │   ├── friends/          # Friend system components
│   │   └── notifications/    # Notification components
│   ├── layout/               # Layout components
│   ├── common/               # Reusable components
│   ├── providers/            # Context providers
│   └── ui/                   # UI design system
├── contexts/                 # React contexts
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
│   ├── db/                   # Database configuration
│   │   ├── migrations/       # Database migrations
│   │   │   ├── base/        # Core schema migrations
│   │   │   ├── feature/     # Feature-specific migrations
│   │   │   └── triggers/    # Database triggers
│   │   ├── schema/          # Database schema definitions
│   │   └── seed/            # Database seeding scripts
│   ├── graphql/              # GraphQL schema & resolvers
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── validations/          # Validation schemas
└── styles/                   # Additional styles
```

### Component Architecture

The application follows a **feature-based component organization**:

- **Feature Components** (`src/components/features/`): Domain-specific components grouped by feature
- **Layout Components** (`src/components/layout/`): Header, footer, navigation
- **Common Components** (`src/components/common/`): Reusable components across features
- **UI Components** (`src/components/ui/`): Base design system components

## 🔧 Development Scripts

> 📚 **For comprehensive script documentation, see [SCRIPTS.md](./SCRIPTS.md)**

### Quick Reference

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build production bundle
pnpm start                  # Start production server

# Testing
pnpm test:e2e:fast         # Fast e2e tests (Chromium only)
pnpm test:e2e:fast:timeout # Fast e2e tests with 5min timeout
pnpm test:e2e:debug        # Debug e2e test issues

# Validation
pnpm validate:soft         # Quick validation (no tests)
pnpm validate:dev          # Development validation
pnpm validate              # Full validation with all tests

# Database
pnpm db:setup              # Setup database
pnpm db:migrate            # Run migrations
pnpm db:studio             # Open database studio
```

### Script Categories

- **🧪 E2E Testing**: Browser testing, responsive design, cross-browser compatibility
- **✅ Validation**: Code quality, type checking, linting, formatting
- **🗄 Database**: Setup, migrations, seeding, management
- **🛠 Development**: Build, dev server, code generation
- **🔧 Utilities**: Dependencies, environment, analysis
- **🆘 Helpers**: Advanced script functions and debugging

### Key Features

- **Optimized Scripts**: 85% reduction in duplication using helper functions
- **Timeout Protection**: Prevents hanging tests with configurable timeouts
- **Comprehensive Coverage**: E2E tests across all major browsers and devices
- **Debugging Tools**: Built-in debugging scripts for troubleshooting
- **Modular Design**: Reusable helper functions for custom workflows

See [SCRIPTS.md](./SCRIPTS.md) for complete documentation of all 100+ available scripts.

## 🗄 Database Migrations

### Migration Structure

The project uses a structured approach to database migrations:

```
src/lib/db/migrations/
├── base/                           # Core schema migrations
│   ├── YYYYMMDD_N_description.sql  # Migration files
│   └── meta/                       # Migration metadata
├── feature/                        # Feature-specific migrations
│   ├── YYYYMMDD_N_description.sql
│   └── meta/
└── triggers/                       # Database triggers
    ├── YYYYMMDD_N_description.sql
    └── meta/
```

### Migration Types

1. **Base Migrations** (`base/`)

   - Core schema changes
   - Table creation/modification
   - Index creation
   - Example: `20240315_1_initial_schema.sql`

   ```sql
   -- Example base migration
   CREATE TABLE users (
     id VARCHAR(255) PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE INDEX idx_users_email ON users(email);
   ```

2. **Feature Migrations** (`feature/`)

   - Feature-specific changes
   - New functionality
   - Example: `20240315_2_add_user_preferences.sql`

   ```sql
   -- Example feature migration
   CREATE TABLE user_preferences (
     userId VARCHAR(255) PRIMARY KEY REFERENCES users(id),
     theme VARCHAR(50) DEFAULT 'light',
     notifications_enabled BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Trigger Migrations** (`triggers/`)

   - Database triggers
   - Functions
   - Example: `20240315_1_add_game_ratings_trigger.sql`

   ```sql
   -- Example trigger migration
   CREATE OR REPLACE FUNCTION update_game_rating()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Trigger logic here
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER game_rating_trigger
   AFTER INSERT ON game_logs
   FOR EACH ROW
   EXECUTE FUNCTION update_game_rating();
   ```

### Migration Workflow

1. **Generate a New Migration**

   ```bash
   # For base schema changes
   pnpm migration:generate base "add new table"

   # For feature-specific changes
   pnpm migration:generate feature "add user preferences"

   # For triggers
   pnpm migration:generate trigger "add notification trigger"
   ```

2. **Edit the Migration**

   - Open the generated SQL file
   - Add your migration SQL
   - Update the meta file if needed

   ```json
   // Example meta file (20240315_1_initial_schema.json)
   {
     "version": "1.0",
     "type": "base",
     "description": "Initial database schema with core tables",
     "createdAt": "2024-03-15T00:00:00.000Z",
     "dependencies": []
   }
   ```

3. **Validate Migrations**

   ```bash
   pnpm migration:validate
   ```

   This will check for:

   - Proper file naming
   - Valid SQL syntax
   - Dependencies resolution
   - Foreign key constraints
   - Index consistency

4. **Run Migrations**

   ```bash
   # Development
   pnpm migration:reset

   # Production
   pnpm db:migrate:prod
   ```

### Best Practices

1. **Naming Convention**

   - Format: `YYYYMMDD_N_description.sql`
   - Example: `20240315_1_add_user_table.sql`
   - Use descriptive names: `20240315_2_add_user_preferences.sql`
   - Avoid generic names: `20240315_1_update.sql`

2. **Migration Files**

   - Keep migrations atomic (one logical change)

   ```sql
   -- Good: Single purpose migration
   CREATE TABLE user_preferences (
     userId VARCHAR(255) PRIMARY KEY,
     theme VARCHAR(50)
   );

   -- Bad: Multiple unrelated changes
   CREATE TABLE user_preferences (...);
   ALTER TABLE games ADD COLUMN rating INTEGER;
   CREATE INDEX idx_comments_userId ON comments(userId);
   ```

   - Use descriptive names
   - Include comments for complex changes

   ```sql
   -- Migration: Add user preferences table
   -- Purpose: Store user-specific settings
   -- Dependencies: users table must exist
   CREATE TABLE user_preferences (...);
   ```

3. **Meta Files**

   - Include dependencies

   ```json
   {
     "dependencies": ["20240315_1_initial_schema"]
   }
   ```

   - Add clear descriptions
   - Document any special requirements

   ```json
   {
     "requirements": {
       "postgresVersion": ">=14.0",
       "extensions": ["pgcrypto"]
     }
   }
   ```

4. **Version Control**

   - Commit migrations immediately after generation
   - Never modify existing migrations
   - Create new migrations for changes

   ```bash
   # Good: Create new migration
   pnpm migration:generate feature "add user_preferences_theme_column"

   # Bad: Modify existing migration
   # Don't edit 20240315_1_initial_schema.sql
   ```

5. **Testing**
   - Test migrations in development
   ```bash
   # Test migration
   pnpm migration:reset
   pnpm test:databases
   ```
   - Verify rollback procedures
   ```sql
   -- Include rollback in comments
   -- Rollback:
   -- DROP TABLE IF EXISTS user_preferences;
   ```
   - Check foreign key constraints
   ```sql
   -- Verify constraints
   SELECT * FROM information_schema.table_constraints
   WHERE constraint_type = 'FOREIGN KEY';
   ```

### Migration Scripts

```bash
# Generate new migration
pnpm migration:generate <type> <description>

# Validate migrations
pnpm migration:validate

# Reset and run all migrations
pnpm migration:reset

# Run migrations in production
pnpm db:migrate:prod
```

### Troubleshooting

1. **Migration Conflicts**

   - Use `pnpm migration:validate` to check for conflicts

   ```bash
   # Check for conflicts
   pnpm migration:validate
   ```

   - Ensure unique migration numbers

   ```bash
   # Good: Sequential numbers
   20240315_1_initial_schema.sql
   20240315_2_add_users.sql
   20240315_3_add_games.sql

   # Bad: Duplicate numbers
   20240315_1_initial_schema.sql
   20240315_1_add_users.sql  # Conflict!
   ```

   - Check dependencies in meta files

   ```json
   {
     "dependencies": ["20240315_1_initial_schema"],
     "conflicts": ["20240315_1_old_schema"] // Document known conflicts
   }
   ```

2. **Failed Migrations**

   - Check the error message

   ```bash
   # Common errors and solutions
   ERROR: relation "users" does not exist
   Solution: Check migration order and dependencies

   ERROR: duplicate key value violates unique constraint
   Solution: Check for existing data conflicts
   ```

   - Verify SQL syntax

   ```sql
   -- Good: Proper syntax
   CREATE TABLE users (
     id VARCHAR(255) PRIMARY KEY
   );

   -- Bad: Syntax error
   CREATE TABLE users
     id VARCHAR(255) PRIMARY KEY  -- Missing parentheses
   ```

   - Ensure dependencies are met

   ```sql
   -- Good: Dependencies exist
   CREATE TABLE user_preferences (
     userId VARCHAR(255) REFERENCES users(id)
   );

   -- Bad: Missing dependency
   CREATE TABLE user_preferences (
     userId VARCHAR(255) REFERENCES non_existent_table(id)
   );
   ```

3. **Rollback**

   - Create a new migration to revert changes

   ```sql
   -- Rollback migration
   DROP TABLE IF EXISTS user_preferences;
   DROP TABLE IF EXISTS user_settings;
   ```

   - Never modify existing migrations
   - Test rollback in development first

   ```bash
   # Test rollback
   pnpm migration:reset
   pnpm test:databases
   ```

4. **Common Issues and Solutions**

   a. **Foreign Key Violations**

   ```sql
   -- Problem: Orphaned records
   ERROR: insert or update on table "comments" violates foreign key constraint

   -- Solution: Add ON DELETE CASCADE
   CREATE TABLE comments (
     id VARCHAR(255) PRIMARY KEY,
     userId VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

   b. **Index Conflicts**

   ```sql
   -- Problem: Duplicate index
   ERROR: relation "idx_users_email" already exists

   -- Solution: Check existing indexes
   SELECT indexname FROM pg_indexes WHERE tablename = 'users';
   ```

   c. **Type Mismatches**

   ```sql
   -- Problem: Type mismatch
   ERROR: column "userId" is of type integer but expression is of type text

   -- Solution: Ensure consistent types
   CREATE TABLE users (
     id VARCHAR(255) PRIMARY KEY  -- Use consistent type
   );
   ```

5. **Performance Considerations**
   - Use appropriate indexes
   ```sql
   -- Good: Indexed foreign keys
   CREATE INDEX idx_comments_userId ON comments(userId);
   ```
   - Batch large changes
   ```sql
   -- Good: Batch updates
   UPDATE users SET status = 'active' WHERE id IN (SELECT id FROM temp_users);
   ```
   - Consider migration timing
   ```bash
   # Run migrations during low-traffic periods
   pnpm db:migrate:prod --time-window "02:00-04:00"
   ```

### Project-Specific Examples

1. **NBA Game Data Migrations**

   ```sql
   -- Example: Add game statistics table
   CREATE TABLE game_stats (
     id VARCHAR(255) PRIMARY KEY,
     gameId VARCHAR(255) REFERENCES games(id),
     home_team_score INTEGER NOT NULL,
     away_team_score INTEGER NOT NULL,
     home_team_fg_percentage DECIMAL(5,2),
     away_team_fg_percentage DECIMAL(5,2),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Add indexes for common queries
   CREATE INDEX idx_game_stats_gameId ON game_stats(gameId);
   CREATE INDEX idx_game_stats_scores ON game_stats(home_team_score, away_team_score);
   ```

2. **User Game Logs**

   ```sql
   -- Example: Add game watching history
   CREATE TABLE game_logs (
     id VARCHAR(255) PRIMARY KEY,
     userId VARCHAR(255) REFERENCES users(id),
     gameId VARCHAR(255) REFERENCES games(id),
     watchedLocation VARCHAR(255),
     rating_stars INTEGER CHECK (rating_stars BETWEEN 1 AND 5),
     notes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Add composite index for user's game history
   CREATE INDEX idx_game_logs_user_game ON game_logs(userId, gameId);
   ```

3. **Social Features**

   ```sql
   -- Example: Add comments and reactions
   CREATE TABLE comments (
     id VARCHAR(255) PRIMARY KEY,
     userId VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
     gameId VARCHAR(255) REFERENCES games(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     parentId VARCHAR(255) REFERENCES comments(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE reactions (
     id VARCHAR(255) PRIMARY KEY,
     userId VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
     comment_id VARCHAR(255) REFERENCES comments(id) ON DELETE CASCADE,
     emoji VARCHAR(10) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(userId, comment_id, emoji)
   );
   ```

### Performance Optimization Tips

1. **Indexing Strategies**

   ```sql
   -- Optimize game search queries
   CREATE INDEX idx_games_date_teams ON games(game_date, home_team_id, away_team_id);

   -- Optimize user activity queries
   CREATE INDEX idx_game_logs_user_date ON game_logs(userId, created_at DESC);

   -- Optimize comment threading
   CREATE INDEX idx_comments_game_parent ON comments(gameId, parentId);
   ```

2. **Batch Operations**

   ```sql
   -- Efficient batch insert
   INSERT INTO game_stats (id, gameId, home_team_score, away_team_score)
   SELECT
     gen_random_uuid()::text,
     g.id,
     g.home_score,
     g.away_score
   FROM games g
   WHERE g.stats_processed = false;

   -- Efficient batch update
   UPDATE game_logs
   SET rating_stars = new_ratings.rating
   FROM (VALUES
     ('game1', 4),
     ('game2', 5)
   ) AS new_ratings(gameId, rating)
   WHERE game_logs.gameId = new_ratings.gameId;
   ```

3. **Partitioning Large Tables**

   ```sql
   -- Partition game_logs by date
   CREATE TABLE game_logs_partitioned (
     id VARCHAR(255) NOT NULL,
     userId VARCHAR(255) NOT NULL,
     gameId VARCHAR(255) NOT NULL,
     rating_stars INTEGER,
     created_at TIMESTAMP NOT NULL
   ) PARTITION BY RANGE (created_at);

   -- Create partitions
   CREATE TABLE game_logs_2024_q1 PARTITION OF game_logs_partitioned
   FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
   ```

### Testing Strategies

1. **Migration Testing**

   ```bash
   # Test migration in isolation
   pnpm migration:test --migration=20240315_1_add_game_stats

   # Test migration with dependencies
   pnpm migration:test --migration=20240315_2_add_game_logs --with-deps

   # Test migration rollback
   pnpm migration:test --migration=20240315_1_add_game_stats --rollback
   ```

2. **Data Integrity Tests**

   ```sql
   -- Test foreign key constraints
   SELECT
     tc.table_name,
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name
   FROM information_schema.table_constraints AS tc
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY';

   -- Test unique constraints
   SELECT
     table_name,
     column_name,
     constraint_name
   FROM information_schema.constraint_column_usage
   WHERE constraint_name LIKE '%_key';
   ```

3. **Performance Testing**

   ```sql
   -- Test index usage
   EXPLAIN ANALYZE
   SELECT g.*, gs.*
   FROM games g
   JOIN game_stats gs ON g.id = gs.gameId
   WHERE g.game_date BETWEEN '2024-01-01' AND '2024-12-31';

   -- Test query performance
   EXPLAIN ANALYZE
   SELECT
     u.id,
     COUNT(gl.id) as games_watched,
     AVG(gl.rating_stars) as avg_rating
   FROM users u
   JOIN game_logs gl ON u.id = gl.userId
   GROUP BY u.id;
   ```

4. **Test Data Generation**

   ```sql
   -- Generate test data for game_logs
   INSERT INTO game_logs (id, userId, gameId, rating_stars)
   SELECT
     gen_random_uuid()::text,
     u.id,
     g.id,
     floor(random() * 5 + 1)::integer
   FROM users u
   CROSS JOIN games g
   WHERE random() < 0.1;  -- 10% of possible combinations
   ```

5. **Automated Testing Script**

   ```typescript
   // test/migrations.test.ts
   import { migrate } from '../src/lib/db/migrations/migrate';
   import { db } from '../src/lib/db';

   describe('Migrations', () => {
     beforeEach(async () => {
       await db.execute(sql`TRUNCATE TABLE game_logs CASCADE`);
     });

     it('should apply game_logs migration correctly', async () => {
       await migrate('20240315_1_add_game_logs');

       const result = await db.query.game_logs.findMany({
         where: (game_logs, { eq }) => eq(game_logs.userId, 'test_user'),
       });

       expect(result).toHaveLength(0);
     });

     it('should handle rollback correctly', async () => {
       await migrate('20240315_1_add_game_logs');
       await migrate('20240315_1_add_game_logs', { rollback: true });

       const tables = await db.execute(
         sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'game_logs'`
       );

       expect(tables).toHaveLength(0);
     });
   });
   ```

6. **Load Testing**

   ```bash
   # Test migration performance with large datasets
   pnpm migration:test --migration=20240315_1_add_game_logs --load-test --rows=1000000

   # Test concurrent access
   pnpm migration:test --migration=20240315_1_add_game_logs --concurrent-users=100
   ```

### Monitoring and Maintenance

1. **Migration Health Checks**

   ```sql
   -- Check for missing indexes
   SELECT
     t.table_name,
     c.column_name,
     c.data_type
   FROM information_schema.tables t
   JOIN information_schema.columns c ON t.table_name = c.table_name
   LEFT JOIN pg_indexes i ON i.tablename = t.table_name
   WHERE t.table_schema = 'public'
   AND i.indexname IS NULL
   AND c.column_name IN ('userId', 'gameId', 'created_at');

   -- Check for unused indexes
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0;
   ```

2. **Performance Monitoring**

   ```sql
   -- Monitor slow queries
   SELECT
     query,
     calls,
     total_time,
     mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;

   -- Monitor table sizes
   SELECT
     table_name,
     pg_size_pretty(pg_total_relation_size(table_name)) as total_size
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY pg_total_relation_size(table_name) DESC;
   ```

## 🏗 Architecture Highlights

### Type Safety

- **End-to-end TypeScript**: Strict typing from database to UI components
- **GraphQL Code Generation**: Automatic type generation from GraphQL schema
- **Schema Validation**: Zod schemas for runtime validation
- **Database Types**: Drizzle ORM with full type inference

### Performance Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component with optimizations
- **Caching Strategy**: Multi-level caching with Redis and React Query
- **Bundle Analysis**: Built-in bundle analyzer for optimization

### Developer Experience

- **Hot Reload**: Fast refresh for React components
- **Type Checking**: Real-time TypeScript checking
- **Linting**: ESLint with custom rules for code quality
- **Import Organization**: Automatic import sorting and organization
- **Circular Dependency Detection**: Automated checks for circular imports

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build Docker image
docker build -t game-diary .

# Run container
docker run -p 3000:3000 game-diary
```

### Manual Deployment

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for deployment platform
- **Clerk** for authentication infrastructure
- **Neon** for PostgreSQL hosting
- **RapidAPI** for NBA data access
- **Open Source Dashboard** for the amazing tools and libraries

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact the team at support@gamediary.app

---

**Built with ❤️ for NBA fans by fans**

### NBA-Specific Migration Examples

1. **Player Statistics**

   ```sql
   -- Track detailed player performance
   CREATE TABLE nba_player_stats (
     id VARCHAR(255) PRIMARY KEY,
     player_id VARCHAR(255) REFERENCES nba_players(id),
     gameId VARCHAR(255) REFERENCES games(id),
     team_id VARCHAR(255) REFERENCES teams(id),
     minutes_played VARCHAR(10),
     points INTEGER,
     rebounds INTEGER,
     assists INTEGER,
     steals INTEGER,
     blocks INTEGER,
     turnovers INTEGER,
     personal_fouls INTEGER,
     field_goals_made INTEGER,
     field_goals_attempted INTEGER,
     three_pointers_made INTEGER,
     three_pointers_attempted INTEGER,
     free_throws_made INTEGER,
     free_throws_attempted INTEGER,
     plusMinus INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(player_id, gameId)
   );

   -- Add performance indexes
   CREATE INDEX idx_player_stats_player_game ON nba_player_stats(player_id, gameId);
   CREATE INDEX idx_player_stats_team_game ON nba_player_stats(team_id, gameId);
   CREATE INDEX idx_player_stats_points ON nba_player_stats(points DESC);
   ```

2. **Team Matchups**

   ```sql
   -- Track team head-to-head records
   CREATE TABLE team_h2h (
     id VARCHAR(255) PRIMARY KEY,
     team1_id VARCHAR(255) REFERENCES teams(id),
     team2_id VARCHAR(255) REFERENCES teams(id),
     team1_wins INTEGER DEFAULT 0,
     team2_wins INTEGER DEFAULT 0,
     last_meeting_date TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(team1_id, team2_id)
   );

   -- Add matchup indexes
   CREATE INDEX idx_team_h2h_teams ON team_h2h(team1_id, team2_id);
   CREATE INDEX idx_team_h2h_date ON team_h2h(last_meeting_date DESC);
   ```

3. **Game Schedule and Results**

   ```sql
   -- Track game schedule and results
   CREATE TABLE nba_games (
     id VARCHAR(255) PRIMARY KEY,
     season_id VARCHAR(255) REFERENCES seasons(id),
     home_team_id VARCHAR(255) REFERENCES teams(id),
     away_team_id VARCHAR(255) REFERENCES teams(id),
     game_date TIMESTAMP NOT NULL,
     status VARCHAR(50) NOT NULL,
     home_team_score INTEGER,
     away_team_score INTEGER,
     venue VARCHAR(255),
     attendance INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Add schedule indexes
   CREATE INDEX idx_nba_games_date ON nba_games(game_date);
   CREATE INDEX idx_nba_games_teams ON nba_games(home_team_id, away_team_id);
   CREATE INDEX idx_nba_games_season ON nba_games(season_id);
   ```

### Complex Migration Scenarios

1. **Schema Evolution**

   ```sql
   -- Example: Evolving game statistics schema
   -- Step 1: Add new columns
   ALTER TABLE game_stats
   ADD COLUMN home_team_three_pointers INTEGER,
   ADD COLUMN away_team_three_pointers INTEGER;

   -- Step 2: Create temporary table for data migration
   CREATE TABLE game_stats_new (
     id VARCHAR(255) PRIMARY KEY,
     gameId VARCHAR(255) REFERENCES games(id),
     home_team_score INTEGER NOT NULL,
     away_team_score INTEGER NOT NULL,
     home_team_three_pointers INTEGER,
     away_team_three_pointers INTEGER,
     home_team_fg_percentage DECIMAL(5,2),
     away_team_fg_percentage DECIMAL(5,2),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Step 3: Migrate data
   INSERT INTO game_stats_new
   SELECT
     id,
     gameId,
     home_team_score,
     away_team_score,
     COALESCE(home_team_three_pointers, 0),
     COALESCE(away_team_three_pointers, 0),
     home_team_fg_percentage,
     away_team_fg_percentage,
     created_at
   FROM game_stats;

   -- Step 4: Swap tables
   ALTER TABLE game_stats RENAME TO game_stats_old;
   ALTER TABLE game_stats_new RENAME TO game_stats;

   -- Step 5: Drop old table (after verification)
   DROP TABLE game_stats_old;
   ```

2. **Data Transformation**

   ```sql
   -- Example: Transforming game ratings
   -- Step 1: Create new rating system
   CREATE TYPE rating_type AS ENUM ('game_quality', 'entertainment', 'competitiveness');

   CREATE TABLE game_ratings_new (
     id VARCHAR(255) PRIMARY KEY,
     gameId VARCHAR(255) REFERENCES games(id),
     userId VARCHAR(255) REFERENCES users(id),
     rating_type rating_type NOT NULL,
     rating_value INTEGER CHECK (rating_value BETWEEN 1 AND 5),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(gameId, userId, rating_type)
   );

   -- Step 2: Transform existing data
   INSERT INTO game_ratings_new (id, gameId, userId, rating_type, rating_value, created_at)
   SELECT
     gen_random_uuid()::text,
     gameId,
     userId,
     'game_quality'::rating_type,
     rating_stars,
     created_at
   FROM game_logs
   WHERE rating_stars IS NOT NULL;

   -- Step 3: Verify data
   SELECT
     COUNT(*) as total_ratings,
     AVG(rating_value) as avg_rating
   FROM game_ratings_new;

   -- Step 4: Swap tables
   ALTER TABLE game_ratings RENAME TO game_ratings_old;
   ALTER TABLE game_ratings_new RENAME TO game_ratings;
   ```

3. **Partitioning Strategy**

   ```sql
   -- Example: Partitioning game logs by season
   -- Step 1: Create partitioned table
   CREATE TABLE game_logs_partitioned (
     id VARCHAR(255) NOT NULL,
     userId VARCHAR(255) NOT NULL,
     gameId VARCHAR(255) NOT NULL,
     rating_stars INTEGER,
     created_at TIMESTAMP NOT NULL
   ) PARTITION BY RANGE (created_at);

   -- Step 2: Create partitions for each season
   CREATE TABLE game_logs_2023_24 PARTITION OF game_logs_partitioned
   FOR VALUES FROM ('2023-10-01') TO ('2024-04-30');

   CREATE TABLE game_logs_2024_25 PARTITION OF game_logs_partitioned
   FOR VALUES FROM ('2024-10-01') TO ('2025-04-30');

   -- Step 3: Migrate data
   INSERT INTO game_logs_partitioned
   SELECT * FROM game_logs
   WHERE created_at >= '2023-10-01';

   -- Step 4: Verify data
   SELECT
     table_name,
     COUNT(*) as record_count
   FROM game_logs_partitioned
   GROUP BY table_name;
   ```

### Backup and Recovery Strategies

1. **Automated Backups**

   ```bash
   # Backup script (backup.sh)
   #!/bin/bash

   # Set variables
   BACKUP_DIR="/path/to/backups"
   DB_NAME="game_diary"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)

   # Create backup
   pg_dump -Fc $DB_NAME > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

   # Clean old backups (keep last 7 days)
   find $BACKUP_DIR -name "${DB_NAME}_*.dump" -mtime +7 -delete
   ```

2. **Point-in-Time Recovery**

   ```sql
   -- Enable WAL archiving
   ALTER SYSTEM SET archive_mode = on;
   ALTER SYSTEM SET archive_command = 'test ! -f /path/to/archive/%f && cp %p /path/to/archive/%f';

   -- Create restore point
   SELECT pg_create_restore_point('before_major_update');

   -- Recover to point in time
   -- In recovery.conf:
   restore_command = 'cp /path/to/archive/%f %p'
   recovery_target_time = '2024-03-15 10:00:00'
   ```

3. **Replication Setup**

   ```sql
   -- Primary server configuration
   ALTER SYSTEM SET wal_level = replica;
   ALTER SYSTEM SET max_wal_senders = 10;
   ALTER SYSTEM SET max_replication_slots = 10;

   -- Replica server configuration
   -- In postgresql.conf:
   hot_standby = on
   primary_conninfo = 'host=primary port=5432 user=repl password=secret'
   ```

4. **Disaster Recovery Plan**

   ```bash
   # Recovery script (recover.sh)
   #!/bin/bash

   # Set variables
   BACKUP_DIR="/path/to/backups"
   DB_NAME="game_diary"
   RECOVERY_TIME="2024-03-15 10:00:00"

   # Stop database
   pg_ctl stop -D /path/to/data

   # Restore from backup
   pg_restore -d $DB_NAME "$BACKUP_DIR/latest.dump"

   # Apply WAL archives up to recovery time
   pg_restore -d $DB_NAME --recovery-target-time="$RECOVERY_TIME" /path/to/archive

   # Start database
   pg_ctl start -D /path/to/data
   ```

5. **Monitoring and Alerts**

   ```sql
   -- Monitor backup status
   CREATE TABLE backup_logs (
     id SERIAL PRIMARY KEY,
     backup_name VARCHAR(255),
     start_time TIMESTAMP,
     end_time TIMESTAMP,
     status VARCHAR(50),
     size_bytes BIGINT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Monitor replication lag
   SELECT
     client_addr,
     state,
     sent_lsn,
     write_lsn,
     flush_lsn,
     replay_lsn,
     write_lag,
     flush_lag,
     replay_lag
   FROM pg_stat_replication;
   ```

6. **Automated Recovery Testing**

   ```bash
   # Test recovery script (test_recovery.sh)
   #!/bin/bash

   # Create test database
   createdb game_diary_test

   # Restore backup to test database
   pg_restore -d game_diary_test /path/to/backup.dump

   # Run verification queries
   psql -d game_diary_test -f verify_recovery.sql

   # Clean up
   dropdb game_diary_test
   ```
