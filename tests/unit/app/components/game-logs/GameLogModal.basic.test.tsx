import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { GameLogModal } from '@/app/components/game-logs/GameLogModal';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/types';
import type { IGameLog } from '@/types';

// Mock Apollo Client
const mockMutate = vi.fn();
vi.mock('@apollo/client', () => ({
  useMutation: () => [mockMutate, { loading: false, error: null }],
  gql: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'test-user-id' },
    isLoaded: true,
    isSignedIn: true,
  }),
}));

// Mock react-hook-form
const mockRegister = vi.fn(() => ({}));
const mockHandleSubmit = vi.fn();
const mockSetValue = vi.fn();
const mockGetValues = vi.fn();
const mockWatch = vi.fn();
const mockReset = vi.fn();

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    setValue: mockSetValue,
    getValues: mockGetValues,
    watch: mockWatch,
    reset: mockReset,
    formState: { errors: {}, isSubmitting: false, isValid: true },
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock use-debounce
vi.mock('use-debounce', () => ({
  useDebounce: (value: any) => [value, { isPending: () => false }],
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const iconProxy: Record<string, any> = new Proxy(
    {},
    {
      get: (_target, prop: string) => (props: any) => (
        <span data-testid={`${String(prop)}-icon`} {...props}>
          {String(prop)}
        </span>
      ),
    }
  );

  return {
    __esModule: true,
    default: iconProxy,
    ...iconProxy,
    // Explicitly export the icons we need
    X: (props: any) => (
      <span data-testid="X-icon" {...props}>
        X
      </span>
    ),
    Star: (props: any) => (
      <span data-testid="Star-icon" {...props}>
        Star
      </span>
    ),
    Search: (props: any) => (
      <span data-testid="Search-icon" {...props}>
        Search
      </span>
    ),
    Calendar: (props: any) => (
      <span data-testid="Calendar-icon" {...props}>
        Calendar
      </span>
    ),
    MapPin: (props: any) => (
      <span data-testid="MapPin-icon" {...props}>
        MapPin
      </span>
    ),
    ChevronDown: (props: any) => (
      <span data-testid="ChevronDown-icon" {...props}>
        ChevronDown
      </span>
    ),
    ChevronRight: (props: any) => (
      <span data-testid="ChevronRight-icon" {...props}>
        ChevronRight
      </span>
    ),
  };
});

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

const mockGameLog: IGameLog = {
  id: 'test-game-log-id',
  game_id: 'test-game-id',
  notes: 'Test notes',
  rating_for_game: 4,
  classification: CLASSIFICATION.PUBLIC,
  tags: ['test-tag'],
  watched_date: '2024-01-15T10:00:00Z',
  watched_setting: WATCHED_SETTING.HOME,
  watched_scope: WATCHED_SCOPE.FULL_GAME,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  game: {
    id: 'test-game-id',
    date: '2024-01-15T00:00:00Z',
    status: 'scheduled',
    game_type: 'nba',
    teams: {
      home: {
        id: 'home-team-id',
        name: 'Los Angeles Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        logo: 'test-logo.png',
      },
      away: {
        id: 'away-team-id',
        name: 'Golden State Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        logo: 'test-logo.png',
      },
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    home_team: {
      id: 'home-team-id',
      code: 'LAL',
      name: 'Los Angeles Lakers',
      logo: 'test-logo.png',
      all_star: false,
      nba_franchise: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    away_team: {
      id: 'away-team-id',
      code: 'GSW',
      name: 'Golden State Warriors',
      logo: 'test-logo.png',
      all_star: false,
      nba_franchise: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  user: {
    id: 'test-user-id',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    image_url: undefined,
  },
};

describe('GameLogModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock setup - will be overridden in specific tests
    mockHandleSubmit.mockImplementation(fn => fn);
    mockGetValues.mockReturnValue({
      gameId: 'test-game-id',
      rating_for_game: 4,
      classification: CLASSIFICATION.PUBLIC,
    });
    mockWatch.mockReturnValue(CLASSIFICATION.PUBLIC);
  });

  it('renders create mode modal', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(screen.getByText('Create New Game Log')).toBeInTheDocument();
    expect(screen.getByText('Find/Search for Games *')).toBeInTheDocument();
  });

  it('renders edit mode modal', () => {
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        gameLog={mockGameLog}
      />
    );

    expect(screen.getByText('Edit Game Log')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <GameLogModal mode="create" isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(screen.queryByText('Create New Game Log')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const closeButton = screen.getByTestId('X-icon');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles rating changes', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Find star rating buttons - there are 5 stars
    const stars = screen.getAllByTestId('Star-icon');
    expect(stars).toHaveLength(5);

    // Click on a star
    fireEvent.click(stars[0]);

    // The setValue should be called with the rating (star index + 1) and validation options
    expect(mockSetValue).toHaveBeenCalledWith('rating_for_game', 1, { shouldValidate: true });
  });

  it('handles classification changes', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Find all select elements and pick the privacy one (third select in the form)
    const selects = screen.getAllByRole('combobox');
    const classificationSelect = selects.find(select =>
      select.closest('div')?.querySelector('label')?.textContent?.includes('Privacy Level')
    );

    expect(classificationSelect).toBeInTheDocument();

    fireEvent.change(classificationSelect!, { target: { value: CLASSIFICATION.PRIVATE } });
    fireEvent.change(classificationSelect!, { target: { value: CLASSIFICATION.PUBLIC } });

    // Check that the select has the correct options
    expect(screen.getByText('Private (Only you)')).toBeInTheDocument();
    expect(screen.getByText('Public (Everyone)')).toBeInTheDocument();
  });

  it('handles watched setting changes', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Find the watched setting select dropdown
    const watchedSettingSelect = screen.getByDisplayValue('TV');

    fireEvent.change(watchedSettingSelect, { target: { value: WATCHED_SETTING.HOME } });
    fireEvent.change(watchedSettingSelect, { target: { value: WATCHED_SETTING.ARENA } });

    // Check that the select has the correct options
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Arena')).toBeInTheDocument();
  });

  it('handles watched scope changes', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Find the watched scope select dropdown
    const watchedScopeSelect = screen.getByDisplayValue('Full Game');

    fireEvent.change(watchedScopeSelect, { target: { value: WATCHED_SCOPE.HIGHLIGHTS } });
    fireEvent.change(watchedScopeSelect, { target: { value: WATCHED_SCOPE.FULL_GAME } });

    // Check that the select has the correct options
    expect(screen.getByText('Full Game')).toBeInTheDocument();
    expect(screen.getByText('Highlights')).toBeInTheDocument();
  });

  it('handles game search input', async () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Initially shows loading state, wait for it to be ready
    await waitFor(
      () => {
        const searchInput = screen.getByPlaceholderText('Search by team name, arena, or date...');
        fireEvent.change(searchInput, { target: { value: 'Lakers Warriors' } });
        expect(searchInput).toHaveValue('Lakers Warriors');
      },
      { timeout: 1000 }
    );
  });

  it('handles season filter changes', async () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Wait for loading to complete and find season select
    await waitFor(
      () => {
        const seasonSelect = screen.getByDisplayValue('2024-2025 Season (Latest)');
        fireEvent.change(seasonSelect, { target: { value: 'all' } });
        expect(seasonSelect).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('expands and collapses notes section', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const notesToggle = screen.getByText('Notes (optional)');
    fireEvent.click(notesToggle);

    // Check for ChevronDown icon (expanded) - notes should be expanded after click
    expect(screen.getByTestId('ChevronDown-icon')).toBeInTheDocument();
  });

  it('handles tag input', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');
    fireEvent.change(tagInput, { target: { value: 'new-tag' } });

    // Verify the input has the typed value
    expect(tagInput).toHaveValue('new-tag');

    // The tag addition logic is handled by component state, so we just verify the input works
    expect(tagInput).toBeInTheDocument();
  });

  it('renders create form with submit button', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const saveButton = screen.getByText('Create Game Log');
    expect(saveButton).toBeInTheDocument();
    // In create mode without a selected game, the button should be disabled
    expect(saveButton).toBeDisabled();
  });

  it('renders edit form with submit button', () => {
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        gameLog={mockGameLog}
      />
    );

    const saveButton = screen.getByText('Update Game Log');
    expect(saveButton).toBeInTheDocument();
    // In edit mode with valid data, the button should be enabled
    expect(saveButton).not.toBeDisabled();
  });

  it('shows form validation messages', () => {
    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Should show required field indicators
    expect(screen.getByText('Find/Search for Games *')).toBeInTheDocument();
    expect(screen.getByText('Rating *')).toBeInTheDocument();
    expect(screen.getByText('Privacy Level *')).toBeInTheDocument();
  });

  it('handles disabled state when no game selected', () => {
    mockGetValues.mockReturnValue({
      gameId: '',
      rating_for_game: 4,
      classification: CLASSIFICATION.PUBLIC,
    });

    render(
      <GameLogModal mode="create" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const saveButton = screen.getByText('Create Game Log');
    expect(saveButton).toBeDisabled();
  });
});
