'use client';

import React from 'react';
import Image from 'next/image';
import { GameState, ResourceType } from '@/lib/catan/types';

interface PlayerHandProps {
  gameState: GameState;
  currentUserId: string;
  onOpenDevCards?: () => void;
}

const RESOURCE_CARDS_DATA: { type: ResourceType; img: string; name: string }[] = [
  { type: 'wood', img: '/assets/card_wood_user.png', name: 'Gỗ' },
  { type: 'brick', img: '/assets/card_brick_user.png', name: 'Gạch' },
  { type: 'sheep', img: '/assets/card_sheep_user.png', name: 'Cừu' },
  { type: 'wheat', img: '/assets/card_wheat_user.png', name: 'Lúa mì' },
  { type: 'ore', img: '/assets/card_ore_user.png', name: 'Đá quặng' },
];

export const PlayerHand: React.FC<PlayerHandProps> = ({
  gameState,
  currentUserId,
  onOpenDevCards,
}) => {
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  if (!myPlayer) return null;

  return (
    <div className="w-full max-w-5xl mx-auto flex items-end justify-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 px-2 sm:px-4 pointer-events-auto select-none font-catan drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] pb-1">
      {/* 5 Classic Resource Cards - Responsive Fluid Flexbox */}
      {RESOURCE_CARDS_DATA.map((card) => {
        const count = myPlayer.resources[card.type] || 0;

        return (
          <div
            key={card.type}
            className={`relative flex-1 max-w-[190px] min-w-[65px] aspect-[284/429] max-h-[26vh] transition-all duration-300 rounded-xl sm:rounded-2xl overflow-visible cursor-pointer group
              ${
                count > 0
                  ? 'hover:-translate-y-5 hover:scale-105 hover:drop-shadow-[0_20px_35px_rgba(245,158,11,0.6)] z-20'
                  : 'opacity-55 translate-y-3 hover:translate-y-0 hover:opacity-90 z-10'
              }
            `}
          >
            {/* Card Frame Image */}
            <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-3 border-[#5c3a21]/80 bg-[#fbf1db]">
              <Image
                src={card.img}
                alt={card.name}
                fill
                className={`object-contain ${count === 0 ? 'saturate-75 brightness-90' : ''}`}
                sizes="(max-width: 768px) 15vw, 190px"
                priority
              />
            </div>

            {/* Dynamic Realtime Quantity Badge in Top-Left (Fluid Scaled) */}
            <div className="absolute -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 md:-top-3 md:-left-3 w-[28%] min-w-[24px] max-w-[46px] aspect-square rounded-full bg-gradient-to-b from-[#fff2d1] to-[#e4c391] border-2 sm:border-3 border-[#8c6239] text-[#2b1704] font-black text-xs sm:text-sm md:text-base lg:text-lg flex items-center justify-center shadow-2xl font-sans z-30">
              {count}
            </div>

            {/* Hover Tooltip Label */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/95 border-2 border-catan-gold-trim text-xs sm:text-sm font-black text-catan-parchment whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 shadow-2xl">
              {card.name}: <span className="text-amber-300">{count}</span>
            </div>
          </div>
        );
      })}

      {/* 6th Card: CATAN Development Deck Back (Fluid Flexbox) */}
      <div
        onClick={onOpenDevCards}
        className="relative flex-1 max-w-[190px] min-w-[65px] aspect-[284/429] max-h-[26vh] transition-all duration-300 rounded-xl sm:rounded-2xl overflow-visible cursor-pointer group hover:-translate-y-5 hover:scale-105 hover:drop-shadow-[0_20px_35px_rgba(220,38,38,0.6)] z-20"
        title="Nhấp để xem / kích hoạt Thẻ Phát Triển"
      >
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-3 border-catan-gold-trim bg-[#7f1d1d]">
          <Image
            src="/assets/custom_card_catan_deck.png"
            alt="Thẻ Phát Triển Catan"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 15vw, 190px"
            priority
          />
        </div>

        {/* Badge showing count of owned dev cards */}
        {myPlayer.devCards.length > 0 && (
          <div className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full bg-purple-700 border-2 border-purple-300 text-white font-black text-[10px] sm:text-xs shadow-2xl animate-bounce z-30 font-sans">
            {myPlayer.devCards.length}
          </div>
        )}

        {/* Hover Tooltip */}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/95 border-2 border-catan-gold-trim text-xs sm:text-sm font-black text-catan-gold-trim whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 shadow-2xl">
          Thẻ Phát Triển ({myPlayer.devCards.length})
        </div>
      </div>
    </div>
  );
};
