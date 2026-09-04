'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GameState, BUILDING_COSTS } from '@/lib/catan/types';
import { hasEnoughResources } from '@/lib/catan/trade';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

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
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isBuildOpen, setIsBuildOpen] = useState(true);

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  if (!myPlayer) return null;

  // Check building affordability & remaining pieces
  const canAffordRoad = hasEnoughResources(myPlayer, BUILDING_COSTS.road) && myPlayer.roadsLeft > 0;
  const canAffordSettlement = hasEnoughResources(myPlayer, BUILDING_COSTS.settlement) && myPlayer.settlementsLeft > 0;
  const canAffordCity = hasEnoughResources(myPlayer, BUILDING_COSTS.city) && myPlayer.citiesLeft > 0;
  const canAffordDevCard = hasEnoughResources(myPlayer, BUILDING_COSTS.devCard) && gameState.devCardDeck.length > 0;
  const diceTotal = gameState.lastDiceRoll ? gameState.lastDiceRoll[0] + gameState.lastDiceRoll[1] : null;

  const isTurnActionPhase = gameState.phase === 'turn_actions';
  const isRollDicePhase = gameState.phase === 'turn_roll_dice';

  return (
    <div className="flex h-full w-full flex-col justify-between gap-2.5 sm:gap-3 pointer-events-auto select-none font-catan">
      {/* 1. ACTIONS MAIN CARD */}
      <div className="flex w-full flex-col gap-2 rounded-2xl bg-[#140d07]/92 p-2.5 sm:p-3 border border-[#442c16]/90 shadow-[0_12px_28px_rgba(0,0,0,0.75)] backdrop-blur-md">
        {/* Actions Title Bar */}
        <button
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          className="flex w-full items-center justify-between px-1.5 py-1 text-left cursor-pointer transition hover:opacity-90"
        >
          <span className="font-serif text-xs sm:text-sm font-bold tracking-widest text-[#e5b84c] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            ACTIONS
          </span>
          {isActionsOpen ? (
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200/80" />
          ) : (
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200/80" />
          )}
        </button>

        {isActionsOpen && (
          <div className="flex flex-col gap-2 pt-0.5">
            {/* 1.1 BUILD GROUP */}
            <div className="overflow-hidden rounded-xl border border-[#3e2714]/90 bg-[#181009]/90 shadow-md">
              {/* Build Header (Collapsible) */}
              <button
                onClick={() => setIsBuildOpen(!isBuildOpen)}
                className="flex w-full items-center justify-between border-b border-[#352010]/80 bg-[#1f140b]/90 px-3 py-2 cursor-pointer transition hover:bg-[#281a0e]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                    <Image
                      src="/assets/ingame/ingame_action_build.png"
                      alt="Build"
                      fill
                      className="object-contain drop-shadow"
                    />
                  </div>
                  <span className="font-serif text-xs sm:text-sm font-bold tracking-wider text-[#e5b84c] uppercase">
                    BUILD
                  </span>
                </div>
                {isBuildOpen ? (
                  <ChevronUp className="h-4 w-4 text-amber-200/70" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-amber-200/70" />
                )}
              </button>

              {/* Build Items (Road, Settlement, City) */}
              {isBuildOpen && (
                <div className="flex flex-col divide-y divide-[#2c1a0c]">
                  {/* --- ROAD ROW --- */}
                  <button
                    onClick={() => {
                      if (!isMyTurn || !isTurnActionPhase) return;
                      setBuildMode(buildMode === 'road' ? 'none' : 'road');
                    }}
                    disabled={!isMyTurn || !isTurnActionPhase || (!canAffordRoad && gameState.roadBuildingRoadsRemaining === 0) || myPlayer.roadsLeft === 0}
                    className={`group flex w-full items-center gap-2.5 p-2 sm:p-2.5 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                      buildMode === 'road'
                        ? 'border-l-4 border-amber-400 bg-gradient-to-r from-[#382210] to-[#201308] shadow-inner'
                        : 'hover:bg-[#24170d]'
                    }`}
                  >
                    {/* 3D Road Piece Icon */}
                    <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 flex items-center justify-center">
                      <Image
                        src="/assets/ingame/ingame_road_piece.png"
                        alt="Road Piece"
                        fill
                        className="object-contain drop-shadow"
                      />
                    </div>

                    {/* Road Info & Costs */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#fcfbf9] font-vietnam">
                          Road
                        </span>
                        <span className="text-[10px] text-stone-400 font-vietnam">
                          còn {myPlayer.roadsLeft}
                        </span>
                      </div>

                      {/* VP + Resource Costs */}
                      <div className="mt-1 flex items-center gap-2.5 font-vietnam">
                        {/* 0 VP */}
                        <div className="flex items-center gap-0.5">
                          <div className="relative h-3 w-2.5 shrink-0 opacity-80">
                            <Image
                              src="/assets/ingame/ingame_card_icon.svg"
                              alt="VP"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#d6c7b0]">0</span>
                        </div>

                        {/* Cost: 1 Timber + 1 Brick */}
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[#f2e6cb]">
                          <div className="flex items-center gap-0.5" title="1 Gỗ (Timber)">
                            <Image src="/assets/icons/timber.png" alt="Gỗ" width={13} height={13} className="object-contain" />
                            <span>1</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="1 Gạch (Brick)">
                            <Image src="/assets/icons/brick.png" alt="Gạch" width={13} height={13} className="object-contain" />
                            <span>1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* --- SETTLEMENT ROW --- */}
                  <button
                    onClick={() => {
                      if (!isMyTurn || !isTurnActionPhase) return;
                      setBuildMode(buildMode === 'settlement' ? 'none' : 'settlement');
                    }}
                    disabled={!isMyTurn || !isTurnActionPhase || !canAffordSettlement || myPlayer.settlementsLeft === 0}
                    className={`group flex w-full items-center gap-2.5 p-2 sm:p-2.5 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                      buildMode === 'settlement'
                        ? 'border-l-4 border-amber-400 bg-gradient-to-r from-[#382210] to-[#201308] shadow-inner'
                        : 'hover:bg-[#24170d]'
                    }`}
                  >
                    {/* 3D Settlement Piece Icon */}
                    <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 flex items-center justify-center">
                      <Image
                        src="/assets/ingame/ingame_settlement_piece.png"
                        alt="Settlement Piece"
                        fill
                        className="object-contain drop-shadow"
                      />
                    </div>

                    {/* Settlement Info & Costs */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#fcfbf9] font-vietnam">
                          Settlement
                        </span>
                        <span className="text-[10px] text-stone-400 font-vietnam">
                          còn {myPlayer.settlementsLeft}
                        </span>
                      </div>

                      {/* VP + Resource Costs */}
                      <div className="mt-1 flex items-center gap-2 font-vietnam">
                        {/* 1 VP */}
                        <div className="flex items-center gap-0.5">
                          <div className="relative h-3 w-2.5 shrink-0 opacity-80">
                            <Image
                              src="/assets/ingame/ingame_card_icon.svg"
                              alt="VP"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#d6c7b0]">1</span>
                        </div>

                        {/* Cost: 1 Brick + 1 Timber + 1 Wheat + 1 Sheep */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f2e6cb]">
                          <div className="flex items-center gap-0.5" title="1 Gạch (Brick)">
                            <Image src="/assets/icons/brick.png" alt="Gạch" width={13} height={13} className="object-contain" />
                            <span>1</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="1 Gỗ (Timber)">
                            <Image src="/assets/icons/timber.png" alt="Gỗ" width={13} height={13} className="object-contain" />
                            <span>1</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="1 Lúa (Wheat)">
                            <Image src="/assets/icons/wheat.png" alt="Lúa" width={13} height={13} className="object-contain" />
                            <span>1</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="1 Cừu (Sheep)">
                            <Image src="/assets/icons/sheep.png" alt="Cừu" width={13} height={13} className="object-contain" />
                            <span>1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* --- CITY ROW --- */}
                  <button
                    onClick={() => {
                      if (!isMyTurn || !isTurnActionPhase) return;
                      setBuildMode(buildMode === 'city' ? 'none' : 'city');
                    }}
                    disabled={!isMyTurn || !isTurnActionPhase || !canAffordCity || myPlayer.citiesLeft === 0}
                    className={`group flex w-full items-center gap-2.5 p-2 sm:p-2.5 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                      buildMode === 'city'
                        ? 'border-l-4 border-amber-400 bg-gradient-to-r from-[#382210] to-[#201308] shadow-inner'
                        : 'hover:bg-[#24170d]'
                    }`}
                  >
                    {/* 3D City Piece Icon */}
                    <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 flex items-center justify-center">
                      <Image
                        src="/assets/ingame/ingame_city_piece.png"
                        alt="City Piece"
                        fill
                        className="object-contain drop-shadow"
                      />
                    </div>

                    {/* City Info & Costs */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#fcfbf9] font-vietnam">
                          City
                        </span>
                        <span className="text-[10px] text-stone-400 font-vietnam">
                          còn {myPlayer.citiesLeft}
                        </span>
                      </div>

                      {/* VP + Resource Costs */}
                      <div className="mt-1 flex items-center gap-2.5 font-vietnam">
                        {/* 2 VP */}
                        <div className="flex items-center gap-0.5">
                          <div className="relative h-3 w-2.5 shrink-0 opacity-80">
                            <Image
                              src="/assets/ingame/ingame_card_icon.svg"
                              alt="VP"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#d6c7b0]">2</span>
                        </div>

                        {/* Cost: 2 Wheat + 3 Ore */}
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[#f2e6cb]">
                          <div className="flex items-center gap-0.5" title="2 Lúa (Wheat)">
                            <Image src="/assets/icons/wheat.png" alt="Lúa" width={13} height={13} className="object-contain" />
                            <span>2</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="3 Quặng (Ore)">
                            <Image src="/assets/icons/ore.png" alt="Quặng" width={13} height={13} className="object-contain" />
                            <span>3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 1.2 TRADE BUTTON */}
            <button
              onClick={() => {
                if (!isMyTurn || !isTurnActionPhase) return;
                onOpenTrade();
              }}
              disabled={!isMyTurn || !isTurnActionPhase}
              className="flex w-full items-center justify-between rounded-xl border border-[#3e2714]/90 bg-[#181009]/90 p-2.5 sm:p-3 shadow-md transition hover:border-[#6a4222] hover:bg-[#24170d] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                  <Image
                    src="/assets/ingame/ingame_action_trade.png"
                    alt="Trade"
                    fill
                    className="object-contain drop-shadow"
                  />
                </div>
                <span className="font-serif text-xs sm:text-sm font-bold tracking-wider text-[#e5b84c] uppercase">
                  TRADE
                </span>
              </div>
              <span className="font-vietnam text-[10px] sm:text-[11px] font-medium text-stone-400">
                Giao thương
              </span>
            </button>

            {/* 1.3 DEVELOPMENT CARD BUTTON */}
            <button
              onClick={onBuyDevCard}
              disabled={!isMyTurn || !canAffordDevCard || !isTurnActionPhase}
              className="flex w-full items-center justify-between rounded-xl border border-[#3e2714]/90 bg-[#181009]/90 p-2.5 sm:p-3 shadow-md transition hover:border-[#6a4222] hover:bg-[#24170d] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                  <Image
                    src="/assets/ingame/ingame_action_development_card.png"
                    alt="Development Card"
                    fill
                    className="object-contain drop-shadow"
                  />
                </div>
                <span className="font-serif text-xs sm:text-sm font-bold tracking-wider text-[#e5b84c] uppercase">
                  DEVELOPMENT CARD
                </span>
              </div>

              {/* Dev Card Cost: 1 Sheep + 1 Wheat + 1 Ore */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f2e6cb]">
                <div className="flex items-center gap-0.5" title="1 Cừu">
                  <Image src="/assets/icons/sheep.png" alt="Cừu" width={12} height={12} className="object-contain" />
                  <span>1</span>
                </div>
                <div className="flex items-center gap-0.5" title="1 Lúa">
                  <Image src="/assets/icons/wheat.png" alt="Lúa" width={12} height={12} className="object-contain" />
                  <span>1</span>
                </div>
                <div className="flex items-center gap-0.5" title="1 Quặng">
                  <Image src="/assets/icons/ore.png" alt="Quặng" width={12} height={12} className="object-contain" />
                  <span>1</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 2. ROLL DICE & END TURN CARD */}
      <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-[#140d07]/92 p-3 sm:p-3.5 border border-[#442c16]/90 shadow-[0_12px_28px_rgba(0,0,0,0.75)] backdrop-blur-md">
        {/* Dice Header */}
        <div className="flex w-full items-center justify-between px-1">
          <span className="font-serif text-xs sm:text-sm font-bold tracking-wider text-[#e5b84c] uppercase">
            ROLL DICE
          </span>
          <span className="font-vietnam text-[10px] font-bold text-amber-200/60 uppercase">
            {isMyTurn ? 'Lượt của bạn' : 'Đang chờ'}
          </span>
        </div>

        {/* 3D Dice Button */}
        <button
          onClick={() => isMyTurn && isRollDicePhase && onRollDice()}
          disabled={!isMyTurn || !isRollDicePhase}
          className={`relative h-20 w-full max-w-[13rem] sm:h-24 overflow-hidden rounded-xl transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
            isMyTurn && isRollDicePhase ? 'animate-pulse drop-shadow-[0_0_15px_rgba(248,194,75,0.6)]' : ''
          }`}
          title="Bấm để đổ xúc xắc"
        >
          <Image
            src="/assets/ingame/ingame_dice_pair.png"
            alt="Xúc xắc"
            fill
            className="object-contain"
            sizes="220px"
            priority
          />
        </button>

        {/* Dice Total Pill */}
        <div className="flex min-w-20 items-center justify-center rounded-full border border-amber-300/80 bg-[#1e130a] px-4 py-0.5 font-catan text-lg sm:text-xl font-bold text-[#fcd34d] shadow-inner">
          {diceTotal ?? '—'}
        </div>

        {/* Dice Status Hint */}
        <p className="text-center font-vietnam text-[11px] sm:text-xs font-medium text-amber-100/70">
          {diceTotal
            ? `Tổng điểm xúc xắc: ${diceTotal}`
            : isMyTurn && isRollDicePhase
            ? 'Đổ xúc xắc để thu thập tài nguyên'
            : 'Chờ người chơi đổ xúc xắc'}
        </p>

        {/* End Turn Button */}
        <button
          onClick={onEndTurn}
          disabled={!isMyTurn || !isTurnActionPhase}
          className="w-full mt-1 rounded-xl border border-amber-300/70 bg-gradient-to-r from-[#d97706] via-[#f5b829] to-[#d97706] py-2.5 font-sans text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#241302] shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {isMyTurn && isTurnActionPhase ? 'KẾT THÚC LƯỢT' : 'CHỜ ĐẾN LƯỢT'}
        </button>
      </div>
    </div>
  );
};
