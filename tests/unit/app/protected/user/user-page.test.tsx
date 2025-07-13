import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the custom Clerk provider hooks
let mockUseUser: ReturnType<typeof vi.fn>;
let mockUseAuth: ReturnType<typeof vi.fn>;
vi.mock('@/app/components/providers/clerk-provider', () => ({
  useUser: (...args: any[]) => mockUseUser(...args),
  useAuth: (...args: any[]) => mockUseAuth(...args),
}));

import ProfilePage from '@/app/protected/user/page';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Camera: () => <div data-testid="camera-icon">Camera</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
}));

// Mock UI components
vi.mock('@/app/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/app/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange?.('security')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser = vi.fn();
    mockUseAuth = vi.fn();
  });

  it('shows loading state when user data is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      user: null,
    });
    mockUseAuth.mockReturnValue({
      getToken: vi.fn(),
    });

    render(<ProfilePage />);

    // The loading spinner does not have a role, so check for its presence by class
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows authentication required when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });
    mockUseAuth.mockReturnValue({
      getToken: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to view your profile')).toBeInTheDocument();
  });

  it('renders profile page when user is signed in', async () => {
    const mockUser = {
      id: 'user123',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      image_url: 'https://example.com/avatar.jpg',
      primary_email_address_id: 'email1',
      email_addresses: [
        {
          id: 'email1',
          email_address: 'john@example.com',
          verification: { status: 'verified' },
        },
      ],
      phone_numbers: [],
      external_accounts: [],
      public_metadata: {},
      created_at: new Date('2023-01-01').getTime(),
      last_sign_in_at: new Date('2023-12-01').getTime(),
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    });
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Manage your account and preferences')).toBeInTheDocument();
    });

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('renders profile without image when imageUrl is not available', async () => {
    const mockUser = {
      id: 'user123',
      first_name: 'Jane',
      last_name: 'Smith',
      username: 'janesmith',
      image_url: null,
      primary_email_address_id: 'email1',
      email_addresses: [
        {
          id: 'email1',
          email_address: 'jane@example.com',
          verification: { status: 'unverified' },
        },
      ],
      phone_numbers: [],
      external_accounts: [],
      public_metadata: {},
      created_at: new Date('2023-01-01').getTime(),
      last_sign_in_at: new Date('2023-12-01').getTime(),
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    });
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByTestId('user-icon').length).toBeGreaterThan(0);
  });

  it('handles missing user data gracefully', async () => {
    const mockUser = {
      id: 'user123',
      first_name: null,
      last_name: null,
      username: null,
      image_url: null,
      primary_email_address_id: null,
      email_addresses: [],
      phone_numbers: [],
      external_accounts: [],
      public_metadata: {},
      created_at: null,
      last_sign_in_at: null,
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    });
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
  });

  it('renders all tab triggers', async () => {
    const mockUser = {
      id: 'user123',
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      image_url: null,
      primary_email_address_id: 'email1',
      email_addresses: [
        {
          id: 'email1',
          email_address: 'test@example.com',
          verification: { status: 'verified' },
        },
      ],
      phone_numbers: [],
      external_accounts: [],
      public_metadata: {},
      created_at: new Date('2023-01-01').getTime(),
      last_sign_in_at: new Date('2023-12-01').getTime(),
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    });
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-trigger-overview')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-security')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-activity')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-settings')).toBeInTheDocument();
    });
  });
});
