/**
 * Cache Manager: Redis-backed Caching for Search Results
 * 
 * Caches:
 * - Search results (paginated)
 * - Recipe details
 * - Analytics data
 * 
 * TTLs:
 * - Search results: 5-10 minutes (regenerated frequently)
 * - Recipe details: 30 minutes
 * - Verified recipes: 1 hour
 * - Analytics: varies
 */

import { getRedisClient } from '@/lib/queue';

const CACHE_PREFIX = 'cache:';

/**
 * Get cached search result
 */
export async function getCachedSearch(key: string): Promise<any | null> {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(`${CACHE_PREFIX}search:${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('[Cache] Get error:', error);
    return null; // Fail gracefully
  }
}

/**
 * Set cached search result
 */
export async function setCachedSearch(
  key: string,
  value: any,
  ttlSeconds: number = 600
): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setex(`${CACHE_PREFIX}search:${key}`, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('[Cache] Set error:', error);
  }
}

/**
 * Invalidate search cache (on recipe update/verify)
 */
export async function invalidateSearchCache(pattern: string = '*'): Promise<void> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(`${CACHE_PREFIX}search:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(`[Cache] Invalidated ${keys.length} search cache entries`);
  } catch (error) {
    console.error('[Cache] Invalidate error:', error);
  }
}

/**
 * Get cached recipe detail
 */
export async function getCachedRecipe(recipeId: number): Promise<any | null> {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(`${CACHE_PREFIX}recipe:${recipeId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('[Cache] Get recipe error:', error);
    return null;
  }
}

/**
 * Set cached recipe detail
 */
export async function setCachedRecipe(recipeId: number, value: any, ttlSeconds: number = 1800): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setex(`${CACHE_PREFIX}recipe:${recipeId}`, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('[Cache] Set recipe error:', error);
  }
}

/**
 * Invalidate recipe cache
 */
export async function invalidateRecipeCache(recipeId: number): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(`${CACHE_PREFIX}recipe:${recipeId}`);
    console.log(`[Cache] Invalidated recipe ${recipeId}`);
  } catch (error) {
    console.error('[Cache] Invalidate recipe error:', error);
  }
}

// ============================================
// Rate Limiting
// ============================================

export interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  search: { windowSeconds: 60, maxRequests: 100 },
  autoFind: { windowSeconds: 86400, maxRequests: 50 },
  apiGeneral: { windowSeconds: 60, maxRequests: 60 },
};

export class RateLimiter {
  private name: string;
  private config: RateLimitConfig;
  
  public get windowSeconds(): number {
    return this.config.windowSeconds;
  }

  public get maxRequests(): number {
    return this.config.maxRequests;
  }

  constructor(name: string, config?: RateLimitConfig) {
    this.name = name;
    this.config = config || DEFAULT_LIMITS[name] || { windowSeconds: 60, maxRequests: 60 };
  }

  /**
   * Check if request is allowed
   */
  async isAllowed(clientId: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = `${CACHE_PREFIX}ratelimit:${this.name}:${clientId}`;

      const current = await redis.incr(key);

      if (current === 1) {
        // First request in window, set expiry
        await redis.expire(key, this.config.windowSeconds);
      }

      return current <= this.config.maxRequests;
    } catch (error) {
      console.error('[RateLimit] Error:', error);
      // Fail open on error
      return true;
    }
  }

  /**
   * Get current request count for a client
   */
  async getCount(clientId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const key = `${CACHE_PREFIX}ratelimit:${this.name}:${clientId}`;
      const count = await redis.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('[RateLimit] Get count error:', error);
      return 0;
    }
  }

  /**
   * Get remaining requests for a client
   */
  async getRemaining(clientId: string): Promise<number> {
    const count = await this.getCount(clientId);
    return Math.max(0, this.config.maxRequests - count);
  }

  /**
   * Reset rate limit for a client
   */
  async reset(clientId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `${CACHE_PREFIX}ratelimit:${this.name}:${clientId}`;
      await redis.del(key);
    } catch (error) {
      console.error('[RateLimit] Reset error:', error);
    }
  }
}

// ============================================
// Rate Limiter Singletons
// ============================================

const limiters: Record<string, RateLimiter> = {};

export function getRateLimiter(name: string, config?: RateLimitConfig): RateLimiter {
  if (!limiters[name]) {
    limiters[name] = new RateLimiter(name, config);
  }
  return limiters[name];
}

/**
 * Middleware for Express/Next.js rate limiting
 */
export function createRateLimitMiddleware(
  limiterName: string = 'apiGeneral',
  keyExtractor?: (req: any) => string
) {
  return async (req: any, res: any, next: any) => {
    try {
      const limiter = getRateLimiter(limiterName);
      const clientKey = keyExtractor
        ? keyExtractor(req)
        : req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

      const allowed = await limiter.isAllowed(clientKey);
      const remaining = await limiter.getRemaining(clientKey);

      res.setHeader('X-RateLimit-Remaining', remaining);

      if (!allowed) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded',
          retryAfter: limiter.windowSeconds,
        });
      }

      next();
    } catch (error) {
      console.error('[RateLimitMiddleware] Error:', error);
      next(); // Fail open
    }
  };
}
