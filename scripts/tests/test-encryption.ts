#!/usr/bin/env tsx

import {
  encryptField,
  decryptField,
  serializeEncryptedField,
  deserializeEncryptedField,
} from '@/lib/utils/encryption';
import { errorHandlers } from '@/lib/utils/error-handler';

// Set the encryption key for testing
process.env.DATA_ENCRYPTION_KEY =
  '6a53a8ddc65a179c1cc0d782a65f723b15049d7f316c13c8ae74f85f5032dce6';

function testEncryption() {
  console.log('🔐 Testing encryption utility...\n');

  const testEmail = 'test@example.com';
  const testPhone = '+1234567890';

  try {
    // Test email encryption
    console.log('📧 Testing email encryption:');
    console.log('  Original:', testEmail);

    const encryptedEmail = serializeEncryptedField(encryptField(testEmail));
    console.log('  Encrypted:', encryptedEmail);

    const decryptedEmail = decryptField(deserializeEncryptedField(encryptedEmail));
    console.log('  Decrypted:', decryptedEmail);
    console.log('  Match:', testEmail === decryptedEmail ? '✅' : '❌');
    console.log();

    // Test phone encryption
    console.log('📱 Testing phone encryption:');
    console.log('  Original:', testPhone);

    const encryptedPhone = serializeEncryptedField(encryptField(testPhone));
    console.log('  Encrypted:', encryptedPhone);

    const decryptedPhone = decryptField(deserializeEncryptedField(encryptedPhone));
    console.log('  Decrypted:', decryptedPhone);
    console.log('  Match:', testPhone === decryptedPhone ? '✅' : '❌');
    console.log();

    console.log('🎉 Encryption test completed successfully!');
    return true;
  } catch (error) {
    // Use centralized error handling
    errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
      component: 'Encryption Test',
      action: 'Test encryption utility',
    });
    console.error('❌ Encryption test failed:', error);
    return false;
  }
}

// Run the test
const success = testEncryption();
process.exit(success ? 0 : 1);

export { testEncryption };
