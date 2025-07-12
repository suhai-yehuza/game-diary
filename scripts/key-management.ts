#!/usr/bin/env tsx

import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { auditLogger } from '@/lib/services/audit-logger';

// Simple logger for CLI
const logger = {
  info: (message: string, ...args: unknown[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[WARN] ${message}`, ...args),
};

// Key management configuration
const KEY_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  TAG_LENGTH: 16, // 128 bits
  KEY_VERSION_LENGTH: 8, // 64 bits for version
  MAX_KEYS: 5, // Keep last 5 keys for rotation
} as const;

// Key metadata schema
const KeyMetadataSchema = z.object({
  version: z.string(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  algorithm: z.string(),
  keyLength: z.number(),
  description: z.string().optional(),
  environment: z.string(),
  isActive: z.boolean(),
});

type KeyMetadata = z.infer<typeof KeyMetadataSchema>;

// Key store schema
const KeyStoreSchema = z.object({
  version: z.string(),
  keys: z.record(z.string(), KeyMetadataSchema),
  activeKeyId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type KeyStore = z.infer<typeof KeyStoreSchema>;

// Key Management Class
export class KeyManager {
  private keyStorePath: string;
  private keyStore: KeyStore;
  private environment: string;

  constructor(environment: string = 'production') {
    this.environment = environment;
    this.keyStorePath = join(process.cwd(), 'keys', `${environment}-keys.json`);
    this.keyStore = this.loadKeyStore();
  }

  // Load or create key store
  private loadKeyStore(): KeyStore {
    try {
      if (existsSync(this.keyStorePath)) {
        const data = readFileSync(this.keyStorePath, 'utf8');
        const parsed = JSON.parse(data);
        return KeyStoreSchema.parse(parsed);
      }
    } catch (error) {
      logger.error('Failed to load existing key store:', error);
    }

    // Create new key store
    return this.createNewKeyStore();
  }

  // Create a new key store
  private createNewKeyStore(): KeyStore {
    const keyId = this.generateKeyId();
    const now = new Date().toISOString();

    const keyStore: KeyStore = {
      version: '1.0.0',
      keys: {
        [keyId]: {
          version: keyId,
          createdAt: now,
          algorithm: KEY_CONFIG.ALGORITHM,
          keyLength: KEY_CONFIG.KEY_LENGTH,
          description: 'Initial encryption key',
          environment: this.environment,
          isActive: true,
        },
      },
      activeKeyId: keyId,
      createdAt: now,
      updatedAt: now,
    };

    this.saveKeyStore(keyStore);
    return keyStore;
  }

  // Save key store to file
  private saveKeyStore(keyStore: KeyStore): void {
    try {
      const keysDir = join(process.cwd(), 'keys');
      if (!existsSync(keysDir)) {
        mkdirSync(keysDir, { recursive: true });
      }

      keyStore.updatedAt = new Date().toISOString();
      writeFileSync(this.keyStorePath, JSON.stringify(keyStore, null, 2));
      logger.info(`Key store saved to ${this.keyStorePath}`);
    } catch (error) {
      logger.error('Failed to save key store:', error);
      throw error;
    }
  }

  // Generate a new key ID
  private generateKeyId(): string {
    return randomBytes(KEY_CONFIG.KEY_VERSION_LENGTH).toString('hex');
  }

  // Generate a new encryption key
  private generateKey(): string {
    return randomBytes(KEY_CONFIG.KEY_LENGTH).toString('base64');
  }

  // Create a new encryption key
  createKey(description?: string): string {
    const keyId = this.generateKeyId();
    const now = new Date().toISOString();

    // Set expiration to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const newKey: KeyMetadata = {
      version: keyId,
      createdAt: now,
      expiresAt: expiresAt.toISOString(),
      algorithm: KEY_CONFIG.ALGORITHM,
      keyLength: KEY_CONFIG.KEY_LENGTH,
      description: description || `Key created on ${now}`,
      environment: this.environment,
      isActive: false, // New keys start as inactive
    };

    this.keyStore.keys[keyId] = newKey;
    this.saveKeyStore(this.keyStore);

    auditLogger.logKeyCreated(keyId, this.environment, process.env.USER || 'system', description);

    logger.info(`Created new key: ${keyId}`);
    return keyId;
  }

  // Log key creation for audit purposes
  private logKeyCreation(keyId: string, description?: string): void {
    try {
      // In a real implementation, this would call the audit logger
      logger.info(
        `AUDIT: Key created - ID: ${keyId}, Environment: ${this.environment}, Description: ${description || 'No description'}`
      );
    } catch (error) {
      logger.error('Failed to log key creation:', error);
    }
  }

  // Activate a key
  activateKey(keyId: string): void {
    if (!this.keyStore.keys[keyId]) {
      throw new Error(`Key ${keyId} not found`);
    }

    const previousActiveKey = this.keyStore.activeKeyId;

    // Deactivate all other keys
    Object.keys(this.keyStore.keys).forEach(id => {
      this.keyStore.keys[id].isActive = false;
    });

    // Activate the specified key
    this.keyStore.keys[keyId].isActive = true;
    this.keyStore.activeKeyId = keyId;
    this.saveKeyStore(this.keyStore);

    auditLogger.logKeyActivated(keyId, this.environment, process.env.USER || 'system');

    logger.info(`Activated key: ${keyId}`);
  }

  // Log key activation for audit purposes
  private logKeyActivation(keyId: string, previousActiveKey?: string): void {
    try {
      // In a real implementation, this would call the audit logger
      logger.info(
        `AUDIT: Key activated - ID: ${keyId}, Environment: ${this.environment}, Previous Active: ${previousActiveKey || 'None'}`
      );
    } catch (error) {
      logger.error('Failed to log key activation:', error);
    }
  }

  // Get the active key ID
  getActiveKeyId(): string {
    return this.keyStore.activeKeyId;
  }

  // Get key metadata
  getKeyMetadata(keyId: string): KeyMetadata | null {
    return this.keyStore.keys[keyId] || null;
  }

  // List all keys
  listKeys(): Record<string, KeyMetadata> {
    return { ...this.keyStore.keys };
  }

  // Rotate keys (create new key and activate it)
  rotateKeys(description?: string): string {
    const previousActiveKey = this.keyStore.activeKeyId;
    const newKeyId = this.createKey(description);
    this.activateKey(newKeyId);

    // Clean up old keys (keep only the last MAX_KEYS)
    this.cleanupOldKeys();

    auditLogger.logKeyRotation({
      keyId: newKeyId,
      keyVersion: newKeyId,
      environment: this.environment,
      rotationType: 'manual',
      previousKeyId: previousActiveKey,
      newKeyId: newKeyId,
      rotatedBy: process.env.USER || 'system',
      rotationReason: description,
      rotationStartedAt: new Date(),
      status: 'completed',
    });

    logger.info(`Key rotation completed. New active key: ${newKeyId}`);
    return newKeyId;
  }

  // Log key rotation for audit purposes
  private logKeyRotation(newKeyId: string, previousActiveKey?: string, description?: string): void {
    try {
      // In a real implementation, this would call the audit logger
      logger.info(
        `AUDIT: Key rotation - New Key: ${newKeyId}, Previous Active: ${previousActiveKey || 'None'}, Environment: ${this.environment}, Reason: ${description || 'No reason provided'}`
      );
    } catch (error) {
      logger.error('Failed to log key rotation:', error);
    }
  }

  // Clean up old keys
  private cleanupOldKeys(): void {
    const keyIds = Object.keys(this.keyStore.keys);

    if (keyIds.length <= KEY_CONFIG.MAX_KEYS) {
      return;
    }

    // Sort keys by creation date (oldest first)
    const sortedKeys = keyIds
      .map(id => ({ id, metadata: this.keyStore.keys[id] }))
      .sort(
        (a, b) =>
          new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime()
      );

    // Remove oldest keys (keep the last MAX_KEYS)
    const keysToRemove = sortedKeys.slice(0, sortedKeys.length - KEY_CONFIG.MAX_KEYS);

    keysToRemove.forEach(({ id }) => {
      delete this.keyStore.keys[id];
      logger.info(`Removed old key: ${id}`);
    });

    this.saveKeyStore(this.keyStore);
  }

  // Check if a key is expired
  isKeyExpired(keyId: string): boolean {
    const metadata = this.keyStore.keys[keyId];
    if (!metadata || !metadata.expiresAt) {
      return false;
    }

    return new Date() > new Date(metadata.expiresAt);
  }

  // Get expired keys
  getExpiredKeys(): string[] {
    return Object.keys(this.keyStore.keys).filter(keyId => this.isKeyExpired(keyId));
  }

  // Export key for environment variable
  exportKeyForEnv(keyId: string): string {
    if (!this.keyStore.keys[keyId]) {
      throw new Error(`Key ${keyId} not found`);
    }

    // In a real implementation, you would retrieve the actual key from a secure storage
    // For now, we'll return the key ID as a placeholder
    return `KEY_${keyId.toUpperCase()}`;
  }

  // Generate environment file content
  generateEnvContent(keyId: string): string {
    const keyEnvVar = this.exportKeyForEnv(keyId);
    return `# Encryption key for ${this.environment} environment
# Generated on ${new Date().toISOString()}
DATA_ENCRYPTION_KEY=${keyEnvVar}

# Key metadata
KEY_ID=${keyId}
KEY_VERSION=${this.keyStore.keys[keyId]?.version || 'unknown'}
KEY_CREATED=${this.keyStore.keys[keyId]?.createdAt || 'unknown'}
`;
  }

  // Validate key store integrity
  validateKeyStore(): boolean {
    try {
      // Check if active key exists
      if (!this.keyStore.keys[this.keyStore.activeKeyId]) {
        logger.error('Active key not found in key store');
        return false;
      }

      // Check if active key is marked as active
      if (!this.keyStore.keys[this.keyStore.activeKeyId].isActive) {
        logger.error('Active key is not marked as active');
        return false;
      }

      // Check for expired keys
      const expiredKeys = this.getExpiredKeys();
      if (expiredKeys.length > 0) {
        logger.warn(`Found ${expiredKeys.length} expired keys: ${expiredKeys.join(', ')}`);
      }

      logger.info('Key store validation passed');
      return true;
    } catch (error) {
      logger.error('Key store validation failed:', error);
      return false;
    }
  }
}

// CLI Commands
async function main() {
  const command = process.argv[2];
  const environment = process.argv[3] || 'production';
  const keyManager = new KeyManager(environment);

  try {
    switch (command) {
      case 'create':
        const description = process.argv[4];
        const keyId = keyManager.createKey(description);
        console.log(`Created key: ${keyId}`);
        break;

      case 'activate':
        const keyToActivate = process.argv[4];
        if (!keyToActivate) {
          console.error('Please provide a key ID to activate');
          process.exit(1);
        }
        keyManager.activateKey(keyToActivate);
        console.log(`Activated key: ${keyToActivate}`);
        break;

      case 'rotate':
        const rotationDescription = process.argv[4];
        const newKeyId = keyManager.rotateKeys(rotationDescription);
        console.log(`Key rotation completed. New active key: ${newKeyId}`);
        break;

      case 'list':
        const keys = keyManager.listKeys();
        console.log('Available keys:');
        Object.entries(keys).forEach(([id, metadata]) => {
          const status = metadata.isActive ? 'ACTIVE' : 'INACTIVE';
          const expired = keyManager.isKeyExpired(id) ? ' (EXPIRED)' : '';
          console.log(`  ${id}: ${status}${expired} - ${metadata.description}`);
        });
        break;

      case 'validate':
        const isValid = keyManager.validateKeyStore();
        console.log(`Key store validation: ${isValid ? 'PASSED' : 'FAILED'}`);
        break;

      case 'export-env':
        const activeKeyId = keyManager.getActiveKeyId();
        const envContent = keyManager.generateEnvContent(activeKeyId);
        console.log(envContent);
        break;

      default:
        console.log(`
Key Management CLI

Usage: tsx scripts/key-management.ts <command> [environment] [options]

Commands:
  create [description]     Create a new encryption key
  activate <keyId>        Activate a specific key
  rotate [description]    Rotate keys (create new and activate)
  list                    List all available keys
  validate                Validate key store integrity
  export-env              Export environment variables for active key

Examples:
  tsx scripts/key-management.ts create "New production key"
  tsx scripts/key-management.ts activate abc123
  tsx scripts/key-management.ts rotate "Monthly rotation"
  tsx scripts/key-management.ts list
  tsx scripts/key-management.ts export-env > .env.production
`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
