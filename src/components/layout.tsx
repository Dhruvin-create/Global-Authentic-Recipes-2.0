// @ts-nocheck
import { motion, AnimatePresence } from "framer-motion";
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from './footer.tsx';

function EnhancedNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Recipes', href: '/recipes', icon: '📖' },
    { label: 'Research', href: '/research', icon: '🔍' },
    { label: 'Map View', href: '/map', icon: '🗺️' },
    { label: 'Add Recipe', href: '/add-recipe', icon: '➕', primary: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-amber-100' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-sm">🍳</span>
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                Global Recipes
              </span>
              <p className="text-xs text-slate-500 -mt-1">Authentic • Cultural • Delicious</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  item.primary
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : router.pathname === item.href
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-amber-600'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
              <motion.span 
                animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
                className="h-0.5 bg-slate-700 transition-all duration-300"
              />
              <motion.span 
                animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                className="h-0.5 bg-slate-700 transition-all duration-300"
              />
              <motion.span 
                animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
                className="h-0.5 bg-slate-700 transition-all duration-300"
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-amber-100 bg-white/95 backdrop-blur-md"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      item.primary
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : router.pathname === item.href
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default function Layout({ children, className = "" }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Global Authentic Recipes & Origins - discover recipes and their stories." />
        <meta property="og:site_name" content="Global Authentic Recipes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <EnhancedNavbar />
        
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex-grow pt-16"
        >
          <main className={className}>{children}</main>
        </motion.div>
        
        <Footer />
      </div>
    </>
  );
}
