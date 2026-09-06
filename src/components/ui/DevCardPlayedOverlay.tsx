'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GameState, DevCardType, DevCardPlayedEvent } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

interface DevCardPlayedOverlayProps {
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

const DEV_CARD_DATA: Record<DevCardType, { name: string; image: string }> = {
  knight: {
    name: 'Knight Card',
    image: '/assets/ingame/development_card/ingame_development_card_knight_front.png',
  },
  road_building: {
    name: 'Road Building Card',
    image: '/assets/ingame/development_card/ingame_development_card_road_building_front.png',
  },
  year_of_plenty: {
    name: 'Year of Plenty Card',
    image: '/assets/ingame/development_card/ingame_development_card_year_of_plenty_front.png',
  },
  monopoly: {
    name: 'Monopoly Card',
    image: '/assets/ingame/development_card/ingame_development_card_monopoly_front.png',
  },
  victory_point: {
    name: 'Victory Point Card',
    image: '/assets/ingame/development_card/ingame_development_card_victory_point_front.png',
  },
};

export const DevCardPlayedOverlay: React.FC<DevCardPlayedOverlayProps> = ({
  gameState,
  currentUserId,
}) => {
  const [visible, setVisible] = useState(false);
  const [eventData, setEventData] = useState<{
    event: DevCardPlayedEvent;
    playerName: string;
    avatarSeed?: string;
    slotIndex: number;
  } | null>(null);

  const prevEventIdRef = useRef<string | null>(null);

  const lastEvent = gameState?.lastDevCardPlayedEvent;

  useEffect(() => {
    if (!lastEvent) return;

    if (prevEventIdRef.current !== lastEvent.id) {
      prevEventIdRef.current = lastEvent.id;

      // Do NOT show for the player who played the card
      if (lastEvent.playerId === currentUserId) {
        setVisible(false);
        return;
      }

      const player = gameState.players.find((p) => p.id === lastEvent.playerId);
      const slotIndex = gameState.playerOrder.findIndex((id) => id === lastEvent.playerId);

      setEventData({
        event: lastEvent,
        playerName: player ? player.name : 'Player',
        avatarSeed: player?.avatarSeed,
        slotIndex: slotIndex >= 0 ? slotIndex : 0,
      });

      setVisible(true);
      soundEngine.playResourceChime();
    }
  }, [lastEvent, currentUserId, gameState.players, gameState.playerOrder]);

  const handleClose = () => {
    soundEngine.playClick();
    setVisible(false);
  };

  if (!visible || !eventData || eventData.event.playerId === currentUserId) return null;

  const cardData = DEV_CARD_DATA[eventData.event.card] || {
    name: 'Development Card',
    image: '/assets/ingame/development_card/ingame_development_card_knight_front.png',
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none font-catan cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(94vw,680px)] aspect-[1509/1042] max-h-[90vh] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-fade-in cursor-default"
      >
        {/* Authentic Dev Card Played Modal Frame Asset */}
        <Image
          src="/assets/ingame/robber/ingame_development_card_played_modal_frame_en.png"
          alt="Development Card Played"
          fill
          className="object-contain pointer-events-none"
          priority
        />

        {/* Top Parchment Info Area: Centered Avatar & Text Description */}
        <div className="absolute top-[15%] sm:top-[15.5%] inset-x-[4%] h-[16%] flex items-center justify-center gap-3 sm:gap-4 z-20 px-2">
          {/* Avatar Ring */}
          <div className="relative w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-[#5a381e] bg-[#1a0f06] shadow-md shrink-0 ring-2 ring-[#d4af37]/70">
            <Image
              src={getAvatarSrc(eventData.avatarSeed, eventData.slotIndex)}
              alt={eventData.playerName}
              fill
              className="object-cover"
            />
          </div>

          {/* Player Name and Action Text */}
          <div className="flex flex-col justify-center text-left max-w-[80%]">
            <p className="font-cinzel text-xs sm:text-sm md:text-base text-[#2a1306] font-bold leading-tight drop-shadow-xs">
              <span className="font-black text-[#872e04] text-sm sm:text-base md:text-lg">
                {eventData.playerName}
              </span>{' '}
              played a Development Card:
            </p>
            <span className="font-serif text-xs sm:text-sm md:text-base font-extrabold text-[#9a3412] leading-tight mt-0.5">
              {cardData.name}
            </span>
          </div>
        </div>

        {/* Central Development Card (Front face only, shifted up slightly) */}
        <div className="absolute top-[29%] sm:top-[29.5%] left-1/2 -translate-x-1/2 w-[31%] sm:w-[28.5%] md:w-[27%] aspect-[1024/1526] z-20 flex items-center justify-center">
          <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.95)] border-2 border-[#d4af37]/90 bg-[#1a0f06] drop-shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-transform hover:scale-[1.03] duration-200">
            <Image
              src={cardData.image}
              alt={cardData.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Bottom OK Button Asset (Enlarged) */}
        <div className="absolute bottom-[3.2%] sm:bottom-[3.5%] md:bottom-[3.8%] left-1/2 -translate-x-1/2 w-[34%] sm:w-[31%] md:w-[29%] aspect-[1846/349] z-30">
          <button
            onClick={handleClose}
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
};
