'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, Grid, List, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RecipeCard } from '@/components/recipe-card'
import { 
  useRandomRecipes, 
  useRecipesByCategory, 
  useRecipesByArea, 
  useCategories, 
  useAreas 
} from '@/hooks/useRecipes'

function RecipesContent() {
  const searchParams = useSearchParams()
  const category = searchParams?.get('category')
  const area = searchParams?.get('area')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch recipes based on filters
  const { recipes: randomRecipes, isLoading: randomLoading } = useRandomRecipes(12)
  const { recipes: categoryRecipes, isLoading: categoryLoading } = useRecipesByCategory(category || null)
  const { recipes: areaRecipes, isLoading: areaLoading } = useRecipesByArea(area || null)
  const { categories } = useCategories()
  const { areas } = useAreas()

  // Determine which recipes to show
  let recipes = randomRecipes
  let isLoading = randomLoading
  let title = 'All Recipes'

  if (category) {
    recipes = categoryRecipes
    isLoading = categoryLoading
    title = `${category} Recipes`
  } else if (area) {
    recipes = areaRecipes
    isLoading = areaLoading
    title = `${area} Cuisine`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading ? 'Loading recipes...' : `${recipes.length} recipes found`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(category || area) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                    onClick={() => window.location.href = '/recipes'}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {area && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Cuisine: {area}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                    onClick={() => window.location.href = '/recipes'}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                
                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    <Button
                      variant={!category ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/recipes'}
                    >
                      All Categories
                    </Button>
                    {categories.slice(0, 8).map((cat) => (
                      <Button
                        key={cat}
                        variant={category === cat ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.location.href = `/recipes?category=${cat}`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Cuisines */}
                <div>
                  <h4 className="font-medium mb-3">Cuisines</h4>
                  <div className="space-y-2">
                    <Button
                      variant={!area ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/recipes'}
                    >
                      All Cuisines
                    </Button>
                    {areas.slice(0, 8).map((ar) => (
                      <Button
                        key={ar}
                        variant={area === ar ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.location.href = `/recipes?area=${ar}`}
                      >
                        {ar}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipes Grid */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && recipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try browsing different categories or cuisines
                </p>
                <Button onClick={() => window.location.href = '/recipes'}>
                  View All Recipes
                </Button>
              </div>
            )}

            {/* Recipes Grid */}
            {!isLoading && recipes.length > 0 && (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    showCookMode={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<RecipesPageSkeleton />}>
      <RecipesContent />
    </Suspense>
  )
}

function RecipesPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-20 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}