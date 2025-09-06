# Database Index Maintenance Guide

## 🗄️ **Index Retention Strategy**

### ✅ **Automatic Retention**

Database indexes are **permanent** and persist across:

- Server restarts
- Application deployments
- Database connections/disconnections
- Code changes

### 🔧 **Maintenance Commands**

#### Check Index Status

```bash
# Check all environments
npx tsx scripts/db/reset-with-env.ts --env=development
npx tsx scripts/db/reset-with-env.ts --env=production

# Check specific environment
npx tsx scripts/db/reset-with-env.ts --env=development
npx tsx scripts/db/reset-with-env.ts --env=production
```

#### Apply Missing Indexes

```bash
# Apply to all environments
npx tsx scripts/db/reset-with-env.ts --env=development
npx tsx scripts/db/reset-with-env.ts --env=production

# Apply to specific environment
npx tsx scripts/db/reset-with-env.ts --env=development
npx tsx scripts/db/reset-with-env.ts --env=production
```

### 🚀 **Deployment Pipeline Integration**

#### Pre-Deployment Checklist

- [ ] Run index maintenance check
- [ ] Verify all performance indexes exist
- [ ] Test query performance

#### Post-Deployment Checklist

- [ ] Verify indexes survived deployment
- [ ] Run performance tests
- [ ] Monitor query execution times

### 📊 **Index Monitoring**

#### Current Performance Indexes

1. `idx_game_logs_created_at_desc` - Primary performance index
2. `idx_game_logs_user_created_at` - User-specific queries
3. `idx_game_logs_classification_created_at` - Public/Friends tabs
4. `idx_game_logs_composite_common` - Common filters
5. `idx_basketball_games_away_team` - JOIN performance
6. `idx_basketball_games_date` - Date-based queries

#### Performance Targets

- **User Game Logs**: < 100ms
- **Public Game Logs**: < 100ms
- **Recent Game Logs**: < 300ms

### 🛡️ **Backup & Recovery**

#### Before Database Backups

```bash
# Ensure all indexes are present
npx tsx scripts/db/reset-with-env.ts --env=production
```

#### After Database Restore

```bash
# Recreate any missing indexes
npx tsx scripts/db/reset-with-env.ts --env=production
```

### 🔄 **Regular Maintenance**

#### Weekly Tasks

- [ ] Check index status
- [ ] Review query performance
- [ ] Monitor index usage statistics

#### Monthly Tasks

- [ ] Analyze slow queries
- [ ] Update table statistics (`ANALYZE`)
- [ ] Review index effectiveness

### 🚨 **Troubleshooting**

#### Missing Indexes

If indexes are missing after deployment:

1. Run maintenance check: `npx tsx scripts/db/reset-with-env.ts --env=production`
2. Apply missing indexes: `npx tsx scripts/db/reset-with-env.ts --env=production`
3. Verify performance: Test Game Logs page

#### Slow Queries

If queries are still slow:

1. Check if indexes exist
2. Verify query execution plan
3. Consider additional indexes
4. Review data volume

### 📁 **File Locations**

- **Index Definitions**: `src/lib/db/migrations/0001_performance_indexes.sql`
- **Application Script**: `scripts/db/reset-with-env.ts`
- **Maintenance Script**: `scripts/db/reset-with-env.ts`
- **Documentation**: `docs/DATABASE_INDEX_MAINTENANCE.md`

### 🎯 **Best Practices**

1. **Always use `IF NOT EXISTS`** - Prevents errors on re-run
2. **Use `CONCURRENTLY`** - Non-blocking index creation
3. **Monitor regularly** - Check index status and usage
4. **Test after changes** - Verify performance improvements
5. **Document changes** - Keep maintenance records

---

**Note**: Indexes are permanent database objects. Once created, they persist until explicitly dropped. The maintenance scripts ensure they exist and provide monitoring capabilities.
