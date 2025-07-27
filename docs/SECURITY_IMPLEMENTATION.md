# Security Implementation Documentation

This document provides comprehensive documentation for the security features implemented in the Placeholder application, including Slack alerting, admin authentication, field-level encryption, and Row-Level Security (RLS).

## Table of Contents

1. [Overview](#overview)
2. [Slack Alerting System](#slack-alerting-system)
3. [Admin Authentication & Authorization](#admin-authentication--authorization)
4. [Field-Level Encryption](#field-level-encryption)
5. [Row-Level Security (RLS)](#row-level-security-rls)
6. [Audit Logging](#audit-logging)
7. [Key Management](#key-management)
8. [Testing & Validation](#testing--validation)
9. [Configuration](#configuration)
10. [Deployment Guide](#deployment-guide)

## Overview

The security implementation provides a comprehensive security framework with:

- **Real-time alerting** via Slack for critical security events
- **Role-based access control** for admin functions
- **Field-level encryption** for sensitive user data
- **Database-level security** with Row-Level Security policies
- **Comprehensive audit logging** for compliance and monitoring
- **Secure key management** for encryption operations

## Slack Alerting System

### Architecture

The Slack alerting system is implemented as a singleton service that integrates with the audit logging system to provide real-time notifications for critical security events.

### Components

#### AlertingService (`src/lib/services/alerting.ts`)

```typescript
export class AlertingService {
  // Singleton pattern for consistent alerting
  static getInstance(): AlertingService;

  // Send Slack alerts for critical events
  async sendSlackAlert(auditData: Record<string, unknown>): Promise<void>;

  // Format Slack messages with rich blocks
  private formatSlackMessage(auditData: Record<string, unknown>): ISlackMessage;
}
```

#### Integration with Audit Logger

The audit logger automatically triggers Slack alerts for critical events:

```typescript
// Real-time alerting for CRITICAL events
if (data.severity === 'critical' || data.severity === 'CRITICAL') {
  void this.sendCriticalAlert(auditData);
}
```

### Slack Message Format

Slack alerts include:

- **Header**: Critical event indicator with action
- **Fields**: Category, action, severity, user, timestamp, status
- **Description**: Detailed event description
- **Error Details**: Error messages if applicable
- **Admin Panel Link**: Direct link to investigate in admin panel

### Configuration

Set the Slack webhook URL in environment variables:

```bash
# Development
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Production
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/PRODUCTION/WEBHOOK
```

### Testing

```bash
# Test Slack alerting
pnpm security:test-alerting
# or
tsx scripts/cli.ts security test-alerting
```

## Admin Authentication & Authorization

### Architecture

Admin authentication is implemented using middleware that checks user authentication and admin role permissions before allowing access to admin functions.

### Components

#### Admin Auth Middleware (`src/lib/middleware/admin-auth.ts`)

```typescript
export interface IAdminAuthContext {
  userId: string;
  isAdmin: boolean;
  userEmail?: string;
}

export async function adminAuthMiddleware(
  request: NextRequest
): Promise<NextResponse | IAdminAuthContext>;

export function withAdminAuth<T extends unknown[]>(
  handler: (context: IAdminAuthContext, ...args: T) => Promise<Response>
);
```

#### Protected API Endpoints

All admin API endpoints are protected:

```typescript
// Example: Admin audit logs API
export async function GET(req: NextRequest) {
  // Authenticate admin user
  const authResult = await adminAuthMiddleware(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const adminContext: IAdminAuthContext = authResult;

  // Proceed with admin operations...
}
```

#### Protected Admin UI

Admin pages are protected at the layout level:

```typescript
// /protected/admin/audit-logs/layout.tsx
export default async function AdminAuditLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  // Check admin role
  const userRoles = (sessionClaims?.metadata as { role?: string[] })?.role ?? [];
  const isAdmin = userRoles.includes('admin') || userRoles.includes('Admin');

  if (!isAdmin) {
    redirect('/protected/user');
  }

  return <div>{children}</div>;
}
```

### Role Configuration

Admin roles are configured in Clerk:

1. **Admin Role**: Users with `admin` or `Admin` in their Clerk user metadata (public_metadata.role) can access admin functions
2. **Role Assignment**: Assign roles through Clerk dashboard by setting public metadata: `{ "role": ["admin"] }`
3. **Audit Logging**: All admin access attempts are logged

### Admin Functions

#### Audit Log Review (`/protected/admin/audit-logs`)

- **Filtering**: By category, severity, user, date range
- **Pagination**: 50 logs per page
- **Export**: CSV export functionality
- **Real-time**: Live updates for critical events

#### Key Management

- **Key Creation**: Generate new encryption keys
- **Key Rotation**: Rotate keys with re-encryption
- **Key Validation**: Verify key integrity
- **Environment Management**: Separate keys per environment

## Field-Level Encryption

### Architecture

Field-level encryption uses AES-256-GCM encryption to protect sensitive user data (email, phone) at rest in the database.

### Components

#### Encryption Utilities (`src/lib/utils/encryption.ts`)

```typescript
export async function encryptField(data: string): Promise<string>;
export async function decryptField(encryptedData: string): Promise<string>;
export function generateEncryptionKey(): string;
```

#### Database Schema

Sensitive fields are stored as encrypted text:

```sql
-- Users table with encrypted fields
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email_encrypted TEXT, -- Encrypted email
  phone_number_encrypted TEXT, -- Encrypted phone
  -- ... other fields
);
```

#### GraphQL Integration

GraphQL resolvers automatically decrypt sensitive fields for authenticated users:

```typescript
// User resolver with decryption
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

if (user && currentUserId === userId) {
  // Decrypt sensitive fields for own data
  user.email = await decryptField(user.email_encrypted);
  user.phone_number = await decryptField(user.phone_number_encrypted);
}
```

### Encryption Process

1. **Key Generation**: 32-byte random key for AES-256-GCM
2. **Encryption**: Data encrypted with nonce and authentication tag
3. **Storage**: Encrypted data stored as base64 string
4. **Decryption**: Data decrypted using stored key and nonce

### Key Management

#### Environment-Specific Keys

```bash
# Development
DATA_ENCRYPTION_KEY=dev_key_32_bytes_long_here

# Staging
DATA_ENCRYPTION_KEY=staging_key_32_bytes_long_here

# Production
DATA_ENCRYPTION_KEY=prod_key_32_bytes_long_here
```

#### Key Rotation

```bash
# Generate new key
pnpm security:key-management create --env=production

# Rotate keys
pnpm security:key-management rotate --env=production --reason="Security update"

# Validate keys
pnpm security:key-management validate --env=production
```

## Row-Level Security (RLS)

### Architecture

Row-Level Security policies restrict database access based on user context, ensuring users can only access their own data.

### Components

#### RLS Context Manager (`src/lib/db/rls-context.ts`)

```typescript
export class RLSContextManager {
  async setUserContext(userId: string): Promise<void>;
  async clearUserContext(): Promise<void>;
  async withUserContext<T>(userId: string, operation: () => Promise<T>): Promise<T>;
}
```

#### Database Policies

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (auth.uid()::text = id);

-- Policy: Admins can access all data
CREATE POLICY "users_admin_access" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' ? 'admin'
    )
  );
```

#### Context Functions

```sql
-- Set current user context
CREATE OR REPLACE FUNCTION set_current_user_context(user_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id, false);
END;
$$ LANGUAGE plpgsql;

-- Clear current user context
CREATE OR REPLACE FUNCTION clear_current_user_context()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql;
```

### Usage

#### API Endpoints

```typescript
// Set RLS context for user operations
await rlsContext.setUserContext(userId);

try {
  const userData = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
} finally {
  await rlsContext.clearUserContext();
}
```

#### GraphQL Resolvers

```typescript
// User data with RLS protection
const user = await withRLSContext(currentUserId, async () => {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
});
```

## Audit Logging

### Architecture

Comprehensive audit logging system that tracks all security-relevant events with real-time alerting for critical events.

### Components

#### Audit Logger (`src/lib/services/audit-logger.ts`)

```typescript
export class AuditLogger {
  async logAuditEvent(data: IAuditLogData): Promise<string>;
  async logKeyRotation(data: IKeyRotationLogData): Promise<string>;
  async logRLSAccess(data: IRLSAccessLogData): Promise<string>;
  async queryAuditLogs(filters: AuditLogFilters): Promise<unknown[]>;
}
```

#### Audit Categories

- **Authentication**: Login attempts, session management
- **Authorization**: Permission checks, role changes
- **Data Access**: Database queries, sensitive data access
- **Encryption**: Key operations, data encryption/decryption
- **Security**: Security events, suspicious activity
- **Key Management**: Key creation, rotation, deletion
- **RLS Access**: Row-level security policy enforcement

#### Audit Tables

```sql
-- Main audit logs
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  category VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  user_id VARCHAR(255),
  description TEXT,
  details JSONB,
  success BOOLEAN DEFAULT TRUE,
  -- ... additional fields
);

-- Key rotation logs
CREATE TABLE key_rotation_logs (
  id VARCHAR(255) PRIMARY KEY,
  key_id VARCHAR(255) NOT NULL,
  rotation_type VARCHAR(50) NOT NULL,
  rotated_by VARCHAR(255) NOT NULL,
  -- ... additional fields
);

-- RLS access logs
CREATE TABLE rls_access_logs (
  id VARCHAR(255) PRIMARY KEY,
  requesting_user_id VARCHAR(255) NOT NULL,
  target_user_id VARCHAR(255) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  access_granted BOOLEAN NOT NULL,
  -- ... additional fields
);
```

### Real-time Alerting

Critical events automatically trigger Slack alerts:

- **Failed authentication attempts**
- **Unauthorized access attempts**
- **Key rotation events**
- **Suspicious activity patterns**
- **RLS policy violations**

## Key Management

### Architecture

Secure key management system for encryption keys with environment isolation, rotation capabilities, and audit logging.

### Components

#### Key Management CLI (`scripts/key-management.ts`)

```bash
# Create new key
pnpm security:key-management create --env=production

# Activate key
pnpm security:key-management activate --key-id=key_123 --env=production

# Rotate keys
pnpm security:key-management rotate --env=production --reason="Security update"

# List keys
pnpm security:key-management list --env=production

# Validate keys
pnpm security:key-management validate --env=production

# Export environment variables
pnpm security:key-management export-env --env=production
```

#### Key Storage

Keys are stored securely with:

- **Environment isolation**: Separate keys per environment
- **Version tracking**: Key version management
- **Audit logging**: All key operations logged
- **Backup protection**: Keys backed up securely

### Key Lifecycle

1. **Creation**: Generate new encryption key
2. **Activation**: Activate key for use
3. **Rotation**: Rotate keys with data re-encryption
4. **Validation**: Verify key integrity
5. **Deactivation**: Deactivate old keys

## Testing & Validation

### Test Scripts

#### Encryption Testing

```bash
# Test encryption utilities
pnpm security:test-encryption
```

Tests include:

- Encryption/decryption cycle validation
- Edge cases (empty strings, special characters)
- Performance testing
- Error handling

#### RLS Testing

```bash
# Test RLS policies
pnpm security:test-rls
```

Tests include:

- RLS policy verification
- Context management
- Access control validation
- Policy enforcement

#### Alerting Testing

```bash
# Test Slack alerting
pnpm security:test-alerting
```

Tests include:

- Slack message formatting
- Webhook integration
- Error handling
- Configuration validation

### Integration Testing

#### E2E Security Tests

```typescript
// tests/e2e/functional/security.spec.ts
describe('Security Features', () => {
  test('admin authentication', async () => {
    // Test admin access control
  });

  test('data encryption', async () => {
    // Test field-level encryption
  });

  test('audit logging', async () => {
    // Test audit log generation
  });
});
```

## Configuration

### Environment Variables

```bash
# Slack Alerting
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK

# Encryption
DATA_ENCRYPTION_KEY=your_32_byte_encryption_key_here

# Database
DATABASE_URL=your_database_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### Environment-Specific Configuration

#### Development

```bash
# .env.development
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/DEV/WEBHOOK
DATA_ENCRYPTION_KEY=dev_key_32_bytes_long_here
```

#### Staging

```bash
# .env.staging
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/STAGING/WEBHOOK
DATA_ENCRYPTION_KEY=staging_key_32_bytes_long_here
```

#### Production

```bash
# .env.production
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/PROD/WEBHOOK
DATA_ENCRYPTION_KEY=prod_key_32_bytes_long_here
```

## Deployment Guide

### Pre-deployment Checklist

1. **Environment Variables**
   - [ ] Set `SLACK_ALERT_WEBHOOK_URL` for alerting
   - [ ] Generate and set `DATA_ENCRYPTION_KEY`
   - [ ] Configure database connection
   - [ ] Set up Clerk authentication

2. **Database Setup**
   - [ ] Run migrations to create audit tables
   - [ ] Enable RLS on users table
   - [ ] Create RLS policies
   - [ ] Set up audit logging triggers

3. **Key Management**
   - [ ] Generate encryption keys for each environment
   - [ ] Activate keys for use
   - [ ] Test key rotation process
   - [ ] Validate key integrity

4. **Admin Configuration**
   - [ ] Assign admin roles in Clerk
   - [ ] Test admin access to audit logs
   - [ ] Verify admin authentication middleware
   - [ ] Test admin UI functionality

### Deployment Steps

1. **Database Migration**

   ```bash
   pnpm db:migrate:prod
   ```

2. **Key Setup**

   ```bash
   pnpm security:key-management create --env=production
   pnpm security:key-management activate --key-id=key_123 --env=production
   ```

3. **Data Encryption**

   ```bash
   pnpm db:encrypt-users:prod
   ```

4. **Testing**
   ```bash
   pnpm security:test-encryption
   pnpm security:test-rls
   pnpm security:test-alerting
   ```

### Monitoring

#### Audit Log Monitoring

- Monitor audit logs for security events
- Set up alerts for critical events
- Review admin access patterns
- Track key rotation events

#### Performance Monitoring

- Monitor encryption/decryption performance
- Track RLS policy enforcement overhead
- Monitor Slack alert delivery
- Track audit log storage usage

### Maintenance

#### Regular Tasks

1. **Key Rotation** (Quarterly)

   ```bash
   pnpm security:key-management rotate --env=production --reason="Quarterly rotation"
   ```

2. **Audit Log Review** (Monthly)
   - Review admin access patterns
   - Check for suspicious activity
   - Validate audit log integrity

3. **Security Testing** (Monthly)
   ```bash
   pnpm security:test-encryption
   pnpm security:test-rls
   pnpm security:test-alerting
   ```

#### Backup Procedures

1. **Key Backup**
   - Backup encryption keys securely
   - Store keys in secure key management system
   - Test key restoration process

2. **Audit Log Backup**
   - Backup audit logs regularly
   - Archive old audit logs
   - Verify backup integrity

## Troubleshooting

### Common Issues

#### Slack Alerts Not Working

1. Check webhook URL configuration
2. Verify Slack app permissions
3. Check network connectivity
4. Review audit log for errors

#### Encryption Errors

1. Verify encryption key configuration
2. Check key format (32 bytes)
3. Validate environment variables
4. Test encryption utilities

#### RLS Policy Issues

1. Verify RLS is enabled on tables
2. Check policy definitions
3. Validate user context setting
4. Review audit logs for access attempts

#### Admin Access Issues

1. Verify admin role assignment in Clerk
2. Check admin authentication middleware
3. Review audit logs for access attempts
4. Validate admin UI permissions

### Debug Commands

```bash
# Test all security features
pnpm security:test-encryption
pnpm security:test-rls
pnpm security:test-alerting

# Check key status
pnpm security:key-management list --env=production

# Validate configuration
pnpm security:key-management validate --env=production

# View audit logs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://your-app.com/api/admin/audit-logs?limit=10"
```

## Security Best Practices

### Key Management

1. **Environment Isolation**: Use separate keys per environment
2. **Regular Rotation**: Rotate keys quarterly
3. **Secure Storage**: Store keys in secure key management system
4. **Access Control**: Limit key access to authorized personnel

### Access Control

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Role-Based Access**: Use roles for permission management
3. **Regular Review**: Review access permissions regularly
4. **Audit Logging**: Log all access attempts

### Data Protection

1. **Encryption at Rest**: Encrypt sensitive data in database
2. **Encryption in Transit**: Use HTTPS for all communications
3. **Field-Level Security**: Encrypt individual sensitive fields
4. **Access Logging**: Log all data access attempts

### Monitoring

1. **Real-time Alerting**: Alert on critical security events
2. **Regular Monitoring**: Monitor security events regularly
3. **Incident Response**: Have incident response procedures
4. **Compliance**: Ensure compliance with data protection regulations

## Conclusion

This security implementation provides a comprehensive security framework that protects user data, ensures proper access control, and provides real-time monitoring and alerting. The modular design allows for easy maintenance and extension of security features as needed.

For additional support or questions, refer to the troubleshooting section or contact the development team.
