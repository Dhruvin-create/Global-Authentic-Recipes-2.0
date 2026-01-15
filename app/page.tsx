'use client'

import { HeroSection } from '@/components/hero-section'
import { RecipeGrid } from '@/components/recipe-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRandomRecipes, useCategories, useAreas } from '@/hooks/useRecipes'
import { ChefHat, Globe, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { recipes: featuredRecipes, isLoading: recipesLoading } = useRandomRecipes(6)
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { areas, isLoading: areasLoading } = useAreas()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-orange-600">Global Recipes</span>?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience cooking like never before with our comprehensive recipe platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Step-by-Step</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Detailed instructions with cooking tips and techniques
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Global Cuisines</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Authentic recipes from {areas.length}+ countries worldwide
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Quick & Easy</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Recipes for every skill level and time constraint
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Highly Rated</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Community-tested recipes with ratings and reviews
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Popular <span className="text-orange-600">Categories</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore recipes by your favorite food categories
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link key={category} href={`/recipes?category=${category}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
                        {category === 'Chicken' && '🍗'}
                        {category === 'Beef' && '🥩'}
                        {category === 'Seafood' && '🐟'}
                        {category === 'Vegetarian' && '🥗'}
                        {category === 'Dessert' && '🍰'}
                        {category === 'Pasta' && '🍝'}
                        {category === 'Breakfast' && '🥞'}
                        {category === 'Vegan' && '🌱'}
                        {!['Chicken', 'Beef', 'Seafood', 'Vegetarian', 'Dessert', 'Pasta', 'Breakfast', 'Vegan'].includes(category) && '🍽️'}
                      </div>
                      <h3 className="font-medium text-xs sm:text-sm group-hover:text-orange-600 transition-colors">
                        {category}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/categories">
                View All Categories →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Featured <span className="text-orange-600">Recipes</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Handpicked authentic dishes from around the world
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/recipes">
                View All →
              </Link>
            </Button>
          </div>

          <RecipeGrid 
            recipes={featuredRecipes} 
            isLoading={recipesLoading}
            showCookMode={true}
          />

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/recipes">
                View All Recipes →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Global Cuisines */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore <span className="text-orange-600">World Cuisines</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover authentic flavors from {areas.length}+ countries
            </p>
          </div>

          {areasLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {areas.slice(0, 12).map((area) => (
                <Link key={area} href={`/recipes?area=${area}`}>
                  <Badge 
                    variant="outline" 
                    className="w-full justify-center py-2 sm:py-3 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    <span className="mr-1 sm:mr-2">
                      {area === 'Italian' && '🇮🇹'}
                      {area === 'Chinese' && '🇨🇳'}
                      {area === 'Indian' && '🇮🇳'}
                      {area === 'Mexican' && '🇲🇽'}
                      {area === 'French' && '🇫🇷'}
                      {area === 'Japanese' && '🇯🇵'}
                      {area === 'Thai' && '🇹🇭'}
                      {area === 'American' && '🇺🇸'}
                      {area === 'British' && '🇬🇧'}
                      {area === 'Spanish' && '🇪🇸'}
                      {!['Italian', 'Chinese', 'Indian', 'Mexican', 'French', 'Japanese', 'Thai', 'American', 'British', 'Spanish'].includes(area) && '🌍'}
                    </span>
                    {area}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/cuisines">
                Explore All Cuisines →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Cooking?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of home chefs discovering authentic recipes from around the world
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/recipes">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Browse Recipes
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600" asChild>
                <Link href="/favorites">
                  Start Your Collection
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}