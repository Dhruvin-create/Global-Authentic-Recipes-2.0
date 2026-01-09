import { NextApiRequest, NextApiResponse } from 'next';
const { executeQuery, initializeDatabase } = require('../../../lib/database');

interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  steps?: string;
  image_url?: string;
  cooking_time?: number;
  difficulty: string;
  history?: string;
  plating_style?: string;
  origin_country: string;
  country_code?: string;
  cuisine: string;
  authenticity_status: string;
  cultural_context?: string;
  popularity_score: number;
  status: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  city?: string;
  created_at: string;
}

interface RecipesResponse {
  success: boolean;
  recipes?: Recipe[];
  total?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecipesResponse | Recipe>
) {
  if (req.method === 'GET') {
    try {
      // Initialize database if needed
      await initializeDatabase();

      // Get query parameters
      const { 
        limit = '20', 
        offset = '0', 
        search = '', 
        cuisine = '', 
        difficulty = '', 
        authenticity = '' 
      } = req.query;

      // Build WHERE clause based on filters
      let whereClause = "WHERE r.status = 'published'";
      const params: any[] = [];

      if (search) {
        whereClause += " AND (r.title LIKE ? OR r.ingredients LIKE ? OR r.origin_country LIKE ?)";
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (cuisine) {
        whereClause += " AND r.cuisine = ?";
        params.push(cuisine);
      }

      if (difficulty) {
        whereClause += " AND r.difficulty = ?";
        params.push(difficulty);
      }

      if (authenticity) {
        whereClause += " AND r.authenticity_status = ?";
        params.push(authenticity);
      }

      // Add pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      // Fetch recipes
      const [rows] = await executeQuery(`
        SELECT 
          r.id,
          r.title,
          r.ingredients,
          r.steps,
          r.image_url,
          r.cooking_time,
          r.difficulty,
          r.history,
          r.plating_style,
          r.origin_country,
          r.country_code,
          r.cuisine,
          r.authenticity_status,
          r.cultural_context,
          r.popularity_score,
          r.status,
          r.latitude,
          r.longitude,
          r.region,
          r.city,
          r.created_at
        FROM recipes r
        ${whereClause}
        ORDER BY r.popularity_score DESC, r.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limitNum, offsetNum]);

      // Get total count for pagination
      const [countRows] = await executeQuery(`
        SELECT COUNT(*) as total
        FROM recipes r
        ${whereClause}
      `, params);

      const total = countRows[0]?.total || 0;

      res.status(200).json({
        success: true,
        recipes: rows as Recipe[],
        total
      });

    } catch (error) {
      console.error('Recipes fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      // Initialize database if needed
      await initializeDatabase();

      const {
        title,
        ingredients,
        steps,
        image_url,
        cooking_time,
        difficulty,
        history,
        plating_style,
        origin_country,
        country_code,
        cuisine,
        authenticity_status = 'pending',
        cultural_context,
        latitude,
        longitude,
        region,
        city
      } = req.body;

      // Validate required fields
      if (!title || !ingredients || !origin_country || !cuisine) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, ingredients, origin_country, cuisine'
        });
      }

      // Insert new recipe
      const result = await executeQuery(`
        INSERT INTO recipes (
          title, ingredients, steps, image_url, cooking_time, difficulty,
          history, plating_style, origin_country, country_code, cuisine,
          authenticity_status, cultural_context, latitude, longitude, region, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title, ingredients, steps, image_url, cooking_time, difficulty,
        history, plating_style, origin_country, country_code, cuisine,
        authenticity_status, cultural_context, latitude, longitude, region, city
      ]);

      // Fetch the created recipe
      const [newRecipe] = await executeQuery('SELECT * FROM recipes WHERE id = ?', [result.insertId]);

      res.status(201).json(newRecipe[0] as Recipe);

    } catch (error) {
      console.error('Recipe creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}