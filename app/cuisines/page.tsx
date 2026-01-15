'use client'

import Link from 'next/link'
import { Globe, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAreas } from '@/hooks/useRecipes'

export default function CuisinesPage() {
  const { areas, isLoading, isError } = useAreas()

  // Cuisine flags mapping
  const getCuisineFlag = (area: string) => {
    const flags: Record<string, string> = {
      'Italian': '🇮🇹',
      'Chinese': '🇨🇳',
      'Indian': '🇮🇳',
      'Mexican': '🇲🇽',
      'French': '🇫🇷',
      'Japanese': '🇯🇵',
      'Thai': '🇹🇭',
      'American': '🇺🇸',
      'British': '🇬🇧',
      'Spanish': '🇪🇸',
      'Greek': '🇬🇷',
      'Turkish': '🇹🇷',
      'Moroccan': '🇲🇦',
      'Russian': '🇷🇺',
      'German': '🇩🇪',
      'Korean': '🇰🇷',
      'Vietnamese': '🇻🇳',
      'Lebanese': '🇱🇧',
      'Brazilian': '🇧🇷',
      'Argentinian': '🇦🇷',
      'Portuguese': '🇵🇹',
      'Polish': '🇵🇱',
      'Dutch': '🇳🇱',
      'Irish': '🇮🇪',
      'Canadian': '🇨🇦',
      'Australian': '🇦🇺',
      'Egyptian': '🇪🇬',
      'Tunisian': '🇹🇳',
      'Jamaican': '🇯🇲',
      'Malaysian': '🇲🇾',
      'Croatian': '🇭🇷',
      'Kenyan': '🇰🇪'
    }
    return flags[area] || '🌍'
  }

  // Cuisine descriptions
  const getCuisineDescription = (area: string) => {
    const descriptions: Record<string, string> = {
      'Italian': 'Pasta, pizza, and Mediterranean flavors',
      'Chinese': 'Stir-fries, dumplings, and authentic Asian cuisine',
      'Indian': 'Spicy curries, aromatic spices, and traditional dishes',
      'Mexican': 'Tacos, enchiladas, and vibrant Latin flavors',
      'French': 'Elegant cuisine with rich sauces and techniques',
      'Japanese': 'Sushi, ramen, and delicate Japanese preparations',
      'Thai': 'Sweet, sour, and spicy Southeast Asian dishes',
      'American': 'Classic comfort food and regional specialties',
      'British': 'Traditional pub food and hearty British classics',
      'Spanish': 'Paella, tapas, and Mediterranean Spanish cuisine',
      'Greek': 'Fresh ingredients and Mediterranean Greek dishes',
      'Turkish': 'Ottoman-inspired dishes with Middle Eastern flair',
      'Moroccan': 'Tagines, couscous, and North African spices',
      'Russian': 'Hearty soups, stews, and Eastern European comfort food',
      'Vietnamese': 'Fresh herbs, pho, and Southeast Asian street food',
      'Lebanese': 'Mezze, grilled meats, and Middle Eastern flavors'
    }
    return descriptions[area] || 'Authentic traditional recipes from this region'
  }

  // Popular cuisines (featured at top)
  const popularCuisines = ['Italian', 'Chinese', 'Indian', 'Mexican', 'French', 'Japanese', 'Thai', 'American']
  const otherCuisines = areas.filter(area => !popularCuisines.includes(area))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            World <span className="text-orange-600">Cuisines</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Embark on a culinary journey around the world. Discover authentic recipes 
            from different countries and experience diverse flavors and cooking traditions.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 16 }).map((_, i) => (
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
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Unable to load cuisines
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please try refreshing the page or check your internet connection.
            </p>
          </div>
        )}

        {/* Popular Cuisines */}
        {!isLoading && !isError && areas.length > 0 && (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Popular Cuisines
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularCuisines.filter(cuisine => areas.includes(cuisine)).map((area) => (
                  <Link key={area} href={`/recipes?area=${area}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <CardHeader className="text-center">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                          {getCuisineFlag(area)}
                        </div>
                        <CardTitle className="group-hover:text-orange-600 transition-colors">
                          {area}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getCuisineDescription(area)}
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
            </div>

            {/* All Other Cuisines */}
            {otherCuisines.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  More World Cuisines
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {otherCuisines.map((area) => (
                    <Link key={area} href={`/recipes?area=${area}`}>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <CardHeader className="text-center">
                          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                            {getCuisineFlag(area)}
                          </div>
                          <CardTitle className="group-hover:text-orange-600 transition-colors">
                            {area}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getCuisineDescription(area)}
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
              </div>
            )}

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Explore Global Flavors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {areas.length}+
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Countries & Regions
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    5
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Continents Covered
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ∞
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Culinary Adventures
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-center mb-8">
                Quick Access
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['Italian', 'Chinese', 'Indian', 'Mexican', 'French', 'Japanese', 'Thai', 'American', 'British', 'Spanish'].map((area) => (
                  <Link key={area} href={`/recipes?area=${area}`}>
                    <Badge 
                      variant="outline" 
                      className="text-lg py-2 px-4 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      {getCuisineFlag(area)} {area}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}