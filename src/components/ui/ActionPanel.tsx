'use client';

import React from 'react';
import { GameState, BUILDING_COSTS, ResourceType } from '@/lib/catan/types';
import { hasEnoughResources } from '@/lib/catan/trade';
import {
  Dices,
  Hammer,
  Building,
  Castle,
  Layers,
  ArrowRightLeft,
  BookOpen,
  CheckCircle,
  HelpCircle,
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

  // Determine status message
  let statusMessage = '';
  if (gameState.phase === 'setup_round_1' || gameState.phase === 'setup_round_2') {
    const activePlayer = gameState.players.find((p) => p.id === activePlayerId);
    if (isMyTurn) {
      statusMessage =
        gameState.setupSubStep === 'place_settlement'
          ? '📍 Chọn 1 điểm phát sáng trên bàn cờ để đặt Làng khởi đầu.'
          : '🛣️ Chọn 1 cạnh phát sáng nối từ Làng vừa đặt để xây Đường.';
    } else {
      statusMessage = `⏳ Đang chờ ${activePlayer?.name} thiết lập Làng & Đường khởi đầu...`;
    }
  } else if (gameState.phase === 'turn_roll_dice') {
    statusMessage = isMyTurn
      ? '🎲 Đến lượt của Bạn! Hãy nhấn "Gieo Xúc Xắc".'
      : `⏳ Đang chờ ${gameState.players.find((p) => p.id === activePlayerId)?.name} gieo xúc xắc...`;
  } else if (gameState.phase === 'turn_robber_discard') {
    statusMessage = '⚠️ Tướng cướp xuất hiện! Những người chơi có >7 thẻ phải xả bớt một nửa số thẻ.';
  } else if (gameState.phase === 'turn_robber_move') {
    statusMessage = isMyTurn
      ? '🦹 Chọn 1 ô lục giác mới để di chuyển Tướng cướp đến đó.'
      : `🦹 Đang chờ ${gameState.players.find((p) => p.id === activePlayerId)?.name} di chuyển Tướng cướp...`;
  } else if (gameState.phase === 'turn_robber_steal') {
    statusMessage = isMyTurn
      ? '🎯 Chọn 1 đối thủ tại ô vừa cướp để lấy 1 thẻ tài nguyên.'
      : '🦹 Tướng cướp đang chọn đối thủ để cướp tài nguyên...';
  } else if (gameState.phase === 'turn_actions') {
    if (isMyTurn) {
      if (gameState.roadBuildingRoadsRemaining > 0) {
        statusMessage = `🛣️ Thẻ Xây đường: Chọn ${gameState.roadBuildingRoadsRemaining} cạnh để đặt đường miễn phí!`;
      } else if (buildMode === 'road') {
        statusMessage = '📍 Nhấp vào một cạnh phát sáng trên bàn cờ để xây Đường.';
      } else if (buildMode === 'settlement') {
        statusMessage = '📍 Nhấp vào một đỉnh phát sáng trên bàn cờ để xây Làng.';
      } else if (buildMode === 'city') {
        statusMessage = '📍 Nhấp vào một Ngôi Làng của bạn trên bàn cờ để nâng cấp lên Thành Phố.';
      } else {
        statusMessage = '⚔️ Lượt hành động: Bạn có thể Giao thương, Xây dựng, Dùng thẻ hoặc Kết thúc lượt.';
      }
    } else {
      statusMessage = `⏳ Đang chờ ${gameState.players.find((p) => p.id === activePlayerId)?.name} thực hiện hành động...`;
    }
  }

  // Cost checks
  const canAffordRoad = hasEnoughResources(myPlayer, BUILDING_COSTS.road) && myPlayer.roadsLeft > 0;
  const canAffordSettlement = hasEnoughResources(myPlayer, BUILDING_COSTS.settlement) && myPlayer.settlementsLeft > 0;
  const canAffordCity = hasEnoughResources(myPlayer, BUILDING_COSTS.city) && myPlayer.citiesLeft > 0;
  const canAffordDevCard = hasEnoughResources(myPlayer, BUILDING_COSTS.devCard) && gameState.devCardDeck.length > 0;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto pointer-events-auto px-2">
      {/* Dynamic Status Toast Banner */}
      <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium shadow-2xl animate-fade-in">
        <span className="text-base">📢</span>
        <span>{statusMessage}</span>
      </div>

      {/* Main Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2.5 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
        {/* Roll Dice Button */}
        {isMyTurn && gameState.phase === 'turn_roll_dice' && (
          <button
            onClick={onRollDice}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/30 transform active:scale-95 transition-all animate-bounce"
          >
            <Dices className="w-5 h-5" />
            Gieo Xúc Xắc
          </button>
        )}

        {/* Action Phase Buttons */}
        {isMyTurn && gameState.phase === 'turn_actions' && (
          <>
            {/* Build Road */}
            <button
              onClick={() => setBuildMode(buildMode === 'road' ? 'none' : 'road')}
              disabled={!canAffordRoad && gameState.roadBuildingRoadsRemaining === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                buildMode === 'road'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-300'
                  : canAffordRoad || gameState.roadBuildingRoadsRemaining > 0
                  ? 'bg-slate-800/90 text-white border-slate-600 hover:bg-slate-700'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
              title="1 Gỗ + 1 Gạch"
            >
              <Hammer className="w-4 h-4 text-amber-400" />
              Đường ({myPlayer.roadsLeft})
            </button>

            {/* Build Settlement */}
            <button
              onClick={() => setBuildMode(buildMode === 'settlement' ? 'none' : 'settlement')}
              disabled={!canAffordSettlement}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                buildMode === 'settlement'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-300'
                  : canAffordSettlement
                  ? 'bg-slate-800/90 text-white border-slate-600 hover:bg-slate-700'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
              title="1 Gỗ + 1 Gạch + 1 Cừu + 1 Lúa mì"
            >
              <Building className="w-4 h-4 text-emerald-400" />
              Làng ({myPlayer.settlementsLeft})
            </button>

            {/* Upgrade City */}
            <button
              onClick={() => setBuildMode(buildMode === 'city' ? 'none' : 'city')}
              disabled={!canAffordCity}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                buildMode === 'city'
                  ? 'bg-blue-500 text-slate-950 border-blue-400 ring-2 ring-blue-300'
                  : canAffordCity
                  ? 'bg-slate-800/90 text-white border-slate-600 hover:bg-slate-700'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
              title="2 Lúa mì + 3 Đá"
            >
              <Castle className="w-4 h-4 text-blue-400" />
              Thành phố ({myPlayer.citiesLeft})
            </button>

            {/* Buy Dev Card */}
            <button
              onClick={onBuyDevCard}
              disabled={!canAffordDevCard}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                canAffordDevCard
                  ? 'bg-purple-900/80 text-purple-200 border-purple-500 hover:bg-purple-800'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
              title="1 Cừu + 1 Lúa mì + 1 Đá"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              Mua Thẻ ({gameState.devCardDeck.length})
            </button>

            {/* Trade Button */}
            <button
              onClick={onOpenTrade}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Giao Thương
            </button>

            {/* Play Dev Cards Hand */}
            {myPlayer.devCards.length > 0 && (
              <button
                onClick={onOpenDevCards}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-600 transition-all"
              >
                🎴 Thẻ ({myPlayer.devCards.length})
              </button>
            )}

            {/* End Turn */}
            <button
              onClick={onEndTurn}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 active:scale-95 transition-all ml-1"
            >
              <CheckCircle className="w-4 h-4" />
              Xong Lượt
            </button>
          </>
        )}

        {/* Rulebook Modal Button */}
        <button
          onClick={onOpenRulebook}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
          title="Xem Sổ tay Luật chơi & Bảng tra cứu"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          Luật chơi
        </button>
      </div>
    </div>
  );
};
