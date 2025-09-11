import { beforeAll } from 'vitest';
import { setupLandingPageDataServiceMock } from './mocks/landing-page-data.service.mock';

// Setup mocks for integration tests
beforeAll(() => {
  // Mock the LandingPageDataService to prevent Redis/DB calls
  setupLandingPageDataServiceMock();

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MOCK_MODE = 'true';

  console.log('🔧 Integration test setup: Applied LandingPageDataService mock');
});
