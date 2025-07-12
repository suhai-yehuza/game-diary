#!/usr/bin/env tsx

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

import { users } from '@/lib/db/schema';
import {
  encryptField,
  serializeEncryptedField,
  deserializeEncryptedField,
  decryptField,
} from '@/lib/utils/encryption';
import { logger } from '@lib/core/logger';

interface UserRecord {
  id: string;
  email_address: string | null;
  phone_number: string | null;
}

async function encryptExistingUsers() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  if (!process.env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  logger.info('🔐 Starting encryption of existing user data...');

  try {
    // Get all users with their current email and phone data
    const allUsers = await db
      .select({
        id: users.id,
        email_address: users.email_address,
        phone_number: users.phone_number,
      })
      .from(users);

    logger.info(`📊 Found ${allUsers.length} users to process`);

    let encryptedCount = 0;
    let skippedCount = 0;

    for (const user of allUsers) {
      let needsUpdate = false;
      const updates: { email_address?: string; phone_number?: string } = {};

      // Check if email needs encryption
      if (user.email_address && !isEncrypted(user.email_address)) {
        const encryptedEmail = serializeEncryptedField(encryptField(user.email_address));
        updates.email_address = encryptedEmail;
        needsUpdate = true;
        logger.info(`🔒 Encrypting email for user ${user.id}`);
      }

      // Check if phone needs encryption
      if (user.phone_number && !isEncrypted(user.phone_number)) {
        const encryptedPhone = serializeEncryptedField(encryptField(user.phone_number));
        updates.phone_number = encryptedPhone;
        needsUpdate = true;
        logger.info(`🔒 Encrypting phone for user ${user.id}`);
      }

      if (needsUpdate) {
        await db.update(users).set(updates).where(eq(users.id, user.id));
        encryptedCount++;
      } else {
        skippedCount++;
      }
    }

    logger.info(`✅ Encryption completed!`);
    logger.info(`   - Encrypted: ${encryptedCount} users`);
    logger.info(`   - Skipped (already encrypted): ${skippedCount} users`);

    // Verify encryption worked by testing a few records
    await verifyEncryption(db);
  } catch (error) {
    logger.error('❌ Error during encryption:', error);
    throw error;
  }
}

function isEncrypted(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return (
      parsed &&
      typeof parsed === 'object' &&
      'iv' in parsed &&
      'content' in parsed &&
      'tag' in parsed
    );
  } catch {
    return false;
  }
}

async function verifyEncryption(db: any) {
  logger.info('🔍 Verifying encryption...');

  const testUsers = await db
    .select({
      id: users.id,
      email_address: users.email_address,
      phone_number: users.phone_number,
    })
    .from(users)
    .limit(3);

  for (const user of testUsers) {
    if (user.email_address) {
      try {
        const decrypted = decryptField(deserializeEncryptedField(user.email_address));
        logger.info(
          `✅ Email decryption test passed for user ${user.id}: ${decrypted.substring(0, 10)}...`
        );
      } catch (error) {
        logger.error(`❌ Email decryption failed for user ${user.id}:`, error);
      }
    }

    if (user.phone_number) {
      try {
        const decrypted = decryptField(deserializeEncryptedField(user.phone_number));
        logger.info(
          `✅ Phone decryption test passed for user ${user.id}: ${decrypted.substring(0, 10)}...`
        );
      } catch (error) {
        logger.error(`❌ Phone decryption failed for user ${user.id}:`, error);
      }
    }
  }
}

// Run the script
if (require.main === module) {
  encryptExistingUsers()
    .then(() => {
      logger.info('🎉 User encryption script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('💥 User encryption script failed:', error);
      process.exit(1);
    });
}

export { encryptExistingUsers };
