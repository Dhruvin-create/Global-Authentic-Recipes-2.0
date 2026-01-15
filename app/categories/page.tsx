'use client'

import Link from 'next/link'
import { ChefHat, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/hooks/useRecipes'

export default function CategoriesPage() {
  const { categories, isLoading, isError } = useCategories()

  // Category icons mapping
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Chicken': '🍗',
      'Beef': '🥩',
      'Seafood': '🐟',
      'Vegetarian': '🥗',
      'Dessert': '🍰',
      'Pasta': '🍝',
      'Breakfast': '🥞',
      'Vegan': '🌱',
      'Pork': '🥓',
      'Lamb': '🐑',
      'Side': '🥙',
      'Starter': '🥗',
      'Miscellaneous': '🍽️',
      'Goat': '🐐'
    }
    return icons[category] || '🍽️'
  }

  // Category descriptions
  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      'Chicken': 'Delicious chicken recipes from around the world',
      'Beef': 'Hearty beef dishes and steaks',
      'Seafood': 'Fresh fish and seafood delicacies',
      'Vegetarian': 'Plant-based recipes without meat',
      'Dessert': 'Sweet treats and desserts',
      'Pasta': 'Italian pasta dishes and noodles',
      'Breakfast': 'Morning meals to start your day',
      'Vegan': 'Completely plant-based recipes',
      'Pork': 'Savory pork dishes and preparations',
      'Lamb': 'Tender lamb recipes and roasts',
      'Side': 'Perfect side dishes and accompaniments',
      'Starter': 'Appetizers and first courses',
      'Miscellaneous': 'Various other delicious recipes',
      'Goat': 'Traditional goat meat preparations'
    }
    return descriptions[category] || 'Explore delicious recipes in this category'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Recipe <span className="text-orange-600">Categories</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our diverse collection of recipes organized by category. 
            From hearty main courses to delightful desserts, find exactly what you're craving.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
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
              Unable to load categories
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please try refreshing the page or check your internet connection.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !isError && categories.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {categories.map((category) => (
                <Link key={category} href={`/recipes?category=${category}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        {getCategoryIcon(category)}
                      </div>
                      <CardTitle className="group-hover:text-orange-600 transition-colors">
                        {category}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getCategoryDescription(category)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center text-sm text-orange-600 group-hover:text-orange-700 font-medium">
                        Explore Recipes
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Discover Amazing Recipes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {categories.length}+
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Recipe Categories
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    1000+
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Delicious Recipes
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    25+
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    World Cuisines
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Popular Categories Highlight */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Most Popular Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Chicken', 'Beef', 'Seafood', 'Vegetarian', 'Dessert', 'Pasta'].map((category) => (
                <Link key={category} href={`/recipes?category=${category}`}>
                  <Badge 
                    variant="outline" 
                    className="text-lg py-2 px-4 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                  >
                    {getCategoryIcon(category)} {category}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}