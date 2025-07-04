# Soaking Period Implementation

This document describes the soaking period implementation for safe deployments with health monitoring, performance tracking, and automated rollback capabilities.

## Overview

Soaking periods are a deployment safety mechanism that allows new deployments to "soak" in a controlled environment before being fully promoted. During the soak period, the deployment is continuously monitored for:

- **Health checks** - API availability and response times
- **Performance metrics** - Load times and E2E test results
- **Error rates** - Automatic rollback on threshold violations
- **Integration testing** - Comprehensive validation after soak

## Architecture

### Components

1. **Soak Monitor Script** (`scripts/soak-monitor.sh`)

   - Health check monitoring
   - Performance metrics collection
   - Automated rollback logic
   - Status reporting

2. **Health Check API** (`src/app/api/health/route.ts`)

   - Database connectivity verification
   - External service status
   - Response time measurement

3. **Enhanced CI/CD Workflow** (`.github/workflows/staging-with-soak.yml`)
   - Pre-deployment testing
   - Deployment with soak period
   - Post-soak validation
   - Comprehensive reporting

### Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pre-Deploy    │    │   Deployment    │    │   Soak Period   │
│   Validation    │───▶│   to Staging    │───▶│   Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Quality Gate    │    │ Vercel Deploy   │    │ Health Checks   │
│ Unit Tests      │    │ Build & Deploy  │    │ Performance     │
│ E2E Tests       │    │ Get URL         │    │ E2E Validation  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Rollback?     │
                                              │   (if needed)   │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Post-Soak       │
                                              │ Validation      │
                                              └─────────────────┘
```

## Configuration

### Environment Variables

```bash
# Soak period configuration
SOAK_DURATION=1800              # 30 minutes in seconds
HEALTH_CHECK_INTERVAL=30        # Health check frequency (seconds)
PERFORMANCE_CHECK_INTERVAL=300  # Performance check frequency (seconds)
MAX_ERROR_RATE=0.05            # 5% error rate threshold
MAX_RESPONSE_TIME=5000         # 5 seconds max response time

# Deployment URLs
VERCEL_PREVIEW_URL=https://your-app-preview.vercel.app
VERCEL_STAGING_URL=https://your-app-staging.vercel.app
VERCEL_PRODUCTION_URL=https://your-app.vercel.app
```

### Thresholds

| Metric                | Warning       | Critical      | Action   |
| --------------------- | ------------- | ------------- | -------- |
| Error Rate            | 2%            | 5%            | Rollback |
| Response Time         | 3s            | 5s            | Rollback |
| Health Check Failures | 3 consecutive | 5 consecutive | Rollback |
| E2E Test Failures     | 1 failure     | 2 failures    | Rollback |

## Usage

### Command Line Interface

```bash
# Start a soak period
pnpm soak:start staging 1800  # 30 minutes

# Monitor during soak period
pnpm soak:monitor staging 1800

# Check soak status
pnpm soak:status

# Perform manual rollback
pnpm soak:rollback staging "Performance degradation"

# Test soak functionality (5 minutes)
pnpm soak:test
```

### Direct Script Usage

```bash
# Start soak period
./scripts/soak-monitor.sh start staging 1800

# Monitor deployment
./scripts/soak-monitor.sh monitor staging 1800

# Check status
./scripts/soak-monitor.sh status

# Manual rollback
./scripts/soak-monitor.sh rollback staging "Manual intervention"
```

### CI/CD Integration

The soaking period is automatically integrated into the staging deployment workflow:

```yaml
# .github/workflows/staging-with-soak.yml
soak-period:
  name: Soak Period Monitoring
  needs: [deploy]
  runs-on: ubuntu-latest
  steps:
    - name: Start Soak Period
      run: ./scripts/soak-monitor.sh start staging $SOAK_DURATION

    - name: Monitor During Soak Period
      run: ./scripts/soak-monitor.sh monitor staging $SOAK_DURATION
```

## Health Check API

### Endpoint

```
GET /api/health
```

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "response_time": 45,
  "checks": {
    "database": {
      "healthy": true,
      "response_time": 12
    },
    "external_services": {
      "healthy": true,
      "services": {
        "clerk": true,
        "rapidapi": true,
        "redis": true
      }
    }
  },
  "version": "1.0.0",
  "environment": "staging"
}
```

### Health Check Logic

1. **Database Check**: Simple `SELECT 1` query
2. **External Services**: Verify API keys and URLs are configured
3. **Response Time**: Measure total request processing time
4. **Status Determination**: Healthy if all checks pass and response time < threshold

## Monitoring Metrics

### Collected Metrics

- **Health Check Results**: Success/failure rate, response times
- **Performance Metrics**: Page load times, E2E test results
- **Error Rates**: HTTP error codes, application errors
- **Resource Usage**: Memory, CPU (if available)

### Metrics Storage

Metrics are stored in JSON format:

```json
{
  "total_checks": 120,
  "healthy_checks": 118,
  "error_rate": 0.0167,
  "avg_response_time": 245.5
}
```

### Rollback Triggers

Automatic rollback occurs when:

1. **Error Rate Exceeds Threshold**: > 5% error rate
2. **Response Time Too Slow**: > 5 seconds average
3. **Health Check Failures**: Multiple consecutive failures
4. **E2E Test Failures**: Critical functionality broken

