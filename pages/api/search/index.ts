import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, createConnection } from '../../../lib/db';

interface SearchFilters {
  authenticity?: string[];
  difficulty?: string[];
  cuisine?: string[];
  country?: string[];
  cooking_time_max?: number;
  dietary_restrictions?: string[];
}

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  origin_country?: string;
  cuisine?: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status?: string;
  relevance_score?: number;
  match_type?: string;
  cultural_context?: string;
  ingredients_preview?: string[];
  rating?: number;
  rating_count?: number;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  filters_applied: SearchFilters;
  auto_find_triggered?: boolean;
  job_id?: string;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      results: [],
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0,
      filters_applied: {},
      error: 'Method not allowed'
    });
  }

  const {
    q,
    page = '1',
    limit = '20',
    authenticity,
    difficulty,
    cuisine,
    country,
    cooking_time_max,
    dietary_restrictions
  } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      results: [],
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0,
      filters_applied: {},
      error: 'Search query is required'
    });
  }

  const currentPage = Math.max(1, parseInt(page as string) || 1);
  const perPage = Math.min(Math.max(1, parseInt(limit as string) || 20), 50);
  const offset = (currentPage - 1) * perPage;

  // Parse filters
  const filters: SearchFilters = {
    authenticity: authenticity ? (Array.isArray(authenticity) ? authenticity : [authenticity]) as string[] : undefined,
    difficulty: difficulty ? (Array.isArray(difficulty) ? difficulty : [difficulty]) as string[] : undefined,
    cuisine: cuisine ? (Array.isArray(cuisine) ? cuisine : [cuisine]) as string[] : undefined,
    country: country ? (Array.isArray(country) ? country : [country]) as string[] : undefined,
    cooking_time_max: cooking_time_max ? parseInt(cooking_time_max as string) : undefined,
    dietary_restrictions: dietary_restrictions ? (Array.isArray(dietary_restrictions) ? dietary_restrictions : [dietary_restrictions]) as string[] : undefined
  };

  try {
    const connection = await createConnection();

    // Build dynamic WHERE clause for filters
    let filterConditions: string[] = [];
    let filterParams: any[] = [];

    if (filters.authenticity && filters.authenticity.length > 0) {
      filterConditions.push(`r.authenticity_status IN (${filters.authenticity.map(() => '?').join(', ')})`);
      filterParams.push(...filters.authenticity);
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      filterConditions.push(`r.difficulty IN (${filters.difficulty.map(() => '?').join(', ')})`);
      filterParams.push(...filters.difficulty);
    }

    if (filters.cuisine && filters.cuisine.length > 0) {
      filterConditions.push(`r.cuisine IN (${filters.cuisine.map(() => '?').join(', ')})`);
      filterParams.push(...filters.cuisine);
    }

    if (filters.country && filters.country.length > 0) {
      filterConditions.push(`r.origin_country IN (${filters.country.map(() => '?').join(', ')})`);
      filterParams.push(...filters.country);
    }

    if (filters.cooking_time_max) {
      filterConditions.push('r.cooking_time <= ?');
      filterParams.push(filters.cooking_time_max);
    }

    if (filters.dietary_restrictions && filters.dietary_restrictions.length > 0) {
      const dietaryConditions = filters.dietary_restrictions.map(() => 'r.dietary_tags LIKE ?').join(' AND ');
      filterConditions.push(`(${dietaryConditions})`);
      filterParams.push(...filters.dietary_restrictions.map(tag => `%${tag}%`));
    }

    const filterClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';

    // Main search query with advanced ranking
    const searchQuery = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.origin_country,
        r.cuisine,
        r.image_url as image,
        r.cooking_time,
        r.difficulty,
        r.authenticity_status,
        r.cultural_context,
        r.ingredients,
        r.popularity_score,
        COALESCE(AVG(rt.rating), 0) as rating,
        COUNT(rt.id) as rating_count,
        CASE 
          WHEN r.title LIKE ? THEN 100
          WHEN r.title LIKE ? THEN 90
          WHEN r.ingredients LIKE ? THEN 80
          WHEN r.description LIKE ? THEN 75
          WHEN r.origin_country LIKE ? THEN 70
          WHEN r.cuisine LIKE ? THEN 65
          WHEN r.tags LIKE ? THEN 60
          WHEN r.cultural_context LIKE ? THEN 55
          ELSE 50
        END as base_relevance,
        CASE 
          WHEN r.title LIKE ? THEN 'exact_title'
          WHEN r.title LIKE ? THEN 'partial_title'
          WHEN r.ingredients LIKE ? THEN 'ingredient'
          WHEN r.description LIKE ? THEN 'description'
          WHEN r.origin_country LIKE ? THEN 'country'
          WHEN r.cuisine LIKE ? THEN 'cuisine'
          WHEN r.tags LIKE ? THEN 'tag'
          WHEN r.cultural_context LIKE ? THEN 'cultural'
          ELSE 'content'
        END as match_type
      FROM recipes r
      LEFT JOIN recipe_ratings rt ON r.id = rt.recipe_id
      WHERE (
        r.title LIKE ? OR
        r.title LIKE ? OR
        r.ingredients LIKE ? OR
        r.description LIKE ? OR
        r.origin_country LIKE ? OR
        r.cuisine LIKE ? OR
        r.tags LIKE ? OR
        r.cultural_context LIKE ? OR
        r.instructions LIKE ?
      )
      AND r.status = 'published'
      ${filterClause}
      GROUP BY r.id
      ORDER BY 
        (base_relevance * 0.4 + 
         r.popularity_score * 30 * 0.3 + 
         COALESCE(AVG(rt.rating), 0) * 20 * 0.2 +
         CASE r.authenticity_status
           WHEN 'verified' THEN 10
           WHEN 'community' THEN 5
           ELSE 0
         END * 0.1) DESC,
        r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM recipes r
      WHERE (
        r.title LIKE ? OR
        r.title LIKE ? OR
        r.ingredients LIKE ? OR
        r.description LIKE ? OR
        r.origin_country LIKE ? OR
        r.cuisine LIKE ? OR
        r.tags LIKE ? OR
        r.cultural_context LIKE ? OR
        r.instructions LIKE ?
      )
      AND r.status = 'published'
      ${filterClause}
    `;

    const searchTerm = q.toLowerCase().trim();
    const exactMatch = searchTerm;
    const partialMatch = `%${searchTerm}%`;

    // Parameters for main query
    const searchParams = [
      // Relevance scoring parameters
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch,
      // Match type parameters
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch,
      // WHERE clause parameters
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch,
      // Filter parameters
      ...filterParams,
      // LIMIT and OFFSET
      perPage, offset
    ];

    // Parameters for count query
    const countParams = [
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch,
      ...filterParams
    ];

    // Execute both queries
    const [searchResults, countResults] = await Promise.all([
      connection.query(searchQuery, searchParams),
      connection.query(countQuery, countParams)
    ]);

    await connection.close();

    const results = (searchResults as any[]).map(row => {
      // Parse ingredients for preview
      let ingredientsPreview: string[] = [];
      try {
        if (row.ingredients) {
          const ingredients = JSON.parse(row.ingredients);
          ingredientsPreview = ingredients.slice(0, 3).map((ing: any) => 
            typeof ing === 'string' ? ing : ing.name || ing.ingredient
          );
        }
      } catch (e) {
        // Fallback to simple string split
        if (row.ingredients) {
          ingredientsPreview = row.ingredients.split(',').slice(0, 3).map((s: string) => s.trim());
        }
      }

      return {
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        origin_country: row.origin_country,
        cuisine: row.cuisine,
        image: row.image,
        cooking_time: row.cooking_time?.toString(),
        difficulty: row.difficulty,
        authenticity_status: row.authenticity_status,
        relevance_score: row.base_relevance / 100,
        match_type: row.match_type,
        cultural_context: row.cultural_context,
        ingredients_preview: ingredientsPreview,
        rating: parseFloat(row.rating) || 0,
        rating_count: parseInt(row.rating_count) || 0
      };
    });

    const totalResults = (countResults as any[])[0]?.total || 0;
    const totalPages = Math.ceil(totalResults / perPage);

    // Check if we should trigger auto-generation for empty results
    let autoFindTriggered = false;
    let jobId: string | undefined;
    let message: string | undefined;

    if (results.length === 0 && searchTerm.length > 3) {
      // Trigger auto-generation for specific dish names
      const dishNamePattern = /^[a-zA-Z\s]{4,50}$/;
      if (dishNamePattern.test(searchTerm)) {
        autoFindTriggered = true;
        jobId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        message = `No recipes found for "${searchTerm}". Researching authentic sources to generate recipe...`;
        
        // TODO: Queue background job for recipe generation
        // await queueRecipeGeneration(searchTerm, jobId);
      }
    }

    // Log search analytics
    try {
      const analyticsConnection = await createConnection();
      await analyticsConnection.query(
        'INSERT INTO search_analytics (query, results_count, search_type, response_time_ms) VALUES (?, ?, ?, ?)',
        [searchTerm, results.length, 'full_search', Date.now() % 1000]
      );
      await analyticsConnection.close();
    } catch (analyticsError) {
      console.error('Analytics logging failed:', analyticsError);
    }

    const response: SearchResponse = {
      success: true,
      results,
      total: totalResults,
      page: currentPage,
      per_page: perPage,
      total_pages: totalPages,
      filters_applied: filters,
      auto_find_triggered: autoFindTriggered,
      job_id: jobId,
      message
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      results: [],
      total: 0,
      page: currentPage,
      per_page: perPage,
      total_pages: 0,
      filters_applied: filters,
      error: 'Internal server error'
    });
  }
}