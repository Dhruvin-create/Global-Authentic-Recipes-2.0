// Core Recipe Types for TheMealDB API Integration

export interface Recipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
  // Ingredients (up to 20)
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  // Measurements (up to 20)
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

export interface Ingredient {
  name: string;
  measure: string;
  id: string;
}

export interface ProcessedRecipe {
  id: string;
  title: string;
  category: string;
  area: string;
  instructions: string[];
  image: string;
  tags: string[];
  youtube?: string;
  source?: string;
  ingredients: Ingredient[];
  cookingTime?: number;
  servings: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  reviewCount?: number;
}

// API Response Types
export interface TheMealDBResponse {
  meals: Recipe[] | null;
}

export interface RandomMealResponse {
  meals: Recipe[];
}

export interface SearchResponse {
  meals: Recipe[] | null;
}

export interface CategoriesResponse {
  meals: Array<{
    strCategory: string;
  }>;
}

export interface AreasResponse {
  meals: Array<{
    strArea: string;
  }>;
}

export interface IngredientsResponse {
  meals: Array<{
    idIngredient: string;
    strIngredient: string;
    strDescription?: string;
    strType?: string;
  }>;
}

// UI State Types
export interface FilterState {
  category?: string;
  area?: string;
  ingredient?: string;
  searchQuery?: string;
  sortBy?: 'name' | 'category' | 'area' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  searchOpen: boolean;
  filters: FilterState;
  viewMode: 'grid' | 'list';
}

// User Preferences
export interface UserPreferences {
  favorites: string[];
  recentlyViewed: string[];
  shoppingList: ShoppingListItem[];
  servingPreferences: Record<string, number>;
  dietaryRestrictions: string[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  measure: string;
  recipeId: string;
  recipeTitle: string;
  checked: boolean;
  addedAt: Date;
}

// Cooking Mode Types
export interface CookingStep {
  id: string;
  instruction: string;
  duration?: number;
  temperature?: string;
  equipment?: string[];
  tips?: string[];
}

export interface CookingSession {
  recipeId: string;
  currentStep: number;
  startTime: Date;
  timers: Record<string, Timer>;
  servings: number;
}

export interface Timer {
  id: string;
  name: string;
  duration: number;
  startTime: Date;
  isActive: boolean;
  isCompleted: boolean;
}

// Search and Discovery Types
export interface SearchSuggestion {
  type: 'recipe' | 'ingredient' | 'category' | 'area';
  value: string;
  count?: number;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  results: number;
}

// Error Types
export interface APIError {
  message: string;
  status?: number;
  code?: string;
  timestamp: Date;
}

// Utility Types
export type RecipeCardVariant = 'default' | 'compact' | 'featured' | 'minimal';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

// Form Types
export interface RecipeFormData {
  title: string;
  category: string;
  area: string;
  instructions: string;
  ingredients: Ingredient[];
  image?: File;
  tags: string[];
  cookingTime?: number;
  servings: number;
  difficulty?: ProcessedRecipe['difficulty'];
}

// Analytics Types
export interface RecipeAnalytics {
  views: number;
  favorites: number;
  shares: number;
  cookingAttempts: number;
  averageRating: number;
  lastViewed: Date;
}

// PWA Types
export interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// JSON-LD Schema Types for SEO
export interface RecipeSchema {
  '@context': 'https://schema.org';
  '@type': 'Recipe';
  name: string;
  description: string;
  image: string[];
  author: {
    '@type': 'Organization';
    name: string;
  };
  datePublished: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeCategory: string;
  recipeCuisine: string;
  recipeYield: string;
  recipeIngredient: string[];
  recipeInstructions: Array<{
    '@type': 'HowToStep';
    text: string;
  }>;
  nutrition?: {
    '@type': 'NutritionInformation';
    calories?: string;
    servingSize?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}