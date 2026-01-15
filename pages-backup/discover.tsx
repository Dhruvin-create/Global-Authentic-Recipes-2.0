// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../src/components/layout.tsx';
import { motion } from 'framer-motion';
import { useState } from 'react';

const DiscoveryCard = ({ recipe, onSave }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300"
  >
    <div className="aspect-video relative overflow-hidden">
      <img
        src={recipe.image_url || 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80'}
        alt={recipe.title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
          {recipe.origin_country}
        </span>
      </div>
    </div>
    
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{recipe.title}</h3>
      <p className="text-slate-600 mb-4 line-clamp-2">{recipe.cultural_context}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>⏱️ {recipe.cooking_time}m</span>
          <span>👨‍🍳 {recipe.difficulty}</span>
          <span>🍽️ {recipe.cuisine}</span>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => onSave(recipe)}
          className="flex-1 btn btn-primary"
        >
          Save Recipe
        </button>
        <button className="btn btn-ghost">
          View Details
        </button>
      </div>
    </div>
  </motion.div>
);

const LoadingCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
    <div className="aspect-video bg-slate-200 animate-pulse"></div>
    <div className="p-6">
      <div className="h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-slate-200 rounded animate-pulse mb-4 w-3/4"></div>
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-slate-200 rounded animate-pulse"></div>
        <div className="w-24 h-10 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveredRecipes, setDiscoveredRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/recipes/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          count: 6
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDiscoveredRecipes(data.recipes);
      } else {
        console.error('Discovery failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recipe,
          authenticity_status: 'ai_pending'
        }),
      });

      if (response.ok) {
        alert('Recipe saved successfully!');
      } else {
        alert('Failed to save recipe');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save recipe');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Discover Recipes - Global Authentic Recipes</title>
        <meta name="description" content="Discover authentic recipes from around the world with images, ingredients, and cultural origin stories." />
      </Head>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-6"
          >
            Discover <span className="text-gradient-primary">Authentic Recipes</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto"
          >
            Search for any dish and discover authentic recipes with detailed ingredients, 
            step-by-step instructions, beautiful images, and fascinating cultural origin stories.
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any dish... (e.g., 'Italian pasta', 'Japanese ramen', 'Indian curry')"
                className="flex-1 px-6 py-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? '🔍 Searching...' : '🌍 Discover'}
              </button>
            </div>
          </motion.form>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="text-slate-500 font-medium">Popular searches:</span>
            {['Italian Pasta', 'Japanese Sushi', 'Indian Curry', 'French Pastry', 'Mexican Tacos', 'Thai Pad Thai'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isSearching && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Discovering recipes for "{searchQuery}"...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          </div>
        )}

        {!isSearching && discoveredRecipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Found {discoveredRecipes.length} authentic recipes for "{searchQuery}"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discoveredRecipes.map((recipe, index) => (
                <DiscoveryCard
                  key={index}
                  recipe={recipe}
                  onSave={handleSaveRecipe}
                />
              ))}
            </div>
          </motion.div>
        )}

        {!isSearching && hasSearched && discoveredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No recipes found</h3>
            <p className="text-lg text-slate-600 mb-8">
              Try searching for a different dish or cuisine type
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setHasSearched(false);
                setDiscoveredRecipes([]);
              }}
              className="btn btn-primary"
            >
              Try Another Search
            </button>
          </motion.div>
        )}

        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Global Cuisine</h3>
                <p className="text-slate-600">Discover authentic recipes from every corner of the world</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Rich Stories</h3>
                <p className="text-slate-600">Learn the cultural history and origin of each dish</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Beautiful Images</h3>
                <p className="text-slate-600">High-quality photos to inspire your cooking</p>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </Layout>
  );
}