import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../src/components/layout';
import SmartSearchBar from '../src/components/smart-search-bar';

interface ResearchResult {
  id: string;
  title: string;
  origin_country?: string;
  cuisine?: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status?: string;
  cultural_context?: string;
  relevance_score?: number;
  cultural_significance?: string;
  festival_connection?: string;
}

interface ResearchData {
  success: boolean;
  results: ResearchResult[];
  cultural_explanation?: string;
  related_topics?: string[];
  total: number;
  confidence_score?: number;
  sources?: string[];
}

export default function ResearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (q && typeof q === 'string') {
      performResearch(q);
    }
  }, [q]);

  const performResearch = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search/research?q=${encodeURIComponent(query)}&limit=12`);
      const data = await response.json();

      if (data.success) {
        setResearchData(data);
      } else {
        setError(data.error || 'Research failed');
      }
    } catch (err) {
      setError('Failed to perform research');
      console.error('Research error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAuthenticityBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            Community
          </span>
        );
      case 'ai_pending':
      case 'auto-generated (pending review)':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            AI Generated
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Food Culture Research
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover the rich cultural stories behind traditional dishes and food traditions from around the world
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex justify-center">
              <SmartSearchBar />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <span className="ml-3 text-slate-600">Researching cultural information...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-600 text-lg font-medium mb-2">Research Failed</div>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {researchData && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Query Display */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Research Results for: "{q}"
                </h2>
                {researchData.confidence_score && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Confidence Score:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(researchData.confidence_score * 100)}%` }}
                        />
                      </div>
                      <span className="font-medium">{Math.round((researchData.confidence_score || 0) * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cultural Explanation */}
              {researchData.cultural_explanation && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Cultural Context</h3>
                      <div className="text-blue-800 leading-relaxed whitespace-pre-line">
                        {researchData.cultural_explanation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipe Results */}
              {researchData.results.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Related Traditional Recipes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {researchData.results.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={`/recipes/${recipe.id}`}>
                          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 group">
                            {/* Recipe Image */}
                            <div className="relative h-48 bg-slate-100">
                              {recipe.image ? (
                                <Image
                                  src={recipe.image}
                                  alt={recipe.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                                  🍽️
                                </div>
                              )}
                              <div className="absolute top-3 right-3">
                                {getAuthenticityBadge(recipe.authenticity_status)}
                              </div>
                            </div>

                            {/* Recipe Info */}
                            <div className="p-4">
                              <h4 className="font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                                {recipe.title}
                              </h4>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                {recipe.origin_country && (
                                  <span className="flex items-center gap-1">
                                    🌍 {recipe.origin_country}
                                  </span>
                                )}
                                {recipe.cuisine && (
                                  <span className="flex items-center gap-1">
                                    🍴 {recipe.cuisine}
                                  </span>
                                )}
                                {recipe.cooking_time && (
                                  <span className="flex items-center gap-1">
                                    ⏱️ {recipe.cooking_time} min
                                  </span>
                                )}
                              </div>

                              {recipe.cultural_context && (
                                <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                                  {recipe.cultural_context}
                                </p>
                              )}

                              {recipe.festival_connection && (
                                <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full inline-block">
                                  🎉 {recipe.festival_connection}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Topics */}
              {researchData.related_topics && researchData.related_topics.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Explore Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {researchData.related_topics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => router.push(`/research?q=${encodeURIComponent(topic)}`)}
                        className="px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm border border-slate-200 hover:border-amber-200"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              {researchData.sources && researchData.sources.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500">
                    Sources: {researchData.sources.join(', ')}
                  </p>
                </div>
              )}

              {/* Empty State */}
              {researchData.results.length === 0 && !researchData.cultural_explanation && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Cultural Information Found</h3>
                  <p className="text-slate-600 mb-6">
                    We couldn't find specific cultural information for your query. Try asking about:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      'Traditional dishes from Italy',
                      'Foods eaten during Chinese New Year',
                      'Mexican Day of the Dead recipes',
                      'Indian festival foods',
                      'Japanese tea ceremony traditions'
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => router.push(`/research?q=${encodeURIComponent(suggestion)}`)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Initial State */}
          {!q && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🌍</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Discover Food Cultures Around the World
              </h2>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Ask questions about food traditions, cultural dishes, festival foods, and culinary history. 
                Our AI research engine will provide culturally accurate information and related recipes.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[
                  { icon: '🎉', title: 'Festival Foods', example: 'What do people eat during Diwali in India?' },
                  { icon: '🏛️', title: 'Historical Cuisine', example: 'Ancient Roman cooking techniques' },
                  { icon: '🌶️', title: 'Regional Specialties', example: 'Traditional dishes from Sichuan province' },
                  { icon: '🥘', title: 'Cultural Significance', example: 'Why is couscous important in North Africa?' },
                  { icon: '🍜', title: 'Cooking Traditions', example: 'Japanese ramen regional variations' },
                  { icon: '🎂', title: 'Celebration Foods', example: 'Wedding foods around the world' }
                ].map((category, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(`/research?q=${encodeURIComponent(category.example)}`)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-amber-600">
                      {category.title}
                    </h3>
                    <p className="text-sm text-slate-600">{category.example}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}