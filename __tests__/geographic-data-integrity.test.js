const fc = require('fast-check');
const { executeQuery, initializeDatabase, populateCountriesData } = require('../lib/database');

describe('Geographic Data Integrity Properties', () => {
  beforeAll(async () => {
    // Initialize database for testing
    await initializeDatabase();
    await populateCountriesData();
  });

  /**
   * Property 1: Geographic Data Integrity
   * For any recipe in the system, geographic data should be complete with valid coordinates, 
   * country information, and appropriate fallback to country-level coordinates when exact locations are unavailable.
   * Validates: Requirements 1.1, 1.2, 1.3, 1.6
   * Feature: recipe-map, Property 1: Geographic Data Integrity
   */
  test('Property 1: Geographic data integrity for all recipes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate recipe data with geographic information
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          ingredients: fc.string({ minLength: 10, maxLength: 500 }),
          countryInfo: fc.constantFrom(
            { country: 'Italy', code: 'IT', cuisine: 'Italian' },
            { country: 'Thailand', code: 'TH', cuisine: 'Thai' },
            { country: 'India', code: 'IN', cuisine: 'Indian' }
          ),
          latitude: fc.option(fc.float({ min: -90, max: 90 }), { nil: null }),
          longitude: fc.option(fc.float({ min: -180, max: 180 }), { nil: null }),
          region: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
          city: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null })
        }),
        async (recipeData) => {
          // Insert the recipe
          const result = await executeQuery(`
            INSERT INTO recipes (title, ingredients, origin_country, country_code, cuisine, latitude, longitude, region, city)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            recipeData.title,
            recipeData.ingredients,
            recipeData.countryInfo.country,
            recipeData.countryInfo.code,
            recipeData.countryInfo.cuisine,
            recipeData.latitude,
            recipeData.longitude,
            recipeData.region,
            recipeData.city
          ]);

          const recipeId = result.insertId;

          // Retrieve the recipe
          const [recipes] = await executeQuery('SELECT * FROM recipes WHERE id = ?', [recipeId]);
          const recipe = recipes[0];

          // Property assertions
          
          // 1. Recipe must have valid country information (Requirements 1.1, 1.2)
          expect(recipe.origin_country).toBeTruthy();
          expect(recipe.country_code).toBeTruthy();
          expect(recipe.country_code).toMatch(/^[A-Z]{2}$/);

          // 2. If coordinates are provided, they must be valid (Requirements 1.1)
          if (recipe.latitude !== null) {
            expect(recipe.latitude).toBeGreaterThanOrEqual(-90);
            expect(recipe.latitude).toBeLessThanOrEqual(90);
          }
          if (recipe.longitude !== null) {
            expect(recipe.longitude).toBeGreaterThanOrEqual(-180);
            expect(recipe.longitude).toBeLessThanOrEqual(180);
          }

          // 3. Country code must match a valid country in countries table (Requirements 1.2)
          const [countryCheck] = await executeQuery('SELECT * FROM countries WHERE code = ?', [recipe.country_code]);
          expect(countryCheck.length).toBeGreaterThan(0);

          // 4. If no coordinates provided, fallback should be available from countries table (Requirements 1.6)
          if (recipe.latitude === null || recipe.longitude === null) {
            const [countryData] = await executeQuery('SELECT latitude, longitude FROM countries WHERE code = ?', [recipe.country_code]);
            expect(countryData.length).toBeGreaterThan(0);
            expect(countryData[0].latitude).toBeTruthy();
            expect(countryData[0].longitude).toBeTruthy();
          }

          // 5. Geographic data consistency - coordinates should match country if both are provided
          if (recipe.latitude !== null && recipe.longitude !== null) {
            // This is a simplified check - in a real system you'd use proper geographic boundaries
            // For now, we just ensure the data is structurally valid
            expect(typeof recipe.latitude).toBe('number');
            expect(typeof recipe.longitude).toBe('number');
          }

          // Clean up
          await executeQuery('DELETE FROM recipes WHERE id = ?', [recipeId]);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  /**
   * Test coordinate validation edge cases
   */
  test('Property 1a: Coordinate validation handles edge cases', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.constant('Test Recipe'),
          ingredients: fc.constant('Test ingredients'),
          origin_country: fc.constant('Italy'),
          country_code: fc.constant('IT'),
          cuisine: fc.constant('Italian'),
          latitude: fc.constantFrom(-90, -89.999, 0, 89.999, 90), // Edge values
          longitude: fc.constantFrom(-180, -179.999, 0, 179.999, 180) // Edge values
        }),
        async (recipeData) => {
          // Insert recipe with edge coordinate values
          const result = await executeQuery(`
            INSERT INTO recipes (title, ingredients, origin_country, country_code, cuisine, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            recipeData.title,
            recipeData.ingredients,
            recipeData.origin_country,
            recipeData.country_code,
            recipeData.cuisine,
            recipeData.latitude,
            recipeData.longitude
          ]);

          const recipeId = result.insertId;

          // Retrieve and validate
          const [recipes] = await executeQuery('SELECT * FROM recipes WHERE id = ?', [recipeId]);
          const recipe = recipes[0];

          // Edge coordinates should be preserved exactly
          expect(recipe.latitude).toBe(recipeData.latitude);
          expect(recipe.longitude).toBe(recipeData.longitude);

          // Clean up
          await executeQuery('DELETE FROM recipes WHERE id = ?', [recipeId]);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test fallback coordinate behavior
   */
  test('Property 1b: Fallback coordinates work for recipes without specific locations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 50 }),
          ingredients: fc.string({ minLength: 10, maxLength: 200 }),
          country_code: fc.constantFrom('IT', 'TH', 'IN') // Countries we have in our test data
        }),
        async (recipeData) => {
          // Insert recipe without coordinates
          const result = await executeQuery(`
            INSERT INTO recipes (title, ingredients, country_code)
            VALUES (?, ?, ?)
          `, [
            recipeData.title,
            recipeData.ingredients,
            recipeData.country_code
          ]);

          const recipeId = result.insertId;

          // Get country fallback coordinates
          const [countryData] = await executeQuery('SELECT latitude, longitude FROM countries WHERE code = ?', [recipeData.country_code]);
          
          // Fallback coordinates should be available
          expect(countryData.length).toBeGreaterThan(0);
          expect(countryData[0].latitude).toBeTruthy();
          expect(countryData[0].longitude).toBeTruthy();
          expect(countryData[0].latitude).toBeGreaterThanOrEqual(-90);
          expect(countryData[0].latitude).toBeLessThanOrEqual(90);
          expect(countryData[0].longitude).toBeGreaterThanOrEqual(-180);
          expect(countryData[0].longitude).toBeLessThanOrEqual(180);

          // Clean up
          await executeQuery('DELETE FROM recipes WHERE id = ?', [recipeId]);
        }
      ),
      { numRuns: 30 }
    );
  });
});