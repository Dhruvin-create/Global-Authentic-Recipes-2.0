# Smart Search System - Design Document

## Architecture Overview

The Smart Search System follows a microservices architecture with three distinct processing layers, each optimized for different search scenarios and performance requirements.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Search Bar Component │ Auto-suggest │ Results Display      │
│  Voice Search         │ Filters      │ Trust Badges         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
├─────────────────────────────────────────────────────────────┤
│  Rate Limiting │ Authentication │ Request Routing           │
│  Caching       │ Analytics      │ Error Handling            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼──────┐    ┌────────▼────────┐    ┌──────▼──────┐
│   Level 1    │    │     Level 2     │    │   Level 3   │
│ Smart Search │    │ Auto-Generate   │    │ AI Research │
│   Service    │    │    Service      │    │   Engine    │
└──────────────┘    └─────────────────┘    └─────────────┘
        │                     │                     │
┌───────▼──────┐    ┌────────▼────────┐    ┌──────▼──────┐
│ Elasticsearch│    │  External APIs  │    │ Vector DB   │
│   Cluster    │    │  LLM Service    │    │ RAG System  │
└──────────────┘    └─────────────────┘    └─────────────┘
```

## Level 1: Smart Internal Search Design

### Search Engine Architecture

#### Primary: Elasticsearch Implementation
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "recipe_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",
            "recipe_synonym",
            "recipe_stemmer"
          ]
        },
        "ingredient_analyzer": {
          "type": "custom",
          "tokenizer": "keyword",
          "filter": [
            "lowercase",
            "ingredient_synonym"
          ]
        }
      },
      "filter": {
        "recipe_synonym": {
          "type": "synonym",
          "synonyms": [
            "tomato,tomatoes",
            "onion,onions",
            "pasta,noodles",
            "chicken,poultry"
          ]
        },
        "ingredient_synonym": {
          "type": "synonym",
          "synonyms": [
            "cilantro,coriander",
            "scallion,green onion",
            "bell pepper,capsicum"
          ]
        }
      }
    }
  }
}
```

#### Fallback: MySQL Full-Text Search
```sql
-- Create full-text indexes
ALTER TABLE recipes ADD FULLTEXT(title, ingredients, instructions);
ALTER TABLE recipes ADD FULLTEXT(country, cuisine, tags);

-- Search query with ranking
SELECT 
  r.*,
  MATCH(title, ingredients) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score,
  (popularity_score * 0.3 + authenticity_score * 0.4 + relevance_score * 0.3) as final_score
FROM recipes r
WHERE MATCH(title, ingredients, instructions) AGAINST(? IN NATURAL LANGUAGE MODE)
ORDER BY final_score DESC, created_at DESC
LIMIT 20 OFFSET ?;
```

### Auto-Suggest Implementation

#### Debounced Search Hook
```typescript
// Custom hook for debounced search
const useSearchSuggestions = (query: string, delay: number = 300) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, delay);
  
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  const fetchSuggestions = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Suggestion fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { suggestions, loading };
};
```

#### Suggestion API Endpoint
```typescript
// /api/search/suggest
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }
  
  try {
    // Check cache first
    const cacheKey = `suggest:${q.toLowerCase()}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Elasticsearch suggestion query
    const suggestions = await searchClient.search({
      index: 'recipes',
      body: {
        suggest: {
          recipe_suggest: {
            prefix: q,
            completion: {
              field: 'title.suggest',
              size: 8,
              contexts: {
                authenticity: ['verified', 'community']
              }
            }
          }
        },
        _source: ['id', 'title', 'country', 'authenticity_status', 'image_url']
      }
    });
    
    const result = {
      suggestions: suggestions.body.suggest.recipe_suggest[0].options.map(option => ({
        id: option._source.id,
        title: option._source.title,
        country: option._source.country,
        authenticity: option._source.authenticity_status,
        image: option._source.image_url,
        score: option._score
      }))
    };
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    res.json(result);
  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({ error: 'Search suggestion failed' });
  }
}
```

### Search Result Ranking Algorithm

```typescript
interface RankingFactors {
  relevanceScore: number;      // 0-1 from search engine
  popularityScore: number;     // 0-1 based on views/ratings
  authenticityScore: number;   // 0-1 based on verification status
  freshnessScore: number;      // 0-1 based on recency
  userPreferenceScore: number; // 0-1 based on user history
}

