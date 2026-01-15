// TheMealDB API Integration with Error Handling and Response Transformation

import { 
  Recipe, 
  ProcessedRecipe, 
  Ingredient, 
  TheMealDBResponse, 
  RandomMealResponse, 
  SearchResponse, 
  CategoriesResponse, 
  AreasResponse
} from './types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// API Error Class
class TheMealDBError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TheMealDBError';
  }
}

// Generic API fetch wrapper with error handling
async function apiRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Use default cache for production
      cache: 'default',
    });

    if (!response.ok) {
      throw new TheMealDBError(
        `API request failed: ${response.statusText}`,
        response.status,
        'FETCH_ERROR'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TheMealDBError) {
      throw error;
    }
    
    // Network or parsing errors
    throw new TheMealDBError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'NETWORK_ERROR'
    );
  }
}

// Transform raw recipe data to processed format
function transformRecipe(recipe: Recipe): ProcessedRecipe {
  // Extract ingredients and measurements
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}` as keyof Recipe] as string;
    const measure = recipe[`strMeasure${i}` as keyof Recipe] as string;
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        id: `${recipe.idMeal}-ingredient-${i}`,
        name: ingredient.trim(),
        measure: measure?.trim() || '',
      });
    }
  }

  // Split instructions into steps
  const instructions = recipe.strInstructions
    .split(/\r?\n/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim());

  // Parse tags
  const tags = recipe.strTags 
    ? recipe.strTags.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];

  // Estimate cooking time based on instructions length and complexity
  const estimateCookingTime = (instructions: string[]): number => {
    const totalLength = instructions.join(' ').length;
    const complexityWords = ['marinate', 'chill', 'rest', 'overnight', 'hours'];
    const hasComplexity = instructions.some(step => 
      complexityWords.some(word => step.toLowerCase().includes(word))
    );
    
    if (hasComplexity) return 120; // 2 hours for complex recipes
    if (totalLength > 1000) return 60; // 1 hour for detailed recipes
    if (totalLength > 500) return 30; // 30 minutes for medium recipes
    return 15; // 15 minutes for simple recipes
  };

  // Estimate difficulty based on ingredients count and instructions complexity
  const estimateDifficulty = (ingredients: Ingredient[], instructions: string[]): ProcessedRecipe['difficulty'] => {
    const ingredientCount = ingredients.length;
    const instructionComplexity = instructions.join(' ').toLowerCase();
    const complexTerms = ['fold', 'whisk', 'sauté', 'braise', 'julienne', 'emulsify'];
    const hasComplexTerms = complexTerms.some(term => instructionComplexity.includes(term));
    
    if (ingredientCount > 15 || hasComplexTerms) return 'Hard';
    if (ingredientCount > 8) return 'Medium';
    return 'Easy';
  };

  return {
    id: recipe.idMeal,
    title: recipe.strMeal,
    category: recipe.strCategory,
    area: recipe.strArea,
    instructions,
    image: recipe.strMealThumb,
    tags,
    youtube: recipe.strYoutube || undefined,
    source: recipe.strSource || undefined,
    ingredients,
    cookingTime: estimateCookingTime(instructions),
    servings: 4, // Default serving size
    difficulty: estimateDifficulty(ingredients, instructions),
    rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5 for demo
    reviewCount: Math.floor(Math.random() * 500) + 50, // Random review count for demo
  };
}

// API Functions
export const api = {
  // Get random recipes
  async getRandomRecipes(count: number = 3): Promise<ProcessedRecipe[]> {
    try {
      const promises = Array.from({ length: count }, () => 
        apiRequest<RandomMealResponse>('/random.php')
      );
      
      const responses = await Promise.all(promises);
      const recipes = responses
        .map(response => response.meals[0])
        .filter((meal): meal is Recipe => Boolean(meal))
        .map(meal => transformRecipe(meal));
      
      return recipes;
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      return getFallbackRecipes().slice(0, count);
    }
  },

  // Search recipes by name
  async searchRecipes(query: string): Promise<ProcessedRecipe[]> {
    if (!query.trim()) return [];
    
    try {
      const response = await apiRequest<SearchResponse>(`/search.php?s=${encodeURIComponent(query)}`);
      
      if (!response.meals) {
        return [];
      }
      
      return response.meals.map(meal => transformRecipe(meal));
    } catch (error) {
      console.error('Error searching recipes:', error);
      return getFallbackRecipes().filter(recipe => 
        recipe.title.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Get recipe by ID
  async getRecipeById(id: string): Promise<ProcessedRecipe | null> {
    try {
      const response = await apiRequest<TheMealDBResponse>(`/lookup.php?i=${id}`);
      
      if (!response.meals || response.meals.length === 0) {
        return null;
      }
      
      const recipe = response.meals[0];
      if (!recipe) {
        return null;
      }
      
      return transformRecipe(recipe);
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      return getFallbackRecipes().find(recipe => recipe.id === id) || null;
    }
  },

  // Get recipes by category
  async getRecipesByCategory(category: string): Promise<ProcessedRecipe[]> {
    try {
      const response = await apiRequest<TheMealDBResponse>(`/filter.php?c=${encodeURIComponent(category)}`);
      
      if (!response.meals) {
        return [];
      }
      
      // Note: Category filter returns limited data, need to fetch full details
      const detailedRecipes = await Promise.all(
        response.meals.slice(0, 12).map(async (meal) => {
          try {
            return await this.getRecipeById(meal.idMeal);
          } catch {
            return null;
          }
        })
      );
      
      return detailedRecipes.filter((recipe): recipe is ProcessedRecipe => recipe !== null);
    } catch (error) {
      console.error('Error fetching recipes by category:', error);
      return getFallbackRecipes().filter(recipe => 
        recipe.category.toLowerCase() === category.toLowerCase()
      );
    }
  },

  // Get recipes by area/cuisine
  async getRecipesByArea(area: string): Promise<ProcessedRecipe[]> {
    try {
      const response = await apiRequest<TheMealDBResponse>(`/filter.php?a=${encodeURIComponent(area)}`);
      
      if (!response.meals) {
        return [];
      }
      
      // Fetch detailed data for first 12 recipes
      const detailedRecipes = await Promise.all(
        response.meals.slice(0, 12).map(async (meal) => {
          try {
            return await this.getRecipeById(meal.idMeal);
          } catch {
            return null;
          }
        })
      );
      
      return detailedRecipes.filter((recipe): recipe is ProcessedRecipe => recipe !== null);
    } catch (error) {
      console.error('Error fetching recipes by area:', error);
      return getFallbackRecipes().filter(recipe => 
        recipe.area.toLowerCase() === area.toLowerCase()
      );
    }
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiRequest<CategoriesResponse>('/list.php?c=list');
      return response.meals.map(item => item.strCategory);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [
        'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 
        'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 
        'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
      ];
    }
  },

  // Get all areas/cuisines
  async getAreas(): Promise<string[]> {
    try {
      const response = await apiRequest<AreasResponse>('/list.php?a=list');
      return response.meals.map(item => item.strArea);
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [
        'American', 'British', 'Canadian', 'Chinese', 'Croatian', 
        'Dutch', 'Egyptian', 'French', 'Greek', 'Indian', 
        'Irish', 'Italian', 'Jamaican', 'Japanese', 'Kenyan', 
        'Malaysian', 'Mexican', 'Moroccan', 'Polish', 'Portuguese', 
        'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish', 'Vietnamese'
      ];
    }
  },

  // Get recipes by first letter
  async getRecipesByLetter(letter: string): Promise<ProcessedRecipe[]> {
    try {
      const response = await apiRequest<TheMealDBResponse>(`/search.php?f=${letter}`);
      
      if (!response.meals) {
        return [];
      }
      
      return response.meals.map(meal => transformRecipe(meal));
    } catch (error) {
      console.error('Error fetching recipes by letter:', error);
      return getFallbackRecipes().filter(recipe => 
        recipe.title.toLowerCase().startsWith(letter.toLowerCase())
      );
    }
  }
};

// Fallback recipes for offline/error scenarios
function getFallbackRecipes(): ProcessedRecipe[] {
  return [
    {
      id: 'fallback-1',
      title: 'Classic Spaghetti Carbonara',
      category: 'Pasta',
      area: 'Italian',
      instructions: [
        'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
        'While pasta cooks, whisk eggs and cheese in a large bowl.',
        'Cook pancetta in a large skillet until crispy.',
        'Drain pasta, reserving 1 cup pasta water.',
        'Add hot pasta to egg mixture, tossing quickly to create creamy sauce.',
        'Add pancetta and pasta water as needed.',
        'Season with black pepper and serve immediately.'
      ],
      image: '/images/fallback-carbonara.jpg',
      tags: ['Quick', 'Easy', 'Comfort Food'],
      ingredients: [
        { id: '1', name: 'Spaghetti', measure: '400g' },
        { id: '2', name: 'Eggs', measure: '3 large' },
        { id: '3', name: 'Parmesan cheese', measure: '100g grated' },
        { id: '4', name: 'Pancetta', measure: '150g diced' },
        { id: '5', name: 'Black pepper', measure: 'to taste' }
      ],
      cookingTime: 20,
      servings: 4,
      difficulty: 'Medium',
      rating: 4.5,
      reviewCount: 234
    },
    // Add more fallback recipes as needed...
  ];
}

// Export utility functions
export { TheMealDBError };
export default api;