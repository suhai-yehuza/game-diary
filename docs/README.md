# Game Diary Documentation

Welcome to the comprehensive documentation for the Game Diary application. This documentation covers all aspects of the system, from API usage to development workflows.

## 📚 Documentation Index

### 🚀 Getting Started

- **[README.md](../README.md)** - Main project overview and setup
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[API_ROUTES.md](./API_ROUTES.md)** - Complete API routes overview

### 🔌 API Documentation

- **[API_REFERENCE.md](./API_REFERENCE.md)** - Detailed API reference with examples
- **[API_ROUTES.md](./API_ROUTES.md)** - Complete API routes overview
- **[Database Schema](../src/lib/db/migrations/README.md)** - Database documentation
- **Interactive Swagger UI** - Available at `/api/docs` with OpenAPI 3.0 specification
- **OpenAPI JSON** - Available at `/api/openapi.json` for client generation

### 💾 Cache & Redis

- **[REDIS_CONSOLIDATION.md](./REDIS_CONSOLIDATION.md)** - Redis implementation consolidation
- **[CACHE_EVICTION_TESTING.md](./CACHE_EVICTION_TESTING.md)** - Cache testing and validation

### 🧪 Testing & Development

- **[test-naming-convention.md](../docs/test-naming-convention.md)** - Testing conventions and standards
- **[E2E_TEST_COVERAGE_AUDIT.md](../docs/E2E_TEST_COVERAGE_AUDIT.md)** - End-to-end testing coverage
- **[MIGRATION_GUIDE.md](../tests/MIGRATION_GUIDE.md)** - Testing migration guide

### 🎨 UI & Design

- **Design System** - Custom Tailwind CSS design system with centralized tokens
- **Component Library** - Reusable UI components with accessibility support
- **Theme System** - Dark/light mode with user preferences
- **Responsive Design** - Mobile-first approach with touch-friendly interfaces

### 🔧 Development Tools

- **TypeScript** - Strict type checking and modern language features
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality assurance
- **Testing** - Unit, integration, and E2E testing with Vitest and Playwright

### 📊 Analytics & Performance

- **Vercel Analytics** - User behavior tracking and insights
- **Speed Insights** - Core Web Vitals monitoring
- **Custom Metrics** - Application-specific performance tracking
- **Bundle Analysis** - Regular bundle size monitoring and optimization

## 🎯 Quick Start

### For Developers

1. **Setup**: Follow the [main README](../README.md) for installation
2. **API**: Check [API Reference](./API_REFERENCE.md) for detailed examples
3. **Architecture**: Review [Architecture](./ARCHITECTURE.md) for system design
4. **Testing**: Use comprehensive testing suite with Vitest and Playwright

### For API Users

1. **Overview**: Start with [API Routes](./API_ROUTES.md)
2. **Reference**: Use [API Reference](./API_REFERENCE.md) for detailed examples
3. **Database**: Check [Database Schema](../src/lib/db/migrations/README.md) for data structure

### For DevOps

1. **Architecture**: Review [Architecture](./ARCHITECTURE.md) for system design
2. **Monitoring**: Check health endpoints and analytics
3. **Deployment**: Follow Vercel deployment best practices

## 🔍 API Quick Navigation

### Core Endpoints

- **Health**: `/api/health`, `/api/cache/health`
- **Users**: `/api/user/*`, `/api/user/me`, `/api/user/game-logs`
- **Sports Data**: `/api/players`, `/api/teams`, `/api/games`
- **Game Logs**: `/api/game-logs`, `/api/game-logs/[id]`
- **Social**: `/api/comments`, `/api/reactions`, `/api/friendships`
- **Search**: `/api/search`

### Cache Management

- **Health**: `/api/cache/health`
- **Testing**: `/api/cache/validate-cache-consistency`
- **Operations**: `/api/cache/clear-all` (clear all), `/api/cache/clear` (namespace)

### Admin & Monitoring

- **Admin**: `/api/admin/*`
- **Webhooks**: `/api/webhooks/*`
- **GraphQL**: `/api/graphql`

### API Documentation

- **Swagger UI**: `/api/docs` - Interactive API documentation
- **OpenAPI JSON**: `/api/openapi.json` - Machine-readable API specification

## 🧪 Testing & Development

### Redis Testing

```bash
# Comprehensive Redis tests
pnpm test:redis

# Cache eviction tests
pnpm cache:test-eviction

# Legacy Redis tests
pnpm test:redis:legacy
```

### Health Checks

```bash
# System health
curl http://localhost:3000/api/health

# Cache health
curl http://localhost:3000/api/cache/health
```

