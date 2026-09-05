'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GameState, ResourceType } from '@/lib/catan/types';
import { getPlayerTradeRatios } from '@/lib/catan/trade';
import { ArrowUpDown, Info, ArrowRight } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  currentUserId: string;
  onExecuteBankTrade: (give: ResourceType, giveCount: number, get: ResourceType) => void;
  onCreateTradeOffer: (giving: Record<ResourceType, number>, requesting: Record<ResourceType, number>) => void;
  onAcceptTradeOffer: (offerId: string) => void;
  onCancelTradeOffer: () => void;
}

interface ResourceConfig {
  type: ResourceType;
  label: string;
  icon: string;
}

const RESOURCES: ResourceConfig[] = [
  { type: 'wood', label: 'Wood', icon: '/assets/icons/timber.png' },
  { type: 'brick', label: 'Brick', icon: '/assets/icons/brick.png' },
  { type: 'sheep', label: 'Sheep', icon: '/assets/icons/sheep.png' },
  { type: 'wheat', label: 'Wheat', icon: '/assets/icons/wheat.png' },
  { type: 'ore', label: 'Ore', icon: '/assets/icons/ore.png' },
];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  gameState,
  currentUserId,
  onExecuteBankTrade,
  onCreateTradeOffer,
  onAcceptTradeOffer,
  onCancelTradeOffer,
}) => {
  // Bank Trade State
  const [bankGiveRes, setBankGiveRes] = useState<ResourceType>('wood');
  const [bankGetRes, setBankGetRes] = useState<ResourceType | null>(null);

  // Port Trade State
  const [selectedPortType, setSelectedPortType] = useState<string>('generic'); // 'generic' | 'wood' | 'wheat' | 'brick' | 'sheep' | 'ore'
  const [portGiveRes, setPortGiveRes] = useState<ResourceType>('wood');
  const [portGetRes, setPortGetRes] = useState<ResourceType | null>(null);

  // Player-to-Player Trade State
  const [giving, setGiving] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });
  const [requesting, setRequesting] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const ratios = myPlayer ? getPlayerTradeRatios(myPlayer.id, gameState.vertices) : {
    generic: 4,
    wood: 4,
    brick: 4,
    sheep: 4,
    wheat: 4,
    ore: 4,
  };

  // Sync selected port when ratios change or modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (ratios.generic === 3) {
      setSelectedPortType('generic');
    } else if (ratios.wood === 2) {
      setSelectedPortType('wood');
      setPortGiveRes('wood');
    } else if (ratios.wheat === 2) {
      setSelectedPortType('wheat');
      setPortGiveRes('wheat');
    } else if (ratios.brick === 2) {
      setSelectedPortType('brick');
      setPortGiveRes('brick');
    } else if (ratios.sheep === 2) {
      setSelectedPortType('sheep');
      setPortGiveRes('sheep');
    } else if (ratios.ore === 2) {
      setSelectedPortType('ore');
      setPortGiveRes('ore');
    } else {
      setSelectedPortType('generic');
    }
  }, [isOpen, ratios.generic, ratios.wood, ratios.wheat, ratios.brick, ratios.sheep, ratios.ore]);

  if (!isOpen || !myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const activeOffer = gameState.currentTradeOffer;

  // Calculation for Player Trade
  const totalGiving = Object.values(giving).reduce((a, b) => a + b, 0);
  const totalRequesting = Object.values(requesting).reduce((a, b) => a + b, 0);
  const canSendPlayerOffer = isMyTurn && totalGiving > 0 && totalRequesting > 0;

  // Calculation for Bank Trade (4:1)
  const myBankGiveAvailable = myPlayer.resources[bankGiveRes] || 0;
  const canBankTrade =
    isMyTurn && myBankGiveAvailable >= 4 && bankGetRes !== null && bankGiveRes !== bankGetRes;

  // Calculation for Port Trade
  const isSelectedPortOwned =
    selectedPortType === 'generic' ? ratios.generic === 3 : ratios[selectedPortType as ResourceType] === 2;
  const portRatio = selectedPortType === 'generic' ? 3 : 2;
  const effectivePortGiveRes: ResourceType =
    selectedPortType === 'generic' ? portGiveRes : (selectedPortType as ResourceType);
  const myPortGiveAvailable = myPlayer.resources[effectivePortGiveRes] || 0;
  const canPortTrade =
    isMyTurn &&
    isSelectedPortOwned &&
    myPortGiveAvailable >= portRatio &&
    portGetRes !== null &&
    effectivePortGiveRes !== portGetRes;

  // Handlers
  const handleCreateOffer = () => {
    if (canSendPlayerOffer) {
      onCreateTradeOffer(giving, requesting);
      setGiving({ wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 });
      setRequesting({ wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 });
    }
  };

  const handleBankTrade = () => {
    if (canBankTrade && bankGetRes) {
      onExecuteBankTrade(bankGiveRes, 4, bankGetRes);
      setBankGetRes(null);
    }
  };

  const handlePortTrade = () => {
    if (canPortTrade && portGetRes) {
      onExecuteBankTrade(effectivePortGiveRes, portRatio, portGetRes);
      setPortGetRes(null);
    }
  };

  const cycleBankGiveRes = (direction: 'prev' | 'next') => {
    const currentIndex = RESOURCES.findIndex((r) => r.type === bankGiveRes);
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % RESOURCES.length
        : (currentIndex - 1 + RESOURCES.length) % RESOURCES.length;
    const nextType = RESOURCES[nextIndex].type;
    setBankGiveRes(nextType);
    if (bankGetRes === nextType) {
      setBankGetRes(null);
    }
  };

  const cyclePortGiveRes = (direction: 'prev' | 'next') => {
    if (selectedPortType !== 'generic') return;
    const currentIndex = RESOURCES.findIndex((r) => r.type === portGiveRes);
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % RESOURCES.length
        : (currentIndex - 1 + RESOURCES.length) % RESOURCES.length;
    const nextType = RESOURCES[nextIndex].type;
    setPortGiveRes(nextType);
    if (portGetRes === nextType) {
      setPortGetRes(null);
    }
  };

  const handleSelectPort = (portId: string) => {
    setSelectedPortType(portId);
    if (portId !== 'generic') {
      const res = portId as ResourceType;
      setPortGiveRes(res);
      if (portGetRes === res) {
        setPortGetRes(null);
      }
    }
  };

  // List of all ports to display in the Port row
  const availablePortItems = [
    {
      id: 'generic',
      label: 'Any resource',
      ratioText: '3:1',
      icon: '/assets/icons/gold-hex.png',
      isOwned: ratios.generic === 3,
    },
    {
      id: 'wood',
      label: 'Wood',
      ratioText: '2:1',
      icon: '/assets/icons/timber.png',
      isOwned: ratios.wood === 2,
    },
    {
      id: 'wheat',
      label: 'Wheat',
      ratioText: '2:1',
      icon: '/assets/icons/wheat.png',
      isOwned: ratios.wheat === 2,
    },
    {
      id: 'brick',
      label: 'Brick',
      ratioText: '2:1',
      icon: '/assets/icons/brick.png',
      isOwned: ratios.brick === 2,
    },
    ...(ratios.sheep === 2
      ? [
          {
            id: 'sheep',
            label: 'Sheep',
            ratioText: '2:1',
            icon: '/assets/icons/sheep.png',
            isOwned: true,
          },
        ]
      : []),
    ...(ratios.ore === 2
      ? [
          {
            id: 'ore',
            label: 'Ore',
            ratioText: '2:1',
            icon: '/assets/icons/ore.png',
            isOwned: true,
          },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none font-catan">
      {/* Modal Container scaled to exact frame aspect ratio (1498 x 962) */}
      <div className="relative w-[min(98vw,1140px)] aspect-[1498/962] max-h-[96vh] flex flex-col drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)]">
        {/* Authentic Background Frame Asset */}
        <Image
          src="/assets/ingame/trade/ingame_trade_modal_frame_en.png"
          alt="Trade Modal Frame"
          fill
          className="object-fill pointer-events-none -z-0"
          priority
        />

        {/* Top-Right Red Wax Seal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[3.2%] right-[2.2%] w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 z-50 hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] cursor-pointer"
          title="Close Trade Modal"
        >
          <Image
            src="/assets/ingame/trade/ingame_trade_close_button.png"
            alt="Close"
            fill
            className="object-contain"
          />
        </button>

        {/* 3-Column Content Grid: Starts below the wooden title banner */}
        <div className="relative z-10 w-full h-full pt-[14.5%] pb-[3.8%] px-[2.4%] grid grid-cols-3 gap-[1.8%]">
          
          {/* ========================================================= */}
          {/* COLUMN 1: WITH PLAYERS (Trade with other players)        */}
          {/* ========================================================= */}
          <div className="flex flex-col h-full rounded-xl overflow-hidden justify-between">
            {/* Header Banner Asset */}
            <div className="relative w-full aspect-[1851/584] shrink-0 drop-shadow-sm">
              <Image
                src="/assets/ingame/trade/ingame_trade_with_players_header_en.png"
                alt="With Players"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Column Body Parchment Panel */}
            <div className="flex-1 flex flex-col justify-between pt-1 pb-1 px-1 sm:px-2 min-h-0 text-[#2a1708]">
              {/* Active Incoming / Open Offer State */}
              {activeOffer && activeOffer.status === 'open' ? (
                <div className="flex-1 flex flex-col justify-between p-3 rounded-xl bg-[#ead7be]/90 border border-[#c4a984] shadow-inner my-1">
                  <div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#bfa27d]/60">
                      <span className="font-serif font-black text-xs sm:text-sm text-[#3b200b]">
                        {activeOffer.fromPlayerId === currentUserId
                          ? 'Your Active Offer'
                          : `Offer from ${gameState.players.find((p) => p.id === activeOffer.fromPlayerId)?.name}:`}
                      </span>
                      {activeOffer.fromPlayerId === currentUserId && (
                        <button
                          onClick={onCancelTradeOffer}
                          className="font-serif text-[11px] font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
                        >
                          Cancel Offer
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3">
                      {/* Giving */}
                      <div className="bg-[#dfcbaf]/70 p-2 rounded-lg border border-[#c7ab86]/60">
                        <span className="text-[10px] sm:text-xs font-serif font-bold text-[#492c13] block mb-1">
                          Giving:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(activeOffer.giving)
                            .filter(([_, c]) => c > 0)
                            .map(([res, c]) => (
                              <div key={res} className="flex items-center gap-1 bg-[#fff6e6] px-1.5 py-0.5 rounded border border-[#caa87c]">
                                <span className="font-bold text-xs text-stone-900">{c}</span>
                                <div className="relative w-4 h-4">
                                  <Image
                                    src={RESOURCES.find((r) => r.type === res)?.icon || ''}
                                    alt={res}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Requesting */}
                      <div className="bg-[#dfcbaf]/70 p-2 rounded-lg border border-[#c7ab86]/60">
                        <span className="text-[10px] sm:text-xs font-serif font-bold text-[#492c13] block mb-1">
                          Requesting:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(activeOffer.requesting)
                            .filter(([_, c]) => c > 0)
                            .map(([res, c]) => (
                              <div key={res} className="flex items-center gap-1 bg-[#fff6e6] px-1.5 py-0.5 rounded border border-[#caa87c]">
                                <span className="font-bold text-xs text-stone-900">{c}</span>
                                <div className="relative w-4 h-4">
                                  <Image
                                    src={RESOURCES.find((r) => r.type === res)?.icon || ''}
                                    alt={res}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeOffer.fromPlayerId !== currentUserId ? (
                    <button
                      onClick={() => onAcceptTradeOffer(activeOffer.id)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-[#15803d] to-[#16a34a] hover:from-[#166534] hover:to-[#15803d] text-white font-serif font-black text-xs sm:text-sm tracking-wider uppercase shadow-md border border-[#86efac]/50 cursor-pointer"
                    >
                      Accept Trade Offer
                    </button>
                  ) : (
                    <div className="text-center font-serif text-xs text-[#6e4d2e] italic py-1">
                      Waiting for opponents to accept or decline...
                    </div>
                  )}
                </div>
              ) : (
                /* Normal Mode: Create Trade Offer */
                <>
                  {/* Section 1: YOU OFFER */}
                  <div className="flex flex-col">
                    <div className="mb-0.5">
                      <h4 className="font-serif font-black text-xs sm:text-[13px] text-[#221308] leading-tight">
                        YOU OFFER
                      </h4>
                      <p className="font-serif text-[8.5px] sm:text-[9.5px] text-[#553b26] leading-none">
                        Select the resources you want to give:
                      </p>
                    </div>

                    {/* 5 Offer Resource Slots */}
                    <div className="grid grid-cols-5 gap-1">
                      {RESOURCES.map((r) => {
                        const available = myPlayer.resources[r.type] || 0;
                        const currentVal = giving[r.type] || 0;
                        return (
                          <div
                            key={`offer-${r.type}`}
                            className="flex flex-col items-center justify-between p-1 rounded-lg bg-[#ebd9bd]/90 border border-[#c4a984]/70 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] aspect-[1/1.5] transition-all hover:border-[#9c784e]"
                          >
                            {/* Resource 3D Icon */}
                            <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center">
                              <Image
                                src={r.icon}
                                alt={r.label}
                                fill
                                className="object-contain drop-shadow"
                              />
                            </div>

                            {/* Stepper Controls: [-] count [+] */}
                            <div className="flex items-center justify-center gap-0.5 w-full my-0.5">
                              <button
                                onClick={() =>
                                  setGiving((prev) => ({
                                    ...prev,
                                    [r.type]: Math.max(0, prev[r.type] - 1),
                                  }))
                                }
                                disabled={currentVal <= 0}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[9px] sm:text-[10px] hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                -
                              </button>
                              <span className="min-w-[10px] text-center font-serif font-black text-[10px] sm:text-xs text-[#241306]">
                                {currentVal}
                              </span>
                              <button
                                onClick={() =>
                                  setGiving((prev) => ({
                                    ...prev,
                                    [r.type]: Math.min(available, prev[r.type] + 1),
                                  }))
                                }
                                disabled={currentVal >= available}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[9px] sm:text-[10px] hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Label */}
                            <span className="font-serif font-semibold text-[8px] sm:text-[9px] text-[#442c16] leading-none">
                              {r.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Center Exchange Icon */}
                  <div className="flex items-center justify-center my-0.5 text-[#8b5a2b]">
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-80" />
                  </div>

                  {/* Section 2: YOU REQUEST */}
                  <div className="flex flex-col">
                    <div className="mb-0.5">
                      <h4 className="font-serif font-black text-xs sm:text-[13px] text-[#221308] leading-tight">
                        YOU REQUEST
                      </h4>
                      <p className="font-serif text-[8.5px] sm:text-[9.5px] text-[#553b26] leading-none">
                        Select the resources you want to receive:
                      </p>
                    </div>

                    {/* 5 Request Resource Slots */}
                    <div className="grid grid-cols-5 gap-1">
                      {RESOURCES.map((r) => {
                        const currentVal = requesting[r.type] || 0;
                        return (
                          <div
                            key={`request-${r.type}`}
                            className="flex flex-col items-center justify-between p-1 rounded-lg bg-[#ebd9bd]/90 border border-[#c4a984]/70 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] aspect-[1/1.5] transition-all hover:border-[#9c784e]"
                          >
                            {/* Resource 3D Icon */}
                            <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center">
                              <Image
                                src={r.icon}
                                alt={r.label}
                                fill
                                className="object-contain drop-shadow"
                              />
                            </div>

                            {/* Stepper Controls: [-] count [+] */}
                            <div className="flex items-center justify-center gap-0.5 w-full my-0.5">
                              <button
                                onClick={() =>
                                  setRequesting((prev) => ({
                                    ...prev,
                                    [r.type]: Math.max(0, prev[r.type] - 1),
                                  }))
                                }
                                disabled={currentVal <= 0}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[9px] sm:text-[10px] hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                -
                              </button>
                              <span className="min-w-[10px] text-center font-serif font-black text-[10px] sm:text-xs text-[#241306]">
                                {currentVal}
                              </span>
                              <button
                                onClick={() =>
                                  setRequesting((prev) => ({
                                    ...prev,
                                    [r.type]: Math.min(10, prev[r.type] + 1),
                                  }))
                                }
                                disabled={currentVal >= 10}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[9px] sm:text-[10px] hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Label */}
                            <span className="font-serif font-semibold text-[8px] sm:text-[9px] text-[#442c16] leading-none">
                              {r.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Send Trade Offer Button Asset */}
                  <div className="mt-1 flex flex-col items-center">
                    <button
                      onClick={handleCreateOffer}
                      disabled={!canSendPlayerOffer}
                      className={`relative w-full aspect-[1954/359] drop-shadow-md transition-all ${
                        canSendPlayerOffer
                          ? 'hover:brightness-110 active:scale-[0.98] cursor-pointer'
                          : 'opacity-50 grayscale cursor-not-allowed'
                      }`}
                      title={
                        !isMyTurn
                          ? 'Only the active player can initiate trade offers.'
                          : totalGiving === 0 || totalRequesting === 0
                          ? 'Select resources to offer and request.'
                          : 'Send trade offer to all players'
                      }
                    >
                      <Image
                        src="/assets/ingame/trade/ingame_trade_send_offer_button_en.png"
                        alt="Send Trade Offer"
                        fill
                        className="object-contain"
                      />
                    </button>

                    {/* Bottom Info Note */}
                    <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-[9px] text-[#5e432a]">
                      <Info className="w-3 h-3 shrink-0 text-[#8b5a2b]" />
                      <span>Your offer will be sent to all other players.</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: WITH BANK (4:1 Exchange)                        */}
          {/* ========================================================= */}
          <div className="flex flex-col h-full rounded-xl overflow-hidden justify-between">
            {/* Bank Header Banner Asset */}
            <div className="relative w-full aspect-[1851/584] shrink-0 drop-shadow-sm">
              <Image
                src="/assets/ingame/trade/ingame_trade_with_bank_header_en.png"
                alt="With Bank (4:1)"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Column Body Parchment Panel */}
            <div className="flex-1 flex flex-col justify-between pt-1 pb-1 px-1 sm:px-2 min-h-0 text-[#2a1708]">
              {/* Section Header Text */}
              <div>
                <h4 className="font-serif font-black text-xs sm:text-[13px] text-[#221308] leading-tight">
                  TRADE WITH THE BANK
                </h4>
                <p className="font-serif text-[8.5px] sm:text-[9.5px] text-[#553b26] leading-none mb-2">
                  Give 4 cards of the same type to receive 1 card of any type.
                </p>

                {/* Give & Receive Card Slot Layout */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 my-1">
                  {/* GIVE (4 cards) Slot */}
                  <div className="flex flex-col items-center">
                    <span className="font-serif font-bold text-[9px] sm:text-[10px] text-[#3a2211] mb-0.5">
                      GIVE (4 cards)
                    </span>
                    <div
                      onClick={() => cycleBankGiveRes('next')}
                      className="flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-lg bg-[#ebd9bd]/90 border border-[#c4a984] w-16 sm:w-20 aspect-[1/1.3] shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] cursor-pointer hover:border-[#9c784e] transition-all"
                      title="Click to cycle give resource"
                    >
                      {/* Resource 3D Icon */}
                      <div className="relative w-7 h-7 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                        <Image
                          src={RESOURCES.find((r) => r.type === bankGiveRes)?.icon || ''}
                          alt={bankGiveRes}
                          fill
                          className="object-contain drop-shadow"
                        />
                      </div>

                      {/* Stepper Controls: [-] 4 [+] */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-0.5 sm:gap-1 w-full"
                      >
                        <button
                          onClick={() => cycleBankGiveRes('prev')}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[9px] sm:text-[10px] hover:bg-stone-100 active:scale-95 cursor-pointer"
                          title="Previous resource"
                        >
                          -
                        </button>
                        <span className="min-w-[12px] text-center font-serif font-black text-[11px] sm:text-xs text-[#241306]">
                          4
                        </span>
                        <button
                          onClick={() => cycleBankGiveRes('next')}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[9px] sm:text-[10px] hover:bg-stone-100 active:scale-95 cursor-pointer"
                          title="Next resource"
                        >
                          +
                        </button>
                      </div>

                      {/* Label + Available Count */}
                      <span className="font-serif font-semibold text-[8px] sm:text-[9.5px] text-[#442c16] leading-none">
                        {RESOURCES.find((r) => r.type === bankGiveRes)?.label}{' '}
                        <span className="font-normal text-[7.5px] sm:text-[8.5px] text-[#6d4d31]">
                          ({myBankGiveAvailable})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Middle Arrow */}
                  <div className="flex items-center justify-center text-[#8b5a2b] shrink-0 pt-3">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-90" />
                  </div>

                  {/* RECEIVE (1 card) Slot */}
                  <div className="flex flex-col items-center">
                    <span className="font-serif font-bold text-[9px] sm:text-[10px] text-[#3a2211] mb-0.5">
                      RECEIVE (1 card)
                    </span>
                    <div
                      className={`flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-lg w-16 sm:w-20 aspect-[1/1.3] transition-all ${
                        bankGetRes
                          ? 'bg-[#dcfce7]/90 border-2 border-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                          : 'bg-[#ebd9bd]/40 border-2 border-dashed border-[#bfa27d]'
                      }`}
                    >
                      {bankGetRes ? (
                        <>
                          <div className="relative w-7 h-7 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                            <Image
                              src={RESOURCES.find((r) => r.type === bankGetRes)?.icon || ''}
                              alt={bankGetRes}
                              fill
                              className="object-contain drop-shadow"
                            />
                          </div>
                          <span className="font-serif font-black text-[11px] sm:text-xs text-[#14532d]">
                            1
                          </span>
                          <span className="font-serif font-bold text-[8px] sm:text-[9.5px] text-[#14532d] leading-none">
                            {RESOURCES.find((r) => r.type === bankGetRes)?.label}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full my-auto">
                          <span className="text-xl sm:text-2xl font-black text-[#8b6b48] leading-none">?</span>
                          <span className="font-serif font-medium text-[7.5px] sm:text-[8.5px] text-[#78593a] text-center mt-1 leading-tight">
                            Choose 1 resource
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5 Selectable Resource Tokens for Receive */}
                <div className="mt-1 sm:mt-1.5">
                  <span className="block text-center font-serif text-[8px] sm:text-[9px] text-[#553b26] mb-0.5">
                    Select resource to receive:
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {RESOURCES.map((r) => {
                      const isSelected = bankGetRes === r.type;
                      const isSameAsGive = r.type === bankGiveRes;
                      return (
                        <button
                          key={`bank-select-${r.type}`}
                          onClick={() => setBankGetRes(r.type)}
                          disabled={isSameAsGive}
                          className={`flex flex-col items-center p-0.5 sm:p-1 rounded-md border transition-all ${
                            isSelected
                              ? 'bg-[#dcfce7] border-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.4)]'
                              : isSameAsGive
                              ? 'bg-[#e5dcd0]/40 border-stone-300/60 opacity-30 cursor-not-allowed'
                              : 'bg-[#ebd9bd]/80 border-[#c4a984]/80 hover:border-[#9c784e] cursor-pointer'
                          }`}
                        >
                          <div className="relative w-4 h-4 sm:w-5 sm:h-5 shrink-0">
                            <Image src={r.icon} alt={r.label} fill className="object-contain drop-shadow-xs" />
                          </div>
                          <span
                            className={`font-serif text-[7.5px] sm:text-[8.5px] leading-none mt-0.5 ${
                              isSelected ? 'font-black text-[#14532d]' : 'font-semibold text-[#442c16]'
                            }`}
                          >
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Confirm Bank Trade Button Asset */}
              <div className="mt-1 flex flex-col items-center">
                <button
                  onClick={handleBankTrade}
                  disabled={!canBankTrade}
                  className={`relative w-full aspect-[1730/319] drop-shadow-md transition-all ${
                    canBankTrade
                      ? 'hover:brightness-110 active:scale-[0.98] cursor-pointer'
                      : 'opacity-50 grayscale cursor-not-allowed'
                  }`}
                  title={
                    !isMyTurn
                      ? 'Only the active player can trade during their turn.'
                      : myBankGiveAvailable < 4
                      ? `Need at least 4 ${RESOURCES.find((r) => r.type === bankGiveRes)?.label} (have ${myBankGiveAvailable})`
                      : !bankGetRes
                      ? 'Please select a resource to receive.'
                      : 'Exchange 4 cards for 1 card'
                  }
                >
                  <Image
                    src="/assets/ingame/trade/ingame_trade_with_bank_confirm_button_en.png"
                    alt="Confirm Trade"
                    fill
                    className="object-contain"
                  />
                </button>

                {/* Bottom Info Note */}
                <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-[9px] text-[#5e432a]">
                  <Info className="w-3 h-3 shrink-0 text-[#8b5a2b]" />
                  <span>Exchange 4 cards of the same type for 1 card of any type.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: WITH PORT (Harbor Trade)                        */}
          {/* ========================================================= */}
          <div className="flex flex-col h-full rounded-xl overflow-hidden justify-between">
            {/* Port Header Banner Asset */}
            <div className="relative w-full aspect-[1851/584] shrink-0 drop-shadow-sm">
              <Image
                src="/assets/ingame/trade/ingame_trade_with_port_header_en.png"
                alt="With Port"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Column Body Parchment Panel */}
            <div className="flex-1 flex flex-col justify-between pt-1 pb-1 px-1 sm:px-2 min-h-0 text-[#2a1708]">
              <div>
                {/* 1. YOUR AVAILABLE PORTS */}
                <div className="mb-1 sm:mb-1.5">
                  <h4 className="font-serif font-black text-xs sm:text-[13px] text-[#221308] leading-tight">
                    YOUR AVAILABLE PORTS
                  </h4>
                  <p className="font-serif text-[8.5px] sm:text-[9.5px] text-[#553b26] leading-none mb-1">
                    Only ports where you have a settlement or city are shown.
                  </p>

                  {/* Ports Selector Row */}
                  <div className={`grid gap-1 ${availablePortItems.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    {availablePortItems.map((port) => {
                      const isSelected = selectedPortType === port.id;
                      return (
                        <button
                          key={`port-token-${port.id}`}
                          onClick={() => handleSelectPort(port.id)}
                          disabled={!port.isOwned}
                          className={`flex flex-col items-center p-0.5 sm:p-1 rounded-lg border transition-all ${
                            isSelected && port.isOwned
                              ? 'bg-[#dcfce7] border-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.4)] ring-1 ring-[#22c55e]'
                              : port.isOwned
                              ? 'bg-[#ebd9bd]/90 border-[#c4a984] hover:border-[#9c784e] cursor-pointer'
                              : 'bg-[#e5dcd0]/40 border-stone-300/60 opacity-40 cursor-not-allowed'
                          }`}
                          title={port.isOwned ? `Select ${port.ratioText} ${port.label} Port` : `Port not owned`}
                        >
                          <span
                            className={`font-serif font-black text-[10px] sm:text-xs leading-none ${
                              port.isOwned ? 'text-[#14532d]' : 'text-stone-400'
                            }`}
                          >
                            {port.ratioText}
                          </span>
                          <div className="relative w-4 h-4 sm:w-5 sm:h-5 my-0.5 shrink-0">
                            <Image
                              src={port.icon}
                              alt={port.label}
                              fill
                              className={`object-contain ${port.isOwned ? 'drop-shadow-xs' : 'grayscale opacity-70'}`}
                            />
                          </div>
                          <span
                            className={`font-serif text-[7.5px] sm:text-[8.5px] leading-none truncate w-full text-center ${
                              isSelected && port.isOwned
                                ? 'font-bold text-[#14532d]'
                                : port.isOwned
                                ? 'font-medium text-[#442c16]'
                                : 'text-stone-400'
                            }`}
                          >
                            {port.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. TRADE USING SELECTED PORT */}
                <div className="mt-1">
                  <h4 className="font-serif font-black text-xs sm:text-[13px] text-[#221308] leading-tight mb-1">
                    TRADE USING SELECTED PORT
                  </h4>

                  {/* Subheaders for Give & Receive */}
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    <div className="bg-[#dfcbaf]/70 py-0.5 px-1 rounded text-center border border-[#c7ab86]/60">
                      <span className="font-serif font-bold text-[7.5px] sm:text-[8.5px] text-[#3a2211] leading-none block truncate">
                        GIVE ({portRatio} cards - {selectedPortType === 'generic' ? 'any one' : RESOURCES.find((r) => r.type === effectivePortGiveRes)?.label})
                      </span>
                    </div>
                    <div className="bg-[#dfcbaf]/70 py-0.5 px-1 rounded text-center border border-[#c7ab86]/60">
                      <span className="font-serif font-bold text-[7.5px] sm:text-[8.5px] text-[#3a2211] leading-none block truncate">
                        RECEIVE (1 card - any type)
                      </span>
                    </div>
                  </div>

                  {/* Give & Receive Row */}
                  <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                    {/* Left: Give Card Slot */}
                    <div
                      onClick={() => selectedPortType === 'generic' && cyclePortGiveRes('next')}
                      className={`flex flex-col items-center justify-between p-1 rounded-lg bg-[#ebd9bd]/90 border border-[#c4a984] w-14 sm:w-16 aspect-[1/1.3] shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] shrink-0 ${
                        selectedPortType === 'generic' ? 'cursor-pointer hover:border-[#9c784e]' : ''
                      }`}
                      title={selectedPortType === 'generic' ? 'Click to cycle give resource' : `${effectivePortGiveRes} fixed by port`}
                    >
                      {/* Resource 3D Icon */}
                      <div className="relative w-6 h-6 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center">
                        <Image
                          src={RESOURCES.find((r) => r.type === effectivePortGiveRes)?.icon || ''}
                          alt={effectivePortGiveRes}
                          fill
                          className="object-contain drop-shadow"
                        />
                      </div>

                      {/* Stepper Controls: [-] ratio [+] */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-0.5 w-full"
                      >
                        {selectedPortType === 'generic' ? (
                          <>
                            <button
                              onClick={() => cyclePortGiveRes('prev')}
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[8px] sm:text-[9px] hover:bg-stone-100 active:scale-95 cursor-pointer"
                              title="Previous resource"
                            >
                              -
                            </button>
                            <span className="min-w-[10px] text-center font-serif font-black text-[10px] sm:text-xs text-[#241306]">
                              {portRatio}
                            </span>
                            <button
                              onClick={() => cyclePortGiveRes('next')}
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white shadow-xs border border-stone-400/80 text-stone-800 flex items-center justify-center font-bold text-[8px] sm:text-[9px] hover:bg-stone-100 active:scale-95 cursor-pointer"
                              title="Next resource"
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <span className="font-serif font-black text-[10px] sm:text-xs text-[#241306]">
                            {portRatio}
                          </span>
                        )}
                      </div>

                      {/* Label + Available Count */}
                      <span className="font-serif font-semibold text-[7.5px] sm:text-[8.5px] text-[#442c16] leading-none truncate w-full text-center">
                        {RESOURCES.find((r) => r.type === effectivePortGiveRes)?.label}{' '}
                        <span className="font-normal text-[7px] sm:text-[8px] text-[#6d4d31]">
                          ({myPortGiveAvailable})
                        </span>
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center text-[#8b5a2b] shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-90" />
                    </div>

                    {/* Right: 5 Selectable Resource Cards in a Row */}
                    <div className="flex-1 grid grid-cols-5 gap-0.5 sm:gap-1">
                      {RESOURCES.map((r) => {
                        const isSelected = portGetRes === r.type;
                        const isSameAsGive = r.type === effectivePortGiveRes;
                        return (
                          <button
                            key={`port-receive-${r.type}`}
                            onClick={() => setPortGetRes(r.type)}
                            disabled={isSameAsGive}
                            className={`flex flex-col items-center justify-between p-0.5 sm:p-1 rounded-md border aspect-[1/1.5] transition-all ${
                              isSelected
                                ? 'bg-[#dcfce7] border-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.4)] ring-1 ring-[#22c55e]'
                                : isSameAsGive
                                ? 'bg-[#e5dcd0]/40 border-stone-300/60 opacity-30 cursor-not-allowed'
                                : 'bg-[#ebd9bd]/90 border-[#c4a984]/80 hover:border-[#9c784e] cursor-pointer'
                            }`}
                            title={isSameAsGive ? 'Cannot receive the same resource' : `Receive ${r.label}`}
                          >
                            <div className="relative w-4 h-4 sm:w-5 sm:h-5 shrink-0 my-auto">
                              <Image src={r.icon} alt={r.label} fill className="object-contain drop-shadow-xs" />
                            </div>
                            <span
                              className={`font-serif text-[7px] sm:text-[8px] leading-none truncate w-full text-center ${
                                isSelected ? 'font-black text-[#14532d]' : 'font-semibold text-[#442c16]'
                              }`}
                            >
                              {r.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Port Trade Button Asset */}
              <div className="mt-1 flex flex-col items-center">
                <button
                  onClick={handlePortTrade}
                  disabled={!canPortTrade}
                  className={`relative w-full aspect-[1900/307] drop-shadow-md transition-all ${
                    canPortTrade
                      ? 'hover:brightness-110 active:scale-[0.98] cursor-pointer'
                      : 'opacity-50 grayscale cursor-not-allowed'
                  }`}
                  title={
                    !isMyTurn
                      ? 'Only the active player can trade during their turn.'
                      : !isSelectedPortOwned
                      ? 'You do not own this port.'
                      : myPortGiveAvailable < portRatio
                      ? `Need at least ${portRatio} ${RESOURCES.find((r) => r.type === effectivePortGiveRes)?.label} (have ${myPortGiveAvailable})`
                      : !portGetRes
                      ? 'Please select a resource to receive.'
                      : `Exchange ${portRatio} cards for 1 card using port`
                  }
                >
                  <Image
                    src="/assets/ingame/trade/ingame_trade_with_port_confirm_button_en.png"
                    alt="Confirm Trade"
                    fill
                    className="object-contain"
                  />
                </button>

                {/* Bottom Info Note */}
                <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-[9px] text-[#5e432a]">
                  <Info className="w-3 h-3 shrink-0 text-[#8b5a2b]" />
                  <span>
                    Exchange {portRatio} cards for 1 card of any type using your{' '}
                    {selectedPortType === 'generic' ? '3:1' : '2:1'} port.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

