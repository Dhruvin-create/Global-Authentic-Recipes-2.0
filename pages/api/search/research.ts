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

interface ResearchResult {
  id: string;
  title: string;
  origin_country?: string;
  cuisine?: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status?: string;
  cultural_context?: string;
  relevance_score?: number;
  match_type?: string;
  cultural_significance?: string;
  festival_connection?: string;
}

interface ResearchResponse {
  success: boolean;
  results: ResearchResult[];
  cultural_explanation?: string;
  related_topics?: string[];
  total: number;
  confidence_score?: number;
  sources?: string[];
  error?: string;
}

interface QueryAnalysis {
  intent: 'cultural_tradition' | 'festival_food' | 'ingredient_usage' | 'cooking_technique' | 'historical_context' | 'general_recipe';
  entities: {
    countries?: string[];
    festivals?: string[];
    ingredients?: string[];
    occasions?: string[];
    time_periods?: string[];
  };
  cultural_context: string;
  search_terms: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResearchResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      results: [],
      total: 0,
      error: 'Method not allowed'
    });
  }

  const { q, limit = '6' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 3) {
    return res.status(400).json({
      success: false,
      results: [],
      total: 0,
      error: 'Research query must be at least 3 characters long'
    });
  }

  const searchLimit = Math.min(parseInt(limit as string) || 6, 20);

  try {
    // Step 1: Analyze the natural language query
    const queryAnalysis = await analyzeQuery(q);
    
    // Step 2: Search for relevant recipes based on analysis
    const recipes = await searchRecipesByContext(queryAnalysis, searchLimit);
    
    // Step 3: Generate cultural explanation
    const culturalExplanation = await generateCulturalExplanation(q, queryAnalysis, recipes);
    
    // Step 4: Find related topics
    const relatedTopics = await findRelatedTopics(queryAnalysis);

    const response: ResearchResponse = {
      success: true,
      results: recipes,
      cultural_explanation: culturalExplanation,
      related_topics: relatedTopics,
      total: recipes.length,
      confidence_score: 0.85, // TODO: Calculate based on query analysis and results
      sources: ['Internal Recipe Database', 'Cultural Knowledge Base']
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({
      success: false,
      results: [],
      total: 0,
      error: 'Internal server error'
    });
  }
}

async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  try {
    const prompt = `
Analyze this food culture research query and extract structured information:

Query: "${query}"

Extract and return JSON with:
1. intent: One of [cultural_tradition, festival_food, ingredient_usage, cooking_technique, historical_context, general_recipe]
2. entities: {
   countries: [list of countries mentioned],
   festivals: [list of festivals/holidays mentioned],
   ingredients: [list of ingredients mentioned],
   occasions: [list of occasions/events mentioned],
   time_periods: [list of historical periods mentioned]
}
3. cultural_context: Brief description of the cultural context
4. search_terms: [list of key terms to search for in recipes]

Examples:
- "What do people eat in Morocco during Ramadan?" → intent: festival_food, countries: ["Morocco"], festivals: ["Ramadan"]
- "Traditional Italian pasta techniques" → intent: cooking_technique, countries: ["Italy"], ingredients: ["pasta"]
- "Ancient Roman cooking methods" → intent: historical_context, countries: ["Italy"], time_periods: ["Ancient Rome"]

Return only valid JSON.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return analysis;
  } catch (error) {
    console.error('Query analysis failed:', error);
    // Fallback analysis
    return {
      intent: 'general_recipe',
      entities: {
        search_terms: query.split(' ').filter(word => word.length > 2)
      },
      cultural_context: 'General food inquiry',
      search_terms: query.split(' ').filter(word => word.length > 2)
    };
  }
}

async function searchRecipesByContext(analysis: QueryAnalysis, limit: number): Promise<ResearchResult[]> {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Build search conditions based on analysis
    let conditions: string[] = [];
    let params: any[] = [];

    // Add country conditions
    if (analysis.entities.countries && analysis.entities.countries.length > 0) {
      conditions.push(`r.origin_country IN (${analysis.entities.countries.map(() => '?').join(', ')})`);
      params.push(...analysis.entities.countries);
    }

    // Add festival conditions
    if (analysis.entities.festivals && analysis.entities.festivals.length > 0) {
      const festivalConditions = analysis.entities.festivals.map(() => 'r.festivals LIKE ?').join(' OR ');
      conditions.push(`(${festivalConditions})`);
      params.push(...analysis.entities.festivals.map(festival => `%${festival}%`));
    }

    // Add ingredient conditions
    if (analysis.entities.ingredients && analysis.entities.ingredients.length > 0) {
      const ingredientConditions = analysis.entities.ingredients.map(() => 'r.ingredients LIKE ?').join(' OR ');
      conditions.push(`(${ingredientConditions})`);
      params.push(...analysis.entities.ingredients.map(ingredient => `%${ingredient}%`));
    }

    // Add search term conditions
    if (analysis.search_terms && analysis.search_terms.length > 0) {
      const searchConditions = analysis.search_terms.map(() => 
        '(r.title LIKE ? OR r.cultural_context LIKE ? OR r.description LIKE ?)'
      ).join(' OR ');
      conditions.push(`(${searchConditions})`);
      
      analysis.search_terms.forEach(term => {
        const searchTerm = `%${term}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      });
    }

    const whereClause = conditions.length > 0 ? `AND (${conditions.join(' OR ')})` : '';

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
        r.cultural_context,
        r.festivals,
        r.cultural_significance,
        r.description,
        CASE 
          WHEN r.authenticity_status = 'verified' THEN 100
          WHEN r.authenticity_status = 'community' THEN 80
          ELSE 60
        END as relevance_score
      FROM recipes r
      WHERE r.status = 'published'
      ${whereClause}
      ORDER BY 
        relevance_score DESC,
        r.popularity_score DESC,
        r.created_at DESC
      LIMIT ?
    `;

    params.push(limit);

    const [rows] = await connection.execute(searchQuery, params);
    
    const results = (rows as any[]).map(row => ({
      id: row.id.toString(),
      title: row.title,
      origin_country: row.origin_country,
      cuisine: row.cuisine,
      image: row.image,
      cooking_time: row.cooking_time?.toString(),
      difficulty: row.difficulty,
      authenticity_status: row.authenticity_status,
      cultural_context: row.cultural_context,
      relevance_score: row.relevance_score / 100,
      match_type: 'cultural_context',
      cultural_significance: row.cultural_significance,
      festival_connection: row.festivals
    }));

    return results;
  } finally {
    await connection.end();
  }
}

async function generateCulturalExplanation(
  originalQuery: string, 
  analysis: QueryAnalysis, 
  recipes: ResearchResult[]
): Promise<string> {
  try {
    const recipeContext = recipes.map(r => 
      `${r.title} (${r.origin_country}): ${r.cultural_context || 'Traditional recipe'}`
    ).join('\n');

    const prompt = `
