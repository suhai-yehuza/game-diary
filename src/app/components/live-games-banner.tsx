import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef, useCallback } from 'react';

import { useLiveGames } from '@/hooks/use-live-games';

// NBA team color palette (add more as needed)
const NBA_TEAM_COLORS: Record<string, string> = {
  BOS: '#007A33', // Celtics
  LAL: '#552583', // Lakers
  NYK: '#006BB6', // Knicks
  GSW: '#1D428A', // Warriors
  MIA: '#98002E', // Heat
  PHI: '#006BB6', // 76ers
  CHI: '#CE1141', // Bulls
  BKN: '#000000', // Nets
  MIL: '#00471B', // Bucks
  DAL: '#00538C', // Mavericks
  DEN: '#0E2240', // Nuggets
  LAC: '#C8102E', // Clippers
  TOR: '#CE1141', // Raptors
  ATL: '#E03A3E', // Hawks
  // ... add more as needed
};

// Helper to check if a hex color is 'red-ish' (hue between 330-30 degrees)
function isRedish(hex: string) {
  // Remove # if present
  hex = hex.replace('#', '');
  // Expand short form
  if (hex.length === 3)
    hex = hex
      .split('')
      .map(x => x + x)
      .join('');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Convert to HSL
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  let h = 0;
  if (max === min) {
    h = 0;
  } else {
    const d = max - min;
    switch (max) {
      case r / 255:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g / 255:
        h = (b - r) / d + 2;
        break;
      case b / 255:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  // Red-ish if hue is between 330-360 or 0-30
  return h >= 330 || h <= 30;
}

// Viewport breakpoints for responsive behavior
const VIEWPORT_BREAKPOINTS = {
  xs: 480, // Extra small phones
  sm: 640, // Small phones
  md: 768, // Tablets
  lg: 1024, // Small laptops
  xl: 1280, // Large laptops
  '2xl': 1536, // Desktop
} as const;

// Get current viewport size
function useViewport() {
  const [viewport, setViewport] = useState({
    width: 1024, // Default fallback
    height: 768, // Default fallback
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...viewport, mounted };
}

// Get responsive configuration based on viewport
function getResponsiveConfig(width: number) {
  if (width < VIEWPORT_BREAKPOINTS.xs) {
    return {
      cardWidth: 100,
      cardGap: 8,
      showArrows: false,
      showTooltips: false,
      badgeSize: 'sm',
      animationSpeed: 20,
      maxVisibleCards: 2,
      compactMode: true,
    };
  } else if (width < VIEWPORT_BREAKPOINTS.sm) {
    return {
      cardWidth: 120,
      cardGap: 12,
      showArrows: false,
      showTooltips: false,
      badgeSize: 'sm',
      animationSpeed: 25,
      maxVisibleCards: 3,
      compactMode: true,
    };
  } else if (width < VIEWPORT_BREAKPOINTS.md) {
    return {
      cardWidth: 140,
      cardGap: 16,
      showArrows: true,
      showTooltips: false,
      badgeSize: 'md',
      animationSpeed: 30,
      maxVisibleCards: 4,
      compactMode: false,
    };
  } else if (width < VIEWPORT_BREAKPOINTS.lg) {
    return {
      cardWidth: 160,
      cardGap: 20,
      showArrows: true,
      showTooltips: true,
      badgeSize: 'md',
      animationSpeed: 35,
      maxVisibleCards: 5,
      compactMode: false,
    };
  } else if (width < VIEWPORT_BREAKPOINTS.xl) {
    return {
      cardWidth: 180,
      cardGap: 24,
      showArrows: true,
      showTooltips: true,
      badgeSize: 'lg',
      animationSpeed: 40,
      maxVisibleCards: 6,
      compactMode: false,
    };
  } else {
    return {
      cardWidth: 200,
      cardGap: 28,
      showArrows: true,
      showTooltips: true,
      badgeSize: 'lg',
      animationSpeed: 45,
      maxVisibleCards: 7,
      compactMode: false,
    };
  }
}

function BasketballIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 200 200" aria-label="Basketball" className="mr-1">
      <circle cx="100" cy="100" r="20" fill="url(#orange-gradient)" />
      <path d="M80 100 L120 100" stroke="#fff" strokeWidth="1.5" />
      <path d="M100 80 L100 120" stroke="#fff" strokeWidth="1.5" />
      <path d="M85 85 L115 115" stroke="#fff" strokeWidth="1.5" />
      <path d="M85 115 L115 85" stroke="#fff" strokeWidth="1.5" />
      <defs>
        <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SportIcon({ league }: { league: string }) {
  // Add more league/sport icons as needed
  if (
    league &&
    (league.toLowerCase().includes('nba') || league.toLowerCase().includes('basketball'))
  ) {
    return <BasketballIcon />;
  }
  // Placeholder for other sports
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-label="Sport" className="mr-1 opacity-60">
      <circle cx="10" cy="10" r="8" fill="#d1d5db" />
      <text x="10" y="15" textAnchor="middle" fontSize="10" fill="#6b7280">
        ?
      </text>
    </svg>
  );
}

export function LiveGamesBanner() {
  // The useLiveGames hook automatically returns mock data in test environments
  const { games } = useLiveGames();
  const tickerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Get viewport dimensions
  const { width, mounted } = useViewport();
  const responsiveConfig = getResponsiveConfig(width);

  // Track previous scores for animation
  const [prevScores, setPrevScores] = useState<Record<string, { home: number; visitors: number }>>(
    {}
  );
  const [scorePulse, setScorePulse] = useState<
    Record<string, { home: boolean; visitors: boolean }>
  >({});

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // Don't process if there are no games
    if (!games || games.length === 0) {
      return;
    }

    const newPulse: Record<string, { home: boolean; visitors: boolean }> = {};
    const newScores: Record<string, { home: number; visitors: number }> = {};
    games.forEach(game => {
      const prev = prevScores[game.id] || {
        home: game.scores.home.points,
        visitors: game.scores.visitors.points,
      };
      newScores[game.id] = { home: game.scores.home.points, visitors: game.scores.visitors.points };
      newPulse[game.id] = {
        home: prev.home !== game.scores.home.points,
        visitors: prev.visitors !== game.scores.visitors.points,
      };
    });
    setScorePulse(newPulse);
    setPrevScores(newScores);
    // Remove pulse after animation
    const timeout = setTimeout(() => {
      setScorePulse({});
    }, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games]);

  useEffect(() => {
    if (isPaused && tickerRef.current) {
      tickerRef.current.style.transform = 'none';
    }
  }, [isPaused]);

  // Manual scroll handlers with responsive scroll amount
  const scrollTicker = useCallback(
    (dir: 'left' | 'right') => {
      setIsPaused(true); // Pause animation on manual scroll
      if (tickerRef.current) {
        const scrollAmount = responsiveConfig.cardWidth + responsiveConfig.cardGap;
        tickerRef.current.scrollBy({
          left: dir === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    },
    [responsiveConfig.cardWidth, responsiveConfig.cardGap]
  );

  // Render fallback during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white shadow-md overflow-hidden py-1 px-0"
        data-testid="live-games-banner"
      >
        <div className="flex items-center w-full px-2 min-h-0 group">
          {/* Left: LIVE badge and count */}
          <div className="flex-1 flex justify-end items-center z-30 shadow-xl h-12 px-2 sm:px-6 py-2">
            <span className="flex items-center text-base gap-x-4">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-live-dot-glow drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] border-2 border-white" />
              <span className="text-white drop-shadow-sm">
                {games?.length || 0} Live {(games?.length || 0) === 1 ? 'Game' : 'Games'}
              </span>
            </span>
          </div>

          {/* Ticker: horizontally scrollable games, masked and centered */}
          <div className="flex-[8] relative overflow-hidden w-full min-h-0 px-2 sm:px-4">
            {/* Left floating navigation */}
            <button
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all p-2 mx-2 bg-transparent group"
              aria-label="Scroll left"
            >
              <span className="text-base font-bold text-white group-hover:text-gray-200 group-focus:text-gray-200 transition-colors">
                «
              </span>
            </button>
            {/* Right floating navigation */}
            <button
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all p-2 mx-2 bg-transparent group"
              aria-label="Scroll right"
            >
              <span className="text-base font-bold text-white group-hover:text-gray-200 group-focus:text-gray-200 transition-colors">
                »
              </span>
            </button>
            {/* Gradient fade left */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-red-900/100 to-transparent z-30" />
            {/* Gradient fade right */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-red-900/100 to-transparent z-30" />

            <div className="flex gap-2 sm:gap-4 items-center min-w-max z-10 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {games?.map((game, _idx) => {
                const teamColor = NBA_TEAM_COLORS[game.teams.home.code] ?? '#444';
                const cardBg = isRedish(teamColor) ? '#444' : teamColor;
                return (
                  <div
                    key={game.id}
                    style={{
                      background: cardBg,
                    }}
                    className="relative flex items-center px-2 sm:px-3 py-1 cursor-pointer gap-1 sm:gap-2 min-w-[120px] sm:min-w-[180px] group text-base h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 overflow-hidden"
                    tabIndex={0}
                    aria-label={`${game.teams.visitors.code} ${game.scores.visitors.points}, ${game.teams.home.code} ${game.scores.home.points}, ${game.status.clock ?? (game.status.halftime ? 'HALFTIME' : '')}`}
                  >
                    <>
                      <SportIcon league={game.league} />
                      <span className="flex items-center gap-1 text-base font-semibold text-white truncate">
                        <Image
                          src={game.teams.visitors.logo ?? '/logos/default-team-logo.svg'}
                          alt={game.teams.visitors.code}
                          width={22}
                          height={22}
                          className="w-5 h-5 object-contain"
                        />
                        {game.teams.visitors.code}
                        <span className="font-bold text-white">{game.scores.visitors.points}</span>
                        <span className="mx-1 text-xs opacity-60">-</span>
                        <span className="font-bold text-white">{game.scores.home.points}</span>
                        {game.teams.home.code}
                        <Image
                          src={game.teams.home.logo ?? '/logos/default-team-logo.svg'}
                          alt={game.teams.home.code}
                          width={22}
                          height={22}
                          className="w-5 h-5 object-contain"
                        />
                      </span>
                      <span className="ml-2 text-xs text-yellow-200 font-mono truncate">
                        {game.status.clock ?? (game.status.halftime ? 'HALFTIME' : '')}
                      </span>
                      <span className="ml-2 text-xs text-white/80 truncate">{game.league}</span>
                    </>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: View All button */}
          <div className="flex-1 flex justify-end items-center min-w-fit mr-2 sm:mr-4">
            <Link
              href="/sports/live"
              className="flex items-center gap-2 text-base font-semibold bg-gray-100 text-gray-800 rounded-xl px-2 sm:px-6 py-1.5 shadow-md hover:bg-gray-300 hover:text-gray-900 focus:bg-gray-400 focus:text-gray-900 transition-all border border-gray-200 focus:ring-2 focus:ring-gray-400"
            >
              View All
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Don't render banner if there are no live games (only after mounting)
  if (!games || games.length === 0) {
    return null;
  }

  // Tooltip handlers
  const showTooltip = (idx: number) => {
    if (responsiveConfig.showTooltips && !isTouchDevice) {
      setTooltipIdx(idx);
    }
  };
  const hideTooltip = () => setTooltipIdx(null);

  // Get badge size classes
  const getBadgeSizeClasses = () => {
    switch (responsiveConfig.badgeSize) {
      case 'sm':
        return 'text-sm gap-x-3';
      case 'md':
        return 'text-base gap-x-4';
      case 'lg':
        return 'text-lg gap-x-6';
      default:
        return 'text-base gap-x-4';
    }
  };

  // Get card size classes
  const getCardSizeClasses = () => {
    const baseClasses =
      'relative flex items-center cursor-pointer gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 overflow-hidden';

    if (responsiveConfig.compactMode) {
      return `${baseClasses} px-2 py-1 min-w-[${responsiveConfig.cardWidth}px] h-8 text-sm`;
    } else {
      return `${baseClasses} px-2 sm:px-3 py-1 min-w-[${responsiveConfig.cardWidth}px] h-10 text-base`;
    }
  };

  return (
    <>
      <div
        className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white shadow-md overflow-hidden py-1 px-0"
        data-testid="live-games-banner"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full px-2 min-h-0 group gap-2 sm:gap-0">
          {/* Left: LIVE badge and count */}
          <div
            ref={badgeRef}
            className="flex-1 flex justify-center sm:justify-end items-center z-30 shadow-xl h-12 px-2 sm:px-6 py-2"
          >
            <span className={`flex items-center ${getBadgeSizeClasses()}`}>
              <span
                className="w-3 h-3 bg-red-500 rounded-full animate-live-dot-glow drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] border-2 border-white"
                data-testid="live-indicator"
              />
              <span className="text-white drop-shadow-sm">
                {games.length} Live {games.length === 1 ? 'Game' : 'Games'}
              </span>
            </span>
          </div>

          {/* Ticker: horizontally scrollable games, masked and centered */}
          <div className="flex-[8] relative overflow-hidden w-full min-h-0 px-2 sm:px-4 order-2 sm:order-none">
            {/* Left floating navigation */}
            {responsiveConfig.showArrows && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all p-2 mx-2 bg-transparent group"
                aria-label="Scroll left"
                onClick={() => scrollTicker('left')}
              >
                <span className="text-base font-bold text-white group-hover:text-gray-200 group-focus:text-gray-200 transition-colors">
                  «
                </span>
              </button>
            )}

            {/* Right floating navigation */}
            {responsiveConfig.showArrows && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all p-2 mx-2 bg-transparent group"
                aria-label="Scroll right"
                onClick={() => scrollTicker('right')}
              >
                <span className="text-base font-bold text-white group-hover:text-gray-200 group-focus:text-gray-200 transition-colors">
                  »
                </span>
              </button>
            )}

            {/* Gradient fade left */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-red-900/100 to-transparent z-30" />
            {/* Gradient fade right */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-red-900/100 to-transparent z-30" />

            <div
              ref={tickerRef}
              className={`flex items-center space-x-4 min-w-max z-10 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent${!isPaused ? ' animate-marquee' : ''}`}
              onMouseEnter={() => !isTouchDevice && setIsPaused(true)}
              onMouseLeave={() => !isTouchDevice && setIsPaused(false)}
              style={{
                gap: `${responsiveConfig.cardGap}px`,
                scrollBehavior: 'smooth',
                ...(isPaused && { transform: 'none' }),
              }}
            >
              {games.map((game, idx) => {
                const teamColor = NBA_TEAM_COLORS[game.teams.home.code] ?? '#444';
                const cardBg = isRedish(teamColor) ? '#444' : teamColor;
                return (
                  <div
                    key={game.id}
                    style={{
                      background: cardBg,
                      minWidth: `${responsiveConfig.cardWidth}px`,
                    }}
                    className={getCardSizeClasses()}
                    tabIndex={0}
                    aria-label={`${game.teams.visitors.code} ${game.scores.visitors.points}, ${game.teams.home.code} ${game.scores.home.points}, ${game.status.clock ?? (game.status.halftime ? 'HALFTIME' : '')}`}
                    onMouseEnter={() => showTooltip(idx)}
                    onMouseLeave={hideTooltip}
                    onTouchStart={() => showTooltip(idx)}
                    onTouchEnd={hideTooltip}
                  >
                    <>
                      <SportIcon league={game.league} />
                      <span className="flex items-center gap-1 font-semibold text-white truncate">
                        <Image
                          src={game.teams.visitors.logo ?? '/logos/default-team-logo.svg'}
                          alt={game.teams.visitors.code}
                          width={22}
                          height={22}
                          className="w-5 h-5 object-contain"
                        />
                        {game.teams.visitors.code}
                        <span
                          className={`font-bold text-white${scorePulse[game.id]?.visitors ? ' score-pulse' : ''}`}
                        >
                          {game.scores.visitors.points}
                        </span>
                        <span className="mx-1 text-xs opacity-60">-</span>
                        <span
                          className={`font-bold text-white${scorePulse[game.id]?.home ? ' score-pulse' : ''}`}
                        >
                          {game.scores.home.points}
                        </span>
                        {game.teams.home.code}
                        <Image
                          src={game.teams.home.logo ?? '/logos/default-team-logo.svg'}
                          alt={game.teams.home.code}
                          width={22}
                          height={22}
                          className="w-5 h-5 object-contain"
                        />
                      </span>
                      <span className="ml-2 text-xs text-yellow-200 font-mono truncate">
                        {game.status.clock ?? (game.status.halftime ? 'HALFTIME' : '')}
                      </span>
                      {!responsiveConfig.compactMode && (
                        <span className="ml-2 text-xs text-white/80 truncate">{game.league}</span>
                      )}
                      {/* Tooltip */}
                      {tooltipIdx === idx && responsiveConfig.showTooltips && (
                        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 bg-white/90 text-gray-900 rounded-lg shadow-lg p-3 text-xs font-medium backdrop-blur border border-gray-200 animate-fade-in">
                          <div className="mb-1 font-semibold text-sm text-gray-800">
                            {game.teams.visitors.name} @ {game.teams.home.name}
                          </div>
                          <div>
                            <span className="font-semibold">Period:</span>{' '}
                            {game.status.long ?? game.status.short}
                          </div>
                          <div>
                            <span className="font-semibold">Arena:</span> {game.arena.name},{' '}
                            {game.arena.city}
                          </div>
                          <div>
                            <span className="font-semibold">Time:</span>{' '}
                            {game.status.clock ?? (game.status.halftime ? 'HALFTIME' : 'N/A')}
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: View All button */}
          <div
            ref={viewAllRef}
            className="flex-1 flex justify-center sm:justify-end items-center min-w-fit mr-2 sm:mr-4 order-3 sm:order-none"
          >
            <Link
              href="/sports/live"
              className="flex items-center gap-2 text-base font-semibold bg-gray-100 text-gray-800 rounded-xl px-2 sm:px-6 py-1.5 shadow-md hover:bg-gray-300 hover:text-gray-900 focus:bg-gray-400 focus:text-gray-900 transition-all border border-gray-200 focus:ring-2 focus:ring-gray-400"
            >
              View All
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee ${responsiveConfig.animationSpeed}s linear infinite;
        }
        @keyframes score-pulse {
          0% { background: #fef08a; color: #b45309; }
          50% { background: #fde68a; color: #f59e42; }
          100% { background: transparent; color: inherit; }
        }
        .score-pulse {
          animation: score-pulse 0.6s;
          border-radius: 0.375rem;
          padding: 0 0.25rem;
        }
        @keyframes live-dot-glow {
          0%, 100% { box-shadow: 0 0 0 0 #f87171, 0 0 0 0 #fbbf24; }
          50% { box-shadow: 0 0 8px 4px #f87171, 0 0 16px 8px #fbbf24; }
        }
        .animate-live-dot-glow {
          animation: live-dot-glow 1.2s infinite;
        }
        .animate-fade-in { animation: fade-in 0.18s; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        /* Responsive scrollbar */
        @media (max-width: 640px) {
          .scrollbar-thin::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-thin {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .animate-marquee {
            animation-play-state: paused;
          }
        }
      `}</style>
    </>
  );
}
