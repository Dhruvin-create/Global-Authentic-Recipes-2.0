'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, TrendingUp, Star } from 'lucide-react';

export default function CategoriesPage() {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cuisines')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCuisines(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load cuisines:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-12 h-12" />
            <h1 className="text-5xl md:text-6xl font-display font-black">
              World Cuisines
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl">
            Explore authentic recipes from different cultures and traditions around the globe
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cuisines.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No cuisines found</h3>
            <p className="text-slate-600 dark:text-slate-400">Check back later for more cuisines</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine.id}
                href={`/categories/${cuisine.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cuisine.image || '/placeholder-cuisine.jpg'}
                    alt={cuisine.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-display font-black text-white">
                    {cuisine.name}
                  </h3>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {cuisine.description || `Discover authentic ${cuisine.name} recipes`}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>{cuisine.recipe_count || 0} recipes</span>
                    </div>
                    {cuisine.avg_rating && parseFloat(cuisine.avg_rating) > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{parseFloat(cuisine.avg_rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