Based on the user's question about food culture and the relevant recipes found, provide a culturally respectful and informative explanation.

User Question: "${originalQuery}"

Query Analysis: ${JSON.stringify(analysis, null, 2)}

Relevant Recipes Found:
${recipeContext}

Provide a comprehensive but concise explanation (2-3 paragraphs) that:
1. Directly answers the user's cultural food question
2. Provides historical and cultural context
3. Mentions specific recipes when relevant
4. Is respectful and accurate about cultural traditions
5. Avoids stereotypes or oversimplifications

Focus on authentic cultural information and the significance of food in cultural practices.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800
    });

    return response.choices[0].message.content || 'Cultural information is being researched. Please try again shortly.';
  } catch (error) {
    console.error('Cultural explanation generation failed:', error);
    return 'Cultural information is being researched. Please try again shortly.';
  }
}

async function findRelatedTopics(analysis: QueryAnalysis): Promise<string[]> {
  const topics: string[] = [];

  // Add country-related topics
  if (analysis.entities.countries) {
    analysis.entities.countries.forEach(country => {
      topics.push(`Traditional ${country} cuisine`);
      topics.push(`${country} cooking techniques`);
    });
  }

  // Add festival-related topics
  if (analysis.entities.festivals) {
    analysis.entities.festivals.forEach(festival => {
      topics.push(`${festival} traditional foods`);
      topics.push(`${festival} recipes`);
    });
  }

  // Add ingredient-related topics
  if (analysis.entities.ingredients) {
    analysis.entities.ingredients.forEach(ingredient => {
      topics.push(`Traditional uses of ${ingredient}`);
      topics.push(`${ingredient} in world cuisines`);
    });
  }

  // Add intent-based topics
  switch (analysis.intent) {
    case 'cultural_tradition':
      topics.push('Food traditions around the world', 'Cultural significance of food');
      break;
    case 'festival_food':
      topics.push('Holiday foods', 'Celebration recipes', 'Religious food traditions');
      break;
    case 'cooking_technique':
      topics.push('Traditional cooking methods', 'Ancient cooking techniques');
      break;
    case 'historical_context':
      topics.push('History of cuisine', 'Ancient recipes', 'Food through the ages');
      break;
  }

  return topics.slice(0, 6); // Return top 6 related topics
}