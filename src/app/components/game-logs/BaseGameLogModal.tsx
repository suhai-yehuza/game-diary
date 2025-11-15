'use client';

// GameLogModal component for creating and editing game logs
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Search, Calendar, MapPin, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter as _useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { generateDistinctTagColors } from '@/app/components/game-logs/utils/gameLogsUtils';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/lib/constants';
import { CREATE_GAME_LOG, UPDATE_GAME_LOG } from '@/lib/graphql/mutations';
import { errorHandlers } from '@/lib/utils/error-handler';
import { getCurrentNbaSeason, getRecentNbaSeasonsArray } from '@/lib/utils/season-filter.utils';
import { createGameLogSchema, updateGameLogSchema, ErrorCategory, ErrorSeverity } from '@/types';
import type {
  IGameLogModalProps,
  IGameLogSearchResult,
  ICreateGameLogFormData,
  IUpdateGameLogFormData,
  CreateGameLogResponse,
  UpdateGameLogResponse,
  IGame,
  GameLogEdge,
} from '@/types';

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

const LATEST_SEASON = getCurrentNbaSeason();
const SEASONS = getRecentNbaSeasonsArray(10);

// Helper function to generate optimistic game log data
function generateOptimisticGameLog(
  input: Record<string, unknown>,
  user: Record<string, unknown>,
  game: Record<string, unknown>
) {
  const now = new Date();
  return {
    id: `temp-${Date.now()}`, // Temporary ID for optimistic update
    game_id: input.gameId,
    rating_for_game: input.rating_for_game || 3,
    notes: input.notes || null,
    tags: input.tags || [],
    watched_date:
      input.watched_date && typeof input.watched_date === 'string'
        ? new Date(input.watched_date).toISOString()
        : now.toISOString(),
    watched_setting: input.watched_setting || WATCHED_SETTING.TV,
    watched_location: input.watched_location || '',
    watched_scope: input.watched_scope || WATCHED_SCOPE.FULL_GAME,
    classification: input.classification || CLASSIFICATION.PRIVATE,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    // Add missing fields for optimistic update
    comments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
      __typename: 'CommentConnection' as const,
    },
    reactions: [],
    totalCommentCount: 0,
    totalReactionCount: 0,
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
      image_url: user.image_url,
      isAdmin: user.isAdmin,
      created_at: user.created_at,
      __typename: 'UserSummary' as const,
    },
    game: game
      ? {
          id: game.id,
          date: game.date,
          teams: game.teams,
          created_at: game.created_at || new Date().toISOString(),
          updated_at: game.updated_at || new Date().toISOString(),
          publicComments: game.publicComments || {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
            __typename: 'CommentConnection' as const,
          },
          publicReactions: game.publicReactions || {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
            __typename: 'ReactionConnection' as const,
          },
          totalPublicCommentCount: game.totalPublicCommentCount || 0,
          totalPublicReactionCount: game.totalPublicReactionCount || 0,
          __typename: 'Game' as const,
        }
      : {
          id: input.gameId,
          date: new Date().toISOString(),
          teams: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          publicComments: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
            __typename: 'CommentConnection' as const,
          },
          publicReactions: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
            __typename: 'ReactionConnection' as const,
          },
          totalPublicCommentCount: 0,
          totalPublicReactionCount: 0,
          __typename: 'Game' as const,
        },
    __typename: 'GameLog' as const,
  };
}

// Helper function to generate optimistic response for create mutation
function generateCreateOptimisticResponse(
  input: Record<string, unknown>,
  user: Record<string, unknown>,
  game: Record<string, unknown>
) {
  const optimisticGameLog = generateOptimisticGameLog(input, user, game);

  return {
    createGameLog: {
      gameLog: optimisticGameLog,
      errors: [],
      __typename: 'CreateGameLogResponse' as const,
    },
  };
}

// Helper function to generate optimistic response for update mutation
function generateUpdateOptimisticResponse(
  gameLog: Record<string, unknown>,
  input: Record<string, unknown>
) {
  // Only include fields that the UPDATE_GAME_LOG mutation returns
  const optimisticGameLog = {
    id: gameLog.id,
    rating_for_game: input.rating_for_game ?? gameLog.rating_for_game,
    notes: input.notes ?? gameLog.notes,
    tags: input.tags ?? gameLog.tags,
    watched_date: input.watched_date ?? gameLog.watched_date,
    watched_setting: input.watched_setting ?? gameLog.watched_setting,
    watched_location: input.watched_location ?? gameLog.watched_location,
    watched_scope: input.watched_scope ?? gameLog.watched_scope,
    classification: input.classification ?? gameLog.classification,
    updated_at: new Date().toISOString(),
    __typename: 'GameLog' as const,
  };

  return {
    updateGameLog: {
      gameLog: optimisticGameLog,
      errors: [],
      __typename: 'UpdateGameLogResponse' as const,
    },
  };
}

