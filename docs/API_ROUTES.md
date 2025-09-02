# API Routes Documentation

This document provides comprehensive documentation for all API routes in the `src/app/api` directory of the game-diary application.

## Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Cache Management](#cache-management)
- [Health & Monitoring](#health--monitoring)
- [User Management](#user-management)
- [Player Management](#player-management)
- [Team Management](#team-management)
- [Game Management](#game-management)
- [NBA Data](#nba-data)
- [Search Functionality](#search-functionality)
- [Admin Operations](#admin-operations)
- [Webhooks](#webhooks)
- [GraphQL](#graphql)
- [Proxy & Utilities](#proxy--utilities)
- [Error Handling](#error-handling)

## Overview

The API is built using Next.js 13+ App Router with the following features:

- **RESTful endpoints** for CRUD operations
- **TypeScript** for type safety
- **Middleware** for authentication and validation
- **Error handling** with centralized error management
- **Rate limiting** and security measures
- **Comprehensive logging** and monitoring

## Authentication & Authorization

### Middleware

- **File**: `src/middleware.ts`
- **Purpose**: Handles authentication, authorization, and request validation
- **Features**: JWT validation, role-based access control, rate limiting

## Cache Management

### Base Cache Route

- **Endpoint**: `GET /api/cache`
- **Purpose**: Main cache management interface
- **File**: `src/app/api/cache/route.ts`

### Cache Health

- **Endpoint**: `GET /api/cache/health`
- **Purpose**: Redis connection health check
- **File**: `src/app/api/cache/health/route.ts`
- **Response**: Redis connection status, memory cache size, response times

### Cache Consistency Validation

- **Endpoint**: `POST /api/cache/validate-cache-consistency`
- **Purpose**: Comprehensive cache testing and validation
- **File**: `src/app/api/cache/validate-cache-consistency/route.ts`
- **Features**:
  - Redis connection health check
  - Cache consistency testing
  - getWithFallback functionality testing
  - Cache eviction and deletion testing
  - Memory cache LRU eviction testing
  - TTL-based expiration testing

### Cache Operations

- **Endpoint**: `POST /api/cache/clear-all`
- **Purpose**: Clear all cache entries (memory + Redis)
- **Endpoint**: `POST /api/cache/clear`
- **Purpose**: Clear cache with namespace support
- **Endpoint**: `POST /api/cache/init`
- **Purpose**: Initialize cache system

### Cache Testing

- **Endpoint**: `POST /api/cache/test-fallback`
- **Purpose**: Test cache fallback mechanisms
- **Endpoint**: `POST /api/cache/test-get`
- **Purpose**: Test cache get operations
- **Endpoint**: `POST /api/cache/test-summaries`
- **Purpose**: Test cache summary functionality

### Cache Monitoring

- **Endpoint**: `GET /api/cache/status`
- **Purpose**: Get cache system status
- **Endpoint**: `GET /api/cache/debug`
- **Purpose**: Debug cache operations
- **Endpoint**: `GET /api/cache/monitor`
- **Purpose**: Monitor cache performance

### Cache Data Management

- **Endpoint**: `POST /api/cache/raw-data`
- **Purpose**: Manage raw cache data
- **Endpoint**: `POST /api/cache/create-summaries`
- **Purpose**: Create cache summaries
- **Endpoint**: `GET /api/cache/check-summaries`
- **Purpose**: Check cache summary status

### Cache Database Operations

- **Endpoint**: `POST /api/cache/db/*`
- **Purpose**: Database-related cache operations
- **Endpoint**: `POST /api/cache/hybrid/*`
- **Purpose**: Hybrid cache operations

## Health & Monitoring

### System Health

- **Endpoint**: `GET /api/health`
- **Purpose**: Comprehensive system health check
- **File**: `src/app/api/health/route.ts`
- **Response**: Database, Redis, and overall system status

### Cache Health

- **Endpoint**: `GET /api/cache/health`
- **Purpose**: Redis and cache system health
- **Response**: Connection status, performance metrics, memory usage

## User Management

### User Base Route

- **Endpoint**: `GET /api/user`
- **Purpose**: User management operations
- **File**: `src/app/api/user/route.ts`

### Current User

- **Endpoint**: `GET /api/user/me`
- **Purpose**: Get current authenticated user information
- **Authentication**: Required
- **Response**: User profile, preferences, settings

### User by ID

- **Endpoint**: `GET /api/user/[id]`
- **Purpose**: Get user information by ID
- **Parameters**: `id` - User identifier
- **Response**: User profile, statistics, achievements

### User Game Logs

- **Endpoint**: `GET /api/user/game-logs`
- **Purpose**: Get user's game log history
- **Authentication**: Required
- **Query Parameters**:
  - `page` - Page number for pagination
  - `limit` - Number of items per page
  - `filter` - Filter criteria
- **Response**: Paginated game logs with metadata

### User Activity

- **Endpoint**: `GET /api/user/activity`
- **Purpose**: Get user activity feed
- **Authentication**: Required
- **Query Parameters**:
  - `page` - Page number
  - `limit` - Items per page
  - `type` - Activity type filter
- **Response**: User activity timeline

### User Friends

- **Endpoint**: `GET /api/user/friends`
- **Purpose**: Get user's friends list
- **Authentication**: Required
- **Response**: Friends list with status and activity

## Player Management

### Players Base Route

- **Endpoint**: `GET /api/players`
- **Purpose**: List and search players
- **File**: `src/app/api/players/route.ts`
- **Query Parameters**:
  - `search` - Player name search
  - `team` - Filter by team
  - `position` - Filter by position
  - `page` - Page number
  - `limit` - Items per page
- **Response**: Paginated player list with statistics

### Player by ID

- **Endpoint**: `GET /api/players/[playerId]`
- **Purpose**: Get detailed player information
- **Parameters**: `playerId` - Player identifier
- **Response**: Player profile, statistics, game history, achievements

## Team Management

### Teams Base Route

- **Endpoint**: `GET /api/teams`
- **Purpose**: List and search teams
- **File**: `src/app/api/teams/route.ts`
- **Query Parameters**:
  - `search` - Team name search
  - `conference` - Filter by conference
  - `division` - Filter by division
  - `page` - Page number
  - `limit` - Items per page
- **Response**: Paginated team list with basic information

### Team by ID

- **Endpoint**: `GET /api/teams/[teamId]`
- **Purpose**: Get detailed team information
- **Parameters**: `teamId` - Team identifier
- **Response**: Team profile, roster, statistics, schedule

## Game Management

### Games Base Route

- **Endpoint**: `GET /api/games`
- **Purpose**: List and search games
- **File**: `src/app/api/games/route.ts`
- **Query Parameters**:
  - `date` - Game date filter
  - `team` - Filter by team
  - `player` - Filter by player
  - `status` - Game status filter
  - `page` - Page number
  - `limit` - Items per page
- **Response**: Paginated game list with scores and statistics

## NBA Data

### NBA Simple Data

- **Endpoint**: `GET /api/nba/simple`
- **Purpose**: Simplified NBA data access
- **Response**: Basic NBA statistics and information

## Search Functionality

### Global Search

- **Endpoint**: `GET /api/search`
- **Purpose**: Global search across all entities
- **File**: `src/app/api/search/route.ts`
- **Query Parameters**:
  - `q` - Search query (required)
  - `type` - Entity type filter (players, teams, games)
  - `page` - Page number
  - `limit` - Items per page
  - `sort` - Sort order
- **Response**: Unified search results with relevance scoring

## Admin Operations

### Database Management

- **Endpoint**: `POST /api/admin/database/*`
- **Purpose**: Database administration operations
- **Authentication**: Admin role required
- **Features**: Schema management, migrations, data operations

### Audit Logs

- **Endpoint**: `GET /api/admin/audit-logs`
- **Purpose**: Access system audit logs
- **Authentication**: Admin role required
- **Response**: System activity logs with timestamps and user information

### Key Management

- **Endpoint**: `POST /api/admin/keys/*`
- **Purpose**: API key and encryption key management
- **Authentication**: Admin role required
- **Features**: Key generation, rotation, validation

## Webhooks

### Webhook Endpoints

- **Base Path**: `/api/webhooks/*`
- **Purpose**: External service integrations
- **Features**: Event handling, data processing, notifications

## GraphQL

### GraphQL Endpoint

- **Endpoint**: `POST /api/graphql`
- **Purpose**: GraphQL API for complex queries
- **Features**: Schema introspection, query optimization, real-time subscriptions

## Proxy & Utilities

### Proxy Routes

- **Base Path**: `/api/proxy/*`
- **Purpose**: Proxy external API calls
- **Features**: Rate limiting, caching, authentication forwarding

### Validation Routes

- **Base Path**: `/api/validation/*`
- **Purpose**: Data validation and schema checking
- **Features**: Input validation, format checking, error reporting

## Mock Server

### Mock Data Endpoints

- **Base Path**: `/api/mock-server/*`
- **Purpose**: Development and testing mock data
- **Features**: Configurable responses, realistic data generation

## Error Handling

### Global Error Handler

- **File**: `src/app/api/global-error-handler.ts`
- **Purpose**: Centralized error handling for all API routes
- **Features**: Error logging, user-friendly messages, status code management

### Route Error Handler

- **File**: `src/app/api/error-handler.ts`
- **Purpose**: Route-specific error handling
- **Features**: Custom error responses, validation error formatting

### Not Found Handler

- **File**: `src/app/api/not-found.ts`
- **Purpose**: Handle 404 errors for undefined routes
- **Response**: User-friendly error message with navigation suggestions

### Catch-all Routes

- **Base Path**: `/api/[...catchall]`
- **Purpose**: Handle undefined API routes
- **Response**: Appropriate error responses for invalid endpoints

## Request/Response Format

### Standard Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### Error Response Structure

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Pagination Response Structure

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}
```

## Authentication & Authorization

### JWT Token Format

```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  permissions: string[];
  exp: number;
  iat: number;
}
```

### Required Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Request-ID: <unique_request_id>
```

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Rules

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Admin endpoints**: 5000 requests per minute

## Caching

### Cache Headers

```http
Cache-Control: public, max-age=300
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
```

### Cache Strategy

- **Static data**: 1 hour cache
- **User data**: 5 minutes cache
- **Game data**: 1 minute cache
- **Search results**: 15 minutes cache

## Development & Testing

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key

# Optional
NODE_ENV=development
LOG_LEVEL=debug
API_RATE_LIMIT=100
```

### Testing Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Cache health
curl http://localhost:3000/api/cache/health

# Redis testing
pnpm test:redis

# Cache eviction testing
pnpm cache:test-eviction
```

## Monitoring & Logging

### Log Levels

- **ERROR**: System errors and failures
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Metrics Collected

- Request/response times
- Error rates
- Cache hit/miss ratios
- Database query performance
- Memory usage
- Redis connection status

## Security Considerations

### Input Validation

- All inputs are validated using Zod schemas
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization
- Rate limiting to prevent abuse

### Authentication

- JWT tokens with short expiration
- Refresh token rotation
- Role-based access control
- Session management

### Data Protection

- Sensitive data encryption
- Audit logging for all operations
- GDPR compliance measures
- Data retention policies

## Future Enhancements

### Planned Features

- **Real-time updates** via WebSocket connections
- **GraphQL subscriptions** for live data
- **Advanced caching** with Redis clustering
- **API versioning** for backward compatibility
- **OpenAPI documentation** generation
- **Performance monitoring** dashboard
- **Automated testing** for all endpoints
- **Load balancing** and horizontal scaling

### API Versioning Strategy

- **v1**: Current stable API
- **v2**: Planned major updates
- **Beta**: Experimental features
- **Deprecated**: Sunsetting endpoints

## Support & Maintenance

### Documentation Updates

- API documentation is updated with each release
- Changelog maintained for all breaking changes
- Migration guides for major updates
- Examples and tutorials for common use cases

### Troubleshooting

- Common error codes and solutions
- Performance optimization tips
- Debugging guides for developers
- Support contact information

---

This documentation is maintained by the development team and updated regularly. For questions or suggestions, please contact the team or create an issue in the project repository.
