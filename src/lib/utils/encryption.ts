import crypto from 'crypto';

import type { IEncryptedField } from '@/lib/types/misc.types';

const algorithm = 'aes-256-gcm';
const keyHex = process.env.DATA_ENCRYPTION_KEY;
if (!keyHex || keyHex.length !== 64) {
  throw new Error('DATA_ENCRYPTION_KEY must be set to a 32-byte hex string (64 hex chars)');
}
const key = Buffer.from(keyHex, 'hex');

export function encryptField(plain: string): IEncryptedField {
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

export function decryptField({ iv, content, tag }: IEncryptedField): string {
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