### Development Scripts

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Check environment
pnpm check-env
```

## 📊 System Architecture

### Core Components

- **Next.js 15 App Router** - Modern React framework with server components
- **TypeScript 5.8** - Type-safe development with strict configuration
- **PostgreSQL** - Primary database with Drizzle ORM
- **Redis** - Caching and session storage with Upstash integration
- **Clerk** - Authentication and user management
- **Vercel** - Deployment and hosting platform

### Cache Strategy

- **Memory Cache** - Fast local access with LRU eviction
- **Redis Cache** - Persistent distributed cache with TTL
- **Hybrid Approach** - Intelligent fallback system
- **Namespace Support** - Organized cache management by feature

### Security Features

- **Clerk Authentication** - Secure user management and social features
- **Rate Limiting** - API abuse prevention with Upstash
- **Input Validation** - Zod schema validation
- **Error Handling** - Centralized error management
- **Row-Level Security** - Database-level access control

## 🚀 Performance & Monitoring

### Caching Strategy

| Data Type      | Cache Duration | Cache Level    |
| -------------- | -------------- | -------------- |
| Static Data    | 1 hour         | CDN + Browser  |
| User Data      | 5 minutes      | Memory + Redis |
| Game Data      | 1 minute       | Memory + Redis |
| Search Results | 15 minutes     | Memory + Redis |

### Rate Limiting

| Endpoint Type    | Requests per Minute |
| ---------------- | ------------------- |
| Public           | 100                 |
| Authenticated    | 1000                |
| Admin            | 5000                |
| Cache Operations | 500                 |

### Health Monitoring

- **System Health** - Database, Redis, cache status
- **Performance Metrics** - Response times, error rates
- **Cache Statistics** - Hit/miss ratios, memory usage
- **External Services** - API availability monitoring

## 🔧 Development Workflow

### Git Workflow

1. **Feature Branches** - Create from main
2. **Commit Messages** - Follow conventional format
3. **Pull Requests** - Code review required
4. **Automated Testing** - CI/CD pipeline
5. **Deployment** - Staging → Production

### Code Quality

- **TypeScript** - Strict type checking
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Testing** - Unit, integration, and E2E tests

### Environment Management

- **Development** - Local development setup
- **Staging** - Pre-production testing
- **Production** - Live application
- **Environment Variables** - Secure configuration

## 📈 Analytics & Insights

### User Analytics

- **Page Views** - User navigation patterns
- **Feature Usage** - Popular functionality
- **Performance Metrics** - User experience data
- **Error Tracking** - Issue identification

### Performance Monitoring

- **Speed Insights** - Core Web Vitals
- **Cache Performance** - Hit/miss ratios
- **Database Performance** - Query optimization
- **External APIs** - Response time monitoring

## 🆘 Support & Troubleshooting

### Common Issues

- **Authentication Errors** - Check JWT token validity
- **Rate Limiting** - Monitor request frequency
- **Cache Issues** - Verify Redis connectivity
- **Database Errors** - Check connection and queries

### Debugging Tools

- **Health Endpoints** - System status monitoring
- **Cache Testing** - Redis functionality validation
- **Log Files** - Detailed error information
- **Development Tools** - Local debugging utilities

### Getting Help

- **Documentation** - Check relevant docs first
- **Issues** - Create GitHub issue with details
- **Testing** - Use provided test scripts
- **Health Checks** - Monitor system endpoints

## 🔄 Updates & Maintenance

### Documentation Updates

- **API Changes** - Updated with each release
- **New Features** - Documented upon completion
- **Breaking Changes** - Migration guides provided
- **Version History** - Changelog maintained

### System Maintenance

- **Regular Updates** - Security and performance patches
- **Cache Management** - Periodic cleanup and optimization
- **Database Maintenance** - Schema updates and optimization
- **Performance Monitoring** - Continuous improvement

## 🎯 Key Features

### Sports Tracking

- **Multi-Sport Support** - NBA, NFL, MLB, NHL, and MLS
- **Live Games** - Real-time game updates and notifications
- **Game Logging** - Track and share game watching experiences
- **Player & Team Data** - Comprehensive sports statistics

### Social Features

- **User Profiles** - Personalized user dashboards
- **Comments & Reactions** - Engage with game logs and other users
- **Friend Connections** - Build your sports community
- **Activity Feeds** - Stay updated with friends' activities

### Technical Excellence

- **Performance Optimized** - Bundle analysis and lazy loading
- **Mobile-First Design** - Responsive design with touch support
- **Accessibility** - WCAG compliant with keyboard navigation
- **Real-time Updates** - Live data synchronization

---

## 📞 Contact & Support

- **Repository**: [GitHub Issues](https://github.com/your-repo/game-diary/issues)
- **Documentation**: This docs folder
- **Development**: Follow Git workflow and best practices
- **Testing**: Use provided test scripts and health endpoints

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: Game Diary Development Team
