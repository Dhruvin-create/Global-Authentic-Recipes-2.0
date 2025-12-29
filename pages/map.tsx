import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../src/components/layout';
import SmartSearchBar from '../src/components/smart-search-bar';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Recipe {
  id: string;
  title: string;
  origin_country: string;
  cuisine: string;
  image_url?: string;
  cooking_time?: number;
  difficulty: string;
  authenticity_status: string;
  cultural_context?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  city?: string;
}

interface MapFilters {
  authenticity: string[];
  cuisine: string[];
  difficulty: string[];
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapPage() {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filters, setFilters] = useState<MapFilters>({
    authenticity: [],
    cuisine: [],
    difficulty: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<any>(null);

  // Fetch recipes data
  const { data: recipes = [], error } = useSWR('/api/recipes/map', fetcher);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 2,
        center: { lat: 20, lng: 0 },
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }, { lightness: 17 }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }, { lightness: 18 }]
          },
          {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }, { lightness: 16 }]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      setMap(mapInstance);
      setMapLoaded(true);
      setIsLoading(false);

      // Create info window
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 300
      });
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  // Create markers when recipes data is available
  useEffect(() => {
    if (!map || !recipes.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    recipes.forEach((recipe: Recipe) => {
      if (!recipe.latitude || !recipe.longitude) return;

      const position = { lat: recipe.latitude, lng: recipe.longitude };
      
      // Create custom marker icon based on authenticity
      const getMarkerIcon = (status: string) => {
        const colors = {
          verified: '#10b981', // green
          community: '#3b82f6', // blue
          'auto-generated (pending review)': '#f59e0b' // amber
        };
        
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: colors[status as keyof typeof colors] || '#6b7280',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8
        };
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        icon: getMarkerIcon(recipe.authenticity_status),
        title: recipe.title,
        animation: window.google.maps.Animation.DROP
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedRecipe(recipe);
        
        const content = `
          <div class="p-4 max-w-sm">
            <div class="flex items-start gap-3">
              <img 
                src="${recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=100&q=80'}" 
                alt="${recipe.title}"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">${recipe.title}</h3>
                <p class="text-sm text-gray-600 mb-2">${recipe.origin_country} • ${recipe.cuisine}</p>
                <div class="flex items-center gap-2 text-xs">
                  <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                    ${recipe.authenticity_status === 'verified' ? '✓ Verified' : 
                      recipe.authenticity_status === 'community' ? '👥 Community' : '🤖 AI Generated'}
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-200">
              <a href="/recipes/${recipe.id}" class="text-amber-600 hover:text-amber-700 font-medium text-sm">
                View Recipe →
              </a>
            </div>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      if (newMarkers.length === 1) {
        map.setZoom(8);
      }
    }
  }, [map, recipes]);

  // Filter recipes based on current filters and search
  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !recipe.origin_country.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filters.authenticity.length > 0 && !filters.authenticity.includes(recipe.authenticity_status)) {
      return false;
    }

    if (filters.cuisine.length > 0 && !filters.cuisine.includes(recipe.cuisine)) {
      return false;
    }

    if (filters.difficulty.length > 0 && !filters.difficulty.includes(recipe.difficulty)) {
      return false;
    }

    return true;
  });

  // Get unique values for filters
  const uniqueCuisines = [...new Set(recipes.map((r: Recipe) => r.cuisine))].filter(Boolean) as string[];
  const uniqueDifficulties = [...new Set(recipes.map((r: Recipe) => r.difficulty))].filter(Boolean) as string[];

  const handleFilterChange = (filterType: keyof MapFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const focusOnRecipe = (recipe: Recipe) => {
    if (!map || !recipe.latitude || !recipe.longitude) return;

    map.setCenter({ lat: recipe.latitude, lng: recipe.longitude });
    map.setZoom(10);
    setSelectedRecipe(recipe);

    // Find and trigger the marker
    const marker = markers.find(m => 
      m.getPosition().lat() === recipe.latitude && 
      m.getPosition().lng() === recipe.longitude
    );
    
    if (marker) {
      window.google.maps.event.trigger(marker, 'click');
    }
  };

  return (
    <Layout className="px-0">
      <Head>
        <title>Recipe Map - Discover Authentic Dishes by Location | Global Recipes</title>
        <meta name="description" content="Explore authentic recipes from around the world on our interactive map. Discover dishes by their geographic origins and cultural stories." />
      </Head>

      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Recipe Map</h1>
                <p className="text-slate-600">Discover authentic recipes from their places of origin</p>
              </div>
              
              {/* Search Bar */}
              <div className="lg:max-w-md">
                <SmartSearchBar />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Filters</h3>
              
              {/* Authenticity Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Authenticity</label>
                <div className="space-y-2">
                  {['verified', 'community', 'auto-generated (pending review)'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.authenticity.includes(status)}
                        onChange={() => handleFilterChange('authenticity', status)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-slate-600">
                        {status === 'verified' ? '✓ Verified' : 
                         status === 'community' ? '👥 Community' : '🤖 AI Generated'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisine Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Cuisine</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueCuisines.slice(0, 10).map(cuisine => (
                    <label key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.cuisine.includes(cuisine)}
                        onChange={() => handleFilterChange('cuisine', cuisine)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-slate-600">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                <div className="space-y-2">
                  {uniqueDifficulties.map(difficulty => (
                    <label key={difficulty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.difficulty.includes(difficulty)}
                        onChange={() => handleFilterChange('difficulty', difficulty)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-slate-600">{difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipe List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">
                    Recipes ({filteredRecipes.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {filteredRecipes.map((recipe: Recipe) => (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRecipe?.id === recipe.id
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => focusOnRecipe(recipe)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {recipe.image_url ? (
                            <Image
                              src={recipe.image_url}
                              alt={recipe.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              🍽️
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{recipe.title}</h4>
                          <p className="text-sm text-slate-600">{recipe.origin_country}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              recipe.authenticity_status === 'verified' 
                                ? 'bg-green-100 text-green-700'
                                : recipe.authenticity_status === 'community'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {recipe.authenticity_status === 'verified' ? '✓' : 
                               recipe.authenticity_status === 'community' ? '👥' : '🤖'}
                            </span>
                            <span className="text-xs text-slate-500">{recipe.cuisine}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-slate-600">Loading map...</p>
                </div>
              </div>
            )}
            
            <div ref={mapRef} className="w-full h-full" />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <h4 className="font-semibold text-slate-900 mb-2">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Verified Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Community Recipe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>AI Generated</span>
                </div>
              </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{recipes.length}</div>
                <div className="text-sm text-slate-600">Recipes Mapped</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}