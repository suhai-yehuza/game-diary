import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { UserSearchResult } from '@/app/components/search/UserSearchResult';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('UserSearchResult', () => {
  const mockUser = {
    id: 'user-1',
    type: 'user' as const,
    created_at: '2023-01-15T10:30:00Z',
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'john.doe@example.com',
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders user information correctly with full name', () => {
    render(<UserSearchResult user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('Joined Jan 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('User')).toHaveLength(3); // One in badge, two in icons
  });

  it('handles user with missing first name', () => {
    const userWithoutFirstName = {
      ...mockUser,
      first_name: undefined,
    };

    render(<UserSearchResult user={userWithoutFirstName} />);

    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('handles user with missing last name', () => {
    const userWithoutLastName = {
      ...mockUser,
      last_name: undefined,
    };

    render(<UserSearchResult user={userWithoutLastName} />);

    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('handles user with no names', () => {
    const userWithoutNames = {
      ...mockUser,
      first_name: undefined,
      last_name: undefined,
      username: undefined,
    };

    render(<UserSearchResult user={userWithoutNames} />);

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('@unknown')).toBeInTheDocument();
  });

  it('handles user with empty string names', () => {
    const userWithEmptyNames = {
      ...mockUser,
      first_name: '',
      last_name: '',
    };

    render(<UserSearchResult user={userWithEmptyNames} />);

    expect(screen.getByText('johndoe')).toBeInTheDocument();
  });

  it('handles user without email', () => {
    const userWithoutEmail = {
      ...mockUser,
      email_address: undefined,
    };

    render(<UserSearchResult user={userWithoutEmail} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('john.doe@example.com')).not.toBeInTheDocument();
  });

  it('handles user without created_at', () => {
    const userWithoutCreatedAt = {
      ...mockUser,
      created_at: undefined as any,
    };

    render(<UserSearchResult user={userWithoutCreatedAt} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText(/Joined/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
  });

  it('handles different date formats', () => {
    const userWithDifferentDate = {
      ...mockUser,
      created_at: '2022-12-25T00:00:00Z',
    };

    render(<UserSearchResult user={userWithDifferentDate} />);
    expect(screen.getByText(/Joined Dec 2[45], 2022/)).toBeInTheDocument();
  });

  it('navigates to user page when clicked', () => {
    render(<UserSearchResult user={mockUser} />);

    const userCard = screen.getByText('John Doe').closest('div');
    fireEvent.click(userCard!);

    expect(mockPush).toHaveBeenCalledWith('/protected/user');
  });

  it('has correct styling classes', () => {
    render(<UserSearchResult user={mockUser} />);

    const userCard = screen.getByText('John Doe').closest('div');
    expect(userCard).toHaveClass('flex', 'items-center', 'space-x-2');
    const mainContainer = userCard?.parentElement?.parentElement;
    expect(mainContainer).toHaveClass('flex', 'items-center', 'space-x-4', 'p-4');
    expect(mainContainer).toHaveClass('bg-neutral-50', 'border', 'rounded-lg');
    expect(mainContainer).toHaveClass(
      'hover:bg-neutral-100',
      'cursor-pointer',
      'transition-colors'
    );
  });

  it('displays correct icons', () => {
    render(<UserSearchResult user={mockUser} />);

    expect(screen.getAllByTestId('user-icon')).toHaveLength(2); // One in avatar, one in username
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('handles minimal user data', () => {
    const minimalUser = {
      id: 'minimal-user',
      type: 'user' as const,
      created_at: '2023-01-01T00:00:00Z',
    };

    render(<UserSearchResult user={minimalUser} />);

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('@unknown')).toBeInTheDocument();
    expect(screen.getByText(/Joined (Dec 31, 2022|Jan 1, 2023)/)).toBeInTheDocument();
  });

  it('prioritizes full name over username when both are available', () => {
    render(<UserSearchResult user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('handles edge case with whitespace-only names', () => {
    const userWithWhitespaceNames = {
      ...mockUser,
      first_name: '   ',
      last_name: '   ',
    };

    render(<UserSearchResult user={userWithWhitespaceNames} />);

    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('handles special characters in names', () => {
    const userWithSpecialChars = {
      ...mockUser,
      first_name: 'José',
      last_name: 'García-López',
    };

    render(<UserSearchResult user={userWithSpecialChars} />);

    expect(screen.getByText('José García-López')).toBeInTheDocument();
  });

  it('handles very long names', () => {
    const userWithLongName = {
      ...mockUser,
      first_name: 'Christopher',
      last_name: 'VeryLongLastNameThatExceedsNormalLength',
    };

    render(<UserSearchResult user={userWithLongName} />);

    expect(
      screen.getByText('Christopher VeryLongLastNameThatExceedsNormalLength')
    ).toBeInTheDocument();
  });

  it('handles special characters in email', () => {
    const userWithSpecialEmail = {
      ...mockUser,
      email_address: 'test+user@domain.co.uk',
    };

    render(<UserSearchResult user={userWithSpecialEmail} />);

    expect(screen.getByText('test+user@domain.co.uk')).toBeInTheDocument();
  });

  it('handles special characters in username', () => {
    const userWithSpecialUsername = {
      ...mockUser,
      username: 'user_name-123',
    };

    render(<UserSearchResult user={userWithSpecialUsername} />);

    expect(screen.getByText('@user_name-123')).toBeInTheDocument();
  });

  it('handles very long username', () => {
    const userWithLongUsername = {
      ...mockUser,
      username: 'verylongusernamethatexceedsnormallength',
    };

    render(<UserSearchResult user={userWithLongUsername} />);

    expect(screen.getByText('@verylongusernamethatexceedsnormallength')).toBeInTheDocument();
  });

  it('handles empty email string', () => {
    const userWithEmptyEmail = {
      ...mockUser,
      email_address: '',
    };

    render(<UserSearchResult user={userWithEmptyEmail} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('john.doe@example.com')).not.toBeInTheDocument();
  });

  it('handles empty username string', () => {
    const userWithEmptyUsername = {
      ...mockUser,
      username: '',
    };

    render(<UserSearchResult user={userWithEmptyUsername} />);

    // Check for the span containing both @ and unknown by looking for the specific span
    const usernameSpan = screen.getByText((content, element) => {
      return !!(
        element?.tagName === 'SPAN' &&
        element?.textContent?.includes('@') &&
        element?.textContent?.includes('unknown') &&
        !element?.textContent?.includes('Joined')
      );
    });
    expect(usernameSpan).toBeInTheDocument();
  });

  it('formats edge case dates correctly', () => {
    const userWithEdgeDate = {
      ...mockUser,
      created_at: '2023-02-28T23:59:59Z',
    };

    render(<UserSearchResult user={userWithEdgeDate} />);

    expect(screen.getByText('Joined Feb 28, 2023')).toBeInTheDocument();
  });

  it('handles null values gracefully', () => {
    const userWithNulls = {
      ...mockUser,
      first_name: undefined,
      last_name: undefined,
      email_address: undefined,
      username: undefined,
    };

    render(<UserSearchResult user={userWithNulls} />);

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    // Check for the span containing both @ and unknown by looking for the specific span
    const usernameSpan = screen.getByText((content, element) => {
      return !!(
        element?.tagName === 'SPAN' &&
        element?.textContent?.includes('@') &&
        element?.textContent?.includes('unknown') &&
        !element?.textContent?.includes('Joined')
      );
    });
    expect(usernameSpan).toBeInTheDocument();
  });
});