const calculateFinalScore = (factors: RankingFactors): number => {
  const weights = {
    relevance: 0.35,
    popularity: 0.25,
    authenticity: 0.25,
    freshness: 0.10,
    userPreference: 0.05
  };
  
  return (
    factors.relevanceScore * weights.relevance +
    factors.popularityScore * weights.popularity +
    factors.authenticityScore * weights.authenticity +
    factors.freshnessScore * weights.freshness +
    factors.userPreferenceScore * weights.userPreference
  );
};
```

## Level 2: Auto-Fetch + Generate Recipe Design

### Recipe Generation Pipeline

```typescript
interface GenerationPipeline {
  query: string;
  sources: ExternalSource[];
  llmProvider: 'openai' | 'anthropic';
  confidenceThreshold: number;
}

class RecipeGenerator {
  async generateRecipe(query: string): Promise<GeneratedRecipe> {
    // Step 1: Analyze query and extract entities
    const analysis = await this.analyzeQuery(query);
    
    // Step 2: Fetch data from multiple sources
    const sourceData = await this.fetchFromSources(analysis);
    
    // Step 3: Generate structured recipe using LLM
    const recipe = await this.synthesizeRecipe(sourceData, analysis);
    
    // Step 4: Validate and score confidence
    const validation = await this.validateRecipe(recipe);
    
    // Step 5: Store with proper attribution
    return await this.storeGeneratedRecipe(recipe, validation);
  }
  
  private async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const prompt = `
      Analyze this recipe search query and extract:
      - Dish name
      - Cuisine/country of origin
      - Cultural context (festivals, occasions)
      - Key ingredients (if mentioned)
      
      Query: "${query}"
      
      Return JSON format with extracted entities.
    `;
    
    const response = await this.llm.complete(prompt);
    return JSON.parse(response);
  }
  
  private async fetchFromSources(analysis: QueryAnalysis): Promise<SourceData[]> {
    const sources = await Promise.allSettled([
      this.fetchWikipediaData(analysis.dishName, analysis.country),
      this.fetchSpoonacularData(analysis.dishName),
      this.fetchEdamamData(analysis.dishName),
      this.fetchCulturalSources(analysis.country, analysis.culturalContext)
    ]);
    
    return sources
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<SourceData>).value);
  }
  
  private async synthesizeRecipe(sources: SourceData[], analysis: QueryAnalysis): Promise<Recipe> {
    const prompt = `
      Create an authentic recipe for ${analysis.dishName} from ${analysis.country}.
      
      Use these sources for accuracy:
      ${sources.map(s => `- ${s.type}: ${s.content}`).join('\n')}
      
      Requirements:
      - Culturally accurate and respectful
      - Proper ingredient measurements
      - Clear step-by-step instructions
      - Cultural context and significance
      - Regional variations if applicable
      
      Return structured JSON with recipe data.
    `;
    
    const response = await this.llm.complete(prompt);
    return JSON.parse(response);
  }
}
```

### Source Integration Architecture

```typescript
interface ExternalSource {
  name: string;
  reliability: 'high' | 'medium' | 'low';
  apiEndpoint: string;
  rateLimits: RateLimit;
  authentication: AuthConfig;
}

class SourceManager {
  private sources: Map<string, ExternalSource> = new Map([
    ['wikipedia', {
      name: 'Wikipedia',
      reliability: 'high',
      apiEndpoint: 'https://en.wikipedia.org/api/rest_v1',
      rateLimits: { requests: 100, window: 3600 },
      authentication: { type: 'none' }
    }],
    ['spoonacular', {
      name: 'Spoonacular',
      reliability: 'medium',
      apiEndpoint: 'https://api.spoonacular.com',
      rateLimits: { requests: 150, window: 86400 },
      authentication: { type: 'apiKey', key: process.env.SPOONACULAR_API_KEY }
    }]
  ]);
  
  async fetchWithFallback(sourceName: string, query: string): Promise<SourceData | null> {
    const source = this.sources.get(sourceName);
    if (!source) return null;
    
    try {
      // Check rate limits
      await this.checkRateLimit(sourceName);
      
      // Fetch data
      const response = await this.makeRequest(source, query);
      
      return {
        type: sourceName,
        content: response.data,
        reliability: source.reliability,
        timestamp: new Date(),
        url: response.sourceUrl
      };
    } catch (error) {
      console.error(`Failed to fetch from ${sourceName}:`, error);
      return null;
    }
  }
}
```

### Content Validation System

```typescript
interface ValidationResult {
  isValid: boolean;
  confidenceScore: number;
  issues: ValidationIssue[];
  culturalSensitivity: CulturalCheck;
}

