import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipes_db',
  charset: 'utf8mb4'
};

interface DiscoveredRecipe {
  id: string;
  title: string;
  origin_country: string;
  region?: string;
  city?: string;
  cuisine: string;
  ingredients: string[];
  cooking_steps: string[];
  cooking_time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cultural_context: string;
  authenticity_status: 'ai_pending';
  latitude: number;
  longitude: number;
  source_location: string;
  discovery_method: 'google_places';
  research_sources: string[];
}

interface BatchSaveResponse {
  success: boolean;
  saved_count: number;
  skipped_count: number;
  errors: string[];
  saved_recipe_ids: number[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BatchSaveResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      saved_count: 0,
      skipped_count: 0,
      errors: ['Method not allowed'],
      saved_recipe_ids: []
    });
  }

  const { recipes } = req.body;

  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    return res.status(400).json({
      success: false,
      saved_count: 0,
      skipped_count: 0,
      errors: ['No recipes provided'],
      saved_recipe_ids: []
    });
  }

  const connection = await mysql.createConnection(dbConfig);
  let savedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];
  const savedRecipeIds: number[] = [];

  try {
    await connection.beginTransaction();

    for (const recipe of recipes as DiscoveredRecipe[]) {
      try {
        // Check if recipe already exists (by title and origin)
        const [existingRecipes] = await connection.execute(
          'SELECT id FROM recipes WHERE title = ? AND origin_country = ?',
          [recipe.title, recipe.origin_country]
        );

        if ((existingRecipes as any[]).length > 0) {
          console.log(`Recipe "${recipe.title}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Insert recipe
        const [recipeResult] = await connection.execute(`
          INSERT INTO recipes (
            title, origin_country, region, city, cuisine, description,
            cooking_time, difficulty, authenticity_status, cultural_context,
            latitude, longitude, status, created_at, updated_at,
            discovery_method, source_location
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW(), ?, ?)
        `, [
          recipe.title,
          recipe.origin_country,
          recipe.region || null,
          recipe.city || null,
          recipe.cuisine,
          recipe.cultural_context,
          recipe.cooking_time,
          recipe.difficulty,
          recipe.authenticity_status,
          recipe.cultural_context,
          recipe.latitude,
          recipe.longitude,
          recipe.discovery_method,
          recipe.source_location
        ]);

        const recipeId = (recipeResult as any).insertId;
        savedRecipeIds.push(recipeId);

        // Insert ingredients
        for (let i = 0; i < recipe.ingredients.length; i++) {
          const ingredient = recipe.ingredients[i];
          
          // Extract ingredient name (last word is usually the ingredient)
          const ingredientName = ingredient.split(' ').pop() || ingredient;
          
          // First, insert or get ingredient
          await connection.execute(
            'INSERT IGNORE INTO ingredients (name, created_at) VALUES (?, NOW())',
            [ingredientName]
          );

          const [ingredientRows] = await connection.execute(
            'SELECT id FROM ingredients WHERE name = ?',
            [ingredientName]
          );

          const ingredientId = (ingredientRows as any[])[0]?.id;

          if (ingredientId) {
            // Link ingredient to recipe
            await connection.execute(
              'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, order_index) VALUES (?, ?, ?, ?, ?)',
              [recipeId, ingredientId, ingredient, '', i + 1]
            );
          }
        }

        // Insert cooking steps
        for (let i = 0; i < recipe.cooking_steps.length; i++) {
          await connection.execute(
            'INSERT INTO cooking_steps (recipe_id, step_number, instruction, created_at) VALUES (?, ?, ?, NOW())',
            [recipeId, i + 1, recipe.cooking_steps[i]]
          );
        }

        // Log the discovery in changelog
        await connection.execute(`
          INSERT INTO recipe_changelog (
            recipe_id, change_type, changed_by, change_description, created_at
          ) VALUES (?, 'created', 'system', ?, NOW())
        `, [
          recipeId,
          `Recipe discovered via Google Maps location: ${recipe.source_location}. Research sources: ${recipe.research_sources.join(', ')}`
        ]);

        // Add to verification history
        await connection.execute(`
          INSERT INTO recipe_verification_history (
            recipe_id, verification_status, verified_by, verification_notes, created_at
          ) VALUES (?, 'ai_pending', 'system', ?, NOW())
        `, [
          recipeId,
          `Auto-discovered recipe from ${recipe.source_location}. Requires manual review for cultural accuracy and authenticity.`
        ]);

        savedCount++;
      } catch (recipeError) {
        console.error(`Failed to save recipe "${recipe.title}":`, recipeError);
        errors.push(`Failed to save "${recipe.title}": ${recipeError instanceof Error ? recipeError.message : 'Unknown error'}`);
      }
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      saved_count: savedCount,
      skipped_count: skippedCount,
      errors,
      saved_recipe_ids: savedRecipeIds
    });

  } catch (error) {
    await connection.rollback();
    console.error('Batch save failed:', error);
    
    res.status(500).json({
      success: false,
      saved_count: 0,
      skipped_count: 0,
      errors: [error instanceof Error ? error.message : 'Unknown database error'],
      saved_recipe_ids: []
    });
  } finally {
    await connection.end();
  }
}