# Smart Search System Implementation

## Overview

The Smart Search System is a three-tier progressive enhancement system that provides:

1. **Level 1**: Smart Internal Search with fuzzy matching and auto-suggestions
2. **Level 2**: Auto-Fetch + Generate Recipe using AI when recipes don't exist
3. **Level 3**: AI Recipe Research Engine for natural language cultural queries

## 🚀 Quick Start

### 1. Run Database Migration

```bash
npm run migrate:search
```

This will create all necessary tables and indexes for the Smart Search System.

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# OpenAI API for recipe generation and research
OPENAI_API_KEY=your_openai_api_key_here

# Database configuration (if different from defaults)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recipes_db

# Optional: Redis for caching (future enhancement)
REDIS_URL=redis://localhost:6379
```

### 3. Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to the homepage and try the enhanced search bar
3. Test different search modes:
   - **Recipe Search**: Search for "pasta carbonara" or "chicken curry"
   - **Research Mode**: Ask "What do people eat during Ramadan in Morocco?"
   - **Voice Search**: Click the microphone icon (if supported)

## 📁 File Structure

```
├── src/components/
│   └── smart-search-bar.tsx          # Enhanced search component
├── pages/
│   ├── research.tsx                  # Research results page
│   └── api/search/
│       ├── index.ts                  # Main search endpoint
│       ├── suggest.ts                # Auto-suggest endpoint
│       ├── research.ts               # Natural language research
│       └── generate.ts               # Recipe generation endpoint
├── migrations/
│   └── 002_add_smart_search_features.sql  # Database schema
└── run-search-migration.js           # Migration runner
```

## 🔧 API Endpoints

### 1. Search Suggestions
```
GET /api/search/suggest?q=pasta&limit=8
```

Returns auto-complete suggestions with recipe previews.

### 2. Full Search
```
GET /api/search?q=italian pasta&page=1&limit=20&authenticity=verified
```

Returns paginated search results with filtering options.

### 3. Cultural Research
```
GET /api/search/research?q=What do people eat during Chinese New Year?
```

Returns cultural explanations and related recipes.

### 4. Recipe Generation
```
POST /api/search/generate
Body: { "query": "Ethiopian Injera", "user_id": 123 }
```

Generates new recipes using AI when they don't exist.

## 🎨 Frontend Features

### Enhanced Search Bar

- **Dual Mode**: Switch between "Find Recipes" and "Ask About Food Culture"
- **Voice Search**: Web Speech API integration (Chrome/Edge)
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Search History**: Persistent local storage of recent searches
- **Real-time Suggestions**: Debounced auto-complete with images
- **Loading States**: Smooth animations and progress indicators

### Search Results

- **Authenticity Badges**: Clear visual indicators for content trust
- **Cultural Context**: Rich cultural information for research queries
- **Related Topics**: Suggested follow-up questions
- **Empty States**: Helpful guidance when no results found
- **Auto-generation Triggers**: Smart prompts for missing recipes

## 🗄️ Database Schema

### New Tables Created

1. **search_analytics**: Track search behavior and performance
2. **generated_recipes**: Monitor AI-generated content and reviews
3. **recipe_ratings**: User ratings for better search ranking
4. **cultural_knowledge**: Curated cultural food information
5. **search_suggestions**: Cached auto-complete suggestions
6. **recipe_views**: Track recipe popularity for ranking

### Enhanced Recipe Fields

- `popularity_score`: Calculated ranking factor (0-1)
- `search_count`: Number of times recipe appeared in searches
- `cultural_significance`: Cultural importance and context
- `festivals`: Associated holidays and celebrations
- `dietary_tags`: Dietary restrictions and preferences
- `prep_time`: Preparation time separate from cooking time

## 🤖 AI Integration

### Recipe Generation Pipeline

1. **Query Analysis**: Extract dish name, country, cuisine type
2. **Source Fetching**: Gather data from Wikipedia, recipe APIs
3. **LLM Synthesis**: Generate structured recipe with cultural context
4. **Validation**: Check for accuracy and cultural sensitivity
5. **Storage**: Save with pending review status

### Cultural Research Engine

1. **Intent Classification**: Determine query type and context
2. **Entity Extraction**: Identify countries, festivals, ingredients
3. **Knowledge Retrieval**: Search cultural database and recipes
4. **Response Generation**: Create culturally accurate explanations
5. **Related Topics**: Suggest follow-up research questions

## 📊 Analytics and Monitoring

### Search Analytics Dashboard

Access via database views:
- `search_analytics_summary`: Daily search statistics
- `popular_search_terms`: Most searched queries and click rates

### Performance Metrics

- Search response time (target: <200ms)
- Auto-suggest response time (target: <100ms)
- Recipe generation success rate (target: >90%)
- Cultural query satisfaction (measured via user feedback)

## 🔍 Search Algorithm

### Ranking Factors

1. **Relevance Score** (40%): Text matching quality
2. **Popularity Score** (30%): Views, ratings, searches
3. **Authenticity Score** (20%): Verified > Community > AI
4. **Freshness Score** (10%): Recently added content

### Fuzzy Search Implementation

- **Exact Match**: 100% relevance for perfect title matches
- **Partial Match**: 90% for partial title matches
- **Ingredient Match**: 80% for ingredient-based matches
- **Country/Cuisine**: 70% for geographic matches
- **Tag Match**: 60% for tag-based matches

## 🚦 Testing

### Manual Testing Checklist

- [ ] Basic recipe search returns relevant results
- [ ] Auto-suggestions appear within 300ms
- [ ] Voice search works in supported browsers
- [ ] Research mode provides cultural context
- [ ] Recipe generation triggers for missing dishes
- [ ] Keyboard navigation works properly
- [ ] Mobile interface is touch-friendly
- [ ] Search history persists across sessions

### API Testing

```bash
# Test search suggestions
curl "http://localhost:3000/api/search/suggest?q=pasta"

