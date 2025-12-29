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

interface MapRecipe {
  id: string;
  title: string;
  origin_country: string;
  cuisine: string;
  image_url?: string;
  cooking_time?: number;
  difficulty: string;
  authenticity_status: string;
  cultural_context?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  city?: string;
  created_at: string;
}

interface MapResponse {
  success: boolean;
  recipes: MapRecipe[];
  total: number;
  countries: string[];
  error?: string;
}

// Country coordinates mapping for recipes without specific coordinates
const COUNTRY_COORDINATES: { [key: string]: { lat: number; lng: number; } } = {
  'Italy': { lat: 41.8719, lng: 12.5674 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Spain': { lat: 40.4637, lng: -3.7492 },
  'India': { lat: 20.5937, lng: 78.9629 },
  'China': { lat: 35.8617, lng: 104.1954 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'Thailand': { lat: 15.8700, lng: 100.9925 },
  'Mexico': { lat: 23.6345, lng: -102.5528 },
  'Greece': { lat: 39.0742, lng: 21.8243 },
  'Turkey': { lat: 38.9637, lng: 35.2433 },
  'Morocco': { lat: 31.7917, lng: -7.0926 },
  'Egypt': { lat: 26.0975, lng: 30.0444 },
  'Brazil': { lat: -14.2350, lng: -51.9253 },
  'Argentina': { lat: -38.4161, lng: -63.6167 },
  'Peru': { lat: -9.1900, lng: -75.0152 },
  'United States': { lat: 39.8283, lng: -98.5795 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'United Kingdom': { lat: 55.3781, lng: -3.4360 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'Russia': { lat: 61.5240, lng: 105.3188 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'South Korea': { lat: 35.9078, lng: 127.7669 },
  'Vietnam': { lat: 14.0583, lng: 108.2772 },
  'Indonesia': { lat: -0.7893, lng: 113.9213 },
  'Philippines': { lat: 12.8797, lng: 121.7740 },
  'Malaysia': { lat: 4.2105, lng: 101.9758 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Lebanon': { lat: 33.8547, lng: 35.8623 },
  'Iran': { lat: 32.4279, lng: 53.6880 },
  'Ethiopia': { lat: 9.1450, lng: 40.4897 },
  'Nigeria': { lat: 9.0820, lng: 8.6753 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'Kenya': { lat: -0.0236, lng: 37.9062 },
  'Jamaica': { lat: 18.1096, lng: -77.2975 },
  'Cuba': { lat: 21.5218, lng: -77.7812 },
  'Colombia': { lat: 4.5709, lng: -74.2973 },
  'Chile': { lat: -35.6751, lng: -71.5430 },
  'Poland': { lat: 51.9194, lng: 19.1451 },
  'Czech Republic': { lat: 49.8175, lng: 15.4730 },
  'Hungary': { lat: 47.1625, lng: 19.5033 },
  'Romania': { lat: 45.9432, lng: 24.9668 },
  'Ukraine': { lat: 48.3794, lng: 31.1656 },
  'Sweden': { lat: 60.1282, lng: 18.6435 },
  'Norway': { lat: 60.4720, lng: 8.4689 },
  'Denmark': { lat: 56.2639, lng: 9.5018 },
  'Finland': { lat: 61.9241, lng: 25.7482 },
  'Netherlands': { lat: 52.1326, lng: 5.2913 },
  'Belgium': { lat: 50.5039, lng: 4.4699 },
  'Switzerland': { lat: 46.8182, lng: 8.2275 },
  'Austria': { lat: 47.5162, lng: 14.5501 },
  'Portugal': { lat: 39.3999, lng: -8.2245 },
  'Ireland': { lat: 53.4129, lng: -8.2439 },
  'Scotland': { lat: 56.4907, lng: -4.2026 },
  'Wales': { lat: 52.1307, lng: -3.7837 },
  'Israel': { lat: 31.0461, lng: 34.8516 },
  'Saudi Arabia': { lat: 23.8859, lng: 45.0792 },
  'UAE': { lat: 23.4241, lng: 53.8478 },
  'Pakistan': { lat: 30.3753, lng: 69.3451 },
  'Bangladesh': { lat: 23.6850, lng: 90.3563 },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
  'Nepal': { lat: 28.3949, lng: 84.1240 },
  'Myanmar': { lat: 21.9162, lng: 95.9560 },
  'Cambodia': { lat: 12.5657, lng: 104.9910 },
  'Laos': { lat: 19.8563, lng: 102.4955 },
  'Mongolia': { lat: 46.8625, lng: 103.8467 },
  'Kazakhstan': { lat: 48.0196, lng: 66.9237 },
  'Uzbekistan': { lat: 41.3775, lng: 64.5853 },
  'Georgia': { lat: 42.3154, lng: 43.3569 },
  'Armenia': { lat: 40.0691, lng: 45.0382 },
  'Azerbaijan': { lat: 40.1431, lng: 47.5769 },
  'Afghanistan': { lat: 33.9391, lng: 67.7100 },
  'Algeria': { lat: 28.0339, lng: 1.6596 },
  'Tunisia': { lat: 33.8869, lng: 9.5375 },
  'Libya': { lat: 26.3351, lng: 17.2283 },
  'Sudan': { lat: 12.8628, lng: 30.2176 },
  'Ghana': { lat: 7.9465, lng: -1.0232 },
  'Senegal': { lat: 14.4974, lng: -14.4524 },
  'Mali': { lat: 17.5707, lng: -3.9962 },
  'Burkina Faso': { lat: 12.2383, lng: -1.5616 },
  'Ivory Coast': { lat: 7.5400, lng: -5.5471 },
  'Cameroon': { lat: 7.3697, lng: 12.3547 },
  'Tanzania': { lat: -6.3690, lng: 34.8888 },
  'Uganda': { lat: 1.3733, lng: 32.2903 },
  'Rwanda': { lat: -1.9403, lng: 29.8739 },
  'Madagascar': { lat: -18.7669, lng: 46.8691 },
  'Mauritius': { lat: -20.3484, lng: 57.5522 },
  'Seychelles': { lat: -4.6796, lng: 55.4920 }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      recipes: [],
      total: 0,
      countries: [],
      error: 'Method not allowed'
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Fetch all published recipes with location data
    const [rows] = await connection.execute(`
      SELECT 
        r.id,
        r.title,
        r.origin_country,
        r.cuisine,
        r.image_url,
        r.cooking_time,
        r.difficulty,
        r.authenticity_status,
        r.cultural_context,
        r.latitude,
        r.longitude,
        r.region,
        r.city,
        r.created_at,
        COALESCE(AVG(rt.rating), 0) as avg_rating,
        COUNT(rt.id) as rating_count
      FROM recipes r
      LEFT JOIN recipe_ratings rt ON r.id = rt.recipe_id
      WHERE r.status = 'published'
      GROUP BY r.id
      ORDER BY r.popularity_score DESC, r.created_at DESC
    `);

    await connection.end();

    const recipes = (rows as any[]).map(row => {
      let latitude = row.latitude;
      let longitude = row.longitude;

      // If no specific coordinates, use country coordinates with some randomization
      if (!latitude || !longitude) {
        const countryCoords = COUNTRY_COORDINATES[row.origin_country];
        if (countryCoords) {
          // Add some randomization to avoid overlapping markers (±2 degrees)
          latitude = countryCoords.lat + (Math.random() - 0.5) * 4;
          longitude = countryCoords.lng + (Math.random() - 0.5) * 4;
        }
      }

      return {
        id: row.id.toString(),
        title: row.title,
        origin_country: row.origin_country,
        cuisine: row.cuisine,
        image_url: row.image_url,
        cooking_time: row.cooking_time,
        difficulty: row.difficulty,
        authenticity_status: row.authenticity_status,
        cultural_context: row.cultural_context,
        latitude,
        longitude,
        region: row.region,
        city: row.city,
        created_at: row.created_at,
        avg_rating: parseFloat(row.avg_rating) || 0,
        rating_count: parseInt(row.rating_count) || 0
      };
    }).filter(recipe => recipe.latitude && recipe.longitude); // Only include recipes with coordinates

    // Get unique countries
    const countries = [...new Set(recipes.map(r => r.origin_country))].sort();

    res.status(200).json({
      success: true,
      recipes,
      total: recipes.length,
      countries
    });

  } catch (error) {
    console.error('Map recipes fetch error:', error);
    res.status(500).json({
      success: false,
      recipes: [],
      total: 0,
      countries: [],
      error: 'Internal server error'
    });
  }
}