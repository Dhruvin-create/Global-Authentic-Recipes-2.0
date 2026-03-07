'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, Users, ChefHat, Heart, Share2, Star, 
  ArrowLeft, Flame, Calendar, Eye, ThumbsUp 
} from 'lucide-react';
import { useAuthAction } from '@/lib/use-auth-action';
import AuthModal from '@/components/AuthModal';

export default function RecipePage() {
  const params = useParams();
  const { requireAuth, showAuthModal, handleAuthSuccess, handleAuthClose } = useAuthAction();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchRecipe(params.slug);
    }
  }, [params.slug]);

  const fetchRecipe = async (slug) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setRecipe(data.data);
      } else {
        setError(data.message || 'Recipe not found');
      }
    } catch (err) {
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = requireAuth(() => {
    setIsFavorite(!isFavorite);
    // TODO: API call to toggle favorite
  });

  const handleLike = requireAuth(() => {
    setIsLiked(!isLiked);
    // TODO: API call to toggle like
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        text: recipe?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toUpperCase()) {
      case 'EASY': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'MEDIUM': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'HARD': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded mb-6 w-32"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded mb-8 w-full"></div>
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <ChefHat className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-700 mb-6" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Recipe Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            {error || 'The recipe you\'re looking for doesn\'t exist.'}
          </p>
          <Link 
            href="/recipes"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 pb-16">
        {/* Header - Professional & Moderate */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/recipes"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors mb-3 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Recipes</span>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-sm font-semibold">
                    {recipe.cuisine_name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                  {recipe.title}
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {recipe.description}
                </p>
              </div>
              
              <div className="flex md:flex-col items-center gap-2 md:ml-4">
                <button
                  onClick={handleFavorite}
                  aria-label="Add to favorites"
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm ${
                    isFavorite
                      ? 'bg-red-500 border-red-500 text-white shadow-red-500/25'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-500 bg-white dark:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleLike}
                  aria-label="Like this recipe"
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm ${
                    isLiked
                      ? 'bg-blue-500 border-blue-500 text-white shadow-blue-500/25'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 bg-white dark:bg-slate-800'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share recipe"
                  className="w-11 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 bg-white dark:bg-slate-800 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Recipe Image - Perfect Size */}
          <div className="aspect-[4/3] max-w-lg mx-auto rounded-2xl overflow-hidden mb-8 shadow-lg relative group bg-slate-100 dark:bg-slate-800">
            <img
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Recipe Stats - Professional Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="text-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800">
              <Clock className="w-7 h-7 mx-auto text-primary-500 mb-3" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Minutes</div>
            </div>
            <div className="text-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800">
              <Users className="w-7 h-7 mx-auto text-primary-500 mb-3" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {recipe.servings}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Servings</div>
            </div>
            <div className="text-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800">
              <Flame className="w-7 h-7 mx-auto text-primary-500 mb-3" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {recipe.calories || 'N/A'}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Calories</div>
            </div>
            <div className="text-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800">
              <Star className="w-7 h-7 mx-auto text-primary-500 mb-3" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {recipe.avg_rating ? parseFloat(recipe.avg_rating).toFixed(1) : 'N/A'}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients - Professional Layout */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                Ingredients
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-800 sticky top-24">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-3 rounded-xl transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <span className="font-black text-slate-900 dark:text-white block text-lg">
                            {ingredient.quantity}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {ingredient.name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    Ingredients will be loaded soon...
                  </p>
                )}
              </div>
            </div>

            {/* Instructions - Professional Layout */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                Instructions
              </h2>
              <div className="space-y-5">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 dark:text-white leading-relaxed">
                            {instruction.description}
                          </p>
                          {instruction.image && (
                            <img
                              src={instruction.image}
                              alt={`Step ${index + 1}`}
                              className="mt-4 rounded-xl w-full max-w-md shadow-md"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-400">
                      Instructions will be loaded soon...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recipe Meta - Professional Footer */}
          <div className="mt-12 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="group">
                <Eye className="w-6 h-6 mx-auto text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" />
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {recipe.view_count || 0} views
                </div>
              </div>
              <div className="group">
                <Calendar className="w-6 h-6 mx-auto text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" />
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Added {new Date(recipe.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="group">
                <ChefHat className="w-6 h-6 mx-auto text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" />
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  By {recipe.author_name || 'Chef'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
    </>
  );
}