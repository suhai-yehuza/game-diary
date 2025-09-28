# Game Diary

A comprehensive sports game logging and tracking application that allows users to track their game watching experiences, connect with fellow sports fans, and share thoughts on live games across NBA, NFL, MLB, NHL, and MLS.

![Game Diary Dashboard Overview](https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif)

## 🎯 Features

### Core Functionality

![Game Logging Flow](https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif)

- **Game Logging**: Track and log your sports watching experiences
- **Multi-Sport Support**: NBA, NFL, MLB, NHL, and MLS coverage
- **Live Games**: Real-time game tracking and updates
- **Social Features**: Connect with friends, share experiences, and build community

![Social Features Demo](https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif)

- **Comments & Reactions**: Engage with game logs through comments and emoji reactions
- **User Dashboard**: Personalized dashboard with activity tracking
- **Search & Discovery**: Find games, players, teams, and other users

### Technical Features

![Theme & Responsiveness](https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif)

- **Real-time Updates**: Live game data and notifications
- **Advanced Caching**: Redis-based caching with intelligent fallback
- **Performance Optimization**: Bundle analysis, lazy loading, and code splitting
- **Mobile-First Design**: Responsive design with touch-friendly interfaces
- **Dark Mode Support**: Complete theme system with user preferences
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis with Upstash integration
- **Authentication**: Clerk for user management
- **External APIs**: RapidAPI for sports data integration
- **Email Services**: SendGrid for transactional emails
- **Security**: Data encryption for sensitive information
- **Deployment**: Vercel with edge functions
- **Monitoring**: Vercel Analytics & Speed Insights

### Key Components

- **App Router**: Next.js 15 App Router with server components
- **GraphQL API**: Type-safe API with Apollo Server
- **REST API**: Comprehensive REST endpoints with OpenAPI documentation
- **Database Migrations**: Comprehensive migration system
- **Caching Strategy**: Multi-layer caching (memory, Redis, CDN)
- **Error Handling**: Centralized error management
- **API Documentation**: Interactive Swagger UI with OpenAPI 3.0
- **Testing**: Unit, integration, and E2E testing

## 🚀 Development

### Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:

   ```bash
   # Copy development environment
   cp .env.development .env.local

   # Or set environment directly
   export NODE_ENV=development
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

4. **Open your browser**: [http://localhost:3000](http://localhost:3000)

### Development Scripts

The project includes comprehensive development scripts for all scenarios:

```bash
# Basic development
pnpm dev                    # Start development server
pnpm dev:interactive       # Interactive mode with server attachment
pnpm dev:logs              # Start with persistent logging
pnpm logs                  # Follow logs of existing server

# Port management
pnpm kill:port             # Kill all processes on a port
pnpm kill:3000             # Kill all processes on port 3000

# Advanced usage
./scripts/server-manager.sh --help    # Show all options
./scripts/server-manager.sh --port 3001  # Use different port
```

### Script Features

- **Smart port detection**: Automatically detects existing Next.js servers
- **Multiple modes**: Simple, interactive, logging, and port management
- **Real-time logs**: Follow server activity with persistent logging
- **Port conflict resolution**: Handle port conflicts with multiple options
- **Process management**: Kill processes on specific ports

## 📋 Available Scripts

### Development

- `pnpm dev` - Start development server (simple mode)
- `pnpm dev:interactive` - Interactive mode with server attachment
- `pnpm dev:logs` - Start server with persistent logging
- `pnpm logs` - Follow logs of existing server
- `pnpm kill:port` - Kill all processes on a port
- `pnpm kill:3000` - Kill all processes on port 3000

### Testing

- `pnpm test:unit` - Run unit tests
- `pnpm test:integration` - Run integration tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm db:test:all-triggers` - Test database triggers
- `pnpm db:cleanup:test-data` - Clean up test data from database

### Database Management

- `pnpm db:migrate:dev` - Run database migrations (development)
- `pnpm db:studio` - Open Drizzle Studio for database inspection
- `pnpm db:triggers` - Set up database triggers

### Data Seeding

