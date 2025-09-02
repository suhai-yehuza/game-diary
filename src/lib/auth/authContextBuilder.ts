import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

import type { IAuthContextResult } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

class AuthCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 3;
  private readonly resetTimeoutMs = 30000; // 30 seconds

  isOpen(): boolean {
    if (this.failures >= this.maxFailures) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  recordSuccess(): void {
    this.failures = 0;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

const circuitBreaker = new AuthCircuitBreaker();

export async function buildAuthContext(_req: NextRequest): Promise<IAuthContextResult> {
  try {
    // Check for authentication bypass in development/test environments
    const isAuthBypassEnabled =
      process.env.MOCK_MODE === 'true' ||
      process.env.E2E_AUTH_BYPASS === 'true' ||
      process.env.PLAYWRIGHT_TEST === 'true' ||
      process.env.NODE_ENV === 'test';

    if (isAuthBypassEnabled) {
      console.log('[AUTH BYPASS] Using mock authentication');
      return {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        userId: 'test-user-id',
        isAuthenticated: true,
        authSource: 'bypass',
      };
    }

    // Check circuit breaker
    if (circuitBreaker.isOpen()) {
      console.warn('[AUTH CIRCUIT BREAKER] Circuit is open, returning unauthenticated');
      return {
        user: null,
        userId: null,
        isAuthenticated: false,
        authSource: 'none',
        error: 'Authentication service temporarily unavailable',
      };
    }

    let userId: string | null = null;
    let user = null;

    try {
      // Primary auth method
      const authResult = await auth();
      userId = authResult.userId;

      if (userId) {
        // Try to get user details
        user = await currentUser();

        if (user) {
          circuitBreaker.recordSuccess();

          return {
            user: {
              id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress,
              username: user.username || undefined,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
            },
            userId: user.id,
            isAuthenticated: true,
            authSource: 'clerk',
          };
        } else {
          // We have userId but no user details - create minimal context
          console.warn('[AUTH FALLBACK] Have userId but no user details');
          return {
            user: {
              id: userId,
            },
            userId,
            isAuthenticated: true,
            authSource: 'fallback',
          };
        }
      }
    } catch (error) {
      // Use centralized error handling
      errorHandlers.authentication(error instanceof Error ? error : new Error(String(error)), {
        component: 'Auth Context Builder',
        action: 'Clerk authentication',
      });
      circuitBreaker.recordFailure();

      // Return unauthenticated state
      return {
        user: null,
        userId: null,
        isAuthenticated: false,
        authSource: 'none',
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }

    // No authentication found
    return {
      user: null,
      userId: null,
      isAuthenticated: false,
      authSource: 'none',
    };
  } catch (error) {
    // Use centralized error handling
    errorHandlers.authentication(error instanceof Error ? error : new Error(String(error)), {
      component: 'Auth Context Builder',
      action: 'Build auth context',
    });
    circuitBreaker.recordFailure();

    return {
      user: null,
      userId: null,
      isAuthenticated: false,
      authSource: 'none',
      error: error instanceof Error ? error.message : 'Critical authentication error',
    };
  }
}
