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

interface DiscoveryAnalytics {
  total_discovered_recipes: number;
  recipes_by_discovery_method: {
    google_places: number;
    batch_google_places: number;
    manual_research: number;
  };
  recipes_by_status: {
    ai_pending: number;
    verified: number;
    published: number;
    draft: number;
  };
  top_discovery_countries: Array<{
    country: string;
    recipe_count: number;
    percentage: number;
  }>;
  top_discovery_cuisines: Array<{
    cuisine: string;
    recipe_count: number;
    percentage: number;
  }>;
  discovery_timeline: Array<{
    date: string;
    recipes_discovered: number;
    recipes_saved: number;
  }>;
  cultural_coverage: {
    total_countries: number;
    total_regions: number;
    total_cuisines: number;
  };
  quality_metrics: {
    average_cooking_time: number;
    difficulty_distribution: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    recipes_with_cultural_context: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiscoveryAnalytics | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Get total discovered recipes
    const [totalResult] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
    `);
    const totalDiscovered = (totalResult as any[])[0]?.total || 0;

    // Get recipes by discovery method
    const [methodResult] = await connection.execute(`
      SELECT 
        discovery_method,
        COUNT(*) as count
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
      GROUP BY discovery_method
    `);

    const recipesByMethod = {
      google_places: 0,
      batch_google_places: 0,
      manual_research: 0
    };

    (methodResult as any[]).forEach(row => {
      if (row.discovery_method in recipesByMethod) {
        recipesByMethod[row.discovery_method as keyof typeof recipesByMethod] = row.count;
      }
    });

    // Get recipes by status
    const [statusResult] = await connection.execute(`
      SELECT 
        COALESCE(authenticity_status, status) as status,
        COUNT(*) as count
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
      GROUP BY COALESCE(authenticity_status, status)
    `);

    const recipesByStatus = {
      ai_pending: 0,
      verified: 0,
      published: 0,
      draft: 0
    };

    (statusResult as any[]).forEach(row => {
      const status = row.status;
      if (status === 'ai_pending') recipesByStatus.ai_pending = row.count;
      else if (status === 'verified') recipesByStatus.verified = row.count;
      else if (status === 'published') recipesByStatus.published = row.count;
      else if (status === 'draft') recipesByStatus.draft = row.count;
    });

    // Get top discovery countries
    const [countryResult] = await connection.execute(`
      SELECT 
        origin_country as country,
        COUNT(*) as recipe_count,
        ROUND((COUNT(*) * 100.0 / ?), 2) as percentage
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
        AND origin_country IS NOT NULL
      GROUP BY origin_country
      ORDER BY recipe_count DESC
      LIMIT 10
    `, [totalDiscovered || 1]);

    const topCountries = (countryResult as any[]).map(row => ({
      country: row.country,
      recipe_count: row.recipe_count,
      percentage: row.percentage
    }));

    // Get top discovery cuisines
    const [cuisineResult] = await connection.execute(`
      SELECT 
        cuisine,
        COUNT(*) as recipe_count,
        ROUND((COUNT(*) * 100.0 / ?), 2) as percentage
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
        AND cuisine IS NOT NULL
      GROUP BY cuisine
      ORDER BY recipe_count DESC
      LIMIT 10
    `, [totalDiscovered || 1]);

    const topCuisines = (cuisineResult as any[]).map(row => ({
      cuisine: row.cuisine,
      recipe_count: row.recipe_count,
      percentage: row.percentage
    }));

    // Get discovery timeline (last 30 days)
    const [timelineResult] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as recipes_discovered,
        COUNT(*) as recipes_saved
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    const discoveryTimeline = (timelineResult as any[]).map(row => ({
      date: row.date,
      recipes_discovered: row.recipes_discovered,
      recipes_saved: row.recipes_saved
    }));

    // Get cultural coverage
    const [coverageResult] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT origin_country) as total_countries,
        COUNT(DISTINCT region) as total_regions,
        COUNT(DISTINCT cuisine) as total_cuisines
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
    `);

    const culturalCoverage = {
      total_countries: (coverageResult as any[])[0]?.total_countries || 0,
      total_regions: (coverageResult as any[])[0]?.total_regions || 0,
      total_cuisines: (coverageResult as any[])[0]?.total_cuisines || 0
    };

    // Get quality metrics
    const [qualityResult] = await connection.execute(`
      SELECT 
        AVG(cooking_time) as avg_cooking_time,
        SUM(CASE WHEN difficulty = 'Easy' THEN 1 ELSE 0 END) as easy_count,
        SUM(CASE WHEN difficulty = 'Medium' THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN difficulty = 'Hard' THEN 1 ELSE 0 END) as hard_count,
        SUM(CASE WHEN cultural_context IS NOT NULL AND cultural_context != '' THEN 1 ELSE 0 END) as with_context
      FROM recipes 
      WHERE discovery_method IN ('google_places', 'batch_google_places', 'manual_research')
    `);

    const qualityData = (qualityResult as any[])[0];
    const qualityMetrics = {
      average_cooking_time: Math.round(qualityData?.avg_cooking_time || 0),
      difficulty_distribution: {
        Easy: qualityData?.easy_count || 0,
        Medium: qualityData?.medium_count || 0,
        Hard: qualityData?.hard_count || 0
      },
      recipes_with_cultural_context: qualityData?.with_context || 0
    };

    await connection.end();

    const analytics: DiscoveryAnalytics = {
      total_discovered_recipes: totalDiscovered,
      recipes_by_discovery_method: recipesByMethod,
      recipes_by_status: recipesByStatus,
      top_discovery_countries: topCountries,
      top_discovery_cuisines: topCuisines,
      discovery_timeline: discoveryTimeline,
      cultural_coverage: culturalCoverage,
      quality_metrics: qualityMetrics
    };

    res.status(200).json(analytics);

  } catch (error) {
    console.error('Discovery analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch discovery analytics' });
  }
}