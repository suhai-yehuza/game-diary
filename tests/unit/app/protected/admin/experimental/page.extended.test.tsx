import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import AdminExperimentalPage from '@/app/protected/admin/experimental/page';
import { API_CONFIG } from '@/lib/config/app.config';

const handleFetchMock = vi.fn(async () => {});
const clearDataMock = vi.fn();

vi.mock('@/app/protected/admin/experimental/hooks', () => ({
  useApiFetch: () => ({
    data: null,
    loading: false,
    error: null,
    handleFetch: handleFetchMock,
    clearData: clearDataMock,
  }),
  useSeasonsData: () => ({
    seasons: [{ value: '2024', label: '2024' }],
    loadingSeasons: false,
    seasonsError: null,
    refetchSeasons: vi.fn(),
  }),
  useTeamsData: () => ({
    teams: [{ value: '10', label: 'Team A' }],
    loadingTeams: false,
    teamsError: null,
    refetchTeams: vi.fn(),
  }),
  useTabState: () => ({
    selectedTab: 'seasons',
    setSelectedTab: (_v: string) => {},
    gamesSubTab: 'games',
    setGamesSubTab: (_v: string) => {},
    teamsSubTab: 'teams',
    setTeamsSubTab: (_v: string) => {},
    playersSubTab: 'players',
    setPlayersSubTab: (_v: string) => {},
  }),
  useFormState: () => ({
    gameParams: { id: '', date: '', season: '2024', league: '', team: '10', h2h: '' },
    setGameParams: vi.fn(),
    gameStatsId: '',
    setGameStatsId: vi.fn(),
    teamParams: {
      id: '',
      name: '',
      code: '',
      league: '',
      conference: '',
      division: '',
      search: '',
    },
    setTeamParams: vi.fn(),
    teamStatsParams: { id: '', season: '2024', stage: '' },
    setTeamStatsParams: vi.fn(),
    playerParams: { id: '', name: '', team: '', season: '2024', country: '', search: '' },
    setPlayerParams: vi.fn(),
    playerStatsParams: { id: '', game: '', team: '', season: '2024' },
    setPlayerStatsParams: vi.fn(),
    standingsParams: { league: 'standard', season: '2024', team: '', conference: '', division: '' },
    setStandingsParams: vi.fn(),
  }),
}));

describe('AdminExperimentalPage basic interactions', () => {
  it('triggers seasons fetch via SimpleEndpoints', () => {
    render(<AdminExperimentalPage />);
    // Default selected tab is seasons in the mocked hook
    const fetchSeasonsBtn = screen.getByText('Fetch Seasons');
    fireEvent.click(fetchSeasonsBtn);
    expect(handleFetchMock).toHaveBeenCalledWith(API_CONFIG.endpoints.SEASONS, {});
  });
});
