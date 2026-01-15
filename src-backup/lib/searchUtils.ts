/**
 * Search Utilities: Normalization, Fingerprinting, Deduplication
 * 
 * Provides:
 * - Query normalization (clean, lowercase, diacritics, synonyms)
 * - Canonical name and fingerprinting for dedupe
 * - Ingredients hashing
 * - Entity extraction (country, ingredient tokens)
 */

import * as crypto from 'crypto';

// Synonym mapping for common ingredient/dish names
const INGREDIENT_SYNONYMS: Record<string, string> = {
  chili: 'chile',
  cilantro: 'coriander',
  coriander: 'coriander',
  eggplant: 'aubergine',
  bell_pepper: 'capsicum',
  chickpea: 'garbanzo',
  garbanzo: 'chickpea',
  yogurt: 'yoghurt',
  yoghurt: 'yogurt',
  olive_oil: 'extra_virgin_olive_oil',
  tomato: 'tomato',
  onion: 'onion',
};

// Curated list of trusted country/region names
export const KNOWN_COUNTRIES = [
  'india', 'italy', 'china', 'japan', 'mexico', 'france', 'thai', 'thailand',
  'spain', 'korea', 'greek', 'greek', 'middle eastern', 'middle east', 'persian',
  'turkish', 'turkey', 'greek', 'egypt', 'vietnamese', 'vietnam', 'portuguese',
  'portuguese', 'german', 'germany', 'swiss', 'switzerland', 'nordic', 'swedish',
  'norwegian', 'danish', 'finnish', 'moroccan', 'moroccan', 'lebanese', 'syrian',
  'israeli', 'palestinian', 'indian', 'indonesian', 'malaysian', 'singapore',
  'vietnamese', 'philippine', 'bengali', 'punjabi', 'south african', 'brazilian',
  'caribbean', 'cuban', 'colombian', 'peruvian', 'argentinian', 'chilean',
];

export interface NormalizedQuery {
  originalQuery: string;
  canonical: string; // lowercase, no punct, fingerprint-ready
  searchTerms: string; // for fulltext search
  tokens: string[];
  detectedCountry?: string;
  detectedIngredients: string[];
}

/**
 * Normalize query: lowercase, trim, remove punctuation, strip diacritics
 */
export function normalizeQuery(input: string): NormalizedQuery {
  const original = input.trim();
  
  // Lowercase and strip leading/trailing spaces
  let clean = original.toLowerCase();

  // Remove diacritics (é -> e, ñ -> n, etc.)
  clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Tokenize by spaces
  const tokens = clean
    .replace(/[^\w\s-]/g, ' ') // Replace punct with spaces
    .split(/\s+/)
    .filter(t => t.length > 0);

  // Canonical: lowercase, no punct, ordered for fingerprinting
  const canonical = tokens.join('_');

  // Detect country/region
  let detectedCountry: string | undefined;
  for (const token of tokens) {
    const match = KNOWN_COUNTRIES.find(c => c.includes(token) || token.includes(c));
    if (match) {
      detectedCountry = match;
      break;
    }
  }

  // Detect ingredient tokens (heuristic: common ingredient words)
  const commonIngredients = [
    'pasta', 'rice', 'chicken', 'beef', 'fish', 'seafood', 'vegetable', 'bean',
    'garlic', 'onion', 'pepper', 'tomato', 'cheese', 'herb', 'spice', 'oil',
    'bread', 'meat', 'vegetarian', 'vegan', 'gluten', 'dairy', 'egg',
  ];
  const detectedIngredients = tokens.filter(token =>
    commonIngredients.some(ing => token.includes(ing) || ing.includes(token))
  );

  // Search terms: space-separated for FULLTEXT
  const searchTerms = tokens.join(' ');

  return {
    originalQuery: original,
    canonical,
    searchTerms,
    tokens,
    detectedCountry,
    detectedIngredients,
  };
}

/**
 * Compute fingerprint for deduplication
 * SHA256 hash of canonical name
 */
export function computeFingerprint(title: string): Buffer {
  const canonical = normalizeQuery(title).canonical;
  return crypto.createHash('sha256').update(canonical).digest();
}

/**
 * Compute ingredients hash (order-independent)
 * Takes an array of ingredients and produces a hash
 */
export function computeIngredientsHash(ingredients: string[]): Buffer {
  // Normalize and sort for consistent hashing
  const normalized = ingredients
    .map(ing => 
      ing
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w]/g, '')
    )
    .filter(ing => ing.length > 0)
    .sort();

  const canonical = normalized.join('|');
  return crypto.createHash('sha256').update(canonical).digest();
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 * Used when SOUNDEX or FULLTEXT is insufficient
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i <= aLen; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[aLen][bLen];
}

/**
 * Calculate Jaccard similarity for ingredient lists
 * Returns score 0.0 to 1.0
 */
