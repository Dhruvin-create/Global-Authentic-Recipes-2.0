import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DiscoveredRecipe {
  title: string;
  origin_country: string;
  region?: string;
  cuisine: string;
  ingredients: string[];
  cooking_steps: string[];
  cooking_time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cultural_context: string;
  authenticity_status: 'ai_pending';
  image_url?: string;
  traditional_occasions?: string;
  history?: string;
}

interface DiscoveryResponse {
  success: boolean;
  recipes: DiscoveredRecipe[];
  query: string;
  count: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiscoveryResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      recipes: [],
      query: '',
      count: 0,
      error: 'Method not allowed'
    });
  }

  const { query, count = 6 } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      recipes: [],
      query: '',
      count: 0,
      error: 'Search query is required'
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      recipes: [],
      query,
      count: 0,
      error: 'AI service not configured'
    });
  }

  try {
    // Create a comprehensive research prompt
    const researchPrompt = `
You are a culinary expert and food historian. Research and provide ${count} authentic, traditional recipes related to: "${query}"

For each recipe, provide detailed information including:
1. Recipe name (with local language name if applicable)
2. Country and region of origin
3. Cuisine type
4. Complete ingredients list with measurements
5. Step-by-step cooking instructions
6. Cooking time in minutes
7. Difficulty level (Easy/Medium/Hard)
8. Rich cultural context and historical significance
9. Traditional occasions when this dish is served
10. Brief history or interesting facts about the dish

Focus on:
- Authenticity and cultural accuracy
- Traditional preparation methods
- Cultural respect and historical context
- Diverse geographic representation when possible
- Interesting cultural stories and significance

Return as a JSON array with this exact structure:
[
  {
    "title": "Recipe Name (Local Name if different)",
    "origin_country": "Country Name",
    "region": "Region/State/Province",
    "cuisine": "Cuisine Type",
    "ingredients": [
      "2 cups flour",
      "1 tsp salt",
      "ingredient with measurement"
    ],
    "cooking_steps": [
      "Step 1: Detailed instruction",
      "Step 2: Detailed instruction",
      "Continue with all steps"
    ],
    "cooking_time": 45,
    "difficulty": "Medium",
    "cultural_context": "Rich paragraph about cultural significance, history, and traditional context of this dish. Include when it's typically eaten, cultural importance, and any interesting historical facts.",
    "traditional_occasions": "When this dish is traditionally served",
    "history": "Brief historical background of the dish"
  }
]

Ensure all recipes are authentic, culturally respectful, and historically accurate. Avoid fusion or modern interpretations unless specifically requested.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: researchPrompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    const recipesData = JSON.parse(response.choices[0].message.content || '[]');
    
    // Transform and enhance the recipes
    const discoveredRecipes: DiscoveredRecipe[] = recipesData.map((recipe: any) => ({
      title: recipe.title || 'Unknown Recipe',
      origin_country: recipe.origin_country || 'Unknown',
      region: recipe.region || '',
      cuisine: recipe.cuisine || 'International',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      cooking_steps: Array.isArray(recipe.cooking_steps) ? recipe.cooking_steps : [],
      cooking_time: parseInt(recipe.cooking_time) || 60,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(recipe.difficulty) ? recipe.difficulty : 'Medium',
      cultural_context: recipe.cultural_context || '',
      authenticity_status: 'ai_pending' as const,
      traditional_occasions: recipe.traditional_occasions || '',
      history: recipe.history || '',
      // Generate appropriate food image URL based on the dish
      image_url: generateFoodImageUrl(recipe.title, recipe.cuisine)
    }));

    res.status(200).json({
      success: true,
      recipes: discoveredRecipes,
      query,
      count: discoveredRecipes.length
    });

  } catch (error) {
    console.error('Recipe discovery error:', error);
    
    // Check if it's a JSON parsing error and provide fallback
    if (error instanceof SyntaxError) {
      console.error('Failed to parse AI response as JSON');
    }
    
    res.status(500).json({
      success: false,
      recipes: [],
      query,
      count: 0,
      error: 'Failed to discover recipes. Please try again.'
    });
  }
}

// Helper function to generate appropriate food images
function generateFoodImageUrl(title: string, cuisine: string): string {
  // Use Unsplash with food-related search terms
  const searchTerms = [
    'food dish cooking',
    'traditional cuisine',
    'authentic recipe',
    'cultural food',
    'homemade cooking',
    'restaurant dish',
    'gourmet food',
    'ethnic cuisine'
  ];
  
  // Pick a random search term for variety
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  // Create Unsplash URL with food-related parameters
  return `https://images.unsplash.com/photo-${generateRandomPhotoId()}?auto=format&fit=crop&w=600&q=80&${encodeURIComponent(randomTerm)}`;
}

// Generate a random photo ID for variety (using known food photo IDs from Unsplash)
function generateRandomPhotoId(): string {
  const foodPhotoIds = [
    '1546548970-71785318a17b', // pasta
    '1565299624946-b28f40a0ca4b', // pizza
    '1567620905732-2d1ec7ab7445', // burger
    '1565958011703-00e3057c267a', // sushi
    '1563379091339-03fa5c78b842', // curry
    '1551782400-6ac27de7de51', // tacos
    '1574071318508-e2d94b78efb1', // ramen
    '1565299507177-b0ac66763828', // salad
    '1571091718767-18b5b1457add', // soup
    '1565299585323-38174788277c', // dessert
    '1567306226416-28f0efdc88ce', // bread
    '1565958011703-00e3057c267a', // rice dish
    '1574071318508-e2d94b78efb1', // noodles
    '1565299624946-b28f40a0ca4b', // cheese dish
    '1567620905732-2d1ec7ab7445'  // meat dish
  ];
  
  return foodPhotoIds[Math.floor(Math.random() * foodPhotoIds.length)];
}