'use client'

import { ProcessedRecipe } from '@/lib/types'
import { RecipeCard } from './recipe-card'
import { Skeleton } from '@/components/ui/skeleton'

interface RecipeGridProps {
  recipes: ProcessedRecipe[]
  isLoading?: boolean
  showCookMode?: boolean
  className?: string
}

export function RecipeGrid({ 
  recipes, 
  isLoading = false, 
  showCookMode = false,
  className = ""
}: RecipeGridProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No recipes found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or browse our featured recipes
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          showCookMode={showCookMode}
        />
      ))}
    </div>
  )
}