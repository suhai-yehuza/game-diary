// Types file: misc.types.ts

// Types moved from src/lib/utils/encryption.ts
export interface IEncryptedField {
  iv: string;
  content: string;
  tag: string;
}
