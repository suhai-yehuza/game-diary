# Placeholder App - Third-Party Integrations & Access Guide

> **IMPORTANT**: This document contains sensitive access information. Keep this secure and share only with trusted team members who need access to manage the application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication & User Management](#authentication--user-management)
3. [Hosting & Deployment](#hosting--deployment)
4. [Database & Storage](#database--storage)
5. [External APIs](#external-apis)
6. [Email Services](#email-services)
7. [Repository Management](#repository-management)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Emergency Procedures](#emergency-procedures)

---

## 🎯 Overview

The Placeholder app is a Next.js-based sports application that allows users to track NBA games, create game logs, and interact with other users. The application integrates with multiple third-party services for authentication, hosting, database management, and external data.

### Application Architecture

- **Frontend**: Next.js 15.3.4 with React 19.1.0
- **Backend**: Next.js API routes with GraphQL
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Clerk
- **Hosting**: Vercel
- **External Data**: RapidAPI NBA API
- **Email**: SendGrid
- **Caching**: UpStash Redis

---

## 🔐 Authentication & User Management

### Clerk Authentication

**Purpose**: User authentication, authorization, and user management

**Dashboard**: https://.clerk.com/

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: ClerkSecurePass123!]`

**Key Configuration**:

- **Publishable Key**: `pk_test_...` (from Clerk Dashboard)
- **Secret Key**: `sk_test_...` (from Clerk Dashboard)
- **Webhook Signing Secret**: `whsec_...` (from Clerk Dashboard)

**Webhook Endpoint**: `/api/webhooks/clerk`

- **Events Handled**: `user.created`, `user.updated`, `user.deleted`
- **Verification**: Uses Clerk's webhook verification

**Admin Access**:

- Admin access is determined solely by Clerk user metadata. Users with `role: ["admin"]` in their public metadata are admins.
- To grant admin access, set the user's public metadata in Clerk to include: `{ "role": ["admin"] }`

**Management Tasks**:

1. User management and moderation
2. Authentication settings
3. Webhook configuration
4. Email templates
5. Organization settings

---

## 🚀 Hosting & Deployment

### Vercel

**Purpose**: Application hosting, deployment, and CDN

**Dashboard**: https://vercel.com/

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: VercelDeployPass456!]`

**Project Details**:

- **Project Name**: `game-diary`
- **Organization**: `[Your Organization Name]`
- **Framework**: Next.js
- **Region**: Auto (Global Edge Network)

**Environment Variables** (set in Vercel Dashboard):

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# External APIs
NEXT_PUBLIC_RAPID_API_KEY=...
NEXT_PUBLIC_RAPID_API_HOST=v2.nba.api-sports.io
NEXT_PUBLIC_RAPID_API_BASE_URL=https://v2.nba.api-sports.io

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Environment
NODE_ENV=production
```

**Deployment URLs**:

- **Production**: `https://game-diary.vercel.app`
- **Staging**: `https://game-diary-suhai-yehuza-suhais-projects-33a81a2a.vercel.app`
- **Preview**: `https://game-diary-git-[branch].vercel.app`

**Management Tasks**:

1. Environment variable management
2. Domain configuration
3. Deployment monitoring
4. Performance analytics
5. Function logs and debugging

---

## 🗄️ Database & Storage

### Neon Database (PostgreSQL)

**Purpose**: Primary database for application data

**Dashboard**: https://console.neon.tech/

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: NeonDBPass789!]`

**Database Details**:

- **Database Name**: `game-diary-db`
- **Region**: `us-east-1` (N. Virginia)
- **Plan**: Pro (or current plan)
- **Connection String**: `postgresql://[username]:[password]@[host]/[database]`

**Connection Information**:

- **Host**: `[neon-host].us-east-1.aws.neon.tech`
- **Port**: `5432`
- **Database**: `neondb`
- **Username**: `[neon-username]`
- **Password**: `[neon-password]`

**Management Tasks**:

1. Database monitoring and scaling
2. Backup management
3. Connection pooling
4. Query performance optimization
5. Schema migrations

### UpStash Redis

**Purpose**: Caching and session storage

**Dashboard**: https://console.upstash.com/

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: UpStashRedisPass321!]`

**Redis Details**:

- **Database Name**: `game-diary-redis`
- **Region**: `us-east-1`
- **Plan**: Free (or current plan)

**Connection Information**:

- **REST URL**: `https://[region]-[id].upstash.io`
- **REST Token**: `[upstash-token]`
- **Port**: `6379`

**Management Tasks**:

1. Cache monitoring
2. Memory usage optimization
3. Key management
4. Performance analytics

---

## 🌐 External APIs

### RapidAPI NBA API

**Purpose**: NBA game data, statistics, and live scores

**Dashboard**: https://rapidapi.com/

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: RapidAPIPass654!]`

**API Details**:

- **API Name**: NBA API
- **Provider**: API-Sports
- **Base URL**: `https://v2.nba.api-sports.io`
- **API Key**: `[rapidapi-key]`
- **Host**: `v2.nba.api-sports.io`

**Endpoints Used**:

- `/seasons` - NBA seasons
- `/leagues` - League information
- `/games` - Game data
- `/games/statistics` - Game statistics
- `/teams` - Team information
- `/teams/statistics` - Team statistics
- `/players` - Player data
- `/players/statistics` - Player statistics
- `/standings` - League standings

**Rate Limits**:

- **Requests per month**: Based on subscription plan
- **Requests per second**: 10 (configured in app)
- **Timeout**: 10 seconds

**Management Tasks**:

1. API key management
2. Usage monitoring
3. Rate limit optimization
4. Subscription management

---

## 📧 Email Services

### SendGrid

**Purpose**: Email notifications and transactional emails

**Dashboard**: https://app.sendgrid.com/

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: SendGridEmailPass987!]`

**Account Details**:

- **Account Type**: Free (or current plan)
- **From Email**: `sportsdata22@gmail.com`
- **API Key**: `[sendgrid-api-key]`

**Email Templates**:

- **Nightly Update**: `[NBA Placeholder] Nightly Update`
- **Friend Request**: `New Friend Request`
- **Comment Notification**: `New Comment on Your Game Log`
- **Reaction Notification**: `New Reaction on Your Content`

**Management Tasks**:

1. Email template management
2. Delivery monitoring
3. Bounce handling
4. API key rotation
5. Sender authentication

---

## 📚 Repository Management

### GitHub

**Purpose**: Source code repository and version control

**Repository**: https://github.com/[username]/game-diary

- **Login Email**: `sportsdata22@gmail.com`
- **Password**: `[DUMMY_PASSWORD: GitHubRepoPass147!]`

**Repository Details**:

- **Name**: `game-diary`
- **Visibility**: Private
- **Default Branch**: `master`
- **Protected Branches**: `master`, `staging`

**Branch Strategy**:

- `master` - Production code
- `staging` - Pre-production testing
- `feature/*` - Feature development
- `hotfix/*` - Emergency fixes

**Secrets & Variables** (GitHub Settings):

```bash
# Vercel
VERCEL_ORG_ID=[vercel-org-id]
VERCEL_PROJECT_ID=[vercel-project-id]

# Database
DATABASE_URL=[neon-connection-string]

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[clerk-publishable-key]
CLERK_SECRET_KEY=[clerk-secret-key]
CLERK_WEBHOOK_SIGNING_SECRET=[clerk-webhook-secret]

# External APIs
NEXT_PUBLIC_RAPID_API_KEY=[rapidapi-key]
NEXT_PUBLIC_RAPID_API_HOST=v2.nba.api-sports.io
NEXT_PUBLIC_RAPID_API_BASE_URL=https://v2.nba.api-sports.io

# Redis
UPSTASH_REDIS_REST_URL=[upstash-redis-url]
UPSTASH_REDIS_REST_TOKEN=[upstash-redis-token]

# Deployment URLs
VERCEL_PREVIEW_URL=https://game-diary-suhai-yehuza-suhais-projects-33a81a2a.vercel.app
VERCEL_PRODUCTION_URL=https://game-diary.vercel.app
```

**Management Tasks**:

1. Code review and merging
2. Branch protection rules
3. Secret management
4. Issue tracking
5. Release management

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**Purpose**: Automated testing, building, and deployment

**Workflow Files**:

- `.github/workflows/production.yml` - Production deployments
- `.github/workflows/staging.yml` - Staging deployments
- `.github/workflows/preview.yml` - Preview deployments
- `.github/workflows/nightly.yml` - Nightly maintenance
- `.github/workflows/dependency-updates.yml` - Dependency management

**Deployment Strategy**:

1. **Staging**: Automatic on push to `staging` branch
2. **Production**: Manual or scheduled (M-Th 9AM PT)
3. **Preview**: Automatic on pull requests

**Soak Period Monitoring**:

- **Duration**: 30 minutes (configurable)
- **Health Checks**: Every 30 seconds
- **Performance Tests**: Every 5 minutes
- **Auto-rollback**: On health failures

**Management Tasks**:

1. Workflow monitoring
2. Build failure investigation
3. Deployment scheduling
4. Performance optimization

---

## 📊 Monitoring & Analytics

### Vercel Analytics

**Purpose**: Application performance and user analytics

**Access**: Via Vercel Dashboard

- **Metrics**: Page views, performance, errors
- **Real-time**: Live user activity
- **Performance**: Core Web Vitals

### Application Health Monitoring

**Health Endpoint**: `/api/health`

- **Database**: Connection status
- **External Services**: API availability
- **Authentication**: Clerk service status

**Monitoring Scripts**:

- `./scripts/soak-monitor.sh` - Soak period monitoring
- `./scripts/deployment-manager.sh` - Deployment management
- `./scripts/workflow.sh` - Workflow orchestration

---

## 🚨 Emergency Procedures

### Database Issues

1. **Check Neon Dashboard** for connection status
2. **Verify DATABASE_URL** in Vercel environment variables
3. **Check application logs** for specific error messages
4. **Contact Neon Support** if persistent issues

### Authentication Issues

1. **Verify Clerk Dashboard** for service status
2. **Check webhook configuration** in Clerk
3. **Validate API keys** in Vercel environment variables
4. **Test webhook endpoint** manually

### Deployment Issues

1. **Check GitHub Actions** for build failures
2. **Verify Vercel deployment** status
3. **Review environment variables** in Vercel
4. **Rollback deployment** if necessary

### External API Issues

1. **Check RapidAPI Dashboard** for service status
2. **Verify API key** and rate limits
3. **Test API endpoints** manually
4. **Check application logs** for API errors

### Emergency Contacts

- **Primary Contact**: `sportsdata22@gmail.com`
- **Backup Contact**: `soyehuza@gmail.com`
- **Emergency Rollback**: Use Vercel dashboard or GitHub Actions

---

## 🔧 Maintenance Tasks

### Daily

- [ ] Check application health endpoint
- [ ] Monitor error logs
- [ ] Verify external API functionality

### Weekly

- [ ] Review performance metrics
- [ ] Check dependency updates
- [ ] Monitor database performance
- [ ] Review security alerts

### Monthly

- [ ] Update third-party service credentials
- [ ] Review and optimize database queries
- [ ] Update documentation
- [ ] Security audit

### Quarterly

- [ ] Review and update access credentials
- [ ] Performance optimization review
- [ ] Cost analysis and optimization
- [ ] Backup verification

---

## 📝 Notes

### Important Security Considerations

1. **Never commit secrets** to the repository
2. **Rotate API keys** regularly
3. **Use environment variables** for all sensitive data
4. **Monitor access logs** for suspicious activity
5. **Keep dependencies updated** for security patches

### Backup Strategy

1. **Database**: Neon provides automatic backups
2. **Code**: GitHub provides full version history
3. **Environment**: Vercel stores environment variables
4. **Configuration**: Document all settings in this guide

### Cost Management

1. **Monitor usage** across all services
2. **Optimize database queries** to reduce costs
3. **Review API usage** and rate limits
4. **Consider scaling down** during low-usage periods

---

## 🔗 Quick Links

- **Application**: https://game-diary.vercel.app
- **Staging**: https://game-diary-suhai-yehuza-suhais-projects-33a81a2a.vercel.app
- **Repository**: https://github.com/[username]/game-diary
- **Vercel Dashboard**: https://vercel.com/
- **Clerk Dashboard**: https://.clerk.com/
- **Neon Dashboard**: https://console.neon.tech/
- **UpStash Dashboard**: https://console.upstash.com/
- **RapidAPI Dashboard**: https://rapidapi.com/
- **SendGrid Dashboard**: https://app.sendgrid.com/

---

_Last Updated: [Current Date]_
_Document Version: 1.0_
_Maintained by: [Your Name]_
