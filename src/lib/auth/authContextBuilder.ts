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

    // Check circuit breaker
    if (circuitBreaker.isOpen()) {
      const status = circuitBreaker.getStatus();
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

    let userId: string | null = null;
    let user = null;

    try {
      console.log('[AUTH] Attempting Clerk authentication...');

      // Primary auth method
      const authResult = await auth();
      console.log('[AUTH] Clerk auth() result:', { userId: authResult.userId });

      userId = authResult.userId;

      if (userId) {
        console.log('[AUTH] User ID found, getting user details...');

        // Try to get user details
        user = await currentUser();
        console.log('[AUTH] Clerk currentUser() result:', {
          userId: user?.id,
          email: user?.emailAddresses?.[0]?.emailAddress,
          username: user?.username,
        });

        if (user) {
          circuitBreaker.recordSuccess();

          return {
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
        } else {
          // We have userId but no user details - create minimal context
          console.warn('[AUTH FALLBACK] Have userId but no user details');
          return {
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
        }
      } else {
        console.log('[AUTH] No user ID found from Clerk auth()');
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
    console.log('[AUTH] No authentication found, returning unauthenticated');
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
