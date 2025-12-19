/**
 * Source Fetcher: Trusted Public Recipe & Cultural Sources
 * 
 * Fetches recipe data and cultural information from whitelisted, trusted sources.
 * Ensures copyright compliance and cultural respect.
 * 
 * Trusted sources:
 * - Wikimedia / Wikipedia (articles, cultural context)
 * - Public heritage databases
 * - Educational institution recipes
 * - Cultural ministry pages
 * - Public domain recipe archives
 */

import axios, { AxiosError } from 'axios';
import { URL } from 'url';
import { StructuredQuery } from '@/lib/searchUtils';

// ============================================
// Source Whitelist & Trust Configuration
// ============================================

export interface TrustedSource {
  name: string;
  baseUrl: string;
  endpoints: {
    search?: string;
    recipe?: string;
    culture?: string;
  };
  trustScore: number; // 0.0 to 1.0
  rateLimit: number; // requests per minute
  licenseType: 'public_domain' | 'creative_commons' | 'educational' | 'institutional';
  requiresAttribution: boolean;
}

const TRUSTED_SOURCES: TrustedSource[] = [
  {
    name: 'Wikimedia Commons (Recipes)',
    baseUrl: 'https://commons.wikimedia.org/w/api.php',
    endpoints: {
      search: '/w/api.php?action=query&list=search&srsearch=recipe%20',
    },
    trustScore: 0.9,
    rateLimit: 10,
    licenseType: 'creative_commons',
    requiresAttribution: true,
  },
  {
    name: 'Wikipedia (Culinary Articles)',
    baseUrl: 'https://en.wikipedia.org/w/api.php',
    endpoints: {
      search: '/w/api.php?action=query&list=search&srsearch=',
      recipe: '/w/api.php?action=query&titles=%s&prop=extracts',
    },
    trustScore: 0.95,
    rateLimit: 10,
    licenseType: 'creative_commons',
    requiresAttribution: true,
  },
  {
    name: 'Open Food Facts',
    baseUrl: 'https://world.openfoodfacts.org/api/v0',
    endpoints: {
      search: '/product/search?search_terms=%s',
    },
    trustScore: 0.85,
    rateLimit: 10,
    licenseType: 'creative_commons',
    requiresAttribution: true,
  },
  {
    name: 'USDA Food Data Central',
    baseUrl: 'https://fdc.nal.usda.gov/api/food',
    endpoints: {
      search: '/search?query=%s&pageSize=5',
    },
    trustScore: 0.88,
    rateLimit: 120, // 120 per minute
    licenseType: 'public_domain',
    requiresAttribution: false,
  },
  {
    name: 'Project Gutenberg (Cookbooks)',
    baseUrl: 'https://gutendex.com/books',
    endpoints: {
      search: '?search=%s',
    },
    trustScore: 0.9,
    rateLimit: 10,
    licenseType: 'public_domain',
    requiresAttribution: true,
  },
];

// ============================================
// Source Fetching Interface
// ============================================

export interface FetchedSource {
  url: string;
  title: string;
  domain: string;
  snippet: string;
  snapshot?: string; // Full text content for preservation
  ingredients?: string[];
  steps?: string[];
  trust_score: number;
  source_name: string;
  license: string;
  attribution_required: boolean;
}

/**
 * Fetch from trusted sources for a recipe query
 * 
 * @param structured Normalized and structured query
 * @param classification 'known_recipe' or 'vague_description'
 * @returns Array of fetched source data
 */
export async function fetchTrustedSources(
  structured: StructuredQuery,
  classification: string
): Promise<FetchedSource[]> {
  const results: FetchedSource[] = [];
  const searchQuery = buildSearchQuery(structured, classification);

  console.log(`[SourceFetch] Searching for: "${searchQuery}"`);

  for (const source of TRUSTED_SOURCES) {
    try {
      const sourceResults = await fetchFromSource(source, searchQuery);
      results.push(...sourceResults);

      // Limit total sources to avoid bloat
      if (results.length >= 5) {
        break;
      }
    } catch (error) {
      const err = error as AxiosError;
      console.warn(`[SourceFetch] Failed to fetch from ${source.name}:`, err.message);
      // Continue to next source on failure
    }
  }

  return results;
}

/**
 * Build search query based on structured query and classification
 */
function buildSearchQuery(structured: StructuredQuery, classification: string): string {
  let query = structured.dishName;

  // For vague descriptions, add country context
  if (classification === 'vague_description' && structured.country) {
    query = `${structured.country} ${query}`;
  }

  return query;
}

/**
 * Fetch from a specific trusted source
 */
