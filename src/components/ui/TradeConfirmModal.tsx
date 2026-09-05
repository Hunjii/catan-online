'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GameState, ResourceType } from '@/lib/catan/types';
import { hasEnoughResources } from '@/lib/catan/trade';
import { soundEngine } from '@/lib/audio/soundEngine';

interface TradeConfirmModalProps {
  gameState: GameState;
  currentUserId: string;
  onAcceptTradeOffer: (offerId: string) => void;
  onDeclineTradeOffer?: () => void;
}

interface ResourceItem {
  type: ResourceType;
  label: string;
  icon: string;
  count: number;
}

const RESOURCE_INFO: Record<ResourceType, { label: string; icon: string }> = {
  wood: { label: 'Wood', icon: '/assets/icons/timber.png' },
  brick: { label: 'Brick', icon: '/assets/icons/brick.png' },
  sheep: { label: 'Sheep', icon: '/assets/icons/sheep.png' },
  wheat: { label: 'Wheat', icon: '/assets/icons/wheat.png' },
  ore: { label: 'Ore', icon: '/assets/icons/ore.png' },
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

// Convert resource record into slot items (up to 3 slots)
function expandResourceSlots(record: Record<ResourceType, number>): ResourceItem[] {
  const totalCount = Object.values(record).reduce((a, b) => a + b, 0);
  const slots: ResourceItem[] = [];

  if (totalCount <= 3) {
    // If 3 or fewer total resources, show individual unit cards (matches exact screenshot layout)
    for (const [res, count] of Object.entries(record)) {
      const type = res as ResourceType;
      for (let i = 0; i < count; i++) {
        slots.push({
          type,
          label: RESOURCE_INFO[type]?.label || type,
          icon: RESOURCE_INFO[type]?.icon || '',
          count: 1,
        });
      }
    }
  } else {
    // If more than 3 resources, group by resource type to fit into the 3 slots
    for (const [res, count] of Object.entries(record)) {
      const type = res as ResourceType;
      if (count > 0) {
        slots.push({
          type,
          label: RESOURCE_INFO[type]?.label || type,
          icon: RESOURCE_INFO[type]?.icon || '',
          count,
        });
      }
    }
  }

  return slots;
}

export const TradeConfirmModal: React.FC<TradeConfirmModalProps> = ({
  gameState,
  currentUserId,
  onAcceptTradeOffer,
  onDeclineTradeOffer,
}) => {
  const [dismissedOfferId, setDismissedOfferId] = useState<string | null>(null);
  const prevOfferIdRef = useRef<string | null>(null);

  const activeOffer = gameState?.currentTradeOffer;
  const isOfferOpen = activeOffer && activeOffer.status === 'open';
  const isOpponentOffer = isOfferOpen && activeOffer.fromPlayerId !== currentUserId;
  const isVisible = isOpponentOffer && dismissedOfferId !== activeOffer.id;

  // Sound chime when a new trade offer pops up
  useEffect(() => {
    if (activeOffer && isOpponentOffer && activeOffer.id !== prevOfferIdRef.current) {
      prevOfferIdRef.current = activeOffer.id;
      setDismissedOfferId(null);
      soundEngine.playResourceChime();
    }
  }, [activeOffer, isOpponentOffer]);

  if (!isVisible || !activeOffer) return null;

  const initiatorPlayer = gameState.players.find((p) => p.id === activeOffer.fromPlayerId);
  const initiatorSlotIndex = gameState.playerOrder.findIndex((id) => id === activeOffer.fromPlayerId);
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  const canAfford = myPlayer ? hasEnoughResources(myPlayer, activeOffer.requesting) : false;

  const offeredSlots = expandResourceSlots(activeOffer.giving);
  const requestedSlots = expandResourceSlots(activeOffer.requesting);

  const handleDecline = () => {
    setDismissedOfferId(activeOffer.id);
    soundEngine.playClick();
    if (onDeclineTradeOffer) {
      onDeclineTradeOffer();
    }
  };

  const handleAccept = () => {
    if (!canAfford) return;
    soundEngine.playResourceChime();
    onAcceptTradeOffer(activeOffer.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none font-catan">
      {/* Modal Frame Container */}
      <div className="relative w-[min(94vw,760px)] aspect-[1422/998] max-h-[92vh] flex flex-col justify-between drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        {/* Authentic Background Frame Asset */}
        <Image
          src="/assets/ingame/trade/trade confirm/ingame_trade_offer_modal_frame_en.png"
          alt="Trade Offer Modal"
          fill
          className="object-fill pointer-events-none -z-0"
          priority
        />

        {/* Top-Right Red Close Button */}
        <button
          onClick={handleDecline}
          className="absolute top-[2.4%] right-[2.2%] w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 z-50 hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] cursor-pointer"
          title="Decline and close"
        >
          <Image
            src="/assets/ingame/trade/ingame_trade_close_button.png"
            alt="Close"
            fill
            className="object-contain"
          />
        </button>

        {/* 1. TOP INITIATOR HEADER: Centered Avatar & Text */}
        <div className="relative z-10 pt-[10.5%] sm:pt-[9.8%] flex items-center justify-center gap-3 sm:gap-4 px-6">
          {/* Avatar Ring */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#5a381e] bg-[#1a0f06] shadow-md shrink-0 ring-2 ring-[#d4af37]/60">
            <Image
              src={getAvatarSrc(initiatorPlayer?.avatarSeed, initiatorSlotIndex >= 0 ? initiatorSlotIndex : 0)}
              alt={initiatorPlayer?.name || 'Player'}
              fill
              className="object-cover"
            />
          </div>

          {/* Name & Prompt Text */}
          <div className="flex flex-col justify-center text-left">
            <h3 className="font-serif font-black text-base sm:text-lg md:text-xl text-[#1e130a] leading-tight drop-shadow-xs">
              {initiatorPlayer?.name || 'Player'}
            </h3>
            <p className="font-serif text-xs sm:text-sm text-[#4a3520] font-semibold leading-tight">
              wants to trade with you
            </p>
          </div>
        </div>

        {/* 2. MIDDLE PANELS: THEY OFFER ⇄ THEY REQUEST */}
        <div className="relative z-10 w-full px-[3.5%] my-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* LEFT PANEL: THEY OFFER */}
          <div className="relative flex-1 aspect-[1288/853] drop-shadow-md">
            <Image
              src="/assets/ingame/trade/trade confirm/ingame_trade_offer_they_offer_panel_en.png"
              alt="They Offer"
              fill
              className="object-fill pointer-events-none"
              priority
            />

            {/* Overlay grid positioned over the 3 pre-carved slots */}
            <div className="absolute inset-0 pt-[20.5%] pb-[4%] px-[5%] grid grid-cols-3 gap-[3%]">
              {[0, 1, 2].map((slotIdx) => {
                const item = offeredSlots[slotIdx];
                if (!item) return <div key={`empty-offered-${slotIdx}`} className="h-full w-full" />;

                return (
                  <div key={`offered-${slotIdx}-${item.type}`} className="flex flex-col items-center justify-between h-full w-full">
                    {/* Slot card content area */}
                    <div className="relative flex flex-col items-center justify-center h-[72%] w-full">
                      <div className="relative w-[54%] aspect-square flex items-center justify-center">
                        <Image
                          src={item.icon}
                          alt={item.label}
                          fill
                          className="object-contain drop-shadow-md"
                        />
                      </div>

                      {/* Pill Count Badge */}
                      <div className="absolute bottom-[2%] z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#18110a] border border-[#d4af37] text-white font-serif font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md">
                        {item.count}
                      </div>
                    </div>

                    {/* Resource Name Label */}
                    <span className="font-serif font-bold text-[11px] sm:text-xs md:text-sm text-[#2a1708] tracking-wide mt-auto mb-0.5">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER: EXCHANGE ARROWS */}
          <div className="relative w-6 sm:w-8 md:w-9 aspect-[561/651] shrink-0 self-center drop-shadow-sm">
            <Image
              src="/assets/ingame/trade/trade confirm/ingame_trade_offer_exchange_arrows.png"
              alt="⇄"
              fill
              className="object-contain"
            />
          </div>

          {/* RIGHT PANEL: THEY REQUEST */}
          <div className="relative flex-1 aspect-[1288/853] drop-shadow-md">
            <Image
              src="/assets/ingame/trade/trade confirm/ingame_trade_offer_they_request_panel_en.png"
              alt="They Request"
              fill
              className="object-fill pointer-events-none"
              priority
            />

            {/* Overlay grid positioned over the 3 pre-carved slots */}
            <div className="absolute inset-0 pt-[20.5%] pb-[4%] px-[5%] grid grid-cols-3 gap-[3%]">
              {[0, 1, 2].map((slotIdx) => {
                const item = requestedSlots[slotIdx];
                if (!item) return <div key={`empty-requested-${slotIdx}`} className="h-full w-full" />;

                return (
                  <div key={`requested-${slotIdx}-${item.type}`} className="flex flex-col items-center justify-between h-full w-full">
                    {/* Slot card content area */}
                    <div className="relative flex flex-col items-center justify-center h-[72%] w-full">
                      <div className="relative w-[54%] aspect-square flex items-center justify-center">
                        <Image
                          src={item.icon}
                          alt={item.label}
                          fill
                          className="object-contain drop-shadow-md"
                        />
                      </div>

                      {/* Pill Count Badge */}
                      <div className="absolute bottom-[2%] z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#18110a] border border-[#d4af37] text-white font-serif font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md">
                        {item.count}
                      </div>
                    </div>

                    {/* Resource Name Label */}
                    <span className="font-serif font-bold text-[11px] sm:text-xs md:text-sm text-[#2a1708] tracking-wide mt-auto mb-0.5">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM BUTTONS: DECLINE & ACCEPT */}
        <div className="relative z-10 w-full px-[8%] pb-[4.8%] pt-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-center justify-center gap-4 sm:gap-8">
            {/* DECLINE BUTTON */}
            <button
              onClick={handleDecline}
              className="relative w-[44%] max-w-[210px] aspect-[2098/424] hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] cursor-pointer"
              title="Decline this offer"
            >
              <Image
                src="/assets/ingame/trade/trade confirm/ingame_trade_offer_decline_button_en.png"
                alt="Decline"
                fill
                className="object-contain"
                priority
              />
            </button>

            {/* ACCEPT BUTTON */}
            <button
              onClick={handleAccept}
              disabled={!canAfford}
              className={`relative w-[44%] max-w-[210px] aspect-[1790/332] transition-all drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] ${
                canAfford
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed grayscale-[25%]'
              }`}
              title={canAfford ? 'Accept this trade offer' : 'You do not have enough resources to accept'}
            >
              <Image
                src="/assets/ingame/trade/trade confirm/ingame_trade_offer_accept_button_en.png"
                alt="Accept"
                fill
                className="object-contain"
                priority
              />
            </button>
          </div>

          {/* Helper hint if player lacks resources */}
          {!canAfford && (
            <p className="font-serif text-[10.5px] sm:text-xs font-bold text-red-800/90 drop-shadow-xs text-center">
              ⚠️ You do not have enough resources to accept this offer
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
