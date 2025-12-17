import pool from '../../../src/lib/db';

// Simple in-memory storage for demo/fallback
let mockRecipes = [];

export default async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      try {
        const [rows] = await Promise.race([
          pool.query('SELECT * FROM recipes WHERE id = ?', [id]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000))
        ]);
        res.status(200).json(rows[0] || { error: 'Not found' });
      } catch (dbError) {
        console.warn('Database GET failed:', dbError.message);
        const recipe = mockRecipes.find(r => r.id === parseInt(id));
        res.status(recipe ? 200 : 404).json(recipe || { error: 'Recipe not found' });
      }
    } else if (req.method === 'PUT') {
      const { title, ingredients, steps, cooking_time, difficulty, history, image } = req.body;
      try {
        await Promise.race([
          pool.query(
            'UPDATE recipes SET title=?, ingredients=?, steps=?, cooking_time=?, difficulty=?, history=?, image=? WHERE id=?',
            [title, ingredients, steps, cooking_time, difficulty, history, image, id]
          ),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000))
        ]);
        res.status(200).json({ message: 'Recipe updated' });
      } catch (dbError) {
        console.warn('Database UPDATE failed:', dbError.message);
        const recipe = mockRecipes.find(r => r.id === parseInt(id));
        if (recipe) {
          Object.assign(recipe, { title, ingredients, steps, cooking_time, difficulty, history, image });
          res.status(200).json({ message: 'Recipe updated (demo)' });
        } else {
          res.status(404).json({ error: 'Recipe not found' });
        }
      }
    } else if (req.method === 'DELETE') {
      try {
        await Promise.race([
          pool.query('DELETE FROM recipes WHERE id = ?', [id]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000))
        ]);
        res.status(200).json({ message: 'Deleted' });
      } catch (dbError) {
        console.warn('Database DELETE failed:', dbError.message);
        const index = mockRecipes.findIndex(r => r.id === parseInt(id));
        if (index >= 0) {
          mockRecipes.splice(index, 1);
          res.status(200).json({ message: 'Deleted (demo)' });
        } else {
          res.status(404).json({ error: 'Recipe not found' });
        }
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (e) {
    console.error('API error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
};
