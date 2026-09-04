'use client';

import React from 'react';
import Image from 'next/image';
import { GamePhase, GameState } from '@/lib/catan/types';

interface TurnStatusBannerProps {
  gameState: GameState;
  currentUserId: string;
}

interface PhaseDetail {
  phaseName: string;
  hint: string;
}

const PHASE_DETAILS: Record<GamePhase, PhaseDetail> = {
  lobby: {
    phaseName: 'LOBBY PHASE',
    hint: 'Waiting for host to start the game',
  },
  setup_round_1: {
    phaseName: 'SETUP PHASE',
    hint: 'Place your initial settlement and road',
  },
  setup_round_2: {
    phaseName: 'SETUP PHASE',
    hint: 'Place your second settlement to harvest starting resources',
  },
  turn_roll_dice: {
    phaseName: 'MAIN PHASE',
    hint: 'Roll the dice to produce resources',
  },
  turn_robber_discard: {
    phaseName: 'ROBBER EVENT',
    hint: 'Players with more than 7 cards must discard half',
  },
  turn_robber_move: {
    phaseName: 'ROBBER EVENT',
    hint: 'Move the robber to a new hex to block production',
  },
  turn_robber_steal: {
    phaseName: 'ROBBER EVENT',
    hint: 'Select an opponent adjacent to the robber to steal from',
  },
  turn_actions: {
    phaseName: 'ACTION PHASE',
    hint: 'Trade, build roads or settlements, or buy dev cards',
  },
  game_over: {
    phaseName: 'GAME OVER',
    hint: 'The legendary island of Catan has crowned its champion',
  },
};

export const TurnStatusBanner: React.FC<TurnStatusBannerProps> = ({ gameState, currentUserId }) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const activePlayer = gameState.players.find((player) => player.id === activePlayerId);
  const isMyTurn = activePlayerId === currentUserId;
  const currentPhase = PHASE_DETAILS[gameState.phase] || {
    phaseName: 'MAIN PHASE',
    hint: 'Play your turn actions',
  };

  const playerNameText = activePlayer
    ? isMyTurn
      ? `${activePlayer.name}'s turn (You)`
      : `${activePlayer.name}'s turn`
    : 'Waiting for turn';

  return (
    <div className="relative flex items-center gap-3 sm:gap-3.5 rounded-2xl border border-[#9b6f28]/85 bg-gradient-to-b from-[#20140a]/95 via-[#140c06]/95 to-[#0b0502]/95 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,225,140,0.15)] backdrop-blur-md select-none font-catan">
      {/* Corner decorative accents */}
      <span className="absolute left-1.5 top-1.5 h-1 w-1 rounded-full bg-[#d4a359]/70" />
      <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-[#d4a359]/70" />
      <span className="absolute left-1.5 bottom-1.5 h-1 w-1 rounded-full bg-[#d4a359]/70" />
      <span className="absolute right-1.5 bottom-1.5 h-1 w-1 rounded-full bg-[#d4a359]/70" />

      {/* Calendar Icon Badge on Left */}
      <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 flex items-center justify-center">
        <Image
          src="/assets/ingame/ingame_turn_calendar.svg"
          alt="Turn Calendar"
          fill
          className="object-contain drop-shadow"
        />
      </div>

      {/* Text Info Column */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        {/* Line 1: TURN X • PHASE */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest text-[#d8ad56] font-vietnam uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          <span>TURN {gameState.turnNumber || 1}</span>
          <span className="opacity-60">•</span>
          <span>{currentPhase.phaseName}</span>
        </div>

        {/* Line 2: Status Dot + Player's Turn */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.85)] animate-pulse" />
          <span className="truncate text-sm sm:text-[15px] font-bold tracking-wide text-[#fcfbf9] font-vietnam drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {playerNameText}
          </span>
        </div>

        {/* Line 3: Helper Tip */}
        <p className="truncate text-[11px] sm:text-xs font-medium text-[#c8a15b] font-vietnam mt-0.5 tracking-wide">
          {currentPhase.hint}
        </p>
      </div>
    </div>
  );
};
