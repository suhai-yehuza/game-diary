import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock encryption middleware
vi.mock('@/lib/middleware/encryption', () => ({
  withEncryption: vi.fn(handler => handler),
}));

describe('User API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should return user data when authenticated', async () => {
      const mockAuth = auth as any;
      const mockCurrentUser = currentUser as any;

      mockAuth.mockResolvedValue({ userId: 'test-user-id' });
      mockCurrentUser.mockResolvedValue({
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      });

      const { GET } = await import('@/app/api/user/route');

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'GET',
      });

      const response = (await GET(request)) as Response;
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.user).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const mockAuth = auth as any;
      const mockCurrentUser = currentUser as any;

      mockAuth.mockResolvedValue({ userId: null });
      mockCurrentUser.mockResolvedValue(null);

      const { GET } = await import('@/app/api/user/route');

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'GET',
      });

      const response = (await GET(request)) as Response;
      expect(response.status).toBe(401);
    });
  });

  describe('POST handler', () => {
    it('should create user with valid data', async () => {
      const { POST } = await import('@/app/api/user/route');

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          phone: '+1234567890',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('User created successfully');
    });

    it('should reject invalid email format', async () => {
      const { POST } = await import('@/app/api/user/route');

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          phone: '+1234567890',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Invalid email format');
    });

    it('should reject invalid phone format', async () => {
      const { POST } = await import('@/app/api/user/route');

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          phone: 'invalid-phone',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Invalid phone format');
    });

    it('should handle invalid request body', async () => {
      const { POST } = await import('@/app/api/user/route');

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'POST',
        body: 'invalid-json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Invalid request body');
    });
  });
});
