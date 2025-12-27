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

interface SearchSuggestion {
  id: string;
  title: string;
  origin_country?: string;
  cuisine?: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status?: string;
  relevance_score?: number;
  match_type?: string;
}

interface SuggestResponse {
  success: boolean;
  suggestions: SearchSuggestion[];
  total: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuggestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      suggestions: [],
      total: 0,
      error: 'Method not allowed'
    });
  }

  const { q, limit = '8' } = req.query;

  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.status(400).json({
      success: false,
      suggestions: [],
      total: 0,
      error: 'Query must be at least 2 characters long'
    });
  }

  const searchLimit = Math.min(parseInt(limit as string) || 8, 20);

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Fuzzy search query with multiple matching strategies
    const searchQuery = `
      SELECT 
        r.id,
        r.title,
        r.origin_country,
        r.cuisine,
        r.image_url as image,
        r.cooking_time,
        r.difficulty,
        r.authenticity_status,
        r.popularity_score,
        CASE 
          WHEN r.title LIKE ? THEN 100
          WHEN r.title LIKE ? THEN 90
          WHEN r.ingredients LIKE ? THEN 80
          WHEN r.origin_country LIKE ? THEN 70
          WHEN r.cuisine LIKE ? THEN 65
          WHEN r.tags LIKE ? THEN 60
          ELSE 50
        END as relevance_score,
        CASE 
          WHEN r.title LIKE ? THEN 'exact_title'
          WHEN r.title LIKE ? THEN 'partial_title'
          WHEN r.ingredients LIKE ? THEN 'ingredient'
          WHEN r.origin_country LIKE ? THEN 'country'
          WHEN r.cuisine LIKE ? THEN 'cuisine'
          WHEN r.tags LIKE ? THEN 'tag'
          ELSE 'content'
        END as match_type
      FROM recipes r
      WHERE (
        r.title LIKE ? OR
        r.title LIKE ? OR
        r.ingredients LIKE ? OR
        r.origin_country LIKE ? OR
        r.cuisine LIKE ? OR
        r.tags LIKE ? OR
        r.instructions LIKE ?
      )
      AND r.status = 'published'
      ORDER BY 
        relevance_score DESC,
        r.popularity_score DESC,
        CASE r.authenticity_status
          WHEN 'verified' THEN 1
          WHEN 'community' THEN 2
          ELSE 3
        END,
        r.created_at DESC
      LIMIT ?
    `;

    const searchTerm = q.toLowerCase().trim();
    const exactMatch = searchTerm;
    const partialMatch = `%${searchTerm}%`;
    const fuzzyMatch = `%${searchTerm.split('').join('%')}%`;

    const params = [
      // Relevance scoring parameters
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch,
      // Match type parameters
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch,
      // WHERE clause parameters
      exactMatch, partialMatch, partialMatch, partialMatch, partialMatch, partialMatch, fuzzyMatch,
      // LIMIT
      searchLimit
    ];

    const [rows] = await connection.execute(searchQuery, params);
    await connection.end();

    const suggestions = (rows as any[]).map(row => ({
      id: row.id.toString(),
      title: row.title,
      origin_country: row.origin_country,
      cuisine: row.cuisine,
      image: row.image,
      cooking_time: row.cooking_time?.toString(),
      difficulty: row.difficulty,
      authenticity_status: row.authenticity_status,
      relevance_score: row.relevance_score / 100,
      match_type: row.match_type
    }));

    // Add search analytics (fire and forget)
    try {
      const analyticsConnection = await mysql.createConnection(dbConfig);
      await analyticsConnection.execute(
        'INSERT INTO search_analytics (query, results_count, search_type, response_time_ms) VALUES (?, ?, ?, ?)',
        [searchTerm, suggestions.length, 'suggest', Date.now() % 1000]
      );
      await analyticsConnection.end();
    } catch (analyticsError) {
      console.error('Analytics logging failed:', analyticsError);
    }

    res.status(200).json({
      success: true,
      suggestions,
      total: suggestions.length
    });

  } catch (error) {
    console.error('Search suggestion error:', error);
    res.status(500).json({
      success: false,
      suggestions: [],
      total: 0,
      error: 'Internal server error'
    });
  }
}