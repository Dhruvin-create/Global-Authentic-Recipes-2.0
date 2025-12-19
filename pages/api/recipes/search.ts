/**
 * API Route: GET /api/recipes/search
 * 
 * Smart search implementation with exact, fulltext, and fuzzy matching.
 * Triggers auto-find pipeline for missing recipes.
 * 
 * Features:
 * - Query normalization
 * - Exact title/canonical_name match (fast)
 * - FULLTEXT search across recipe fields
 * - Fuzzy search fallback (SOUNDEX/Levenshtein)
 * - Relevance ranking and result combining
 * - Rate limiting and caching
 * - Auto-find job queueing for zero-result searches
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getAutoFindQueue } from '@/lib/queue';
import { normalizeQuery, computeFingerprint, computeIngredientsHash } from '@/lib/searchUtils';
import { getCachedSearch, setCachedSearch, getRateLimiter } from '@/lib/cache';

// Helper to execute queries from pool
async function queryDb(sql: string, params: any[] = []): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

interface SearchResult {
  id: number;
  title: string;
  origin_country?: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status: string;
  ai_metadata?: any;
  relevance_score: number;
  match_type: 'exact' | 'fulltext' | 'fuzzy' | 'ai_generated';
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  auto_find_triggered: boolean;
  job_id?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  try {
    // Validate method
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        auto_find_triggered: false,
        message: 'Method not allowed',
      });
    }

    // Extract and validate parameters
    const { q, page = '1', limit = '20' } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        auto_find_triggered: false,
        message: 'Query parameter required',
      });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Rate limiting check
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const limiter = getRateLimiter('search');
    const isAllowed = await limiter.isAllowed(clientIp);
    if (!isAllowed) {
      return res.status(429).json({
        success: false,
        results: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        auto_find_triggered: false,
        message: 'Rate limit exceeded. Try again later.',
      });
    }

    // Check cache first
    const cacheKey = `search:${q}:${pageNum}:${limitNum}`;
    const cachedResult = await getCachedSearch(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }

    // Normalize query
    const normalized = normalizeQuery(q);

    // ============================================
    // STEP 1: Exact Match Search (fastest)
    // ============================================
    let results: SearchResult[] = [];

    const exactQuery = `
      SELECT 
        id, title, origin_country, image, cooking_time, difficulty,
        authenticity_status, ai_metadata, 
        100 as relevance_score,
        'exact' as match_type
      FROM recipes
      WHERE 
        canonical_name = ? 
        OR LOWER(TRIM(title)) = LOWER(?)
      LIMIT ?
    `;

    try {
      const exactResults = await queryDb(exactQuery, [
        normalized.canonical,
        normalized.originalQuery,
        limitNum,
      ]);

      if (exactResults && exactResults.length > 0) {
        results = exactResults.map(parseSearchResult);
        // Cache and return exact results
        const response: SearchResponse = {
          success: true,
          results,
          total: results.length,
          page: pageNum,
          limit: limitNum,
          auto_find_triggered: false,
        };
        await setCachedSearch(cacheKey, response, 300); // 5min cache
        return res.status(200).json(response);
      }
    } catch (err) {
      console.error('Exact search error:', err);
    }

    // ============================================
    // STEP 2: Fulltext Search (good coverage)
    // ============================================
    const fulltextQuery = `
      SELECT 
        id, title, origin_country, image, cooking_time, difficulty,
        authenticity_status, ai_metadata,
        MATCH(title, ingredients, history, platingStyle) 
          AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score,
        'fulltext' as match_type
      FROM recipes
      WHERE 
        MATCH(title, ingredients, history, platingStyle) 
          AGAINST(? IN NATURAL LANGUAGE MODE)
        AND authenticity_status != 'rejected'
      ORDER BY 
        (authenticity_status = 'verified') DESC,
        (authenticity_status = 'community') DESC,
        relevance_score DESC,
        created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const fulltextResults = await queryDb(fulltextQuery, [
        normalized.searchTerms,
        normalized.searchTerms,
        limitNum,
        offset,
      ]);

      if (fulltextResults && fulltextResults.length > 0) {
        results = fulltextResults.map(parseSearchResult);
        // Cache and return fulltext results
        const response: SearchResponse = {
          success: true,
          results,
          total: fulltextResults.length,
          page: pageNum,
          limit: limitNum,
          auto_find_triggered: false,
        };
        await setCachedSearch(cacheKey, response, 600); // 10min cache
        return res.status(200).json(response);
      }
    } catch (err) {
      console.error('Fulltext search error:', err);
    }

    // ============================================
    // STEP 3: Fuzzy Search (typos, variations)
    // ============================================
    const fuzzyQuery = `
      SELECT 
        id, title, origin_country, image, cooking_time, difficulty,
        authenticity_status, ai_metadata,
        CASE 
          WHEN SOUNDEX(title) = SOUNDEX(?) THEN 80
          ELSE 60
        END as relevance_score,
        'fuzzy' as match_type
      FROM recipes
      WHERE 
        (SOUNDEX(title) = SOUNDEX(?)
         OR title LIKE CONCAT('%', ?, '%'))
        AND authenticity_status != 'rejected'
      ORDER BY relevance_score DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const fuzzyResults = await queryDb(fuzzyQuery, [
        normalized.originalQuery,
        normalized.originalQuery,
        normalized.searchTerms,
        limitNum,
        offset,
      ]);

      if (fuzzyResults && fuzzyResults.length > 0) {
        results = fuzzyResults.map(parseSearchResult);
        // Cache and return fuzzy results
        const response: SearchResponse = {
          success: true,
          results,
          total: fuzzyResults.length,
          page: pageNum,
          limit: limitNum,
          auto_find_triggered: false,
        };
        await setCachedSearch(cacheKey, response, 600);
        return res.status(200).json(response);
      }
    } catch (err) {
      console.error('Fuzzy search error:', err);
    }

    // ============================================
    // STEP 4: No Results - Trigger Auto-Find
    // ============================================
    if (results.length === 0) {
      // Log search analytics
      try {
        await queryDb(
          `INSERT INTO search_analytics (query_normalized, auto_find_triggered)
           VALUES (?, TRUE)
           ON DUPLICATE KEY UPDATE 
             search_count = search_count + 1,
             auto_find_triggered = TRUE`,
          [normalized.canonical]
        );
      } catch (err) {
        console.error('Analytics logging error:', err);
      }

      // Check if auto-find is allowed for this user/IP
      const autoFindAllowed = await isAutoFindAllowed(clientIp, req);

      if (autoFindAllowed) {
        try {
          // Enqueue auto-find job
          const job = await getAutoFindQueue().add(
            'find-and-generate',
            {
              userQuery: q,
              normalizedQuery: normalized.canonical,
              searchTerms: normalized.searchTerms,
              clientIp,
              timestamp: new Date().toISOString(),
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
              removeOnComplete: false,
              timeout: 60000, // 60s timeout
            }
          );

          // Log job (store job id as string)
          await queryDb(
            `INSERT INTO ai_jobs_log (job_id, user_query, status, ai_model_version)
             VALUES (?, ?, 'queued', ?)`,
            [String(job.id), q, process.env.AI_MODEL_VERSION || 'unknown']
          );

          const response: SearchResponse = {
            success: true,
            results: [],
            total: 0,
            page: pageNum,
            limit: limitNum,
            auto_find_triggered: true,
            job_id: String(job.id),
            message: `No recipes found for "${q}". Generating suggestions (AI-generated, pending review)...`,
          };

          await setCachedSearch(cacheKey, response, 60); // Short TTL until job completes
          return res.status(202).json(response);
        } catch (queueErr) {
          console.error('Auto-find queue error:', queueErr);
          // Fall back to "no results" response
        }
      }

      // Return empty results
      const response: SearchResponse = {
        success: true,
        results: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        auto_find_triggered: false,
        message: 'No recipes found. Try a different search.',
      };

      await setCachedSearch(cacheKey, response, 300);
      return res.status(200).json(response);
    }

    // ============================================
    // Return found results
    // ============================================
    const response: SearchResponse = {
      success: true,
      results,
      total: results.length,
      page: pageNum,
      limit: limitNum,
      auto_find_triggered: false,
    };

    await setCachedSearch(cacheKey, response, 600);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({
      success: false,
      results: [],
      total: 0,
      page: 1,
      limit: 20,
      auto_find_triggered: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Helper: Parse database result into SearchResult format
 */
