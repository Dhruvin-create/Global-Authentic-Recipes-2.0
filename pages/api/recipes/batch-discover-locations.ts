import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import OpenAI from 'openai';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipes_db',
  charset: 'utf8mb4'
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BatchLocation {
  name: string;
  coordinates?: { lat: number; lng: number };
  search_query?: string;
}

interface BatchDiscoveryRequest {
  locations: BatchLocation[];
  auto_save: boolean;
  max_recipes_per_location: number;
}

interface BatchDiscoveryResponse {
  success: boolean;
  total_locations: number;
  total_recipes_discovered: number;
  total_recipes_saved: number;
  results: LocationDiscoveryResult[];
  processing_time: number;
  error?: string;
}

interface LocationDiscoveryResult {
  location: string;
  success: boolean;
  recipes_found: number;
  recipes_saved: number;
  cultural_context: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BatchDiscoveryResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      total_locations: 0,
      total_recipes_discovered: 0,
      total_recipes_saved: 0,
      results: [],
      processing_time: 0,
      error: 'Method not allowed'
    });
  }

  const startTime = Date.now();
  const { locations, auto_save = false, max_recipes_per_location = 3 }: BatchDiscoveryRequest = req.body;

  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    return res.status(400).json({
      success: false,
      total_locations: 0,
      total_recipes_discovered: 0,
      total_recipes_saved: 0,
      results: [],
      processing_time: 0,
      error: 'Locations array is required'
    });
  }

  if (locations.length > 10) {
    return res.status(400).json({
      success: false,
      total_locations: 0,
      total_recipes_discovered: 0,
      total_recipes_saved: 0,
      results: [],
      processing_time: 0,
      error: 'Maximum 10 locations allowed per batch'
    });
  }

  try {
    const results: LocationDiscoveryResult[] = [];
    let totalRecipesDiscovered = 0;
    let totalRecipesSaved = 0;

    // Process each location
    for (const location of locations) {
      try {
        const locationResult = await processLocationDiscovery(
          location, 
          auto_save, 
          max_recipes_per_location
        );
        
        results.push(locationResult);
        totalRecipesDiscovered += locationResult.recipes_found;
        totalRecipesSaved += locationResult.recipes_saved;

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process location ${location.name}:`, error);
        results.push({
          location: location.name,
          success: false,
          recipes_found: 0,
          recipes_saved: 0,
          cultural_context: '',
          error: 'Processing failed'
        });
      }
    }

    const processingTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      total_locations: locations.length,
      total_recipes_discovered: totalRecipesDiscovered,
      total_recipes_saved: totalRecipesSaved,
      results,
      processing_time: processingTime
    });

  } catch (error) {
    console.error('Batch discovery error:', error);
    res.status(500).json({
      success: false,
      total_locations: locations.length,
      total_recipes_discovered: 0,
      total_recipes_saved: 0,
      results: [],
      processing_time: Date.now() - startTime,
      error: 'Batch discovery failed'
    });
  }
}

async function processLocationDiscovery(
  location: BatchLocation,
  autoSave: boolean,
  maxRecipes: number
): Promise<LocationDiscoveryResult> {
  try {
    // Get place information
    const placeInfo = await getPlaceInformation(location);
    
    // Research recipes
    const recipes = await discoverRecipesByLocation(placeInfo, location.search_query, maxRecipes);
    
    // Save if requested
    let savedCount = 0;
    if (autoSave && recipes.length > 0) {
      savedCount = await saveDiscoveredRecipes(recipes);
    }

    // Generate cultural context
    const culturalContext = await generateLocationCulturalContext(placeInfo);

    return {
      location: location.name,
      success: true,
      recipes_found: recipes.length,
      recipes_saved: savedCount,
      cultural_context: culturalContext
    };

  } catch (error) {
    console.error(`Location discovery failed for ${location.name}:`, error);
    return {
      location: location.name,
      success: false,
      recipes_found: 0,
      recipes_saved: 0,
      cultural_context: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function getPlaceInformation(location: BatchLocation): Promise<any> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  let url: string;
  
  if (location.coordinates) {
    // Reverse geocoding
    const { lat, lng } = location.coordinates;
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  } else {
    // Geocoding
    url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location.name)}&key=${apiKey}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  const result = data.results[0];
  
  return {
    place_id: result.place_id,
    name: location.name || result.formatted_address.split(',')[0],
    formatted_address: result.formatted_address,
    geometry: {
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      }
    },
    types: result.types || []
  };
}

async function discoverRecipesByLocation(
  placeInfo: any, 
  searchQuery?: string, 
  maxRecipes: number = 3
): Promise<any[]> {
  try {
    const country = extractCountryFromAddress(placeInfo.formatted_address);
    const region = extractRegionFromAddress(placeInfo.formatted_address);
    
    const researchPrompt = `
Research ${maxRecipes} traditional and authentic recipes from this location:

Location: ${placeInfo.name}
Address: ${placeInfo.formatted_address}
Country: ${country}
Region: ${region}
${searchQuery ? `Specific Search: ${searchQuery}` : ''}

Find ${maxRecipes} authentic, traditional recipes that are:
1. Genuinely from this geographic region
2. Culturally significant and historically accurate
3. Representative of local cooking traditions
4. Include proper cultural context and respect

For each recipe, provide:
- Recipe name (in local language if applicable, with English translation)
- Origin country and region
- Cuisine type
- Detailed ingredients list (with measurements)
- Step-by-step cooking instructions
- Cooking time in minutes
- Difficulty level (Easy/Medium/Hard)
- Cultural context and significance
- Historical background or traditional occasions when served

Return as JSON array with this structure:
[
  {
    "title": "Recipe Name",
    "origin_country": "Country",
    "region": "Region/State",
    "city": "City if specific",
    "cuisine": "Cuisine Type",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "cooking_steps": ["step 1", "step 2", ...],
    "cooking_time": 60,
    "difficulty": "Medium",
    "cultural_context": "Cultural significance and background",
    "traditional_occasions": "When this is typically served"
  }
]

Focus on authenticity and cultural respect. Avoid fusion or modern interpretations.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: researchPrompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    const recipesData = JSON.parse(response.choices[0].message.content || '[]');
    
    // Transform AI response to our recipe format
    const discoveredRecipes = recipesData.map((recipe: any, index: number) => ({
      id: `batch_discovered_${Date.now()}_${index}`,
      title: recipe.title,
      origin_country: recipe.origin_country || country,
      region: recipe.region || region,
      city: recipe.city || placeInfo.name,
      cuisine: recipe.cuisine,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      cooking_steps: Array.isArray(recipe.cooking_steps) ? recipe.cooking_steps : [],
      cooking_time: parseInt(recipe.cooking_time) || 60,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(recipe.difficulty) ? recipe.difficulty : 'Medium',
      cultural_context: recipe.cultural_context || '',
      authenticity_status: 'ai_pending' as const,
      latitude: placeInfo.geometry.location.lat,
      longitude: placeInfo.geometry.location.lng,
      source_location: placeInfo.formatted_address,
      discovery_method: 'batch_google_places' as const,
      research_sources: ['Google Maps Places API', 'AI Cultural Research', 'Batch Geographic Analysis']
    }));

    return discoveredRecipes;
  } catch (error) {
    console.error('Recipe discovery failed:', error);
    return [];
  }
}

async function saveDiscoveredRecipes(recipes: any[]): Promise<number> {
  const connection = await mysql.createConnection(dbConfig);
  let savedCount = 0;

  try {
    await connection.beginTransaction();

    for (const recipe of recipes) {
      // Check if recipe already exists
      const [existingRecipes] = await connection.execute(
        'SELECT id FROM recipes WHERE title = ? AND origin_country = ?',
        [recipe.title, recipe.origin_country]
      );

      if ((existingRecipes as any[]).length > 0) {
        console.log(`Recipe "${recipe.title}" already exists, skipping...`);
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
        recipe.region,
        recipe.city,
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

      // Insert ingredients and cooking steps (simplified for batch processing)
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredient = recipe.ingredients[i];
        
        const [ingredientResult] = await connection.execute(
          'INSERT IGNORE INTO ingredients (name, created_at) VALUES (?, NOW())',
          [ingredient.split(' ')[ingredient.split(' ').length - 1]]
        );

        const [ingredientRows] = await connection.execute(
          'SELECT id FROM ingredients WHERE name = ?',
          [ingredient.split(' ')[ingredient.split(' ').length - 1]]
        );

        const ingredientId = (ingredientRows as any[])[0]?.id;

        if (ingredientId) {
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

      // Log the discovery
      await connection.execute(`
        INSERT INTO recipe_changelog (
          recipe_id, change_type, changed_by, change_description, created_at
        ) VALUES (?, 'created', 'system', ?, NOW())
      `, [
        recipeId,
        `Recipe discovered via batch location discovery: ${recipe.source_location}`
      ]);

      savedCount++;
    }

    await connection.commit();
    return savedCount;

  } catch (error) {
    await connection.rollback();
    console.error('Failed to save batch discovered recipes:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function generateLocationCulturalContext(placeInfo: any): Promise<string> {
  try {
    const prompt = `
Provide a brief cultural and culinary overview for this location:

Location: ${placeInfo.name}
Address: ${placeInfo.formatted_address}

Write 2-3 sentences about:
1. The culinary traditions and food culture of this region
2. What makes the local cuisine unique or significant
3. Any notable food-related cultural practices or history

Be respectful, accurate, and focus on authentic cultural information.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 300
    });

    return response.choices[0].message.content || 'This location has rich culinary traditions.';
  } catch (error) {
    console.error('Cultural context generation failed:', error);
    return 'This location has rich culinary traditions.';
  }
}

function extractCountryFromAddress(address: string): string {
  const parts = address.split(', ');
  return parts[parts.length - 1] || 'Unknown';
}

function extractRegionFromAddress(address: string): string {
  const parts = address.split(', ');
  return parts.length > 2 ? parts[parts.length - 2] : '';
}