## Rollback Strategy

### Automatic Rollback

```bash
# Triggered automatically when thresholds are exceeded
./scripts/soak-monitor.sh rollback staging "Error rate exceeded threshold"
```

### Manual Rollback

```bash
# Manual intervention
./scripts/soak-monitor.sh rollback staging "Manual rollback required"
```

### Rollback Actions

1. **Status Update**: Mark deployment as rolling back
2. **Vercel Rollback**: Revert to previous deployment
3. **Notification**: Alert team of rollback
4. **Logging**: Record rollback reason and metrics

## Integration with Existing Pipeline

### Enhanced Workflow

The soaking period integrates seamlessly with your existing CI/CD pipeline:

1. **Quality Gate**: All existing validation steps
2. **Unit Tests**: Comprehensive unit test coverage
3. **E2E Tests**: Pre-deployment E2E validation
4. **Deployment**: Vercel deployment to staging
5. **Soak Period**: New monitoring phase
6. **Post-Soak Validation**: Additional E2E testing
7. **Summary**: Comprehensive deployment report

### Existing Scripts Enhanced

- `pnpm test:e2e:smoke` - Used during soak period
- `pnpm test:e2e:critical` - Post-soak validation
- `pnpm test:e2e:responsive` - Performance validation

## Monitoring Dashboard

### Soak Status

```bash
# Check current soak status
pnpm soak:status
```

Output:

```
=== Soak Period Status ===
Status: soaking
Environment: staging
Start Time: 2024-01-15T10:00:00.000Z
Duration: 1800 seconds
URL: https://your-app-staging.vercel.app

=== Current Metrics ===
{
  "total_checks": 60,
  "healthy_checks": 58,
  "error_rate": 0.0333,
  "avg_response_time": 234.5
}
```

### Log Files

- `./.soak/soak.log` - Detailed monitoring logs
- `./.soak/status.json` - Current status
- `./.soak/metrics.json` - Performance metrics
- `./.soak/health_checks.json` - Health check history
- `./.soak/performance_checks.json` - Performance check history

## Best Practices

### Soak Duration

- **Development**: 5-15 minutes
- **Staging**: 30-60 minutes
- **Production**: 1-4 hours

### Monitoring Frequency

- **Health Checks**: Every 30 seconds
- **Performance Checks**: Every 5 minutes
- **E2E Tests**: Every 15 minutes

### Threshold Tuning

1. **Start Conservative**: Lower thresholds initially
2. **Monitor Patterns**: Adjust based on historical data
3. **Environment Specific**: Different thresholds per environment
4. **Gradual Adjustment**: Incrementally tune thresholds

### Rollback Strategy

1. **Fast Rollback**: Immediate rollback on critical issues
2. **Gradual Rollback**: Gradual traffic reduction for performance issues
3. **Manual Override**: Always allow manual rollback
4. **Notification**: Alert team on all rollbacks

## Troubleshooting

### Common Issues

1. **Health Check Failures**

   ```bash
   # Check health endpoint manually
   curl https://your-app-staging.vercel.app/api/health
   ```

2. **High Response Times**

   ```bash
   # Check performance metrics
   cat ./.soak/performance_checks.json | jq '.'
   ```

3. **Rollback Failures**
   ```bash
   # Manual rollback
   pnpm soak:rollback staging "Manual intervention"
   ```

### Debug Commands

```bash
# Check soak logs
tail -f ./.soak/soak.log

# View current metrics
cat ./.soak/metrics.json | jq '.'

# Check health check history
cat ./.soak/health_checks.json | jq '.[-10:]'

# Test health endpoint
curl -v https://your-app-staging.vercel.app/api/health
```

## Future Enhancements

### Planned Features

1. **Gradual Traffic Routing**: Percentage-based traffic shifting
2. **Advanced Metrics**: Custom business metrics
3. **Alerting Integration**: Slack, email notifications
4. **Dashboard UI**: Web-based monitoring dashboard
5. **A/B Testing**: Compare old vs new deployment
6. **Performance Baselines**: Automatic threshold adjustment

### Integration Opportunities

1. **Monitoring Tools**: Datadog, New Relic integration
2. **Alerting**: PagerDuty, OpsGenie
3. **Metrics**: Prometheus, Grafana
4. **Logging**: ELK stack, Splunk

## Security Considerations

### Health Check Security

- **Rate Limiting**: Prevent abuse of health endpoint
- **Authentication**: Optional authentication for sensitive environments
- **Information Disclosure**: Limit sensitive information in responses
- **CORS**: Proper CORS configuration

### Rollback Security

- **Authorization**: Require approval for production rollbacks
- **Audit Trail**: Log all rollback actions
- **Notification**: Alert security team on rollbacks
- **Verification**: Verify rollback success

## Conclusion

The soaking period implementation provides a robust safety mechanism for deployments, ensuring that new releases are thoroughly validated before being fully promoted. By integrating with your existing CI/CD pipeline and E2E testing infrastructure, it provides comprehensive monitoring and automated rollback capabilities while maintaining the efficiency of your deployment process.

The system is designed to be:

- **Non-intrusive**: Works alongside existing processes
- **Configurable**: Adaptable to different environments and requirements
- **Reliable**: Robust error handling and recovery
- **Transparent**: Clear logging and reporting
- **Extensible**: Easy to enhance with additional features
