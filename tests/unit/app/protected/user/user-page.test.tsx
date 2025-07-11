import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Clerk hooks
let mockUseUser: ReturnType<typeof vi.fn>;
let mockUseAuth: ReturnType<typeof vi.fn>;
vi.mock('@clerk/nextjs', () => ({
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
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
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
    } as any);
    mockUseAuth.mockReturnValue({
      getToken: vi.fn(),
    } as any);

    render(<ProfilePage />);

    // The loading spinner does not have a role, so check for its presence by class
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows authentication required when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    } as any);
    mockUseAuth.mockReturnValue({
      getToken: vi.fn(),
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to view your profile')).toBeInTheDocument();
  });

  it('renders profile page when user is signed in', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      fullName: 'John Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      primaryEmailAddress: {
        emailAddress: 'john@example.com',
        verification: { status: 'verified' },
      },
      emailAddresses: [{ emailAddress: 'john@example.com', verification: { status: 'verified' } }],
      phoneNumbers: [],
      externalAccounts: [],
      publicMetadata: {},
      createdAt: new Date('2023-01-01'),
      lastSignInAt: new Date('2023-12-01'),
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    } as any);
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    } as any);

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
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      fullName: 'Jane Smith',
      imageUrl: null,
      primaryEmailAddress: {
        emailAddress: 'jane@example.com',
        verification: { status: 'unverified' },
      },
      emailAddresses: [
        { emailAddress: 'jane@example.com', verification: { status: 'unverified' } },
      ],
      phoneNumbers: [],
      externalAccounts: [],
      publicMetadata: {},
      createdAt: new Date('2023-01-01'),
      lastSignInAt: new Date('2023-12-01'),
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    } as any);
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByTestId('user-icon').length).toBeGreaterThan(0);
  });

  it('handles missing user data gracefully', async () => {
    const mockUser = {
      firstName: null,
      lastName: null,
      username: null,
      fullName: null,
      imageUrl: null,
      primaryEmailAddress: { emailAddress: null, verification: { status: 'unverified' } },
      emailAddresses: [],
      phoneNumbers: [],
      externalAccounts: [],
      publicMetadata: {},
      createdAt: null,
      lastSignInAt: null,
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    } as any);
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('renders all tab triggers', async () => {
    const mockUser = {
      firstName: 'Test User',
      lastName: null,
      username: null,
      fullName: 'Test User',
      imageUrl: null,
      primaryEmailAddress: {
        emailAddress: 'test@example.com',
        verification: { status: 'verified' },
      },
      emailAddresses: [{ emailAddress: 'test@example.com', verification: { status: 'verified' } }],
      phoneNumbers: [],
      externalAccounts: [],
      publicMetadata: {},
      createdAt: new Date('2023-01-01'),
      lastSignInAt: new Date('2023-12-01'),
    };

    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    } as any);
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-trigger-overview')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-security')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-activity')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-settings')).toBeInTheDocument();
    });
  });
});
