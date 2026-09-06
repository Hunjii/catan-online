'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GameState } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

interface TradeNotificationOverlayProps {
  gameState: GameState;
  currentUserId: string;
  onCancelTradeOffer: () => void;
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

export const TradeNotificationOverlay: React.FC<TradeNotificationOverlayProps> = ({
  gameState,
  currentUserId,
  onCancelTradeOffer,
}) => {
  const [dismissedDeclinedId, setDismissedDeclinedId] = useState<string | null>(null);
  const prevDeclinedIdRef = useRef<string | null>(null);

  const activeOffer = gameState?.currentTradeOffer;
  const isWaiting =
    activeOffer &&
    activeOffer.status === 'open' &&
    activeOffer.fromPlayerId === currentUserId;

  const declinedEvent = gameState?.lastTradeDeclinedEvent;
  const isDeclined =
    declinedEvent &&
    declinedEvent.fromPlayerId === currentUserId &&
    dismissedDeclinedId !== declinedEvent.id;

  const myPlayer = gameState?.players.find((p) => p.id === currentUserId);
  const flagSrc = FLAG_COLOR_MAP[myPlayer?.color || 'green'] || FLAG_COLOR_MAP.green;

  // Play sound when all players decline the trade offer
  useEffect(() => {
    if (declinedEvent && isDeclined && prevDeclinedIdRef.current !== declinedEvent.id) {
      prevDeclinedIdRef.current = declinedEvent.id;
      soundEngine.playRobber();
    }
  }, [declinedEvent, isDeclined]);

  const handleCancel = () => {
    soundEngine.playClick();
    onCancelTradeOffer();
  };

  const handleDismissDeclined = () => {
    if (declinedEvent) {
      setDismissedDeclinedId(declinedEvent.id);
    }
    soundEngine.playClick();
  };

  // Case 1: Trade Declined by all other players
  if (isDeclined) {
    return (
      <div
        onClick={handleDismissDeclined}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in select-none font-catan cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[min(94vw,560px)] sm:w-[min(88vw,660px)] md:w-[min(82vw,720px)] aspect-[1654/826] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-fade-in cursor-default"
        >
          {/* Trade Declined Notification Board Asset */}
          <Image
            src="/assets/ingame/notification/ingame_trade_declined_notification_en.png"
            alt="Trade Declined"
            fill
            className="object-contain pointer-events-none drop-shadow-2xl"
            priority
          />

          {/* OK Button Asset */}
          <div className="absolute bottom-[6.5%] sm:bottom-[7%] left-1/2 -translate-x-1/2 w-[30%] sm:w-[28%] md:w-[26%] aspect-[1846/349] z-20">
            <button
              onClick={handleDismissDeclined}
              className="relative w-full h-full hover:scale-105 active:scale-95 transition-all duration-150 drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)] cursor-pointer group"
              title="OK"
            >
              <Image
                src="/assets/ingame/robber/ingame_resources_stolen_ok_button_en.png"
                alt="OK"
                fill
                className="object-contain group-hover:brightness-110"
                priority
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Waiting for other players to respond
  if (isWaiting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-[2px] animate-fade-in select-none font-catan">
        <div className="relative w-[min(94vw,560px)] sm:w-[min(88vw,680px)] md:w-[min(84vw,760px)] aspect-[1742/700] drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] animate-fade-in">
          {/* Main Waiting Board Asset */}
          <Image
            src="/assets/ingame/notification/ingame_trade_waiting_for_players_frame_en.png"
            alt="Waiting for players"
            fill
            className="object-contain pointer-events-none drop-shadow-2xl"
            priority
          />

          {/* Hanging Flag on the Left (Slightly smaller, shifted left) */}
          <div className="absolute left-[1%] sm:left-[1.2%] top-[-4%] sm:top-[-5%] h-[104%] sm:h-[105%] aspect-[989/1503] pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] z-20">
            <Image
              src={flagSrc}
              alt="Player Flag"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Cancel Button (Centered horizontally) */}
          <div className="absolute bottom-[10%] sm:bottom-[11%] md:bottom-[12%] left-1/2 -translate-x-1/2 w-[34%] sm:w-[31%] md:w-[29%] aspect-[1720/493] z-20">
            <button
              onClick={handleCancel}
              className="relative w-full h-full hover:scale-105 active:scale-95 transition-all duration-150 drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] cursor-pointer group"
              title="Cancel Trade Offer"
            >
              <Image
                src="/assets/ingame/notification/ingame_trade_cancel_button_en.png"
                alt="Cancel"
                fill
                className="object-contain group-hover:brightness-110"
                priority
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
