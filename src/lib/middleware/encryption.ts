import { NextRequest, NextResponse } from 'next/server';

import {
  decryptField,
  deserializeEncryptedField,
  encryptField,
  serializeEncryptedField,
} from '@/lib/utils/encryption';

// Helper function to check if a value is encrypted
function isEncrypted(value: string | null): boolean {
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

// Helper function to safely decrypt a field
function safeDecrypt(encryptedValue: string | null): string | null {
  if (!encryptedValue) return null;

  try {
    if (isEncrypted(encryptedValue)) {
      return decryptField(deserializeEncryptedField(encryptedValue));
    }
    return encryptedValue; // Return as-is if not encrypted
  } catch (error) {
    console.error('Failed to decrypt field:', error);
    return null; // Return null on decryption failure
  }
}

// Middleware to decrypt sensitive fields in API responses
export function decryptResponseMiddleware(
  _request: NextRequest,
  response: NextResponse,
  userId?: string
): NextResponse {
  try {
    const responseData = response.json ? response.json() : null;

    if (!responseData) {
      return response;
    }

    // Decrypt sensitive fields based on the requesting user
    const decryptedData = decryptSensitiveFields(responseData, userId);

    return NextResponse.json(decryptedData, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Error in decrypt response middleware:', error);
    return response; // Return original response on error
  }
}

// Middleware to encrypt sensitive fields in API requests
export function encryptRequestMiddleware(request: NextRequest, _userId?: string): NextRequest {
  try {
    const requestData = request.json ? request.json() : null;

    if (!requestData) {
      return request;
    }

    // Encrypt sensitive fields before processing
    const encryptedData = encryptSensitiveFields(requestData);

    // Create new request with encrypted data
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(encryptedData),
    });

    return newRequest;
  } catch (error) {
    console.error('Error in encrypt request middleware:', error);
    return request; // Return original request on error
  }
}

// Function to decrypt sensitive fields in response data
export function decryptSensitiveFields(data: unknown, requestingUserId?: string): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => decryptSensitiveFields(item, requestingUserId));
  }

  const decryptedData = { ...data } as Record<string, unknown>;

  // Handle user data specifically
  if (decryptedData.id && (decryptedData.email_address || decryptedData.phone_number)) {
    const dataUserId = decryptedData.id as string;
    const isOwnUser = requestingUserId === dataUserId;

    // Only decrypt sensitive fields for the user themselves
    if (isOwnUser) {
      if (decryptedData.email_address) {
        decryptedData.email_address = safeDecrypt(decryptedData.email_address as string);
      }
      if (decryptedData.phone_number) {
        decryptedData.phone_number = safeDecrypt(decryptedData.phone_number as string);
      }
    } else {
      // For other users, mask sensitive data
      if (decryptedData.email_address) {
        decryptedData.email_address = null;
      }
      if (decryptedData.phone_number) {
        decryptedData.phone_number = null;
      }
    }
  }

  // Recursively process nested objects
  for (const [key, value] of Object.entries(decryptedData)) {
    if (value && typeof value === 'object') {
      decryptedData[key] = decryptSensitiveFields(value, requestingUserId);
    }
  }

  return decryptedData;
}

// Function to encrypt sensitive fields in request data
export function encryptSensitiveFields(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => encryptSensitiveFields(item));
  }

  const encryptedData = { ...data } as Record<string, unknown>;

  // Encrypt sensitive fields
  if (encryptedData.email_address && !isEncrypted(encryptedData.email_address as string)) {
    encryptedData.email_address = serializeEncryptedField(
      encryptField(encryptedData.email_address as string)
    );
  }

  if (encryptedData.phone_number && !isEncrypted(encryptedData.phone_number as string)) {
    encryptedData.phone_number = serializeEncryptedField(
      encryptField(encryptedData.phone_number as string)
    );
  }

  // Recursively process nested objects
  for (const [key, value] of Object.entries(encryptedData)) {
    if (value && typeof value === 'object') {
      encryptedData[key] = encryptSensitiveFields(value);
    }
  }

  return encryptedData;
}

// Higher-order function to wrap API handlers with encryption middleware
export function withEncryption<T extends (...args: unknown[]) => unknown>(
  handler: T,
  options: {
    decryptResponse?: boolean;
    encryptRequest?: boolean;
    getUserId?: (request: NextRequest) => string | undefined;
  } = {}
): T {
  return (async (request: NextRequest, ...args: unknown[]) => {
    const { decryptResponse = true, encryptRequest = true, getUserId } = options;

    let processedRequest = request;
    const userId = getUserId ? getUserId(request) : undefined;

    // Encrypt request data if needed
    if (encryptRequest) {
      processedRequest = encryptRequestMiddleware(request, userId);
    }

    // Call the original handler
    const response = await handler(processedRequest, ...args);

    // Decrypt response data if needed
    if (decryptResponse && response instanceof NextResponse) {
      return decryptResponseMiddleware(request, response, userId);
    }

    return response;
  }) as T;
}
