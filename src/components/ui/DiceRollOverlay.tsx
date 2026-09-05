'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GameState } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';
import { Dice3D } from './Dice3D';

interface DiceRollOverlayProps {
  gameState: GameState;
  currentUserId: string;
}

const AVATAR_FALLBACKS = ['alexander', 'elara', 'magnus', 'lyra'] as const;

function getAvatarSrc(avatarSeed: string | undefined, slotIndex: number) {
  if (!avatarSeed) {
    return `/assets/avatars/${AVATAR_FALLBACKS[slotIndex % AVATAR_FALLBACKS.length]}.png`;
  }
  const seed = avatarSeed.toLowerCase();
  const avatar =
    AVATAR_FALLBACKS.find((candidate) => seed.includes(candidate)) ??
    AVATAR_FALLBACKS[slotIndex % AVATAR_FALLBACKS.length];
  return `/assets/avatars/${avatar}.png`;
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
    avatarSeed?: string;
    slotIndex: number;
  } | null>(null);

  const prevRollKeyRef = useRef<string | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rollEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If there is no dice roll, do not trigger overlay
    if (
      !gameState.lastDiceRoll ||
      gameState.phase === 'turn_roll_dice' ||
      gameState.phase === 'lobby' ||
      gameState.phase.startsWith('setup')
    ) {
      return;
    }

    // Create a unique key to detect when a new dice roll happens
    const rollKey = `${gameState.turnNumber}_${gameState.activePlayerIndex}_${gameState.lastDiceRoll[0]}_${gameState.lastDiceRoll[1]}`;

    if (prevRollKeyRef.current !== rollKey) {
      prevRollKeyRef.current = rollKey;

      // Clear any existing active timers
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (rollEndTimerRef.current) clearTimeout(rollEndTimerRef.current);

      const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
      const player = gameState.players.find((p) => p.id === activePlayerId);
      const slotIndex = gameState.playerOrder.findIndex((id) => id === activePlayerId);
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
        avatarSeed: player?.avatarSeed,
        slotIndex: slotIndex >= 0 ? slotIndex : 0,
      });

      setVisible(true);
      setIsRolling(true);
      soundEngine.playDiceRoll();

      // Finish 3D tumble after 1.8s
      rollEndTimerRef.current = setTimeout(() => {
        setIsRolling(false);
      }, 1800);

      // Auto hide overlay after 4.8s
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 4800);
    }
  }, [
    gameState.lastDiceRoll,
    gameState.phase,
    gameState.turnNumber,
    gameState.activePlayerIndex,
    gameState.players,
    gameState.playerOrder,
    currentUserId,
    visible,
  ]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (rollEndTimerRef.current) clearTimeout(rollEndTimerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (rollEndTimerRef.current) clearTimeout(rollEndTimerRef.current);
    setVisible(false);
  };

  if (!visible || !rollData) return null;

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center select-none font-catan cursor-pointer bg-black/60 backdrop-blur-[3px] animate-fade-in p-2 sm:p-4"
    >
      {/* Modal Container with Authentic Dice Result Frame */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="relative w-[min(94vw,620px)] aspect-[1510/1042] max-h-[90vh] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-fade-in cursor-pointer transition-transform hover:scale-[1.01]"
        title="Click anywhere to dismiss"
      >
        {/* Background Modal Frame Asset */}
        <Image
          src="/assets/ingame/ingame_dice_result_modal_frame_en.png"
          alt="Dice Result Frame"
          fill
          className="object-contain pointer-events-none"
          priority
        />

        {/* 1. Top Subtitle Banner with Player Info (Shifted downwards slightly) */}
        <div className="absolute top-[21%] sm:top-[21.5%] inset-x-0 flex items-center justify-center gap-2 z-20">
          <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border border-[#8a5223] bg-[#1a0f06] shrink-0 shadow-sm ring-1 ring-[#d4af37]/60">
            <Image
              src={getAvatarSrc(rollData.avatarSeed, rollData.slotIndex)}
              alt={rollData.playerName}
              fill
              className="object-cover"
            />
          </div>
          <span className="font-serif text-xs sm:text-sm md:text-base font-bold text-[#2a1306] drop-shadow-xs">
            {rollData.isMe ? 'You rolled the dice' : `${rollData.playerName} rolled the dice`}
          </span>
        </div>

        {/* 2. Central 3D Rolling Dice Arena (Bigger Dice & Smooth 1.8s Animation) */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[66%] sm:w-[58%] h-[36%] z-20 flex items-center justify-center gap-8 sm:gap-12">
          {/* Die 1: Classic Ivory */}
          <div className="transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)]">
            <Dice3D
              key={`overlay_d1_${rollData.d1}_${rollData.d2}_${gameState.turnNumber}`}
              value={rollData.d1}
              isRolling={isRolling}
              size={76}
              duration={1.8}
              color="ivory"
              dieIndex={0}
            />
          </div>

          {/* Die 2: Milky White with Golden Sheen */}
          <div className="transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)]">
            <Dice3D
              key={`overlay_d2_${rollData.d1}_${rollData.d2}_${gameState.turnNumber}`}
              value={rollData.d2}
              isRolling={isRolling}
              size={76}
              duration={1.8}
              color="ivory"
              dieIndex={1}
            />
          </div>
        </div>

        {/* 3. Bottom Result Score Banner Frame (ingame_dice_roll_result_frame_blank.png) - Shifted Downwards */}
        <div className="absolute bottom-[9.5%] sm:bottom-[10%] md:bottom-[10.5%] left-1/2 -translate-x-1/2 w-[64%] sm:w-[58%] md:w-[54%] aspect-[2086/489] z-20 flex items-center justify-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]">
          <Image
            src="/assets/ingame/ingame_dice_roll_result_frame_blank.png"
            alt="Dice Result Score Banner"
            fill
            className="object-contain pointer-events-none"
            priority
          />

          {/* Big Gold Total Score Number inside the Frame - Uniform Lining Digits */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-0.5">
            <span
              className={`font-cinzel font-black text-3xl sm:text-4xl md:text-[46px] leading-none [font-variant-numeric:lining-nums_tabular-nums] tracking-normal text-transparent bg-clip-text bg-gradient-to-b from-[#fffce1] via-[#ffd700] to-[#e6a817] drop-shadow-[0_4px_12px_rgba(0,0,0,0.95),0_0_24px_rgba(255,215,0,0.8)] transition-all duration-300 ${
                isRolling ? 'opacity-20 scale-85 blur-[2px]' : 'opacity-100 scale-100 blur-0'
              }`}
            >
              {rollData.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
