import React, { useState, useEffect } from 'react';

interface DiscoveryAnalytics {
  total_discovered_recipes: number;
  recipes_by_discovery_method: {
    google_places: number;
    batch_google_places: number;
    manual_research: number;
  };
  recipes_by_status: {
    ai_pending: number;
    verified: number;
    published: number;
    draft: number;
  };
  top_discovery_countries: Array<{
    country: string;
    recipe_count: number;
    percentage: number;
  }>;
  top_discovery_cuisines: Array<{
    cuisine: string;
    recipe_count: number;
    percentage: number;
  }>;
  discovery_timeline: Array<{
    date: string;
    recipes_discovered: number;
    recipes_saved: number;
  }>;
  cultural_coverage: {
    total_countries: number;
    total_regions: number;
    total_cuisines: number;
  };
  quality_metrics: {
    average_cooking_time: number;
    difficulty_distribution: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    recipes_with_cultural_context: number;
  };
}

export default function DiscoveryAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<DiscoveryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recipes/discovery-analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ai_pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Discovery Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Insights and statistics about your recipe discovery activities
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Discovered</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_discovered_recipes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Countries Covered</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.cultural_coverage.total_countries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cuisines</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.cultural_coverage.total_cuisines}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Cook Time</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.quality_metrics.average_cooking_time}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Methods and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discovery Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Single Location</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {analytics.recipes_by_discovery_method.google_places}
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.recipes_by_discovery_method.google_places / analytics.total_discovered_recipes) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Batch Discovery</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {analytics.recipes_by_discovery_method.batch_google_places}
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.recipes_by_discovery_method.batch_google_places / analytics.total_discovered_recipes) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Manual Research</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {analytics.recipes_by_discovery_method.manual_research}
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.recipes_by_discovery_method.manual_research / analytics.total_discovered_recipes) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analytics.recipes_by_status).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status.replace('_', ' ')}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries and Cuisines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Discovery Countries</h3>
          <div className="space-y-3">
            {analytics.top_discovery_countries.slice(0, 5).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-4">#{index + 1}</span>
                  <span className="text-sm text-gray-900 ml-3">{country.country}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{country.percentage}%</span>
                  <span className="text-sm font-medium text-gray-900">{country.recipe_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cuisines</h3>
          <div className="space-y-3">
            {analytics.top_discovery_cuisines.slice(0, 5).map((cuisine, index) => (
              <div key={cuisine.cuisine} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-4">#{index + 1}</span>
                  <span className="text-sm text-gray-900 ml-3">{cuisine.cuisine}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{cuisine.percentage}%</span>
                  <span className="text-sm font-medium text-gray-900">{cuisine.recipe_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Difficulty Distribution</h4>
            <div className="space-y-2">
              {Object.entries(analytics.quality_metrics.difficulty_distribution).map(([difficulty, count]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cultural Context</h4>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{analytics.quality_metrics.recipes_with_cultural_context}</p>
              <p className="text-sm text-gray-600">recipes with cultural context</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((analytics.quality_metrics.recipes_with_cultural_context / analytics.total_discovered_recipes) * 100)}% of total
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {analytics.discovery_timeline.slice(0, 7).reduce((sum, day) => sum + day.recipes_discovered, 0)}
              </p>
              <p className="text-sm text-gray-600">recipes discovered</p>
              <p className="text-xs text-gray-500 mt-1">in the last 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
}