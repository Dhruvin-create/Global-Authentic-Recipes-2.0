// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../src/components/layout.tsx';
import RecipeCard from '../../src/components/recipe-card.tsx';
import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = url => fetch(url).then(res => res.json());

const FilterButton = ({ active, onClick, children, count }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
        : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50'
    }`}
  >
    <span className="flex items-center gap-2">
      {children}
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-white/20' : 'bg-slate-100'
        }`}>
          {count}
        </span>
      )}
    </span>
  </motion.button>
);

const ViewToggle = ({ view, setView }) => (
  <div className="flex bg-slate-100 rounded-lg p-1">
    <button
      onClick={() => setView('grid')}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        view === 'grid'
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Grid
      </span>
    </button>
    <button
      onClick={() => setView('list')}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        view === 'list'
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        List
      </span>
    </button>
  </div>
);

export default function Recipes() {
  const { data = [], error, isLoading } = useSWR('/api/recipes', fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [authenticityFilter, setAuthenticityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [view, setView] = useState('grid');

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = data.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (recipe.origin_country && recipe.origin_country.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
      const matchesAuthenticity = authenticityFilter === 'all' || recipe.authenticity_status === authenticityFilter;
      return matchesSearch && matchesDifficulty && matchesAuthenticity;
    });

    // Sort recipes
    if (sortBy === 'newest') {
      filtered = [...filtered].reverse();
    } else if (sortBy === 'quickest') {
      filtered = [...filtered].sort((a, b) => (a.cooking_time || 0) - (b.cooking_time || 0));
    } else if (sortBy === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [data, searchTerm, difficultyFilter, authenticityFilter, sortBy]);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const authenticityTypes = [
    { key: 'verified', label: 'Verified', icon: '✓' },
    { key: 'community', label: 'Community', icon: '👥' },
    { key: 'ai_pending', label: 'AI Generated', icon: '🤖' }
  ];

  const getCounts = () => {
    const counts = {
      difficulty: { all: data.length },
      authenticity: { all: data.length }
    };

    difficulties.forEach(diff => {
      counts.difficulty[diff] = data.filter(r => r.difficulty === diff).length;
    });

    authenticityTypes.forEach(auth => {
      counts.authenticity[auth.key] = data.filter(r => r.authenticity_status === auth.key).length;
    });

    return counts;
  };

  const counts = getCounts();

  return (
    <Layout>
      <Head>
        <title>All Recipes - Global Authentic Recipes</title>
        <meta name="description" content="Browse authentic recipes from around the world. Filter by difficulty, authenticity, and cuisine type." />
      </Head>

      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Explore Recipes
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"> Collection</span>
            </h1>
            <p className="text-lg text-slate-600">
              Discover <span className="font-semibold text-amber-600">{data.length}</span> authentic dishes from around the world
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/map" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
              🗺️ Recipe Map
            </Link>
            <Link href="/add-recipe" className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
              ➕ Add Recipe
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Filters Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 shadow-lg mb-8"
      >
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recipes, ingredients, or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-6">
          {/* Difficulty Filter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Difficulty Level</h3>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={difficultyFilter === 'all'}
                onClick={() => setDifficultyFilter('all')}
                count={counts.difficulty.all}
              >
                All Levels
              </FilterButton>
              {difficulties.map(diff => (
                <FilterButton
                  key={diff}
                  active={difficultyFilter === diff}
                  onClick={() => setDifficultyFilter(diff)}
                  count={counts.difficulty[diff]}
                >
                  {diff}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Authenticity Filter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Recipe Authenticity</h3>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={authenticityFilter === 'all'}
                onClick={() => setAuthenticityFilter('all')}
                count={counts.authenticity.all}
              >
                All Types
              </FilterButton>
              {authenticityTypes.map(auth => (
                <FilterButton
                  key={auth.key}
                  active={authenticityFilter === auth.key}
                  onClick={() => setAuthenticityFilter(auth.key)}
                  count={counts.authenticity[auth.key]}
                >
                  <span className="flex items-center gap-1.5">
                    {auth.icon} {auth.label}
                  </span>
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Sort and View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="quickest">Quickest First</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
            
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>
      </motion.section>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-8"
      >
        <p className="text-slate-600">
          Showing <span className="font-bold text-slate-900">{filteredAndSortedRecipes.length}</span> of <span className="font-bold text-slate-900">{data.length}</span> recipes
        </p>
        
        {(searchTerm || difficultyFilter !== 'all' || authenticityFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDifficultyFilter('all');
              setAuthenticityFilter('all');
            }}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`rounded-xl overflow-hidden bg-slate-100 animate-pulse ${
              view === 'grid' ? 'h-80' : 'h-24'
            }`}></div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 text-red-800 px-8 py-6 rounded-xl text-center"
        >
          <div className="text-4xl mb-2">⚠️</div>
          <p className="font-semibold mb-2">Error loading recipes</p>
          <p className="text-sm">There was a problem loading the recipes. Please try again.</p>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAndSortedRecipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl border border-amber-100"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No recipes found</h3>
          <p className="text-lg text-slate-600 mb-8">
            {searchTerm || difficultyFilter !== 'all' || authenticityFilter !== 'all' 
              ? 'Try adjusting your filters or search terms.' 
              : 'Be the first to share a recipe with our community!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(searchTerm || difficultyFilter !== 'all' || authenticityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDifficultyFilter('all');
                  setAuthenticityFilter('all');
                }}
                className="px-6 py-3 border-2 border-amber-600 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-all"
              >
                Clear Filters
              </button>
            )}
            <Link href="/add-recipe" className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
              Add Recipe
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recipes Display */}
      {!isLoading && !error && filteredAndSortedRecipes.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={view === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          >
            {filteredAndSortedRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                showCookMode={true}
                variant={view === 'list' ? 'compact' : 'default'}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Load More / Pagination could go here */}
      {!isLoading && !error && filteredAndSortedRecipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 pt-8 border-t border-slate-200"
        >
          <p className="text-slate-600 mb-4">
            You've seen all <span className="font-bold text-slate-900">{filteredAndSortedRecipes.length}</span> recipes
          </p>
          <Link href="/add-recipe" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
            <span>➕</span>
            Add Your Recipe
          </Link>
        </motion.div>
      )}
    </Layout>
  );
}
