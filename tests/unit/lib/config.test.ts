import { describe, expect, it } from 'vitest';

import { API_CONFIG } from '@/lib/config/api.config';

describe('API Configuration', () => {
  it('has required endpoints', () => {
    expect(API_CONFIG.endpoints).toBeDefined();
    expect(API_CONFIG.endpoints.GAMES).toBe('/games');
    expect(API_CONFIG.endpoints.TEAMS).toBe('/teams');
    expect(API_CONFIG.endpoints.PLAYERS).toBe('/players');
    expect(API_CONFIG.endpoints.STANDINGS).toBe('/standings');
  });

  it('has timeout configuration', () => {
    expect(API_CONFIG.timeout).toBeDefined();
    expect(typeof API_CONFIG.timeout).toBe('number');
    expect(API_CONFIG.timeout).toBeGreaterThan(0);
  });

  it('has retry configuration', () => {
    expect(API_CONFIG.retryAttempts).toBeDefined();
    expect(typeof API_CONFIG.retryAttempts).toBe('number');
    expect(API_CONFIG.retryAttempts).toBeGreaterThan(0);
  });

  it('has error codes', () => {
    expect(API_CONFIG.errorCodes).toBeDefined();
    expect(API_CONFIG.errorCodes.UNAUTHORIZED).toBe(401);
  });
});
