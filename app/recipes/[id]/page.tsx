'use client'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Play,
  MapPin,
  Star,
  Timer,
  Plus,
  Minus,
  Check,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecipe, useRecipeSuggestions } from '@/hooks/useRecipes'
import { useFavoritesStore } from '@/lib/stores/favorites'
import { useShoppingStore } from '@/lib/stores/shopping'
import { useUIStore } from '@/lib/stores/ui'
import { RecipeCard } from '@/components/recipe-card'
import { useState, useEffect } from 'react'

interface RecipeDetailPageProps {
  params: {
    id: string
  }
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { recipe, isLoading, isError } = useRecipe(params.id)
  const { suggestions, isLoading: suggestionsLoading } = useRecipeSuggestions(recipe || null)
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const { addRecipeToShoppingList } = useShoppingStore()
  const [servings, setServings] = useState(4)
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Update servings when recipe loads
  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings)
    }
  }, [recipe])

  if (isLoading) {
    return <RecipeDetailSkeleton />
  }

  if (isError || !recipe) {
    notFound()
  }

  const isRecipeFavorite = isFavorite(recipe.id)
  const servingMultiplier = servings / recipe.servings

  const handleFavoriteClick = () => {
    toggleFavorite(recipe.id, recipe)
  }

  const handleAddToShoppingList = () => {
    addRecipeToShoppingList(recipe, servings)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this amazing ${recipe.area} recipe: ${recipe.title}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const adjustServings = (increment: boolean) => {
    const newServings = increment ? servings + 1 : Math.max(1, servings - 1)
    setServings(newServings)
  }

  const toggleStepCompletion = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex)
    } else {
      newCompleted.add(stepIndex)
    }
    setCompletedSteps(newCompleted)
  }

  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    measure: scaleIngredientMeasure(ingredient.measure, servingMultiplier)
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Recipe Header */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {recipe.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <MapPin className="h-3 w-3 mr-1" />
                    {recipe.area}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      recipe.difficulty === 'Easy' ? 'bg-green-500/80' :
                      recipe.difficulty === 'Medium' ? 'bg-yellow-500/80' :
                      'bg-red-500/80'
                    } text-white border-0`}
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  {recipe.title}
                </h1>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.cookingTime}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    <span>{recipe.difficulty}</span>
                  </div>
                  {recipe.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{recipe.rating} ({recipe.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleFavoriteClick}
                  className="bg-white/20 hover:bg-white/30 border-white/30"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      isRecipeFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                    }`} 
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleShare}
                  className="bg-white/20 hover:bg-white/30 border-white/30"
                >
                  <Share2 className="h-4 w-4 text-white" />
                </Button>
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href={`/cook/${recipe.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Cook Mode
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <div 
                      key={index}
                      className={`flex gap-4 p-4 rounded-lg border transition-all ${
                        completedSteps.has(index) 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      } ${
                        activeStep === index ? 'ring-2 ring-orange-500' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`w-8 h-8 rounded-full ${
                            completedSteps.has(index)
                              ? 'bg-green-500 text-white border-green-500'
                              : ''
                          }`}
                          onClick={() => toggleStepCompletion(index)}
                        >
                          {completedSteps.has(index) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </Button>
                      </div>
                      <div className="flex-1">
                        <p className={`${
                          completedSteps.has(index) ? 'line-through text-gray-500' : ''
                        }`}>
                          {instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Video & Source Links */}
            {(recipe.youtube || recipe.source) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {recipe.youtube && (
                      <Button variant="outline" asChild className="flex-1">
                        <a href={recipe.youtube} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Video
                        </a>
                      </Button>
                    )}
                    {recipe.source && (
                      <Button variant="outline" asChild className="flex-1">
                        <a href={recipe.source} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Original Source
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Servings Adjuster */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Servings
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustServings(false)}
                      disabled={servings <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{servings}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustServings(true)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Ingredients
                  </h4>
                  <div className="space-y-2">
                    {scaledIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex justify-between items-center text-sm">
                        <span className="flex-1">{ingredient.name}</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {ingredient.measure}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleAddToShoppingList}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Shopping List
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Info */}
            <Card>
              <CardHeader>
                <CardTitle>Recipe Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Prep Time</span>
                    <span className="font-medium">5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cook Time</span>
                    <span className="font-medium">{recipe.cookingTime}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Time</span>
                    <span className="font-medium">{(recipe.cookingTime || 0) + 5}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                    <span className="font-medium">{recipe.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cuisine</span>
                    <span className="font-medium">{recipe.area}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Recipes */}
        {suggestions.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.slice(0, 3).map((suggestion) => (
                <RecipeCard key={suggestion.id} recipe={suggestion} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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

// Loading skeleton component
function RecipeDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-[50vh] min-h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-16 flex-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}