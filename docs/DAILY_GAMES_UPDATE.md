# Hourly Basketball Games Update System

This system automatically updates the basketball_games table with new games from the NBA API on an hourly basis during peak game hours, ensuring your database stays current with the latest game data.

## Overview

The hourly games update system consists of:

1. **Update Script** (`scripts/update-daily-games.ts`) - Core logic for fetching and updating games
2. **GitHub Actions Workflow** (`.github/workflows/daily-games-update.yml`) - Automated hourly execution during peak hours
3. **API Endpoint** (`/api/admin/update-games`) - Manual triggering via HTTP
4. **Package Scripts** - Easy command-line access

## Scheduling Strategy

### Peak NBA Game Hours

The system runs hourly during peak NBA game hours:

**Weekdays (Monday-Friday):**

- **6 PM - 11 PM Eastern Time** (11 PM - 4 AM UTC)
- Games typically start around 7-8 PM Eastern

**Weekends (Saturday-Sunday):**

- **1 PM - 11 PM Eastern Time** (6 PM - 4 AM UTC)
- Games start earlier on weekends, around 1-3 PM Eastern

### Cron Schedule Breakdown

```
Weekdays (Mon-Fri):
├── 11 PM UTC (6 PM Eastern) - Start of evening games
├── 12 AM UTC (7 PM Eastern) - Peak game hours
├── 1 AM UTC (8 PM Eastern) - Peak game hours
├── 2 AM UTC (9 PM Eastern) - Peak game hours
└── 3 AM UTC (10 PM Eastern) - Peak game hours

Weekends (Sat-Sun):
├── 6 PM UTC (1 PM Eastern) - Afternoon games
├── 7 PM UTC (2 PM Eastern) - Afternoon games
├── 8 PM UTC (3 PM Eastern) - Afternoon games
├── 9 PM UTC (4 PM Eastern) - Afternoon games
├── 10 PM UTC (5 PM Eastern) - Afternoon games
├── 11 PM UTC (6 PM Eastern) - Evening games
├── 12 AM UTC (7 PM Eastern) - Evening games
├── 1 AM UTC (8 PM Eastern) - Evening games
├── 2 AM UTC (9 PM Eastern) - Evening games
└── 3 AM UTC (10 PM Eastern) - Evening games
```

### Timezone Coverage

The schedule covers all major U.S. timezones:

- **Eastern Time (ET)**: Primary coverage zone
- **Central Time (CT)**: 5 PM - 10 PM CT (6 PM - 11 PM ET)
- **Mountain Time (MT)**: 4 PM - 9 PM MT (6 PM - 11 PM ET)
- **Pacific Time (PT)**: 3 PM - 8 PM PT (6 PM - 11 PM ET)

## Features

- ✅ **Incremental Updates**: Only adds games that don't exist in the database
- ✅ **Date Range Support**: Update games for specific dates or date ranges
- ✅ **Season Support**: Update games for specific NBA seasons
- ✅ **Dry Run Mode**: Preview changes without modifying the database
- ✅ **Error Handling**: Comprehensive error handling with retry logic
- ✅ **Logging**: Detailed logging for monitoring and debugging
- ✅ **Environment Aware**: Works in development, staging, and production

## Usage

### Command Line Interface

#### Basic Usage

```bash
# Update today's games
pnpm update:daily-games

# Update games for a specific date
pnpm update:daily-games --date=2024-01-15

# Update games for a date range
pnpm update:daily-games --start-date=2024-01-01 --end-date=2024-01-31

# Update games for a specific season
pnpm update:daily-games --season=2024

# Preview changes without updating database (dry run)
pnpm update:daily-games --dry-run

# Show help information
pnpm update:daily-games --help
```

#### Available Scripts

- `pnpm update:daily-games` - Update today's games
- `pnpm update:daily-games:date` - Update games for a specific date
- `pnpm update:daily-games:range` - Update games for a date range
- `pnpm update:daily-games:season` - Update games for a specific season
- `pnpm update:daily-games:dry-run` - Preview changes
- `pnpm update:daily-games:help` - Show help

