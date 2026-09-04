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
  { type: 'wood', img: '/assets/card_wood_user.png', name: 'Lumber' },
  { type: 'brick', img: '/assets/card_brick_user.png', name: 'Brick' },
  { type: 'sheep', img: '/assets/card_sheep_user.png', name: 'Wool' },
  { type: 'wheat', img: '/assets/card_wheat_user.png', name: 'Grain' },
  { type: 'ore', img: '/assets/card_ore_user.png', name: 'Ore' },
];

export const PlayerHand: React.FC<PlayerHandProps> = ({
  gameState,
  currentUserId,
  onOpenDevCards,
}) => {
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  if (!myPlayer) return null;

  const devCardCount = myPlayer.devCards.length;

  return (
    <div className="w-full max-w-5xl mx-auto flex items-end justify-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 px-2 sm:px-4 pointer-events-auto select-none font-cinzel drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] pb-1">
      {/* 5 Classic Resource Cards - Uniform Baseline Alignment */}
      {RESOURCE_CARDS_DATA.map((card) => {
        const count = myPlayer.resources[card.type] || 0;

        return (
          <div
            key={card.type}
            className={`relative flex-1 max-w-[190px] min-w-[65px] aspect-[284/429] max-h-[26vh] transition-all duration-300 rounded-xl sm:rounded-2xl overflow-visible cursor-pointer group
              ${
                count > 0
                  ? 'opacity-100 hover:-translate-y-4 hover:scale-105 hover:drop-shadow-[0_16px_30px_rgba(245,158,11,0.5)] z-20'
                  : 'opacity-60 hover:opacity-90 hover:-translate-y-2 z-10'
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

            {/* Dynamic Realtime Quantity Badge in Top-Left (Aged Gold Styled) */}
            <div className="absolute -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 md:-top-3 md:-left-3 w-[28%] min-w-[24px] max-w-[44px] aspect-square rounded-full bg-gradient-to-b from-[#2a1a0c] via-[#170e06] to-[#0b0602] border-2 sm:border-[2.5px] border-[#d4a034] text-[#f2cf7e] font-cinzel font-black text-xs sm:text-sm md:text-base flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,225,140,0.3)] z-30">
              {count}
            </div>

            {/* Hover Tooltip Label */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-[#140d07]/95 border border-[#9b6f28] font-cinzel font-bold text-xs sm:text-sm text-[#f5d070] tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 shadow-[0_4px_12px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              {card.name}: <span className="text-[#ffe082]">{count}</span>
            </div>
          </div>
        );
      })}

      {/* 6th Card: CATAN Development Deck Back (Uniform Baseline Alignment) */}
      <div
        onClick={onOpenDevCards}
        className={`relative flex-1 max-w-[190px] min-w-[65px] aspect-[284/429] max-h-[26vh] transition-all duration-300 rounded-xl sm:rounded-2xl overflow-visible cursor-pointer group
          ${
            devCardCount > 0
              ? 'opacity-100 hover:-translate-y-4 hover:scale-105 hover:drop-shadow-[0_16px_30px_rgba(168,85,247,0.5)] z-20'
              : 'opacity-60 hover:opacity-90 hover:-translate-y-2 z-10'
          }
        `}
        title="Click to view / play Development Cards"
      >
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-3 border-[#5c3a21]/80 bg-[#7f1d1d]">
          <Image
            src="/assets/custom_card_catan_deck.png"
            alt="Development Cards"
            fill
            className={`object-cover ${devCardCount === 0 ? 'saturate-75 brightness-90' : ''}`}
            sizes="(max-width: 768px) 15vw, 190px"
            priority
          />
        </div>

        {/* Dynamic Quantity Badge in Top-Left (Identical to Resource Cards) */}
        <div className="absolute -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 md:-top-3 md:-left-3 w-[28%] min-w-[24px] max-w-[44px] aspect-square rounded-full bg-gradient-to-b from-[#2a1a0c] via-[#170e06] to-[#0b0602] border-2 sm:border-[2.5px] border-[#d4a034] text-[#f2cf7e] font-cinzel font-black text-xs sm:text-sm md:text-base flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,225,140,0.3)] z-30">
          {devCardCount}
        </div>

        {/* Hover Tooltip */}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-[#140d07]/95 border border-[#9b6f28] font-cinzel font-bold text-xs sm:text-sm text-[#f5d070] tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 shadow-[0_4px_12px_rgba(0,0,0,0.8)] backdrop-blur-sm">
          Development Cards ({devCardCount})
        </div>
      </div>
    </div>
  );
};
