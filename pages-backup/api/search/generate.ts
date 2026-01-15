import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import OpenAI from 'openai';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipes_db',
  charset: 'utf8mb4'
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExternalSource {
  type: string;
  url?: string;
  content: string;
  reliability: 'high' | 'medium' | 'low';
}

interface GeneratedRecipe {
  title: string;
  description: string;
  origin_country: string;
  cuisine: string;
  cultural_context: string;
  cultural_significance: string;
  ingredients: any[];
  instructions: string[];
  cooking_time: number;
  prep_time: number;
  difficulty: string;
  servings: number;
  dietary_tags: string[];
  festivals: string[];
  confidence_score: number;
  sources: ExternalSource[];
}

interface GenerationResponse {
  success: boolean;
  recipe?: GeneratedRecipe;
  job_id: string;
  status: 'completed' | 'failed' | 'processing';
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      job_id: '',
      status: 'failed',
      message: 'Method not allowed',
      error: 'Only POST requests are allowed'
    });
  }

  const { query, user_id } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res.status(400).json({
      success: false,
      job_id: '',
      status: 'failed',
      message: 'Invalid query',
      error: 'Recipe query must be at least 3 characters long'
    });
  }

  const jobId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Step 1: Analyze the recipe query
    const analysis = await analyzeRecipeQuery(query);
    
    // Step 2: Check if recipe already exists
    const existingRecipe = await checkExistingRecipe(analysis.dishName, analysis.country);
    if (existingRecipe) {
      return res.status(200).json({
        success: false,
        job_id: jobId,
        status: 'failed',
        message: `Recipe for ${analysis.dishName} already exists in our database.`
      });
    }

    // Step 3: Fetch data from external sources
    const sources = await fetchExternalSources(analysis);
    
    // Step 4: Generate recipe using LLM
    const generatedRecipe = await generateRecipeWithLLM(analysis, sources);
    
    // Step 5: Validate and score the generated recipe
    const validation = await validateGeneratedRecipe(generatedRecipe);
    
    if (validation.isValid) {
      // Step 6: Store the generated recipe
      const recipeId = await storeGeneratedRecipe(generatedRecipe, jobId, user_id);
      
      return res.status(200).json({
        success: true,
        recipe: generatedRecipe,
        job_id: jobId,
        status: 'completed',
        message: `Successfully generated recipe for ${generatedRecipe.title}`
      });
    } else {
      return res.status(200).json({
        success: false,
        job_id: jobId,
        status: 'failed',
        message: `Recipe generation failed validation: ${validation.issues.join(', ')}`
      });
    }

  } catch (error) {
    console.error('Recipe generation error:', error);
    return res.status(500).json({
      success: false,
      job_id: jobId,
      status: 'failed',
      message: 'Recipe generation failed',
      error: 'Internal server error'
    });
  }
}

interface RecipeAnalysis {
  dishName: string;
  country: string;
  cuisine: string;
  culturalContext: string;
  keyIngredients: string[];
  cookingMethod: string;
}

async function analyzeRecipeQuery(query: string): Promise<RecipeAnalysis> {
  const prompt = `
Analyze this recipe request and extract structured information:

Query: "${query}"

Extract and return JSON with:
1. dishName: The specific name of the dish
2. country: The country of origin
3. cuisine: The cuisine type (e.g., Italian, Chinese, Mexican)
4. culturalContext: Brief cultural background
5. keyIngredients: List of likely main ingredients
6. cookingMethod: Primary cooking method (e.g., baked, fried, steamed)

Example:
"Ethiopian Injera" → {
  "dishName": "Injera",
  "country": "Ethiopia",
  "cuisine": "Ethiopian",
  "culturalContext": "Traditional Ethiopian sourdough flatbread",
  "keyIngredients": ["teff flour", "water"],
  "cookingMethod": "fermented and cooked on griddle"
}

Return only valid JSON.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 400
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

async function checkExistingRecipe(dishName: string, country: string): Promise<boolean> {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rows] = await connection.execute(
      'SELECT id FROM recipes WHERE title LIKE ? AND origin_country = ? LIMIT 1',
      [`%${dishName}%`, country]
    );
    
    return (rows as any[]).length > 0;
  } finally {
    await connection.end();
  }
}

async function fetchExternalSources(analysis: RecipeAnalysis): Promise<ExternalSource[]> {
  const sources: ExternalSource[] = [];

  try {
    // Simulate Wikipedia API call for cultural context
    // In production, you would make actual API calls
    const wikipediaContent = `${analysis.dishName} is a traditional ${analysis.cuisine} dish from ${analysis.country}. ${analysis.culturalContext}`;
    
    sources.push({
      type: 'wikipedia',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(analysis.dishName)}`,
      content: wikipediaContent,
      reliability: 'high'
    });

    // Simulate recipe database API call
    const recipeContent = `Traditional recipe for ${analysis.dishName} typically includes ${analysis.keyIngredients.join(', ')} and is prepared using ${analysis.cookingMethod}.`;
    
    sources.push({
      type: 'recipe_database',
      content: recipeContent,
      reliability: 'medium'
    });

  } catch (error) {
    console.error('External source fetch failed:', error);
  }

  return sources;
}

