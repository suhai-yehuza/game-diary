#!/usr/bin/env tsx
/**
 * @fileoverview Test Slack alerting by triggering a critical audit event
 */
import { createDatabaseClient } from '@/lib/db';
import { AuditLogger } from '@/lib/services/audit-logger';

async function main() {
  // Initialize database connection
  const db = createDatabaseClient();
  console.log('Database connection established successfully');

  const logger = AuditLogger.getInstance();
  console.log('🚨 Triggering a critical audit event to test Slack alerting...');
  await logger.logAuditEvent({
    category: 'security',
    action: 'security_alert', // valid action
    severity: 'critical',
    userId: 'test-user',
    description: 'This is a test of the Slack alerting system from the CLI.',
    details: { test: true, timestamp: new Date().toISOString() },
    success: true,
  });
  console.log(
    '✅ If your SLACK_ALERT_WEBHOOK_URL is set, you should receive a Slack notification.'
  );
}

main().catch(err => {
  console.error('❌ Slack alert test failed:', err);
  process.exit(1);
});
