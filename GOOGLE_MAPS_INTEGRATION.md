# Google Maps Integration Guide

## Overview

The Google Maps integration provides a comprehensive location-based recipe discovery system that automatically geocodes recipes, displays them on an interactive map, and enables location-based search functionality.

## 🗺️ Features

### Interactive Recipe Map
- **Visual Recipe Discovery**: Explore recipes plotted on a world map by their geographic origins
- **Smart Clustering**: Recipes are grouped by location with color-coded authenticity markers
- **Interactive Info Windows**: Click markers to see recipe previews with images and details
- **Location Filtering**: Filter recipes by country, region, cuisine, and authenticity status

### Automatic Geocoding
- **Smart Location Detection**: Automatically determines coordinates for recipes based on origin country
- **Batch Processing**: Efficiently geocodes multiple recipes using stored procedures
- **Fallback System**: Uses country coordinates when specific locations aren't available
- **API Integration**: Google Geocoding API for precise location data

### Location-Based Search
- **Radius Search**: Find recipes within a specified distance from any location
- **Country/Region Filtering**: Browse recipes by geographic regions
- **Cultural Context**: Discover recipes with their cultural and historical backgrounds
- **Distance Calculation**: Shows how far recipes are from your current location

## 🚀 Quick Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for enhanced search)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your-api-key-here...
GOOGLE_MAPS_API_KEY=AIza...your-api-key-here...
```

**Note**: `NEXT_PUBLIC_` prefix makes the key available to the frontend for map rendering.

### 3. Run Database Migration

```bash
npm run migrate:location
```

This will:
- Add location fields to the recipes table
- Create country coordinates reference data
- Set up geocoding queue and analytics tables
- Auto-geocode existing recipes

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/map` to see the interactive recipe map
3. Try searching for recipes by location
4. Click on map markers to see recipe details

## 📁 File Structure

```
├── pages/
│   ├── map.tsx                      # Main map page
│   └── api/recipes/
│       ├── map.ts                   # Fetch recipes with coordinates
│       ├── geocode.ts               # Geocoding API endpoint
│       └── by-location.ts           # Location-based recipe search
├── migrations/
│   └── 003_add_location_fields.sql  # Database schema for locations
└── run-location-migration.js        # Migration runner
```

## 🗄️ Database Schema

### New Tables

#### `country_coordinates`
Stores reference coordinates for countries:
```sql
CREATE TABLE country_coordinates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL UNIQUE,
  country_code VARCHAR(3) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  zoom_level TINYINT DEFAULT 6
);
```

#### `location_analytics`
Tracks location-based searches:
```sql
CREATE TABLE location_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  search_type ENUM('country', 'region', 'city', 'coordinates'),
  search_query VARCHAR(255) NOT NULL,
  user_location_lat DECIMAL(10, 8) NULL,
  user_location_lng DECIMAL(11, 8) NULL,
  distance_km DECIMAL(8, 2) NULL,
  clicked BOOLEAN DEFAULT FALSE
);
```

#### `geocoding_queue`
Manages batch geocoding operations:
```sql
CREATE TABLE geocoding_queue (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  search_address TEXT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed'),
  result_lat DECIMAL(10, 8) NULL,
  result_lng DECIMAL(11, 8) NULL
);
```

### Enhanced Recipe Fields

```sql
ALTER TABLE recipes ADD COLUMN (
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  region VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  geocoded_at TIMESTAMP NULL,
  location_accuracy ENUM('exact', 'approximate', 'country')
);
```

## 🔧 API Endpoints

### 1. Map Recipes
```
GET /api/recipes/map
```

Returns all recipes with coordinates for map display:

```json
{
  "success": true,
  "recipes": [
    {
      "id": "123",
      "title": "Pasta Carbonara",
      "origin_country": "Italy",
      "cuisine": "Italian",
      "latitude": 41.8719,
      "longitude": 12.5674,
      "authenticity_status": "verified",
      "image_url": "...",
      "cultural_context": "..."
    }
  ],
  "total": 150,
  "countries": ["Italy", "France", "Spain", ...]
}
```

