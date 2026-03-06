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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-24 pb-16">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg sticky top-16 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link 
              href="/recipes"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all mb-6 group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-semibold">Back to Recipes</span>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/30 animate-pulse">
                    {recipe.cuisine_name}
                  </span>
                  <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-md ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-4 leading-tight">
                  {recipe.title}
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                  {recipe.description}
                </p>
              </div>
              
              <div className="flex md:flex-col items-center gap-4 md:ml-8">
                <button
                  onClick={handleFavorite}
                  aria-label="Add to favorites"
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isFavorite
                      ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-500 text-white shadow-xl shadow-red-500/40'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-500 bg-white dark:bg-slate-800 shadow-lg'
                  }`}
                >
                  <Heart className={`w-7 h-7 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleLike}
                  aria-label="Like this recipe"
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isLiked
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/40'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 bg-white dark:bg-slate-800 shadow-lg'
                  }`}
                >
                  <ThumbsUp className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share recipe"
                  className="w-16 h-16 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 bg-white dark:bg-slate-800 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                >
                  <Share2 className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Recipe Image */}
          <div className="aspect-video rounded-3xl overflow-hidden mb-16 shadow-2xl ring-4 ring-white/50 dark:ring-slate-800/50 relative group">
            <img
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 hover:-translate-y-2 group">
              <Clock className="w-10 h-10 mx-auto text-primary-500 mb-4 group-hover:scale-125 transition-transform duration-300" />
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Minutes</div>
            </div>
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 hover:-translate-y-2 group">
              <Users className="w-10 h-10 mx-auto text-primary-500 mb-4 group-hover:scale-125 transition-transform duration-300" />
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {recipe.servings}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Servings</div>
            </div>
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 hover:-translate-y-2 group">
              <Flame className="w-10 h-10 mx-auto text-primary-500 mb-4 group-hover:scale-125 transition-transform duration-300" />
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {recipe.calories || 'N/A'}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Calories</div>
            </div>
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 hover:-translate-y-2 group">
              <Star className="w-10 h-10 mx-auto text-primary-500 mb-4 group-hover:scale-125 transition-transform duration-300" />
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {recipe.avg_rating ? parseFloat(recipe.avg_rating).toFixed(1) : 'N/A'}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                <div className="w-2 h-12 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full shadow-lg"></div>
                Ingredients
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border-2 border-slate-100 dark:border-slate-800 sticky top-32 hover:shadow-3xl transition-shadow duration-300">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-5">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800 p-3 rounded-2xl transition-all duration-300">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform duration-300 shadow-lg"></div>
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

            {/* Instructions */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                <div className="w-2 h-12 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full shadow-lg"></div>
                Instructions
              </h2>
              <div className="space-y-6">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 group hover:-translate-y-1">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white font-black text-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 dark:text-white leading-relaxed text-lg font-medium">
                            {instruction.description}
                          </p>
                          {instruction.image && (
                            <img
                              src={instruction.image}
                              alt={`Step ${index + 1}`}
                              className="mt-6 rounded-2xl w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border-2 border-slate-100 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-400">
                      Instructions will be loaded soon...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recipe Meta */}
          <div className="mt-16 p-10 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl border-2 border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <Eye className="w-8 h-8 mx-auto text-slate-400 group-hover:text-primary-500 mb-3 transition-all duration-300 group-hover:scale-125" />
                <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  {recipe.view_count || 0} views
                </div>
              </div>
              <div className="group">
                <Calendar className="w-8 h-8 mx-auto text-slate-400 group-hover:text-primary-500 mb-3 transition-all duration-300 group-hover:scale-125" />
                <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  Added {new Date(recipe.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="group">
                <ChefHat className="w-8 h-8 mx-auto text-slate-400 group-hover:text-primary-500 mb-3 transition-all duration-300 group-hover:scale-125" />
                <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
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