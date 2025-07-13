import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';

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
  if (league.toLowerCase().includes('nba') || league.toLowerCase().includes('basketball')) {
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
  const { games } = useLiveGames();
  const tickerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);

  // Track previous scores for animation
  const [prevScores, setPrevScores] = useState<Record<string, { home: number; visitors: number }>>(
    {}
  );
  const [scorePulse, setScorePulse] = useState<
    Record<string, { home: boolean; visitors: boolean }>
  >({});

  useEffect(() => {
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

  // Manual scroll handlers

  // Manual scroll handlers
  const scrollTicker = (dir: 'left' | 'right') => {
    setIsPaused(true); // Pause animation on manual scroll
    if (tickerRef.current) {
      const amount = 220; // width of one card
      tickerRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // Tooltip handlers
  const showTooltip = (idx: number) => setTooltipIdx(idx);
  const hideTooltip = () => setTooltipIdx(null);

  return (
    <>
      <div
        className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white shadow-md overflow-hidden py-1 px-0"
        data-testid="live-games-banner"
      >
        <div className="flex items-center w-full px-2 min-h-0 group">
          {/* Left: LIVE badge and count */}
          <div
            ref={badgeRef}
            className="flex-1 flex justify-end items-center z-30 shadow-xl h-12 px-2 sm:px-6 py-2"
          >
            <span className="flex items-center gap-x-6">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-live-dot-glow drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] border-2 border-white" />
              <span className="text-lg text-white drop-shadow-sm">{games.length} Live Games</span>
            </span>
          </div>
          {/* Ticker: horizontally scrollable games, masked and centered */}
          <div className="flex-[8] relative overflow-hidden w-full min-h-0 px-2 sm:px-4">
            {/* Left floating navigation */}
            <button
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all p-2 mx-2 bg-transparent group"
              aria-label="Scroll left"
              onClick={() => scrollTicker('left')}
            >
              <span className="text-base font-bold text-white group-hover:text-gray-200 group-focus:text-gray-200 transition-colors">
                «
              </span>
            </button>
            {/* Right floating navigation */}
            <button
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 items-center justify-center transition-all p-2 mx-2 bg-transparent group"
              aria-label="Scroll right"
              onClick={() => scrollTicker('right')}
            >
              <span className="text-base font-bold text-white group-hover:text-gray-200 group-focus:text-gray-200 transition-colors">
                »
              </span>
            </button>
            {/* Gradient fade left */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-red-900/100 to-transparent z-30" />
            {/* Gradient fade right */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-red-900/100 to-transparent z-30" />
            <div
              ref={tickerRef}
              className={`flex gap-2 sm:gap-4 items-center min-w-max z-10 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent${!isPaused ? ' animate-marquee' : ''}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={
                isPaused
                  ? { transform: 'none', scrollBehavior: 'smooth' }
                  : { scrollBehavior: 'smooth' }
              }
            >
              {games.map((game, idx) => {
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
                    onMouseEnter={() => showTooltip(idx)}
                    onMouseLeave={hideTooltip}
                    onTouchStart={() => showTooltip(idx)}
                    onTouchEnd={hideTooltip}
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
                      <span className="ml-2 text-xs text-white/80 truncate">{game.league}</span>
                      {/* Tooltip */}
                      {tooltipIdx === idx && (
                        <div className="hidden sm:block absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 bg-white/90 text-gray-900 rounded-lg shadow-lg p-3 text-xs font-medium backdrop-blur border border-gray-200 animate-fade-in">
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
            className="flex-1 flex justify-end items-center min-w-fit mr-2 sm:mr-4"
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
          animation: marquee 30s linear infinite;
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
      `}</style>
    </>
  );
}