### 2. Geocode Recipes
```
POST /api/recipes/geocode
```

Automatically geocodes recipes using Google Maps API:

```json
{
  "recipeId": 123,        // Optional: specific recipe
  "forceUpdate": false    // Optional: re-geocode existing
}
```

Response:
```json
{
  "success": true,
  "updated": 25,
  "errors": [],
  "message": "Geocoded 25 recipes successfully"
}
```

### 3. Location-Based Search
```
GET /api/recipes/by-location?country=Italy&radius=50&lat=41.8719&lng=12.5674
```

Parameters:
- `country`: Filter by country name
- `region`: Filter by region/state
- `city`: Filter by city
- `lat`, `lng`: Search center coordinates
- `radius`: Search radius in kilometers (default: 50)
- `authenticity`: Filter by authenticity status
- `cuisine`: Filter by cuisine type
- `difficulty`: Filter by difficulty level

## 🎨 Frontend Components

### Map Page Features

#### Interactive Map
- **Custom Styling**: Clean, minimal map design focused on recipe locations
- **Marker Clustering**: Prevents overcrowding with smart grouping
- **Color Coding**: Different colors for verified, community, and AI-generated recipes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

#### Sidebar Filters
- **Real-time Filtering**: Instant results as you adjust filters
- **Multiple Categories**: Filter by authenticity, cuisine, difficulty
- **Recipe List**: Scrollable list of filtered recipes with quick access
- **Focus Navigation**: Click recipes to center map on their location

#### Info Windows
- **Rich Content**: Recipe images, titles, and key information
- **Direct Links**: Quick access to full recipe pages
- **Authenticity Badges**: Clear visual indicators of content trust level

### Map Customization

```javascript
// Custom map styling
const mapStyles = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
  }
  // ... more styling options
];

// Marker customization based on authenticity
const getMarkerIcon = (status) => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: status === 'verified' ? '#10b981' : 
             status === 'community' ? '#3b82f6' : '#f59e0b',
  fillOpacity: 0.8,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 8
});
```

## 🔄 Automatic Geocoding System

### Batch Processing
The system includes stored procedures for efficient batch geocoding:

```sql
-- Auto-geocode recipes without coordinates
CALL AutoGeocodeRecipes(50);
```

### Geocoding Strategy
1. **Check Existing**: Skip recipes that already have coordinates
2. **Country Lookup**: Use country coordinates table for approximate locations
3. **Add Randomization**: Prevent marker overlap with small coordinate variations
4. **Queue System**: Add complex addresses to geocoding queue for API processing
5. **Accuracy Tracking**: Mark location accuracy level (exact, approximate, country)

### Daily Automation
```sql
-- Scheduled event runs daily
CREATE EVENT daily_auto_geocode
ON SCHEDULE EVERY 1 DAY
DO CALL AutoGeocodeRecipes(20);
```

## 📊 Analytics and Monitoring

### Location Search Analytics
Track user behavior and popular locations:

```sql
-- Most searched locations
SELECT 
  search_query,
  COUNT(*) as search_count,
  AVG(distance_km) as avg_distance,
  COUNT(CASE WHEN clicked = TRUE THEN 1 END) as click_count
FROM location_analytics 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY search_query
ORDER BY search_count DESC;
```

### Geocoding Success Rate
Monitor geocoding performance:

```sql
-- Geocoding success metrics
SELECT 
  status,
  COUNT(*) as count,
  AVG(attempts) as avg_attempts
FROM geocoding_queue 
GROUP BY status;
```

## 🔒 Security and Best Practices

### API Key Security
- **Domain Restrictions**: Limit API key usage to your domain
- **API Restrictions**: Only enable required APIs (Maps JavaScript, Geocoding)
- **Environment Variables**: Never commit API keys to version control
- **Rate Limiting**: Monitor API usage to avoid quota overages

