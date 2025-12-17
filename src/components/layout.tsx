// @ts-nocheck
import { motion } from "framer-motion";
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Footer from './footer.tsx';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur sticky top-0 z-50 border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍳</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">Global Recipes</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/recipes" className="text-slate-700 font-medium hover:text-amber-600 transition-colors duration-200 relative group">
              Recipes
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/add-recipe" className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
              + Add Recipe
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
              <span className={`h-0.5 bg-slate-700 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-0.5 bg-slate-700 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`h-0.5 bg-slate-700 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-amber-100 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/recipes" className="block px-4 py-2.5 text-slate-700 font-medium hover:bg-amber-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Recipes
              </Link>
              <Link href="/add-recipe" className="block px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-md transition-all" onClick={() => setMobileMenuOpen(false)}>
                + Add Recipe
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Global Authentic Recipes & Origins - discover recipes and their stories." />
        <meta property="og:site_name" content="Global Authentic Recipes" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow">
          <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-lg px-4 sm:px-6 lg:px-8 py-8 mt-6 mb-6">
            <main>{children}</main>
          </div>
        </motion.div>
        <Footer />
      </div>
    </>
  );
}
