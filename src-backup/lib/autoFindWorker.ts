/**
 * Auto-Find Worker: Fetch, Generate, Save AI-Generated Recipes
 * 
 * Runs as a background job via BullMQ.
 * Fetches from trusted sources, uses AI to structure recipe, deduplicates, saves as ai_pending.
 * 
 * Job flow:
 * 1. Parse and validate user query
 * 2. Classify request (known recipe vs vague)
 * 3. Fetch from trusted external sources
 * 4. Extract structured data
 * 5. Run AI generation (ingredients, steps, origin story)
 * 6. Deduplicate against existing recipes
 * 7. Save as ai_pending with metadata
 * 8. Create review task for moderators
 * 9. Log execution
 */

import { Job } from 'bull';
import pool from '@/lib/db';
import {
  normalizeQuery,
  structureQuery,
  classifyQuery,
  computeFingerprint,
  computeIngredientsHash,
  normalizeIngredientsList,
  validateRecipeData,
  ingredientsSimilarity,
  levenshteinDistance,
  calculateDedupeScore,
} from '@/lib/searchUtils';

// Helper to execute queries
async function queryDb(sql: string, params: any[] = []): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

// Placeholder functions - these will be imported when needed
async function fetchTrustedSources(structured: any, classification: string): Promise<any[]> {
  console.log(`[SourceFetch] Fetching sources for: ${structured.dishName}`);
  // TODO: Import from sourceFetcher when file is complete
  return [];
}

async function generateRecipeAI(
  structured: any,
  sources: any[],
  normalized: any
): Promise<AIGeneratedRecipe> {
  console.log(`[AI] Generating recipe (placeholder - implement with actual AI provider)`);
  // TODO: Import from aiProvider when file is complete
  throw new Error('AI generation not yet implemented');
}

export interface AutoFindJobData {
  userQuery: string;
  normalizedQuery: string;
  searchTerms: string;
  clientIp: string;
  timestamp: string;
}

export interface AIGeneratedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  cooking_time: number;
  difficulty: string;
  history: string;
  platingStyle: string;
  image?: string;
  origin_country?: string;
  origin_region?: string;
  ai_metadata: {
    model_version: string;
    generated_at: string;
    ai_confidence: number;
    sources: Array<{
      url: string;
      title: string;
      domain: string;
      excerpt: string;
      trust_score: number;
    }>;
    normalization_details: {
      query_tokens: string[];
      detected_country: string | undefined;
      detected_ingredients: string[];
    };
    extraction_notes: string;
  };
}

/**
 * Main auto-find worker processor
 */
