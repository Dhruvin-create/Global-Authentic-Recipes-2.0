/**
 * Express Backend Server for Global Authentic Recipes
 * Handles database operations and API endpoints
 * 
 * Usage: node backend/server.js
 * Runs on: http://localhost:5000
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env.local' });

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'recipes_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// GET all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM recipes ORDER BY id DESC');
    connection.release();
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('GET /api/recipes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM recipes WHERE id = ?', [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('GET /api/recipes/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new recipe
app.post('/api/recipes', async (req, res) => {
  try {
    const { title, ingredients, steps, cooking_time, difficulty, history, platingStyle, image } = req.body;
    
    if (!title || !ingredients) {
      return res.status(400).json({ error: 'Title and ingredients are required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO recipes (title, ingredients, steps, image, cooking_time, difficulty, history, platingStyle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, ingredients, steps, image || null, cooking_time || null, difficulty || null, history || null, platingStyle || null]
    );
    connection.release();
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Recipe added successfully',
      ...req.body 
    });
  } catch (error) {
    console.error('POST /api/recipes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update recipe
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ingredients, steps, cooking_time, difficulty, history, platingStyle, image } = req.body;
    
    if (!title || !ingredients) {
      return res.status(400).json({ error: 'Title and ingredients are required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE recipes SET title=?, ingredients=?, steps=?, image=?, cooking_time=?, difficulty=?, history=?, platingStyle=? WHERE id=?',
      [title, ingredients, steps, image || null, cooking_time || null, difficulty || null, history || null, platingStyle || null, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.status(200).json({ message: 'Recipe updated successfully', id });
  } catch (error) {
    console.error('PUT /api/recipes/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM recipes WHERE id = ?', [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.status(200).json({ message: 'Recipe deleted successfully', id });
  } catch (error) {
    console.error('DELETE /api/recipes/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Global Authentic Recipes Backend     ║
╠════════════════════════════════════════╣
║   ✅ Server running on port ${PORT}       ║
║   📍 Base URL: http://localhost:${PORT}   ║
║   🏥 Health: http://localhost:${PORT}/health ║
║   📚 Recipes: http://localhost:${PORT}/api/recipes ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await pool.end();
  process.exit(0);
});
