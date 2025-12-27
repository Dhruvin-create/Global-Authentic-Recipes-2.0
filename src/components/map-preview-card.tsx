// @ts-nocheck
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface MapPreviewCardProps {
  className?: string;
}

export default function MapPreviewCard({ className = '' }: MapPreviewCardProps) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [animatedDots, setAnimatedDots] = useState([]);

  // Sample recipe locations for preview
  const recipeLocations = [
    { id: 1, country: 'Italy', x: 45, y: 35, recipes: 12, color: 'bg-red-500' },
    { id: 2, country: 'Japan', x: 85, y: 25, recipes: 8, color: 'bg-pink-500' },
    { id: 3, country: 'Mexico', x: 15, y: 45, recipes: 15, color: 'bg-green-500' },
    { id: 4, country: 'India', x: 70, y: 40, recipes: 20, color: 'bg-orange-500' },
    { id: 5, country: 'France', x: 42, y: 30, recipes: 10, color: 'bg-blue-500' },
    { id: 6, country: 'Thailand', x: 75, y: 50, recipes: 7, color: 'bg-purple-500' },
  ];

  useEffect(() => {
    // Animate dots appearing
    const timer = setTimeout(() => {
      setAnimatedDots(recipeLocations.map(loc => loc.id));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 ${className}`}
    >
      <Link href="/map">
        <div className="group cursor-pointer">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                🗺️ Recipe Map
              </h3>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-blue-600"
              >
                →
              </motion.div>
            </div>
            <p className="text-slate-600 text-sm">
              Explore authentic recipes by their geographic origins
            </p>
          </div>

          {/* Interactive Map Preview */}
          <div className="relative h-48 mx-6 mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl overflow-hidden">
            {/* World Map Silhouette */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 100 60" className="w-full h-full">
                {/* Simplified world map paths */}
                <path
                  d="M10,20 Q15,15 25,18 L35,16 Q45,20 50,25 L60,22 Q70,18 80,25 L85,30 Q80,35 70,38 L60,40 Q50,45 40,42 L30,45 Q20,40 15,35 Z"
                  fill="currentColor"
                  className="text-slate-400"
                />
                <path
                  d="M15,35 Q20,32 30,35 L40,38 Q50,42 55,45 L65,43 Q70,40 75,45 L80,48 Q75,52 65,50 L55,52 Q45,48 35,50 L25,48 Q18,45 15,40 Z"
                  fill="currentColor"
                  className="text-slate-400"
                />
              </svg>
            </div>

            {/* Recipe Location Dots */}
            {recipeLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: animatedDots.includes(location.id) ? 1 : 0,
                  opacity: animatedDots.includes(location.id) ? 1 : 0
                }}
                transition={{ delay: index * 0.2, duration: 0.4 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                onMouseEnter={() => setHoveredCountry(location)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                {/* Pulsing Ring */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute inset-0 rounded-full ${location.color} opacity-30`}
                />
                
                {/* Main Dot */}
                <div className={`w-3 h-3 rounded-full ${location.color} shadow-lg relative z-10`} />
                
                {/* Recipe Count Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: hoveredCountry?.id === location.id ? 1 : 0 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-lg text-xs font-semibold text-slate-900 whitespace-nowrap"
                >
                  {location.country}: {location.recipes} recipes
                </motion.div>
              </motion.div>
            ))}

            {/* Connecting Lines Animation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {recipeLocations.slice(0, -1).map((location, index) => {
                const nextLocation = recipeLocations[index + 1];
                return (
                  <motion.line
                    key={`line-${index}`}
                    x1={`${location.x}%`}
                    y1={`${location.y}%`}
                    x2={`${nextLocation.x}%`}
                    y2={`${nextLocation.y}%`}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1 + index * 0.3, duration: 1 }}
                  />
                );
              })}
            </svg>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-slate-900"
              >
                Explore Recipe Map
              </motion.div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {recipeLocations.length} Countries
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {recipeLocations.reduce((sum, loc) => sum + loc.recipes, 0)} Recipes
                </span>
              </div>
              <span className="text-blue-600 font-medium group-hover:text-blue-700">
                View Map →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}