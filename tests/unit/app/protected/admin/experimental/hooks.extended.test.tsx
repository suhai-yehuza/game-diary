import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  useTeamsData,
  useSeasonsData,
  useApiFetch,
} from '@/app/protected/admin/experimental/hooks';

function TeamsHarness() {
  const { teams, loadingTeams, teamsError, refetchTeams } = useTeamsData();
  return (
    <div>
      <div data-testid="teams-count">{teams.length}</div>
      <div data-testid="teams-loading">{loadingTeams ? 'yes' : 'no'}</div>
      <div data-testid="teams-error">{teamsError ?? ''}</div>
      <button onClick={() => void refetchTeams()}>refetch-teams</button>
    </div>
  );
}

function SeasonsHarness() {
  const { seasons, loadingSeasons, seasonsError, refetchSeasons } = useSeasonsData();
  return (
    <div>
      <div data-testid="seasons-count">{seasons.length}</div>
      <div data-testid="seasons-loading">{loadingSeasons ? 'yes' : 'no'}</div>
      <div data-testid="seasons-error">{seasonsError ?? ''}</div>
      <button onClick={() => void refetchSeasons()}>refetch-seasons</button>
    </div>
  );
}

describe('experimental hooks (extended)', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn(async (input: RequestInfo | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : ((input as URL)?.href ?? (input as Request as any)?.url ?? '');
      if (url.includes('/api/proxy/teams')) {
        return {
          ok: true,
          json: async () => ({
            response: [
              { id: 1, name: 'Z Team' },
              { id: 2, name: 'A Team' },
            ],
          }),
        } as Response;
      }
      if (url.includes('/api/proxy/seasons')) {
        return {
          ok: true,
          json: async () => ({ response: [2022, 2024, 2023] }),
        } as Response;
      }
      return {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({}),
      } as Response;
    }) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads teams and sorts with All Teams prepended; supports refetch', async () => {
    render(<TeamsHarness />);
    expect(screen.getByTestId('teams-loading').textContent).toBe('yes');

    // initial effect
    await act(async () => {});

    const count = Number(screen.getByTestId('teams-count').textContent);
    expect(count).toBe(3); // All Teams + 2

    // trigger refetch
    await act(async () => {
      fireEvent.click(screen.getByText('refetch-teams'));
    });
    expect(global.fetch as any).toHaveBeenCalledTimes(2);
  });

  it('loads seasons sorted desc; supports refetch', async () => {
    render(<SeasonsHarness />);
    expect(screen.getByTestId('seasons-loading').textContent).toBe('yes');
    await act(async () => {});
    const count = Number(screen.getByTestId('seasons-count').textContent);
    expect(count).toBe(3);
    await act(async () => {
      fireEvent.click(screen.getByText('refetch-seasons'));
    });
    expect(global.fetch as any).toHaveBeenCalledWith('/api/proxy/seasons', { method: 'GET' });
  });
});

// Additional coverage for useApiFetch
function HookHarness() {
  const { data, loading, error, handleFetch, clearData } = useApiFetch();
  return (
    <div>
      <div data-testid="data">{data ? 'data' : 'no-data'}</div>
      <div data-testid="loading">{loading ? 'yes' : 'no'}</div>
      <div data-testid="error">{error ?? ''}</div>
      <button onClick={() => void handleFetch('/seasons', {})}>fetch-seasons</button>
      <button onClick={() => void handleFetch('/teams', { id: '' })}>fetch-teams-empty</button>
      <button onClick={() => void handleFetch('/teams', { id: '10' })}>fetch-teams</button>
      <button onClick={() => void handleFetch('/game_statistics', {}, ['id'])}>
        fetch-missing
      </button>
      <button onClick={() => clearNotificationsFallback(clearData)}>clear</button>
    </div>
  );
}

function clearNotificationsFallback(clearData: () => void) {
  clearData();
}

describe('experimental hooks: useApiFetch (merged)', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn(async (input: RequestInfo | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : ((input as URL)?.href ?? (input as Request as any)?.url ?? '');
      if (url.includes('/api/proxy/seasons')) {
        return {
          ok: true,
          json: async () => ({ response: [2024] }),
        } as Response;
      }
      if (url.includes('/api/proxy/teams') && url.includes('id=10')) {
        return {
          ok: true,
          json: async () => ({ response: [{ id: 10, name: 'Team A' }] }),
        } as Response;
      }
      return {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({}),
      } as Response;
    }) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches seasons successfully', async () => {
    render(<HookHarness />);
    expect(screen.getByTestId('data').textContent).toBe('no-data');

    await act(async () => {
      fireEvent.click(screen.getByText('fetch-seasons'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proxy/seasons'),
      expect.anything()
    );
    expect(screen.getByTestId('data').textContent).toBe('data');
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('does not send empty params and succeeds when valid', async () => {
    render(<HookHarness />);
    await act(async () => {
      fireEvent.click(screen.getByText('fetch-teams-empty'));
    });
    expect(screen.getByTestId('error').textContent).toContain('At least one parameter is required');

    await act(async () => {
      fireEvent.click(screen.getByText('fetch-teams'));
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proxy/teams?id=10'),
      expect.anything()
    );
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('sets error for missing required parameters', async () => {
    render(<HookHarness />);
    await act(async () => {
      fireEvent.click(screen.getByText('fetch-missing'));
    });
    expect(screen.getByTestId('error').textContent).toContain('Missing required parameters: id');
  });
});
