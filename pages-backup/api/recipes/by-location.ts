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

interface LocationRecipe {
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
  distance?: number;
}

interface LocationResponse {
  success: boolean;
  recipes: LocationRecipe[];
  total: number;
  location: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      recipes: [],
      total: 0,
      location: {},
      error: 'Method not allowed'
    });
  }

  const { 
    country, 
    region, 
    city, 
    lat, 
    lng, 
    radius = '50', 
    limit = '20',
    authenticity,
    cuisine,
    difficulty 
  } = req.query;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    let query = `
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
        COALESCE(AVG(rt.rating), 0) as avg_rating,
        COUNT(rt.id) as rating_count
    `;

    let fromClause = `
      FROM recipes r
      LEFT JOIN recipe_ratings rt ON r.id = rt.recipe_id
      WHERE r.status = 'published'
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // Location-based filtering
    if (lat && lng) {
      // Search by coordinates with radius
      const radiusKm = parseInt(radius as string) || 50;
      query += `, (
        6371 * acos(
          cos(radians(?)) * cos(radians(r.latitude)) * 
          cos(radians(r.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(r.latitude))
        )
      ) AS distance`;
      
      params.push(parseFloat(lat as string), parseFloat(lng as string), parseFloat(lat as string));
      
      conditions.push(`(
        6371 * acos(
          cos(radians(?)) * cos(radians(r.latitude)) * 
          cos(radians(r.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(r.latitude))
        )
      ) <= ?`);
      
      params.push(parseFloat(lat as string), parseFloat(lng as string), parseFloat(lat as string), radiusKm);
      
    } else {
      // Search by location names
      if (country) {
        conditions.push('r.origin_country LIKE ?');
        params.push(`%${country}%`);
      }
      
      if (region) {
        conditions.push('r.region LIKE ?');
        params.push(`%${region}%`);
      }
      
      if (city) {
        conditions.push('r.city LIKE ?');
        params.push(`%${city}%`);
      }
    }

    // Additional filters
    if (authenticity) {
      const authenticityArray = Array.isArray(authenticity) ? authenticity : [authenticity];
      conditions.push(`r.authenticity_status IN (${authenticityArray.map(() => '?').join(', ')})`);
      params.push(...authenticityArray);
    }

    if (cuisine) {
      const cuisineArray = Array.isArray(cuisine) ? cuisine : [cuisine];
      conditions.push(`r.cuisine IN (${cuisineArray.map(() => '?').join(', ')})`);
      params.push(...cuisineArray);
    }

    if (difficulty) {
      const difficultyArray = Array.isArray(difficulty) ? difficulty : [difficulty];
      conditions.push(`r.difficulty IN (${difficultyArray.map(() => '?').join(', ')})`);
      params.push(...difficultyArray);
    }

    // Build final query
    if (conditions.length > 0) {
      fromClause += ' AND ' + conditions.join(' AND ');
    }

    query += fromClause + ' GROUP BY r.id';

    // Order by distance if coordinates provided, otherwise by popularity
    if (lat && lng) {
      query += ' ORDER BY distance ASC, r.popularity_score DESC';
    } else {
      query += ' ORDER BY r.popularity_score DESC, r.created_at DESC';
    }

    // Add limit
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    query += ' LIMIT ?';
    params.push(limitNum);

    const [rows] = await connection.execute(query, params);
    await connection.end();

    const recipes = (rows as any[]).map(row => ({
      id: row.id.toString(),
      title: row.title,
      origin_country: row.origin_country,
      cuisine: row.cuisine,
      image_url: row.image_url,
      cooking_time: row.cooking_time,
      difficulty: row.difficulty,
      authenticity_status: row.authenticity_status,
      cultural_context: row.cultural_context,
      latitude: row.latitude,
      longitude: row.longitude,
      region: row.region,
      city: row.city,
      distance: row.distance ? Math.round(row.distance * 10) / 10 : undefined,
      avg_rating: parseFloat(row.avg_rating) || 0,
      rating_count: parseInt(row.rating_count) || 0
    }));

    const locationInfo = {
      country: country as string,
      region: region as string,
      city: city as string,
      latitude: lat ? parseFloat(lat as string) : undefined,
      longitude: lng ? parseFloat(lng as string) : undefined
    };

    res.status(200).json({
      success: true,
      recipes,
      total: recipes.length,
      location: locationInfo
    });

  } catch (error) {
    console.error('Location recipes fetch error:', error);
    res.status(500).json({
      success: false,
      recipes: [],
      total: 0,
      location: {},
      error: 'Internal server error'
    });
  }
}