async function fetchFromSource(source: TrustedSource, query: string): Promise<FetchedSource[]> {
  const results: FetchedSource[] = [];

  try {
    // Build URL based on source type
    let url: string;

    if (source.name.includes('Wikipedia')) {
      url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&srlimit=3`;
    } else if (source.name.includes('Open Food Facts')) {
      url = `https://world.openfoodfacts.org/api/v0/product/search?search_terms=${encodeURIComponent(
        query
      )}&json=1`;
    } else if (source.name.includes('USDA')) {
      url = `https://fdc.nal.usda.gov/api/food/search?query=${encodeURIComponent(query)}&pageSize=3&api_key=${
        process.env.USDA_API_KEY || ''
      }`;
    } else {
      // Generic source
      url = `${source.baseUrl}${(source.endpoints.search || '')}${encodeURIComponent(query)}`;
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GlobalAuthenticRecipes/1.0 (recipe-research)',
      },
    });

    // Parse response based on source
    if (source.name.includes('Wikipedia')) {
      const parsed = parseWikipediaResults(response.data, source);
      results.push(...parsed);
    } else if (source.name.includes('Open Food Facts')) {
      const parsed = parseOpenFoodFactsResults(response.data, source);
      results.push(...parsed);
    } else if (source.name.includes('USDA')) {
      const parsed = parseUSDAResults(response.data, source);
      results.push(...parsed);
    }
  } catch (error) {
    const err = error as AxiosError;
    if (err.code === 'ECONNABORTED') {
      console.warn(`[SourceFetch] Timeout fetching from ${source.name}`);
    } else {
      console.warn(`[SourceFetch] Error fetching from ${source.name}:`, err.message);
    }
  }

  return results;
}

/**
 * Parse Wikipedia API results
 */
function parseWikipediaResults(data: any, source: TrustedSource): FetchedSource[] {
  const results: FetchedSource[] = [];

  if (data.query?.search) {
    for (const item of data.query.search.slice(0, 3)) {
      results.push({
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        title: item.title,
        domain: 'wikipedia.org',
        snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        trust_score: source.trustScore,
        source_name: source.name,
        license: source.licenseType,
        attribution_required: source.requiresAttribution,
      });
    }
  }

  return results;
}

/**
 * Parse Open Food Facts results
 */
function parseOpenFoodFactsResults(data: any, source: TrustedSource): FetchedSource[] {
  const results: FetchedSource[] = [];

  if (data.products) {
    for (const product of data.products.slice(0, 3)) {
      if (product.product_name) {
        results.push({
          url: product.url || `https://world.openfoodfacts.org/product/${product.id}`,
          title: product.product_name,
          domain: 'openfoodfacts.org',
          snippet: product.categories || 'Food product data',
          ingredients: product.ingredients_text?.split(',').map((s: string) => s.trim()) || [],
          trust_score: source.trustScore,
          source_name: source.name,
          license: source.licenseType,
          attribution_required: source.requiresAttribution,
        });
      }
    }
  }

  return results;
}

/**
 * Parse USDA FDC results
 */
function parseUSDAResults(data: any, source: TrustedSource): FetchedSource[] {
  const results: FetchedSource[] = [];

  if (data.foods) {
    for (const food of data.foods.slice(0, 3)) {
      results.push({
        url: `https://fdc.nal.usda.gov/fdc-app.html#/?query=${encodeURIComponent(food.description)}`,
        title: food.description,
        domain: 'usda.gov',
        snippet: `FDC ID: ${food.fdcId}`,
        ingredients: food.foodNutrients?.map((n: any) => n.nutrient?.name).filter(Boolean) || [],
        trust_score: source.trustScore,
        source_name: source.name,
        license: source.licenseType,
        attribution_required: source.requiresAttribution,
      });
    }
  }

  return results;
}

/**
 * Validate source URL for safety
 * Prevents SSRF and malicious URLs
 */
export function validateSourceURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Whitelist allowed protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Reject private/internal ranges
    const hostname = url.hostname;
    const privateRanges = [
      '127.',
      '192.168.',
      '10.',
      '172.16.',
      'localhost',
      '.local',
      'file://',
    ];

    for (const range of privateRanges) {
      if (hostname.includes(range)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limiter for API calls
 */
const rateLimiters: Record<string, { count: number; resetTime: number }> = {};

export function checkRateLimit(sourceName: string, source: TrustedSource): boolean {
  const now = Date.now();
  const limiter = rateLimiters[sourceName] || { count: 0, resetTime: now + 60000 };

  if (now > limiter.resetTime) {
    limiter.count = 0;
    limiter.resetTime = now + 60000;
  }

  if (limiter.count >= source.rateLimit) {
    return false;
  }

  limiter.count++;
  rateLimiters[sourceName] = limiter;
  return true;
}
