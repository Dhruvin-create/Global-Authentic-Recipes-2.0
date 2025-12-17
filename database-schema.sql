-- Global Authentic Recipes Database Schema
-- Create this database and tables in MySQL

-- Create the database
CREATE DATABASE IF NOT EXISTS recipes_db;

-- Use the database
USE recipes_db;

-- Create the recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  ingredients LONGTEXT NOT NULL,
  steps LONGTEXT,
  image VARCHAR(500),
  cooking_time VARCHAR(50),
  difficulty VARCHAR(50),
  history LONGTEXT,
  platingStyle VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_difficulty (difficulty),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample recipe (optional)
INSERT INTO recipes (title, ingredients, steps, cooking_time, difficulty, history, platingStyle, image)
VALUES (
  'Classic Pasta Carbonara',
  'Spaghetti\nGuanciale\nEggs\nCheese\nPepper',
  'Cook pasta\nCook guanciale\nMix eggs and cheese\nCombine',
  '20',
  'Medium',
  'Traditional Roman pasta dish',
  'Traditional',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=60'
);
