-- ============================================
-- Rollback: Remove SUPER_ADMIN Role
-- Date: 2026-02-17
-- Description: Rollback SUPER_ADMIN role changes
-- ============================================

USE global_recipes;

-- Step 1: Convert all SUPER_ADMIN users to ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE role = 'SUPER_ADMIN';

-- Step 2: Drop the role_change_logs table
DROP TABLE IF EXISTS role_change_logs;

-- Step 3: Modify the role ENUM back to original
ALTER TABLE users 
MODIFY COLUMN role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- Verification
SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM users
ORDER BY role, created_at;

-- Success Message
SELECT 'Rollback completed successfully! SUPER_ADMIN role removed.' AS status;
