import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database
const mockDb = vi.fn();
vi.mock('@/lib/db', () => ({
  db: () => mockDb(),
}));

// Mock NextResponse
const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

import { GET } from '@/app/api/health/route';

describe('Health API Route', () => {
  const mockRequest = {} as NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));

    // Reset environment variables
    vi.stubEnv('npm_package_version', undefined);
    vi.stubEnv('NODE_ENV', undefined);
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', undefined);
    vi.stubEnv('CLERK_SECRET_KEY', undefined);
    vi.stubEnv('NEXT_PUBLIC_RAPID_API_KEY', undefined);
    vi.stubEnv('UPSTASH_REDIS_REST_URL', undefined);
    vi.stubEnv('REDIS_URL', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns healthy status when all checks pass', async () => {
    // Mock successful database check
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    mockDb.mockReturnValue(mockDatabase);

    // Set environment variables for external services
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_123');
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_123');
    vi.stubEnv('NEXT_PUBLIC_RAPID_API_KEY', 'rapid_api_key');
    vi.stubEnv('NODE_ENV', 'test');

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        timestamp: '2023-01-01T00:00:00.000Z',
        response_time: expect.any(Number),
        checks: {
          database: {
            healthy: true,
            response_time: 0,
          },
          external_services: {
            healthy: true,
            services: {
              clerk: true,
              rapidapi: true,
              redis: false,
            },
          },
        },
        version: 'unknown',
        environment: 'test',
      }),
      { status: 200 }
    );
  });

  it('returns unhealthy status when database check fails', async () => {
    // Mock failed database check
    const mockDatabase = {
      execute: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    };
    mockDb.mockReturnValue(mockDatabase);

    // Set environment variables for external services
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_123');
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_123');

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unhealthy',
        timestamp: '2023-01-01T00:00:00.000Z',
        response_time: expect.any(Number),
        checks: {
          database: {
            healthy: false,
            error: 'Database connection failed',
          },
          external_services: {
            healthy: true,
            services: {
              clerk: true,
              rapidapi: false,
              redis: false,
            },
          },
        },
        version: 'unknown',
        environment: undefined,
      }),
      { status: 503 }
    );
  });

  it('returns unhealthy status when no external services are configured', async () => {
    // Mock successful database check
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    mockDb.mockReturnValue(mockDatabase);

    // No environment variables set

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unhealthy',
        checks: {
          database: {
            healthy: true,
            response_time: 0,
          },
          external_services: {
            healthy: false,
            services: {
              clerk: false,
              rapidapi: false,
              redis: false,
            },
          },
        },
      }),
      { status: 503 }
    );
  });

  it('returns error status when database is not available', async () => {
    // Mock database not available
    mockDb.mockReturnValue(null);

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unhealthy',
        checks: {
          database: {
            healthy: false,
            error: 'Database connection not available',
          },
          external_services: {
            healthy: false,
            services: {
              clerk: false,
              rapidapi: false,
              redis: false,
            },
          },
        },
      }),
      { status: 503 }
    );
  });

  it('handles database connection errors gracefully', async () => {
    // Mock database connection error
    mockDb.mockImplementation(() => {
      throw new Error('Database connection error');
    });

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: 'Database connection error',
        checks: {
          database: { healthy: false, error: 'Health check failed' },
          external_services: { healthy: false, error: 'Health check failed' },
        },
      }),
      { status: 503 }
    );
  });

  it('includes package version when available', async () => {
    // Mock successful database check
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    mockDb.mockReturnValue(mockDatabase);

    // Set package version
    vi.stubEnv('npm_package_version', '1.0.0');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_123');

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        version: '1.0.0',
      }),
      expect.any(Object)
    );
  });

  it('includes Redis configuration when available', async () => {
    // Mock successful database check
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    mockDb.mockReturnValue(mockDatabase);

    // Set Redis environment variable
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'redis://localhost:6379');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_123');

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        checks: {
          external_services: {
            healthy: true,
            services: {
              clerk: true,
              rapidapi: false,
              redis: true,
            },
          },
        },
      }),
      expect.any(Object)
    );
  });

  it('measures response time correctly', async () => {
    // Mock successful database check
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue([{ health_check: 1 }]),
    };
    mockDb.mockReturnValue(mockDatabase);

    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_123');

    await GET(mockRequest);

    const response = mockJson.mock.calls[0][0];
    expect(response.response_time).toBeGreaterThanOrEqual(0);
    expect(typeof response.response_time).toBe('number');
  });

  it('handles non-Error exceptions', async () => {
    // Mock database to throw a string
    mockDb.mockImplementation(() => {
      throw 'String error';
    });

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: 'String error',
      }),
      { status: 503 }
    );
  });
});
