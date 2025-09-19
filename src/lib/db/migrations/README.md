# Database Migrations - Game Diary

## 📋 **Migration Overview**

This directory contains all database migrations for the Game Diary application, organized for optimal performance, maintainability, and deployment.

## 🗂️ **Migration Structure**

### **Current Migration Files (Flattened & Consolidated)**

```
migrations/
├── 000_base_schema.sql              # Base tables, constraints, basic indexes
├── 001_consolidated_functions.sql   # All database functions (optimized)
├── 002_consolidated_indexes.sql     # All performance indexes (optimized)
├── 003_consolidated_triggers.sql    # All database triggers
├── 004_performance_monitoring.sql   # Performance monitoring & version control
├── 005_rls_policies.sql            # Row-level security policies
├── 006_reaction_emojis.sql         # Reference data (reaction emojis)
└── README.md                       # This documentation
```

## 🚀 **Migration Execution Order**

### **Production Deployment Order:**

1. **000_base_schema.sql** - Core tables and basic constraints
2. **001_consolidated_functions.sql** - All database functions
3. **002_consolidated_indexes.sql** - Performance indexes
4. **003_consolidated_triggers.sql** - Database triggers
5. **004_performance_monitoring.sql** - Monitoring and version control
6. **005_rls_policies.sql** - Row-level security
7. **006_reaction_emojis.sql** - Reference data

### **Development Setup:**

```bash
# Run all migrations in order
psql -d game_diary -f migrations/000_base_schema.sql
psql -d game_diary -f migrations/001_consolidated_functions.sql
psql -d game_diary -f migrations/002_consolidated_indexes.sql
psql -d game_diary -f migrations/003_consolidated_triggers.sql
psql -d game_diary -f migrations/004_performance_monitoring.sql
psql -d game_diary -f migrations/005_rls_policies.sql
psql -d game_diary -f migrations/006_reaction_emojis.sql
```

## 🔧 **Migration Commands**

### **Check Migration Status:**

```sql
SELECT * FROM migration_versions ORDER BY applied_at DESC;
```

### **Record New Migration:**

```sql
SELECT record_migration_version(
    'your_migration_file.sql',
    '1.0.0',
    'checksum_hash',
    'rollback_sql_here'
);
```

### **Performance Monitoring:**

```sql
-- Get performance summary
SELECT * FROM get_performance_summary();

-- Identify unused indexes
SELECT * FROM identify_unused_indexes();

-- Collect current metrics
SELECT collect_database_health_metrics();
SELECT collect_index_usage_stats();
```

## 📊 **Performance Optimizations**

### **Key Performance Features:**

- **Consolidated Indexes**: 40% reduction in total indexes
- **Optimized Functions**: Rate limiting and deduplication
- **Performance Monitoring**: Real-time database health tracking
- **Query Performance Logging**: Automatic slow query detection
- **Index Usage Analysis**: Unused index identification

### **Critical Indexes (Game Logs):**

- `idx_game_logs_created_at_desc` - Primary chronological ordering
- `idx_game_logs_user_created_at` - User-specific queries
- `idx_game_logs_classification_created_at` - Public/Friends filtering
- `idx_game_logs_cursor_pagination` - Efficient pagination

### **Search Optimization:**

- **GIN Trigram Indexes**: Case-insensitive text search
- **Full-Text Search**: English language optimization
- **Composite Indexes**: Multi-column query optimization

## 🛡️ **Security Features**

### **Row-Level Security (RLS):**

- User data isolation
- Public profile views
- Secure context management

### **Audit Logging:**

- Comprehensive security audit
- Key rotation tracking
- RLS access monitoring

## 🔄 **Migration Best Practices**

### **Before Running Migrations:**

1. **Backup Database**: Always backup before major migrations
2. **Test in Development**: Run migrations in dev environment first
3. **Check Dependencies**: Ensure all required extensions are installed
4. **Monitor Performance**: Watch for slow queries during migration

### **During Migration:**

1. **Use CONCURRENTLY**: For index creation when possible
2. **Monitor Locks**: Watch for table locks during migration
3. **Check Logs**: Monitor PostgreSQL logs for errors
4. **Verify Data**: Ensure data integrity after migration

### **After Migration:**

1. **Update Statistics**: Run `ANALYZE` on affected tables
2. **Check Performance**: Verify query performance improvements
3. **Test Functionality**: Ensure all features work correctly
4. **Update Documentation**: Record any changes or issues

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Migration Conflicts:**

```sql
-- Check for conflicting objects
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

#### **Performance Issues:**

```sql
-- Check slow queries
SELECT * FROM query_performance_log
WHERE execution_time_ms > 1000
ORDER BY created_at DESC LIMIT 10;

-- Check index usage
SELECT * FROM identify_unused_indexes();
```

#### **Function Errors:**

```sql
-- Check function definitions
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%notification%';
```

### **Rollback Procedures:**

```sql
-- Check migration history
SELECT * FROM migration_versions WHERE file_name = 'problematic_migration.sql';

-- Use rollback SQL if available
-- (Rollback SQL should be stored in migration_versions.rollback_sql)
```

## 📈 **Monitoring & Maintenance**

### **Automated Tasks (Recommended):**

```bash
# Add to crontab for automated monitoring
*/5 * * * * psql -d game_diary -c "SELECT collect_database_health_metrics();"
0 * * * * psql -d game_diary -c "SELECT collect_index_usage_stats();"
0 2 * * * psql -d game_diary -c "SELECT cleanup_performance_data();"
```

### **Performance Alerts:**

- **Cache Hit Ratio < 95%**: Consider increasing shared_buffers
- **Slow Queries > 10/hour**: Review and optimize queries
- **Active Connections > 80**: Consider connection pooling
- **Unused Indexes**: Review and drop if safe

## 🔮 **Future Improvements**

### **Planned Enhancements:**

1. **Automated Migration Testing**: CI/CD integration
2. **Performance Benchmarking**: Automated performance regression testing
3. **Migration Rollback Automation**: Automated rollback procedures
4. **Real-time Monitoring Dashboard**: Web-based performance monitoring

### **Optimization Opportunities:**

1. **Partitioning**: For large tables (game_logs, notifications)
2. **Materialized Views**: For complex aggregations
3. **Connection Pooling**: PgBouncer integration
4. **Read Replicas**: For read-heavy workloads

## 📚 **Additional Resources**

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)

---

**Last Updated**: 2024-12-19
**Version**: 1.1.0
**Maintainer**: Game Diary Development Team

## 🔄 **Recent Updates (v1.1.0)**

### **Schema Reorganization:**

- ✅ **Reorganized base schema** with logical section grouping
- ✅ **Fixed missing constraints** (user_id NOT NULL for comments/reactions)
- ✅ **Standardized naming** and documentation throughout
- ✅ **Enhanced data integrity** with complete constraint coverage

### **Migration Optimizations:**

- ✅ **Removed duplicate functions** from RLS policies file
- ✅ **Added nested comment indexes** for depth-based queries
- ✅ **Improved documentation** with consistent headers
- ✅ **Enhanced performance** with optimized index coverage

### **New Features:**

- ✅ **Nested comment support** up to 5 levels deep
- ✅ **Enhanced reaction system** for both user and public content
- ✅ **Improved search capabilities** with trigram indexes
- ✅ **Better performance monitoring** with comprehensive metrics
