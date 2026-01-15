/**
 * AI Provider: OpenAI / Claude Integration
 * 
 * Handles structured recipe generation with cultural authenticity focus.
 * Uses prompt engineering to ensure safe, verified-friendly output.
 * 
 * Outputs:
 * - Canonical ingredients (deduplicated, normalized)
 * - Numbered cooking steps
 * - Culturally respectful origin story with citations
 * - Confidence scores
 * - Source attribution
 */

import axios, { AxiosError } from 'axios';
import { StructuredQuery, normalizeIngredientsList, NormalizedQuery } from '@/lib/searchUtils';
import { FetchedSource } from '@/lib/sourceFetcher';

// ============================================
// AI Provider Configuration
// ============================================

export interface AIGeneratedRecipeMetadata {
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
    detected_country?: string;
    detected_ingredients: string[];
  };
  extraction_notes: string;
}

export interface AIRecipeOutput {
  title: string;
  ingredients: string[];
  steps: string[];
  cooking_time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings?: number;
  history: string;
  platingStyle: string;
  image?: string;
  origin_country?: string;
  origin_region?: string;
  ai_metadata: AIGeneratedRecipeMetadata;
}

/**
 * Generate recipe using AI provider
 */
export async function generateRecipeAI(
  structured: StructuredQuery,
  sources: FetchedSource[],
  normalized: NormalizedQuery
): Promise<AIRecipeOutput> {
  const provider = process.env.AI_PROVIDER || 'openai';

  if (provider === 'openai') {
    return generateRecipeOpenAI(structured, sources, normalized);
  } else if (provider === 'claude') {
    return generateRecipeClaude(structured, sources, normalized);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Generate using OpenAI API
 */
async function generateRecipeOpenAI(
  structured: StructuredQuery,
  sources: FetchedSource[],
  normalized: NormalizedQuery
): Promise<AIRecipeOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const prompt = buildPrompt(structured, sources, normalized);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return parseAIResponse(content, sources, normalized);
  } catch (error) {
    const err = error as AxiosError;
    console.error('[AI] OpenAI error:', err.message);
    throw new Error(`AI generation failed: ${err.message}`);
  }
}

/**
 * Generate using Claude API (Anthropic)
 */
async function generateRecipeClaude(
  structured: StructuredQuery,
  sources: FetchedSource[],
  normalized: NormalizedQuery
): Promise<AIRecipeOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  const prompt = buildPrompt(structured, sources, normalized);

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.content?.[0]?.text;
    if (!content) {
      throw new Error('No response from Claude');
    }

    return parseAIResponse(content, sources, normalized);
  } catch (error) {
    const err = error as AxiosError;
    console.error('[AI] Claude error:', err.message);
    throw new Error(`AI generation failed: ${err.message}`);
  }
}

// ============================================
// Prompts & Parsing
// ============================================

const SYSTEM_PROMPT = `You are a culinary AI assistant specializing in authentic global recipes.

CRITICAL INSTRUCTIONS:
1. ALWAYS mark recipes as unverified/pending. They require human cultural review.
2. Generate recipes based ONLY on provided sources.
3. Include source citations in the history section.
4. Preserve cultural authenticity and respect regional variations.
5. Output JSON format ONLY. No markdown, no extra text.
6. For ingredients: use common names, normalize quantities.
7. For steps: be concise, numbered.
8. Confidence score: 0.0 to 1.0 based on source quality and coverage.

SAFETY GUARDRAILS:
- Do NOT invent cultural claims without sources.
- Flag any uncertain information with "Note: " prefix.
- If sources are insufficient or low-trust, lower confidence score below 0.7.
- Do NOT perpetuate stereotypes or inappropriate generalizations about cultures.`;

/**
 * Build prompt for AI with sources and query
 */