async function generateRecipeWithLLM(analysis: RecipeAnalysis, sources: ExternalSource[]): Promise<GeneratedRecipe> {
  const sourceContext = sources.map(s => `${s.type}: ${s.content}`).join('\n\n');

  const prompt = `
Create an authentic recipe for ${analysis.dishName} from ${analysis.country}.

Context from sources:
${sourceContext}

Requirements:
1. Be culturally accurate and respectful
2. Include proper ingredient measurements
3. Provide clear step-by-step instructions
4. Include cultural significance and context
5. Specify cooking and prep times
6. Include dietary information and serving size

Return a JSON object with this exact structure:
{
  "title": "Recipe name",
  "description": "Brief description",
  "origin_country": "Country name",
  "cuisine": "Cuisine type",
  "cultural_context": "Cultural background and significance",
  "cultural_significance": "Why this dish is important culturally",
  "ingredients": [
    {"name": "ingredient name", "amount": "quantity", "unit": "measurement", "notes": "optional notes"}
  ],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "cooking_time": 30,
  "prep_time": 15,
  "difficulty": "Easy|Medium|Hard",
  "servings": 4,
  "dietary_tags": ["vegetarian", "gluten-free", etc],
  "festivals": ["associated festivals or occasions"],
  "confidence_score": 0.85
}

Ensure all measurements are precise and instructions are clear and detailed.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 2000
  });

  const recipe = JSON.parse(response.choices[0].message.content || '{}');
  recipe.sources = sources;
  
  return recipe;
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  confidenceScore: number;
}

async function validateGeneratedRecipe(recipe: GeneratedRecipe): Promise<ValidationResult> {
  const issues: string[] = [];
  let confidenceScore = recipe.confidence_score || 0.5;

  // Validate required fields
  if (!recipe.title || recipe.title.length < 3) {
    issues.push('Recipe title is missing or too short');
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    issues.push('Recipe must have ingredients');
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    issues.push('Recipe must have instructions');
  }

  if (!recipe.origin_country) {
    issues.push('Origin country is required');
  }

  // Validate ingredient structure
  if (recipe.ingredients) {
    recipe.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name) {
        issues.push(`Ingredient ${index + 1} is missing name`);
      }
      if (!ingredient.amount && !ingredient.unit) {
        issues.push(`Ingredient ${index + 1} is missing measurements`);
      }
    });
  }

  // Validate cooking times
  if (recipe.cooking_time && (recipe.cooking_time < 1 || recipe.cooking_time > 1440)) {
    issues.push('Cooking time seems unrealistic');
  }

  if (recipe.prep_time && (recipe.prep_time < 1 || recipe.prep_time > 480)) {
    issues.push('Prep time seems unrealistic');
  }

  // Adjust confidence based on validation
  if (issues.length === 0) {
    confidenceScore = Math.min(confidenceScore + 0.1, 1.0);
  } else {
    confidenceScore = Math.max(confidenceScore - (issues.length * 0.1), 0.1);
  }

  return {
    isValid: issues.length === 0,
    issues,
    confidenceScore
  };
}

async function storeGeneratedRecipe(recipe: GeneratedRecipe, jobId: string, userId?: string): Promise<number> {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    // Insert main recipe
    const [recipeResult] = await connection.execute(`
      INSERT INTO recipes (
        title, description, origin_country, cuisine, cultural_context,
        cultural_significance, ingredients, instructions, cooking_time,
        prep_time, difficulty, servings, dietary_tags, festivals,
        authenticity_status, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      recipe.title,
      recipe.description,
      recipe.origin_country,
      recipe.cuisine,
      recipe.cultural_context,
      recipe.cultural_significance,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.instructions),
      recipe.cooking_time,
      recipe.prep_time,
      recipe.difficulty,
      recipe.servings,
      JSON.stringify(recipe.dietary_tags),
      JSON.stringify(recipe.festivals),
      'auto-generated (pending review)',
      'draft'
    ]);

    const recipeId = (recipeResult as any).insertId;

    // Insert generation tracking record
    await connection.execute(`
      INSERT INTO generated_recipes (
        recipe_id, generation_prompt, confidence_score, sources,
        review_status, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `, [
      recipeId,
      jobId,
      recipe.confidence_score,
      JSON.stringify(recipe.sources),
      'pending'
    ]);

    await connection.commit();
    return recipeId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}