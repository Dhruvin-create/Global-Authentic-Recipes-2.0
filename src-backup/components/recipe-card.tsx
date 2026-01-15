// @ts-nocheck
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface Recipe {
  id: string;
  title: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status?: string;
  origin_country?: string;
  ingredients?: string;
  description?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
  showCookMode?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export default function RecipeCard({ 
  recipe, 
  index = 0, 
  showCookMode = true, 
  variant = 'default' 
}: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getAuthenticityBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Verified
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Community
          </span>
        );
      case 'ai_pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            AI Generated
          </span>
        );
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-amber-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80';

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Link href={`/recipes/${recipe.id}`}>
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-amber-200 hover:shadow-md transition-all duration-200">
            {/* Compact Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                src={imageError ? defaultImage : (recipe.image || defaultImage)}
                alt={recipe.title}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                {recipe.cooking_time && (
                  <span className="flex items-center gap-1">
                    ⏱️ {recipe.cooking_time} min
                  </span>
                )}
                {recipe.difficulty && (
                  <span className={`w-2 h-2 rounded-full ${getDifficultyColor(recipe.difficulty)}`} title={recipe.difficulty}></span>
                )}
              </div>
            </div>

            {/* Authenticity Badge */}
            <div className="flex-shrink-0">
              {getAuthenticityBadge(recipe.authenticity_status)}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Link href={`/recipes/${recipe.id}`}>
          {/* Featured Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={imageError ? defaultImage : (recipe.image || defaultImage)}
              alt={recipe.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Authenticity Badge */}
            <div className="absolute top-4 right-4">
              {getAuthenticityBadge(recipe.authenticity_status)}
            </div>

            {/* Country Flag */}
            {recipe.origin_country && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700">
                🌍 {recipe.origin_country}
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                {recipe.title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {recipe.cooking_time && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">⏱️</span>
                    {recipe.cooking_time} min
                  </span>
                )}
                {recipe.difficulty && (
                  <span className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full ${getDifficultyColor(recipe.difficulty)}`}></span>
                    {recipe.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {recipe.description && (
              <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                {recipe.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                View Recipe
              </button>
              {showCookMode && (
                <Link 
                  href={`/recipes/${recipe.id}/cook`}
                  className="px-4 py-2 border-2 border-amber-500 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  🍳 Cook
                </Link>
              )}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group h-full"
    >
      <div className="h-full bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden h-48 bg-slate-100">
          <Link href={`/recipes/${recipe.id}`}>
            <img
              src={imageError ? defaultImage : (recipe.image || defaultImage)}
              alt={recipe.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </Link>

          {/* Authenticity Badge */}
          <div className="absolute top-3 right-3">
            {getAuthenticityBadge(recipe.authenticity_status)}
          </div>

          {/* Difficulty Badge */}
          {recipe.difficulty && (
            <div className="absolute top-3 left-3">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Link 
                href={`/recipes/${recipe.id}`}
                className="px-4 py-2 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                View Recipe
              </Link>
              {showCookMode && (
                <Link 
                  href={`/recipes/${recipe.id}/cook`}
                  className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                >
                  🍳 Cook Mode
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
              {recipe.title}
            </h3>
          </Link>

          {/* Meta Information */}
          <div className="flex items-center justify-between mb-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              {recipe.cooking_time && (
                <span className="flex items-center gap-1">
                  ⏱️ {recipe.cooking_time} min
                </span>
              )}
              {recipe.origin_country && (
                <span className="flex items-center gap-1">
                  🌍 {recipe.origin_country}
                </span>
              )}
            </div>
          </div>

          {/* Ingredients Preview */}
          {recipe.ingredients && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {recipe.ingredients.split('\n')[0]}...
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Link 
              href={`/recipes/${recipe.id}`}
              className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-center text-sm"
            >
              View Recipe
            </Link>
            {showCookMode && (
              <Link 
                href={`/recipes/${recipe.id}/cook`}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:shadow-md transition-all text-sm"
              >
                🍳 Cook
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}