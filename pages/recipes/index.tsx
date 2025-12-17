// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../src/components/layout.tsx';
import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const fetcher = url => fetch(url).then(res => res.json());

export default function Recipes() {
  const { data = [], error, isLoading } = useSWR('/api/recipes', fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = data.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });

    // Sort recipes
    if (sortBy === 'newest') {
      filtered = [...filtered].reverse();
    } else if (sortBy === 'quickest') {
      filtered = [...filtered].sort((a, b) => (a.cooking_time || 0) - (b.cooking_time || 0));
    }

    return filtered;
  }, [data, searchTerm, difficultyFilter, sortBy]);

  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <Layout>
      <Head>
        <title>All Recipes - Global Authentic Recipes</title>
        <meta name="description" content="Browse authentic recipes from around the world." />
      </Head>

      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Explore Recipes</h1>
            <p className="text-lg text-slate-600">Discover {data.length} authentic dishes from around the world</p>
          </div>
          <Link href="/add-recipe" className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
            + Add Recipe
          </Link>
        </div>
      </motion.section>

      {/* Filters Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Search Recipes</label>
            <input
              type="text"
              placeholder="Search by title or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
            >
              <option value="all">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="quickest">Quickest First</option>
            </select>
          </div>
        </div>
      </motion.section>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-slate-100 animate-pulse">
              <div className="h-56 bg-slate-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
          <p className="font-semibold mb-2">Error loading recipes</p>
          <p className="text-sm">There was a problem loading the recipes. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAndSortedRecipes.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-xl">
          <p className="text-2xl font-semibold text-slate-700 mb-2">No recipes found</p>
          <p className="text-slate-600 mb-6">
            {searchTerm || difficultyFilter !== 'all' ? 'Try adjusting your filters.' : 'Be the first to share a recipe!'}
          </p>
          <Link href="/add-recipe" className="inline-block px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
            Add First Recipe
          </Link>
        </div>
      )}

      {/* Recipes Grid */}
      {!isLoading && !error && filteredAndSortedRecipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedRecipes.map((recipe, index) => (
            <motion.article
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <Link href={`/recipes/${recipe.id}`}>
                <div className="h-full bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-56 sm:h-48 bg-slate-100">
                    <img
                      src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Difficulty Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                        recipe.difficulty === 'Easy' ? 'bg-green-500' :
                        recipe.difficulty === 'Medium' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <p className="text-white font-semibold">View Recipe</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {recipe.title}
                    </h3>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between mb-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span>⏱️</span>
                        {recipe.cooking_time || '?'} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span>📊</span>
                        {recipe.difficulty}
                      </span>
                    </div>

                    {/* Ingredients Preview */}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {recipe.ingredients.split('\n')[0]}
                    </p>

                    {/* View Button */}
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg group-hover:shadow-md transition-all opacity-0 group-hover:opacity-100">
                      View Recipe →
                    </button>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* Results Count */}
      {!isLoading && !error && (
        <div className="text-center mt-12 text-slate-600">
          <p className="text-sm">
            Showing <span className="font-bold text-slate-900">{filteredAndSortedRecipes.length}</span> of <span className="font-bold text-slate-900">{data.length}</span> recipes
          </p>
        </div>
      )}
    </Layout>
  );
}
