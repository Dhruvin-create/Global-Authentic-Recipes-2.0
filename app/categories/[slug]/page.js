'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Users, Flame, ArrowLeft, ChefHat } from 'lucide-react';

export default function CategoryDetailPage() {
  const params = useParams();
  const [cuisine, setCuisine] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!params.slug) return;

    // Fetch cuisine details
    fetch(`/api/cuisines/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCuisine(data.data);
        }
      })
      .catch(err => console.error('Failed to load cuisine:', err));

    // Fetch recipes for this cuisine
    setLoading(true);
    fetch(`/api/recipes?cuisine=${params.slug}&page=${page}&limit=12`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRecipes(data.data);
          setPagination(data.pagination);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load recipes:', err);
        setLoading(false);
      });
  }, [params.slug, page]);

  if (!cuisine && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Cuisine not found</h2>
          <Link href="/categories" className="text-primary-600 hover:underline">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      {cuisine && (
        <section className="relative h-96 overflow-hidden">
          <img
            src={cuisine.image || '/placeholder-cuisine.jpg'}
            alt={cuisine.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to categories
              </Link>
              <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-4">
                {cuisine.name} Cuisine
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {cuisine.description || `Explore authentic ${cuisine.name} recipes`}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Count */}
        {pagination && (
          <div className="mb-6 text-slate-600 dark:text-slate-400">
            {pagination.total} recipes found
          </div>
        )}

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden animate-pulse">
                <div className="h-64 bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No recipes found</h3>
            <p className="text-slate-600 dark:text-slate-400">Check back later for more recipes</p>
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
                      <span>{recipe.prep_time + recipe.cook_time} min</span>
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
                        ({recipe.review_count} reviews)
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
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
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
