# API Reference

This document provides detailed API reference information for the game-diary application, including request/response examples, error codes, and implementation details.

## Base URL

```
Development: http://localhost:3000/api
Staging: https://staging.game-diary.io/api
Production: https://www.game-diary.io/api
```

## Authentication

### JWT Token Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Token Refresh

When a token expires, use the refresh endpoint:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

## Cache Management API

### 1. Cache Health Check

**Endpoint**: `GET /api/cache/health`

**Purpose**: Check Redis connection health and cache system status

**Response Example**:

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": 45,
  "redis": {
    "available": true,
    "connectionTest": true,
    "connectionTime": 12,
    "memoryCacheSize": 156
  },
  "status": "healthy"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Redis connection failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "error"
}
```

### 2. Cache Consistency Validation

**Endpoint**: `POST /api/cache/validate-cache-consistency`

**Purpose**: Comprehensive testing of cache consistency and eviction mechanisms

**Request Body**: None required

**Response Example**:

```json
{
  "success": true,
  "message": "Cache consistency and getWithFallback test complete",
  "testKey": "test:consistency:key",
  "results": {
    "test1": {
      "description": "Basic cache consistency test",
      "setOperation": "COMPLETED",
      "memoryCache": {
        "exists": true,
        "key": "SYSTEM:test:consistency:key",
        "value": "EXISTS"
      },
      "redisCache": {
        "exists": true,
        "key": "SYSTEM:test:consistency:key",
        "value": "EXISTS"
      },
      "consistency": {
        "isConsistent": true,
        "status": "✅ CONSISTENT"
      },
      "cleanup": "COMPLETED"
    },
    "test2": {
      "description": "getWithFallback functionality test",
      "firstCall": {
        "description": "First call (cache miss)",
        "result": "SUCCESS",
        "source": "external-api"
      },
      "secondCall": {
        "description": "Second call (memory cache hit)",
        "result": "SUCCESS",
        "source": "memory"
      },
      "thirdCall": {
        "description": "Third call (Redis cache hit)",
        "result": "SUCCESS",
        "source": "redis"
      },
      "fourthCall": {
        "description": "Fourth call (external API fetch)",
        "result": "SUCCESS",
        "source": "external-api"
      },
      "cleanup": "COMPLETED"
    },
    "test3": {
      "description": "Cache eviction and deletion mechanisms test",
      "individualDeletion": {
        "description": "Individual key deletion",
        "result": "SUCCESS",
        "note": "Tests single key deletion and verification"
      },
      "namespaceClearing": {
        "description": "Namespace clearing",
        "result": "SUCCESS",
        "note": "Tests clearing all keys in a namespace"
      },
      "memoryEviction": {
        "description": "Memory cache LRU eviction",
        "result": "SUCCESS",
        "note": "Tests memory cache size limits and eviction"
      },
      "ttlExpiration": {
        "description": "TTL-based expiration",
        "result": "SUCCESS",
        "note": "Tests automatic expiration based on TTL"
      }
    },
    "redisHealth": {
      "connectionTest": "PASSED",
      "note": "Redis operations should work normally"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Cache Operations

#### Clear All Cache

**Endpoint**: `POST /api/cache/clear-all`

**Purpose**: Clear all cache entries from both memory and Redis

**Note**: This is the standard endpoint for clearing all caches. It clears both memory cache and Redis cache completely.

**Response**:

```json
{
  "success": true,
  "message": "All cache entries cleared successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Clear Namespace

**Endpoint**: `POST /api/cache/clear`

**Purpose**: Clear cache entries for a specific namespace

**Request Body**:

```json
{
  "namespace": "USER",
  "pattern": "*"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Cache namespace cleared successfully",
  "clearedKeys": 25,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Health & Monitoring API

### 1. System Health Check

**Endpoint**: `GET /api/health`

**Purpose**: Comprehensive system health check

**Response Example**:

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "healthy",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connectionPool": {
        "active": 5,
        "idle": 10,
        "total": 15
      }
    },
    "redis": {
      "status": "healthy",
      "responseTime": 8,
      "memoryUsage": "256MB",
      "connectedClients": 3
    },
    "cache": {
      "status": "healthy",
      "memoryCacheSize": 156,
      "redisCacheSize": 1024
    }
  },
  "system": {
    "uptime": 86400,
    "memoryUsage": "512MB",
    "cpuUsage": "15%",
    "version": "1.0.0"
  }
}
```

## User Management API

### 1. Get Current User

**Endpoint**: `GET /api/user/me`

**Authentication**: Required

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "gameplayer",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Basketball enthusiast"
    },
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "timezone": "America/New_York"
    },
    "statistics": {
      "gamesPlayed": 45,
      "totalPoints": 1250,
      "winRate": 0.68,
      "lastActive": "2024-01-15T10:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get User by ID

**Endpoint**: `GET /api/user/[id]`

**Parameters**: `id` - User identifier

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "user_456",
    "username": "basketballfan",
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "https://example.com/avatar2.jpg",
      "bio": "Lakers fan since 1995"
    },
    "statistics": {
      "gamesPlayed": 32,
      "totalPoints": 890,
      "winRate": 0.56,
      "lastActive": "2024-01-15T09:30:00.000Z"
    },
    "achievements": [
      {
        "id": "ach_001",
        "name": "First Game",
        "description": "Played your first game",
        "earnedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get User Game Logs

**Endpoint**: `GET /api/user/game-logs`

**Authentication**: Required

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `filter` (optional): Filter criteria (JSON string)

**Response Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "game_001",
      "date": "2024-01-15T08:00:00.000Z",
      "opponent": "Team Alpha",
      "result": "win",
      "score": "105-98",
      "personalStats": {
        "points": 18,
        "rebounds": 5,
        "assists": 3,
        "steals": 1
      },
      "teamStats": {
        "teamScore": 105,
        "opponentScore": 98,
        "teamName": "Your Team"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Player Management API

### 1. List Players

**Endpoint**: `GET /api/players`

**Query Parameters**:

- `search` (optional): Player name search
- `team` (optional): Filter by team ID
- `position` (optional): Filter by position (PG, SG, SF, PF, C)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "player_001",
      "name": "LeBron James",
      "team": {
        "id": "team_001",
        "name": "Los Angeles Lakers",
        "abbreviation": "LAL"
      },
      "position": "SF",
      "number": 23,
      "height": "6'9\"",
      "weight": "250 lbs",
      "statistics": {
        "pointsPerGame": 25.4,
        "reboundsPerGame": 7.2,
        "assistsPerGame": 7.8,
        "fieldGoalPercentage": 0.504
      },
      "image": "https://example.com/lebron.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Player by ID

**Endpoint**: `GET /api/players/[playerId]`

**Parameters**: `playerId` - Player identifier

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "player_001",
    "name": "LeBron James",
    "team": {
      "id": "team_001",
      "name": "Los Angeles Lakers",
      "abbreviation": "LAL",
      "conference": "Western",
      "division": "Pacific"
    },
    "position": "SF",
    "number": 23,
    "height": "6'9\"",
    "weight": "250 lbs",
    "birthDate": "1984-12-30",
    "college": "St. Vincent-St. Mary HS (OH)",
    "draftYear": 2003,
    "draftRound": 1,
    "draftNumber": 1,
    "statistics": {
      "career": {
        "gamesPlayed": 1421,
        "pointsPerGame": 27.1,
        "reboundsPerGame": 7.5,
        "assistsPerGame": 7.3,
        "stealsPerGame": 1.5,
        "blocksPerGame": 0.8,
        "fieldGoalPercentage": 0.504,
        "threePointPercentage": 0.345,
        "freeThrowPercentage": 0.735
      },
      "season": {
        "gamesPlayed": 45,
        "pointsPerGame": 25.4,
        "reboundsPerGame": 7.2,
        "assistsPerGame": 7.8,
        "stealsPerGame": 1.2,
        "blocksPerGame": 0.6,
        "fieldGoalPercentage": 0.504,
        "threePointPercentage": 0.345,
        "freeThrowPercentage": 0.735
      }
    },
    "achievements": [
      {
        "id": "ach_001",
        "name": "NBA Champion",
        "count": 4,
        "years": [2012, 2013, 2016, 2020]
      }
    ],
    "image": "https://example.com/lebron.jpg",
    "lastUpdated": "2024-01-15T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Team Management API

### 1. List Teams

**Endpoint**: `GET /api/teams`

**Query Parameters**:

- `search` (optional): Team name search
- `conference` (optional): Filter by conference (Eastern, Western)
- `division` (optional): Filter by division
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "team_001",
      "name": "Los Angeles Lakers",
      "abbreviation": "LAL",
      "conference": "Western",
      "division": "Pacific",
      "city": "Los Angeles",
      "state": "CA",
      "arena": "Crypto.com Arena",
      "founded": 1947,
      "colors": ["#552583", "#FDB927"],
      "logo": "https://example.com/lakers-logo.png",
      "statistics": {
        "wins": 25,
        "losses": 20,
        "winPercentage": 0.556,
        "conferenceRank": 6,
        "divisionRank": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "pages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Game Management API

### 1. List Games

**Endpoint**: `GET /api/games`

**Query Parameters**:

- `date` (optional): Game date filter (YYYY-MM-DD)
- `team` (optional): Filter by team ID
- `player` (optional): Filter by player ID
- `status` (optional): Game status (scheduled, live, final)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "game_001",
      "date": "2024-01-15T19:30:00.000Z",
      "status": "scheduled",
      "homeTeam": {
        "id": "team_001",
        "name": "Los Angeles Lakers",
        "abbreviation": "LAL",
        "score": null
      },
      "awayTeam": {
        "id": "team_002",
        "name": "Golden State Warriors",
        "abbreviation": "GSW",
        "score": null
      },
      "venue": "Crypto.com Arena",
      "broadcast": "ESPN",
      "odds": {
        "homeTeam": -3.5,
        "awayTeam": +3.5,
        "overUnder": 225.5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1230,
    "pages": 62,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Search API

### 1. Global Search

**Endpoint**: `GET /api/search`

**Query Parameters**:

- `q` (required): Search query
- `type` (optional): Entity type filter (players, teams, games, users)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sort` (optional): Sort order (relevance, name, date)

