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

interface GeocodeResponse {
  success: boolean;
  updated: number;
  errors: string[];
  message: string;
}

interface GoogleGeocodeResult {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
  }>;
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeocodeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      updated: 0,
      errors: ['Method not allowed'],
      message: 'Only POST requests are allowed'
    });
  }

  const { recipeId, forceUpdate = false } = req.body;

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return res.status(500).json({
      success: false,
      updated: 0,
      errors: ['Google Maps API key not configured'],
      message: 'Geocoding service unavailable'
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    let updated = 0;
    const errors: string[] = [];

    // Build query based on whether we're updating a specific recipe or all recipes
    let query = `
      SELECT id, title, origin_country, region, city, latitude, longitude
      FROM recipes 
      WHERE status = 'published'
    `;
    
    const params: any[] = [];
    
    if (recipeId) {
      query += ' AND id = ?';
      params.push(recipeId);
    } else if (!forceUpdate) {
      query += ' AND (latitude IS NULL OR longitude IS NULL)';
    }
    
    query += ' LIMIT 50'; // Limit to avoid API quota issues

    const [rows] = await connection.execute(query, params);
    const recipes = rows as any[];

    console.log(`Processing ${recipes.length} recipes for geocoding...`);

    for (const recipe of recipes) {
      try {
        // Skip if already has coordinates and not forcing update
        if (!forceUpdate && recipe.latitude && recipe.longitude) {
          continue;
        }

        // Build search query for geocoding
        let searchQuery = recipe.origin_country;
        if (recipe.region) {
          searchQuery = `${recipe.region}, ${searchQuery}`;
        }
        if (recipe.city) {
          searchQuery = `${recipe.city}, ${searchQuery}`;
        }

        // Call Google Geocoding API
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        const data: GoogleGeocodeResult = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const { lat, lng } = result.geometry.location;

          // Extract additional location information
          let country = recipe.origin_country;
          let region = recipe.region;
          let city = recipe.city;

          result.address_components.forEach(component => {
            if (component.types.includes('country')) {
              country = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
              region = component.long_name;
            } else if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
          });

          // Update recipe with coordinates and refined location data
          await connection.execute(`
            UPDATE recipes 
            SET 
              latitude = ?,
              longitude = ?,
              region = COALESCE(?, region),
              city = COALESCE(?, city),
              geocoded_at = NOW()
            WHERE id = ?
          `, [lat, lng, region, city, recipe.id]);

          updated++;
          console.log(`✅ Updated recipe ${recipe.id}: ${recipe.title} -> ${lat}, ${lng}`);

          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 100));

        } else {
          const error = `Failed to geocode recipe ${recipe.id}: ${data.status}`;
          errors.push(error);
          console.warn(`⚠️ ${error}`);
        }

      } catch (error) {
        const errorMsg = `Error processing recipe ${recipe.id}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    await connection.end();

    const message = recipeId 
      ? `Updated coordinates for recipe ${recipeId}`
      : `Geocoded ${updated} recipes successfully`;

    res.status(200).json({
      success: true,
      updated,
      errors,
      message
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      updated: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Geocoding failed'
    });
  }
}