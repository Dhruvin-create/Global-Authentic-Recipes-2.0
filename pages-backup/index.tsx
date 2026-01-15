// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../src/components/layout.tsx';
import SmartSearchBar from '../src/components/smart-search-bar.tsx';
import RecipeCard from '../src/components/recipe-card.tsx';
import CookModeButton from '../src/components/cook-mode-button.tsx';

import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = url => fetch(url).then(res => res.json());

const FeatureCard = ({ icon, title, description, href, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -12, scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className="group cursor-pointer"
  >
    <Link href={href}>
      <div className={`relative p-10 rounded-3xl ${gradient} border border-white/30 shadow-food hover:shadow-food-lg transition-all duration-500 backdrop-blur-sm overflow-hidden`}>
        {/* Floating Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">{icon}</div>
          <h3 className="text-2xl font-bold text-white mb-4 font-display">{title}</h3>
          <p className="text-white/90 leading-relaxed text-lg mb-6">{description}</p>
          <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
            <span className="text-base font-bold">Explore Now</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const StatCard = ({ number, label, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-saffron-100 shadow-food hover:shadow-food-lg transition-all duration-300"
  >
    <div className="text-5xl mb-4 animate-bounce-gentle">{icon}</div>
    <div className="text-4xl font-bold text-slate-900 mb-2 font-display">{number}</div>
    <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">{label}</div>
  </motion.div>
);

const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-10, 10, -10] }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { data: apiResponse, isLoading } = useSWR('/api/recipes', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Extract recipes from API response
  const recipes = apiResponse?.recipes || [];
  const safeRecipes = Array.isArray(recipes) ? recipes : [];
  const featuredRecipes = safeRecipes.slice(0, 6);

  const stats = {
    recipes: safeRecipes.length,
    countries: new Set(safeRecipes.map(r => r.origin_country).filter(Boolean)).size,
    verified: safeRecipes.filter(r => r.authenticity_status === 'verified').length,
    cookTime: safeRecipes.length > 0 ? Math.round(safeRecipes.reduce((acc, r) => acc + (r.cooking_time || 0), 0) / safeRecipes.length) : 0
  };

  return (
    <Layout className="px-0">
      <Head>
        <title>Global Authentic Recipes - Discover Culinary Treasures From Around the World</title>
        <meta name="description" content="Embark on a culinary journey with authentic recipes from every corner of the globe. Master cooking techniques with Cook Mode, explore origins on our interactive map, and discover your next favorite dish." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Global Authentic Recipes - Culinary Adventures Await" />
        <meta property="og:description" content="Discover authentic recipes, master Cook Mode, explore Recipe Map, and join a community of passionate food lovers." />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      {/* Spectacular Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative overflow-hidden rounded-[3rem] bg-hero-gradient px-8 py-20 md:px-16 md:py-32 mb-32 mx-6 md:mx-8"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <FloatingElement delay={0} duration={4}>
            <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-saffron-300 to-orange-400 rounded-full blur-3xl"></div>
          </FloatingElement>
          <FloatingElement delay={1} duration={5}>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-tomato-300 to-pink-400 rounded-full blur-3xl"></div>
          </FloatingElement>
          <FloatingElement delay={2} duration={3.5}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-herb-300 to-emerald-400 rounded-full blur-2xl opacity-70"></div>
          </FloatingElement>
        </div>

        {/* Decorative Food Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0.5} duration={6}>
            <div className="absolute top-20 left-20 text-6xl opacity-20">🍅</div>
          </FloatingElement>
          <FloatingElement delay={1.5} duration={4}>
            <div className="absolute top-40 right-32 text-5xl opacity-15">🌿</div>
          </FloatingElement>
          <FloatingElement delay={2.5} duration={5}>
            <div className="absolute bottom-32 left-1/3 text-7xl opacity-10">🧄</div>
          </FloatingElement>
          <FloatingElement delay={3} duration={4.5}>
            <div className="absolute bottom-20 right-20 text-6xl opacity-20">🫒</div>
          </FloatingElement>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-saffron-100 to-orange-100 text-saffron-800 rounded-full text-base font-bold mb-8 border border-saffron-200 shadow-lg"
            >
              🌍 Welcome to Your Global Kitchen
            </motion.span>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-slate-900 mb-10 font-display">
              Discover <span className="text-gradient-primary">Culinary Treasures</span> From Every Corner of the World
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 mb-12 leading-relaxed font-body">
              Embark on an extraordinary culinary journey where every recipe tells a story, every dish carries tradition, and every meal becomes an adventure. From bustling street markets to grandmother's kitchen secrets.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/recipes" className="btn btn-primary btn-lg group shadow-food-lg">
                  <span>Start Your Journey</span>
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/recipes" className="btn btn-secondary btn-lg shadow-herb">
                  🔍 Discover Recipes
                </Link>
              </motion.div>
            </div>

            {/* Enhanced Smart Search */}
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-saffron-500 to-tomato-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-food">
                  <SmartSearchBar />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-saffron-400 via-orange-500 to-tomato-500 rounded-[3rem] blur-3xl opacity-40 animate-pulse"></div>
              <motion.img
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.5 }}
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                alt="Exquisite global cuisine spread"
                className="relative w-full rounded-[3rem] shadow-premium object-cover aspect-square"
              />
              
              {/* Floating Cook Mode Button */}
              <motion.div 
                className="absolute bottom-6 right-6"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <CookModeButton recipeId="demo" variant="floating" />
              </motion.div>

              {/* Floating Recipe Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">4.9/5</div>
                    <div className="text-xs text-slate-600">Avg Rating</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Stats Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display"
            >
              Trusted by <span className="text-gradient-primary">Food Lovers</span> Worldwide
            </motion.h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join our growing community of passionate home chefs and culinary explorers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number={stats.recipes || "50+"} label="Authentic Recipes" icon="🍽️" delay={0.1} />
            <StatCard number={stats.countries || "25+"} label="Countries" icon="🌍" delay={0.2} />
            <StatCard number={stats.verified || "30+"} label="Verified Dishes" icon="✅" delay={0.3} />
            <StatCard number={`${stats.cookTime || 45}m`} label="Avg Cook Time" icon="⏱️" delay={0.4} />
          </div>
        </motion.section>

        {/* Revolutionary Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 font-display"
            >
              Revolutionary Features for <span className="text-gradient-primary">Master Chefs</span>
            </motion.h2>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Experience cooking like never before with our cutting-edge culinary technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon="🍳"
              title="Immersive Cook Mode"
              description="Step into a distraction-free culinary sanctuary with voice-guided instructions, smart timers, and adaptive cooking assistance that evolves with your skills."
              href="/recipes"
              gradient="bg-gradient-to-br from-saffron-500 via-orange-500 to-tomato-600"
              delay={0.1}
            />
            <FeatureCard
              icon="🔍"
              title="AI-Powered Discovery"
              description="Unlock culinary possibilities with intelligent search that understands your taste preferences, dietary needs, and cooking expertise level."
              href="/recipes"
              gradient="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600"
              delay={0.2}
            />
            <FeatureCard
              icon="🌐"
              title="Internet Recipe Search"
              description="Access thousands of authentic recipes from across the web, curated and organized for the perfect cooking experience."
              href="/discover"
              gradient="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
              delay={0.3}
            />
          </div>
        </motion.section>

        {/* Recipe Discovery Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
              Discover <span className="text-gradient-secondary">Amazing Recipes</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Find authentic recipes from across the internet, curated and organized for your culinary adventures
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-premium">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4 font-display">
                    Smart Recipe Discovery
                  </h3>
                  <p className="text-lg text-slate-600 mb-6">
                    Our intelligent system searches the web for authentic recipes, filters them by quality, 
                    and presents them in a beautiful, easy-to-follow format.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/discover" className="btn btn-primary">
                      🌐 Discover Recipes
                    </Link>
                    <Link href="/research" className="btn btn-ghost">
                      🔬 Recipe Research
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 border border-purple-200">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600">Searching recipe databases...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600">Analyzing ingredients & instructions...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600">Curating best results...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Featured Recipes Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-display">
                Featured <span className="text-gradient-primary">Culinary Masterpieces</span>
              </h2>
              <p className="text-xl text-slate-600">Handpicked authentic dishes from our global community</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} className="hidden sm:block">
              <Link href="/recipes" className="btn btn-ghost btn-lg">
                View All Recipes →
              </Link>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="loading-skeleton rounded-3xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <RecipeCard
                    recipe={recipe}
                    index={index}
                    showCookMode={true}
                    variant="featured"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-gradient-to-br from-slate-50 via-saffron-50 to-orange-50 rounded-3xl border border-saffron-100"
            >
              <div className="text-8xl mb-6">👨‍🍳</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 font-display">No recipes yet</h3>
              <p className="text-xl text-slate-600 mb-10">Be the first to share an authentic culinary masterpiece!</p>
              <Link href="/add-recipe" className="btn btn-primary btn-lg">
                Share Your Recipe
              </Link>
            </motion.div>
          )}
        </motion.section>

        {/* Spectacular CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-saffron-600 via-orange-600 to-tomato-600 px-10 py-24 md:px-20 md:py-32 text-center text-white mb-32"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-food-pattern"></div>
            <FloatingElement delay={0} duration={4}>
              <div className="absolute top-10 right-10 text-8xl opacity-30">🌶️</div>
            </FloatingElement>
            <FloatingElement delay={1} duration={5}>
              <div className="absolute bottom-10 left-10 text-7xl opacity-20">🥘</div>
            </FloatingElement>
            <FloatingElement delay={2} duration={3}>
              <div className="absolute top-1/2 right-1/4 text-6xl opacity-25">🍜</div>
            </FloatingElement>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl md:text-7xl font-bold mb-8 font-display">Ready to Cook Something Amazing?</h2>
              <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                Join thousands of passionate home chefs exploring authentic recipes with our revolutionary Cook Mode, Smart Recipe Discovery, and AI-powered search features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/recipes" className="px-12 py-5 bg-white text-saffron-700 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-xl">
                    Start Cooking Now
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/discover" className="px-12 py-5 border-3 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-saffron-700 transition-all duration-300 text-xl">
                    Discover Recipes
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}