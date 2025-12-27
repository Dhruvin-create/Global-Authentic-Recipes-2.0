// @ts-nocheck
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface CookModeButtonProps {
  recipeId: string;
  variant?: 'default' | 'floating' | 'compact';
  className?: string;
}

export default function CookModeButton({ 
  recipeId, 
  variant = 'default', 
  className = '' 
}: CookModeButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link href={`/recipes/${recipeId}/cook`}>
          <div className="group relative">
            {/* Main Button */}
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:shadow-3xl transition-all duration-300">
              🍳
            </div>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                Start Cook Mode
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
              </div>
            </div>

            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 animate-ping opacity-20"></div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/recipes/${recipeId}/cook`} className={className}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:shadow-md transition-all text-sm"
        >
          <span className="text-sm">🍳</span>
          Cook
        </motion.button>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/recipes/${recipeId}/cook`} className={className}>
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '0%' : '-100%' }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          <motion.span
            animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg"
          >
            🍳
          </motion.span>
          Start Cook Mode
        </span>

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%', skewX: -15 }}
          animate={{ x: isHovered ? '200%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>
    </Link>
  );
}