### Performance Optimization
- **Marker Clustering**: Use clustering for large numbers of recipes
- **Lazy Loading**: Load map data progressively
- **Caching**: Cache geocoding results to minimize API calls
- **Batch Processing**: Geocode multiple recipes in batches

### Error Handling
```javascript
// Graceful fallback when Maps API fails
useEffect(() => {
  const initializeMap = () => {
    if (!window.google) {
      console.error('Google Maps API failed to load');
      setError('Map unavailable. Please try again later.');
      return;
    }
    // Initialize map...
  };
  
  // Load with error handling
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.onload = initializeMap;
  script.onerror = () => setError('Failed to load map');
  document.head.appendChild(script);
}, []);
```

## 🌍 Supported Countries

The system includes coordinates for 70+ countries:

- **Europe**: Italy, France, Spain, Germany, UK, etc.
- **Asia**: India, China, Japan, Thailand, Vietnam, etc.
- **Americas**: USA, Canada, Mexico, Brazil, Argentina, etc.
- **Africa**: Morocco, Egypt, Nigeria, South Africa, etc.
- **Oceania**: Australia, New Zealand

New countries can be added to the `country_coordinates` table.

## 🚀 Advanced Features

### User Location Detection
```javascript
// Get user's current location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    
    // Find nearby recipes
    fetchNearbyRecipes(userLat, userLng, 25); // 25km radius
  },
  (error) => {
    console.log('Location access denied');
  }
);
```

### Recipe Clustering
```javascript
// Group nearby recipes to prevent marker overlap
const clusterer = new MarkerClusterer(map, markers, {
  imagePath: '/images/cluster/m',
  gridSize: 60,
  maxZoom: 15
});
```

### Custom Map Controls
```javascript
// Add custom controls to the map
const locationButton = document.createElement('button');
locationButton.textContent = 'Find My Location';
locationButton.classList.add('custom-map-control-button');

map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
```

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**
   - Check API key is correct and has proper restrictions
   - Verify Maps JavaScript API is enabled
   - Check browser console for errors

2. **Geocoding failing**
   - Ensure Geocoding API is enabled
   - Check API quota limits
   - Verify database connection

3. **Markers not appearing**
   - Check if recipes have latitude/longitude values
   - Run the location migration: `npm run migrate:location`
   - Verify map bounds include recipe locations

4. **Performance issues**
   - Enable marker clustering for large datasets
   - Implement lazy loading for recipe data
   - Optimize database queries with proper indexes

### Debug Commands

```bash
# Check geocoded recipes
mysql -u root -p recipes_db -e "SELECT COUNT(*) FROM recipes WHERE latitude IS NOT NULL;"

# Run geocoding for specific recipe
curl -X POST "http://localhost:3000/api/recipes/geocode" \
  -H "Content-Type: application/json" \
  -d '{"recipeId": 123}'

# Test location search
curl "http://localhost:3000/api/recipes/by-location?country=Italy&limit=5"
```

## 📈 Future Enhancements

### Planned Features
- [ ] **Street View Integration**: Show recipe locations in Street View
- [ ] **Route Planning**: Plan food tours visiting multiple recipe locations
- [ ] **Augmented Reality**: AR overlay showing nearby recipes
- [ ] **Offline Maps**: Cache map data for offline browsing
- [ ] **Social Features**: Share favorite recipe locations

### Advanced Geocoding
- [ ] **Precise Locations**: Restaurant/market locations for recipes
- [ ] **Historical Accuracy**: Time-period appropriate locations
- [ ] **Regional Variations**: Multiple locations per recipe variant
- [ ] **User Contributions**: Allow users to suggest location corrections

The Google Maps integration transforms the recipe discovery experience by adding a powerful geographic dimension to culinary exploration, making it easy to discover authentic dishes from their places of origin! 🗺️🍽️