### API Endpoint

#### Manual Updates via HTTP

**Endpoint**: `POST /api/admin/update-games`

**Request Body**:

```json
{
  "date": "2024-01-15", // Optional: Specific date (YYYY-MM-DD)
  "startDate": "2024-01-01", // Optional: Start date for range
  "endDate": "2024-01-31", // Optional: End date for range
  "season": "2024", // Optional: Specific season (YYYY)
  "dryRun": false // Optional: Preview changes
}
```

**Response**:

```json
{
  "success": true,
  "result": {
    "totalFetched": 12,
    "newGames": 8,
    "updatedGames": 2,
    "skippedGames": 2,
    "errors": 0,
    "duration": 15420
  }
}
```

#### Examples

```bash
# Update today's games
curl -X POST http://localhost:3000/api/admin/update-games \
  -H "Content-Type: application/json" \
  -d '{}'

# Update specific date
curl -X POST http://localhost:3000/api/admin/update-games \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15"}'

# Preview changes
curl -X POST http://localhost:3000/api/admin/update-games \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Get API help
curl http://localhost:3000/api/admin/update-games
```

### GitHub Actions

#### Automated Hourly Execution

The system runs automatically every hour during peak NBA game hours via GitHub Actions.

**Workflow**: `.github/workflows/daily-games-update.yml`

**Schedule**:

- **Weekdays**: Every hour from 11 PM - 4 AM UTC (6 PM - 11 PM Eastern)
- **Weekends**: Every hour from 6 PM - 4 AM UTC (1 PM - 11 PM Eastern)
- **Transitions**: Bridge runs at 11 PM UTC on Saturday and Sunday to ensure continuous coverage

#### Manual Triggering

You can manually trigger the workflow from the GitHub Actions tab with custom parameters:

- **Date**: Specific date to update
- **Season**: Specific season to update
- **Dry Run**: Preview changes without updating database

## Configuration

### Environment Variables

The system requires the following environment variables:

```bash
# Database connection
DATABASE_URL=postgresql://...

# NBA API credentials
NEXT_PUBLIC_RAPID_API_KEY=your_api_key
NEXT_PUBLIC_RAPID_API_HOST=v2.nba.api-sports.io
NEXT_PUBLIC_RAPID_API_BASE_URL=https://v2.nba.api-sports.io
```

### NBA API Configuration

The system uses the existing RapidAPI configuration from your app:

- **Base URL**: `https://v2.nba.api-sports.io`
- **Endpoint**: `/games`
- **Rate Limiting**: Built-in exponential backoff
- **Error Handling**: Comprehensive retry logic

## Database Operations

### Game Insertion

The system performs the following database operations:

1. **Fetch Games**: Retrieves games from NBA API for specified date/season
2. **Check Existence**: Verifies if games already exist in database
3. **Insert New Games**: Adds only new games (idempotent operation)
4. **Update Existing**: Updates game status and scores for existing games
5. **Log Results**: Records detailed operation results

### Data Structure

Games are stored in the `basketball_games` table with the following key fields:

- `id`: `${season}-${game.id}` (e.g., "2024-12345")
- `season`: Season year (e.g., "2024")
- `game_id`: Original NBA API game ID
- `date`: Game date and time
- `teams`: Complete team information (JSONB)
- `status`: Game status (JSONB)
- `scores`: Game scores and statistics (JSONB)
- `arena`: Arena information (JSONB)
- `periods`: Period-by-period data (JSONB)

## Error Handling

### API Errors

- **Rate Limiting**: Automatic exponential backoff
- **Network Issues**: Retry with increasing delays
- **Invalid Responses**: Graceful error handling and logging

### Database Errors

- **Connection Issues**: Automatic retry logic
- **Constraint Violations**: Detailed error logging
- **Partial Failures**: Continue processing remaining games

### Validation Errors

- **Date Format**: Validates YYYY-MM-DD format
- **Season Format**: Validates YYYY format
- **Required Fields**: Ensures all necessary data is present

