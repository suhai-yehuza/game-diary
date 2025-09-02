# API Quick Reference

Quick reference for the most commonly used API endpoints in the game-diary application.

## 🔐 Authentication

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📊 Health & Monitoring

| Endpoint            | Method | Purpose             |
| ------------------- | ------ | ------------------- |
| `/api/health`       | GET    | System health check |
| `/api/cache/health` | GET    | Cache system health |

## 👥 User Management

| Endpoint              | Method | Auth | Purpose            |
| --------------------- | ------ | ---- | ------------------ |
| `/api/user/me`        | GET    | ✅   | Current user info  |
| `/api/user/[id]`      | GET    | ❌   | User by ID         |
| `/api/user/game-logs` | GET    | ✅   | User game history  |
| `/api/user/activity`  | GET    | ✅   | User activity feed |

## 🏀 Player Management

| Endpoint            | Method | Auth | Purpose             |
| ------------------- | ------ | ---- | ------------------- |
| `/api/players`      | GET    | ❌   | List/search players |
| `/api/players/[id]` | GET    | ❌   | Player details      |

**Query Parameters:**

```bash
# Search players
GET /api/players?search=lebron&page=1&limit=20

# Filter by team
GET /api/players?team=team_001&position=PG
```

## 🏆 Team Management

| Endpoint          | Method | Auth | Purpose           |
| ----------------- | ------ | ---- | ----------------- |
| `/api/teams`      | GET    | ❌   | List/search teams |
| `/api/teams/[id]` | GET    | ❌   | Team details      |

**Query Parameters:**

```bash
# Search teams
GET /api/teams?search=lakers&conference=Western

# Filter by division
GET /api/teams?division=Pacific&page=1&limit=10
```

## 🎮 Game Management

| Endpoint          | Method | Auth | Purpose           |
| ----------------- | ------ | ---- | ----------------- |
| `/api/games`      | GET    | ❌   | List/search games |
| `/api/games/[id]` | GET    | ❌   | Game details      |

**Query Parameters:**

```bash
# Games by date
GET /api/games?date=2024-01-15&status=scheduled

# Games by team
GET /api/games?team=team_001&page=1&limit=20
```

## 🔍 Search

| Endpoint      | Method | Auth | Purpose       |
| ------------- | ------ | ---- | ------------- |
| `/api/search` | GET    | ❌   | Global search |

**Query Parameters:**

```bash
# Basic search
GET /api/search?q=lebron

# Filtered search
GET /api/search?q=lakers&type=team&sort=relevance
```

## 💾 Cache Management

| Endpoint                                | Method | Auth | Purpose                          |
| --------------------------------------- | ------ | ---- | -------------------------------- |
| `/api/cache/health`                     | GET    | ❌   | Cache health                     |
| `/api/cache/validate-cache-consistency` | POST   | ❌   | Test cache                       |
| `/api/cache/clear-all`                  | POST   | ❌   | Clear all cache (memory + Redis) |
| `/api/cache/clear`                      | POST   | ❌   | Clear namespace                  |

## 📝 Common Response Format

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
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## 📄 Pagination

All list endpoints support pagination:

```bash
GET /api/players?page=1&limit=20
```

**Response includes:**

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔍 Filtering

Most endpoints support filtering:

```bash
# Players
GET /api/players?team=team_001&position=PG

# Teams
GET /api/teams?conference=Western&division=Pacific

# Games
GET /api/games?date=2024-01-15&status=scheduled
```

## 📊 Error Handling

**Standard Error Response:**

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Common Error Codes:**

- `AUTH_REQUIRED` - Authentication needed
- `VALIDATION_ERROR` - Invalid input
- `RESOURCE_NOT_FOUND` - Item not found
- `RATE_LIMIT_EXCEEDED` - Too many requests

## 🚀 Rate Limiting

| Endpoint Type    | Rate Limit   |
| ---------------- | ------------ |
| Public           | 100 req/min  |
| Authenticated    | 1000 req/min |
| Admin            | 5000 req/min |
| Cache Operations | 500 req/min  |

**Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 💡 Quick Examples

### Get Player Details

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.game-diary.io/players/player_001
```

### Search Players

```bash
curl "https://api.game-diary.io/players?search=lebron&page=1&limit=10"
```

### Get User Game Logs

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.game-diary.io/user/game-logs?page=1&limit=20"
```

### Health Check

```bash
curl https://api.game-diary.io/health
```

### Cache Health

```bash
curl https://api.game-diary.io/cache/health
```

## 🧪 Testing

### Health Checks

```bash
# System health
curl http://localhost:3000/api/health

# Cache health
curl http://localhost:3000/api/cache/health
```

### Redis Testing

```bash
# Comprehensive Redis tests
pnpm test:redis

# Cache eviction tests
pnpm cache:test-eviction
```

### Mock Data

```bash
# Mock players
curl http://localhost:3000/api/mock-server/players

# Mock games
curl http://localhost:3000/api/mock-server/games
```

## 📚 Full Documentation

- **API Routes**: [API_ROUTES.md](./API_ROUTES.md)
- **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
- **Redis Consolidation**: [REDIS_CONSOLIDATION.md](./REDIS_CONSOLIDATION.md)

## 🆘 Support

- **Issues**: Create an issue in the repository
- **Documentation**: Check the docs folder
- **Testing**: Use the provided test scripts
- **Health**: Monitor `/api/health` endpoint

---

**Last Updated**: January 2024
**Version**: 1.0.0