function buildPrompt(
  structured: StructuredQuery,
  sources: FetchedSource[],
  normalized: NormalizedQuery
): string {
  const sourcesText = sources
    .map(
      (s, i) => `
Source ${i + 1}: ${s.title} (${s.domain})
Trust Score: ${s.trust_score}
Snippet: ${s.snippet}
${s.ingredients ? `Ingredients: ${s.ingredients.join(', ')}` : ''}
URL: ${s.url}
`
    )
    .join('\n---\n');

  return `Generate a recipe based on the following information:

Query: ${structured.dishName}
${structured.country ? `Region: ${structured.country}` : ''}

SOURCES:
${sourcesText}

REQUIREMENTS:
1. Generate canonical recipe title
2. List ingredients (cleaned, normalized, common names)
3. Provide 5-10 numbered cooking steps
4. Estimated cooking time (minutes)
5. Difficulty level (Easy/Medium/Hard)
6. Cultural history and origin (with source citations)
7. Plating style (if applicable)
8. Confidence score (0.0-1.0)

OUTPUT JSON ONLY:
{
  "title": "Recipe Title",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "steps": ["Step 1...", "Step 2...", ...],
  "cooking_time": 45,
  "difficulty": "Medium",
  "servings": 4,
  "history": "Origin story with sources cited...",
  "plating_style": "Traditional/Modern/Rustic",
  "origin_country": "Country",
  "origin_region": "Region if known",
  "confidence": 0.85,
  "extraction_notes": "Any caveats or notes about sources",
  "source_citations": ["url1", "url2"]
}`;
}

/**
 * Parse AI response and extract structured recipe
 */
function parseAIResponse(
  content: string,
  sources: FetchedSource[],
  normalized: NormalizedQuery
): AIRecipeOutput {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }

    const parsed = JSON.parse(jsonStr);

    // Validate and normalize output
    const ingredients = normalizeIngredientsList(parsed.ingredients || []);
    const steps = (parsed.steps || []).map((s: string) => s.trim());
    const cookingTime = Math.max(1, Math.min(1440, parseInt(parsed.cooking_time) || 30));
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(parsed.difficulty)
      ? parsed.difficulty
      : 'Medium';

    // Build metadata
    const metadata: AIGeneratedRecipeMetadata = {
      model_version: process.env.AI_MODEL_VERSION || 'unknown',
      generated_at: new Date().toISOString(),
      ai_confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
      sources: sources.map(s => ({
        url: s.url,
        title: s.title,
        domain: s.domain,
        excerpt: s.snippet,
        trust_score: s.trust_score,
      })),
      normalization_details: {
        query_tokens: normalized.tokens,
        detected_country: normalized.detectedCountry,
        detected_ingredients: normalized.detectedIngredients,
      },
      extraction_notes: parsed.extraction_notes || '',
    };

    return {
      title: (parsed.title || 'Untitled Recipe').substring(0, 255),
      ingredients,
      steps,
      cooking_time: cookingTime,
      difficulty,
      servings: parsed.servings || 4,
      history: (parsed.history || 'No history provided').substring(0, 10000),
      platingStyle: (parsed.plating_style || 'Traditional').substring(0, 255),
      image: parsed.image || null,
      origin_country: (parsed.origin_country || '').substring(0, 100),
      origin_region: (parsed.origin_region || '').substring(0, 255),
      ai_metadata: metadata,
    };
  } catch (error) {
    console.error('[AI] Parse error:', error);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Safety filter for generated content
 * Checks for harmful, offensive, or suspicious patterns
 */
export async function runSafetyChecks(recipe: AIRecipeOutput): Promise<{
  passed: boolean;
  warnings: string[];
}> {
  const warnings: string[] = [];

  // Check title length and validity
  if (recipe.title.length < 3 || recipe.title.length > 255) {
    warnings.push('Recipe title is invalid length');
  }

  // Check ingredient count
  if (recipe.ingredients.length === 0) {
    warnings.push('No ingredients provided');
  } else if (recipe.ingredients.length > 100) {
    warnings.push('Too many ingredients');
  }

  // Check step count
  if (recipe.steps.length === 0) {
    warnings.push('No cooking steps provided');
  } else if (recipe.steps.length > 100) {
    warnings.push('Too many steps');
  }

  // Basic offensive content filter
  const offensive = [
    'poison', 'toxic', 'disease', 'harmful', 'deadly',
    'racial', 'ethnic slur', 'stereotype', 'offensive',
  ];
  const fullText = `${recipe.title} ${recipe.history} ${recipe.ingredients.join(' ')}`.toLowerCase();
  for (const word of offensive) {
    if (fullText.includes(word)) {
      warnings.push(`Potentially offensive content detected: "${word}"`);
    }
  }

  // Check confidence threshold
  if (recipe.ai_metadata.ai_confidence < 0.5) {
    warnings.push('Low confidence score (<0.5) - should be marked for mandatory review');
  }

  return {
    passed: warnings.length === 0,
    warnings,
  };
}
