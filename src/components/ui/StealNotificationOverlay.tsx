'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GameState, ResourceType, StealEvent } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

interface StealNotificationOverlayProps {
  gameState: GameState;
  currentUserId: string;
}

const RESOURCE_CARD_DATA: Record<ResourceType, { name: string; cardImg: string; icon: string }> = {
  wood: { name: 'Lumber', cardImg: '/assets/card_wood_user.png', icon: '/assets/icons/timber.png' },
  brick: { name: 'Brick', cardImg: '/assets/card_brick_user.png', icon: '/assets/icons/brick.png' },
  sheep: { name: 'Wool', cardImg: '/assets/card_sheep_user.png', icon: '/assets/icons/sheep.png' },
  wheat: { name: 'Grain', cardImg: '/assets/card_wheat_user.png', icon: '/assets/icons/wheat.png' },
  ore: { name: 'Ore', cardImg: '/assets/card_ore_user.png', icon: '/assets/icons/ore.png' },
};

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

export const StealNotificationOverlay: React.FC<StealNotificationOverlayProps> = ({
  gameState,
  currentUserId,
}) => {
  const [visible, setVisible] = useState(false);
  const [eventData, setEventData] = useState<{
    event: StealEvent;
    isThief: boolean;
    isVictim: boolean;
    thiefName: string;
    victimName: string;
    thiefAvatar?: string;
    victimAvatar?: string;
    thiefSlot: number;
    victimSlot: number;
  } | null>(null);

  const prevEventIdRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lastEvent = gameState.lastStealEvent;

  useEffect(() => {
    if (!lastEvent) return;

    if (prevEventIdRef.current !== lastEvent.id) {
      prevEventIdRef.current = lastEvent.id;

      if (timerRef.current) clearTimeout(timerRef.current);

      const isThief = lastEvent.thiefId === currentUserId;
      const isVictim = lastEvent.victimId === currentUserId;

      const thief = gameState.players.find((p) => p.id === lastEvent.thiefId);
      const victim = gameState.players.find((p) => p.id === lastEvent.victimId);
      const thiefSlot = gameState.playerOrder.findIndex((id) => id === lastEvent.thiefId);
      const victimSlot = gameState.playerOrder.findIndex((id) => id === lastEvent.victimId);

      setEventData({
        event: lastEvent,
        isThief,
        isVictim,
        thiefName: thief ? thief.name : 'Thief',
        victimName: victim ? victim.name : 'Victim',
        thiefAvatar: thief?.avatarSeed,
        victimAvatar: victim?.avatarSeed,
        thiefSlot: thiefSlot >= 0 ? thiefSlot : 0,
        victimSlot: victimSlot >= 0 ? victimSlot : 0,
      });

      setVisible(true);

      if (isThief) {
        soundEngine.playResourceChime();
      } else if (isVictim) {
        soundEngine.playRobber();
      }

      // Auto dismiss after 5.5 seconds if not closed
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 5500);
    }
  }, [lastEvent, currentUserId, gameState.players, gameState.playerOrder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    soundEngine.playClick();
    setVisible(false);
  };

  if (!visible || !eventData) return null;

  const resData = RESOURCE_CARD_DATA[eventData.event.resource] || {
    name: eventData.event.resource,
    cardImg: '/assets/card_wood_user.png',
    icon: '/assets/icons/timber.png',
  };

  // Case 1: Current player is the VICTIM (Resources Lost)
  if (eventData.isVictim) {
    return (
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none font-catan cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[min(94vw,680px)] aspect-[1505/1044] max-h-[90vh] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-fade-in cursor-default"
        >
          {/* Authentic Robber Lost Modal Frame Asset */}
          <Image
            src="/assets/ingame/robber/ingame_resources_lost_modal_frame_en.png"
            alt="Resources Stolen - Robbed"
            fill
            className="object-contain pointer-events-none"
            priority
          />

          {/* Thief Avatar & Name Badge (Positioned before baked text "moved the robber and stole resources from you.") */}
          <div className="absolute top-[24.5%] left-[28%] sm:left-[30%] -translate-y-1/2 flex items-center gap-1.5 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2a170a]/90 border border-[#d4af37]/80 shadow-md">
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-amber-400 shrink-0">
                <Image
                  src={getAvatarSrc(eventData.thiefAvatar, eventData.thiefSlot)}
                  alt={eventData.thiefName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-[#fde68a] max-w-[90px] sm:max-w-[130px] truncate drop-shadow-xs">
                {eventData.thiefName}
              </span>
            </div>
          </div>

          {/* Lost Resource Card in Pre-Carved Slot */}
          <div className="absolute top-[48.5%] left-[51.5%] -translate-x-1/2 w-[14%] sm:w-[14.5%] aspect-[284/429] z-20 flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-md sm:rounded-lg overflow-hidden shadow-xl border border-[#783e18]/80 bg-[#fbf1db] drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)]">
              <Image
                src={resData.cardImg}
                alt={resData.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Badge -1 Lumber */}
            <div className="absolute -bottom-2.5 sm:-bottom-3.5 z-30 px-2.5 sm:px-3.5 py-0.5 rounded-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 border border-rose-300 text-white font-serif font-black text-[10px] sm:text-xs md:text-sm tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.85),0_0_12px_rgba(225,29,72,0.7)] whitespace-nowrap">
              -1 {resData.name}
            </div>
          </div>

          {/* Authentic OK Button */}
          <div className="absolute bottom-[4.5%] left-1/2 -translate-x-1/2 w-[28%] sm:w-[26%] md:w-[24%] aspect-[1846/349] z-30">
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
  }

  // Case 2: Current player is the THIEF (Resources Stolen)
  if (eventData.isThief) {
    return (
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none font-catan cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[min(94vw,680px)] aspect-[1467/1013] max-h-[90vh] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-fade-in cursor-default"
        >
          {/* Authentic Robber Stolen Modal Frame Asset */}
          <Image
            src="/assets/ingame/robber/ingame_resources_stolen_modal_frame_en.png"
            alt="Resources Stolen"
            fill
            className="object-contain pointer-events-none"
            priority
          />

          {/* Victim Avatar & Name Badge (Positioned after baked text "You moved the robber and stole resources from ") */}
          <div className="absolute top-[20.5%] right-[5%] sm:right-[7%] -translate-y-1/2 flex items-center gap-1.5 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2a170a]/90 border border-[#d4af37]/80 shadow-md">
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-amber-400 shrink-0">
                <Image
                  src={getAvatarSrc(eventData.victimAvatar, eventData.victimSlot)}
                  alt={eventData.victimName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-[#fde68a] max-w-[90px] sm:max-w-[130px] truncate drop-shadow-xs">
                {eventData.victimName}
              </span>
            </div>
          </div>

          {/* Stolen Resource Card in Radiant Sunlight */}
          <div className="absolute top-[37%] left-1/2 -translate-x-1/2 w-[18%] sm:w-[19%] md:w-[20%] aspect-[284/429] z-20 flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 border-[#d4af37]/90 bg-[#fbf1db] drop-shadow-[0_0_28px_rgba(245,158,11,0.9)]">
              <Image
                src={resData.cardImg}
                alt={resData.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Badge +1 Lumber */}
            <div className="absolute -bottom-3 sm:-bottom-4 z-30 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 border border-emerald-300 text-white font-serif font-black text-[10px] sm:text-xs md:text-sm tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.85),0_0_14px_rgba(16,185,129,0.75)] whitespace-nowrap">
              +1 {resData.name}
            </div>
          </div>

          {/* Authentic OK Button */}
          <div className="absolute bottom-[4.5%] left-1/2 -translate-x-1/2 w-[28%] sm:w-[26%] md:w-[24%] aspect-[1846/349] z-30">
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
  }

  // Case 3: Spectator / Other players observation
  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none font-catan cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(94vw,680px)] aspect-[1467/1013] max-h-[90vh] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-fade-in cursor-default"
      >
        {/* Authentic Robber Stolen Modal Frame Asset */}
        <Image
          src="/assets/ingame/robber/ingame_resources_stolen_modal_frame_en.png"
          alt="Resources Stolen"
          fill
          className="object-contain pointer-events-none"
          priority
        />

        {/* Custom Header Text for Spectators */}
        <div className="absolute top-[18.5%] inset-x-[8%] flex items-center justify-center gap-2 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2a170a]/90 border border-[#d4af37]/80 shadow-md">
            <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-amber-400 shrink-0">
              <Image
                src={getAvatarSrc(eventData.thiefAvatar, eventData.thiefSlot)}
                alt={eventData.thiefName}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-serif font-black text-xs sm:text-sm text-[#fde68a] truncate">
              {eventData.thiefName}
            </span>
          </div>

          <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#2a1306]">
            stole a resource from
          </span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2a170a]/90 border border-[#d4af37]/80 shadow-md">
            <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-amber-400 shrink-0">
              <Image
                src={getAvatarSrc(eventData.victimAvatar, eventData.victimSlot)}
                alt={eventData.victimName}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-serif font-black text-xs sm:text-sm text-[#fde68a] truncate">
              {eventData.victimName}
            </span>
          </div>
        </div>

        {/* Mystery Stolen Card (Card Back) for Spectators */}
        <div className="absolute top-[37%] left-1/2 -translate-x-1/2 w-[18%] sm:w-[19%] md:w-[20%] aspect-[284/429] z-20 flex flex-col items-center justify-center">
          <div className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 border-[#d4af37]/90 bg-[#fbf1db] drop-shadow-[0_0_25px_rgba(245,158,11,0.85)]">
            <Image
              src="/assets/custom_card_catan_deck.png"
              alt="Mystery Card"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Mystery Badge */}
          <div className="absolute -bottom-3 sm:-bottom-4 z-30 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 border border-amber-300 text-amber-100 font-serif font-black text-[10px] sm:text-xs md:text-sm tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.85)] whitespace-nowrap">
            1 Secret Resource
          </div>
        </div>

        {/* Authentic OK Button */}
        <div className="absolute bottom-[4.5%] left-1/2 -translate-x-1/2 w-[28%] sm:w-[26%] md:w-[24%] aspect-[1846/349] z-30">
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
