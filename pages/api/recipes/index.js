import pool from '../../../src/lib/db';
import multer from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';

export const config = { api: { bodyParser: false } };

// Ensure uploads directory exists at runtime
const uploadsDir = join(process.cwd(), 'public', 'uploads');
let upload;
try {
  mkdirSync(uploadsDir, { recursive: true });
  upload = multer({ dest: uploadsDir });
} catch (e) {
  console.error('Failed to setup uploads directory:', e.message);
  // Fallback: use a safer path
  upload = multer({ storage: multer.memoryStorage() });
}

// Simple in-memory storage for demo/fallback
let mockRecipes = [
  {
    id: 1,
    title: 'Classic Pasta Carbonara',
    ingredients: 'Spaghetti\nGuanciale\nEggs\nCheese\nPepper',
    steps: 'Cook pasta\nCook guanciale\nMix eggs and cheese\nCombine',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=60',
    cooking_time: '20',
    difficulty: 'Medium',
    history: 'Traditional Roman pasta dish',
    platingStyle: 'Traditional'
  }
];
let nextMockId = 2;

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      try {
        // Try real database
        const [rows] = await Promise.race([
          pool.query('SELECT * FROM recipes ORDER BY id DESC'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000))
        ]);
        res.status(200).json(rows);
      } catch (dbError) {
        console.warn('Database unavailable, using mock data:', dbError.message);
        res.status(200).json(mockRecipes);
      }
    } else if (req.method === 'POST') {
      upload.single('image')(req, {}, async (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const { title, ingredients, steps, cooking_time, difficulty, history, platingStyle } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        
        if (!title || !ingredients) {
          return res.status(400).json({ error: 'Title and ingredients are required' });
        }

        let saved = false;
        try {
          // Try real database
          await Promise.race([
            pool.query(
              'INSERT INTO recipes (title, ingredients, steps, image, cooking_time, difficulty, history, platingStyle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [title, ingredients, steps, image, cooking_time, difficulty, history, platingStyle]
            ).catch(async (e) => {
              // Try without platingStyle column
              if (e.message.includes('platingStyle') || e.message.includes('Unknown column')) {
                await pool.query(
                  'INSERT INTO recipes (title, ingredients, steps, image, cooking_time, difficulty, history) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [title, ingredients, steps, image, cooking_time, difficulty, history]
                );
              } else {
                throw e;
              }
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000))
          ]);
          saved = true;
        } catch (dbError) {
          console.warn('Database insert failed:', dbError.message);
          // Fallback to mock
          const newRecipe = {
            id: nextMockId++,
            title,
            ingredients,
            steps,
            image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=60',
            cooking_time,
            difficulty,
            history,
            platingStyle
          };
          mockRecipes.unshift(newRecipe);
        }
        
        res.status(201).json({ 
          message: saved ? 'Recipe added successfully' : 'Recipe saved (demo mode - no database)',
          saved
        });
      });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (e) {
    console.error('API error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
};

export default handler;
