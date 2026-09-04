'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GameState, ResourceType } from '@/lib/catan/types';
import { Minus, Plus } from 'lucide-react';

interface RobberModalProps {
  gameState: GameState;
  currentUserId: string;
  onSubmitDiscard: (discarded: Partial<Record<ResourceType, number>>) => void;
  onStealResource: (victimPlayerId: string) => void;
}

function getPlayerInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const PLAYER_COLOR_THEMES: Record<
  string,
  { gradient: string; borderColor: string; ringColor: string }
> = {
  blue: {
    gradient: 'from-[#0c5a94] via-[#04335c] to-[#021d36]',
    borderColor: '#38bdf8',
    ringColor: '#f3c14b',
  },
  red: {
    gradient: 'from-[#b91c1c] via-[#7f1d1d] to-[#450a0a]',
    borderColor: '#f87171',
    ringColor: '#f3c14b',
  },
  green: {
    gradient: 'from-[#15803d] via-[#14532d] to-[#052e16]',
    borderColor: '#4ade80',
    ringColor: '#f3c14b',
  },
  orange: {
    gradient: 'from-[#c2410c] via-[#7c2d12] to-[#431407]',
    borderColor: '#fb923c',
    ringColor: '#f3c14b',
  },
  yellow: {
    gradient: 'from-[#a16207] via-[#713f12] to-[#422006]',
    borderColor: '#facc15',
    ringColor: '#f3c14b',
  },
  brown: {
    gradient: 'from-[#78350f] via-[#451a03] to-[#291003]',
    borderColor: '#d97706',
    ringColor: '#f3c14b',
  },
};

const RESOURCE_CONFIG: { type: ResourceType; label: string; nameEn: string; iconSrc: string }[] = [
  { type: 'wood', label: 'Gỗ', nameEn: 'Lumber', iconSrc: '/assets/icons/timber.png' },
  { type: 'brick', label: 'Gạch', nameEn: 'Brick', iconSrc: '/assets/icons/brick.png' },
  { type: 'sheep', label: 'Cừu', nameEn: 'Wool', iconSrc: '/assets/icons/sheep.png' },
  { type: 'wheat', label: 'Lúa mì', nameEn: 'Grain', iconSrc: '/assets/icons/wheat.png' },
  { type: 'ore', label: 'Quặng', nameEn: 'Ore', iconSrc: '/assets/icons/ore.png' },
];

