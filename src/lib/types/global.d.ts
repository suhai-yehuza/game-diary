/**
 * Global type definitions for the application
 * This file extends global types to resolve @ts-ignore usages
 */

declare global {
  // Extend the global fetch type for testing environments
  var fetch: typeof fetch;

  // Extend Window interface for E2E testing and auth bypass
  interface Window {
    __PLAYWRIGHT_TEST__?: boolean;
    __MOCK_MODE__?: boolean; // New consolidated mock mode
    __SERVER_API_MOCK_MODE__?: boolean; // Legacy - for backward compatibility
    __E2E_AUTH_BYPASS__?: boolean;
    __clerkMock?: {
      useUser: () => {
        isLoaded: boolean;
        isSignedIn: boolean;
        user: {
          id: string;
          emailAddresses: Array<{
            emailAddress: string;
            id: string;
            verification: { status: string };
          }>;
          primaryEmailAddress: {
            emailAddress: string;
            id: string;
            verification: { status: string };
          };
          firstName: string;
          lastName: string;
          username: string;
          fullName: string;
          imageUrl: string;
          createdAt: string;
          lastSignInAt: string;
        };
      };
      useAuth: () => {
        getToken: () => Promise<string>;
        sessionId: string;
        userId: string;
      };
      SignInButton?: ({ children }: { children: React.ReactNode }) => React.ReactNode;
      SignUpButton?: ({ children }: { children: React.ReactNode }) => React.ReactNode;
      SignedIn?: ({ children }: { children: React.ReactNode }) => React.ReactNode;
      SignedOut?: ({ children }: { children: React.ReactNode }) => React.ReactNode | null;
      UserButton?: () => React.ReactNode | null;
      ClerkProvider?: ({ children }: { children: React.ReactNode }) => React.ReactNode;
    };
    __clerk?: {
      useUser: () => {
        isLoaded: boolean;
        isSignedIn: boolean;
        user: {
          id: string;
          emailAddresses: Array<{
            emailAddress: string;
            id: string;
            verification: { status: string };
          }>;
          primaryEmailAddress: {
            emailAddress: string;
            id: string;
            verification: { status: string };
          };
          firstName: string;
          lastName: string;
          username: string;
          fullName: string;
          imageUrl: string;
          createdAt: string;
          lastSignInAt: string;
        };
      };
      useAuth: () => {
        getToken: () => Promise<string>;
        sessionId: string;
        userId: string;
      };
    };
    require?: (id: string) => any;
    import?: (id: string) => Promise<any>;
  }

  // Extend NodeJS global for testing environments
  namespace NodeJS {
    interface Global {
      fetch?: typeof fetch;
      window?: Window;
    }
  }
}

export {};
