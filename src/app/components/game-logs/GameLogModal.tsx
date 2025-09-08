'use client';

import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Search, Calendar, MapPin, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter as _useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/lib/constants';
import { CREATE_GAME_LOG, UPDATE_GAME_LOG } from '@/lib/graphql/mutations';
import { errorHandlers } from '@/lib/utils/error-handler';
import { getLatestNbaSeason, getRecentNbaSeasons } from '@/lib/utils/nba-season';
import type {
  IGameLogModalProps,
  IGameLogSearchResult,
  Game,
  ICreateGameLogFormData,
  IUpdateGameLogFormData,
  CreateGameLogResponse,
  UpdateGameLogResponse,
} from '@/types';
import { createGameLogSchema, updateGameLogSchema, ErrorCategory, ErrorSeverity } from '@/types';

// Type predicate for linter and type safety
function isCreateGameLogFormData(data: unknown): data is ICreateGameLogFormData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.gameId === 'string' &&
    typeof obj.rating_for_game === 'number' &&
    typeof obj.classification === 'string'
  );
}

// Helper function to safely extract date from various game date formats
function getGameDate(date: string | { start?: string } | unknown): string {
  if (typeof date === 'string') return date;
  if (date && typeof date === 'object' && 'start' in date && typeof date.start === 'string')
    return date.start;
  // For any other unknown type, return empty string instead of calling String()
  return '';
}

const LATEST_SEASON = getLatestNbaSeason();
const SEASONS = getRecentNbaSeasons(10);