function parseSearchResult(row: any): SearchResult {
  return {
    id: row.id,
    title: row.title,
    origin_country: row.origin_country,
    image: row.image,
    cooking_time: row.cooking_time,
    difficulty: row.difficulty,
    authenticity_status: row.authenticity_status || 'community',
    ai_metadata: row.ai_metadata ? JSON.parse(row.ai_metadata) : undefined,
    relevance_score: parseFloat(row.relevance_score || 0),
    match_type: row.match_type || 'fulltext',
  };
}

/**
 * Helper: Check if auto-find is allowed for a given IP/user
 * Implements rate limiting and quota checks
 */
async function isAutoFindAllowed(clientIp: string, req: NextApiRequest): Promise<boolean> {
  const userId = (req as any).user?.id; // From auth middleware if available

  try {
    // Get auto-find limits
    const dailyLimit = userId ? 50 : 5; // Authenticated users get higher limit
    const limitKey = userId ? `autofind:user:${userId}` : `autofind:ip:${clientIp}`;

    // Check Redis for count
    const { getRedisClient } = require('@/lib/redis');
    const redis = getRedisClient();
    const count = await redis.incr(limitKey);

    if (count === 1) {
      // Set expiry on first increment
      await redis.expire(limitKey, 86400); // 24 hours
    }

    return count <= dailyLimit;
  } catch (err) {
    console.error('Auto-find allow check error:', err);
    // Default to allow on error (fail-open)
    return true;
  }
}
