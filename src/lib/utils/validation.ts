import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email address format')
  .min(1, 'Email address is required')
  .max(255, 'Email address is too long');

// Phone number validation schema (supports international formats)
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .max(20, 'Phone number is too long')
  .regex(
    /^[+]?[1-9][\d]{0,15}$/,
    'Phone number must be a valid international format (e.g., +1234567890 or 1234567890)'
  );

// User contact validation schema
export const userContactSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(255, 'Username is too long'),
    email_address: emailSchema.optional(),
    phone_number: phoneSchema.optional(),
  })
  .refine(
    data => {
      // At least one of email or phone must be provided
      return data.email_address ?? data.phone_number;
    },
    {
      message: 'At least one contact method (email or phone) is required',
      path: ['email_address'], // This will show the error on the email field
    }
  );

// Validation functions
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

export function validateUserContact(data: {
  username: string;
  email_address?: string;
  phone_number?: string;
}): { success: boolean; errors?: string[] } {
  const result = userContactSchema.safeParse(data);

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
  };
}

// Extract phone number from Clerk data
export function extractPhoneNumber(clerkData: { phone_numbers: unknown[] }): string | null {
  if (!clerkData.phone_numbers || !Array.isArray(clerkData.phone_numbers)) {
    return null;
  }

  // Find the first phone number (assuming it's the primary one)
  const phoneNumber = clerkData.phone_numbers[0];

  if (phoneNumber && typeof phoneNumber === 'object' && 'phone_number' in phoneNumber) {
    const phone = (phoneNumber as { phone_number: string }).phone_number;
    return validatePhone(phone) ? phone : null;
  }

  return null;
}

// Extract email from Clerk data
export function extractEmail(clerkData: {
  email_addresses: Array<{ email_address: string }>;
}): string | null {
  if (
    !clerkData.email_addresses ||
    !Array.isArray(clerkData.email_addresses) ||
    clerkData.email_addresses.length === 0
  ) {
    return null;
  }

  // Find the first email address (assuming it's the primary one)
  const emailAddress = clerkData.email_addresses[0];

  if (
    emailAddress &&
    typeof emailAddress === 'object' &&
    'email_address' in emailAddress &&
    emailAddress.email_address
  ) {
    return validateEmail(emailAddress.email_address) ? emailAddress.email_address : null;
  }

  return null;
}
