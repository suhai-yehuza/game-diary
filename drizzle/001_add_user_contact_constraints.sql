-- Migration: Add user contact constraints
-- This migration adds phone_number field and enforces username + contact requirements

-- Add phone_number column to users table
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(20);

-- Add constraint to ensure username is required and at least one contact method is provided
ALTER TABLE "users" ADD CONSTRAINT "users_contact_constraint"
CHECK (
  username IS NOT NULL AND
  LENGTH(TRIM(username)) > 0 AND
  (email_address IS NOT NULL OR phone_number IS NOT NULL)
);

-- Add unique constraint on phone_number (optional, but recommended for data integrity)
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number");
