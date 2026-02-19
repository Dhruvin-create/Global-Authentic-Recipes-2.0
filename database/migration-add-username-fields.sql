-- ============================================
-- Migration: Add Username and Name Fields
-- Date: 2026-02-20
-- Description: Add username, first_name, last_name fields and make email/phone optional
-- ============================================

USE global_recipes;

-- Step 1: Add new columns
ALTER TABLE users
ADD COLUMN username VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN first_name VARCHAR(100) AFTER name,
ADD COLUMN last_name VARCHAR(100) AFTER first_name;

-- Step 2: Populate first_name from existing name field (temporary)
UPDATE users 
SET first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = SUBSTRING_INDEX(name, ' ', -1);

-- Step 3: Generate usernames from existing emails/phones (temporary)
UPDATE users 
SET username = CASE 
    WHEN email IS NOT NULL THEN LOWER(SUBSTRING_INDEX(email, '@', 1))
    WHEN phone IS NOT NULL THEN CONCAT('user', SUBSTRING(phone, -6))
    ELSE CONCAT('user', id)
END
WHERE username IS NULL;

-- Step 4: Make username NOT NULL after populating
ALTER TABLE users
MODIFY COLUMN username VARCHAR(50) NOT NULL;

-- Step 5: Drop the old constraint that required email OR phone
ALTER TABLE users
DROP CONSTRAINT chk_auth_method;

-- Step 6: Add new constraint - at least one of email or phone must be provided
ALTER TABLE users
ADD CONSTRAINT chk_contact_method CHECK (
    email IS NOT NULL OR phone IS NOT NULL
);

-- Step 7: Make auth_provider nullable since users can have both email and phone
ALTER TABLE users
MODIFY COLUMN auth_provider ENUM('EMAIL', 'PHONE', 'OAUTH_GOOGLE', 'OAUTH_FACEBOOK', 'OAUTH_INSTAGRAM') NULL;

-- Step 8: Add OAuth fields
ALTER TABLE users
ADD COLUMN oauth_provider VARCHAR(50) AFTER auth_provider,
ADD COLUMN oauth_id VARCHAR(255) AFTER oauth_provider,
ADD COLUMN oauth_access_token TEXT AFTER oauth_id,
ADD COLUMN oauth_refresh_token TEXT AFTER oauth_access_token;

-- Step 9: Add indexes for new fields
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_first_name ON users(first_name);
CREATE INDEX idx_last_name ON users(last_name);
CREATE INDEX idx_oauth_provider ON users(oauth_provider);
CREATE UNIQUE INDEX idx_oauth_provider_id ON users(oauth_provider, oauth_id);

-- Step 10: Update the name column to be generated (optional, for backward compatibility)
-- This will keep the name field as "first_name last_name"
UPDATE users 
SET name = CONCAT(first_name, ' ', last_name);

-- Verification Query
SELECT 
    id,
    username,
    first_name,
    last_name,
    name,
    email,
    phone,
    auth_provider,
    oauth_provider
FROM users
LIMIT 5;

-- Success message
SELECT 'Migration completed successfully! Username and name fields added.' as status;
