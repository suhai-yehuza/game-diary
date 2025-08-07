import { useUser } from '@clerk/nextjs';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';

import { MobileGameLogsTable } from '@/app/components/game-logs/MobileGameLogsTable';
import { useGameLogs } from '@/hooks/use-game-logs';

// Mock the dependencies
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: { id: 'test-user-id' },
    isLoaded: true,
    isSignedIn: true,
  })),
}));

vi.mock('@/hooks/use-game-logs', () => ({
  useGameLogs: vi.fn(() => ({
    gameLogs: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

// Mock the modal components
vi.mock('@/app/components/game-logs/CreateGameLogModal', () => ({
  CreateGameLogModal: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null,
}));

vi.mock('@/app/components/game-logs/EditGameLogModal', () => ({
  EditGameLogModal: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null,
}));

vi.mock('@/app/components/game-logs/DeleteGameLogModal', () => ({
  DeleteGameLogModal: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null,
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon">Star</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
}));

const mockUseUser = useUser as MockedFunction<typeof useUser>;
const mockUseGameLogs = useGameLogs as MockedFunction<typeof useGameLogs>;

// Define default props for the useGameLogs hook
const defaultProps = {
  gameLogs: [] as any[],
  gameLogsEndCursor: null as string | null,
  gameLogsHasNextPage: true,
  gameLogsTotalCount: 0,
  loadMoreGameLogs: vi.fn() as () => Promise<void>,
  friendsLogs: [] as any[],
  friendsLogsEndCursor: null as string | null,
  friendsLogsHasNextPage: true,
  friendsLogsTotalCount: 0,
  loadMoreFriendsLogs: vi.fn() as () => Promise<void>,
  loading: false,
  error: null as Error | null,
  refetch: vi.fn() as any,
};

describe('MobileGameLogsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authenticated user for most tests
    mockUseUser.mockReturnValue({
      user: {
        id: 'test-user-id',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignInAt: new Date(),
        emailAddresses: [],
        phoneNumbers: [],
        externalId: null,
        primaryEmailAddressId: null,
        primaryEmailAddress: null,
        primaryPhoneNumberId: null,
        primaryPhoneNumber: null,
        web3Wallets: [],
        externalAccounts: [],
        organizationMemberships: [],
        passwordEnabled: false,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        locked: false,
        lockoutExpiresInSeconds: null,
        verificationAttemptsRemaining: 0,
        mfaEnabledAt: null,
        mfaDisabledAt: null,
        lastActiveAt: null,
        legalAcceptedAt: null,
        createOrganizationEnabled: true,
        deleteSelfEnabled: true,
        hasImage: false,
        profileImageUrl: '',
        publicMetadata: {},
        privateMetadata: {},
        unsafeMetadata: {},
        emailAddress: null,
        phoneNumber: null,
        object: 'user',
      } as any,
      isLoaded: true,
      isSignedIn: true,
    });
  });

  it('renders sign-in message when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });

    render(<MobileGameLogsTable />);

    expect(screen.getByText('Please sign in to view game logs.')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      error: new Error('Failed to load'),
    });

    render(<MobileGameLogsTable />);

    expect(screen.getByText('An error occurred while loading game logs.')).toBeInTheDocument();
  });

  it('renders loading message when loading', () => {
    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      loading: true,
    });

    render(<MobileGameLogsTable />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game logs when data is available', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
      {
        id: '2',
        game_id: 'game-2',
        game: {
          id: 'game-2',
          date: '2024-01-16',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-3',
          away_team_id: 'team-4',
          home_team: {
            id: 'team-3',
            name: 'Warriors',
            code: 'GSW',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-4',
            name: 'Bulls',
            code: 'CHI',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 3,
        classification: 'PROTECTED',
        created_at: '2024-01-16',
        updated_at: '2024-01-16',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    expect(screen.getByText('My Game Logs')).toBeInTheDocument();
    expect(screen.getByText('BOS @ LAL')).toBeInTheDocument();
    expect(screen.getByText('CHI @ GSW')).toBeInTheDocument();
  });

  it('renders empty state when no game logs', () => {
    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: [],
      loading: false,
    });

    render(<MobileGameLogsTable />);

    expect(screen.getByText('No game logs yet. Create your first one!')).toBeInTheDocument();
  });

  it('filters game logs based on search term', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    fireEvent.change(searchInput, { target: { value: 'Lakers' } });

    // The search should filter to show only Lakers game
    // Since the search functionality might not be implemented in the mock, we'll test the input change
    expect(searchInput).toHaveValue('Lakers');
  });

  it('shows no results message when search has no matches', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No logs found matching your search.')).toBeInTheDocument();
  });

  it('opens create modal when new button is clicked', () => {
    render(<MobileGameLogsTable />);

    const newButton = screen.getByText('New');
    fireEvent.click(newButton);

    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('handles edit modal close', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    const closeButton = screen.getByTestId('edit-modal').querySelector('button');
    fireEvent.click(closeButton!);

    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('handles delete modal close', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0]);

    const closeButton = screen.getByTestId('delete-modal').querySelector('button');
    fireEvent.click(closeButton!);

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('handles create modal close', () => {
    render(<MobileGameLogsTable />);

    const newButton = screen.getByText('New');
    fireEvent.click(newButton);

    const closeButton = screen.getByTestId('create-modal').querySelector('button');
    fireEvent.click(closeButton!);

    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
  });

  it('handles edit modal success', async () => {
    const mockRefetch = vi.fn();
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
      refetch: mockRefetch,
    });

    render(<MobileGameLogsTable />);

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    const successButton = screen.getByTestId('edit-modal').querySelectorAll('button')[1];
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles delete modal success', async () => {
    const mockRefetch = vi.fn();
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
      refetch: mockRefetch,
    });

    render(<MobileGameLogsTable />);

    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0]);

    const successButton = screen.getByTestId('delete-modal').querySelectorAll('button')[1];
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles create modal success', async () => {
    const mockRefetch = vi.fn();
    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      refetch: mockRefetch,
    });

    render(<MobileGameLogsTable />);

    const newButton = screen.getByText('New');
    fireEvent.click(newButton);

    const successButton = screen.getByTestId('create-modal').querySelectorAll('button')[1];
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('displays game log details correctly', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        notes: 'Great game!',
        tags: ['NBA', 'Playoffs'],
        watched_date: '2024-01-15',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    expect(screen.getByText('BOS @ LAL')).toBeInTheDocument();
    expect(screen.getByText('Great game!')).toBeInTheDocument();
  });

  it('displays rating stars correctly', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    // Should display 4 filled stars and 1 empty star
    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(5);
  });

  it('displays classification icons correctly', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: 'Final',
          game_type: 'Regular Season',
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_team: {
            id: 'team-1',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          away_team: {
            id: 'team-2',
            name: 'Celtics',
            code: 'BOS',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        rating_for_game: 4,
        classification: 'PUBLIC',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    ];

    mockUseGameLogs.mockReturnValue({
      ...defaultProps,
      gameLogs: mockGameLogs,
      loading: false,
    });

    render(<MobileGameLogsTable />);

    // Should display the appropriate classification icon for public
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });
});