export function GameLogModal({
  mode,
  isOpen,
  onClose,
  onSuccess,
  gameLog,
  preSelectedGame,
}: IGameLogModalProps) {
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

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
    }, 800); // Increased debounce time to reduce API calls and flickering

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const [searchResults, setSearchResults] = useState<IGameLogSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const isSearchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<'latest' | number | 'all'>('latest');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Handle mounting state for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle date picker close events
  useEffect(() => {
    const handleDatePickerClose = () => {
      setIsDatePickerOpen(false);
    };

    const input = document.getElementById('watched-date-input') as HTMLInputElement;
    if (input) {
      input.addEventListener('change', handleDatePickerClose);
      input.addEventListener('blur', handleDatePickerClose);

      return () => {
        input.removeEventListener('change', handleDatePickerClose);
        input.removeEventListener('blur', handleDatePickerClose);
      };
    }
  }, []);

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
      setValue('gameId', selectedGameId, { shouldValidate: true });
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
  const searchGames = useCallback(
    async (term: string, season: number | 'latest' | 'all') => {
      console.log(`🎬 searchGames called with term="${term}", season=${season}`);

      // Early return if modal is not open
      if (!isOpen) {
        console.log(`🎬 searchGames: modal is closed, skipping search`);
        return;
      }

      // Early validation - don't search for empty or very short terms
      if (!term?.trim() || term.trim().length < 2) {
        console.log(`🎬 searchGames: term "${term}" is too short or empty, clearing results`);
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      // Prevent duplicate searches for the same term
      if (isSearchingRef.current) {
        console.log(`🎬 searchGames: already searching, skipping duplicate request`);
        return;
      }

      isSearchingRef.current = true;
      setSearchLoading(true);
      setSearchError(null);

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

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

        // Use the new search API endpoint for server-side filtering
        const searchUrl = `/api/games/search?q=${encodeURIComponent(term.trim())}&season=${searchSeason}&limit=500&bypass-cache=true`;
        console.log(`🔍 Making search API call: ${searchUrl}`);

        const response = await fetch(searchUrl, {
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Search failed');
        }

        const games: IGame[] = data.data || [];
        console.log(
          `🔍 Search API returned ${games.length} games (total matches: ${data.search?.totalMatches || 'unknown'})`
        );

        // Debug: Show the first few games to see what we're actually getting
        console.log(
          `🎮 First 3 games from search API:`,
          games.slice(0, 3).map((g: IGame) => ({
            id: g.id,
            homeTeam: g.teams?.home?.name,
            awayTeam: g.teams?.visitors?.name,
            arena: g.arena,
          }))
        );

        console.log(
          `✅ Server returned ${games.length} matching games for season "${searchSeason}"`
        );

        // Transform games to search results format (server already filtered and sorted)
        const searchResults: IGameLogSearchResult[] = games.map((game: IGame) => {
          const teams = game.teams;
          const arena = game.arena;

          return {
            id: game.id,
            name: `${teams?.visitors?.name || 'Unknown'} @ ${teams?.home?.name || 'Unknown'}`,
            date: new Date(getGameDate(game.date)).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            homeTeam: teams?.home?.name || 'Unknown',
            awayTeam: teams?.visitors?.name || 'Unknown',
            arena: arena?.name || 'Unknown Arena',
            season: game.season ? parseInt(game.season) : 2024,
            status: game.status?.long ?? game.status?.short ?? 'Unknown',
          };
        });

        console.log(
          `📊 First 3 search results:`,
          searchResults.slice(0, 3).map(g => g.name)
        );

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

        // Handle different types of errors
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setSearchError('Search request was cancelled');
          } else if (err.message.includes('timeout')) {
            setSearchError('Search request timed out - please try again');
          } else {
            setSearchError(err.message);
          }
        } else {
          setSearchError('Search failed');
        }

        setSearchResults([]);
      } finally {
        isSearchingRef.current = false;
        setSearchLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isOpen]
  );

  // No need to load all games upfront - we search via API when needed

  // Search games when search term changes
  useEffect(() => {
    // Only search if modal is open and we have a meaningful search term (at least 3 characters to reduce API calls)
    if (isOpen && mode === 'create' && debouncedSearchTerm.trim().length >= 3) {
      console.log(
        `🚀 Calling searchGames with term="${debouncedSearchTerm}" and season=${selectedSeason}`
      );
      void searchGames(debouncedSearchTerm, selectedSeason);
    } else if (mode === 'create' && debouncedSearchTerm.trim().length === 0) {
      // Clear results when search term is empty
      setSearchResults([]);
      setSearchError(null);
    }
  }, [debouncedSearchTerm, selectedSeason, mode, searchGames, isOpen]);

  // Debug: Log when season changes
  useEffect(() => {
    console.log(`🔄 Season changed to: ${selectedSeason}`);
  }, [selectedSeason]);

  // Cleanup search state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isSearchingRef.current = false;
      setSearchLoading(false);
      setSearchResults([]);
      setSearchError(null);
      setSearchTerm('');
      setDebouncedSearchTerm('');
    }
  }, [isOpen]);

  // Mutations
  const [createGameLog, { loading: createLoading, error: _createError }] = useOptimizedMutation<{
    createGameLog: CreateGameLogResponse;
  }>(CREATE_GAME_LOG, {
    context: {
      component: 'GameLogModal',
      action: 'Create game log',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    // Enable optimistic updates
    enableOptimisticUpdates: true,
    onCompleted: (data: { createGameLog: CreateGameLogResponse }) => {
      const createGameLogResponse = data?.createGameLog;
      const created = createGameLogResponse?.gameLog;
      if (created) {
        // Show success message if creation succeeded
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
        // Show error message if creation failed
        const errorObj = createGameLogResponse?.errors?.[0];
        const errorMsg = errorObj?.message ?? 'Game log creation failed';
        toast.error(errorMsg);
      }
      // Apollo automatically handles optimistic update rollback on error
    },
    onError: () => {
      toast.error('Failed to create game log.');
      onClose();
    },
  });

  const [updateGameLog, { loading: updateLoading, error: _updateError }] = useOptimizedMutation<{
    updateGameLog?: UpdateGameLogResponse;
  }>(UPDATE_GAME_LOG, {
    context: {
      component: 'GameLogModal',
      action: 'Update game log',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    // Enable optimistic updates
    enableOptimisticUpdates: true,

    onCompleted: (data: { updateGameLog?: UpdateGameLogResponse }) => {
      const response = data?.updateGameLog;
      const updated = response?.gameLog;
      if (updated) {
        // Show success message if update succeeded
        toast.success('Game log updated!');
        onSuccess?.(updated);
        onClose();
      } else {
        // Show error message if update failed
        const errors = response?.errors;
        if (errors && errors.length > 0) {
          const errorMessage = errors[0]?.message ?? 'Failed to update game log';
          toast.error(errorMessage);
        } else {
          toast.error('Failed to update game log.');
        }
      }
      // Apollo automatically handles optimistic update rollback on error
    },
    onError: (error: unknown) => {
      toast.error(
        `Failed to update game log: ${error instanceof Error ? error.message : String(error)}`
      );
      // The optimistic update will be automatically rolled back by Apollo
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

        // Get current user for optimistic update
        const currentUser = user;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        // Find the selected game for optimistic update
        const selectedGame = searchResults.find(game => game.id === data.gameId) || preSelectedGame;

        // Generate optimistic response
        const optimisticResponse = generateCreateOptimisticResponse(
          input,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentUser as any,
          selectedGame
        );

        // Execute mutation with optimistic response and cache update
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await createGameLog({
          variables: { input },
          optimisticResponse: optimisticResponse as any,
          update: (cache: any, result: any) => {
            const data = result.data;
            // Update the cache with the real server response after mutation completes
            if (data?.createGameLog?.gameLog) {
              const newGameLog = data.createGameLog.gameLog;

              // Add the new game log to any game logs lists
              cache.modify({
                fields: {
                  gameLogs(existingConnection: any) {
                    if (!existingConnection) return existingConnection;
                    const edges = existingConnection.edges || [];

                    // Check if this game log already exists in the cache
                    const exists = edges.some((edge: GameLogEdge) => {
                      const nodeId = cache.identify(edge.node);
                      return nodeId === cache.identify(newGameLog);
                    });

                    if (!exists) {
                      // Add the new game log to the beginning of the list
                      const newEdge = {
                        node: newGameLog,
                        cursor: newGameLog.id,
                        __typename: 'GameLogEdge',
                      };

                      return {
                        ...existingConnection,
                        edges: [newEdge, ...edges],
                        totalCount: existingConnection.totalCount + 1,
                      };
                    }

                    return existingConnection;
                  },
                },
              });

              // onSuccess and cleanup will be handled in onCompleted callback
            }
          },
        });
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
          tags, // Use local state tags instead of form data tags
          watched_date: updateData.watched_date
            ? new Date(updateData.watched_date).toISOString()
            : undefined,
        };
        if (!gameLog) {
          throw new Error('Game log is required for edit mode');
        }

        // Generate optimistic response
        const optimisticResponse = generateUpdateOptimisticResponse(gameLog, input) as Record<
          string,
          unknown
        >;

        // Execute mutation with optimistic response and cache update
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await updateGameLog({
          variables: {
            id: gameLog.id,
            input,
          },
          optimisticResponse: optimisticResponse as any,
          update: (cache: any, result: any) => {
            const data = result.data;
            // Update the cache with the real server response after mutation completes
            if (data?.updateGameLog?.gameLog) {
              const updatedGameLog = data.updateGameLog.gameLog;

              // Update the specific game log in the cache
              cache.modify({
                id: cache.identify(updatedGameLog),
                fields: {
                  rating_for_game: () => updatedGameLog.rating_for_game,
                  notes: () => updatedGameLog.notes,
                  classification: () => updatedGameLog.classification,
                  watched_setting: () => updatedGameLog.watched_setting,
                  watched_scope: () => updatedGameLog.watched_scope,
                  watched_date: () => updatedGameLog.watched_date,
                  watched_location: () => updatedGameLog.watched_location,
                  updated_at: () => updatedGameLog.updated_at,
                },
              });

              // Also update any game logs lists that might contain this game log
              cache.modify({
                fields: {
                  gameLogs(existingConnection: any, { readField }: any) {
                    if (!existingConnection) return existingConnection;
                    const edges = existingConnection.edges || [];
                    const updatedEdges = edges.map((edge: GameLogEdge) => {
                      const nodeId = readField('id', edge.node);
                      if (nodeId === updatedGameLog.id) {
                        return {
                          ...edge,
                          node: {
                            ...edge.node,
                            ...updatedGameLog,
                          },
                        };
                      }
                      return edge;
                    });
                    return {
                      ...existingConnection,
                      edges: updatedEdges,
                    };
                  },
                },
              });

              // onSuccess and cleanup will be handled in onCompleted callback
            }
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
      setShowSearchResults(false);
      console.log('Search term cleared, clearing search results');
    }
  };

  if (!isOpen) return null;

  const isUserAuthenticated = !!user;
  const loading = createLoading || updateLoading;
  const isFormValid = mode === 'create' ? isValid && selectedGameId : isValid;

  // Don't render anything until mounted (prevents hydration issues)
  if (!isMounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <Card
          className="relative w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)] border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 game-log-modal z-[10000] flex flex-col"
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: '#f8fafc', // Light slate background that works on both themes
            color: '#1e293b', // Dark slate text for excellent contrast
            maxHeight: 'calc(100vh - 2rem)', // Ensure mobile compatibility with centered positioning
            minHeight: '0', // Allow shrinking on very small screens
          }}
        >
          <form
            onSubmit={e => void handleSubmit(handleFormSubmit)(e)}
            className="flex flex-col h-full min-h-0"
          >
            <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
              <div className="p-3 sm:p-4 md:p-6" style={{ color: '#1e293b' }}>
                <div className="flex justify-between items-start gap-3 mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold" style={{ color: '#0f172a' }}>
                      {mode === 'create' ? 'Create New Game Log' : 'Edit Game Log'}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: '#475569' }}>
                      {mode === 'create'
                        ? 'Add a new game log entry'
                        : 'Update your game log details'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-full p-2 w-8 h-8 min-w-8 max-w-8 flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-500"
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
                        <p className="text-xs text-theme-muted mt-1">
                          You must be signed in to {mode} a game log.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Game Selection - Only for create mode */}
                {mode === 'create' && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-theme-primary mb-1">
                      Find/Search for Games *
                    </label>
                    {selectedGameName ? (
                      <div className="flex items-center gap-3 p-3 border-2 border-brand-primary/30 rounded-lg bg-brand-primary/10">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-theme-primary">
                            {selectedGameName}
                          </p>
                          <p className="text-xs text-theme-muted">Game ID: {selectedGameId}</p>
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
                            setShowSearchResults(false);
                          }}
                          className="border-theme-primary bg-bg-theme-secondary text-theme-primary hover:bg-bg-theme-tertiary hover:text-semantic-error w-8 h-8 min-w-8 max-w-8 min-h-8 max-h-8 p-0 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4"
                            style={{ left: '12px' }}
                          />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            onFocus={() => setShowSearchResults(true)}
                            onBlur={() => {
                              // Use setTimeout to allow click events on dropdown items to fire first
                              setTimeout(() => setShowSearchResults(false), 150);
                            }}
                            className="w-full pl-14 pr-8 py-3 sm:py-1.5 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary"
                            style={{ paddingLeft: '60px' }}
                            placeholder="Search by team name, arena, or date..."
                          />
                          {searchTerm && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm('');
                                setSelectedGameId('');
                                setSelectedGameName('');
                                setValue('gameId', '');
                                setSearchResults([]);
                                setShowSearchResults(false);
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-theme-muted hover:text-theme-secondary w-6 h-6 min-w-6 max-w-6 min-h-6 max-h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              aria-label="Clear search"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
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
                            className="w-full px-2 py-3 sm:py-1.5 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary"
                          >
                            <option value="latest">
                              {`${LATEST_SEASON}-${LATEST_SEASON + 1} Season (Latest)`}
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
                          <div className="absolute z-50 w-full mt-1 bg-surface-popover border border-theme-primary rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {/* Loading state */}
                            {searchLoading && (
                              <div className="p-3 text-center text-theme-muted text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-theme-muted border-t-brand-primary rounded-full animate-spin" />
                                  <p>Searching for games...</p>
                                </div>
                              </div>
                            )}

                            {searchError && (
                              <div className="p-3 text-center text-semantic-error text-sm">
                                <p>Error: {searchError}</p>
                              </div>
                            )}

                            {!searchLoading &&
                              !searchError &&
                              searchResults.length === 0 &&
                              searchTerm.trim() && (
                                <div className="p-3 text-center text-theme-muted text-sm">
                                  <p>No games found matching your search.</p>
                                  <p className="text-xs mt-1">Try a different search term.</p>
                                </div>
                              )}

                            {!searchLoading && !searchError && searchResults.length > 0 && (
                              <div className="py-1 search-results">
                                {/* Debug: Rendering search results */}
                                {searchResults.map(game => (
                                  <div
                                    key={game.id}
                                    onClick={() => handleGameSelect(game.id.toString(), game.name)}
                                    className="px-3 py-2 hover:bg-bg-theme-secondary cursor-pointer border-b border-theme-primary last:border-b-0"
                                  >
                                    <div className="font-medium text-theme-primary text-sm mb-0.5">
                                      {game.name}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-black">
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
                                  <div className="px-3 py-2 text-xs text-theme-muted border-t border-theme-primary">
                                    Showing {searchResults.length} result
                                    {searchResults.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            )}

                            {!searchLoading &&
                              !searchError &&
                              searchTerm.trim().length > 0 &&
                              searchTerm.trim().length < 3 && (
                                <div className="p-3 text-center text-neutral-600 text-sm">
                                  <p>Type at least 3 characters to search...</p>
                                  <p className="text-xs mt-1">
                                    Current: {searchTerm.trim().length}/3 characters
                                  </p>
                                </div>
                              )}

                            {!searchLoading && !searchError && !searchTerm.trim() && (
                              <div className="p-3 text-center text-neutral-600 text-sm">
                                <p>Type at least 3 characters to search for games...</p>
                                <p className="text-xs mt-1">Search by team name, arena, or date</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {mode === 'create' && 'gameId' in errors && errors.gameId && (
                      <p className="text-semantic-error text-sm mt-1">
                        {(errors.gameId as { message?: string })?.message}
                      </p>
                    )}
                    {mode === 'create' &&
                      !selectedGameId &&
                      searchTerm.trim().length >= 3 &&
                      !searchLoading &&
                      searchResults.length > 0 && (
                        <p className="text-semantic-warning text-sm mt-1">
                          Please select a game from the results above to continue.
                        </p>
                      )}
                    {mode === 'create' &&
                      !selectedGameId &&
                      searchTerm.trim().length >= 3 &&
                      !searchLoading &&
                      searchResults.length === 0 &&
                      !searchError && (
                        <p className="text-theme-muted text-sm mt-1">
                          No games found. Try a different search term or select a different season.
                        </p>
                      )}
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">
                    Rating *
                  </label>
                  <div className="flex items-center gap-1 rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${star <= rating ? 'star-selected' : 'star-unselected'}`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 text-sm text-theme-muted">({rating}/5)</span>
                  </div>
                  <input type="hidden" {...register('rating_for_game')} value={rating} />
                  {errors.rating_for_game && (
                    <p className="text-semantic-error text-xs">{errors.rating_for_game.message}</p>
                  )}
                </div>

                {/* Privacy Level */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">
                    Privacy Level *
                  </label>
                  <select
                    {...register('classification')}
                    className="w-full px-2 py-1.5 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary"
                  >
                    <option value={CLASSIFICATION.PRIVATE}>Private (Only you)</option>
                    <option value={CLASSIFICATION.PROTECTED}>Protected (Friends only)</option>
                    <option value={CLASSIFICATION.PUBLIC}>Public (Everyone)</option>
                  </select>
                  {errors.classification && (
                    <p className="text-semantic-error text-xs mt-1">
                      {errors.classification.message}
                    </p>
                  )}
                </div>

                {/* Watched Date */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">
                    Watched Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('watched_date')}
                      className="w-full px-2 py-3 sm:py-1.5 pr-8 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary [&::-webkit-calendar-picker-indicator]:opacity-0"
                      id="watched-date-input"
                    />
                    <div
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer hover:bg-bg-theme-secondary rounded transition-colors"
                      onClick={() => {
                        const input = document.getElementById(
                          'watched-date-input'
                        ) as HTMLInputElement;
                        if (input) {
                          if (isDatePickerOpen) {
                            // Close the date picker by blurring the input
                            input.blur();
                            setIsDatePickerOpen(false);
                          } else {
                            // Open the date picker
                            input.focus();
                            if (typeof input.showPicker === 'function') {
                              input.showPicker();
                            } else {
                              input.click();
                            }
                            setIsDatePickerOpen(true);
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
                  <label className="block text-sm font-medium text-theme-primary mb-1">
                    How did you watch?
                  </label>
                  <select
                    {...register('watched_setting')}
                    className="w-full px-2 py-1.5 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary"
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
                  <label className="block text-sm font-medium text-theme-primary mb-1">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    {...register('watched_location')}
                    className="w-full px-2 py-1.5 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary"
                    placeholder="e.g., Home, Arena, Bar"
                  />
                </div>

                {/* Watched Scope */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">
                    What did you watch?
                  </label>
                  <select
                    {...register('watched_scope')}
                    className="w-full px-2 py-1.5 border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm bg-surface-card text-theme-primary"
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
                <div className="border border-theme-primary rounded-lg overflow-hidden bg-bg-theme-secondary">
                  <button
                    type="button"
                    onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-theme-primary hover:bg-bg-theme-tertiary transition-colors"
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
                      className="w-full px-4 py-3 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm resize-none text-theme-primary placeholder:text-theme-muted"
                      placeholder="Share your thoughts about this game..."
                    />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Tags</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap items-center gap-2 p-3 border border-theme-primary rounded-lg bg-bg-theme-secondary min-h-[44px] flex-1">
                        {(() => {
                          const tagColors = generateDistinctTagColors(tags);
                          return tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 border ${tagColors[tag]}`}
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-white hover:text-semantic-error/80 transition-colors"
                              >
                                <X className="w-2 h-2" />
                              </button>
                            </span>
                          ));
                        })()}
                        <input
                          type="text"
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 min-w-[120px] border-none outline-none bg-transparent placeholder:text-theme-muted text-sm text-theme-primary"
                          placeholder={tags.length === 0 ? 'Type a tag and press Enter' : ''}
                        />
                      </div>
                      {newTag.trim() && (
                        <Button
                          type="button"
                          onClick={handleAddTag}
                          size="sm"
                          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium shadow-sm text-xs whitespace-nowrap transition-all duration-200"
                        >
                          Add Tag
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-4">&nbsp;</div>
            </div>

            {/* Submit Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-theme-primary bg-inherit p-3 sm:p-4 md:p-6 sticky bottom-0 z-10">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || loading}
                  className="flex-1 h-11 border-theme-primary bg-bg-theme-secondary text-theme-primary hover:bg-bg-theme-tertiary font-medium transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading || !isFormValid || !isUserAuthenticated}
                  className="flex-1 h-11 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
            </div>
          </form>
        </Card>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
