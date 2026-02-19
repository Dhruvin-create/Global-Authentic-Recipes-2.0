-- ============================================
-- Global Authentic Recipes - MySQL Database Schema
-- Database: MySQL 8.0+
-- Laragon Setup
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS global_recipes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE global_recipes;

-- ============================================
-- USER AUTHENTICATION & MANAGEMENT
-- ============================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password using bcrypt',
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) COMMENT 'Profile picture URL',
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    auth_provider ENUM('EMAIL', 'PHONE') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    
    CONSTRAINT chk_auth_method CHECK (
        (email IS NOT NULL AND auth_provider = 'EMAIL') OR 
        (phone IS NOT NULL AND auth_provider = 'PHONE')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CUISINES MANAGEMENT
-- ============================================

CREATE TABLE cuisines (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL COMMENT 'e.g., Indian, Italian, Chinese',
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL-friendly version',
    description TEXT COMMENT 'Brief description of the cuisine',
    image VARCHAR(500) COMMENT 'Cuisine representative image',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RECIPE MANAGEMENT
-- ============================================

CREATE TABLE recipes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) NOT NULL COMMENT 'Main recipe image URL',
    
    -- Recipe Details
    category ENUM(
        'BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 
        'DESSERT', 'BEVERAGES', 'APPETIZER', 
        'MAIN_COURSE', 'SIDE_DISH'
    ) NOT NULL,
    cuisine_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to cuisines table',
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    prep_time INT NOT NULL COMMENT 'Preparation time in minutes',
    cook_time INT NOT NULL COMMENT 'Cooking time in minutes',
    servings INT NOT NULL,
    calories INT,
    
    -- Metadata
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    
    -- Foreign Keys
    author_id VARCHAR(36) NOT NULL,
    
    INDEX idx_slug (slug),
    INDEX idx_author (author_id),
    INDEX idx_category (category),
    INDEX idx_cuisine (cuisine_id),
    INDEX idx_published (is_published),
    INDEX idx_featured (is_featured),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description),
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cuisine_id) REFERENCES cuisines(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RECIPE IMAGES (Additional Images)
-- ============================================

CREATE TABLE recipe_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recipe_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recipe (recipe_id),
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RECIPE COMPONENTS
-- ============================================

CREATE TABLE ingredients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recipe_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL COMMENT 'e.g., 2 cups, 500g',
    display_order INT NOT NULL,
    
    INDEX idx_recipe (recipe_id),
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE instructions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recipe_id VARCHAR(36) NOT NULL,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) COMMENT 'Optional step image',
    
    INDEX idx_recipe (recipe_id),
    INDEX idx_step (step_number),
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL COMMENT '1-5 stars',
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_recipe (recipe_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    
    UNIQUE KEY unique_user_recipe (user_id, recipe_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE review_replies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    review_id VARCHAR(36) NOT NULL,
    admin_id VARCHAR(36) NOT NULL COMMENT 'Only admin can reply',
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_review (review_id),
    INDEX idx_admin (admin_id),
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LIKES
-- ============================================

CREATE TABLE likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recipe (recipe_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at),
    
    UNIQUE KEY unique_user_recipe_like (user_id, recipe_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FAVORITES (Save for Later)
-- ============================================

CREATE TABLE favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recipe (recipe_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at),
    
    UNIQUE KEY unique_user_recipe_favorite (user_id, recipe_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PLAYLISTS (Custom Collections)
-- ============================================

CREATE TABLE playlists (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE playlist_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    playlist_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_playlist (playlist_id),
    INDEX idx_recipe (recipe_id),
    
    UNIQUE KEY unique_playlist_recipe (playlist_id, recipe_id),
    
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TAGS
-- ============================================

CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recipe_tags (
    recipe_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    
    PRIMARY KEY (recipe_id, tag_id),
    INDEX idx_recipe (recipe_id),
    INDEX idx_tag (tag_id),
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Recipe Statistics View
CREATE VIEW recipe_stats AS
SELECT 
    r.id,
    r.title,
    r.author_id,
    c.name as cuisine_name,
    c.slug as cuisine_slug,
    r.category,
    r.view_count,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT f.id) as favorite_count,
    COUNT(DISTINCT rv.id) as review_count,
    COALESCE(AVG(rv.rating), 0) as avg_rating
FROM recipes r
LEFT JOIN cuisines c ON r.cuisine_id = c.id
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN favorites f ON r.id = f.recipe_id
LEFT JOIN reviews rv ON r.id = rv.recipe_id
GROUP BY r.id, r.title, r.author_id, c.name, c.slug, r.category, r.view_count;

-- User Activity View
CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.name,
    u.role,
    COUNT(DISTINCT r.id) as recipes_created,
    COUNT(DISTINCT rv.id) as reviews_written,
    COUNT(DISTINCT l.id) as likes_given,
    COUNT(DISTINCT f.id) as favorites_count,
    COUNT(DISTINCT p.id) as playlists_count
FROM users u
LEFT JOIN recipes r ON u.id = r.author_id
LEFT JOIN reviews rv ON u.id = rv.user_id
LEFT JOIN likes l ON u.id = l.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN playlists p ON u.id = p.user_id
GROUP BY u.id, u.name, u.role;

-- Cuisine Statistics View
CREATE VIEW cuisine_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.is_active,
    COUNT(DISTINCT r.id) as recipe_count,
    COUNT(DISTINCT l.id) as total_likes,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT rv.id) as total_reviews,
    COALESCE(AVG(rv.rating), 0) as avg_rating
FROM cuisines c
LEFT JOIN recipes r ON c.id = r.cuisine_id AND r.is_published = TRUE
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN favorites f ON r.id = f.recipe_id
LEFT JOIN reviews rv ON r.id = rv.recipe_id
GROUP BY c.id, c.name, c.slug, c.is_active
ORDER BY recipe_count DESC;
