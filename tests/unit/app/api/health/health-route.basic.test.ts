import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/health/route';
import { db, dbManager } from '@/lib/db';

// Mock the database and error handlers
vi.mock('@/lib/db', () => ({
  db: vi.fn(),
  dbManager: {
    testConnection: vi.fn(),
    initialize: vi.fn(),
  },
}));

vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
    database: vi.fn(),
  },
}));

describe('Health API Route', () => {
  const mockRequest = new NextRequest('http://localhost:3000/api/health');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns healthy status when all checks pass', async () => {
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    (db as any).mockReturnValue(mockDatabase);
    (dbManager.testConnection as any).mockResolvedValue(true);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      checks: {
        database: {
          healthy: true,
          response_time: 0,
        },
        external_services: {
          healthy: true,
          services: expect.objectContaining({
            clerk: expect.any(Boolean),
            rapidapi: expect.any(Boolean),
            redis: expect.any(Boolean),
          }),
        },
      },
    });
  });

  it('returns unhealthy status when database check fails', async () => {
    const mockDatabase = {
      execute: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    };
    (db as any).mockReturnValue(mockDatabase);
    (dbManager.testConnection as any).mockResolvedValue(false);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      status: 'unhealthy',
      checks: {
        database: {
          healthy: false,
          error: 'Database check failed',
        },
        external_services: {
          healthy: true,
          services: expect.objectContaining({
            clerk: expect.any(Boolean),
            rapidapi: expect.any(Boolean),
            redis: expect.any(Boolean),
          }),
        },
      },
    });
  });

  it('returns error status when database is not available', async () => {
    (db as any).mockImplementation(() => {
      throw new Error('Database not available');
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      status: 'unhealthy',
      checks: {
        database: {
          healthy: false,
          error: 'Database check failed',
        },
        external_services: {
          healthy: expect.any(Boolean), // Can be true if any service has env vars
          services: expect.objectContaining({
            clerk: expect.any(Boolean),
            rapidapi: expect.any(Boolean),
            redis: expect.any(Boolean),
          }),
        },
      },
    });
  });

  it('handles database connection errors gracefully', async () => {
    const mockDatabase = {
      execute: vi.fn().mockRejectedValue(new Error('Database connection error')),
    };
    (db as any).mockReturnValue(mockDatabase);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      status: 'unhealthy',
      checks: {
        database: {
          healthy: false,
          error: 'Database check failed',
        },
        external_services: {
          healthy: expect.any(Boolean), // Can be true if any service has env vars
          services: expect.objectContaining({
            clerk: expect.any(Boolean),
            rapidapi: expect.any(Boolean),
            redis: expect.any(Boolean),
          }),
        },
      },
    });
  });

  it('includes response time in the response', async () => {
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    (db as any).mockReturnValue(mockDatabase);
    (dbManager.testConnection as any).mockResolvedValue(true);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data).toHaveProperty('response_time');
    expect(typeof data.response_time).toBe('number');
    expect(data.response_time).toBeGreaterThanOrEqual(0);
  });

  it('includes timestamp in the response', async () => {
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    (db as any).mockReturnValue(mockDatabase);
    (dbManager.testConnection as any).mockResolvedValue(true);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data).toHaveProperty('timestamp');
    expect(typeof data.timestamp).toBe('string');
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
  });

  it('includes version and environment in the response', async () => {
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    (db as any).mockReturnValue(mockDatabase);
    (dbManager.testConnection as any).mockResolvedValue(true);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
    expect(typeof data.version).toBe('string');
    expect(typeof data.environment).toBe('string');
  });
});