export const RobberModal: React.FC<RobberModalProps> = ({
  gameState,
  currentUserId,
  onSubmitDiscard,
  onStealResource,
}) => {
  const [discarding, setDiscarding] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  if (!myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;

  // Case 1: Discard Phase
  const discardStatus = gameState.discardStatus[currentUserId];
  const mustDiscard =
    gameState.phase === 'turn_robber_discard' &&
    discardStatus &&
    !discardStatus.hasDiscarded;

  // Case 2: Steal Phase
  const mustSteal =
    gameState.phase === 'turn_robber_steal' &&
    isMyTurn &&
    gameState.stealingEligiblePlayerIds.length > 0;

  if (!mustDiscard && !mustSteal) return null;

  // Discard logic
  const selectedDiscardCount = Object.values(discarding).reduce((a, b) => a + b, 0);
  const requiredDiscardCount = discardStatus?.requiredCount || 0;

  const handleDiscardSubmit = () => {
    if (selectedDiscardCount === requiredDiscardCount) {
      onSubmitDiscard(discarding);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan">
      <div className="relative w-full max-w-xl sm:max-w-2xl aspect-[1402/1122] max-h-[92vh] flex flex-col justify-center items-center select-none text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        {/* Background Modal Frame Image (Contains pre-rendered Header, Skull & Footer text) */}
        <Image
          src="/assets/ingame/ingame_discard_resource_modal.png"
          alt="Discard Resource Modal Frame"
          fill
          className="object-contain pointer-events-none drop-shadow-2xl"
          priority
        />

        {/* Center Content Area: Mapped directly inside the dark wood insert window, aligned to top */}
        <div className="absolute inset-x-[7.5%] top-[33.5%] bottom-[20.5%] flex flex-col justify-start overflow-y-auto px-2.5 sm:px-3.5 py-3 sm:py-3.5 scrollbar-thin">
          {/* A. STEAL PHASE: Opponents list rendered with custom wood row matching design */}
          {mustSteal && (
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
              {gameState.stealingEligiblePlayerIds.map((victimId) => {
                const victim = gameState.players.find((p) => p.id === victimId);
                if (!victim) return null;
                const totalCards = Object.values(victim.resources).reduce((a, b) => a + b, 0);
                const colorTheme =
                  PLAYER_COLOR_THEMES[victim.color] || PLAYER_COLOR_THEMES.blue;

                return (
                  <div
                    key={victim.id}
                    onClick={() => onStealResource(victim.id)}
                    className="group relative w-full px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-b from-[#251509] via-[#170c05] to-[#100703] border-2 border-[#825424] shadow-[0_8px_20px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,230,150,0.25),inset_0_-2px_4px_rgba(0,0,0,0.9)] hover:border-[#b87c39] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between select-none"
                  >
                    {/* Left: Avatar / Initials Circle Token with Double Gold Ring */}
                    <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0">
                      <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-[#f3c14b] shadow-[0_3px_10px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.35)] p-0.5 flex items-center justify-center shrink-0 bg-[#0f0904]">
                        <div
                          className={`w-full h-full rounded-full bg-gradient-to-b ${colorTheme.gradient} flex items-center justify-center shadow-inner overflow-hidden`}
                        >
                          <span className="font-serif font-black text-sm sm:text-base text-[#fff6d6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
                            {getPlayerInitials(victim.name)}
                          </span>
                        </div>
                      </div>

                      {/* Center: Player Name & Holding Stats */}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-white tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
                          {victim.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {/* Card Icon */}
                          <div className="relative w-3.5 h-4.5 sm:w-4 sm:h-5 rounded-[3px] bg-gradient-to-b from-[#ecd08a] via-[#c99839] to-[#805517] border border-[#ffe8a3] flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-[7px] sm:text-[8px] text-[#422606] font-black">♦</span>
                          </div>
                          <span className="font-serif text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#cbb596]">
                            HOLDING:
                          </span>
                          <span className="font-serif text-xs sm:text-sm font-black text-[#f5b829] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {totalCards}
                          </span>
                          <span className="font-serif text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#cbb596]">
                            CARDS
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Ornate Blue Badge Button */}
                    <div className="flex items-center shrink-0 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStealResource(victim.id);
                        }}
                        className="relative group/btn px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border-2 border-[#a87d3b] bg-gradient-to-b from-[#1a384e] via-[#112636] to-[#0a1722] shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.9)] hover:from-[#224864] hover:via-[#163146] hover:to-[#0e1f2d] hover:border-[#c59549] active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        {/* Left Diamond Pip */}
                        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#a87d3b] border border-[#0a1722] shadow-sm pointer-events-none group-hover/btn:bg-[#c59549]" />
                        {/* Right Diamond Pip */}
                        <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#a87d3b] border border-[#0a1722] shadow-sm pointer-events-none group-hover/btn:bg-[#c59549]" />

                        <span className="font-serif font-bold text-xs sm:text-sm text-[#ece4d0] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                          DISCARD 1 CARD
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. DISCARD PHASE: 5 Resource rows */}
          {mustDiscard && (
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
              {RESOURCE_CONFIG.map((r) => {
                const available = myPlayer.resources[r.type] || 0;
                const chosen = discarding[r.type] || 0;

                return (
                  <div
                    key={r.type}
                    className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#140d07]/90 border border-[#442c16]/80 shadow-md"
                  >
                    {/* Resource Icon & Name */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <Image src={r.iconSrc} alt={r.label} fill className="object-contain drop-shadow" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-serif text-xs sm:text-sm font-bold text-[#fcfbf9]">
                          {r.nameEn} <span className="text-[10px] sm:text-[11px] text-stone-400 font-vietnam font-normal">({r.label})</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-vietnam">
                          Đang có: <strong className="text-amber-300 font-bold">{available}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Counter Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setDiscarding((p) => ({ ...p, [r.type]: Math.max(0, chosen - 1) }))}
                        disabled={chosen <= 0}
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-[#2b170c] hover:bg-[#3d2312] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-[#5a3619] text-[#fcd34d] flex items-center justify-center font-bold transition-all shadow cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <div className="min-w-[1.5rem] text-center font-serif text-xs sm:text-sm md:text-base font-bold text-[#f5b829] drop-shadow">
                        {chosen}
                      </div>
                      <button
                        onClick={() =>
                          setDiscarding((p) => ({
                            ...p,
                            [r.type]: Math.min(available, chosen + 1),
                          }))
                        }
                        disabled={chosen >= available || selectedDiscardCount >= requiredDiscardCount}
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-[#2b170c] hover:bg-[#3d2312] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-[#5a3619] text-[#fcd34d] flex items-center justify-center font-bold transition-all shadow cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Confirm Discard Button */}
              <button
                onClick={handleDiscardSubmit}
                disabled={selectedDiscardCount !== requiredDiscardCount}
                className={`w-full py-2 sm:py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm uppercase tracking-wider transition-all mt-1 shadow-lg ${
                  selectedDiscardCount === requiredDiscardCount
                    ? 'bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#991b1b] hover:from-[#dc2626] hover:to-[#ef4444] text-white border border-red-400 cursor-pointer active:scale-98'
                    : 'bg-[#2b1b11] text-stone-500 border border-[#3e2714] cursor-not-allowed opacity-60'
                }`}
              >
                CONFIRM DISCARD ({selectedDiscardCount} / {requiredDiscardCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
