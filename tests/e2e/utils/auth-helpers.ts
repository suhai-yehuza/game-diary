import type { Page } from '@playwright/test';

export interface ITestUser {
  id: string;
  email: string;
  phone?: string;
  username?: string;
}

export function createTestUser(_user?: Partial<ITestUser>): ITestUser {
  // This would typically create a test user in the database
  // For now, we'll return a mock user
  return {
    id: `test-user-${Date.now()}`,
    email: _user?.email ?? 'test@example.com',
    phone: _user?.phone,
    username: _user?.username ?? 'testuser',
  };
}

export async function loginAsUser(page: Page, _user: ITestUser): Promise<void> {
  // This would typically perform the login process
  // For now, we'll just navigate to the protected area
  await page.goto('/protected/user');
}
