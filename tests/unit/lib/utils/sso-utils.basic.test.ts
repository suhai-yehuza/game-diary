/// <reference types="vitest/globals" />

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  isSSOCallback,
  isSSOCallbackServer,
  isClerkCatchallRoute,
  isClerkCatchallRouteServer,
  isAuthCallback,
  isAuthCallbackServer,
} from '@/lib/utils/sso-utils';

describe('sso-utils', () => {
  let originalWindow: any;

  beforeEach(() => {
    // Store original window
    originalWindow = (global as any).window;
  });

  afterEach(() => {
    // Restore original window
    if (originalWindow) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });

  describe('isSSOCallback', () => {
    it('returns false on server (no window)', () => {
      delete (global as any).window;
      expect(isSSOCallback()).toBe(false);
    });

    it('returns true if pathname includes sso-callback', () => {
      (global as any).window = {
        location: {
          pathname: '/sso-callback',
          search: '',
        },
      };
      expect(isSSOCallback()).toBe(true);
    });

    it('returns true if pathname includes oauth_callback', () => {
      (global as any).window = {
        location: {
          pathname: '/oauth_callback',
          search: '',
        },
      };
      expect(isSSOCallback()).toBe(true);
    });

    it('returns true if search includes __clerk_status', () => {
      (global as any).window = {
        location: {
          pathname: '/some-path',
          search: '?__clerk_status=success',
        },
      };
      expect(isSSOCallback()).toBe(true);
    });

    it('returns false if not a callback', () => {
      (global as any).window = {
        location: {
          pathname: '/regular-page',
          search: '',
        },
      };
      expect(isSSOCallback()).toBe(false);
    });
  });

  describe('isSSOCallbackServer', () => {
    it('returns true for sso-callback', () => {
      expect(isSSOCallbackServer('/sso-callback', '')).toBe(true);
    });

    it('returns true for oauth_callback', () => {
      expect(isSSOCallbackServer('/oauth_callback', '')).toBe(true);
    });

    it('returns true for __clerk_status in search', () => {
      expect(isSSOCallbackServer('/some-path', '?__clerk_status=success')).toBe(true);
    });

    it('returns false for non-callback', () => {
      expect(isSSOCallbackServer('/regular-page', '')).toBe(false);
    });
  });

  describe('isClerkCatchallRoute', () => {
    it('returns false on server (no window)', () => {
      delete (global as any).window;
      expect(isClerkCatchallRoute()).toBe(false);
    });

    it('returns true for clerk_catchall', () => {
      (global as any).window = {
        location: {
          pathname: '/clerk_catchall',
          search: '',
        },
      };
      expect(isClerkCatchallRoute()).toBe(true);
    });

    it('returns true for SignUp_clerk_catchall', () => {
      (global as any).window = {
        location: {
          pathname: '/SignUp_clerk_catchall',
          search: '',
        },
      };
      expect(isClerkCatchallRoute()).toBe(true);
    });

    it('returns true for SignIn_clerk_catchall', () => {
      (global as any).window = {
        location: {
          pathname: '/SignIn_clerk_catchall',
          search: '',
        },
      };
      expect(isClerkCatchallRoute()).toBe(true);
    });

    it('returns false for other routes', () => {
      (global as any).window = {
        location: {
          pathname: '/regular-page',
          search: '',
        },
      };
      expect(isClerkCatchallRoute()).toBe(false);
    });
  });

  describe('isClerkCatchallRouteServer', () => {
    it('returns true for clerk_catchall', () => {
      expect(isClerkCatchallRouteServer('/clerk_catchall')).toBe(true);
    });

    it('returns true for SignUp_clerk_catchall', () => {
      expect(isClerkCatchallRouteServer('/SignUp_clerk_catchall')).toBe(true);
    });

    it('returns true for SignIn_clerk_catchall', () => {
      expect(isClerkCatchallRouteServer('/SignIn_clerk_catchall')).toBe(true);
    });

    it('returns false for other routes', () => {
      expect(isClerkCatchallRouteServer('/regular-page')).toBe(false);
    });
  });

  describe('isAuthCallback', () => {
    it('returns true if isSSOCallback is true', () => {
      (global as any).window = {
        location: {
          pathname: '/sso-callback',
          search: '',
        },
      };
      expect(isAuthCallback()).toBe(true);
    });

    it('returns true if isClerkCatchallRoute is true', () => {
      (global as any).window = {
        location: {
          pathname: '/clerk_catchall',
          search: '',
        },
      };
      expect(isAuthCallback()).toBe(true);
    });

    it('returns false if neither is true', () => {
      (global as any).window = {
        location: {
          pathname: '/regular-page',
          search: '',
        },
      };
      expect(isAuthCallback()).toBe(false);
    });
  });

  describe('isAuthCallbackServer', () => {
    it('returns true if isSSOCallbackServer is true', () => {
      expect(isAuthCallbackServer('/sso-callback', '')).toBe(true);
    });

    it('returns true if isClerkCatchallRouteServer is true', () => {
      expect(isAuthCallbackServer('/clerk_catchall', '')).toBe(true);
    });

    it('returns false if neither is true', () => {
      expect(isAuthCallbackServer('/regular-page', '')).toBe(false);
    });
  });
});
