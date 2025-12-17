// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../src/components/layout.tsx';
import { motion } from 'framer-motion';
import useSWR from 'swr';

const fetcher = url => fetch(url).then(res => res.json());

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 rounded-xl bg-white border border-amber-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </motion.div>
);

export default function Home() {
  const { data: recipes = [], isLoading } = useSWR('/api/recipes', fetcher);
  const featuredRecipes = recipes.slice(0, 3);

  return (
    <Layout>
      <Head>
        <title>Global Authentic Recipes - Discover Recipes From Around the World</title>
        <meta name="description" content="Discover authentic recipes and their origins from around the world. Learn cooking techniques and food stories from global cuisines." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-white to-rose-50 px-6 py-12 md:px-12 md:py-20 mb-20 -mx-4 md:-mx-6"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-200 to-pink-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              🌍 Welcome to Global Kitchen
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 mb-6">
              Discover <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Authentic Recipes</span> From Around the World
            </h1>
            <p className="text-lg md:text-xl text-slate-700 mb-8 leading-relaxed">
              Welcome to a global kitchen where every dish tells a story. Explore authentic recipes from different cultures, learn their origins, and master cooking techniques passed down through generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/recipes" className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center">
                Browse Recipes
              </Link>
              <Link href="/add-recipe" className="px-8 py-4 border-2 border-amber-600 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-all duration-300 text-center">
                Share Your Recipe
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80"
                alt="Global authentic dishes"
                className="relative w-full rounded-2xl shadow-2xl object-cover aspect-square"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Global Recipes?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to become a world-class home chef</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🌟"
            title="Authentic Recipes"
            description="Genuine recipes from home cooks around the world, not altered for convenience."
          />
          <FeatureCard
            icon="📖"
            title="Learn Origins"
            description="Understand the history and cultural significance behind each dish you cook."
          />
          <FeatureCard
            icon="👨‍🍳"
            title="Share Knowledge"
            description="Contribute your family recipes and cooking wisdom to our global community."
          />
        </div>
      </motion.section>

      {/* Featured Recipes Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Featured Recipes</h2>
            <p className="text-slate-600">Recently added authentic dishes from our community</p>
          </div>
          <Link href="/recipes" className="hidden sm:inline-block px-6 py-2.5 text-amber-700 font-semibold hover:bg-amber-50 rounded-lg transition-colors">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : featuredRecipes.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <motion.article
                key={recipe.id}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="relative overflow-hidden rounded-xl mb-4 bg-slate-100 h-64 sm:h-56">
                    <img
                      src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <p className="text-white text-sm font-semibold">View Recipe</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">⏱️ {recipe.cooking_time} min</span>
                        <span className="flex items-center gap-1">📊 {recipe.difficulty}</span>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <p className="text-lg text-slate-600 mb-4">No recipes yet. Be the first to share!</p>
            <Link href="/add-recipe" className="inline-block px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
              Add First Recipe
            </Link>
          </div>
        )}
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-16 md:px-12 md:py-24 text-center text-white mb-20 -mx-4 md:-mx-6"
      >
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to Cook?</h2>
          <p className="text-lg md:text-xl text-amber-50 mb-8 max-w-2xl mx-auto">
            Explore our collection of authentic recipes and discover the flavors of the world. Your next favorite dish is waiting.
          </p>
          <Link href="/recipes" className="inline-block px-8 py-4 bg-white text-amber-700 font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            Start Cooking Now
          </Link>
        </div>
      </motion.section>
    </Layout>
  );
}
