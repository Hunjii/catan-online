'use client';

import React from 'react';
import { GameState, Player, ResourceType, PlayerColor } from '@/lib/catan/types';
import { COLOR_MAP } from '../3d/Settlement3D';
import { Sparkles, Trophy, Shield, Navigation } from 'lucide-react';

interface PlayerDashboardProps {
  gameState: GameState;
  currentUserId: string;
}

const RESOURCE_ICONS: Record<ResourceType, { name: string; icon: string; bg: string; border: string }> = {
  wood: { name: 'Gỗ', icon: '🌲', bg: 'bg-emerald-950/80', border: 'border-emerald-500' },
  brick: { name: 'Gạch', icon: '🧱', bg: 'bg-amber-950/80', border: 'border-amber-600' },
  sheep: { name: 'Cừu', icon: '🐑', bg: 'bg-lime-950/80', border: 'border-lime-500' },
  wheat: { name: 'Lúa mì', icon: '🌾', bg: 'bg-yellow-950/80', border: 'border-yellow-500' },
  ore: { name: 'Đá quặng', icon: '⛰️', bg: 'bg-slate-900/80', border: 'border-slate-400' },
};

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  gameState,
  currentUserId,
}) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  return (
    <div className="w-full flex flex-col justify-between pointer-events-none p-4 select-none">
      {/* Top Player List Bar */}
      <div className="flex flex-wrap items-center gap-3 max-w-full overflow-x-auto pb-2 pointer-events-auto">
        {gameState.playerOrder.map((playerId, index) => {
          const player = gameState.players.find((p) => p.id === playerId);
          if (!player) return null;

          const isActive = playerId === activePlayerId;
          const isMe = playerId === currentUserId;
          const totalCards = Object.values(player.resources).reduce((a, b) => a + b, 0);

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-md transition-all duration-300 border shadow-lg ${
                isActive
                  ? 'bg-slate-900/90 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-amber-500/20'
                  : 'bg-slate-900/75 border-slate-700/60'
              }`}
            >
              {/* Color Dot & Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-inner text-xs border-2 border-white/40"
                style={{ backgroundColor: COLOR_MAP[player.color] }}
              >
                {player.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Name & VP */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-semibold truncate max-w-[110px] ${isMe ? 'text-amber-300' : 'text-slate-100'}`}>
                    {player.name} {isMe && '(Bạn)'}
                  </span>
                  {isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Trophy className="w-3 h-3" /> {isMe ? player.victoryPoints : player.publicVictoryPoints} VP
                  </span>
                  <span>•</span>
                  <span>🃏 {totalCards} lá</span>
                  {player.devCards.length > 0 && <span>• 🎴 {player.devCards.length}</span>}
                </div>
              </div>

              {/* Special Badges */}
              <div className="flex items-center gap-1 pl-1">
                {player.hasLongestRoad && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-600/80 text-[10px] font-bold text-white border border-blue-400 flex items-center gap-0.5" title="Con đường dài nhất (+2 VP)">
                    <Navigation className="w-2.5 h-2.5" /> {player.longestRoadLength}
                  </span>
                )}
                {player.hasLargestArmy && (
                  <span className="px-1.5 py-0.5 rounded bg-red-600/80 text-[10px] font-bold text-white border border-red-400 flex items-center gap-0.5" title="Đội quân lớn nhất (+2 VP)">
                    <Shield className="w-2.5 h-2.5" /> {player.playedKnights}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Inventory Bar (My Resources & Dev Cards) */}
      {myPlayer && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pointer-events-auto">
          {/* Resource Cards Hand */}
          <div className="flex items-center gap-2 p-2 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
            {(['wood', 'brick', 'sheep', 'wheat', 'ore'] as ResourceType[]).map((res) => {
              const count = myPlayer.resources[res] || 0;
              const info = RESOURCE_ICONS[res];

              return (
                <div
                  key={res}
                  className={`flex flex-col items-center justify-between w-14 h-20 sm:w-16 sm:h-22 rounded-xl p-1.5 transition-all duration-200 border ${
                    count > 0
                      ? `${info.bg} ${info.border} shadow-md scale-100 hover:-translate-y-1`
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{info.icon}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-200 truncate w-full text-center">
                    {info.name}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-black px-1.5 py-0.5 rounded-full ${
                      count > 0 ? 'bg-black/50 text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Pill */}
          <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-700 text-xs text-slate-300 shadow-xl">
            <div>
              <span className="text-slate-400">Đường còn lại:</span>{' '}
              <strong className="text-white">{myPlayer.roadsLeft}</strong>
            </div>
            <span>|</span>
            <div>
              <span className="text-slate-400">Làng:</span>{' '}
              <strong className="text-white">{myPlayer.settlementsLeft}</strong>
            </div>
            <span>|</span>
            <div>
              <span className="text-slate-400">Thành phố:</span>{' '}
              <strong className="text-white">{myPlayer.citiesLeft}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
