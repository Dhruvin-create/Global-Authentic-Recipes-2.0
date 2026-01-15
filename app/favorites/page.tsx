'use client'

import { useState } from 'react'
import { Heart, Trash2, ChefHat, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RecipeCard } from '@/components/recipe-card'
import { useMultipleRecipes } from '@/hooks/useRecipes'
import { useFavoritesStore } from '@/lib/stores/favorites'

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavoritesStore()
  const { recipes, isLoading } = useMultipleRecipes(favorites)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Heart className="h-8 w-8 text-red-500" />
                My Favorites
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading 
                  ? 'Loading your favorite recipes...' 
                  : `${filteredRecipes.length} favorite recipe${filteredRecipes.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            
            {favorites.length > 0 && (
              <Button
                variant="outline"
                onClick={clearFavorites}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Search Bar */}
          {favorites.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring recipes and click the heart icon to save your favorites here. 
              They'll be stored locally on your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/recipes">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Browse Recipes
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Search Recipes
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: favorites.length }).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && favorites.length > 0 && filteredRecipes.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No favorites match "{searchQuery}". Try a different search term.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                showCookMode={true}
              />
            ))}
          </div>
        )}

        {/* Tips Section */}
        {favorites.length > 0 && !isLoading && (
          <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Your favorites are saved locally on this device</li>
              <li>• Use the search bar above to quickly find specific favorites</li>
              <li>• Click the heart icon again on any recipe to remove it from favorites</li>
              <li>• Try the "Cook Mode" for step-by-step cooking instructions</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}