import { Page } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  phone?: string;
  username?: string;
}

export async function createTestUser(userData: Partial<TestUser>): Promise<TestUser> {
  // This would typically create a test user in the database
  // For now, we'll return a mock user
  return {
    id: `test-user-${Date.now()}`,
    email: userData.email || 'test@example.com',
    phone: userData.phone,
    username: userData.username || 'testuser',
  };
}

export async function loginAsUser(page: Page, user: TestUser): Promise<void> {
  // This would typically perform the login process
  // For now, we'll just navigate to the protected area
  await page.goto('/protected/user');
}
