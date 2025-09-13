import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import type { IAuthContextResult } from '@/types';

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
    console.warn(`[AUTH CIRCUIT BREAKER] Failure recorded. Total failures: ${this.failures}`);
  }

  recordSuccess(): void {
    this.failures = 0;
    console.log('[AUTH CIRCUIT BREAKER] Success recorded, failures reset to 0');
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    console.log('[AUTH CIRCUIT BREAKER] Circuit breaker manually reset');
  }

  // Add method to force reset for debugging
  forceReset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    console.log('[AUTH CIRCUIT BREAKER] Circuit breaker force reset');
  }

  getStatus(): { failures: number; isOpen: boolean; lastFailureTime: number } {
    return {
      failures: this.failures,
      isOpen: this.isOpen(),
      lastFailureTime: this.lastFailureTime,
    };
  }
}

const circuitBreaker = new AuthCircuitBreaker();

// Export for debugging
export function resetAuthCircuitBreaker(): void {
  circuitBreaker.forceReset();
  console.log('[AUTH CIRCUIT BREAKER] Manually reset circuit breaker');
}

// Export circuit breaker status for debugging
export function getCircuitBreakerStatus() {
  return circuitBreaker.getStatus();
}

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
        isLoaded: true,
        isSignedIn: true,
        user: {
          id: 'seeded_user_8768', // Use a seeded user ID that exists in the database
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          isAdmin: false,
        },
        session: null,
        userId: 'seeded_user_8768',
        isAuthenticated: true,
        authSource: 'bypass',
      };
    }

    // Check circuit breaker - but reset it if it's been open for too long
    if (circuitBreaker.isOpen()) {
      const status = circuitBreaker.getStatus();
      const timeSinceLastFailure = Date.now() - status.lastFailureTime;
      const resetTimeout = 30000; // 30 seconds

      if (timeSinceLastFailure > resetTimeout) {
        console.log('[AUTH CIRCUIT BREAKER] Resetting circuit breaker after timeout');
        circuitBreaker.reset();
      } else {
        console.warn(
          `[AUTH CIRCUIT BREAKER] Circuit is open, returning unauthenticated. Status:`,
          status
        );
        return {
          isLoaded: true,
          isSignedIn: false,
          user: null,
          session: null,
          userId: undefined,
          isAuthenticated: false,
          authSource: 'none',
          error: 'Authentication service temporarily unavailable',
        };
      }
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

          const userContext = {
            isLoaded: true,
            isSignedIn: true,
            user: {
              id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress || '',
              username: user.username || '',
              first_name: user.firstName || '',
              last_name: user.lastName || '',
              isAdmin: false,
            },
            session: null,
            userId: user.id,
            isAuthenticated: true,
            authSource: 'clerk',
          };

          return userContext;
        } else {
          // We have userId but no user details - create minimal context
          console.warn('[AUTH FALLBACK] Have userId but no user details');
          const fallbackContext = {
            isLoaded: true,
            isSignedIn: true,
            user: {
              id: userId,
              email: '',
              username: '',
              first_name: '',
              last_name: '',
              isAdmin: false,
            },
            session: null,
            userId,
            isAuthenticated: true,
            authSource: 'fallback',
          };
          return fallbackContext;
        }
      }
    } catch (error) {
      console.error('[AUTH ERROR] Clerk authentication failed:', error);

      // Use centralized error handling
      errorHandlers.authentication(error instanceof Error ? error : new Error(String(error)), {
        component: 'Auth Context Builder',
        action: 'Clerk authentication',
      });
      circuitBreaker.recordFailure();

      // Return unauthenticated state
      return {
        isLoaded: true,
        isSignedIn: false,
        user: null,
        session: null,
        userId: undefined,
        isAuthenticated: false,
        authSource: 'none',
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }

    // No authentication found
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
      session: null,
      userId: undefined,
      isAuthenticated: false,
      authSource: 'none',
    };
  } catch (error) {
    console.error('[AUTH CRITICAL ERROR] Critical authentication error:', error);

    // Use centralized error handling
    errorHandlers.authentication(error instanceof Error ? error : new Error(String(error)), {
      component: 'Auth Context Builder',
      action: 'Build auth context',
    });
    circuitBreaker.recordFailure();

    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
      session: null,
      userId: undefined,
      isAuthenticated: false,
      authSource: 'none',
      error: error instanceof Error ? error.message : 'Critical authentication error',
    };
  }
}
