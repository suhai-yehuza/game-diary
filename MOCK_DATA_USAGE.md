# Mock Data Usage

This application supports using mock data for development and testing purposes. This is particularly useful when you want to test the live games banner or other features that depend on real-time data.

## Quick Start

### Using Mock Data

```bash
# Start development server with mock data
npm run dev:mock

# Or use the environment variable directly
API_MOCK_MODE=true npm run dev
```

### Using Real Data

```bash
# Start development server with real data (default)
npm run dev

# Or explicitly
npm run dev:real
```

### Toggle Between Modes

```bash
# Use the toggle script
./scripts/toggle-mock-mode.sh
```

## How It Works

### Environment Variable Control

The mock data feature is controlled by the `API_MOCK_MODE` environment variable:

- `API_MOCK_MODE=true` - Uses mock data
- `API_MOCK_MODE` not set or any other value - Uses real API data

### Components Affected

1. **Live Games Banner** (`src/app/components/LiveGamesBanner.tsx`)
   - Shows mock live games when `API_MOCK_MODE=true`
   - Shows real live games when available
   - Shows nothing when no games are available

2. **useLiveGames Hook** (`src/hooks/use-live-games.ts`)
   - Fetches from mock server endpoint when `API_MOCK_MODE=true`
   - Fetches from real API endpoint otherwise

### Mock Data Sources

- **Live Games**: `src/lib/mock/liveGamesMock.ts`
- **Mock Server**: `src/app/api/mock-server/route.ts`

## Development Workflow

### Testing the Live Games Banner

1. **With Mock Data** (always shows games):

   ```bash
   npm run dev:mock
   ```

   The banner will always show 8 mock live games.

2. **With Real Data** (shows actual games):
   ```bash
   npm run dev:real
   ```
   The banner will only show when there are actual live games happening.

### Switching Between Modes

You can switch between modes without restarting the server by using the toggle script:

```bash
# Switch to mock mode
./scripts/toggle-mock-mode.sh

# Start server with current mode
npm run dev
```

## Technical Details

### Server-Side vs Client-Side

The mock data logic works on both server and client:

- **Server-side**: Uses `process.env.API_MOCK_MODE`
- **Client-side**: Uses `window.__API_MOCK_MODE__` (set by `E2ETestSetup` component)

### Hydration Safety

The implementation ensures no hydration mismatches by:

1. Using consistent logic between server and client
2. Only rendering mock data when explicitly enabled
3. Proper fallback handling for missing data

### Environment Detection

The system checks for mock mode in this order:

1. `window.__API_MOCK_MODE__` (client-side)
2. `process.env.API_MOCK_MODE === 'true'` (server-side)
3. `isTestOrCIEnvironment()` (for test environments)

## Troubleshooting

### Banner Not Showing

If the live games banner is not showing:

1. **Check environment variable**:

   ```bash
   echo $API_MOCK_MODE
   ```

2. **Check if mock server is working**:

   ```bash
   curl "http://localhost:3000/api/mock-server?action=mock-data&type=live-games"
   ```

3. **Check browser console** for any errors

### Mock Data Not Loading

If mock data is not loading:

1. **Restart the development server** after changing environment variables
2. **Clear browser cache** and refresh the page
3. **Check the network tab** in browser dev tools for API calls

## Examples

### Mock Data Response

```json
{
  "get": "games/",
  "parameters": { "live": "all" },
  "errors": [],
  "results": 8,
  "response": [
    {
      "id": 123456,
      "teams": {
        "visitors": { "name": "Boston Celtics", "code": "BOS" },
        "home": { "name": "New York Knicks", "code": "NYK" }
      },
      "scores": {
        "visitors": { "points": 95 },
        "home": { "points": 85 }
      },
      "status": { "clock": "5:30", "short": "Q3" }
    }
  ]
}
```

### Real Data Response

```json
{
  "get": "games/",
  "parameters": { "live": "all" },
  "errors": [],
  "results": 0,
  "response": []
}
```
