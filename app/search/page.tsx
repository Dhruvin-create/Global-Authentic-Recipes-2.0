'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, SlidersHorizontal, X, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RecipeCard } from '@/components/recipe-card'
import { useSearchRecipes, useCategories, useAreas } from '@/hooks/useRecipes'
import { ProcessedRecipe } from '@/lib/types'

interface SearchFilters {
  category?: string
  area?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  maxCookingTime?: number
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialArea = searchParams.get('area') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>({
    category: initialCategory || undefined,
    area: initialArea || undefined,
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const { recipes, isLoading, isError } = useSearchRecipes(query)
  const { categories } = useCategories()
  const { areas } = useAreas()

  // Update query when URL params change
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    const urlCategory = searchParams.get('category') || ''
    const urlArea = searchParams.get('area') || ''
    
    if (urlQuery !== query) {
      setQuery(urlQuery)
      setSearchInput(urlQuery)
    }
    
    if (urlCategory !== filters.category || urlArea !== filters.area) {
      setFilters(prev => ({
        ...prev,
        category: urlCategory || undefined,
        area: urlArea || undefined,
      }))
    }
  }, [searchParams, query, filters.category, filters.area])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchInput.trim())
    
    // Update URL
    const params = new URLSearchParams()
    if (searchInput.trim()) params.set('q', searchInput.trim())
    if (filters.category) params.set('category', filters.category)
    if (filters.area) params.set('area', filters.area)
    
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const applyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    
    // Update URL
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.area) params.set('area', newFilters.area)
    
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const clearFilters = () => {
    const newFilters: SearchFilters = {}
    setFilters(newFilters)
    
    // Update URL
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  // Filter recipes based on current filters
  const filteredRecipes = recipes.filter((recipe: ProcessedRecipe) => {
    if (filters.category && recipe.category !== filters.category) return false
    if (filters.area && recipe.area !== filters.area) return false
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false
    if (filters.maxCookingTime && recipe.cookingTime && recipe.cookingTime > filters.maxCookingTime) return false
    return true
  })

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            {query ? `Search Results for "${query}"` : 'Search Recipes'}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for recipes, ingredients, or cuisines..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </form>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {filters.category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => applyFilters({ ...filters, category: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.area && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Cuisine: {filters.area}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => applyFilters({ ...filters, area: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.difficulty && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Difficulty: {filters.difficulty}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => applyFilters({ ...filters, difficulty: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.maxCookingTime && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Max Time: {filters.maxCookingTime}m
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => applyFilters({ ...filters, maxCookingTime: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="space-y-2">
                      <Button
                        variant={!filters.category ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => applyFilters({ ...filters, category: undefined })}
                      >
                        All Categories
                      </Button>
                      {categories.slice(0, 8).map((category) => (
                        <Button
                          key={category}
                          variant={filters.category === category ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => applyFilters({ ...filters, category })}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine Filter */}
                  <div>
                    <h4 className="font-medium mb-3">Cuisine</h4>
                    <div className="space-y-2">
                      <Button
                        variant={!filters.area ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => applyFilters({ ...filters, area: undefined })}
                      >
                        All Cuisines
                      </Button>
                      {areas.slice(0, 8).map((area) => (
                        <Button
                          key={area}
                          variant={filters.area === area ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => applyFilters({ ...filters, area })}
                        >
                          {area}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <h4 className="font-medium mb-3">Difficulty</h4>
                    <div className="space-y-2">
                      <Button
                        variant={!filters.difficulty ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => applyFilters({ ...filters, difficulty: undefined })}
                      >
                        Any Difficulty
                      </Button>
                      {(['Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
                        <Button
                          key={difficulty}
                          variant={filters.difficulty === difficulty ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => applyFilters({ ...filters, difficulty })}
                        >
                          {difficulty}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cooking Time Filter */}
                  <div>
                    <h4 className="font-medium mb-3">Max Cooking Time</h4>
                    <div className="space-y-2">
                      <Button
                        variant={!filters.maxCookingTime ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => applyFilters({ ...filters, maxCookingTime: undefined })}
                      >
                        Any Time
                      </Button>
                      {[15, 30, 60, 120].map((time) => (
                        <Button
                          key={time}
                          variant={filters.maxCookingTime === time ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => applyFilters({ ...filters, maxCookingTime: time })}
                        >
                          Under {time}m
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {isLoading ? 'Searching...' : `${filteredRecipes.length} recipes found`}
                </h2>
                {query && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Results for "{query}"
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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

            {/* Error State */}
            {isError && (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Search Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Something went wrong while searching. Please try again.
                </p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !isError && filteredRecipes.length === 0 && query && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && !query && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Start your search
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a recipe name, ingredient, or cuisine to get started
                </p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !isError && filteredRecipes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
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

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
  )
}