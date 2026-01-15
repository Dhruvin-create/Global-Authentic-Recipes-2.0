'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ChefHat, Globe, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRandomRecipes } from '@/hooks/useRecipes'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const { recipes: randomRecipes, isLoading } = useRandomRecipes(3)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/recipes?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">🍅</div>
        <div className="absolute top-20 right-20 text-6xl">🌿</div>
        <div className="absolute bottom-20 left-20 text-7xl">🧄</div>
        <div className="absolute bottom-10 right-10 text-5xl">🫒</div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                🌍 Discover Global Flavors
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Authentic Recipes
                </span>
                <br />
                From Around the World
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover thousands of authentic recipes from every corner of the globe. 
                From street food to fine dining, master the art of international cuisine.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search recipes, cuisines, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/recipes">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Explore Recipes
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/cuisines">
                  <Globe className="mr-2 h-5 w-5" />
                  Browse Cuisines
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">4.9★</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Recipes */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center">Today's Featured</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="flex gap-2">
                            <div className="h-5 bg-gray-200 rounded w-12"></div>
                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {randomRecipes.map((recipe) => (
                  <Card key={recipe.id} className="group hover:shadow-md transition-all cursor-pointer">
                    <Link href={`/recipes/${recipe.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={recipe.image}
                              alt={recipe.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                              {recipe.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {recipe.area} • {recipe.cookingTime}m
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {recipe.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {recipe.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href="/recipes">
                View All Recipes →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}