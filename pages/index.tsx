// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../src/components/layout.tsx';
import SmartSearchBar from '../src/components/smart-search-bar.tsx';
import RecipeCard from '../src/components/recipe-card.tsx';
import CookModeButton from '../src/components/cook-mode-button.tsx';
import MapPreviewCard from '../src/components/map-preview-card.tsx';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = url => fetch(url).then(res => res.json());

const FeatureCard = ({ icon, title, description, href, gradient }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="group cursor-pointer"
  >
    <Link href={href}>
      <div className={`p-8 rounded-2xl bg-gradient-to-br ${gradient} border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm`}>
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/90 leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors">
          <span className="text-sm font-semibold">Explore →</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

const StatCard = ({ number, label, icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-lg"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-bold text-slate-900 mb-1">{number}</div>
    <div className="text-sm text-slate-600 font-medium">{label}</div>
  </motion.div>
);

export default function Home() {
  const { data: recipes = [], isLoading } = useSWR('/api/recipes', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const featuredRecipes = recipes.slice(0, 6);

  const stats = {
    recipes: recipes.length,
    countries: new Set(recipes.map(r => r.origin_country).filter(Boolean)).size,
    verified: recipes.filter(r => r.authenticity_status === 'verified').length,
    cookTime: Math.round(recipes.reduce((acc, r) => acc + (r.cooking_time || 0), 0) / recipes.length) || 0
  };

  return (
    <Layout>
      <Head>
        <title>Global Authentic Recipes - Discover Recipes From Around the World</title>
        <meta name="description" content="Discover authentic recipes and their origins from around the world. Learn cooking techniques, explore Cook Mode, and find recipes on our interactive map." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Global Authentic Recipes - Discover Recipes From Around the World" />
        <meta property="og:description" content="Explore authentic recipes from different cultures with Cook Mode, Recipe Map, and Smart Search features." />
        <meta property="og:type" content="website" />
      </Head>

      {/* Enhanced Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-rose-50 px-6 py-16 md:px-12 md:py-24 mb-24 -mx-4 md:-mx-6"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-200 to-pink-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-60"></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-sm font-bold mb-6 border border-amber-200"
            >
              🌍 Welcome to Global Kitchen
            </motion.span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-900 mb-8">
              Discover <span className="text-gradient-primary">Authentic Recipes</span> From Around the World
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 mb-10 leading-relaxed">
              Welcome to a global kitchen where every dish tells a story. Explore authentic recipes, master cooking techniques with Cook Mode, and discover dishes on our interactive map.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/recipes" className="btn btn-primary btn-lg group">
                <span>Browse Recipes</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/map" className="btn btn-secondary btn-lg">
                🗺️ Explore Map
              </Link>
            </div>

            {/* Smart Search Integration */}
            <div className="max-w-md">
              <SmartSearchBar placeholder="Search recipes, cuisines, or ingredients..." />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"
                alt="Global authentic dishes"
                className="relative w-full rounded-3xl shadow-2xl object-cover aspect-square hover:scale-105 transition-transform duration-500"
              />
              
              {/* Floating Cook Mode Button */}
              <div className="absolute bottom-4 right-4">
                <CookModeButton recipeId="demo" variant="floating" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-24"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard number={stats.recipes} label="Recipes" icon="🍽️" />
          <StatCard number={stats.countries} label="Countries" icon="🌍" />
          <StatCard number={stats.verified} label="Verified" icon="✅" />
          <StatCard number={`${stats.cookTime}m`} label="Avg Cook Time" icon="⏱️" />
        </div>
      </motion.section>

      {/* Enhanced Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-24"
      >
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Powerful Features for <span className="text-gradient-primary">Home Chefs</span>
          </motion.h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Everything you need to become a world-class home chef with cutting-edge cooking tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🍳"
            title="Cook Mode"
            description="Distraction-free cooking experience with step-by-step guidance, timers, and voice commands."
            href="/recipes"
            gradient="from-amber-500 to-orange-600"
          />
          <FeatureCard
            icon="🗺️"
            title="Recipe Map"
            description="Explore authentic recipes by geographic origin and discover dishes from around the world."
            href="/map"
            gradient="from-blue-500 to-purple-600"
          />
          <FeatureCard
            icon="🔍"
            title="Smart Search"
            description="AI-powered search with auto-suggestions, ingredient matching, and authenticity filtering."
            href="/recipes"
            gradient="from-green-500 to-teal-600"
          />
        </div>
      </motion.section>

      {/* Map Preview Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explore Recipes by <span className="text-gradient-secondary">Location</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover authentic dishes from their countries of origin
          </p>
        </div>
        
        <MapPreviewCard recipes={recipes.slice(0, 12)} />
      </motion.section>

      {/* Featured Recipes Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-24"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Featured Recipes</h2>
            <p className="text-lg text-slate-600">Recently added authentic dishes from our community</p>
          </div>
          <Link href="/recipes" className="hidden sm:inline-block btn btn-ghost">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="loading-skeleton rounded-2xl h-80"></div>
            ))}
          </div>
        ) : featuredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                showCookMode={true}
                variant="featured"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl border border-amber-100"
          >
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No recipes yet</h3>
            <p className="text-lg text-slate-600 mb-8">Be the first to share an authentic recipe!</p>
            <Link href="/add-recipe" className="btn btn-primary">
              Add First Recipe
            </Link>
          </motion.div>
        )}
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-8 py-20 md:px-16 md:py-28 text-center text-white mb-24 -mx-4 md:-mx-6"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Cook?</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of home chefs exploring authentic recipes with our Cook Mode, Recipe Map, and Smart Search features.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recipes" className="px-10 py-4 bg-white text-amber-700 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg">
                Start Cooking Now
              </Link>
              <Link href="/add-recipe" className="px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-amber-700 transition-all duration-300 text-lg">
                Share Your Recipe
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
}
