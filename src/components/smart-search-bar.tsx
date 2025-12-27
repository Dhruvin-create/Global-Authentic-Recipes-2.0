import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface SearchResult {
  id: string;
  title: string;
  origin_country?: string;
  cuisine?: string;
  image?: string;
  cooking_time?: string;
  difficulty?: string;
  authenticity_status?: string;
  relevance_score?: number;
  match_type?: string;
  cultural_context?: string;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  auto_find_triggered?: boolean;
  job_id?: string;
  message?: string;
  suggestions?: string[];
}

interface VoiceSearchHook {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  isSupported: boolean;
}

// Custom hook for voice search
const useVoiceSearch = (): VoiceSearchHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, startListening, stopListening, transcript, isSupported };
};

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [autoFindMessage, setAutoFindMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'recipes' | 'research'>('recipes');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { isListening, startListening, stopListening, transcript, isSupported } = useVoiceSearch();
  const debouncedQuery = useDebounce(query, 300);

  // Handle voice search transcript
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
      setActiveTab('research'); // Voice queries often are research-oriented
    }
  }, [transcript]);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, query]);

  // Debounced search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setAutoFindMessage('');

    try {
      const endpoint = activeTab === 'research' 
        ? `/api/search/research?q=${encodeURIComponent(searchQuery)}&limit=6`
        : `/api/search/suggest?q=${encodeURIComponent(searchQuery)}&limit=8`;
        
      const response = await fetch(endpoint);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setResults(data.results);
        setIsOpen(true);
        setSelectedIndex(-1);

        if (data.auto_find_triggered) {
          setAutoFindMessage(data.message || 'Researching authentic sources...');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    // Add to search history
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (activeTab === 'research') {
      router.push(`/research?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/recipes?search=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    
    // Add to search history
    const newHistory = [result.title, ...searchHistory.filter(h => h !== result.title)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    router.push(`/recipes/${result.id}`);
  };

  const handleClearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
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
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      {/* Search Input Container */}
      <div className={`
        relative bg-white rounded-2xl border-2 transition-all duration-300 shadow-lg
        ${isOpen ? 'border-amber-400 shadow-xl' : 'border-slate-200'}
        ${isListening ? 'ring-2 ring-red-200 border-red-300' : ''}
      `}>
        {/* Tab Selector */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium rounded-t-2xl transition-colors
              ${activeTab === 'recipes' 
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              Find Recipes
            </span>
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium rounded-t-2xl transition-colors
              ${activeTab === 'research' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-400' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 01-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1.002 1.002 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364.372l.254.145V16a1 1 0 112 0v1.021l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
              </svg>
              Ask About Food Culture
            </span>
          </button>
        </div>
        
        {/* Input Field */}
        <div className="relative flex items-center p-4">
          <div className="absolute left-6 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isOpen) {
                handleSearch();
              }
            }}
            placeholder={activeTab === 'recipes' 
              ? "Search for recipes, ingredients, or cuisines..."
              : "Ask about food traditions, festivals, or cultural dishes..."
            }
            className="
              w-full pl-12 pr-24 py-3 text-lg bg-transparent
              focus:outline-none placeholder-slate-400
            "
          />
          
          {/* Voice Search Button */}
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`
                absolute right-16 p-2 rounded-lg transition-all duration-200
                ${isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse scale-110' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }
              `}
              title={isListening ? 'Stop listening' : 'Voice search'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {/* Loading Spinner or Clear Button */}
          {isLoading ? (
            <div className="absolute right-4 flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full"
              />
            </div>
          ) : query ? (
            <button
              onClick={handleClearQuery}
              className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Auto-Find Message */}
            {autoFindMessage && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-center gap-2 text-amber-700">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-lg"
                  >
                    🤖
                  </motion.div>
                  <p className="text-sm font-medium">{autoFindMessage}</p>
                </div>
              </div>
            )}

            {/* Voice Search Indicator */}
            {isListening && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
                <div className="flex items-center gap-2 text-red-700">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-lg"
                  >
                    🎤
                  </motion.div>
                  <p className="text-sm font-medium">Listening... Speak now</p>
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className={`
                      w-full p-4 hover:bg-slate-50 transition-colors text-left 
                      border-b border-slate-100 last:border-b-0
                      ${selectedIndex === index ? 'bg-amber-50 border-amber-200' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Recipe Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Recipe Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{result.title}</h3>
                          {getAuthenticityBadge(result.authenticity_status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {result.origin_country && (
                            <span className="flex items-center gap-1">
                              🌍 {result.origin_country}
                            </span>
                          )}
                          {result.cuisine && (
                            <span className="flex items-center gap-1">
                              🍴 {result.cuisine}
                            </span>
                          )}
                          {result.cooking_time && (
                            <span className="flex items-center gap-1">
                              ⏱️ {result.cooking_time} min
                            </span>
                          )}
                          {result.difficulty && (
                            <span className="flex items-center gap-1">
                              📊 {result.difficulty}
                            </span>
                          )}
                        </div>
                        
                        {/* Cultural Context for Research Mode */}
                        {activeTab === 'research' && result.cultural_context && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {result.cultural_context}
                          </p>
                        )}
                      </div>

                      {/* Relevance Score */}
                      {result.relevance_score && (
                        <div className="text-xs text-slate-400 flex-shrink-0">
                          {Math.round(result.relevance_score * 100)}%
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}

                {/* View All Results */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: results.length * 0.05 }}
                  onClick={handleSearch}
                  className="
                    w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 
                    hover:from-amber-100 hover:to-orange-100 transition-all 
                    text-center font-medium text-amber-700 border-t border-amber-100
                  "
                >
                  {activeTab === 'research' 
                    ? `Research "${query}" in detail →`
                    : `View all results for "${query}" →`
                  }
                </motion.button>
              </div>
            ) : query && !isLoading && !isListening ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">
                  {activeTab === 'research' ? '🔍' : '🍽️'}
                </div>
                <p className="font-medium mb-1">
                  {activeTab === 'research' 
                    ? 'No cultural information found'
                    : 'No recipes found'
                  }
                </p>
                <p className="text-sm mb-4">
                  {activeTab === 'research'
                    ? 'Try asking about food traditions or cultural dishes'
                    : 'Try searching for ingredients or cuisine types'
                  }
                </p>
                {/* Auto-generation trigger for missing recipes */}
                {activeTab === 'recipes' && (
                  <button
                    onClick={() => {
                      setAutoFindMessage('Researching authentic sources...');
                      // Trigger auto-generation API call here
                    }}
                    className="
                      px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                      text-white font-medium rounded-lg hover:shadow-lg 
                      transition-all duration-200 text-sm
                    "
                  >
                    🤖 Generate Recipe with AI
                  </button>
                )}
              </div>
            ) : null}

            {/* Search History */}
            {!query && searchHistory.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <h4 className="text-xs font-medium text-slate-500 mb-2">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(historyItem)}
                      className="
                        px-3 py-1 text-xs bg-slate-100 text-slate-700 
                        rounded-full hover:bg-slate-200 transition-colors
                      "
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}