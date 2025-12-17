// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../src/components/layout.tsx';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const fetcher = url => fetch(url).then(res => res.json());

export default function RecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, isLoading } = useSWR(id ? `/api/recipes/${id}` : null, fetcher);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-16 h-16 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading recipe...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-2xl font-bold text-red-800 mb-2">Recipe Not Found</p>
            <p className="text-red-700 mb-6">We couldn't find the recipe you're looking for.</p>
            <Link href="/recipes" className="inline-block px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
              Back to Recipes
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const ingredients = (data.ingredients || '').split('\n').filter(Boolean);
  const steps = (data.steps || '').split('\n').filter(Boolean);

  return (
    <Layout>
      <Head>
        <title>{data.title} - Global Authentic Recipes</title>
        <meta name="description" content={data.history || data.title} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.history || data.title} />
        <meta property="og:image" content={data.image} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Recipe",
          name: data.title,
          image: [data.image],
          recipeIngredient: ingredients,
          recipeInstructions: steps.map(s => ({ "@type": "HowToStep", text: s })),
          cookTime: `PT${data.cooking_time}M`,
          recipeYield: "1",
        }) }} />
      </Head>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link href="/recipes" className="inline-flex items-center gap-2 px-4 py-2 text-amber-700 font-semibold hover:bg-amber-50 rounded-lg transition-colors">
          ← Back to Recipes
        </Link>
      </motion.div>

      {/* Recipe Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30"></div>
            <img
              src={data.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'}
              alt={data.title}
              className="relative w-full rounded-2xl shadow-2xl object-cover aspect-square"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{data.title}</h1>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 text-amber-800 rounded-lg font-semibold">
                  <span>⏱️</span>
                  {data.cooking_time || '?'} minutes
                </div>
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white ${
                  data.difficulty === 'Easy' ? 'bg-green-500' :
                  data.difficulty === 'Medium' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}>
                  <span>📊</span>
                  {data.difficulty || 'Unknown'} Level
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Plating Style</p>
                <p className="font-semibold text-slate-900">{data.platingStyle || 'Traditional'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Added</p>
                <p className="font-semibold text-slate-900">{new Date(data.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                Save Recipe
              </button>
              <button className="flex-1 px-6 py-3 border-2 border-amber-600 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                Share Recipe
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Origin/History */}
      {data.history && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gradient-to-r from-amber-50 to-rose-50 p-8 rounded-xl border border-amber-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🌍</span>
            Origin & History
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">{data.history}</p>
        </motion.section>
      )}

      {/* Ingredients and Steps */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-8 mb-12"
      >
        {/* Ingredients */}
        <div className="md:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>🥘</span>
              Ingredients
            </h2>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0"
                >
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-600 cursor-pointer" />
                  <span className="text-slate-700">{ingredient}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>👨‍🍳</span>
            Cooking Steps
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-slate-700 leading-relaxed">{step}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Related Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-8 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Want to Add Your Own Recipe?</h2>
        <p className="text-amber-50 mb-6">Share your family recipes and be part of our global cooking community</p>
        <Link href="/add-recipe" className="inline-block px-8 py-3 bg-white text-amber-700 font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          Add Your Recipe
        </Link>
      </motion.section>
    </Layout>
  );
}
