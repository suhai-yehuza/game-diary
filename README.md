# 🏀 Placeholder

**Placeholder sentence or paragraph**

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
- **Testing**: Vitest (unit), Playwright (E2E) with comprehensive coverage enforcement
- **Git Hooks**: Husky for pre-commit hooks
- **Deployment**: Vercel with preview deployments
- **Monitoring**: Built-in analytics and error tracking
- **Docker**: Containerized development environment

### External APIs

- **NBA Data**: RapidAPI for live NBA statistics and game data
- **Real-time Updates**: Server-sent events for live data

## 🧪 Testing & Quality Assurance

The project implements comprehensive testing with coverage enforcement:

### Unit Testing (Vitest)

```bash
# Basic unit tests
pnpm test:unit              # Run all unit tests with coverage
pnpm test:unit:json         # Run unit tests with JSON reporter
pnpm test:watch             # Watch mode for development
pnpm test:ui                # UI mode for interactive testing

# Coverage and enforcement
pnpm test:coverage          # Run tests with coverage report
pnpm test:strict            # Run tests with verbose reporter and coverage
pnpm coverage:enforce       # Enforce coverage thresholds
pnpm pre-push:coverage      # Pre-push coverage validation
```

### E2E Testing (Playwright)

```bash
# Basic E2E tests
pnpm test:e2e:sanity        # Sanity tests (fast)
pnpm test:e2e:smoke         # Smoke tests (comprehensive)
pnpm test:e2e:critical      # Critical path tests
pnpm test:e2e:full          # Full test suite

# Specialized E2E tests
pnpm test:e2e:navigation    # Navigation tests
pnpm test:e2e:responsive    # Responsive design tests
pnpm test:e2e:cross-browser # Cross-browser tests
pnpm test:e2e:performance   # Performance tests
```

### Coverage Enforcement

The project enforces minimum coverage thresholds:

| Test Type  | Coverage Threshold | Min Test Count |
| ---------- | ------------------ | -------------- |
| Unit Tests | 80%                | 50             |
| E2E Tests  | 70%                | 30             |

**Current Coverage Status:**

- **Unit Tests**: 558 tests passed, 18.74% overall coverage
- **Hooks**: 97.12% coverage ✅
- **Components**: 85.79% coverage ✅
- **UI Components**: 98.69% coverage ✅
- **Utilities**: 86.95% coverage ✅

### Combined Test Suites

```bash
# All tests
pnpm test:all               # Unit + E2E sanity tests
pnpm test:all:strict        # Unit + E2E with strict coverage

# Coverage enforcement
pnpm coverage:enforce:coverage    # Coverage analysis only
pnpm coverage:enforce:test-count  # Test count enforcement only
pnpm coverage:enforce:both        # Both coverage and test count
```

For detailed testing documentation, see [tests/README.md](tests/README.md).

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

# Application
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"  # Development URL
NODE_ENV="development"                           # Environment
```

# Database Reset & Setup

This project supports two flexible database reset modes via a unified command:

## Modes

- **Canonical**: Runs the canonical SQL schema file (`src/lib/db/migrations/000_full_schema_reset.sql`) directly. This guarantees the database matches the schema exactly, dropping and recreating all tables. Use for local development, CI, onboarding, or when you want a guaranteed clean slate.
- **Drizzle**: Uses Drizzle ORM's migration system to apply all migration files incrementally. This is safer for production and collaborative development, as it tracks migration history and applies only new changes.

## Usage

```
pnpm db:reset --mode=canonical --env=dev
pnpm db:reset --mode=drizzle --env=dev
```

- `--mode=canonical` — Resets using the canonical SQL file.
- `--mode=drizzle` — Resets using Drizzle migrations.
- `--env=dev|staging|prod` — Selects the environment (defaults to dev).

## When to Use Each

| Mode      | Use Case                         |
| --------- | -------------------------------- |
| canonical | Dev, CI, onboarding, test resets |
| drizzle   | Prod, team dev, upgrades         |

See `package.json` for script shortcuts.
