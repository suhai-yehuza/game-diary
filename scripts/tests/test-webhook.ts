#!/usr/bin/env tsx

import 'dotenv-flow/config';
import { handleUserCreated } from '@/app/api/webhooks/clerk/handleUserCreated';
import { dbManager } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { webhookLogger } from '@/lib/utils/logger';
import { errorHandlers } from '@/lib/utils/error-handler';

// Sample webhook data based on the example
const sampleWebhookData = {
  backup_code_enabled: false,
  banned: false,
  create_organization_enabled: true,
  created_at: Date.now(),
  delete_self_enabled: true,
  email_addresses: [
    {
      created_at: Date.now(),
      email_address: 'test@example.com',
      id: 'email_test_123',
      linked_to: [],
      matches_sso_connection: false,
      object: 'email_address' as const,
      reserved: false,
      updated_at: Date.now(),
      verification: {
        attempts: null,
        expire_at: null,
        status: 'verified',
        strategy: 'email_code',
      },
    },
  ],
  enterprise_accounts: [],
  external_accounts: [],
  external_id: null,
  first_name: 'Test',
  has_image: true,
  id: 'user_test_123',
  image_url: 'https://example.com/avatar.jpg',
  last_active_at: Date.now(),
  last_name: 'User',
  last_sign_in_at: null,
  legal_accepted_at: null,
  locked: false,
  lockout_expires_in_seconds: null,
  mfa_disabled_at: null,
  mfa_enabled_at: null,
  object: 'user' as const,
  passkeys: [],
  password_enabled: false,
  phone_numbers: [],
  primary_email_address_id: 'email_test_123',
  primary_phone_number_id: null,
  primary_web3_wallet_id: null,
  private_metadata: {},
  profile_image_url: 'https://example.com/profile.jpg',
  public_metadata: {},
  saml_accounts: [],
  totp_enabled: false,
  two_factor_enabled: false,
  unsafe_metadata: {},
  updated_at: Date.now(),
  username: 'testuser',
  verification_attempts_remaining: 100,
  web3_wallets: [],
};

async function testWebhook() {
  try {
    webhookLogger.info('🧪 Testing webhook user creation...');

    // Test 1: Initialize database connection
    await dbManager.initialize();
    const dbInstance = dbManager.getDatabase();
    webhookLogger.info('✅ Database connection successful');

    // Test 2: Check if user already exists
    const existingUser = await dbInstance
      .select()
      .from(users)
      .where(eq(users.id, sampleWebhookData.id))
      .limit(1);

    if (existingUser.length > 0) {
      webhookLogger.info(`⚠️ User ${sampleWebhookData.id} already exists, deleting for test`);
      await dbInstance.delete(users).where(eq(users.id, sampleWebhookData.id));
    }

    // Test 3: Call the webhook handler
    webhookLogger.info('📞 Calling handleUserCreated...');
    const result = await handleUserCreated(sampleWebhookData);
    webhookLogger.info(`📤 Webhook result: ${result.status} - ${await result.text()}`);

    // Test 4: Verify user was created
    const createdUser = await dbInstance
      .select()
      .from(users)
      .where(eq(users.id, sampleWebhookData.id))
      .limit(1);

    if (createdUser.length > 0) {
      webhookLogger.info('✅ User created successfully in database');
      webhookLogger.info(`📋 User data: ${JSON.stringify(createdUser[0], null, 2)}`);
    } else {
      webhookLogger.error('❌ User was not created in database');
    }

    // Test 5: Clean up
    await dbInstance.delete(users).where(eq(users.id, sampleWebhookData.id));
    webhookLogger.info('🧹 Test cleanup completed');
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Webhook Test',
      action: 'Test webhook user creation',
    });
    webhookLogger.error(
      '❌ Test failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    if (error instanceof Error) {
      webhookLogger.error('Error details:', error);
      webhookLogger.error('Stack trace:', error);
    }
  }
}

// Import required dependencies
import { eq } from 'drizzle-orm';

// Run the test
testWebhook()
  .then(() => {
    webhookLogger.info('🏁 Webhook test completed');
    process.exit(0);
  })
  .catch(error => {
    webhookLogger.error('💥 Test failed:', error);
    process.exit(1);
  });
