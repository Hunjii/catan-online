'use client';

import React from 'react';
import Image from 'next/image';
import { GameState, PlayerColor, COLOR_MAP } from '@/lib/catan/types';
import { Star, Layers, Shield, Navigation } from 'lucide-react';

interface PlayerDashboardProps {
  gameState: GameState;
  currentUserId: string;
}

const PLAYER_THEMES: Record<
  PlayerColor,
  { gradient: string; border: string; activeGlow: string; ringColor: string }
> = {
  red: {
    gradient: 'bg-gradient-to-r from-red-950/90 via-red-900/80 to-black/80',
    border: 'border-red-600/90',
    activeGlow: 'ring-4 ring-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    ringColor: 'border-red-400',
  },
  blue: {
    gradient: 'bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-black/80',
    border: 'border-blue-600/90',
    activeGlow: 'ring-4 ring-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    ringColor: 'border-blue-400',
  },
  green: {
    gradient: 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-black/80',
    border: 'border-emerald-600/90',
    activeGlow: 'ring-4 ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    ringColor: 'border-emerald-400',
  },
  orange: {
    gradient: 'bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-black/80',
    border: 'border-amber-600/90',
    activeGlow: 'ring-4 ring-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    ringColor: 'border-amber-400',
  },
  yellow: {
    gradient: 'bg-gradient-to-r from-yellow-950/90 via-amber-900/80 to-black/80',
    border: 'border-yellow-500/90',
    activeGlow: 'ring-4 ring-yellow-400/60 shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    ringColor: 'border-yellow-400',
  },
  brown: {
    gradient: 'bg-gradient-to-r from-amber-950/90 via-stone-900/80 to-black/80',
    border: 'border-amber-800/90',
    activeGlow: 'ring-4 ring-amber-700/60 shadow-[0_0_20px_rgba(120,53,15,0.5)]',
    ringColor: 'border-amber-700',
  },
  purple: {
    gradient: 'bg-gradient-to-r from-purple-950/90 via-purple-900/80 to-black/80',
    border: 'border-purple-600/90',
    activeGlow: 'ring-4 ring-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    ringColor: 'border-purple-400',
  },
  white: {
    gradient: 'bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-black/80',
    border: 'border-slate-400/90',
    activeGlow: 'ring-4 ring-slate-300/60 shadow-[0_0_20px_rgba(248,250,252,0.5)]',
    ringColor: 'border-slate-300',
  },
};

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  gameState,
  currentUserId,
}) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];

  return (
    <div className="w-full flex flex-col gap-2.5 pointer-events-auto select-none font-catan">
      {gameState.playerOrder.map((playerId) => {
        const player = gameState.players.find((p) => p.id === playerId);
        if (!player) return null;

        const isActive = playerId === activePlayerId;
        const isMe = playerId === currentUserId;
        const totalCards = Object.values(player.resources).reduce(
          (a, b) => a + b,
          0
        );
        const theme = PLAYER_THEMES[player.color] || PLAYER_THEMES.red;

        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl border-2 sm:border-3 transition-all duration-300 relative overflow-hidden shadow-xl
              ${theme.gradient} ${theme.border}
              ${
                isActive
                  ? `${theme.activeGlow} scale-[1.03] z-10`
                  : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
              }
            `}
          >
            {/* Skeuomorphic inner bevel */}
            <div className="absolute inset-0 shadow-inset-wood pointer-events-none rounded-2xl" />

            {/* Avatar Circle with Gold/Color Rim */}
            <div
              className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 shadow-md shrink-0 bg-catan-dark-wood ${theme.ringColor}`}
            >
              {(() => {
                let avatarSrc = '/assets/avatar_hung_orig.png';
                if (player.name === 'Mai' || player.color === 'blue') avatarSrc = '/assets/avatar_mai_orig.png';
                else if (player.name === 'Nam' || player.color === 'green') avatarSrc = '/assets/avatar_nam_orig.png';
                else if (player.name === 'Linh' || player.color === 'orange') avatarSrc = '/assets/avatar_linh_orig.png';
                
                return (
                  <Image
                    src={avatarSrc}
                    alt={player.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                );
              })()}
            </div>

            {/* Player Info (Name, VP Star, Resource Count) */}
            <div className="flex flex-col flex-1 z-10 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-sm sm:text-base font-black truncate tracking-wide ${
                    isActive ? 'text-white' : 'text-catan-parchment'
                  }`}
                >
                  {player.name} {isMe && '(Bạn)'}
                </span>
              </div>

              {/* Stats: Star VP & Cards */}
              <div className="flex items-center gap-3 text-xs text-amber-200/90 font-bold mt-0.5 font-sans">
                <span className="flex items-center gap-1 text-amber-300 drop-shadow">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{' '}
                  {isMe ? player.victoryPoints : player.publicVictoryPoints}
                </span>
                <span className="flex items-center gap-1 text-slate-200 drop-shadow">
                  <Layers className="w-3.5 h-3.5 text-amber-300" /> {totalCards}
                </span>
                {player.devCards.length > 0 && (
                  <span className="text-[11px] text-purple-300">
                    🎴 {player.devCards.length}
                  </span>
                )}
              </div>
            </div>

            {/* Special Badges (Longest Road / Largest Army) */}
            <div className="flex flex-col items-end gap-1 z-10">
              {player.hasLongestRoad && (
                <span
                  className="px-1.5 py-0.5 rounded-full bg-blue-600/90 text-[10px] font-bold text-white border border-blue-400 flex items-center gap-0.5 shadow-sm"
                  title="Con đường dài nhất (+2 VP)"
                >
                  <Navigation className="w-2.5 h-2.5" /> {player.longestRoadLength}
                </span>
              )}
              {player.hasLargestArmy && (
                <span
                  className="px-1.5 py-0.5 rounded-full bg-red-600/90 text-[10px] font-bold text-white border border-red-400 flex items-center gap-0.5 shadow-sm"
                  title="Đội quân lớn nhất (+2 VP)"
                >
                  <Shield className="w-2.5 h-2.5" /> {player.playedKnights}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