export function ingredientsSimilarity(ing1: string[], ing2: string[]): number {
  const set1 = new Set(
    ing1.map(i =>
      i
        .toLowerCase()
        .trim()
        .replace(/[^\w]/g, '')
    )
  );
  const set2 = new Set(
    ing2.map(i =>
      i
        .toLowerCase()
        .trim()
        .replace(/[^\w]/g, '')
    )
  );

  const intersection = [...set1].filter(item => set2.has(item)).length;
  const union = new Set([...set1, ...set2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * Dedupe detection: check if a recipe is similar to existing ones
 * Returns similarity score (0.0 to 1.0) and matched recipe ID if found
 */
export interface DedupeMatch {
  matchedRecipeId: number;
  similarityScore: number;
  matchType: 'exact' | 'name' | 'ingredients' | 'combined';
}

export function calculateDedupeScore(
  titleDistance: number,
  ingredientSimilarity: number
): number {
  // Weighted combination of name distance (normalized) and ingredient similarity
  const nameSimilarity = Math.max(0, 1 - (titleDistance / 10)); // Normalize distance
  return nameSimilarity * 0.4 + ingredientSimilarity * 0.6;
}

/**
 * Normalize ingredients list for comparison
 * Canonicalizes format, removes quantities, normalizes synonyms
 */
export function normalizeIngredientsList(ingredients: string[]): string[] {
  return ingredients
    .map(ing => {
      let normalized = ing
        .toLowerCase()
        .trim()
        // Remove quantities (e.g., "2 cups" -> "")
        .replace(/^\d+\s*(cup|tbsp|tsp|oz|g|kg|lb|ml|l|pinch|handful)\s*/i, '')
        .replace(/^[\d.\/\-\s]+\s*/g, '')
        .trim();

      // Apply synonym mappings
      for (const [key, value] of Object.entries(INGREDIENT_SYNONYMS)) {
        if (normalized.includes(key)) {
          normalized = normalized.replace(key, value);
        }
      }

      return normalized;
    })
    .filter(ing => ing.length > 0);
}

/**
 * Extract structured data from query
 * Returns: dish name, country, ingredient list
 */
export interface StructuredQuery {
  dishName: string;
  country?: string;
  ingredients: string[];
  isVague: boolean; // "soft tacos" is more vague than "authentic chicken mole"
}

export function structureQuery(query: NormalizedQuery): StructuredQuery {
  const dishName = query.searchTerms;
  const isVague = query.tokens.length <= 2 || query.tokens.some(t => ['soft', 'easy', 'simple'].includes(t));

  return {
    dishName,
    country: query.detectedCountry,
    ingredients: query.detectedIngredients,
    isVague,
  };
}

/**
 * Classify the query type for auto-find
 * Returns: 'known_recipe' or 'vague_description'
 */
export const KNOWN_RECIPES_WHITELIST = [
  'pasta carbonara', 'pad thai', 'biryani', 'tagine', 'ramen', 'risotto',
  'paella', 'tikka masala', 'coq au vin', 'bouillabaisse', 'pho', 'sushi',
  'tacos', 'ceviche', 'empanada', 'falafel', 'hummus', 'moussaka',
  'goulash', 'schnitzel', 'borsch', 'pierogi', 'curry', 'stir fry',
  'gyro', 'souvlaki', 'kebab', 'shawarma', 'dim sum', 'wonton',
];

export function classifyQuery(structured: StructuredQuery): 'known_recipe' | 'vague_description' {
  const normalized = structured.dishName.toLowerCase();

  // Check against whitelist
  const isKnown = KNOWN_RECIPES_WHITELIST.some(recipe =>
    normalized.includes(recipe) || recipe.includes(normalized)
  );

  if (isKnown) {
    return 'known_recipe';
  }

  // If very short or only ingredients, classify as vague
  if (structured.isVague && structured.ingredients.length > 0) {
    return 'vague_description';
  }

  // Default to known (assume user is asking about a real recipe)
  return 'known_recipe';
}

/**
 * Validate recipe data before insertion
 * Ensures required fields and data quality
 */
export interface RecipeValidation {
  isValid: boolean;
  errors: string[];
}

export function validateRecipeData(data: any): RecipeValidation {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 255) {
    errors.push('Title exceeds 255 characters');
  }

  if (!data.ingredients || data.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  } else if (!Array.isArray(data.ingredients)) {
    errors.push('Ingredients must be an array');
  } else if (data.ingredients.length > 100) {
    errors.push('Too many ingredients');
  }

  if (!data.steps || data.steps.length === 0) {
    errors.push('At least one step is required');
  } else if (!Array.isArray(data.steps)) {
    errors.push('Steps must be an array');
  } else if (data.steps.length > 100) {
    errors.push('Too many steps');
  }

  if (data.cooking_time && (data.cooking_time < 1 || data.cooking_time > 1440)) {
    errors.push('Cooking time must be between 1 and 1440 minutes');
  }

  if (data.difficulty && !['Easy', 'Medium', 'Hard'].includes(data.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, or Hard');
  }

  if (data.history && data.history.length > 10000) {
    errors.push('History exceeds character limit');
  }

  if (data.image && data.image.length > 500) {
    errors.push('Image URL exceeds 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
