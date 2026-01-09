import React, { useState } from 'react';

interface BatchLocation {
  name: string;
  coordinates?: { lat: number; lng: number };
  search_query?: string;
}

interface BatchDiscoveryResult {
  success: boolean;
  total_locations: number;
  total_recipes_discovered: number;
  total_recipes_saved: number;
  results: LocationDiscoveryResult[];
  processing_time: number;
  error?: string;
}

interface LocationDiscoveryResult {
  location: string;
  success: boolean;
  recipes_found: number;
  recipes_saved: number;
  cultural_context: string;
  error?: string;
}

const PRESET_LOCATIONS = [
  { name: 'Tuscany, Italy', search_query: 'traditional pasta' },
  { name: 'Lyon, France', search_query: 'classic French cuisine' },
  { name: 'Bangkok, Thailand', search_query: 'street food' },
  { name: 'Mumbai, India', search_query: 'traditional curry' },
  { name: 'Tokyo, Japan', search_query: 'authentic Japanese' },
  { name: 'Istanbul, Turkey', search_query: 'Ottoman cuisine' },
  { name: 'Mexico City, Mexico', search_query: 'traditional Mexican' },
  { name: 'Marrakech, Morocco', search_query: 'tagine and couscous' },
  { name: 'Lima, Peru', search_query: 'Peruvian specialties' },
  { name: 'Seoul, South Korea', search_query: 'Korean traditional' }
];

export default function BatchLocationDiscoverer() {
  const [locations, setLocations] = useState<BatchLocation[]>([
    { name: '', search_query: '' }
  ]);
  const [autoSave, setAutoSave] = useState(false);
  const [maxRecipesPerLocation, setMaxRecipesPerLocation] = useState(3);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<BatchDiscoveryResult | null>(null);

  const addLocation = () => {
    if (locations.length < 10) {
      setLocations([...locations, { name: '', search_query: '' }]);
    }
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index: number, field: keyof BatchLocation, value: string) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    setLocations(updated);
  };

  const loadPresetLocations = () => {
    setLocations(PRESET_LOCATIONS.slice(0, 5));
  };

  const startBatchDiscovery = async () => {
    const validLocations = locations.filter(loc => loc.name.trim());
    
    if (validLocations.length === 0) {
      alert('Please add at least one location');
      return;
    }

    setIsDiscovering(true);
    setDiscoveryResult(null);

    try {
      const response = await fetch('/api/recipes/batch-discover-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: validLocations,
          auto_save: autoSave,
          max_recipes_per_location: maxRecipesPerLocation
        }),
      });

      const result: BatchDiscoveryResult = await response.json();
      setDiscoveryResult(result);

      if (result.success && result.total_recipes_saved > 0) {
        alert(`Successfully discovered ${result.total_recipes_discovered} recipes and saved ${result.total_recipes_saved} to database!`);
      }
    } catch (error) {
      console.error('Batch discovery failed:', error);
      setDiscoveryResult({
        success: false,
        total_locations: validLocations.length,
        total_recipes_discovered: 0,
        total_recipes_saved: 0,
        results: [],
        processing_time: 0,
        error: 'Batch discovery failed'
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Batch Location Discovery
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover recipes from multiple locations at once. Perfect for building a diverse recipe collection 
          or exploring specific regional cuisines across different countries.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Location List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Locations to Discover</h3>
              <div className="flex gap-2">
                <button
                  onClick={loadPresetLocations}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Load Presets
                </button>
                <button
                  onClick={addLocation}
                  disabled={locations.length >= 10}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Add Location
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {locations.map((location, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Location name (e.g., 'Tuscany, Italy')"
                      value={location.name}
                      onChange={(e) => updateLocation(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search query (optional)"
                      value={location.search_query || ''}
                      onChange={(e) => updateLocation(index, 'search_query', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  {locations.length > 1 && (
                    <button
                      onClick={() => removeLocation(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="lg:w-80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discovery Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipes per Location
                </label>
                <select
                  value={maxRecipesPerLocation}
                  onChange={(e) => setMaxRecipesPerLocation(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 recipe</option>
                  <option value={2}>2 recipes</option>
                  <option value={3}>3 recipes</option>
                  <option value={5}>5 recipes</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-save-batch"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto-save-batch" className="ml-2 text-sm text-gray-700">
                  Auto-save all discovered recipes
                </label>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={startBatchDiscovery}
                  disabled={isDiscovering || locations.filter(l => l.name.trim()).length === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isDiscovering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Discovering...</span>
                    </>
                  ) : (
                    <span>Start Batch Discovery</span>
                  )}
                </button>
              </div>

              {isDiscovering && (
                <div className="text-center text-sm text-gray-600">
                  <p>Processing locations...</p>
                  <p>This may take several minutes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {discoveryResult && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {discoveryResult.success ? (
            <div>
              {/* Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Batch Discovery Complete
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Locations:</span>
                    <p className="text-blue-900">{discoveryResult.total_locations}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Recipes Found:</span>
                    <p className="text-blue-900">{discoveryResult.total_recipes_discovered}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Recipes Saved:</span>
                    <p className="text-blue-900">{discoveryResult.total_recipes_saved}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Processing Time:</span>
                    <p className="text-blue-900">{Math.round(discoveryResult.processing_time / 1000)}s</p>
                  </div>
                </div>
              </div>

              {/* Location Results */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Results by Location
                </h3>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {discoveryResult.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 flex-1">{result.location}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.success)}`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      
                      {result.success ? (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">
                            <p>Recipes Found: {result.recipes_found}</p>
                            <p>Recipes Saved: {result.recipes_saved}</p>
                          </div>

                          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                            {result.cultural_context}
                          </p>

                          {result.recipes_saved > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Saved to Database
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Discovery Failed</h3>
              <p className="text-gray-600">{discoveryResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Batch Discovery Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Add up to 10 locations for batch processing</li>
          <li>• Use specific search queries for better results (e.g., "traditional breakfast", "street food")</li>
          <li>• Processing time increases with more locations and recipes per location</li>
          <li>• Enable auto-save to automatically add recipes to your database</li>
          <li>• Use preset locations for quick exploration of popular culinary destinations</li>
        </ul>
      </div>
    </div>
  );
}