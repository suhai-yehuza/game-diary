# Game Diary Documentation

Welcome to the comprehensive documentation for the Game Diary application. This documentation covers all aspects of the system, from API usage to development workflows.

## 📚 Documentation Index

### 🚀 Getting Started

- **[README.md](../README.md)** - Main project overview and setup
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture and design patterns
- **[DEPLOYMENT_FLOW.md](../DEPLOYMENT_FLOW.md)** - Deployment processes and workflows

### 🔌 API Documentation

- **[API_ROUTES.md](./API_ROUTES.md)** - Complete API routes overview
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Detailed API reference with examples
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference for developers

### 💾 Cache & Redis

- **[REDIS_CONSOLIDATION.md](./REDIS_CONSOLIDATION.md)** - Redis implementation consolidation
- **[CACHE_EVICTION_TESTING.md](./CACHE_EVICTION_TESTING.md)** - Cache testing and validation

### 🧪 Testing & Development

- **[test-naming-convention.md](../docs/test-naming-convention.md)** - Testing conventions and standards
- **[E2E_TEST_COVERAGE_AUDIT.md](../docs/E2E_TEST_COVERAGE_AUDIT.md)** - End-to-end testing coverage
- **[MIGRATION_GUIDE.md](../tests/MIGRATION_GUIDE.md)** - Testing migration guide

### 🎨 UI & Design

- **[COLOR_SYSTEM_GUIDE.md](../docs/COLOR_SYSTEM_GUIDE.md)** - Color system and design tokens
- **[REACTIONS_IMPLEMENTATION.md](../REACTIONS_IMPLEMENTATION.md)** - User reactions system

### 🔧 Development Tools

- **[GIT_BEST_PRACTICES.md](../docs/GIT_BEST_PRACTICES.md)** - Git workflow and best practices
- **[PREVIEW_DEPLOYMENTS.md](../docs/PREVIEW_DEPLOYMENTS.md)** - Preview deployment system

### 📊 Analytics & Performance

- **[ANALYTICS_IMPLEMENTATION.md](../ANALYTICS_IMPLEMENTATION.md)** - Analytics system implementation
- **[SPEED_INSIGHTS_IMPLEMENTATION.md](../SPEED_INSIGHTS_IMPLEMENTATION.md)** - Performance monitoring
- **[NBA_GAMES_IMPROVEMENTS.md](../NBA_GAMES_IMPROVEMENTS.md)** - NBA data improvements

## 🎯 Quick Start

### For Developers

1. **Setup**: Follow the [main README](../README.md) for installation
2. **API**: Check [API Quick Reference](./API_QUICK_REFERENCE.md) for common endpoints
3. **Testing**: Use [testing conventions](../docs/test-naming-convention.md)
4. **Development**: Follow [Git best practices](../docs/GIT_BEST_PRACTICES.md)

### For API Users

1. **Overview**: Start with [API Routes](./API_ROUTES.md)
2. **Reference**: Use [API Reference](./API_REFERENCE.md) for detailed examples
3. **Quick Reference**: Keep [API Quick Reference](./API_QUICK_REFERENCE.md) handy

### For DevOps

1. **Deployment**: Follow [Deployment Flow](../DEPLOYMENT_FLOW.md)
2. **Architecture**: Review [Architecture](../ARCHITECTURE.md)
3. **Monitoring**: Check health endpoints and analytics

## 🔍 API Quick Navigation

### Core Endpoints

- **Health**: `/api/health`, `/api/cache/health`
- **Users**: `/api/user/*`, `/api/user/me`, `/api/user/game-logs`
- **Players**: `/api/players`, `/api/players/[id]`
- **Teams**: `/api/teams`, `/api/teams/[id]`
- **Games**: `/api/games`, `/api/games/[id]`
- **Search**: `/api/search`

### Cache Management

- **Health**: `/api/cache/health`
- **Testing**: `/api/cache/validate-cache-consistency`
- **Operations**: `/api/cache/clear-all` (clear all), `/api/cache/clear` (namespace)

### Admin & Monitoring

- **Admin**: `/api/admin/*`
- **Webhooks**: `/api/webhooks/*`
- **GraphQL**: `/api/graphql`

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

- **Next.js 13+ App Router** - Modern React framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Upstash Redis** - External Redis service

### Cache Strategy

- **Memory Cache** - Fast local access
- **Redis Cache** - Persistent distributed cache
- **Hybrid Approach** - Intelligent fallback system
- **Namespace Support** - Organized cache management

### Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Zod schema validation
- **Error Handling** - Centralized error management

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

---

## 📞 Contact & Support

- **Repository**: [GitHub Issues](https://github.com/your-repo/game-diary/issues)
- **Documentation**: This docs folder
- **Development**: Follow Git workflow and best practices
- **Testing**: Use provided test scripts and health endpoints

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintained By**: Development Team