- `pnpm run seed:user-data` - Seed user data (100 users, memory-optimized)
- `pnpm run seed:user-data:medium` - Seed with 1000 users
- `pnpm run seed:user-data:large` - Seed with 10000 users
- `pnpm run seed:user-data:custom 500` - Seed with custom user count
- `pnpm run seed:user-data:clear` - Clear all user data
- `pnpm run seed:user-data:pareto` - Use Pareto distribution (80/20 rule)
- `pnpm run seed:user-data:realistic` - Use realistic social media patterns
- `pnpm run seed:user-data:uniform` - Use uniform distribution for testing
- `pnpm run seed:user-data:normal` - Use normal distribution (bell curve)
- `pnpm run seed:user-data:exponential` - Use exponential distribution
- `pnpm run seed:user-data:poisson` - Use Poisson distribution for rare events
- `pnpm run seed:user-data:high-engagement` - Use high engagement patterns
- `pnpm run seed:user-data:low-engagement` - Use low engagement patterns
- `pnpm run seed:user-data:performance` - Use performance testing patterns
- `pnpm run seed:user-data:large-pareto` - Large dataset with Pareto distribution
- `pnpm run seed:user-data:large-realistic` - Large dataset with realistic patterns
- `./scripts/seed-user-data.sh` - Shell script wrapper with scenarios and distributions

### API Documentation

![API Documentation](https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif)

- `pnpm api:docs` - View interactive API documentation (Swagger UI)
- `pnpm api:openapi` - Access OpenAPI JSON specification

> 💡 **Memory Optimization**: The new seeding system handles large datasets without memory issues. See [User Data Seeding Guide](docs/USER_DATA_SEEDING.md) for details.

> 🔄 **Hybrid Approach**: User seeding now works alongside Clerk webhooks. Use `--no-users` flag to skip user creation when you have existing users. See [Hybrid Seeding Approach](docs/HYBRID_SEEDING_APPROACH.md) for details.

> 📚 **API Documentation**: Interactive Swagger UI available at `/api/docs` with complete OpenAPI 3.0 specification.

## 📁 Project Structure

```
game-diary/
├── 📁 src/                    # Source code
│   ├── 📁 app/               # Next.js App Router
│   │   ├── 📁 api/           # API routes
│   │   ├── 📁 protected/     # Auth-required pages
│   │   ├── 📁 sports/        # Sports-specific pages
│   │   └── 📁 _components/   # App-level shared components
│   ├── 📁 components/        # React components
│   │   ├── 📁 ui/           # Design system components
│   │   ├── 📁 features/     # Feature-specific components
│   │   └── 📁 common/       # Shared business components
│   ├── 📁 lib/               # Core library code
│   │   ├── 📁 core/         # Essential services
│   │   ├── 📁 graphql/      # GraphQL schema & resolvers
│   │   ├── 📁 db/           # Database layer
│   │   └── 📁 utils/        # Utility functions
│   └── 📁 hooks/            # Custom React hooks
├── 📁 scripts/              # Build and automation scripts
├── 📁 docs/                 # Documentation
├── 📁 public/              # Static assets
└── 📁 coverage/            # Test coverage and performance reports
```

## 🛠️ Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis with Upstash integration
- **Authentication**: Clerk
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 🧪 Testing & Quality

### Testing Strategy

- **Unit Tests**: Component and utility testing with Vitest
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing with Playwright
- **Performance Testing**: Bundle analysis and performance monitoring

### Quality Assurance

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance
- **Size Limits**: Bundle size monitoring

## 🚀 Deployment

### Environment Strategy

- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live application with monitoring

### Performance Monitoring

- **Vercel Analytics**: User behavior tracking
- **Speed Insights**: Core Web Vitals monitoring
- **Custom Metrics**: Application-specific performance tracking

## 📚 Documentation

- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation
- **[API Routes](docs/API_ROUTES.md)** - API endpoints overview
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture guide
- **[Database Schema](src/lib/db/migrations/README.md)** - Database documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b <username>/<feature>-<commit-description>`
3. Make your changes
4. Run tests: `pnpm codebase:validate`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin <username>/<feature>-<commit-description>`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [readme](https://github.com/suhai-yehuza/game-diary)
- **Documentation**: Check the [docs](https://github.com/suhai-yehuza/game-diary/tree/master/docs) folder
- **Issues**: Create a [GitHub issue](https://github.com/suhai-yehuza/game-diary/issues)

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Maintained By**: Game Diary Development Team