## Monitoring and Logging

### Log Levels

- **INFO**: General operation information
- **DEBUG**: Detailed processing information
- **WARN**: Non-critical issues
- **ERROR**: Critical failures

### Log Examples

```
🏀 Starting daily basketball games update...
📅 Update range: 2024-01-15 to 2024-01-15
🏆 Season: 2024
📡 Fetching games from NBA API for date: 2024-01-15
📊 Fetched 12 games from API
✅ Inserted new game: 12345
⏭️  Game 12346 already exists, skipping
📊 Update Summary:
   Total fetched: 12
   New games: 8
   Updated games: 2
   Skipped games: 2
   Errors: 0
   Duration: 15420ms
✅ Daily games update completed successfully
```

### Monitoring

- **GitHub Actions**: Check workflow runs for success/failure
- **API Endpoint**: Monitor manual update requests
- **Database Logs**: Review operation results and errors
- **Application Logs**: Check for any system issues

## Troubleshooting

### Common Issues

#### API Rate Limiting

**Problem**: Too many requests to NBA API
**Solution**: The system includes automatic rate limiting with exponential backoff

#### Database Connection Issues

**Problem**: Cannot connect to database
**Solution**: Check DATABASE_URL environment variable and database availability

#### Invalid Date Format

**Problem**: Date parameter in wrong format
**Solution**: Use YYYY-MM-DD format (e.g., "2024-01-15")

#### Missing Games

**Problem**: Expected games not appearing
**Solution**: Check NBA API availability and game scheduling

### Debug Mode

Enable detailed logging by setting environment variables:

```bash
# Enable debug logging
DEBUG=true pnpm update:daily-games

# Dry run to preview changes
pnpm update:daily-games --dry-run
```

### Manual Verification

```bash
# Check recent games in database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM basketball_games WHERE date >= CURRENT_DATE - INTERVAL '7 days';"

# Check specific date
psql $DATABASE_URL -c "SELECT * FROM basketball_games WHERE date::date = '2024-01-15';"
```

## Best Practices

### Scheduling

- **Daily Updates**: Run at 6 AM UTC to catch overnight games
- **Manual Updates**: Use for specific dates or troubleshooting
- **Dry Runs**: Always test with --dry-run before production updates

### Monitoring

- **Check Logs**: Review GitHub Actions logs daily
- **Monitor Errors**: Watch for API or database errors
- **Verify Data**: Spot-check game data for accuracy

### Maintenance

- **Season Updates**: Update season parameter when NBA season changes
- **API Changes**: Monitor NBA API for changes or deprecations
- **Database Maintenance**: Regular cleanup of old or invalid data

## Security Considerations

### API Access

- **API Keys**: Store securely in environment variables
- **Rate Limiting**: Respect NBA API rate limits
- **Error Handling**: Don't expose sensitive information in logs

### Database Access

- **Connection Security**: Use secure database connections
- **Access Control**: Limit database access to necessary operations
- **Audit Logging**: Log all database modifications

## Future Enhancements

### Planned Features

- **Real-time Updates**: WebSocket-based live game updates
- **Historical Backfill**: Bulk import of historical game data
- **Performance Metrics**: Detailed performance monitoring
- **Alert System**: Automated notifications for failures

### Integration Opportunities

- **Cache Warming**: Automatic cache updates after game updates
- **User Notifications**: Notify users of new games for their teams
- **Analytics**: Game update performance analytics
- **Backup System**: Automated backup before major updates

## Support

For issues or questions:

1. **Check Logs**: Review GitHub Actions and application logs
2. **Test Locally**: Run script locally with --dry-run
3. **API Status**: Verify NBA API availability
4. **Database**: Check database connectivity and permissions

## Contributing

When modifying the update system:

1. **Test Thoroughly**: Use --dry-run mode extensively
2. **Update Documentation**: Keep this documentation current
3. **Error Handling**: Ensure robust error handling
4. **Logging**: Add appropriate logging for debugging
5. **Performance**: Monitor and optimize performance
