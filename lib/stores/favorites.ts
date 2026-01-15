// Favorites Store with localStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProcessedRecipe } from '../types';

interface FavoritesState {
  favorites: string[];
  favoriteRecipes: ProcessedRecipe[];
  
  // Actions
  addFavorite: (recipeId: string, recipe?: ProcessedRecipe) => void;
  removeFavorite: (recipeId: string) => void;
  toggleFavorite: (recipeId: string, recipe?: ProcessedRecipe) => void;
  isFavorite: (recipeId: string) => boolean;
  clearFavorites: () => void;
  
  // Bulk operations
  addMultipleFavorites: (recipeIds: string[]) => void;
  removeMultipleFavorites: (recipeIds: string[]) => void;
  
  // Getters
  getFavoriteCount: () => number;
  getFavoriteRecipes: () => ProcessedRecipe[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteRecipes: [],

      addFavorite: (recipeId: string, recipe?: ProcessedRecipe) => {
        const { favorites, favoriteRecipes } = get();
        
        if (!favorites.includes(recipeId)) {
          const newFavorites = [...favorites, recipeId];
          const newFavoriteRecipes = recipe 
            ? [...favoriteRecipes, recipe]
            : favoriteRecipes;
          
          set({ 
            favorites: newFavorites,
            favoriteRecipes: newFavoriteRecipes
          });
        }
      },

      removeFavorite: (recipeId: string) => {
        const { favorites, favoriteRecipes } = get();
        
        set({
          favorites: favorites.filter(id => id !== recipeId),
          favoriteRecipes: favoriteRecipes.filter(recipe => recipe.id !== recipeId)
        });
      },

      toggleFavorite: (recipeId: string, recipe?: ProcessedRecipe) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        
        if (isFavorite(recipeId)) {
          removeFavorite(recipeId);
        } else {
          addFavorite(recipeId, recipe);
        }
      },

      isFavorite: (recipeId: string) => {
        return get().favorites.includes(recipeId);
      },

      clearFavorites: () => {
        set({ favorites: [], favoriteRecipes: [] });
      },

      addMultipleFavorites: (recipeIds: string[]) => {
        const { favorites } = get();
        const newFavorites = [...new Set([...favorites, ...recipeIds])];
        set({ favorites: newFavorites });
      },

      removeMultipleFavorites: (recipeIds: string[]) => {
        const { favorites, favoriteRecipes } = get();
        
        set({
          favorites: favorites.filter(id => !recipeIds.includes(id)),
          favoriteRecipes: favoriteRecipes.filter(recipe => !recipeIds.includes(recipe.id))
        });
      },

      getFavoriteCount: () => {
        return get().favorites.length;
      },

      getFavoriteRecipes: () => {
        return get().favoriteRecipes;
      }
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        favorites: state.favorites,
        favoriteRecipes: state.favoriteRecipes 
      }),
    }
  )
);