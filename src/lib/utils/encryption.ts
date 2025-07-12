import crypto from 'crypto';

import { config } from 'dotenv-flow';

// Load environment variables
config();

import type { IEncryptedField } from '@/lib/types/misc.types';

const algorithm = 'aes-256-gcm';

function getKey(keyOverride?: string | Buffer): Buffer {
  if (keyOverride) {
    if (typeof keyOverride === 'string') {
      if (keyOverride.length === 64) return Buffer.from(keyOverride, 'hex');
      throw new Error('Key override must be a 32-byte hex string (64 hex chars)');
    }
    if (Buffer.isBuffer(keyOverride) && keyOverride.length === 32) return keyOverride;
    throw new Error('Key override must be a 32-byte buffer or 64-char hex string');
  }
  const keyHex = process.env.DATA_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('DATA_ENCRYPTION_KEY must be set to a 32-byte hex string (64 hex chars)');
  }
  return Buffer.from(keyHex, 'hex');
}

export function encryptField(plain: string, keyOverride?: string | Buffer): IEncryptedField {
  const key = getKey(keyOverride);
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: tag.toString('hex'),
  };
}

export function decryptField(
  { iv, content, tag }: IEncryptedField,
  keyOverride?: string | Buffer
): string {
  const key = getKey(keyOverride);
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Utility to serialize for DB storage
export function serializeEncryptedField(field: IEncryptedField): string {
  return JSON.stringify(field);
}

export function deserializeEncryptedField(serialized: string): IEncryptedField {
  return JSON.parse(serialized) as IEncryptedField;
}

// Utility to check if a field is encrypted
export function isEncrypted(value: string | null): boolean {
  if (!value) return false;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
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