export async function processAutoFindJob(job: Job<AutoFindJobData>) {
  const startTime = Date.now();
  let recipeId: number | null = null;

  try {
    job.progress(10);
    console.log(`[AutoFind] Processing job ${job.id} for query: "${job.data.userQuery}"`);

    // ============================================
    // STEP 1: Parse and normalize query
    // ============================================
    const normalized = normalizeQuery(job.data.userQuery);
    const structured = structureQuery(normalized);
    const classification = classifyQuery(structured);

    job.progress(15);

    // ============================================
    // STEP 2: Fetch from trusted sources
    // ============================================
    console.log(`[AutoFind] Classification: ${classification}`);
    const sources = await fetchTrustedSources(structured, classification);

    if (!sources || sources.length === 0) {
      console.log(`[AutoFind] No trusted sources found for query: ${job.data.userQuery}`);
      throw new Error('Unable to fetch trusted sources for this recipe');
    }

    job.progress(40);

    // ============================================
    // STEP 3: Generate recipe via AI
    // ============================================
    console.log(`[AutoFind] Generating recipe from ${sources.length} sources...`);
    const generated = await generateRecipeAI(structured, sources, normalized);

    if (!generated || !generated.title) {
      throw new Error('AI generation failed to produce valid recipe');
    }

    job.progress(60);

    // ============================================
    // STEP 4: Validate generated recipe
    // ============================================
    const validation = validateRecipeData({
      title: generated.title,
      ingredients: generated.ingredients,
      steps: generated.steps,
      cooking_time: generated.cooking_time,
      difficulty: generated.difficulty,
      history: generated.history,
      image: generated.image,
    });

    if (!validation.isValid) {
      throw new Error(`Generated recipe validation failed: ${validation.errors.join(', ')}`);
    }

    job.progress(70);

    // ============================================
    // STEP 5: Deduplication check
    // ============================================
    const dedupeResult = await deduplicateCheck(generated);

    if (dedupeResult.isDuplicate) {
      console.log(
        `[AutoFind] Duplicate found (recipe_id: ${dedupeResult.matchedRecipeId}, score: ${dedupeResult.similarity})`
      );
      // Return existing recipe instead of creating new
      recipeId = dedupeResult.matchedRecipeId || null;
      await logJobExecution(String(job.id), recipeId, 'completed', null, startTime);
      return {
        success: true,
        recipeId,
        reason: 'Existing recipe found',
        isDuplicate: true,
      };
    }

    job.progress(75);

    // ============================================
    // STEP 6: Save AI-generated recipe as ai_pending
    // ============================================
    const fingerprint = computeFingerprint(generated.title);
    const ingredientsHash = computeIngredientsHash(generated.ingredients);

    const insertQuery = `
      INSERT INTO recipes (
        title,
        canonical_name,
        name_fingerprint,
        ingredients_hash,
        ingredients,
        steps,
        cooking_time,
        difficulty,
        history,
        platingStyle,
        origin_country,
        origin_region,
        image,
        authenticity_status,
        ai_metadata,
        review_requested,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const ingredientsText = generated.ingredients.join('\n');
    const stepsText = generated.steps.join('\n');

    const result = await queryDb(insertQuery, [
      generated.title,
      normalized.canonical,
      fingerprint,
      ingredientsHash,
      ingredientsText,
      stepsText,
      generated.cooking_time,
      generated.difficulty,
      generated.history,
      generated.platingStyle || 'Modern',
      generated.origin_country,
      generated.origin_region,
      generated.image || null,
      'ai_pending',
      JSON.stringify(generated.ai_metadata),
      true, // review_requested = true
    ]);

    recipeId = result.insertId;
    console.log(`[AutoFind] Recipe saved with ID: ${recipeId}`);

    job.progress(80);

    // ============================================
    // STEP 7: Save source snapshots for provenance
    // ============================================
    for (const source of sources) {
      if (source.snapshot) {
        await queryDb(
          `INSERT INTO ai_source_snapshots (
             recipe_id, source_url, source_title, source_domain,
             snapshot_text, trust_score
           ) VALUES (?, ?, ?, ?, ?, ?)`,
          [recipeId, source.url, source.title, source.domain, source.snapshot, source.trust_score]
        );
      }
    }

    job.progress(85);

    // ============================================
    // STEP 8: Create review task for moderators
    // ============================================
    await queryDb(
      `INSERT INTO review_tasks (recipe_id, review_type, status, created_at)
       VALUES (?, 'cultural_authenticity', 'pending', NOW())`,
      [recipeId]
    );

    job.progress(90);

    // ============================================
    // STEP 9: Create revision entry
    // ============================================
    const payload = {
      ...generated,
      ai_generation_query: job.data.userQuery,
      ai_generation_timestamp: new Date().toISOString(),
    };

    await queryDb(
      `INSERT INTO recipe_revisions (recipe_id, action, payload, actor_role, reason_notes)
       VALUES (?, 'ai_generated', ?, 'system', ?)`,
      [recipeId, JSON.stringify(payload), 'Auto-generated from user query']
    );

    job.progress(95);

    // ============================================
    // Log job completion
    // ============================================
    await logJobExecution(String(job.id), recipeId, 'completed', null, startTime);

    job.progress(100);

    return {
      success: true,
      recipeId,
      title: generated.title,
      confidence: generated.ai_metadata.ai_confidence,
      sources_count: sources.length,
    };
  } catch (error) {
    console.error(`[AutoFind] Job ${job.id} failed:`, error);

    // Log failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    await logJobExecution(String(job.id), recipeId, 'failed', errorMessage, startTime);

    throw error;
  }
}

/**
 * Deduplication check: Compare with existing recipes
 * Returns match info if similar recipe exists
 */
interface DedupeCheckResult {
  isDuplicate: boolean;
  matchedRecipeId?: number;
  similarity?: number;
}

async function deduplicateCheck(generated: AIGeneratedRecipe): Promise<DedupeCheckResult> {
  try {
    // Compute fingerprints
    const nameFingerprint = computeFingerprint(generated.title);
    const ingredientsHash = computeIngredientsHash(generated.ingredients);

    // Check for exact name match
    const exactMatch = await queryDb(
      `SELECT id FROM recipes WHERE name_fingerprint = ? LIMIT 1`,
      [nameFingerprint]
    );

    if (exactMatch && exactMatch.length > 0) {
      return {
        isDuplicate: true,
        matchedRecipeId: exactMatch[0].id,
        similarity: 1.0,
      };
    }

    // Check for similar ingredients
    const similarRecipes = await queryDb(
      `SELECT id, title, ingredients FROM recipes 
       WHERE authenticity_status IN ('verified', 'community')
       LIMIT 50`,
      []
    );

    if (similarRecipes && similarRecipes.length > 0) {
      const normalizedGenerated = normalizeIngredientsList(generated.ingredients);

      for (const existing of similarRecipes) {
        const existingIngs = existing.ingredients
          .split('\n')
          .filter((ing: string) => ing.trim().length > 0);
        const normalizedExisting = normalizeIngredientsList(existingIngs);

        // Calculate similarity scores
        const ingredientSim = ingredientsSimilarity(normalizedGenerated, normalizedExisting);
        const titleDistance = levenshteinDistance(
          generated.title.toLowerCase(),
          existing.title.toLowerCase()
        );
        const dedupeScore = calculateDedupeScore(titleDistance, ingredientSim);

        // If score high, consider it duplicate
        if (dedupeScore >= 0.75) {
          return {
            isDuplicate: true,
            matchedRecipeId: existing.id,
            similarity: dedupeScore,
          };
        }
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    console.error('Dedup check error:', err);
    // On error, assume not duplicate (fail-open)
    return { isDuplicate: false };
  }
}

/**
 * Log job execution for analytics and debugging
 */
async function logJobExecution(
  jobId: string,
  recipeId: number | null,
  status: 'completed' | 'failed',
  errorMessage: string | null,
  startTime: number
): Promise<void> {
  try {
    const executionTime = Date.now() - startTime;

    await queryDb(
      `UPDATE ai_jobs_log 
       SET status = ?, recipe_id = ?, error_message = ?, execution_time_ms = ?, completed_at = NOW()
       WHERE job_id = ?`,
      [status, recipeId, errorMessage, executionTime, jobId]
    );
  } catch (err) {
    console.error('Error logging job execution:', err);
  }
}

/**
 * Error handler for job failures (BullMQ callback)
 */
export async function handleJobFailure(job: Job<AutoFindJobData>, error: Error) {
  console.error(`[AutoFind] Job ${job.id} failed with error:`, error.message);

  // Could send alert, notify user, etc.
  // For now, just log
}
