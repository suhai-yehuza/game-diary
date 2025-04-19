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
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# NBA API
RAPIDAPI_KEY="your_rapidapi_key"
RAPIDAPI_HOST="api-nba-v1.p.rapidapi.com"

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com,admin2@example.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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

### 5. Generate GraphQL Types

```bash
pnpm codegen
```

### 6. Start Development Server

```bash
pnpm dev
```

### 7. All Encompassing Dev Workflow

```bash
# Seed current season with default settings
pnpm clean:build && pnpm db:migrate:reset:dev

pnpm run seed:optimized

# Seed specific seasons
pnpm run seed:optimized -- --seasons=2023,2024

# Reset database and seed
pnpm run seed:optimized -- --resetDb=true

# Skip external data (NBA)
pnpm run seed:optimized -- --skipExternalDb=true

# Custom batch size and concurrency
pnpm run seed:optimized -- --batchSize=200 --concurrency=5appendingData



# Custom clean, build, generate, migrate, runs
pnpm clean:build && pnpm db:migrate:reset:dev

# Seed external db and skip the part for the application db / tables
tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- --batchSize=100 --concurrency=10 --seasons=2024 --resetDb=true --skipExternalDb=false --skipApplicationDb=true --enableMonitoring=true

# Skip seeding the external db and only seed the application db / tables. Games should already exist in the external db
tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- --batchSize=100 --concurrency=10 --resetDb=false --skipExternalDb=true --skipApplicationDb=false --appendingData=false --skipUsers=false --enableMonitoring=true

# Seed the external db with data from a specific season without resetting or truncating the tables
tsx --max-old-space-size=24576 src/lib/db/seed/optimized-seeder.ts -- --batchSize=100 --concurrency=10 --seasons=2023,2022,2021,2020 --resetDb=false --skipExternalDb=false --skipApplicationDb=true --appendingData=true --enableMonitoring=true

npx tsc --traceResolution
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── community/            # Community pages
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

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build production bundle
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix              # Fix ESLint issues
pnpm format                # Format with Prettier
pnpm typecheck             # Type checking
pnpm validate:all          # Run all validations

# Database
pnpm db:generate           # Generate database schema
pnpm db:migrate:dev        # Run migrations (development)
pnpm db:migrate:prod       # Run migrations (production)
pnpm db:seed:dev           # Seed database (development)
pnpm db:studio             # Open Drizzle Studio

# GraphQL
pnpm codegen               # Generate GraphQL types
pnpm codegen:watch         # Watch mode for GraphQL generation

# Testing
pnpm test                  # Run tests
pnpm test:coverage         # Run tests with coverage
pnpm test:databases        # Test database connections

# Dependencies
pnpm check:circular        # Check for circular dependencies
pnpm clean                 # Clean and reinstall dependencies
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
- **Open Source Community** for the amazing tools and libraries

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact the team at support@gamediary.app

---

**Built with ❤️ for NBA fans by fans**
