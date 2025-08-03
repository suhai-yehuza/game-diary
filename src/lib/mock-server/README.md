# Mock Server for E2E Testing

A comprehensive mock server that mimics external APIs and database operations with artificial latency for realistic E2E testing.

## Features

### 🚀 Realistic API Simulation

- **Artificial Latency**: Configurable latency between 50-300ms to simulate real network conditions
- **Error Simulation**: 5% error rate with realistic error responses (rate limiting, server errors, etc.)
- **Concurrent Request Handling**: Proper handling of multiple simultaneous requests
- **Realistic Data**: Comprehensive mock data that matches the actual API structure

### 🗄️ Database Mocking

- **Full CRUD Operations**: SELECT, INSERT, UPDATE, DELETE operations
- **Realistic Data Generation**: Users, game logs, friendships, comments, reactions, notifications
- **NBA Data**: Teams, players, games, standings, statistics
- **Data Relationships**: Proper foreign key relationships and realistic data distribution

### 📊 Monitoring & Statistics

- **Health Checks**: Server status and configuration
- **Request Statistics**: Total requests, success rate, average latency
- **Memory Usage**: Process memory consumption
- **Uptime Tracking**: Server uptime monitoring

## Configuration

### Mock Server Config

```typescript
interface MockServerConfig {
  port: number; // Server port (default: 3001)
  latency: {
    min: number; // Minimum latency in ms (default: 50)
    max: number; // Maximum latency in ms (default: 300)
  };
  errorRate: number; // Error rate as decimal (default: 0.05)
  enableLogging: boolean; // Enable debug logging (default: true)
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  port: 3001,
  latency: {
    min: 50, // 50ms minimum latency
    max: 300, // 300ms maximum latency
  },
  errorRate: 0.05, // 5% error rate
  enableLogging: true,
};
```

## API Endpoints

### Health Check

```http
GET /api/mock-server?action=health
```

Returns server health status and configuration.

### Mock Data

```http
GET /api/mock-server?action=mock-data&type={type}
```

Available types: `live-games`, `nba-games`, `nba-teams`, `nba-players`, `nba-standings`, `nba-statistics`

### External API Simulation

```http
GET /api/mock-server?action=external-api&endpoint={endpoint}&params={json}
```

Simulates external API calls with artificial latency and error simulation.

### Database Operations

```http
GET /api/mock-server?action=database&operation={op}&table={table}&data={json}
POST /api/mock-server?action=database
```

Available operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
Available tables: `users`, `game_logs`, `friendships`, `comments`, `reactions`, `notifications`, `nba_games`, `teams`, `nba_players`

### Server Statistics

```http
GET /api/mock-server?action=stats
```

Returns server statistics including request counts, success rates, and memory usage.

## Usage Examples

### Basic Health Check

```typescript
const response = await fetch('/api/mock-server?action=health');
const health = await response.json();
console.log(health.status); // 'healthy'
```

### Get Mock NBA Games

```typescript
const response = await fetch('/api/mock-server?action=mock-data&type=nba-games');
const data = await response.json();
console.log(data.data); // Array of NBA games
```

### Simulate External API Call

```typescript
const response = await fetch('/api/mock-server?action=external-api&endpoint=teams');
const data = await response.json();
console.log(data.latency); // Artificial latency in ms
```

### Database Query

```typescript
const response = await fetch('/api/mock-server?action=database&operation=SELECT&table=users');
const data = await response.json();
console.log(data.data); // Array of users
```

### Database Insert

```typescript
const response = await fetch('/api/mock-server?action=database', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'INSERT',
    table: 'game_logs',
    data: {
      user_id: 'user_1',
      game_id: 'game_123',
      title: 'Amazing Game!',
      content: 'What a great game today!',
      rating: 5,
    },
  }),
});
const result = await response.json();
console.log(result.data.id); // Generated ID
```

## Mock Data Structure

### Users

```typescript
interface MockUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Game Logs

```typescript
interface MockGameLog {
  id: string;
  user_id: string;
  game_id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}
```

### NBA Games

```typescript
interface MockNBAGame {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'live' | 'finished';
  date: string;
  season: string;
  league: string;
}
```

## Error Simulation

The mock server simulates various error conditions:

### Rate Limiting

```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "latency": 150
}
```

### Invalid API Key

```json
{
  "success": false,
  "error": "The provided API key is invalid or expired.",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "latency": 120
}
```

### Server Error

```json
{
  "success": false,
  "error": "An unexpected error occurred. Please try again.",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "latency": 200
}
```

## Testing

### E2E Test Example

```typescript
test('should handle mock server requests', async ({ page }) => {
  await setupE2EMocking(page);

  const response = await page.request.get('/api/mock-server?action=health');
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.status).toBe('healthy');
});
```

### Performance Testing

```typescript
test('should handle concurrent requests', async ({ page }) => {
  const requests = [
    page.request.get('/api/mock-server?action=mock-data&type=nba-games'),
    page.request.get('/api/mock-server?action=external-api&endpoint=teams'),
    page.request.get('/api/mock-server?action=database&operation=SELECT&table=users'),
  ];

  const responses = await Promise.all(requests);
  responses.forEach(response => expect(response.status()).toBe(200));
});
```

## Integration with E2E Tests

The mock server integrates seamlessly with the existing E2E testing infrastructure:

1. **Automatic Setup**: Mock server is automatically started with E2E tests
2. **Realistic Latency**: Tests experience realistic network conditions
3. **Error Simulation**: Tests can handle and verify error conditions
4. **Data Consistency**: Mock data maintains relationships and constraints

## Benefits

### 🎯 Realistic Testing

- Tests run against realistic API responses
- Artificial latency simulates real network conditions
- Error conditions are properly tested

### 🚀 Performance

- No external API dependencies
- Consistent response times
- No rate limiting issues

### 🔧 Maintainability

- Centralized mock data management
- Easy to update and extend
- Comprehensive error simulation

### 📊 Monitoring

- Built-in statistics and monitoring
- Health check endpoints
- Request tracking and analysis

## Future Enhancements

- **Dynamic Configuration**: Runtime configuration changes
- **Custom Error Patterns**: User-defined error simulation
- **Data Persistence**: Mock data persistence across test runs
- **Advanced Latency Models**: More sophisticated latency simulation
- **WebSocket Support**: Real-time mock data updates
