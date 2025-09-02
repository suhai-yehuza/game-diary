# NBA Data Caching Services

This directory contains the NBA data caching services that implement comprehensive caching for NBA API data as requested in the notes.txt file.

## Services

### 1. NBA Cache Service (`nba-cache-service.ts`)

The main service that handles fetching and caching NBA data from the external API.

**Features:**

- ✅ Fetches and caches seasons data with key `v2.nba.api-sports.io/seasons`
- ✅ Fetches and caches teams data with key `v2.nba.api-sports.io/teams`
- ✅ Fetches and caches games for each season with keys `v2.nba.api-sports.io/games?season=$season`
- ✅ Creates aggregated games summary with key `v2.nba.api-sports.io/games`
- ✅ Fetches and caches players for each team+season combination with keys `v2.nba.api-sports.io/players?team=$teamId&season=$season`
- ✅ Creates aggregated players summary with key `v2.nba.api-sports.io/players`

**Usage:**

```typescript
import { nbaCacheService } from '@/lib/services/nba-cache-service';

// Initialize all NBA data caching
await nbaCacheService.initializeNbaDataCache();

// Or fetch individual data types
const seasons = await nbaCacheService.fetchAndCacheSeasons();
const teams = await nbaCacheService.fetchAndCacheTeams();
```

### 2. Startup Cache Service (`startup-cache-service.ts`)

Handles initialization of caching when the application starts.

**Features:**

- ✅ Automatic initialization on app startup
- ✅ Idempotent initialization (safe to call multiple times)
- ✅ Environment-aware (skips in test/CI environments)
- ✅ Error handling with graceful fallback

**Usage:**

```typescript
import { startupCacheService } from '@/lib/services/startup-cache-service';

// Initialize cache (called automatically on app startup)
await startupCacheService.initialize();

// Force re-initialization
await startupCacheService.forceReinitialize();

// Check status
const status = await startupCacheService.getCacheStatus();
```

## API Endpoints

### Cache Initialization API (`/api/cache/init`)

Manual control over cache initialization.

**Endpoints:**

- `POST /api/cache/init` - Trigger cache initialization
- `POST /api/cache/init?force=true` - Force re-initialization
- `GET /api/cache/init` - Get cache status
- `DELETE /api/cache/init` - Clear cache (not yet implemented)

**Example Usage:**

```bash
# Trigger cache initialization
curl -X POST http://localhost:3000/api/cache/init

# Force re-initialization
curl -X POST "http://localhost:3000/api/cache/init?force=true"

# Get cache status
curl http://localhost:3000/api/cache/init
```

## Integration

### Client-Side Integration

The cache initialization is automatically integrated into the app through:

1. **CacheInitializer Component** - Triggers cache initialization on app load
2. **CacheStatusDisplay Component** - Development tool to monitor cache status
3. **ClientProviders** - Includes both components in the app

### Server-Side Integration

The startup cache service automatically initializes when the module is imported on the server side.

## Cache Keys

The service uses the exact cache keys specified in the requirements:

- `v2.nba.api-sports.io/seasons` - Seasons data
- `v2.nba.api-sports.io/teams` - Teams data
- `v2.nba.api-sports.io/games?season=$season` - Games for specific season
- `v2.nba.api-sports.io/games` - Aggregated games summary
- `v2.nba.api-sports.io/players?team=$teamId&season=$season` - Players for team+season
- `v2.nba.api-sports.io/players` - Aggregated players summary

## Data Structures

### Games Summary

```typescript
{
  numberOfSeasons: 10,
  totalGames: 14468,
  seasons: [
    { "2024": 1406 },
    { "2023": 1400 },
    // ... more seasons
  ],
  timestamp: 1756660147263,
  priority: "high"
}
```

### Players Summary

```typescript
{
  numberOfSeasons: 10,
  numberOfTeams: 30,
  totalPlayers: 14468,
  players: [
    { "team=1&season=2024": 15 },
    { "team=2&season=2024": 16 },
    // ... more team+season combinations
  ],
  timestamp: 1756660147263,
  priority: "high"
}
```

## Environment Configuration

The services use the Redis configuration from environment variables:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL="https://accurate-blowfish-5047.upstash.io"
UPSTASH_REDIS_REST_TOKEN="ARO3AAImcDEwNDdkZmU1NmU4MzI0ZDZiOTM4YTdlMGY2ZTZiMTZkNnAxNTA0Nw"
KV_URL="rediss://default:ARO3AAImcDEwNDdkZmU1NmU4MzI0ZDZiOTM4YTdlMGY2ZTZiMTZkNnAxNTA0Nw@accurate-blowfish-5047.upstash.io:6379"
REDIS_URL="rediss://default:ARO3AAImcDEwNDdkZmU1NmU4MzI0ZDZiOTM4YTdlMGY2ZTZiMTZkNnAxNTA0Nw@accurate-blowfish-5047.upstash.io:6379"
```

## Error Handling

All services include comprehensive error handling:

- API request failures are logged and re-thrown
- Cache failures fall back gracefully
- Initialization errors don't prevent app startup
- All errors are tracked through the centralized error handler

## Performance Considerations

- **Batch Processing**: Player data is fetched in batches to avoid API rate limits
- **Parallel Processing**: Games for different seasons are fetched in parallel
- **Caching Strategy**: High priority caching with 1-hour TTL for all data
- **Memory + Redis**: Hybrid caching with memory fallback for optimal performance

## Development Tools

In development mode, a cache status display is available in the bottom-right corner of the app that shows:

- Initialization status
- Cache status details
- Manual re-initialization buttons
- API endpoint testing

## Testing

The services are designed to work in all environments:

- **Development**: Full functionality with real API calls
- **Production**: Full functionality with real API calls
- **Test/CI**: Automatic skipping to avoid external dependencies
