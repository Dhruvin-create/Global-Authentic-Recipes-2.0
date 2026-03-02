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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded mb-6 w-3/4"></div>
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8"></div>
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Recipe Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {error || 'The recipe you\'re looking for doesn\'t exist.'}
          </p>
          <Link 
            href="/recipes"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-colors"
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link 
              href="/recipes"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Recipes
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold">
                    {recipe.cuisine_name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white">
                  {recipe.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {recipe.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFavorite}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    isFavorite
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleLike}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    isLiked
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500'
                  }`}
                >
                  <ThumbsUp className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-12 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 flex items-center justify-center transition-all"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Recipe Image */}
          <div className="aspect-video rounded-3xl overflow-hidden mb-12 shadow-xl">
            <img
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl">
              <Clock className="w-8 h-8 mx-auto text-primary-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Minutes</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl">
              <Users className="w-8 h-8 mx-auto text-primary-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {recipe.servings}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Servings</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl">
              <Flame className="w-8 h-8 mx-auto text-primary-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {recipe.calories || 'N/A'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Calories</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl">
              <Star className="w-8 h-8 mx-auto text-primary-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {recipe.avg_rating ? parseFloat(recipe.avg_rating).toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-6">
                Ingredients
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-4">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ingredient.quantity}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 ml-2">
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
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-6">
                Instructions
              </h2>
              <div className="space-y-6">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-3xl p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white font-black flex items-center justify-center flex-shrink-0">
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
                              className="mt-4 rounded-2xl w-full max-w-md"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8">
                    <p className="text-slate-600 dark:text-slate-400">
                      Instructions will be loaded soon...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recipe Meta */}
          <div className="mt-12 p-8 bg-white dark:bg-slate-900 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Eye className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {recipe.view_count || 0} views
                </div>
              </div>
              <div>
                <Calendar className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Added {new Date(recipe.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <ChefHat className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                <div className="text-sm text-slate-600 dark:text-slate-400">
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