'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Clock, Users, ChefHat, 
  Flame, Star, Search, Filter 
} from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const [cuisine, setCuisine] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    category: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchCuisineAndRecipes(params.slug);
    }
  }, [params.slug, filters]);

  const fetchCuisineAndRecipes = async (slug) => {
    try {
      setLoading(true);
      
      // Fetch cuisine info
      const cuisineResponse = await fetch(`/api/cuisines/${slug}`);
      const cuisineData = await cuisineResponse.json();
      
      if (cuisineData.success) {
        setCuisine(cuisineData.data);
        
        // Fetch recipes for this cuisine
        const params = new URLSearchParams({
          cuisine: slug,
          ...filters
        });
        
        const recipesResponse = await fetch(`/api/recipes?${params}`);
        const recipesData = await recipesResponse.json();
        
        if (recipesData.success) {
          setRecipes(recipesData.data);
          setPagination(recipesData.pagination);
        }
      } else {
        setError(cuisineData.message || 'Cuisine not found');
      }
    } catch (err) {
      setError('Failed to load cuisine');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'SNACK', label: 'Snacks' },
    { value: 'DESSERT', label: 'Desserts' },
    { value: 'BEVERAGE', label: 'Beverages' }
  ];

  const difficulties = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cuisine) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Cuisine Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {error || 'The cuisine you\'re looking for doesn\'t exist.'}
          </p>
          <Link 
            href="/categories"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/categories"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Categories
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {cuisine.image && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={cuisine.image}
                    alt={cuisine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-primary-500" />
                  <span className="text-primary-600 dark:text-primary-400 font-bold">
                    World Cuisine
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white">
                  {cuisine.name}
                </h1>
                {cuisine.description && (
                  <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                    {cuisine.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {cuisine.recipe_count || recipes.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Recipes</div>
              </div>
              {cuisine.avg_rating && parseFloat(cuisine.avg_rating) > 0 && (
                <div>
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {parseFloat(cuisine.avg_rating).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Rating</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        {pagination && (
          <div className="mb-6 text-slate-600 dark:text-slate-400">
            Showing {recipes.length} of {pagination.total} {cuisine.name} recipes
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No {cuisine.name} recipes found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={recipe.image || '/placeholder-recipe.jpg'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {recipe.is_featured && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                    {recipe.difficulty}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span className={`font-bold ${
                        recipe.difficulty === 'EASY' ? 'text-green-500' :
                        recipe.difficulty === 'MEDIUM' ? 'text-orange-500' :
                        'text-red-500'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  {recipe.avg_rating && parseFloat(recipe.avg_rating) > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex text-orange-400">
                        {'★'.repeat(Math.round(parseFloat(recipe.avg_rating)))}
                        {'☆'.repeat(5 - Math.round(parseFloat(recipe.avg_rating)))}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        ({recipe.review_count || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={!pagination.hasPrev}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={`w-12 h-12 rounded-2xl font-bold transition-colors ${
                    filters.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={!pagination.hasNext}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}