// SWR Hooks for Recipe Data Fetching with Caching and Error Handling

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { api } from '../lib/api';
import { ProcessedRecipe } from '../lib/types';

// SWR Configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 30000, // 30 seconds
  errorRetryCount: 2,
  errorRetryInterval: 3000,
  loadingTimeout: 10000,
  onError: (error: any) => {
    console.error('SWR Error:', error)
  }
};

// Cache keys
const CACHE_KEYS = {
  randomRecipes: (count: number) => `random-recipes-${count}`,
  searchRecipes: (query: string) => `search-recipes-${query}`,
  recipeById: (id: string) => `recipe-${id}`,
  recipesByCategory: (category: string) => `recipes-category-${category}`,
  recipesByArea: (area: string) => `recipes-area-${area}`,
  recipesByLetter: (letter: string) => `recipes-letter-${letter}`,
  categories: 'categories',
  areas: 'areas',
} as const;

// Random Recipes Hook
export function useRandomRecipes(count: number = 3) {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.randomRecipes(count),
    () => api.getRandomRecipes(count),
    {
      ...swrConfig,
      refreshInterval: 300000, // Refresh every 5 minutes for random recipes
    }
  );

  return {
    recipes: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Search Recipes Hook
export function useSearchRecipes(query: string) {
  const { data, error, isLoading, mutate } = useSWR(
    query.trim() ? CACHE_KEYS.searchRecipes(query.trim()) : null,
    () => query.trim() ? api.searchRecipes(query.trim()) : Promise.resolve([]),
    {
      ...swrConfig,
      keepPreviousData: true,
    }
  );

  return {
    recipes: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Recipe by ID Hook
export function useRecipe(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? CACHE_KEYS.recipeById(id) : null,
    () => id ? api.getRecipeById(id) : null,
    swrConfig
  );

  return {
    recipe: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Recipes by Category Hook
export function useRecipesByCategory(category: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    category ? CACHE_KEYS.recipesByCategory(category) : null,
    () => category ? api.getRecipesByCategory(category) : null,
    swrConfig
  );

  return {
    recipes: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Recipes by Area Hook
export function useRecipesByArea(area: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    area ? CACHE_KEYS.recipesByArea(area) : null,
    () => area ? api.getRecipesByArea(area) : null,
    swrConfig
  );

  return {
    recipes: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Categories Hook
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.categories,
    api.getCategories,
    {
      ...swrConfig,
      refreshInterval: 86400000, // Refresh once per day
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Areas Hook
export function useAreas() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.areas,
    api.getAreas,
    {
      ...swrConfig,
      refreshInterval: 86400000, // Refresh once per day
    }
  );

  return {
    areas: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Infinite Scroll Hook for Recipe Lists
export function useInfiniteRecipes(
  type: 'category' | 'area' | 'letter' | 'search',
  value: string,
  pageSize: number = 12
) {
  const getKey = (pageIndex: number, previousPageData: ProcessedRecipe[] | null) => {
    // If no more data, return null to stop fetching
    if (previousPageData && previousPageData.length < pageSize) return null;
    
    // Return cache key for this page
    return `${type}-${value}-page-${pageIndex}`;
  };

  const fetcher = async (key: string) => {
    const parts = key.split('-');
    const pageIndex = parts[parts.length - 1];
    const page = parseInt(pageIndex || '0');
    
    let allRecipes: ProcessedRecipe[] = [];
    
    switch (type) {
      case 'category':
        allRecipes = await api.getRecipesByCategory(value);
        break;
      case 'area':
        allRecipes = await api.getRecipesByArea(value);
        break;
      case 'letter':
        allRecipes = await api.getRecipesByLetter(value);
        break;
      case 'search':
        allRecipes = await api.searchRecipes(value);
        break;
      default:
        return [];
    }
    
    // Simulate pagination by slicing the results
    const start = page * pageSize;
    const end = start + pageSize;
    return allRecipes.slice(start, end);
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      ...swrConfig,
      revalidateFirstPage: false,
    }
  );

  const recipes = data ? data.flat() : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1] && data[data.length - 1]!.length < pageSize);

  return {
    recipes,
    isLoading,
    isLoadingMore,
    isError: !!error,
    error,
    isEmpty,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
    refresh: mutate,
    size,
  };
}

// Multiple Recipes Hook (for batch fetching)
export function useMultipleRecipes(ids: string[]) {
  const { data, error, isLoading, mutate } = useSWR(
    ids.length > 0 ? `multiple-recipes-${ids.join(',')}` : null,
    async () => {
      const promises = ids.map(id => api.getRecipeById(id));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<ProcessedRecipe | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value as ProcessedRecipe);
    },
    swrConfig
  );

  return {
    recipes: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Recipe Suggestions Hook (based on current recipe)
export function useRecipeSuggestions(currentRecipe: ProcessedRecipe | null) {
  const { data, error, isLoading, mutate } = useSWR(
    currentRecipe ? `suggestions-${currentRecipe.id}` : null,
    async () => {
      if (!currentRecipe) return [];
      
      // Get recipes from same category or area
      const [categoryRecipes, areaRecipes] = await Promise.all([
        api.getRecipesByCategory(currentRecipe.category),
        api.getRecipesByArea(currentRecipe.area),
      ]);
      
      // Combine and filter out current recipe
      const allSuggestions = [...categoryRecipes, ...areaRecipes]
        .filter(recipe => recipe && recipe.id !== currentRecipe.id);
      
      // Remove duplicates and limit to 6 suggestions
      const uniqueSuggestions = allSuggestions.filter(
        (recipe, index, self) => self.findIndex(r => r.id === recipe.id) === index
      );
      
      return uniqueSuggestions.slice(0, 6);
    },
    swrConfig
  );

  return {
    suggestions: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Preload function for better UX
export function preloadRecipe(id: string) {
  return api.getRecipeById(id);
}

export function preloadRecipesByCategory(category: string) {
  return api.getRecipesByCategory(category);
}

export function preloadRecipesByArea(area: string) {
  return api.getRecipesByArea(area);
}