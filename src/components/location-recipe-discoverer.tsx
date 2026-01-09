import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

interface DiscoveredRecipe {
  id: string;
  title: string;
  origin_country: string;
  region?: string;
  city?: string;
  cuisine: string;
  ingredients: string[];
  cooking_steps: string[];
  cooking_time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cultural_context: string;
  authenticity_status: 'ai_pending';
  latitude: number;
  longitude: number;
  source_location: string;
}

interface LocationInfo {
  place_name: string;
  country: string;
  coordinates: { lat: number; lng: number };
  cultural_significance: string;
}

interface DiscoveryResult {
  success: boolean;
  discovered_recipes: DiscoveredRecipe[];
  location_info: LocationInfo;
  saved_count: number;
  preview_url?: string;
  error?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York City
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function LocationRecipeDiscoverer() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [autoSave, setAutoSave] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedLocation({ lat, lng });
      setShowInfoWindow(true);
      setDiscoveryResult(null);
    }
  }, []);

  const discoverRecipes = async () => {
    if (!selectedLocation) return;

    setIsDiscovering(true);
    try {
      const response = await fetch('/api/recipes/discover-by-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            coordinates: selectedLocation
          },
          search_query: searchQuery.trim() || undefined,
          auto_save: autoSave
        }),
      });

      const result: DiscoveryResult = await response.json();
      setDiscoveryResult(result);
      
      if (result.success && result.saved_count > 0) {
        alert(`Successfully discovered and saved ${result.saved_count} recipes!`);
      }
    } catch (error) {
      console.error('Discovery failed:', error);
      setDiscoveryResult({
        success: false,
        discovered_recipes: [],
        location_info: {
          place_name: '',
          country: '',
          coordinates: { lat: 0, lng: 0 },
          cultural_significance: ''
        },
        saved_count: 0,
        error: 'Failed to discover recipes'
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Recipes by Location
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Click anywhere on the map to discover traditional recipes from that location. 
          Our AI will research authentic dishes and cultural food traditions from the area.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
              Specific Search (Optional)
            </label>
            <input
              id="search-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., 'traditional breakfast', 'festival foods', 'street food'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-save recipes</span>
            </label>
            
            <button
              onClick={discoverRecipes}
              disabled={!selectedLocation || isDiscovering}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDiscovering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Discovering...</span>
                </>
              ) : (
                <span>Discover Recipes</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation || defaultCenter}
          zoom={selectedLocation ? 10 : 2}
          options={mapOptions}
          onClick={handleMapClick}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              onClick={() => setShowInfoWindow(true)}
            >
              {showInfoWindow && (
                <InfoWindow
                  position={selectedLocation}
                  onCloseClick={() => setShowInfoWindow(false)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold mb-2">Selected Location</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                    </p>
                    <button
                      onClick={discoverRecipes}
                      disabled={isDiscovering}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isDiscovering ? 'Discovering...' : 'Discover Recipes'}
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )}
        </GoogleMap>
      </div>

      {/* Discovery Results */}
      {discoveryResult && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {discoveryResult.success ? (
            <div>
              {/* Location Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {discoveryResult.location_info.place_name}
                </h3>
                <p className="text-blue-800 text-sm mb-2">
                  {discoveryResult.location_info.country}
                </p>
                <p className="text-blue-700 text-sm">
                  {discoveryResult.location_info.cultural_significance}
                </p>
              </div>

              {/* Discovered Recipes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Discovered Recipes ({discoveryResult.discovered_recipes.length})
                  </h3>
                  {discoveryResult.saved_count > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {discoveryResult.saved_count} saved to database
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {discoveryResult.discovered_recipes.map((recipe) => (
                    <div key={recipe.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 flex-1">{recipe.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p>{recipe.cuisine} • {recipe.cooking_time} min</p>
                        <p>{recipe.city}, {recipe.origin_country}</p>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {recipe.cultural_context}
                      </p>

                      <div className="text-xs text-gray-500">
                        <p className="mb-1">
                          <strong>Ingredients:</strong> {recipe.ingredients.slice(0, 3).join(', ')}
                          {recipe.ingredients.length > 3 && ` +${recipe.ingredients.length - 3} more`}
                        </p>
                        <p>
                          <strong>Steps:</strong> {recipe.cooking_steps.length} steps
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          AI Researched - Pending Review
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {!autoSave && discoveryResult.discovered_recipes.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 text-sm mb-2">
                      <strong>Note:</strong> These recipes were discovered but not automatically saved. 
                      Enable "Auto-save recipes" to save future discoveries to your database.
                    </p>
                    <button
                      onClick={() => {
                        // Trigger save manually
                        fetch('/api/recipes/discover-by-location', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            location: { coordinates: selectedLocation },
                            search_query: searchQuery.trim() || undefined,
                            auto_save: true
                          }),
                        }).then(() => {
                          alert('Recipes saved successfully!');
                          setDiscoveryResult(prev => prev ? { ...prev, saved_count: prev.discovered_recipes.length } : null);
                        });
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Save These Recipes Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discovery Failed</h3>
              <p className="text-gray-600">{discoveryResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">How to Use:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Click anywhere on the map to select a location</li>
          <li>2. Optionally enter a specific search query (e.g., "traditional breakfast")</li>
          <li>3. Choose whether to auto-save discovered recipes</li>
          <li>4. Click "Discover Recipes" to research authentic dishes from that area</li>
          <li>5. Review the discovered recipes and their cultural context</li>
        </ol>
      </div>
    </div>
  );
}