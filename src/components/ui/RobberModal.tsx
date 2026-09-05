'use client';

import React, { useState, useEffect } from 'react';
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

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;

  // Case 1: Discard Phase (I must discard)
  const discardStatus = gameState.discardStatus[currentUserId];
  const mustDiscard =
    gameState.phase === 'turn_robber_discard' &&
    discardStatus &&
    !discardStatus.hasDiscarded;

  // Case 2: Steal Phase (Active player steals)
  const mustSteal =
    gameState.phase === 'turn_robber_steal' &&
    isMyTurn &&
    gameState.stealingEligiblePlayerIds.length > 0;

  // Case 3: Waiting Phase (Waiting for other players to finish discarding)
  const isWaitingForDiscards =
    gameState.phase === 'turn_robber_discard' &&
    (!discardStatus || discardStatus.hasDiscarded);

  // Reset discard form when a new discard phase arrives
  useEffect(() => {
    if (gameState.phase === 'turn_robber_discard') {
      setDiscarding({
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0,
      });
    }
  }, [gameState.phase, gameState.turnNumber]);

  if (!myPlayer || (!mustDiscard && !mustSteal && !isWaitingForDiscards)) return null;

  // --- CASE 3: RENDER WAITING FOR DISCARDS MODAL ---
  if (isWaitingForDiscards) {
    const pendingPlayers = gameState.players.filter(
      (p) => gameState.discardStatus[p.id] && !gameState.discardStatus[p.id].hasDiscarded
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-catan">
        <div className="relative w-full max-w-xl sm:max-w-2xl aspect-[1425/961] max-h-[90vh] flex flex-col justify-center items-center select-none text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          {/* Background Modal Frame Asset */}
          <Image
            src="/assets/ingame/ingame_waiting_for_discards_modal_en.png"
            alt="Waiting for Discards"
            fill
            className="object-contain pointer-events-none drop-shadow-2xl"
            priority
          />

          {/* Realtime Waiting Status Badge on bottom wooden shelf */}
          {pendingPlayers.length > 0 && (
            <div className="absolute bottom-[4.5%] sm:bottom-[5.5%] inset-x-0 flex items-center justify-center pointer-events-none z-20">
              <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#180e06]/92 border border-[#d4af37]/70 shadow-[0_4px_12px_rgba(0,0,0,0.85)] backdrop-blur-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-vietnam text-xs sm:text-[13px] text-[#fef08a] font-medium tracking-wide">
                  Đang đợi:{' '}
                  <strong className="text-amber-300 font-bold">
                    {pendingPlayers
                      .map((p) => `${p.name} (bỏ ${gameState.discardStatus[p.id]?.requiredCount} thẻ)`)
                      .join(', ')}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Discard logic
  const selectedDiscardCount = Object.values(discarding).reduce((a, b) => a + b, 0);
  const requiredDiscardCount = discardStatus?.requiredCount || 0;

  const handleDiscardSubmit = () => {
    if (selectedDiscardCount === requiredDiscardCount) {
      onSubmitDiscard(discarding);
    }
  };

  // Filter only resources the player currently owns (> 0)
  const availableResources = RESOURCE_CONFIG.filter(
    (r) => (myPlayer.resources[r.type] || 0) > 0
  );

  const modalFrameSrc = mustDiscard
    ? '/assets/ingame/ingame_discard_half_resource_modal_en.png'
    : '/assets/ingame/ingame_discard_resource_modal.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan">
      <div className="relative w-full max-w-xl sm:max-w-2xl aspect-[1397/1123] max-h-[92vh] flex flex-col justify-center items-center select-none text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        {/* Background Modal Frame Image */}
        <Image
          src={modalFrameSrc}
          alt="Robber Modal Frame"
          fill
          className="object-contain pointer-events-none drop-shadow-2xl"
          priority
        />

        {/* Center Content Area: Mapped inside the dark wood insert window, shifted down to avoid top frame overlap */}
        <div className="absolute inset-x-[8%] top-[34.5%] bottom-[22.5%] flex flex-col justify-start overflow-hidden px-2 sm:px-3 py-1.5 sm:py-2 select-none">
          {/* A. STEAL PHASE: Opponents list */}
          {mustSteal && (
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full h-full overflow-y-auto pr-1 ingame-scrollbar">
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
                    className="group relative w-full px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-b from-[#251509] via-[#170c05] to-[#100703] border-2 border-[#c59a3f] shadow-[0_8px_20px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,230,150,0.25),inset_0_-2px_4px_rgba(0,0,0,0.9)] hover:border-[#f0c265] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between select-none"
                  >
                    {/* Left: Avatar / Initials Circle Token */}
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

                    {/* Right: Steal Button */}
                    <div className="flex items-center shrink-0 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStealResource(victim.id);
                        }}
                        className="relative group/btn px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border-2 border-[#a87d3b] bg-gradient-to-b from-[#1a384e] via-[#112636] to-[#0a1722] shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.9)] hover:from-[#224864] hover:via-[#163146] hover:to-[#0e1f2d] hover:border-[#c59549] active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#a87d3b] border border-[#0a1722] shadow-sm pointer-events-none group-hover/btn:bg-[#c59549]" />
                        <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#a87d3b] border border-[#0a1722] shadow-sm pointer-events-none group-hover/btn:bg-[#c59549]" />

                        <span className="font-serif font-bold text-xs sm:text-sm text-[#ece4d0] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                          STEAL 1 CARD
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. DISCARD PHASE: Only owned resources + Always-visible Confirm button */}
          {mustDiscard && (
            <div className="flex h-full w-full flex-col justify-between select-none">
              {/* Scrollable / Flexible Resource List */}
              <div className="flex-1 overflow-y-auto pr-1 ingame-scrollbar flex flex-col gap-2 sm:gap-2.5 pt-0.5">
                {availableResources.length === 0 ? (
                  <div className="my-auto text-center font-vietnam text-xs sm:text-sm text-stone-400 py-4">
                    Bạn không có tài nguyên nào để bỏ.
                  </div>
                ) : (
                  availableResources.map((r) => {
                    const available = myPlayer.resources[r.type] || 0;
                    const chosen = discarding[r.type] || 0;

                    return (
                      <div
                        key={r.type}
                        className="flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#281509]/95 via-[#180e05]/95 to-[#281509]/95 border-2 border-[#c59a3f] shadow-[0_4px_14px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,225,140,0.25)] hover:border-[#f0c265] transition-all"
                      >
                        {/* Resource Icon & Name */}
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                            <Image src={r.iconSrc} alt={r.label} fill className="object-contain drop-shadow" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-serif text-xs sm:text-sm font-bold text-[#fcfbf9] drop-shadow-sm">
                              {r.nameEn} <span className="text-[10px] sm:text-[11px] text-stone-300 font-vietnam font-normal">({r.label})</span>
                            </span>
                            <span className="text-[11px] sm:text-xs text-stone-300 font-vietnam">
                              Đang có: <strong className="text-[#fde047] font-black">{available}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Counter Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => setDiscarding((p) => ({ ...p, [r.type]: Math.max(0, chosen - 1) }))}
                            disabled={chosen <= 0}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-b from-[#3a2010] to-[#1f1008] hover:from-[#4d2c16] hover:to-[#2c170b] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-[#c59a3f] text-[#ffd700] flex items-center justify-center font-bold transition-all shadow-md cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <div className="min-w-[1.75rem] text-center font-cinzel text-sm sm:text-base md:text-lg font-black text-[#ffd700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {chosen}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDiscarding((p) => ({
                                ...p,
                                [r.type]: Math.min(available, chosen + 1),
                              }))
                            }
                            disabled={chosen >= available || selectedDiscardCount >= requiredDiscardCount}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-b from-[#3a2010] to-[#1f1008] hover:from-[#4d2c16] hover:to-[#2c170b] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-[#c59a3f] text-[#ffd700] flex items-center justify-center font-bold transition-all shadow-md cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Fixed, Always-Visible Confirm Button */}
              <div className="pt-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDiscardSubmit}
                  disabled={selectedDiscardCount !== requiredDiscardCount}
                  className={`w-full py-2.5 sm:py-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                    selectedDiscardCount === requiredDiscardCount
                      ? 'bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#991b1b] hover:from-[#dc2626] hover:to-[#ef4444] text-white border-2 border-amber-400 cursor-pointer active:scale-98 shadow-[0_4px_16px_rgba(220,38,38,0.7)]'
                      : 'bg-[#23150c] text-stone-500 border-2 border-[#5c3c1d]/80 cursor-not-allowed opacity-70'
                  }`}
                >
                  CONFIRM DISCARD ({selectedDiscardCount} / {requiredDiscardCount})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
