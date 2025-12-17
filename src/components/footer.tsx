// @ts-nocheck
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    Platform: [
      { label: 'Recipes', href: '/recipes' },
      { label: 'Add Recipe', href: '/add-recipe' },
      { label: 'Home', href: '/' },
    ],
    Community: [
      { label: 'Share Recipes', href: '/add-recipe' },
      { label: 'Explore', href: '/recipes' },
    ],
    Social: [
      { label: 'Facebook', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">🍳</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Global Recipes</span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-4">
              Discover authentic recipes and food stories from around the world. Share your culinary heritage with a global community of home cooks.
            </p>
            <div className="flex gap-3">
              {footerLinks.Social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-10 h-10 bg-slate-800 hover:bg-amber-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  title={link.label}
                >
                  {link.label === 'Facebook' && '📘'}
                  {link.label === 'Instagram' && '📷'}
                  {link.label === 'Twitter' && '𝕏'}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {Object.entries(footerLinks).slice(0, 2).map(([category, links], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (idx + 1) * 0.1 }}
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"></span>
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-amber-400 transition-colors duration-200 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"></span>
              Stay Updated
            </h3>
            <p className="text-slate-400 text-sm mb-4">Get new recipes and cooking tips delivered to your inbox.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2.5 bg-slate-800 text-white placeholder-slate-500 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mb-8"></div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm"
        >
          <p>
            © {currentYear} Global Authentic Recipes. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Contact</a>
          </div>
        </motion.div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-600 to-transparent opacity-30"></div>
      </div>
    </footer>
  );
}