**Response Example**:

```json
{
  "success": true,
  "data": {
    "query": "lebron",
    "totalResults": 15,
    "results": [
      {
        "type": "player",
        "id": "player_001",
        "name": "LeBron James",
        "relevance": 0.95,
        "snippet": "LeBron James is a professional basketball player...",
        "metadata": {
          "team": "Los Angeles Lakers",
          "position": "SF",
          "pointsPerGame": 25.4
        }
      },
      {
        "type": "team",
        "id": "team_001",
        "name": "Los Angeles Lakers",
        "relevance": 0.85,
        "snippet": "The Los Angeles Lakers are a professional basketball team...",
        "metadata": {
          "conference": "Western",
          "division": "Pacific",
          "wins": 25
        }
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Codes

### HTTP Status Codes

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | Success               |
| 201         | Created               |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Not Found             |
| 422         | Validation Error      |
| 429         | Too Many Requests     |
| 500         | Internal Server Error |
| 502         | Bad Gateway           |
| 503         | Service Unavailable   |

### Application Error Codes

| Error Code                 | Description                     | HTTP Status |
| -------------------------- | ------------------------------- | ----------- |
| `AUTH_REQUIRED`            | Authentication required         | 401         |
| `INVALID_TOKEN`            | Invalid or expired token        | 401         |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | 403         |
| `RESOURCE_NOT_FOUND`       | Requested resource not found    | 404         |
| `VALIDATION_ERROR`         | Request validation failed       | 422         |
| `RATE_LIMIT_EXCEEDED`      | Rate limit exceeded             | 429         |
| `CACHE_ERROR`              | Cache operation failed          | 500         |
| `DATABASE_ERROR`           | Database operation failed       | 500         |
| `EXTERNAL_API_ERROR`       | External API call failed        | 502         |

### Error Response Examples

#### Validation Error

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Rate Limit Exceeded

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Authentication Required

```json
{
  "success": false,
  "error": "AUTH_REQUIRED",
  "message": "Authentication required for this endpoint",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

### Rate Limit Rules

| Endpoint Type    | Requests per Minute | Burst Limit |
| ---------------- | ------------------- | ----------- |
| Public           | 100                 | 200         |
| Authenticated    | 1000                | 2000        |
| Admin            | 5000                | 10000       |
| Cache Operations | 500                 | 1000        |
| Health Checks    | 200                 | 500         |

## Caching

### Cache Headers

```http
Cache-Control: public, max-age=300
ETag: "abc123def456"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
```

### Cache Strategy

| Data Type      | Cache Duration | Cache Level    |
| -------------- | -------------- | -------------- |
| Static Data    | 1 hour         | CDN + Browser  |
| User Data      | 5 minutes      | Memory + Redis |
| Game Data      | 1 minute       | Memory + Redis |
| Search Results | 15 minutes     | Memory + Redis |
| Health Checks  | 30 seconds     | Memory only    |

## Testing

### Health Check Endpoints

```bash
# System health
curl http://localhost:3000/api/health

# Cache health
curl http://localhost:3000/api/cache/health

# Redis testing
pnpm test:redis

# Cache eviction testing
pnpm cache:test-eviction
```

### Test Data

For development and testing, use the mock server endpoints:

```bash
# Get mock players
curl http://localhost:3000/api/mock-server/players

# Get mock games
curl http://localhost:3000/api/mock-server/games

# Get mock teams
curl http://localhost:3000/api/mock-server/teams
```

## SDK Examples

### JavaScript/TypeScript

```typescript
class GameDiaryAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL;
    this.token = token || '';
  }

  async getPlayer(id: string) {
    const response = await fetch(`${this.baseURL}/players/${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async searchPlayers(query: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${this.baseURL}/players?${params}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const api = new GameDiaryAPI('https://api.game-diary.io', 'your-token');
const player = await api.getPlayer('player_001');
const searchResults = await api.searchPlayers('lebron');
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class GameDiaryAPI:
    def __init__(self, base_url: str, token: Optional[str] = None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()

        if token:
            self.session.headers.update({
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            })

    def get_player(self, player_id: str) -> Dict[str, Any]:
        response = self.session.get(f'{self.base_url}/players/{player_id}')
        response.raise_for_status()
        return response.json()

    def search_players(self, query: str, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        params = {
            'search': query,
            'page': page,
            'limit': limit
        }
        response = self.session.get(f'{self.base_url}/players', params=params)
        response.raise_for_status()
        return response.json()

# Usage
api = GameDiaryAPI('https://api.game-diary.io', 'your-token')
player = api.get_player('player_001')
search_results = api.search_players('lebron')
```

---

This API reference is maintained by the development team and updated with each release. For questions or suggestions, please contact the team or create an issue in the project repository.
