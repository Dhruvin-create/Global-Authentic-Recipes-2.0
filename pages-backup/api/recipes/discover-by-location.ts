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

interface PlaceInfo {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  price_level?: number;
}

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

interface LocationDiscoveryResponse {
  success: boolean;
  discovered_recipes: DiscoveredRecipe[];
  location_info: {
    place_name: string;
    country: string;
    coordinates: { lat: number; lng: number };
    cultural_significance: string;
  };
  saved_count: number;
  preview_url?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationDiscoveryResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      discovered_recipes: [],
      location_info: {
        place_name: '',
        country: '',
        coordinates: { lat: 0, lng: 0 },
        cultural_significance: ''
      },
      saved_count: 0,
      error: 'Method not allowed'
    });
  }

  const { location, search_query, auto_save = false } = req.body;

  if (!location || (!location.coordinates && !location.place_name)) {
    return res.status(400).json({
      success: false,
      discovered_recipes: [],
      location_info: {
        place_name: '',
        country: '',
        coordinates: { lat: 0, lng: 0 },
        cultural_significance: ''
      },
      saved_count: 0,
      error: 'Location coordinates or place name required'
    });
  }

  try {
    // Step 1: Get place information from Google Maps
    const placeInfo = await getPlaceInformation(location);
    
    // Step 2: Research traditional recipes from this location
    const discoveredRecipes = await discoverRecipesByLocation(placeInfo, search_query);
    
    // Step 3: Save recipes to database if auto_save is enabled
    let savedCount = 0;
    if (auto_save && discoveredRecipes.length > 0) {
      savedCount = await saveDiscoveredRecipes(discoveredRecipes);
    }

    // Step 4: Generate cultural significance explanation
    const culturalSignificance = await generateLocationCulturalContext(placeInfo);

    const response: LocationDiscoveryResponse = {
      success: true,
      discovered_recipes: discoveredRecipes,
      location_info: {
        place_name: placeInfo.name,
        country: extractCountryFromAddress(placeInfo.formatted_address),
        coordinates: {
          lat: placeInfo.geometry.location.lat,
          lng: placeInfo.geometry.location.lng
        },
        cultural_significance: culturalSignificance
      },
      saved_count: savedCount,
      preview_url: savedCount > 0 ? `/research/preview?location=${encodeURIComponent(placeInfo.name)}` : undefined
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Location discovery error:', error);
    res.status(500).json({
      success: false,
      discovered_recipes: [],
      location_info: {
        place_name: '',
        country: '',
        coordinates: { lat: 0, lng: 0 },
        cultural_significance: ''
      },
      saved_count: 0,
      error: 'Failed to discover recipes for this location'
    });
  }
}

async function getPlaceInformation(location: any): Promise<PlaceInfo> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  let url: string;
  
  if (location.coordinates) {
    // Reverse geocoding to get place information from coordinates
    const { lat, lng } = location.coordinates;
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  } else if (location.place_name) {
    // Geocoding to get coordinates from place name
    url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location.place_name)}&key=${apiKey}`;
  } else {
    throw new Error('Invalid location format');
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  const result = data.results[0];
  
  return {
    place_id: result.place_id,
    name: result.formatted_address.split(',')[0], // First part is usually the place name
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

async function discoverRecipesByLocation(placeInfo: PlaceInfo, searchQuery?: string): Promise<DiscoveredRecipe[]> {
  try {
    const country = extractCountryFromAddress(placeInfo.formatted_address);
    const region = extractRegionFromAddress(placeInfo.formatted_address);
    
    // Create a comprehensive research prompt
    const researchPrompt = `
Research traditional and authentic recipes from this location:

Location: ${placeInfo.name}
Address: ${placeInfo.formatted_address}
Country: ${country}
Region: ${region}
${searchQuery ? `Specific Search: ${searchQuery}` : ''}

Find 3-5 authentic, traditional recipes that are:
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
      max_tokens: 3000
    });

    const recipesData = JSON.parse(response.choices[0].message.content || '[]');
    
    // Transform AI response to our recipe format
    const discoveredRecipes: DiscoveredRecipe[] = recipesData.map((recipe: any, index: number) => ({
      id: `discovered_${Date.now()}_${index}`,
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
      discovery_method: 'google_places' as const,
      research_sources: ['Google Maps Places API', 'AI Cultural Research', 'Geographic Location Analysis']
    }));

    return discoveredRecipes;
  } catch (error) {
    console.error('Recipe discovery failed:', error);
    return [];
  }
}

async function saveDiscoveredRecipes(recipes: DiscoveredRecipe[]): Promise<number> {
  const connection = await mysql.createConnection(dbConfig);
  let savedCount = 0;

  try {
    await connection.beginTransaction();

    for (const recipe of recipes) {
      // Check if recipe already exists (by title and origin)
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

      // Insert ingredients
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredient = recipe.ingredients[i];
        
        // First, insert or get ingredient
        const [ingredientResult] = await connection.execute(
          'INSERT IGNORE INTO ingredients (name, created_at) VALUES (?, NOW())',
          [ingredient.split(' ')[ingredient.split(' ').length - 1]] // Extract ingredient name
        );

        const [ingredientRows] = await connection.execute(
          'SELECT id FROM ingredients WHERE name = ?',
          [ingredient.split(' ')[ingredient.split(' ').length - 1]]
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
        `Recipe discovered via Google Maps location: ${recipe.source_location}`
      ]);

      savedCount++;
    }

    await connection.commit();
    return savedCount;

  } catch (error) {
    await connection.rollback();
    console.error('Failed to save discovered recipes:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function generateLocationCulturalContext(placeInfo: PlaceInfo): Promise<string> {
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
Avoid stereotypes or oversimplifications.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 300
    });

    return response.choices[0].message.content || 'This location has rich culinary traditions waiting to be explored.';
  } catch (error) {
    console.error('Cultural context generation failed:', error);
    return 'This location has rich culinary traditions waiting to be explored.';
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