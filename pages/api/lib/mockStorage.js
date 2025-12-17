/**
 * Mock in-memory storage for recipes (used when database is unavailable)
 * In production, remove this and ensure database is properly configured.
 */

let mockRecipes = [
  {
    id: 1,
    title: 'Classic Pasta Carbonara',
    ingredients: 'Spaghetti\nGuanciale or pancetta\nEggs\nPecorino Romano cheese\nBlack pepper\nSalt',
    steps: 'Cook pasta in salted water\nCrisp the guanciale\nMix eggs with cheese\nCombine hot pasta with guanciale fat\nToss quickly with egg mixture\nFinish with black pepper',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=60',
    cooking_time: '20',
    difficulty: 'Medium',
    history: 'A traditional Roman pasta dish dating back centuries, Carbonara combines simple ingredients for a rich, creamy sauce without actual cream.',
    platingStyle: 'Traditional Italian'
  },
  {
    id: 2,
    title: 'Thai Green Curry',
    ingredients: 'Chicken breast\nCoconut milk\nGreen curry paste\nBasil leaves\nLime juice\nFish sauce\nGarlic\nEggplant',
    steps: 'Heat oil and cook curry paste\nAdd coconut milk gradually\nAdd chicken pieces\nAdd vegetables\nSimmer until chicken is cooked\nFinish with basil and lime juice',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?auto=format&fit=crop&w=800&q=60',
    cooking_time: '30',
    difficulty: 'Medium',
    history: 'Thai Green Curry is a staple of Thai cuisine, combining aromatic green chilies with creamy coconut milk for a balanced, flavorful dish.',
    platingStyle: 'Modern Asian'
  }
];

let nextId = 3;

export function getRecipes() {
  return mockRecipes;
}

export function getRecipeById(id) {
  return mockRecipes.find(r => r.id === parseInt(id));
}

export function addRecipe(recipe) {
  const newRecipe = { ...recipe, id: nextId++ };
  mockRecipes.unshift(newRecipe);
  return newRecipe;
}

export function updateRecipe(id, updates) {
  const recipe = mockRecipes.find(r => r.id === parseInt(id));
  if (recipe) {
    Object.assign(recipe, updates);
  }
  return recipe;
}

export function deleteRecipe(id) {
  const index = mockRecipes.findIndex(r => r.id === parseInt(id));
  if (index >= 0) {
    mockRecipes.splice(index, 1);
    return true;
  }
  return false;
}
