'use client';

import Image from 'next/image';
import { GameState, BUILDING_COSTS, ResourceType } from '@/lib/catan/types';
import { hasEnoughResources } from '@/lib/catan/trade';
import {
  Hammer,
  Home,
  Castle,
  Layers,
  ArrowRightLeft,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

interface ActionPanelProps {
  gameState: GameState;
  currentUserId: string;
  buildMode: 'none' | 'road' | 'settlement' | 'city';
  setBuildMode: (mode: 'none' | 'road' | 'settlement' | 'city') => void;
  onRollDice: () => void;
  onBuyDevCard: () => void;
  onEndTurn: () => void;
  onOpenTrade: () => void;
  onOpenDevCards: () => void;
  onOpenRulebook: () => void;
}

// 3D Dice Face Dots Component
const DiceFace: React.FC<{ value: number }> = ({ value }) => {
  const dotPositions: Record<number, string[]> = {
    1: ['col-start-2 row-start-2'],
    2: ['col-start-1 row-start-1', 'col-start-3 row-start-3'],
    3: ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'],
    4: [
      'col-start-1 row-start-1',
      'col-start-3 row-start-1',
      'col-start-1 row-start-3',
      'col-start-3 row-start-3',
    ],
    5: [
      'col-start-1 row-start-1',
      'col-start-3 row-start-1',
      'col-start-2 row-start-2',
      'col-start-1 row-start-3',
      'col-start-3 row-start-3',
    ],
    6: [
      'col-start-1 row-start-1',
      'col-start-3 row-start-1',
      'col-start-1 row-start-2',
      'col-start-3 row-start-2',
      'col-start-1 row-start-3',
      'col-start-3 row-start-3',
    ],
  };

  const dots = dotPositions[value] || dotPositions[1];

  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-xl border-2 border-slate-300 shadow-[2px_4px_8px_rgba(0,0,0,0.6)] grid grid-cols-3 grid-rows-3 p-1.5 gap-0.5 items-center justify-items-center transform transition-transform hover:rotate-6">
      {dots.map((pos, i) => (
        <span key={i} className={`w-2 h-2 rounded-full bg-slate-900 ${pos}`} />
      ))}
    </div>
  );
};

