'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, MapPin, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProcessedRecipe } from '@/lib/types'
import { useFavoritesStore } from '@/lib/stores/favorites'

interface RecipeCardProps {
  recipe: ProcessedRecipe
  variant?: 'default' | 'compact' | 'featured'
  showCookMode?: boolean
}

export function RecipeCard({ 
  recipe, 
  variant = 'default', 
  showCookMode = false 
}: RecipeCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const isRecipeFavorite = isFavorite(recipe.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(recipe.id, recipe)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all"
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isRecipeFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </Button>

        {/* Difficulty Badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            variant={
              recipe.difficulty === 'Easy' ? 'default' : 
              recipe.difficulty === 'Medium' ? 'secondary' : 
              'destructive'
            }
            className="bg-white/90 backdrop-blur-sm text-gray-900"
          >
            {recipe.difficulty}
          </Badge>
        </div>

        {/* Rating */}
        {recipe.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm">
            <span className="text-yellow-400">★</span>
            <span>{recipe.rating}</span>
            <span className="text-gray-300">({recipe.reviewCount})</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookingTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{recipe.area}</span>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {recipe.category}
            </Badge>
            {recipe.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button asChild className="flex-1">
            <Link href={`/recipes/${recipe.id}`}>
              View Recipe
            </Link>
          </Button>
          {showCookMode && (
            <Button variant="outline" asChild>
              <Link href={`/cook/${recipe.id}`}>
                Cook Mode
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}