# Test full search with filters
curl "http://localhost:3000/api/search?q=italian&authenticity=verified"

# Test cultural research
curl "http://localhost:3000/api/search/research?q=What is traditional Japanese breakfast?"

# Test recipe generation
curl -X POST "http://localhost:3000/api/search/generate" \
  -H "Content-Type: application/json" \
  -d '{"query": "Ethiopian Injera"}'
```

## 🔧 Configuration

### Search Engine Configuration

The system uses MySQL FULLTEXT search as the primary engine with these indexes:
- `idx_recipe_search`: title, ingredients, instructions
- `idx_recipe_meta`: origin_country, cuisine, tags
- `idx_recipe_cultural`: cultural_context, cultural_significance

For production, consider upgrading to Elasticsearch for better performance.

### Caching Strategy

- **Auto-suggestions**: 5-minute cache TTL
- **Search results**: 15-minute cache TTL
- **Cultural knowledge**: 1-hour cache TTL
- **Generated recipes**: No caching (always fresh)

## 🚀 Performance Optimization

### Database Optimization

1. **Indexes**: Comprehensive indexing for all search fields
2. **Stored Procedures**: Efficient popularity score calculations
3. **Views**: Pre-computed analytics for dashboards
4. **Partitioning**: Consider partitioning large analytics tables

### Frontend Optimization

1. **Debouncing**: 300ms delay for search requests
2. **Lazy Loading**: Images loaded on demand
3. **Code Splitting**: Search components loaded separately
4. **Service Workers**: Cache search results offline

## 🔒 Security Considerations

### Input Validation

- Query length limits (3-200 characters)
- SQL injection prevention via parameterized queries
- XSS protection for user-generated content
- Rate limiting (100 searches per minute per user)

### API Security

- Authentication for recipe generation
- CORS configuration for cross-origin requests
- Request size limits for generation endpoints
- Monitoring for abuse patterns

## 🌍 Cultural Sensitivity

### Content Guidelines

1. **Accuracy**: All cultural information must be verified
2. **Respect**: Avoid stereotypes and oversimplifications
3. **Attribution**: Proper sourcing for cultural claims
4. **Community Input**: Allow corrections from cultural experts
5. **Review Process**: Human review for AI-generated cultural content

### Moderation Workflow

1. **Auto-generated Content**: Pending review by default
2. **Community Flagging**: Users can report inappropriate content
3. **Expert Review**: Cultural experts validate sensitive content
4. **Continuous Learning**: Improve AI based on feedback

## 📈 Future Enhancements

### Phase 2 Features

- [ ] Elasticsearch integration for better search performance
- [ ] Redis caching layer for improved response times
- [ ] Advanced filters (dietary restrictions, cooking equipment)
- [ ] Personalized search results based on user preferences
- [ ] Multi-language support for international recipes

### Phase 3 Features

- [ ] Visual search using recipe images
- [ ] Ingredient substitution suggestions
- [ ] Nutritional information integration
- [ ] Social features (save, share, collections)
- [ ] Mobile app with offline search capabilities

## 🐛 Troubleshooting

### Common Issues

1. **Search returns no results**
   - Check database connection
   - Verify FULLTEXT indexes exist
   - Ensure recipes table has published content

2. **Auto-suggestions not working**
   - Check API endpoint `/api/search/suggest`
   - Verify debouncing is working (300ms delay)
   - Check browser console for JavaScript errors

3. **Voice search not available**
   - Only works in Chrome/Edge browsers
   - Requires HTTPS in production
   - Check microphone permissions

4. **Recipe generation fails**
   - Verify OpenAI API key is set
   - Check API rate limits
   - Ensure database tables exist

### Debug Commands

```bash
# Check database tables
mysql -u root -p recipes_db -e "SHOW TABLES LIKE '%search%';"

# Test API endpoints
curl -v "http://localhost:3000/api/search/suggest?q=test"

# Check migration status
npm run migrate:search
```

## 📞 Support

For issues or questions about the Smart Search System:

1. Check this documentation first
2. Review the API endpoint responses for error messages
3. Check browser console for frontend errors
4. Verify database schema matches migration file
5. Test with simple queries before complex ones

The Smart Search System is designed to be robust and user-friendly while maintaining cultural sensitivity and accuracy. Regular monitoring and user feedback will help improve the system over time.