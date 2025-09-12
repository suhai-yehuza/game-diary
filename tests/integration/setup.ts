import { beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';
import { setupLandingPageDataServiceMock } from './mocks/landing-page-data.service.mock';
import {
  preTestCleanup,
  postTestCleanup,
  comprehensivePostTestCleanup,
  needsCleanup,
} from './cleanup-utils';

// Load environment variables for integration tests
config({ path: '.env.development' });

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

// Global state for cleanup
let globalDb: any = null;
let globalUsingRealDatabase = false;

// Setup mocks and cleanup for integration tests
beforeAll(async () => {
  console.log('🔧 Integration test setup: Starting...');

  // Mock the LandingPageDataService to prevent Redis/DB calls
  setupLandingPageDataServiceMock();

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MOCK_MODE = 'true';

  console.log('🔧 Integration test setup: Applied LandingPageDataService mock');

  // Always run pre-test cleanup for database and notification tests
  if (databaseUrl) {
    console.log('🧹 Running pre-test cleanup for database/notification tests...');
    const cleanupResult = await preTestCleanup(databaseUrl);
    globalDb = cleanupResult.db;
    globalUsingRealDatabase = cleanupResult.usingRealDatabase;

    if (globalUsingRealDatabase) {
      console.log('✅ Pre-test cleanup completed - database ready for tests');
    } else {
      console.log('⚠️ Pre-test cleanup skipped - using mock database');
    }
  } else {
    console.log('⚠️ No DATABASE_URL found - skipping pre-test cleanup');
  }
});

// Global cleanup after all integration tests
afterAll(async () => {
  if (globalUsingRealDatabase && globalDb) {
    console.log('🧹 Running global post-test cleanup...');
    try {
      await comprehensivePostTestCleanup({
        usingRealDatabase: globalUsingRealDatabase,
        db: globalDb,
      });
      console.log('✅ Global post-test cleanup completed');
    } catch (error) {
      console.error('❌ Error during global post-test cleanup:', error);
    }
  }
});

// Export cleanup utilities for individual test files
export { globalDb, globalUsingRealDatabase, needsCleanup };