class ContentValidator {
  async validateRecipe(recipe: GeneratedRecipe): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.validateIngredients(recipe.ingredients),
      this.validateInstructions(recipe.instructions),
      this.validateCulturalContext(recipe.culturalContext),
      this.checkForBias(recipe),
      this.verifySourceClaims(recipe.sources)
    ]);
    
    const confidenceScore = this.calculateConfidence(checks);
    const issues = checks.flatMap(check => check.issues);
    
    return {
      isValid: confidenceScore > 0.7,
      confidenceScore,
      issues,
      culturalSensitivity: checks.find(c => c.type === 'cultural')
    };
  }
  
  private async validateCulturalContext(context: CulturalContext): Promise<ValidationCheck> {
    // Use cultural knowledge base to verify claims
    const culturalFacts = await this.culturalKnowledgeBase.verify(context);
    
    return {
      type: 'cultural',
      score: culturalFacts.accuracy,
      issues: culturalFacts.concerns.map(concern => ({
        type: 'cultural_sensitivity',
        message: concern.description,
        severity: concern.severity
      }))
    };
  }
}
```

## Level 3: AI Recipe Research Engine Design

### RAG (Retrieval-Augmented Generation) Architecture

```typescript
interface RAGSystem {
  vectorStore: VectorDatabase;
  embeddings: EmbeddingModel;
  llm: LanguageModel;
  knowledgeBase: CulturalKnowledgeBase;
}

class RecipeResearchEngine {
  constructor(private rag: RAGSystem) {}
  
  async processNaturalLanguageQuery(query: string): Promise<ResearchResponse> {
    // Step 1: Understand the query intent
    const intent = await this.classifyIntent(query);
    
    // Step 2: Extract entities and context
    const entities = await this.extractEntities(query);
    
    // Step 3: Retrieve relevant knowledge
    const relevantDocs = await this.retrieveRelevantContent(query, entities);
    
    // Step 4: Generate culturally appropriate response
    const response = await this.generateResponse(query, relevantDocs, intent);
    
    // Step 5: Validate cultural sensitivity
    const validation = await this.validateCulturalResponse(response);
    
    return {
      answer: response.text,
      recipes: response.suggestedRecipes,
      culturalContext: response.culturalContext,
      sources: response.sources,
      confidence: validation.confidence
    };
  }
  
  private async retrieveRelevantContent(
    query: string, 
    entities: ExtractedEntities
  ): Promise<RelevantDocument[]> {
    // Create query embedding
    const queryEmbedding = await this.rag.embeddings.embed(query);
    
    // Search vector database
    const similarDocs = await this.rag.vectorStore.search(queryEmbedding, {
      limit: 10,
      filters: {
        country: entities.countries,
        cuisine: entities.cuisines,
        occasion: entities.occasions
      }
    });
    
    // Enhance with cultural knowledge
    const culturalContext = await this.rag.knowledgeBase.getContext(entities);
    
    return [...similarDocs, ...culturalContext];
  }
  
  private async generateResponse(
    query: string,
    docs: RelevantDocument[],
    intent: QueryIntent
  ): Promise<GeneratedResponse> {
    const prompt = this.buildContextualPrompt(query, docs, intent);
    
    const response = await this.rag.llm.complete(prompt, {
      temperature: 0.3, // Lower temperature for factual accuracy
      maxTokens: 1000,
      stopSequences: ['---END---']
    });
    
    return this.parseStructuredResponse(response);
  }
}
```

### Cultural Knowledge Base

```typescript
interface CulturalKnowledgeBase {
  countries: Map<string, CountryInfo>;
  festivals: Map<string, FestivalInfo>;
  ingredients: Map<string, IngredientInfo>;
  cookingTechniques: Map<string, TechniqueInfo>;
}

class CulturalDatabase {
  async getCountryFoodTraditions(country: string): Promise<FoodTradition[]> {
    const traditions = await this.db.query(`
      SELECT 
        t.*,
        array_agg(DISTINCT r.title) as related_recipes,
        array_agg(DISTINCT f.name) as festivals
      FROM food_traditions t
      LEFT JOIN recipe_traditions rt ON t.id = rt.tradition_id
      LEFT JOIN recipes r ON rt.recipe_id = r.id
      LEFT JOIN tradition_festivals tf ON t.id = tf.tradition_id
      LEFT JOIN festivals f ON tf.festival_id = f.id
      WHERE t.country = ?
      GROUP BY t.id
    `, [country]);
    
    return traditions.map(t => ({
      name: t.name,
      description: t.description,
      culturalSignificance: t.cultural_significance,
      relatedRecipes: t.related_recipes.filter(Boolean),
      festivals: t.festivals.filter(Boolean),
      sources: JSON.parse(t.sources || '[]')
    }));
  }
  
