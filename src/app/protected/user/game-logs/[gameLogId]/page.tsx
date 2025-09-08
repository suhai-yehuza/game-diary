'use client';

import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  Tag,
  Edit,
  Eye,
  Users,
  Trophy,
  Lock,
  Shield,
  AlertTriangle,
  MessageCircle,
  ChevronRight,
  Home,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
// import { toast } from 'sonner';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { ReactionPicker } from '@/app/components/reactions';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { getButtonVariant } from '@/lib/design-tokens/button-variants';
import { useGetGameLogQuery, ParentType } from '@/types';
import type { IGameLog, IGameLogDetailPageProps, GetGameLogQuery } from '@/types';

// import { errorHandlers } from '@/lib/utils/error-handler';

// Interface moved to src/lib/types/page.types.ts

// Utility function to generate distinct colors for tags
const getTagColor = (tag: string) => {
  const colors = [
    // Emerald - green
    'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700',
    // Blue
    'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100 border-blue-300 dark:border-blue-700',
    // Orange
    'bg-orange-100 text-orange-900 dark:bg-orange-900/60 dark:text-orange-100 border-orange-300 dark:border-orange-700',
    // Purple
    'bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100 border-purple-300 dark:border-purple-700',
    // Red
    'bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100 border-red-300 dark:border-red-700',
    // Teal
    'bg-teal-100 text-teal-900 dark:bg-teal-900/60 dark:text-teal-100 border-teal-300 dark:border-teal-700',
    // Indigo
    'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-100 border-indigo-300 dark:border-indigo-700',
    // Amber
    'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100 border-amber-300 dark:border-amber-700',
  ];

  // Use tag hash for consistent colors
  const hash = tag.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export default function GameLogDetailPage({ params }: IGameLogDetailPageProps) {
  const [isClient, setIsClient] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editingGameLog, setEditingGameLog] = useState<GetGameLogQuery['gameLog'] | null>(null);

  const { handleParamsResolution: _handleParamsResolution } = useCentralizedErrorHandler({
    context: { component: 'GameLogDetailPage', action: 'Load game log params' },
  });

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle case where Clerk is not configured (e.g., during SSR or in test environment)
  const { user, isLoaded, isSignedIn } = useUser();

  // Use params directly since it's already resolved
  const resolvedParams = params;

  // Calculate query variables and skip condition using useMemo for reactive updates
  const queryVariables = useMemo(() => {
    if (resolvedParams?.gameLogId) {
      // Allow queries if signed in OR if we're loaded and have a user
      // This handles the case where authentication state is temporarily inconsistent
      if (isSignedIn || (isLoaded && user)) {
        return { id: resolvedParams.gameLogId };
      }
    }
    return undefined;
  }, [resolvedParams?.gameLogId, isSignedIn, isLoaded, user]);

  const shouldSkip = useMemo(() => {
    // Skip if we don't have gameLogId or if we're still loading auth state
    // But allow queries if we have gameLogId and auth is loaded (even if temporarily inconsistent)
    if (!resolvedParams?.gameLogId) return true;
    if (!isLoaded) return true;

    // If loaded and we have explicit sign-in status, use it
    if (isLoaded && isSignedIn) return false;

    // If we're in development and have a gameLogId, allow the query to try
    // This handles temporary auth state mismatches
    if (process.env.NODE_ENV === 'development') return false;

    // In production, require explicit authentication
    return !isSignedIn;
  }, [resolvedParams?.gameLogId, isSignedIn, isLoaded]);

  const { data, loading, error, refetch } = useGetGameLogQuery({
    variables: queryVariables,
    skip: shouldSkip,
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  const gameLog = data?.gameLog;

  // Don't render anything until we're on the client side and Clerk is loaded
  if (!isClient || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Check if user is signed in (skip this check in development if we have a gameLogId)
  if (!isSignedIn && !(process.env.NODE_ENV === 'development' && resolvedParams?.gameLogId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/protected/user">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-900 dark:text-red-100">
                    Authentication Required
                  </CardTitle>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    You need to be signed in to view this game log
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Sign In Required</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                    Please sign in to access this game log.
                  </p>
                  <div className="mt-3">
                    <Link href="/sign-in">
                      <Button size="sm" variant="default" className={getButtonVariant('primary')}>
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Check for permission errors
  const isPermissionError = error?.graphQLErrors?.some(
    err =>
      err.message === 'Access denied to this game log' || err.message === 'Authentication required'
  );

  // Handle permission errors
  if (isPermissionError) {
    const isAuthError = error?.graphQLErrors?.some(
      err => err.message === 'Authentication required'
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/protected/user">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Permission Error Card */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-900 dark:text-red-100">
                    Access Denied
                  </CardTitle>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    You don&apos;t have permission to view this game log
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isAuthError ? (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Sign In Required
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                        You need to be signed in to view this game log. Please sign in and try
                        again.
                      </p>
                      <div className="mt-3">
                        <Link href="/sign-in">
                          <Button
                            size="sm"
                            variant="default"
                            className={getButtonVariant('primary')}
                          >
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                          Protected Content
                        </h4>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                          This game log is set to &quot;Protected&quot; and can only be viewed by
                          friends of the owner.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Lock className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-100">
                          Private Content
                        </h4>
                        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                          This game log is set to &quot;Private&quot; and can only be viewed by the
                          owner.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If you believe you should have access to this content, please contact the game
                    log owner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !gameLog) {
    // If there's a specific error, show it instead of notFound
    if (error) {
      console.error('GraphQL Error Details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo,
      });

      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link href="/protected/user">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-red-900 dark:text-red-100">
                  GraphQL Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Error Message:</h4>
                    <p className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {error.message}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Debug Info:</h4>
                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                      {JSON.stringify(
                        {
                          gameLogId: resolvedParams?.gameLogId,
                          isSignedIn,
                          userId: user?.id,
                          queryVariables,
                          shouldSkip,
                          hasData: !!data,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <details>
                    <summary className="cursor-pointer font-medium">Full Error Details</summary>
                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto mt-2">
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // If we're still loading params or authentication, show loading
    // In development, only require gameLogId to be loaded
    const stillLoading =
      process.env.NODE_ENV === 'development'
        ? !resolvedParams?.gameLogId
        : !resolvedParams?.gameLogId || !isSignedIn || !isLoaded;

    if (stillLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
            </div>
          </div>
        </div>
      );
    }

    return notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getStatusBgColor = (status: string | null | undefined): string => {
    if (!status || typeof status !== 'string') {
      return '#4B5563'; // gray-600
    }

    switch (status.toLowerCase()) {
      case 'ft':
      case 'finished':
        return '#15803D'; // green-700
      case 'live':
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
      case 'ot':
        return '#B91C1C'; // red-700
      case 'scheduled':
      case 'ns':
        return '#1D4ED8'; // blue-700
      case 'cancelled':
      case 'postponed':
        return '#C2410C'; // orange-700
      default:
        return '#4B5563'; // gray-600
    }
  };

  const getClassificationBgColor = (classification: string): string => {
    switch (classification.toLowerCase()) {
      case 'public':
        return '#059669'; // emerald-600
      case 'protected':
        return '#D97706'; // amber-600
      case 'private':
        return '#DC2626'; // red-600
      default:
        return '#475569'; // slate-600
    }
  };

  const getDisplayStatus = (
    game:
      | {
          status?: string;
          date?: string;
          scores?: {
            home?: { points?: number | null };
            visitors?: { points?: number | null };
          } | null;
        }
      | null
      | undefined
  ): string => {
    if (!game?.status) return 'Unknown';

    const status = game.status;
    const gameDate = new Date(game.date || '1970-01-01'); // use a default value of 0 epoch time
    const now = new Date();

    // If the game has scores, it's finished regardless of status
    if (
      game.scores?.home?.points !== null &&
      game.scores?.visitors?.points !== null &&
      game.scores?.home?.points !== undefined &&
      game.scores?.visitors?.points !== undefined
    ) {
      return 'FINISHED';
    }

    // Check if it's a past scheduled game (should be finished or cancelled)
    const isPastScheduled =
      (status.toLowerCase() === 'scheduled' || status.toLowerCase() === 'ns') && gameDate < now;

    if (isPastScheduled) {
      // If it was in the past and has no scores, it was likely cancelled
      return 'CANCELLED';
    }

    return status;
  };

  const getWinner = () => {
    const scores = gameLog.game?.scores;
    if (!scores?.home?.points || !scores?.visitors?.points) return null;

    const homeScore = scores.home.points;
    const awayScore = scores.visitors.points;

    if (homeScore > awayScore) return 'home';
    if (awayScore > homeScore) return 'away';
    return 'tie';
  };

  const winner = getWinner();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-center">
              <Link
                href="/protected/user"
                className="flex items-center gap-1 hover:text-brand-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="flex items-center">
              <Link href="/protected/user" className="hover:text-brand-primary transition-colors">
                Game Logs
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="text-neutral-900 dark:text-neutral-100 font-medium" aria-current="page">
              {gameLog.game?.teams?.visitors?.nickname || 'Away'} @{' '}
              {gameLog.game?.teams?.home?.nickname || 'Home'}
            </li>
          </ol>
        </nav>

        {/* Header with Back Button and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/protected/user">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          {user && gameLog.user?.id === user.id && (
            <Button
              onClick={() => setEditingGameLog(gameLog)}
              size="sm"
              variant="default"
              className={`flex items-center gap-2 ${getButtonVariant('primary')}`}
            >
              <Edit className="w-4 h-4" />
              Edit Game Log
            </Button>
          )}
        </div>

        {/* Game Log Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {gameLog.game?.teams?.visitors?.name} @ {gameLog.game?.teams?.home?.name}
                </CardTitle>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Game Log by @
                  {gameLog.user?.first_name || gameLog.user?.username || 'Unknown User'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full inline-block"
                  style={{
                    backgroundColor: getStatusBgColor(getDisplayStatus(gameLog.game)),
                    color: '#ffffff',
                    border: `1px solid ${getStatusBgColor(getDisplayStatus(gameLog.game))}`,
                    fontWeight: '600',
                  }}
                >
                  {getDisplayStatus(gameLog.game)}
                </span>
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full inline-block"
                  style={{
                    backgroundColor: getClassificationBgColor(gameLog.classification),
                    color: '#ffffff',
                    border: `1px solid ${getClassificationBgColor(gameLog.classification)}`,
                    fontWeight: '600',
                  }}
                >
                  {gameLog.classification}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {gameLog.game?.date ? formatDate(gameLog.game.date) : 'Unknown Date'}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {gameLog.watched_date ? formatTime(gameLog.watched_date) : 'Unknown Time'}
              </div>
              {gameLog.watched_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {gameLog.watched_location}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Score Display */}
        {gameLog.game && (
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Away Team */}
                <div
                  className={`text-center p-6 rounded-lg border-2 ${
                    winner === 'away'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="mb-4">
                    {gameLog.game?.teams?.visitors?.logo && (
                      <Image
                        src={gameLog.game?.teams?.visitors?.logo}
                        alt={`${gameLog.game?.teams?.visitors?.name} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                    )}
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {gameLog.game?.teams?.visitors?.name}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {gameLog.game?.teams?.visitors?.nickname}
                    </p>
                  </div>
                  <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                    {gameLog.game?.scores?.visitors?.points ?? '-'}
                  </div>
                  {winner === 'away' && (
                    <div className="mt-2">
                      <Trophy className="w-5 h-5 text-green-600 mx-auto" />
                    </div>
                  )}
                </div>

                {/* Home Team */}
                <div
                  className={`text-center p-6 rounded-lg border-2 ${
                    winner === 'home'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="mb-4">
                    {gameLog.game?.teams?.home?.logo && (
                      <Image
                        src={gameLog.game?.teams?.home?.logo}
                        alt={`${gameLog.game?.teams?.home?.name} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 mx-auto mb-2"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    )}
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {gameLog.game?.teams?.home?.name}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {gameLog.game?.teams?.home?.nickname}
                    </p>
                  </div>
                  <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                    {gameLog.game?.scores?.home?.points ?? '-'}
                  </div>
                  {winner === 'home' && (
                    <div className="mt-2">
                      <Trophy className="w-5 h-5 text-green-600 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User's Rating and Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {gameLog.rating_for_game}/5
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= gameLog.rating_for_game
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Watching Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                Watching Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Setting:
                  </span>
                  <p className="text-neutral-900 dark:text-neutral-100 capitalize">
                    {gameLog.watched_setting?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Scope:
                  </span>
                  <p className="text-neutral-900 dark:text-neutral-100 capitalize">
                    {gameLog.watched_scope?.replace('_', ' ')}
                  </p>
                </div>
                {gameLog.watched_location && (
                  <div>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Location:
                    </span>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {gameLog.watched_location}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {gameLog.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                {gameLog.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {gameLog.tags && gameLog.tags.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {gameLog.tags.map(tag => (
                  <Badge key={`tag-${tag}`} variant="secondary" className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Interactions Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Reactions & Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Reactions */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                React to this Game Log
              </h4>
              <ReactionPicker
                targetId={gameLog.id}
                targetType={ParentType.GameLog}
                size="lg"
                showCount={true}
                onReactionSelect={(emoji: string) => {
                  // Handle reaction selection
                  console.log('Reaction selected:', emoji);
                }}
              />
            </div>

            {/* Comments Toggle */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <button
                onClick={() => setShowComments(!showComments)}
                className="w-full flex items-center justify-between text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                aria-expanded={showComments}
                aria-controls="game-log-comments"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-lg font-semibold">
                    Comments{' '}
                    {gameLog.totalCommentCount && gameLog.totalCommentCount > 0
                      ? `(${gameLog.totalCommentCount})`
                      : ''}
                  </span>
                </div>
                <div className="text-sm">{showComments ? 'Hide' : 'Show'} Comments</div>
              </button>

              {/* Comments Section */}
              {showComments && (
                <div id="game-log-comments" className="mt-4">
                  <GameLogComments
                    gameLog={gameLog as unknown as IGameLog}
                    showComments={showComments}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Created:</span>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {gameLog.created_at ? formatDate(gameLog.created_at) : 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Last Updated:</span>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {gameLog.updated_at ? formatDate(gameLog.updated_at) : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Game Log Modal */}
        {editingGameLog && isClient && (
          <EditGameLogModal
            gameLog={editingGameLog as unknown as IGameLog}
            isOpen={!!editingGameLog}
            onClose={() => setEditingGameLog(null)}
            onSuccess={() => {
              setEditingGameLog(null);
              void refetch();
            }}
          />
        )}
      </div>
    </div>
  );
}
