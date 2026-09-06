'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GameState } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

interface TurnNotificationOverlayProps {
  gameState: GameState;
  currentUserId: string;
}

const FLAG_COLOR_MAP: Record<string, string> = {
  green: '/assets/ingame/notification/ingame_notification_flag_green.png',
  red: '/assets/ingame/notification/ingame_notification_flag_red.png',
  blue: '/assets/ingame/notification/ingame_notification_flag_blue.png',
  yellow: '/assets/ingame/notification/ingame_notification_flag_yellow.png',
  orange: '/assets/ingame/notification/ingame_notification_flag_red.png',
  brown: '/assets/ingame/notification/ingame_notification_flag_yellow.png',
  purple: '/assets/ingame/notification/ingame_notification_flag_blue.png',
  white: '/assets/ingame/notification/ingame_notification_flag_blue.png',
};

export const TurnNotificationOverlay: React.FC<TurnNotificationOverlayProps> = ({
  gameState,
  currentUserId,
}) => {
  const [visible, setVisible] = useState(false);
  const prevActivePlayerIdRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  useEffect(() => {
    // Do not show during lobby or game over
    if (gameState.phase === 'lobby' || gameState.phase === 'game_over') {
      prevActivePlayerIdRef.current = activePlayerId;
      return;
    }

    // Check if turn just transitioned from another player (or starting turn) to current user
    const wasOtherPlayer = prevActivePlayerIdRef.current !== currentUserId;
    prevActivePlayerIdRef.current = activePlayerId;

    if (wasOtherPlayer && isMyTurn) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setVisible(true);
      soundEngine.playResourceChime();

      // Auto dismiss after 3 seconds
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 3000);
    }
  }, [
    activePlayerId,
    isMyTurn,
    currentUserId,
    gameState.phase,
  ]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !myPlayer) return null;

  const flagSrc = FLAG_COLOR_MAP[myPlayer.color] || FLAG_COLOR_MAP.green;

  return (
    <div
      onClick={() => setVisible(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in cursor-pointer select-none font-catan"
    >
      {/* Board & Hanging Flag Banner Container matching reference image */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        className="relative w-[min(94vw,540px)] sm:w-[min(88vw,660px)] md:w-[min(84vw,740px)] aspect-[2082/612] drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] animate-bounce-in cursor-pointer transition-transform hover:scale-[1.01]"
        title="Click để đóng (Click to dismiss)"
      >
        {/* 1. Main Turn Board (Parchment, Wood Frame, 'YOUR TURN', Subtitle & Resources) */}
        <Image
          src="/assets/ingame/notification/ingame_notification_turn_board_en.png"
          alt="Your Turn Board"
          fill
          className="object-contain pointer-events-none drop-shadow-2xl"
          priority
        />

        {/* 2. Hanging Flag Banner on Left matching reference image */}
        <div className="absolute left-[3.2%] top-[-8.5%] h-[117%] aspect-[992/1506] pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] z-20">
          <Image
            src={flagSrc}
            alt="Player Flag"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};