  async validateCulturalClaim(
    claim: string, 
    country: string, 
    context: string
  ): Promise<ValidationResult> {
    // Use embeddings to find similar validated claims
    const claimEmbedding = await this.embeddings.embed(claim);
    
    const similarClaims = await this.vectorStore.search(claimEmbedding, {
      filters: { country, verified: true },
      limit: 5
    });
    
    // Calculate confidence based on similarity to verified claims
    const confidence = similarClaims.reduce((acc, claim) => 
      acc + claim.similarity, 0) / similarClaims.length;
    
    return {
      isValid: confidence > 0.8,
      confidence,
      supportingEvidence: similarClaims,
      concerns: confidence < 0.6 ? ['Low confidence in cultural accuracy'] : []
    };
  }
}
```

## Frontend UX Design

### Search Interface Components

#### Main Search Bar Component
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  showVoiceSearch?: boolean;
  showFilters?: boolean;
}

const SmartSearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search recipes, ingredients, or ask about food traditions...",
  onSearch,
  onSuggestionSelect,
  showVoiceSearch = true,
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'research'>('recipes');
  
  const { suggestions, loading } = useSearchSuggestions(query);
  const { isListening, startListening, stopListening } = useVoiceSearch();
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className={`
        relative bg-white rounded-2xl border-2 transition-all duration-300
        ${isExpanded ? 'border-amber-400 shadow-xl' : 'border-slate-200 shadow-lg'}
      `}>
        {/* Tab Selector */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium rounded-t-2xl transition-colors
              ${activeTab === 'recipes' 
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400' 
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            🍽️ Find Recipes
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium rounded-t-2xl transition-colors
              ${activeTab === 'research' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-400' 
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            🔍 Ask About Food Culture
          </button>
        </div>
        
        {/* Input Field */}
        <div className="relative flex items-center p-4">
          <div className="absolute left-6 text-slate-400">
            {activeTab === 'recipes' ? (
              <SearchIcon className="w-5 h-5" />
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            placeholder={activeTab === 'recipes' 
              ? "Search for recipes, ingredients, or cuisines..."
              : "Ask about food traditions, festivals, or cultural dishes..."
            }
            className="
              w-full pl-12 pr-20 py-3 text-lg bg-transparent
              focus:outline-none placeholder-slate-400
            "
          />
          
          {/* Voice Search Button */}
          {showVoiceSearch && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`
                absolute right-16 p-2 rounded-lg transition-colors
                ${isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
          
          {/* Search Button */}
          <button
            onClick={() => onSearch(query)}
            disabled={!query.trim()}
            className="
              absolute right-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600
              text-white font-medium rounded-lg transition-all duration-200
              hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Auto-suggest Dropdown */}
      <AnimatePresence>
        {isExpanded && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute top-full left-0 right-0 mt-2 bg-white rounded-xl
              border border-slate-200 shadow-xl z-50 max-h-96 overflow-y-auto
            "
          >
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                index={index}
                onSelect={onSuggestionSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

#### Suggestion Item Component
```typescript
const SuggestionItem: React.FC<{
  suggestion: SearchSuggestion;
  index: number;
  onSelect: (suggestion: SearchSuggestion) => void;
}> = ({ suggestion, index, onSelect }) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(suggestion)}
      className="
        w-full flex items-center gap-4 p-4 text-left
        hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0
      "
    >
      {/* Recipe Image */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
        {suggestion.image ? (
          <Image
            src={suggestion.image}
            alt={suggestion.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            🍽️
          </div>
        )}
      </div>
      
      {/* Recipe Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-slate-900 truncate">
            {suggestion.title}
          </h4>
          <AuthenticityBadge status={suggestion.authenticity} size="sm" />
        </div>
        <p className="text-sm text-slate-600 truncate">
          {suggestion.country} • {suggestion.cuisine}
        </p>
      </div>
      
      {/* Arrow */}
      <ChevronRightIcon className="w-4 h-4 text-slate-400" />
    </motion.button>
  );
};
```

### Search Results Display

#### Results Container with Tabs
```typescript
const SearchResults: React.FC<{
  results: SearchResult[];
  query: string;
  loading: boolean;
}> = ({ results, query, loading }) => {
  const [activeTab, setActiveTab] = useState<'verified' | 'community' | 'generated'>('verified');
  
  const categorizedResults = useMemo(() => {
    return {
      verified: results.filter(r => r.authenticity_status === 'verified'),
      community: results.filter(r => r.authenticity_status === 'community'),
      generated: results.filter(r => r.authenticity_status.includes('generated'))
    };
  }, [results]);
  
  const currentResults = categorizedResults[activeTab];
  
  if (loading) {
    return <SearchResultsSkeleton />;
  }
  
  if (results.length === 0) {
    return <EmptySearchState query={query} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Result Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        {Object.entries(categorizedResults).map(([key, items]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-all
              ${activeTab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              {key === 'verified' && <VerifiedIcon className="w-4 h-4 text-green-600" />}
              {key === 'community' && <UsersIcon className="w-4 h-4 text-blue-600" />}
              {key === 'generated' && <SparklesIcon className="w-4 h-4 text-purple-600" />}
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <span className="ml-1 px-2 py-0.5 bg-slate-200 text-xs rounded-full">
                {items.length}
              </span>
            </span>
          </button>
        ))}
      </div>
      
      {/* Results Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentResults.map((result, index) => (
            <SearchResultCard
              key={result.id}
              result={result}
              index={index}
              query={query}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* Auto-generation Trigger */}
      {results.length === 0 && (
        <AutoGenerationPrompt query={query} />
      )}
    </div>
  );
};
```

#### Trust Badges and Warning Labels
```typescript
const AuthenticityBadge: React.FC<{
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ status, size = 'md', showLabel = true }) => {
  const getBadgeConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: <VerifiedIcon className="w-4 h-4" />,
          label: 'Verified Authentic',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'community':
        return {
          icon: <UsersIcon className="w-4 h-4" />,
          label: 'Community Recipe',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'auto-generated (pending review)':
        return {
          icon: <SparklesIcon className="w-4 h-4" />,
          label: 'AI Generated',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          icon: <QuestionMarkIcon className="w-4 h-4" />,
          label: 'Unverified',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };
  
  const config = getBadgeConfig(status);
  
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
      ${config.className}
      ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm px-3 py-1.5' : ''}
    `}>
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

const GeneratedContentWarning: React.FC<{
  recipe: GeneratedRecipe;
}> = ({ recipe }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-900 mb-1">
            AI-Generated Content
          </h4>
          <p className="text-sm text-amber-800 mb-3">
            This recipe was automatically generated and is pending review. 
            Information may not be completely accurate.
          </p>
          <div className="flex items-center gap-4 text-xs text-amber-700">
            <span>Confidence: {Math.round(recipe.confidence_score * 100)}%</span>
            <span>Sources: {recipe.sources.length}</span>
            <button className="underline hover:no-underline">
              View Sources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Performance Optimization Strategies

#### Image Optimization
```typescript
const OptimizedRecipeImage: React.FC<{
  src: string;
  alt: string;
  priority?: boolean;
}> = ({ src, alt, priority = false }) => {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};
```

#### Caching Strategy
```typescript
// Redis caching for search results
class SearchCache {
  private redis: Redis;
  private defaultTTL = 900; // 15 minutes
  
  async get(key: string): Promise<any> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.redis.setex(
      key, 
      ttl || this.defaultTTL, 
      JSON.stringify(value)
    );
  }
  
  generateSearchKey(query: string, filters: SearchFilters): string {
    const normalizedQuery = query.toLowerCase().trim();
    const filterHash = this.hashFilters(filters);
    return `search:${normalizedQuery}:${filterHash}`;
  }
  
  private hashFilters(filters: SearchFilters): string {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(filters))
      .digest('hex')
      .substring(0, 8);
  }
}
```

#### ISR (Incremental Static Regeneration) for Recipe Pages
```typescript
// pages/recipes/[id].tsx
export async function getStaticProps({ params }: GetStaticPropsContext) {
  const recipe = await getRecipe(params?.id as string);
  
  if (!recipe) {
    return { notFound: true };
  }
  
  return {
    props: { recipe },
    revalidate: recipe.authenticity_status === 'verified' ? 86400 : 3600 // 24h for verified, 1h for others
  };
}

export async function getStaticPaths() {
  // Pre-generate paths for most popular recipes
  const popularRecipes = await getPopularRecipes(100);
  
  return {
    paths: popularRecipes.map(recipe => ({
      params: { id: recipe.id.toString() }
    })),
    fallback: 'blocking' // Generate other pages on-demand
  };
}
```

This comprehensive design provides a production-ready Smart Search System that balances performance, accuracy, cultural sensitivity, and user experience while maintaining clear trust indicators and proper attribution for all content sources.