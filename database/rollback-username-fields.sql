-- ============================================
-- Rollback: Remove Username and Name Fields
-- Date: 2026-02-20
-- Description: Rollback username, first_name, last_name fields migration
-- ============================================

USE global_recipes;

-- Step 1: Drop indexes
DROP INDEX idx_username ON users;
DROP INDEX idx_first_name ON users;
DROP INDEX idx_last_name ON users;
DROP INDEX idx_oauth_provider ON users;
DROP INDEX idx_oauth_provider_id ON users;

-- Step 2: Drop new columns
ALTER TABLE users
DROP COLUMN username,
DROP COLUMN first_name,
DROP COLUMN last_name,
DROP COLUMN oauth_provider,
DROP COLUMN oauth_id,
DROP COLUMN oauth_access_token,
DROP COLUMN oauth_refresh_token;

-- Step 3: Drop new constraint
ALTER TABLE users
DROP CONSTRAINT chk_contact_method;

-- Step 4: Restore old constraint
ALTER TABLE users
ADD CONSTRAINT chk_auth_method CHECK (
    (email IS NOT NULL AND auth_provider = 'EMAIL') OR 
    (phone IS NOT NULL AND auth_provider = 'PHONE')
);

-- Step 5: Make auth_provider NOT NULL again
ALTER TABLE users
MODIFY COLUMN auth_provider ENUM('EMAIL', 'PHONE') NOT NULL;

-- Success message
SELECT 'Rollback completed successfully!' as status;