export const ActionPanel: React.FC<ActionPanelProps> = ({
  gameState,
  currentUserId,
  buildMode,
  setBuildMode,
  onRollDice,
  onBuyDevCard,
  onEndTurn,
  onOpenTrade,
  onOpenDevCards,
  onOpenRulebook,
}) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  if (!myPlayer) return null;

  // Cost checks
  const canAffordRoad =
    hasEnoughResources(myPlayer, BUILDING_COSTS.road) && myPlayer.roadsLeft > 0;
  const canAffordSettlement =
    hasEnoughResources(myPlayer, BUILDING_COSTS.settlement) &&
    myPlayer.settlementsLeft > 0;
  const canAffordCity =
    hasEnoughResources(myPlayer, BUILDING_COSTS.city) && myPlayer.citiesLeft > 0;
  const canAffordDevCard =
    hasEnoughResources(myPlayer, BUILDING_COSTS.devCard) &&
    gameState.devCardDeck.length > 0;

  const dice1 = gameState.lastDiceRoll ? gameState.lastDiceRoll[0] : 3;
  const dice2 = gameState.lastDiceRoll ? gameState.lastDiceRoll[1] : 5;

  return (
    <div className="flex flex-col gap-3 w-full h-full justify-between pointer-events-auto select-none font-catan">
      
      {/* 1. MIDDLE: ACTION BUTTONS (Parchment Styled Stack) */}
      <div className="my-auto flex flex-col gap-2 p-3 bg-black/70 rounded-2xl border-2 border-catan-gold-trim/80 shadow-2xl backdrop-blur-md">
        {/* Button 1: Xây Đường */}
        <button
          onClick={() =>
            isMyTurn && setBuildMode(buildMode === 'road' ? 'none' : 'road')
          }
          disabled={
            !isMyTurn ||
            (!canAffordRoad && gameState.roadBuildingRoadsRemaining === 0)
          }
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-black text-xs sm:text-sm tracking-wide shadow-btn-wood transition-all
            ${
              buildMode === 'road'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 border-amber-200 scale-105 shadow-amber-400/40'
                : isMyTurn &&
                  (canAffordRoad || gameState.roadBuildingRoadsRemaining > 0)
                ? 'bg-gradient-to-r from-[#fbf1db] to-[#ecd7b0] text-[#3d2314] border-[#c49b63] hover:scale-[1.02] hover:brightness-105'
                : 'bg-[#ecd7b0]/40 text-[#3d2314]/40 border-[#c49b63]/30 cursor-not-allowed'
            }
          `}
        >
          <span className="text-xl">🪵</span>
          <span className="flex-1 text-left">Xây Đường</span>
          <span className="text-xs font-sans font-bold opacity-80">({myPlayer.roadsLeft})</span>
        </button>

        {/* Button 2: Xây Nhà */}
        <button
          onClick={() =>
            isMyTurn &&
            setBuildMode(buildMode === 'settlement' ? 'none' : 'settlement')
          }
          disabled={!isMyTurn || !canAffordSettlement}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-black text-xs sm:text-sm tracking-wide shadow-btn-wood transition-all
            ${
              buildMode === 'settlement'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 border-amber-200 scale-105 shadow-amber-400/40'
                : isMyTurn && canAffordSettlement
                ? 'bg-gradient-to-r from-[#fbf1db] to-[#ecd7b0] text-[#3d2314] border-[#c49b63] hover:scale-[1.02] hover:brightness-105'
                : 'bg-[#ecd7b0]/40 text-[#3d2314]/40 border-[#c49b63]/30 cursor-not-allowed'
            }
          `}
        >
          <Home className="w-5 h-5 text-amber-700" />
          <span className="flex-1 text-left">Xây Nhà</span>
          <span className="text-xs font-sans font-bold opacity-80">({myPlayer.settlementsLeft})</span>
        </button>

        {/* Button 3: Xây Thành Phố */}
        <button
          onClick={() =>
            isMyTurn && setBuildMode(buildMode === 'city' ? 'none' : 'city')
          }
          disabled={!isMyTurn || !canAffordCity}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-black text-xs sm:text-sm tracking-wide shadow-btn-wood transition-all
            ${
              buildMode === 'city'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 border-amber-200 scale-105 shadow-amber-400/40'
                : isMyTurn && canAffordCity
                ? 'bg-gradient-to-r from-[#fbf1db] to-[#ecd7b0] text-[#3d2314] border-[#c49b63] hover:scale-[1.02] hover:brightness-105'
                : 'bg-[#ecd7b0]/40 text-[#3d2314]/40 border-[#c49b63]/30 cursor-not-allowed'
            }
          `}
        >
          <Castle className="w-5 h-5 text-amber-700" />
          <span className="flex-1 text-left">Xây Thành Phố</span>
          <span className="text-xs font-sans font-bold opacity-80">({myPlayer.citiesLeft})</span>
        </button>

        {/* Button 4: Mua Bài Phát Triển */}
        <button
          onClick={onBuyDevCard}
          disabled={!isMyTurn || !canAffordDevCard}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-black text-xs sm:text-sm tracking-wide shadow-btn-wood transition-all
            ${
              isMyTurn && canAffordDevCard
                ? 'bg-gradient-to-r from-[#fbf1db] to-[#ecd7b0] text-[#3d2314] border-[#c49b63] hover:scale-[1.02] hover:brightness-105'
                : 'bg-[#ecd7b0]/40 text-[#3d2314]/40 border-[#c49b63]/30 cursor-not-allowed'
            }
          `}
        >
          <Layers className="w-5 h-5 text-amber-700" />
          <span className="flex-1 text-left">Mua Bài Phát Triển</span>
          <span className="text-xs font-sans font-bold opacity-80">({gameState.devCardDeck.length})</span>
        </button>

        {/* Trade quick link */}
        <button
          onClick={onOpenTrade}
          className="flex items-center justify-center gap-2 py-2 rounded-xl bg-catan-ocean/80 hover:bg-catan-ocean text-white font-bold text-xs border border-catan-gold-trim/60 shadow-sm transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" /> Giao Thương / Trao Đổi
        </button>
      </div>

      {/* 3. BOTTOM RIGHT: 3D DICE BOWL & END TURN BUTTON */}
      <div className="flex flex-col items-center gap-2.5">
        {/* Circular Dice Bowl */}
        <div
          onClick={() => {
            if (isMyTurn && gameState.phase === 'turn_roll_dice') {
              onRollDice();
            }
          }}
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#2d1b11] to-[#120a06] border-4 border-catan-gold-trim/90 flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(0,0,0,0.8)] cursor-pointer group transition-transform
            ${
              isMyTurn && gameState.phase === 'turn_roll_dice'
                ? 'ring-4 ring-amber-400/80 animate-bounce'
                : 'hover:scale-105'
            }
          `}
          title="Bấm để đổ xúc xắc"
        >
          <div className="absolute inset-2 rounded-full shadow-inset-wood pointer-events-none" />
          <DiceFace value={dice1} />
          <DiceFace value={dice2} />
        </div>

        {/* Big End Turn Button */}
        <button
          onClick={onEndTurn}
          disabled={!isMyTurn || gameState.phase === 'turn_roll_dice'}
          className={`w-full py-3 sm:py-3.5 px-6 rounded-2xl border-2 sm:border-3 font-black text-sm sm:text-base tracking-widest uppercase shadow-2xl transition-all font-catan
            ${
              isMyTurn && gameState.phase === 'turn_actions'
                ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-catan-gold-trim border-catan-gold-trim hover:brightness-125 active:scale-95 shadow-amber-500/20'
                : 'bg-black/60 text-catan-parchment/40 border-catan-dark-wood cursor-not-allowed'
            }
          `}
        >
          KẾT THÚC LƯỢT
        </button>
      </div>

    </div>
  );
};