export function GameLogModal({
  mode,
  isOpen,
  onClose,
  onSuccess,
  gameLog,
  preSelectedGame,
}: IGameLogModalProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(mode === 'edit' ? (gameLog?.rating_for_game ?? 3) : 3);
  const [tags, setTags] = useState<string[]>(mode === 'edit' ? (gameLog?.tags ?? []) : []);
  const [newTag, setNewTag] = useState('');

  // Create mode specific state
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedGameName, setSelectedGameName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Use a simple debounce with setTimeout instead of the problematic useDebounce hook
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const [searchResults, setSearchResults] = useState<IGameLogSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'latest' | number | 'all'>('latest');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Use appropriate schema and form data type based on mode
  const schema = mode === 'create' ? createGameLogSchema : updateGameLogSchema;
  const defaultValues =
    mode === 'create'
      ? {
          gameId: '',
          rating_for_game: 3,
          classification: CLASSIFICATION.PROTECTED,
          watched_setting: WATCHED_SETTING.TV,
          watched_scope: WATCHED_SCOPE.FULL_GAME,
          watched_date: new Date().toISOString().split('T')[0],
          notes: '',
          watched_location: '',
        }
      : {
          rating_for_game: gameLog?.rating_for_game ?? 3,
          notes: gameLog?.notes ?? '',
          classification:
            (gameLog?.classification as keyof typeof CLASSIFICATION) ?? CLASSIFICATION.PROTECTED,
          watched_setting: gameLog?.watched_setting ?? WATCHED_SETTING.TV,
          watched_scope: gameLog?.watched_scope ?? WATCHED_SCOPE.FULL_GAME,
          watched_date: gameLog?.watched_date
            ? new Date(gameLog.watched_date).toISOString().split('T')[0]
            : '',
          watched_location: gameLog?.watched_location ?? '',
        };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
  } = useForm<ICreateGameLogFormData | IUpdateGameLogFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as ICreateGameLogFormData & IUpdateGameLogFormData,
    mode: mode === 'create' ? 'onChange' : 'onBlur',
  });

  // Update form when gameLog changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && gameLog) {
      setRating(gameLog.rating_for_game ?? 3);
      setTags(gameLog.tags ?? []);
      reset({
        rating_for_game: gameLog.rating_for_game,
        notes: gameLog.notes ?? '',
        classification: gameLog.classification,
        watched_setting: gameLog.watched_setting ?? WATCHED_SETTING.TV,
        watched_scope: gameLog.watched_scope ?? WATCHED_SCOPE.FULL_GAME,
        watched_date: gameLog.watched_date
          ? new Date(gameLog.watched_date).toISOString().split('T')[0]
          : '',
        watched_location: gameLog.watched_location ?? '',
      });
    }
  }, [gameLog, reset, mode]);

  // Set gameId form value when selectedGameId changes (create mode only)
  useEffect(() => {
    if (mode === 'create') {
      setValue('gameId', selectedGameId);
    }
  }, [selectedGameId, setValue, mode]);

  // Handle pre-selected game when modal opens
  useEffect(() => {
    if (mode === 'create' && isOpen && preSelectedGame) {
      setSelectedGameId(preSelectedGame.id);
      setSelectedGameName(preSelectedGame.name);
      setValue('gameId', preSelectedGame.id);
    }
  }, [mode, isOpen, preSelectedGame, setValue]);

  // Search games using API (like the original working GameSearch.tsx)
  const searchGames = useCallback(async (term: string, season: number | 'latest' | 'all') => {
    console.log(`🎬 searchGames called with term="${term}", season=${season}`);
    if (!term?.trim()) {
      console.log(`🎬 searchGames: term is empty, clearing results`);
      setSearchResults([]);
      return;
    }

    // Require minimum 2 characters for search
    if (term.trim().length < 2) {
      console.log(`🎬 searchGames: term "${term}" is too short (min 2 chars), clearing results`);
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      // Determine the season to search - convert to proper season format
      // Database stores seasons as just the year (e.g., "2024"), not "2024-2025"
      const searchSeason =
        season === 'latest'
          ? LATEST_SEASON.toString()
          : season === 'all'
            ? 'all'
            : typeof season === 'number'
              ? season.toString()
              : season;

      console.log(`🔍 Search season determined: "${searchSeason}" (from input: ${season})`);

      // Search for games in the selected season using our internal database
      const timestamp = Date.now();
      console.log(
        `🔍 Making API call to: /api/games?season=${searchSeason}&limit=50000&bypass-cache=true&t=${timestamp}`
      );
      const response = await fetch(
        `/api/games?season=${searchSeason}&limit=50000&bypass-cache=true&t=${timestamp}`
      );

      console.log(`📡 API Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { errors?: string[]; response?: Game[] };
      console.log(`📦 API Response data:`, data);

      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0]);
      }

      const games: Game[] = data.response ?? [];
      console.log(`📊 Internal API returned ${games.length} games for season ${searchSeason}`);
      console.log(`🔍 Search for "${term}" in ${games.length} games`);

      // Debug: Show the first few games to see what we're actually getting
      console.log(
        `🎮 First 3 games from API:`,
        games.slice(0, 3).map(g => ({
          id: g.id,
          homeTeam: g.teams.home.name,
          awayTeam: g.teams.visitors.name,
          arena: g.arena?.name,
        }))
      );

      // Debug: Check if there are any Lakers games in the entire games array
      const lakersGames = games.filter(
        g =>
          g.teams.home.name.toLowerCase().includes('laker') ||
          g.teams.visitors.name.toLowerCase().includes('laker')
      );
      console.log(
        `🏀 Lakers games in API response: ${lakersGames.length}`,
        lakersGames.slice(0, 3).map(g => `${g.teams.visitors.name} @ ${g.teams.home.name}`)
      );

      // Debug: Show some sample team data and check for "lake" matches
      if (games.length > 0) {
        const sampleGame = games[0];
        console.log('Sample game data:', {
          homeTeam: {
            name: sampleGame.teams.home.name,
            nickname: sampleGame.teams.home.nickname,
            code: sampleGame.teams.home.code,
          },
          awayTeam: {
            name: sampleGame.teams.visitors.name,
            nickname: sampleGame.teams.visitors.nickname,
            code: sampleGame.teams.visitors.code,
          },
          arena: {
            name: sampleGame.arena?.name,
            city: sampleGame.arena?.city,
          },
        });

        // Check if there are any teams with "lake" in their data
        const teamsWithLake = new Set<string>();
        games.forEach(game => {
          const homeTeam = game.teams.home;
          const awayTeam = game.teams.visitors;

          if (
            homeTeam.name.toLowerCase().includes('lake') ||
            homeTeam.nickname.toLowerCase().includes('lake') ||
            homeTeam.code.toLowerCase().includes('lake')
          ) {
            teamsWithLake.add(`Home: ${homeTeam.name} (${homeTeam.nickname}) [${homeTeam.code}]`);
          }

          if (
            awayTeam.name.toLowerCase().includes('lake') ||
            awayTeam.nickname.toLowerCase().includes('lake') ||
            awayTeam.code.toLowerCase().includes('lake')
          ) {
            teamsWithLake.add(`Away: ${awayTeam.name} (${awayTeam.nickname}) [${awayTeam.code}]`);
          }
        });

        console.log('Teams containing "lake":', Array.from(teamsWithLake));

        // Also check for "laker" (Lakers)
        const teamsWithLaker = new Set<string>();
        games.forEach(game => {
          const homeTeam = game.teams.home;
          const awayTeam = game.teams.visitors;

          if (
            homeTeam.name.toLowerCase().includes('laker') ||
            homeTeam.nickname.toLowerCase().includes('laker') ||
            homeTeam.code.toLowerCase().includes('laker')
          ) {
            teamsWithLaker.add(`Home: ${homeTeam.name} (${homeTeam.nickname}) [${homeTeam.code}]`);
          }

          if (
            awayTeam.name.toLowerCase().includes('laker') ||
            awayTeam.nickname.toLowerCase().includes('laker') ||
            awayTeam.code.toLowerCase().includes('laker')
          ) {
            teamsWithLaker.add(`Away: ${awayTeam.name} (${awayTeam.nickname}) [${awayTeam.code}]`);
          }
        });

        console.log('Teams containing "laker":', Array.from(teamsWithLaker));

        // Show all unique team names to see what's available
        const allTeams = new Set<string>();
        games.forEach(game => {
          allTeams.add(
            `${game.teams.home.name} (${game.teams.home.nickname}) [${game.teams.home.code}]`
          );
          allTeams.add(
            `${game.teams.visitors.name} (${game.teams.visitors.nickname}) [${game.teams.visitors.code}]`
          );
        });
        console.log('All available teams:', Array.from(allTeams).sort());
      }

      // Filter games based on search term (team names, nicknames, codes, arena, etc.)
      const filteredGames = games.filter(game => {
        const searchLower = term.toLowerCase();

        // Check home team fields
        const homeTeamName = game.teams.home.name.toLowerCase();
        const homeTeamNickname = game.teams.home.nickname.toLowerCase();
        const homeTeamCode = game.teams.home.code.toLowerCase();

        // Check away team fields
        const awayTeamName = game.teams.visitors.name.toLowerCase();
        const awayTeamNickname = game.teams.visitors.nickname.toLowerCase();
        const awayTeamCode = game.teams.visitors.code.toLowerCase();

        // Check arena fields
        const arenaName = game.arena?.name?.toLowerCase() ?? '';
        const arenaCity = game.arena?.city?.toLowerCase() ?? '';

        // Check game date
        const gameDate = new Date(getGameDate(game.date)).toLocaleDateString().toLowerCase();

        const matches =
          // Home team matches
          homeTeamName.includes(searchLower) ||
          homeTeamNickname.includes(searchLower) ||
          homeTeamCode.includes(searchLower) ||
          // Away team matches
          awayTeamName.includes(searchLower) ||
          awayTeamNickname.includes(searchLower) ||
          awayTeamCode.includes(searchLower) ||
          // Arena matches
          arenaName.includes(searchLower) ||
          arenaCity.includes(searchLower) ||
          // Date matches
          gameDate.includes(searchLower);

        return matches;
      });

      console.log(`✅ Found ${filteredGames.length} matching games`);
      console.log(
        `🔍 First 3 filtered games:`,
        filteredGames.slice(0, 3).map(g => `${g.teams.visitors.name} @ ${g.teams.home.name}`)
      );

      // Sort by search relevance first, then by date
      const sortedGames = filteredGames
        .sort((a, b) => {
          // Calculate search relevance score for each game
          const getRelevanceScore = (game: Game) => {
            const searchLower = term.toLowerCase();
            let score = 0;

            // Exact team name match gets highest score
            if (
              game.teams.home.name.toLowerCase().includes(searchLower) ||
              game.teams.visitors.name.toLowerCase().includes(searchLower)
            ) {
              score += 100;
            }

            // Team nickname match gets high score
            if (
              game.teams.home.nickname.toLowerCase().includes(searchLower) ||
              game.teams.visitors.nickname.toLowerCase().includes(searchLower)
            ) {
              score += 80;
            }

            // Team code match gets medium score
            if (
              game.teams.home.code.toLowerCase().includes(searchLower) ||
              game.teams.visitors.code.toLowerCase().includes(searchLower)
            ) {
              score += 60;
            }

            // Arena name match gets lower score
            if (game.arena?.name?.toLowerCase().includes(searchLower)) {
              score += 40;
            }

            // Arena city match gets lower score
            if (game.arena?.city?.toLowerCase().includes(searchLower)) {
              score += 20;
            }

            return score;
          };

          const scoreA = getRelevanceScore(a);
          const scoreB = getRelevanceScore(b);

          // Sort by relevance score first (highest first)
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }

          // If relevance scores are equal, sort by date (most recent first)
          const bDate = getGameDate(b.date);
          const aDate = getGameDate(a.date);
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        })
        .slice(0, 100); // Increased limit to 100 results

      console.log(
        `📊 First 3 sorted games:`,
        sortedGames.slice(0, 3).map(g => `${g.teams.visitors.name} @ ${g.teams.home.name}`)
      );

      const searchResults: IGameLogSearchResult[] = sortedGames.map(game => ({
        id: game.id,
        name: `${game.teams.visitors.name} @ ${game.teams.home.name}`,
        date: new Date(getGameDate(game.date)).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        homeTeam: game.teams.home.name,
        awayTeam: game.teams.visitors.name,
        arena: game.arena?.name ?? 'Unknown Arena',
        season: game.season ? parseInt(game.season) : 2024,
        status: game.status?.long ?? game.status?.short ?? 'Unknown',
      }));

      console.log(`🎯 About to setSearchResults with ${searchResults.length} results`);
      console.log(
        `🎯 searchResults content:`,
        searchResults.slice(0, 3).map(r => r.name)
      );

      setSearchResults(searchResults);

      // Add a small delay to see if state update is working
      setTimeout(() => {
        console.log(
          `🎯 State update completed - searchResults should now have ${searchResults.length} results`
        );
      }, 100);
    } catch (err) {
      console.error(`❌ Search error:`, err);
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // No need to load all games upfront - we search via API when needed

  // Search games when search term changes
  useEffect(() => {
    console.log(
      `🚀 useEffect triggered: debouncedSearchTerm="${debouncedSearchTerm}", selectedSeason=${selectedSeason}, mode=${mode}`
    );
    console.log(
      `🚀 useEffect dependencies: debouncedSearchTerm="${debouncedSearchTerm}", selectedSeason=${selectedSeason}, mode=${mode}`
    );
    if (mode === 'create') {
      console.log(
        `🚀 Calling searchGames with term="${debouncedSearchTerm}" and season=${selectedSeason}`
      );
      void searchGames(debouncedSearchTerm, selectedSeason);
    }
  }, [debouncedSearchTerm, selectedSeason, mode, searchGames]);

  // Mutations
  const [createGameLog, { loading: createLoading, error: _createError }] =
    useOptimizedMutation<CreateGameLogResponse>(CREATE_GAME_LOG, {
      context: {
        component: 'GameLogModal',
        action: 'Create game log',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
      onCompleted: (data: CreateGameLogResponse) => {
        const created = data?.gameLog;
        if (created) {
          toast.success('Game log created!');
          onSuccess?.(created);
          onClose();
          reset();
          setRating(3);
          setTags([]);
          setNewTag('');
          setSelectedGameId('');
          setSelectedGameName('');
          setSearchTerm('');
          setSearchResults([]);
        } else {
          const errorObj = data?.errors?.[0];
          const errorMsg = errorObj?.message ?? 'Game log creation failed';
          toast.error(errorMsg);
          // Close modal even when there are errors to prevent it from staying open
          onClose();
        }
      },
      onError: () => {
        toast.error('Failed to create game log.');
        onClose();
      },
    });

  const [updateGameLog, { loading: updateLoading, error: _updateError }] =
    useOptimizedMutation<UpdateGameLogResponse>(UPDATE_GAME_LOG, {
      context: {
        component: 'GameLogModal',
        action: 'Update game log',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onCompleted: (data: any) => {
        if (data?.updateGameLog?.gameLog) {
          toast.success('Game log updated!');
          onSuccess?.(data.updateGameLog.gameLog);
          onClose();
        } else {
          // Show detailed error message from backend
          const errors = data?.updateGameLog?.errors;
          if (errors && errors.length > 0) {
            const errorMessage = errors[0]?.message ?? 'Failed to update game log';
            toast.error(errorMessage);
          } else {
            toast.error('Failed to update game log.');
          }
        }
      },
      onError: (error: unknown) => {
        toast.error(
          `Failed to update game log: ${error instanceof Error ? error.message : String(error)}`
        );
        onClose();
      },
    });

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGameSelect = (gameId: string, gameName: string) => {
    setSelectedGameId(gameId);
    setSelectedGameName(gameName);
    setValue('gameId', gameId, { shouldValidate: true });
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating_for_game', newRating, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: unknown) => {
    try {
      if (mode === 'create') {
        if (!isCreateGameLogFormData(data)) {
          throw new Error('Invalid form data');
        }
        const input = {
          gameId: data.gameId,
          rating_for_game: data.rating_for_game,
          notes: data.notes,
          classification: data.classification,
          watched_date: data.watched_date ? new Date(data.watched_date) : new Date(),
          watched_setting: data.watched_setting,
          watched_location: data.watched_location,
          watched_scope: data.watched_scope,
          tags,
        };
        await createGameLog({ variables: { input } });
      } else {
        // Edit mode
        const updateData = data as IUpdateGameLogFormData;
        const input = {
          rating_for_game: updateData.rating_for_game,
          notes: updateData.notes,
          classification: updateData.classification,
          watched_setting: updateData.watched_setting,
          watched_location: updateData.watched_location,
          watched_scope: updateData.watched_scope,
          tags: updateData.tags,
          watched_date: updateData.watched_date
            ? new Date(updateData.watched_date).toISOString()
            : undefined,
        };
        if (!gameLog) {
          throw new Error('Game log is required for edit mode');
        }
        await updateGameLog({
          variables: {
            id: gameLog.id,
            input,
          },
        });
      }
    } catch (err) {
      errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'GameLogModal',
        action: `${mode} game log`,
      });
      toast.error(`Failed to ${mode} game log.`);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(true);
    console.log('Search input changed:', value, 'showSearchResults set to true');

    if (!value.trim()) {
      setSelectedGameId('');
      setSelectedGameName('');
      setValue('gameId', '');
      setSearchResults([]);
      console.log('Search term cleared, clearing search results');
    }
  };

  if (!isOpen) return null;

  const isUserAuthenticated = !!user;
  const loading = createLoading || updateLoading;
  const isFormValid = mode === 'create' ? isValid && selectedGameId : isValid;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <Card
        className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 game-log-modal"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark')
            ? 'rgb(248, 250, 252)'
            : 'rgb(17, 24, 39)',
        }}
      >
        <div className="p-6 text-neutral-100 dark:text-neutral-900">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-100 dark:text-neutral-900">
                {mode === 'create' ? 'Create New Game Log' : 'Edit Game Log'}
              </h2>
              <p className="text-sm text-neutral-300 dark:text-neutral-600 mt-1">
                {mode === 'create' ? 'Add a new game log entry' : 'Update your game log details'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-neutral-300 hover:text-neutral-100 dark:text-neutral-600 dark:hover:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isUserAuthenticated && (
            <div className="mb-6 p-4 bg-semantic-warning/10 border border-semantic-warning/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-semantic-warning/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-semantic-warning"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-semantic-warning">
                    Authentication Required
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    You must be signed in to {mode} a game log.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={e => void handleSubmit(handleFormSubmit)(e)} className="space-y-6">
            {/* Game Selection - Only for create mode */}
            {mode === 'create' && (
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-300 dark:text-neutral-700 mb-1">
                  Find/Search for Games *
                </label>
                {selectedGameName ? (
                  <div className="flex items-center gap-3 p-3 border-2 border-brand-primary/30 dark:border-brand-primary/40 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-neutral-100 dark:text-neutral-900">
                        {selectedGameName}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Game ID: {selectedGameId}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGameId('');
                        setSelectedGameName('');
                        setValue('gameId', '');
                        setSearchTerm('');
                      }}
                      className="border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-semantic-error dark:hover:text-semantic-error"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onFocus={() => setShowSearchResults(true)}
                        disabled={searchLoading}
                        className="w-full pl-8 pr-2 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-100 dark:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={
                          searchLoading
                            ? 'Loading games...'
                            : 'Search by team name, arena, or date...'
                        }
                      />
                    </div>

                    {/* Season selector */}
                    <div className="mt-2">
                      <select
                        value={selectedSeason}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'all' || val === 'latest') setSelectedSeason(val);
                          else setSelectedSeason(Number(val));
                        }}
                        disabled={searchLoading}
                        className="w-full px-2 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="latest">
                          {searchLoading
                            ? 'Loading...'
                            : `${LATEST_SEASON}-${LATEST_SEASON + 1} Season (Latest)`}
                        </option>
                        <option value="all">All Seasons</option>
                        {SEASONS.map(season => (
                          <option key={season} value={season}>
                            {season}-{season + 1} Season
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {/* Debug: Current searchResults state */}
                        {searchLoading && (
                          <div className="p-3 text-center text-neutral-600 dark:text-neutral-400 text-sm">
                            <p>Loading games for selected season...</p>
                          </div>
                        )}

                        {searchLoading && (
                          <div className="p-3 text-center text-neutral-600 dark:text-neutral-400 text-sm">
                            <p>Searching for games...</p>
                          </div>
                        )}

                        {searchError && (
                          <div className="p-3 text-center text-semantic-error dark:text-semantic-error text-sm">
                            <p>Error: {searchError}</p>
                          </div>
                        )}

                        {!searchLoading &&
                          !searchLoading &&
                          !searchError &&
                          searchResults.length === 0 &&
                          searchTerm.trim() && (
                            <div className="p-3 text-center text-neutral-600 dark:text-neutral-400 text-sm">
                              <p>No games found matching your search.</p>
                              <p className="text-xs mt-1">Try a different search term.</p>
                            </div>
                          )}

                        {!searchLoading &&
                          !searchLoading &&
                          !searchError &&
                          searchResults.length > 0 && (
                            <div className="py-1">
                              {/* Debug: Rendering search results */}
                              {searchResults.map(game => (
                                <div
                                  key={game.id}
                                  onClick={() => handleGameSelect(game.id.toString(), game.name)}
                                  className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-200 dark:border-neutral-700 last:border-b-0"
                                >
                                  <div className="font-medium text-neutral-100 dark:text-neutral-900 text-sm mb-0.5">
                                    {game.name}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {game.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {game.arena}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {searchResults.length > 0 && (
                                <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700">
                                  Showing {searchResults.length} result
                                  {searchResults.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}

                        {!searchLoading && !searchLoading && !searchError && !searchTerm.trim() && (
                          <div className="p-3 text-center text-neutral-600 text-sm">
                            <p>Start typing to search for games...</p>
                            <p className="text-xs mt-1">Search by team name, arena, or date</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === 'create' && 'gameId' in errors && errors.gameId && (
                  <p className="text-red-600 text-sm mt-1">
                    {(errors.gameId as { message?: string })?.message}
                  </p>
                )}
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-orange-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">({rating}/5)</span>
              </div>
              <input type="hidden" {...register('rating_for_game')} value={rating} />
              {errors.rating_for_game && (
                <p className="text-red-600 text-xs">{errors.rating_for_game.message}</p>
              )}
            </div>

            {/* Privacy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Privacy Level *
              </label>
              <select
                {...register('classification')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={CLASSIFICATION.PRIVATE}>Private (Only you)</option>
                <option value={CLASSIFICATION.PROTECTED}>Protected (Friends only)</option>
                <option value={CLASSIFICATION.PUBLIC}>Public (Everyone)</option>
              </select>
              {errors.classification && (
                <p className="text-red-600 text-xs mt-1">{errors.classification.message}</p>
              )}
            </div>

            {/* Watched Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Watched Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('watched_date')}
                  className="w-full px-2 py-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  id="watched-date-input"
                />
                <div
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  onClick={() => {
                    const input = document.getElementById('watched-date-input') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      if (typeof input.showPicker === 'function') {
                        input.showPicker();
                      } else {
                        input.click();
                      }
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Watched Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                How did you watch?
              </label>
              <select
                {...register('watched_setting')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={WATCHED_SETTING.TV}>TV</option>
                <option value={WATCHED_SETTING.LAPTOP}>Laptop/Computer</option>
                <option value={WATCHED_SETTING.PHONE}>Phone</option>
                <option value={WATCHED_SETTING.ARENA}>Arena</option>
                <option value={WATCHED_SETTING.BAR}>Bar</option>
                <option value={WATCHED_SETTING.HOME}>Home</option>
                <option value={WATCHED_SETTING.OTHER}>Other</option>
              </select>
            </div>

            {/* Watched Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                {...register('watched_location')}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g., Home, Arena, Bar"
              />
            </div>

            {/* Watched Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What did you watch?
              </label>
              <select
                {...register('watched_scope')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={WATCHED_SCOPE.FULL_GAME}>Full Game</option>
                <option value={WATCHED_SCOPE.HALF_GAME}>Half Game</option>
                <option value={WATCHED_SCOPE.HIGHLIGHTS}>Highlights</option>
                <option value={WATCHED_SCOPE.PRE_GAME}>Pre-Game</option>
                <option value={WATCHED_SCOPE.POST_GAME}>Post-Game</option>
                <option value={WATCHED_SCOPE.SHORTS}>Shorts</option>
                <option value={WATCHED_SCOPE.OTHER}>Other</option>
              </select>
            </div>

            {/* Notes */}
            <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {isNotesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                Notes (optional)
              </button>
              {isNotesExpanded && (
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                  placeholder="Share your thoughts about this game..."
                />
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 min-h-[44px] flex-1">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary rounded-md text-xs font-medium flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-brand-primary dark:text-brand-primary hover:text-brand-primary/80 dark:hover:text-brand-primary/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-w-[120px] border-none outline-none bg-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm text-neutral-900 dark:text-neutral-100"
                      placeholder={tags.length === 0 ? 'Type a tag and press Enter' : ''}
                    />
                  </div>
                  {newTag.trim() && (
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      size="sm"
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-medium shadow-sm text-xs whitespace-nowrap transition-all duration-200"
                    >
                      Add Tag
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || loading}
                className="flex-1 h-11 border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-medium transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading || !isFormValid || !isUserAuthenticated}
                className="flex-1 h-11 bg-brand-primary hover:bg-brand-primary-dark text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </div>
                ) : mode === 'create' ? (
                  'Create Game Log'
                ) : (
                  'Update Game Log'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
