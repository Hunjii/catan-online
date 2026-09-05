'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';
import { Dice3D } from './Dice3D';

interface DiceRollOverlayProps {
  gameState: GameState;
  currentUserId: string;
}

export const DiceRollOverlay: React.FC<DiceRollOverlayProps> = ({ gameState, currentUserId }) => {
  const [visible, setVisible] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollData, setRollData] = useState<{
    d1: number;
    d2: number;
    total: number;
    playerName: string;
    isMe: boolean;
  } | null>(null);

  const prevRollRef = useRef<string | null>(null);

  useEffect(() => {
    // If there is no dice roll or we are still in roll_dice / setup / lobby phase, do not trigger overlay
    if (!gameState.lastDiceRoll || gameState.phase === 'turn_roll_dice' || gameState.phase === 'lobby' || gameState.phase.startsWith('setup')) {
      return;
    }

    // Create a unique key to detect when a new dice roll happens
    const rollKey = `${gameState.turnNumber}_${gameState.activePlayerIndex}_${gameState.lastDiceRoll[0]}_${gameState.lastDiceRoll[1]}`;

    if (prevRollRef.current !== rollKey) {
      prevRollRef.current = rollKey;
      const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
      const player = gameState.players.find((p) => p.id === activePlayerId);
      const isMe = activePlayerId === currentUserId;
      const d1 = gameState.lastDiceRoll[0];
      const d2 = gameState.lastDiceRoll[1];
      const total = d1 + d2;

      setRollData({
        d1,
        d2,
        total,
        playerName: player ? player.name : 'Player',
        isMe,
      });

      setVisible(true);
      setIsRolling(true);
      soundEngine.playDiceRoll();

      // Finish 3D tumble after 1.1s
      const rollEndTimer = setTimeout(() => {
        setIsRolling(false);
      }, 1100);

      // Hide overlay after 2.6s
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 2600);

      return () => {
        clearTimeout(rollEndTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [gameState.lastDiceRoll, gameState.phase, gameState.turnNumber, gameState.activePlayerIndex, gameState.players, gameState.playerOrder, currentUserId]);

  if (!visible || !rollData) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center select-none font-catan">
      <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-[#d4af37]/85 bg-gradient-to-b from-[#1b1008]/96 to-[#0d0703]/96 px-8 py-5 sm:px-10 sm:py-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.35)] backdrop-blur-xl animate-fade-in">
        {/* Header: Player Name Banner */}
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-serif text-sm sm:text-base md:text-lg font-black tracking-wider text-[#fcd34d] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {rollData.isMe ? 'You rolled the dice!' : `${rollData.playerName} rolled the dice!`}
          </span>
        </div>

        {/* 3D Rolling Dice Arena Tray */}
        <div className="relative flex h-28 w-56 sm:h-32 sm:w-64 items-center justify-center gap-6 sm:gap-8 rounded-2xl border border-[#9b6f28]/70 bg-gradient-to-b from-[#1c1107] via-[#24160b] to-[#140b04] p-3 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)]">
          {/* Die 1: Classic Ivory */}
          <div className="transition-transform duration-300">
            <Dice3D
              key={`overlay_d1_${rollData.d1}_${rollData.d2}_${gameState.turnNumber}`}
              value={rollData.d1}
              isRolling={isRolling}
              size={58}
              color="ivory"
              dieIndex={0}
            />
          </div>

          {/* Die 2: Milky White with Golden Sheen */}
          <div className="transition-transform duration-300">
            <Dice3D
              key={`overlay_d2_${rollData.d1}_${rollData.d2}_${gameState.turnNumber}`}
              value={rollData.d2}
              isRolling={isRolling}
              size={58}
              color="ivory"
              dieIndex={1}
            />
          </div>
        </div>

        {/* Dice Result Badge */}
        <div
          className={`flex items-center gap-2 sm:gap-3 transition-all duration-300 ${
            isRolling ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-amber-400/80 bg-[#251508] font-serif text-lg sm:text-xl font-black text-amber-200 shadow-md">
            {rollData.d1}
          </div>
          <span className="text-base sm:text-lg font-bold text-amber-400/80">+</span>
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-amber-400/80 bg-[#251508] font-serif text-lg sm:text-xl font-black text-amber-200 shadow-md">
            {rollData.d2}
          </div>
          <span className="text-base sm:text-lg font-bold text-amber-400/80">=</span>
          <div className="flex h-10 w-16 sm:h-11 sm:w-20 items-center justify-center rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 font-serif text-xl sm:text-2xl font-black text-[#1a0f04] shadow-[0_0_20px_rgba(245,158,11,0.7)]">
            {rollData.total}
          </div>
        </div>

        {/* 7 Robber Notice or Production Notice */}
        {rollData.total === 7 ? (
          <span className="font-vietnam text-xs sm:text-sm font-bold tracking-wide text-red-400 animate-pulse">
            ⚠️ Rolled a 7! The Robber strikes!
          </span>
        ) : (
          <span className="font-vietnam text-[11px] sm:text-xs font-medium text-amber-200/90">
            Resources produced for hex #{rollData.total}
          </span>
        )}
      </div>
    </div>
  );
};


