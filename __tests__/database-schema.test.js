const { executeQuery, initializeDatabase, populateCountriesData } = require('../lib/database');

describe('Database Schema and Migrations', () => {
  beforeAll(async () => {
    await initializeDatabase();
    await populateCountriesData();
  });

  describe('Table Structure Tests', () => {
    test('recipes table has all required geographic columns', async () => {
      const [columns] = await executeQuery('PRAGMA table_info(recipes)');
      const columnNames = columns.map(col => col.name);
      
      // Check for geographic columns
      expect(columnNames).toContain('latitude');
      expect(columnNames).toContain('longitude');
      expect(columnNames).toContain('origin_country');
      expect(columnNames).toContain('country_code');
      expect(columnNames).toContain('region');
      expect(columnNames).toContain('city');
      
      // Check column types
      const latitudeCol = columns.find(col => col.name === 'latitude');
      const longitudeCol = columns.find(col => col.name === 'longitude');
      const countryCodeCol = columns.find(col => col.name === 'country_code');
      
      expect(latitudeCol.type).toBe('REAL');
      expect(longitudeCol.type).toBe('REAL');
      expect(countryCodeCol.type).toBe('CHAR(2)');
    });

    test('countries table exists with correct structure', async () => {
      const [columns] = await executeQuery('PRAGMA table_info(countries)');
      const columnNames = columns.map(col => col.name);
      
      expect(columnNames).toContain('code');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('latitude');
      expect(columnNames).toContain('longitude');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('cuisine_types');
      expect(columnNames).toContain('cultural_context');
      
      // Check primary key
      const codeCol = columns.find(col => col.name === 'code');
      expect(codeCol.pk).toBe(1); // Primary key
    });

    test('recipe_locations table exists with correct structure', async () => {
      const [columns] = await executeQuery('PRAGMA table_info(recipe_locations)');
      const columnNames = columns.map(col => col.name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('recipe_id');
      expect(columnNames).toContain('latitude');
      expect(columnNames).toContain('longitude');
      expect(columnNames).toContain('location_type');
      
      // Check foreign key constraint exists
      const [foreignKeys] = await executeQuery('PRAGMA foreign_key_list(recipe_locations)');
      expect(foreignKeys.length).toBeGreaterThan(0);
      expect(foreignKeys[0].table).toBe('recipes');
    });
  });

  describe('Index Tests', () => {
    test('geographic indexes are created', async () => {
      const [indexes] = await executeQuery('SELECT name FROM sqlite_master WHERE type="index" AND name LIKE "idx_%"');
      const indexNames = indexes.map(idx => idx.name);
      
      expect(indexNames).toContain('idx_recipes_coordinates');
      expect(indexNames).toContain('idx_recipes_country');
      expect(indexNames).toContain('idx_recipes_country_code');
      expect(indexNames).toContain('idx_recipe_locations_recipe_id');
      expect(indexNames).toContain('idx_recipe_locations_coordinates');
    });
  });

  describe('Coordinate Validation Tests', () => {
    test('valid coordinates are accepted', async () => {
      const validCoordinates = [
        { lat: 0, lng: 0 },
        { lat: 90, lng: 180 },
        { lat: -90, lng: -180 },
        { lat: 41.8719, lng: 12.5674 }, // Rome
        { lat: 13.7563, lng: 100.5018 } // Bangkok
      ];

      for (const coord of validCoordinates) {
        const result = await executeQuery(`
          INSERT INTO recipes (title, ingredients, origin_country, country_code, latitude, longitude)
          VALUES (?, ?, ?, ?, ?, ?)
        `, ['Test Recipe', 'Test ingredients', 'Italy', 'IT', coord.lat, coord.lng]);
        
        expect(result.insertId).toBeTruthy();
        
        // Clean up
        await executeQuery('DELETE FROM recipes WHERE id = ?', [result.insertId]);
      }
    });

    test('coordinate edge cases are handled correctly', async () => {
      // Test boundary values
      const edgeCases = [
        { lat: 90, lng: 180, description: 'maximum values' },
        { lat: -90, lng: -180, description: 'minimum values' },
        { lat: 0, lng: 0, description: 'zero values' }
      ];

      for (const testCase of edgeCases) {
        const result = await executeQuery(`
          INSERT INTO recipes (title, ingredients, origin_country, country_code, latitude, longitude)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [`Test ${testCase.description}`, 'Test ingredients', 'Italy', 'IT', testCase.lat, testCase.lng]);
        
        const [recipes] = await executeQuery('SELECT latitude, longitude FROM recipes WHERE id = ?', [result.insertId]);
        
        expect(recipes[0].latitude).toBe(testCase.lat);
        expect(recipes[0].longitude).toBe(testCase.lng);
        
        // Clean up
        await executeQuery('DELETE FROM recipes WHERE id = ?', [result.insertId]);
      }
    });
  });

  describe('Country Data Tests', () => {
    test('countries table is populated with sample data', async () => {
      const [countries] = await executeQuery('SELECT * FROM countries');
      
      expect(countries.length).toBeGreaterThan(0);
      
      // Check specific countries exist
      const countryCodes = countries.map(c => c.code);
      expect(countryCodes).toContain('IT');
      expect(countryCodes).toContain('TH');
      expect(countryCodes).toContain('IN');
    });

    test('country data has valid coordinates', async () => {
      const [countries] = await executeQuery('SELECT * FROM countries');
      
      for (const country of countries) {
        expect(country.latitude).toBeGreaterThanOrEqual(-90);
        expect(country.latitude).toBeLessThanOrEqual(90);
        expect(country.longitude).toBeGreaterThanOrEqual(-180);
        expect(country.longitude).toBeLessThanOrEqual(180);
        expect(country.code).toMatch(/^[A-Z]{2}$/);
        expect(country.name).toBeTruthy();
      }
    });

    test('country cultural context is valid JSON', async () => {
      const [countries] = await executeQuery('SELECT * FROM countries WHERE cultural_context IS NOT NULL');
      
      for (const country of countries) {
        expect(() => {
          const context = JSON.parse(country.cultural_context);
          expect(context).toHaveProperty('signatureDishes');
          expect(context).toHaveProperty('cookingTraditions');
          expect(context).toHaveProperty('culinaryInfluences');
          expect(Array.isArray(context.signatureDishes)).toBe(true);
          expect(Array.isArray(context.cookingTraditions)).toBe(true);
          expect(Array.isArray(context.culinaryInfluences)).toBe(true);
        }).not.toThrow();
      }
    });
  });

  describe('Fallback Coordinate Behavior Tests', () => {
    test('recipes without coordinates can use country fallback', async () => {
      // Insert recipe without coordinates
      const result = await executeQuery(`
        INSERT INTO recipes (title, ingredients, origin_country, country_code)
        VALUES (?, ?, ?, ?)
      `, ['Test Recipe No Coords', 'Test ingredients', 'Italy', 'IT']);
      
      const recipeId = result.insertId;
      
      // Get recipe
      const [recipes] = await executeQuery('SELECT * FROM recipes WHERE id = ?', [recipeId]);
      const recipe = recipes[0];
      
      // Recipe should have no coordinates
      expect(recipe.latitude).toBeNull();
      expect(recipe.longitude).toBeNull();
      
      // But country should have fallback coordinates
      const [countryData] = await executeQuery('SELECT latitude, longitude FROM countries WHERE code = ?', [recipe.country_code]);
      expect(countryData.length).toBeGreaterThan(0);
      expect(countryData[0].latitude).toBeTruthy();
      expect(countryData[0].longitude).toBeTruthy();
      
      // Clean up
      await executeQuery('DELETE FROM recipes WHERE id = ?', [recipeId]);
    });
  });

  describe('Recipe Locations Table Tests', () => {
    test('recipe_locations supports multiple locations per recipe', async () => {
      // Insert a test recipe
      const recipeResult = await executeQuery(`
        INSERT INTO recipes (title, ingredients, origin_country, country_code)
        VALUES (?, ?, ?, ?)
      `, ['Multi-location Recipe', 'Test ingredients', 'Italy', 'IT']);
      
      const recipeId = recipeResult.insertId;
      
      // Add multiple locations
      const locations = [
        { lat: 41.8719, lng: 12.5674, type: 'origin' }, // Rome
        { lat: 45.4642, lng: 9.1900, type: 'regional_variant' }, // Milan
        { lat: 40.8518, lng: 14.2681, type: 'cultural_influence' } // Naples
      ];
      
      for (const location of locations) {
        await executeQuery(`
          INSERT INTO recipe_locations (recipe_id, latitude, longitude, location_type)
          VALUES (?, ?, ?, ?)
        `, [recipeId, location.lat, location.lng, location.type]);
      }
      
      // Verify locations were inserted
      const [recipeLocations] = await executeQuery('SELECT * FROM recipe_locations WHERE recipe_id = ?', [recipeId]);
      expect(recipeLocations.length).toBe(3);
      
      // Verify location types
      const locationTypes = recipeLocations.map(loc => loc.location_type);
      expect(locationTypes).toContain('origin');
      expect(locationTypes).toContain('regional_variant');
      expect(locationTypes).toContain('cultural_influence');
      
      // Clean up
      await executeQuery('DELETE FROM recipe_locations WHERE recipe_id = ?', [recipeId]);
      await executeQuery('DELETE FROM recipes WHERE id = ?', [recipeId]);
    });

    test('recipe_locations enforces foreign key constraint', async () => {
      // Try to insert location for non-existent recipe
      await expect(
        executeQuery(`
          INSERT INTO recipe_locations (recipe_id, latitude, longitude, location_type)
          VALUES (?, ?, ?, ?)
        `, [99999, 41.8719, 12.5674, 'origin'])
      ).rejects.toThrow();
    });
  });
});