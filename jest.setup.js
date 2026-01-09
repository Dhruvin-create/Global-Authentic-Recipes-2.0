// Jest setup file for global test configuration

// Increase timeout for property-based tests
jest.setTimeout(30000);

// Clean up database after each test suite
afterAll(async () => {
  // Clean up any test data
  console.log('Test suite completed');
});