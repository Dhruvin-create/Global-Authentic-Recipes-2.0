-- ============================================
-- Migration: Add SUPER_ADMIN Role
-- Date: 2026-02-17
-- Description: Adds SUPER_ADMIN role to users table
-- ============================================

USE global_recipes;

-- Step 1: Modify the role ENUM to include SUPER_ADMIN
ALTER TABLE users 
MODIFY COLUMN role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER';

-- Step 2: Create a super admin user (update with your real email)
-- Password: SuperAdmin@123
INSERT INTO users (
    id, 
    email, 
    phone, 
    password, 
    name, 
    role, 
    auth_provider, 
    is_verified, 
    created_at
) VALUES (
    UUID(),
    'superadmin@globalrecipes.com', -- Change this to your real email
    NULL,
    '$2a$10$uau4TzuAAlRo2BinYRg2nOb3dVuHUrHQNuIPuF4dVsTx5mu.WSVtG', -- SuperAdmin@123
    'Super Administrator',
    'SUPER_ADMIN',
    'EMAIL',
    TRUE,
    NOW()
) ON DUPLICATE KEY UPDATE role = 'SUPER_ADMIN';

-- Step 3: Update existing admin to regular admin (if needed)
-- This ensures only one super admin exists
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@recipes.com' AND role = 'ADMIN';

-- Step 4: Create audit log for role changes (optional but professional)
CREATE TABLE IF NOT EXISTS role_change_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    old_role ENUM('USER', 'ADMIN', 'SUPER_ADMIN'),
    new_role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
    changed_by VARCHAR(36) COMMENT 'User ID who made the change',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Log the initial super admin creation
INSERT INTO role_change_logs (user_id, old_role, new_role, changed_by, reason)
SELECT 
    id, 
    NULL, 
    'SUPER_ADMIN', 
    id, 
    'Initial super admin setup via migration'
FROM users 
WHERE email = 'superadmin@globalrecipes.com';

-- Verification Query
SELECT 
    id,
    email,
    name,
    role,
    is_verified,
    created_at
FROM users
ORDER BY 
    CASE role
        WHEN 'SUPER_ADMIN' THEN 1
        WHEN 'ADMIN' THEN 2
        WHEN 'USER' THEN 3
    END,
    created_at;

-- Success Message
SELECT 'Migration completed successfully! SUPER_ADMIN role added.' AS status;
