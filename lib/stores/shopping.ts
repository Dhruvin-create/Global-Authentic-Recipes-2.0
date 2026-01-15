// Shopping List Store for ingredient management

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShoppingListItem, Ingredient, ProcessedRecipe } from '../types';

interface ShoppingState {
  items: ShoppingListItem[];
  
  // Actions
  addItem: (ingredient: Ingredient, recipeId: string, recipeTitle: string) => void;
  addItems: (ingredients: Ingredient[], recipeId: string, recipeTitle: string) => void;
  addRecipeToShoppingList: (recipe: ProcessedRecipe, servings?: number) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (itemId: string) => void;
  clearList: () => void;
  clearCheckedItems: () => void;
  
  // Bulk operations
  checkAllItems: () => void;
  uncheckAllItems: () => void;
  removeCheckedItems: () => void;
  
  // Recipe operations
  addRecipeIngredients: (ingredients: Ingredient[], recipeId: string, recipeTitle: string) => void;
  removeRecipeIngredients: (recipeId: string) => void;
  
  // Getters
  getItemCount: () => number;
  getCheckedCount: () => number;
  getUncheckedCount: () => number;
  getItemsByRecipe: (recipeId: string) => ShoppingListItem[];
  getUniqueRecipes: () => Array<{ id: string; title: string; itemCount: number }>;
  
  // Utility
  consolidateItems: () => void;
  exportList: () => string;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (ingredient, recipeId, recipeTitle) => {
        const { items } = get();
        
        // Check if item already exists (same ingredient from same recipe)
        const existingItem = items.find(
          item => item.name.toLowerCase() === ingredient.name.toLowerCase() && 
                  item.recipeId === recipeId
        );
        
        if (existingItem) {
          // Update existing item measure if different
          if (existingItem.measure !== ingredient.measure) {
            set({
              items: items.map(item =>
                item.id === existingItem.id
                  ? { ...item, measure: `${existingItem.measure}, ${ingredient.measure}` }
                  : item
              )
            });
          }
          return;
        }
        
        const newItem: ShoppingListItem = {
          id: `${recipeId}-${ingredient.id}-${Date.now()}`,
          name: ingredient.name,
          measure: ingredient.measure,
          recipeId,
          recipeTitle,
          checked: false,
          addedAt: new Date(),
        };
        
        set({ items: [...items, newItem] });
      },

      addItems: (ingredients, recipeId, recipeTitle) => {
        ingredients.forEach(ingredient => {
          get().addItem(ingredient, recipeId, recipeTitle);
        });
      },

      addRecipeToShoppingList: (recipe, servings = recipe.servings) => {
        const multiplier = servings / recipe.servings;
        const scaledIngredients = recipe.ingredients.map(ingredient => ({
          ...ingredient,
          measure: scaleIngredientMeasure(ingredient.measure, multiplier)
        }));
        
        get().addItems(scaledIngredients, recipe.id, recipe.title);
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      },

      toggleItem: (itemId) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }));
      },

      clearList: () => {
        set({ items: [] });
      },

      clearCheckedItems: () => {
        set((state) => ({
          items: state.items.filter(item => !item.checked)
        }));
      },

      checkAllItems: () => {
        set((state) => ({
          items: state.items.map(item => ({ ...item, checked: true }))
        }));
      },

      uncheckAllItems: () => {
        set((state) => ({
          items: state.items.map(item => ({ ...item, checked: false }))
        }));
      },

      removeCheckedItems: () => {
        set((state) => ({
          items: state.items.filter(item => !item.checked)
        }));
      },

      addRecipeIngredients: (ingredients, recipeId, recipeTitle) => {
        get().addItems(ingredients, recipeId, recipeTitle);
      },

      removeRecipeIngredients: (recipeId) => {
        set((state) => ({
          items: state.items.filter(item => item.recipeId !== recipeId)
        }));
      },

      getItemCount: () => {
        return get().items.length;
      },

      getCheckedCount: () => {
        return get().items.filter(item => item.checked).length;
      },

      getUncheckedCount: () => {
        return get().items.filter(item => !item.checked).length;
      },

      getItemsByRecipe: (recipeId) => {
        return get().items.filter(item => item.recipeId === recipeId);
      },

      getUniqueRecipes: () => {
        const { items } = get();
        const recipeMap = new Map<string, { id: string; title: string; itemCount: number }>();
        
        items.forEach(item => {
          if (recipeMap.has(item.recipeId)) {
            const recipe = recipeMap.get(item.recipeId)!;
            recipe.itemCount++;
          } else {
            recipeMap.set(item.recipeId, {
              id: item.recipeId,
              title: item.recipeTitle,
              itemCount: 1,
            });
          }
        });
        
        return Array.from(recipeMap.values());
      },

      consolidateItems: () => {
        const { items } = get();
        const consolidated = new Map<string, ShoppingListItem>();
        
        items.forEach(item => {
          const key = item.name.toLowerCase();
          
          if (consolidated.has(key)) {
            const existing = consolidated.get(key)!;
            // Combine measures and recipe titles
            existing.measure = existing.measure === item.measure 
              ? existing.measure 
              : `${existing.measure}, ${item.measure}`;
            existing.recipeTitle = existing.recipeTitle === item.recipeTitle
              ? existing.recipeTitle
              : `${existing.recipeTitle}, ${item.recipeTitle}`;
          } else {
            consolidated.set(key, { ...item });
          }
        });
        
        set({ items: Array.from(consolidated.values()) });
      },

      exportList: () => {
        const { items } = get();
        const uncheckedItems = items.filter(item => !item.checked);
        
        if (uncheckedItems.length === 0) {
          return 'Shopping list is empty or all items are checked off!';
        }
        
        let exportText = 'Shopping List\n';
        exportText += '=============\n\n';
        
        const recipeGroups = get().getUniqueRecipes();
        
        recipeGroups.forEach(recipe => {
          const recipeItems = uncheckedItems.filter(item => item.recipeId === recipe.id);
          if (recipeItems.length > 0) {
            exportText += `${recipe.title}:\n`;
            recipeItems.forEach(item => {
              exportText += `  • ${item.measure} ${item.name}\n`;
            });
            exportText += '\n';
          }
        });
        
        exportText += `Generated on ${new Date().toLocaleDateString()}`;
        
        return exportText;
      },
    }),
    {
      name: 'shopping-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Helper function to scale ingredient measurements
function scaleIngredientMeasure(measure: string, multiplier: number): string {
  if (!measure || multiplier === 1) return measure

  // Extract number from measure string
  const numberMatch = measure.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(.*)/)
  
  if (!numberMatch || !numberMatch[1] || !numberMatch[2]) return measure

  const [, numberStr, unit] = numberMatch
  
  // Handle fractions
  if (numberStr.includes('/')) {
    const [whole, fraction] = numberStr.split('/')
    if (!whole || !fraction) return measure
    
    const decimal = parseFloat(whole) / parseFloat(fraction)
    const scaled = decimal * multiplier
    
    // Convert back to fraction if reasonable
    if (scaled < 1) {
      const denominator = Math.round(1 / scaled)
      return `1/${denominator} ${unit}`.trim()
    }
    
    return `${scaled.toFixed(scaled < 10 ? 1 : 0)} ${unit}`.trim()
  }
  
  const number = parseFloat(numberStr)
  if (isNaN(number)) return measure
  
  const scaled = number * multiplier
  
  return `${scaled.toFixed(scaled < 10 ? 1 : 0)} ${unit}`.trim()
}