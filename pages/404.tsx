// @ts-nocheck
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - Global Authentic Recipes</title>
      </Head>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4 max-w-2xl"
        >
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-9xl md:text-[150px] font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              404
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Oops! Recipe Not Found
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. But don't worry, we have plenty of delicious recipes waiting for you to discover!
            </p>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="my-12 flex justify-center text-8xl"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👨‍🍳
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
            >
              Back to Home
            </Link>
            <Link
              href="/recipes"
              className="px-8 py-4 border-2 border-amber-600 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-all duration-300 text-center"
            >
              Browse Recipes
            </Link>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 p-6 bg-white/50 backdrop-blur rounded-xl border border-amber-100"
          >
            <p className="text-slate-700 font-semibold mb-3">Quick Links</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="text-amber-700 hover:text-amber-900 font-medium">Home</Link>
              <span className="text-slate-400">•</span>
              <Link href="/recipes" className="text-amber-700 hover:text-amber-900 font-medium">Recipes</Link>
              <span className="text-slate-400">•</span>
              <Link href="/add-recipe" className="text-amber-700 hover:text-amber-900 font-medium">Add Recipe</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
