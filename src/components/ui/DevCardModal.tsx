'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GameState, DevCardType, ResourceType } from '@/lib/catan/types';
import { RotateCw } from 'lucide-react';

interface DevCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  currentUserId: string;
  onPlayDevCard: (card: DevCardType, extraData?: any) => void;
}

const RESOURCES_EN: { type: ResourceType; label: string; iconSrc: string }[] = [
  { type: 'wood', label: 'Lumber', iconSrc: '/assets/icons/timber.png' },
  { type: 'brick', label: 'Brick', iconSrc: '/assets/icons/brick.png' },
  { type: 'sheep', label: 'Wool', iconSrc: '/assets/icons/sheep.png' },
  { type: 'wheat', label: 'Grain', iconSrc: '/assets/icons/wheat.png' },
  { type: 'ore', label: 'Ore', iconSrc: '/assets/icons/ore.png' },
];

const DEV_CARD_ASSETS: Record<
  DevCardType,
  {
    front: string;
    back: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
  }
> = {
  knight: {
    front: '/assets/ingame/development_card/ingame_development_card_knight_front.png',
    back: '/assets/ingame/development_card/ingame_development_card_knight_back.png',
    title: 'Knight',
    subtitle: 'Move Robber & Steal Card',
    description: 'Move the Robber to any tile and steal 1 resource card from a player with a settlement or city adjacent to that tile.',
    category: 'knight',
  },
  road_building: {
    front: '/assets/ingame/development_card/ingame_development_card_road_building_front.png',
    back: '/assets/ingame/development_card/ingame_development_card_road_building_back.png',
    title: 'Road Building',
    subtitle: 'Place 2 Free Roads',
    description: 'Place 2 new roads for free immediately upon activating this card.',
    category: 'road_building',
  },
  year_of_plenty: {
    front: '/assets/ingame/development_card/ingame_development_card_year_of_plenty_front.png',
    back: '/assets/ingame/development_card/ingame_development_card_year_of_plenty_back.png',
    title: 'Year of Plenty',
    subtitle: 'Take 2 Free Resources',
    description: 'Take any 2 resource cards of your choice from the bank immediately.',
    category: 'year_of_plenty',
  },
  monopoly: {
    front: '/assets/ingame/development_card/ingame_development_card_monopoly_front.png',
    back: '/assets/ingame/development_card/ingame_development_card_monopoly_back.png',
    title: 'Monopoly',
    subtitle: 'Claim All of 1 Resource',
    description: 'Name 1 resource type. All other players must surrender all resource cards of that type to you.',
    category: 'monopoly',
  },
  victory_point: {
    front: '/assets/ingame/development_card/ingame_development_card_victory_point_front.png',
    back: '/assets/ingame/development_card/ingame_development_card_victory_point_back.png',
    title: 'Victory Point',
    subtitle: '+1 Hidden Victory Point',
    description: 'Provides 1 hidden Victory Point towards your 10 VP victory condition. Remains hidden until game end.',
    category: 'victory_point',
  },
};

export const DevCardModal: React.FC<DevCardModalProps> = ({
  isOpen,
  onClose,
  gameState,
  currentUserId,
  onPlayDevCard,
}) => {
  const [selectedCard, setSelectedCard] = useState<DevCardType>('knight');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const [yearRes1, setYearRes1] = useState<ResourceType>('wheat');
  const [yearRes2, setYearRes2] = useState<ResourceType>('ore');
  const [monopolyRes, setMonopolyRes] = useState<ResourceType>('ore');

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  // Set initial selected card when modal opens
  useEffect(() => {
    if (isOpen && myPlayer) {
      if (myPlayer.devCards.length > 0) {
        setSelectedCard(myPlayer.devCards[0]);
      } else {
        setSelectedCard('knight');
      }
      setIsFlipped(false);
    }
  }, [isOpen, myPlayer]);

  if (!isOpen || !myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const alreadyPlayedThisTurn = gameState.hasPlayedDevCardThisTurn;

  // Count cards owned by player
  const cardCounts: Record<DevCardType, number> = {
    knight: 0,
    road_building: 0,
    year_of_plenty: 0,
    monopoly: 0,
    victory_point: 0,
  };
  myPlayer.devCards.forEach((c) => {
    cardCounts[c] = (cardCounts[c] || 0) + 1;
  });

  const allCardTypes: DevCardType[] = [
    'knight',
    'road_building',
    'year_of_plenty',
    'monopoly',
    'victory_point',
  ];

  const ownedCardTypes = allCardTypes.filter((cardType) => cardCounts[cardType] > 0);
  const activeSelectedCard =
    cardCounts[selectedCard] > 0
      ? selectedCard
      : ownedCardTypes[0] || 'knight';

  const isSelectedBoughtThisTurn = myPlayer.newDevCardsBoughtThisTurn.includes(activeSelectedCard);
  const ownsSelectedCard = cardCounts[activeSelectedCard] > 0;
  const isSelectedPlayable =
    ownsSelectedCard &&
    isMyTurn &&
    gameState.phase === 'turn_actions' &&
    !alreadyPlayedThisTurn &&
    !isSelectedBoughtThisTurn &&
    activeSelectedCard !== 'victory_point';

  const handleSelectCard = (card: DevCardType) => {
    setSelectedCard(card);
    setIsFlipped(false);
  };

  const handlePlay = () => {
    if (!isSelectedPlayable) return;
    let extraData: any = {};
    if (activeSelectedCard === 'year_of_plenty') {
      extraData = { res1: yearRes1, res2: yearRes2 };
    } else if (activeSelectedCard === 'monopoly') {
      extraData = { resource: monopolyRes };
    }
    onPlayDevCard(activeSelectedCard, extraData);
    onClose();
  };

  const currentCardData = DEV_CARD_ASSETS[activeSelectedCard];

  // Action status message
  const statusMessage =
    activeSelectedCard === 'victory_point'
      ? 'PASSIVE VP (+1 VP)'
      : !ownsSelectedCard
      ? 'NO CARDS OWNED'
      : !isMyTurn
      ? 'NOT YOUR TURN'
      : alreadyPlayedThisTurn
      ? 'ALREADY PLAYED 1 CARD THIS TURN'
      : isSelectedBoughtThisTurn
      ? 'BOUGHT THIS TURN (LOCKED)'
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-catan">
      {/* Modal Frame Wrapper matching aspect ratio 1588 / 974 */}
      <div className="relative w-full max-w-5xl aspect-[1588/974] max-h-[95vh] select-none text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.95)]">
        
        {/* 1. Base Frame Asset (Pre-rendered Gothic Frame, Headers & Shelves) */}
        <Image
          src="/assets/ingame/development_card/ingame_development_cards_frame_en.png"
          alt="Development Cards Modal Frame"
          fill
          className="object-contain pointer-events-none drop-shadow-2xl"
          priority
        />

        {/* 2. Top-Right Close Button (X) Hitbox */}
        <button
          onClick={onClose}
          className="absolute top-[3.2%] right-[2.4%] w-[4.5%] h-[5.8%] rounded-full cursor-pointer hover:bg-white/10 active:scale-95 transition-all z-30"
          title="Close"
        />

        {/* 3. Left Panel: Cabinet Shelves for Cards (Only Owned Cards) */}
        <div className="absolute left-[4.8%] top-[12.5%] w-[59%] bottom-[14%] flex flex-col justify-start overflow-y-auto px-2 py-2 scrollbar-thin z-20">
          {ownedCardTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full my-auto text-center px-4 py-8 select-none">
              <span className="text-3xl sm:text-4xl mb-2">🎴</span>
              <span className="font-serif text-xs sm:text-sm text-[#fae19c] font-bold tracking-wide">
                NO DEVELOPMENT CARDS OWNED
              </span>
              <span className="font-serif text-[11px] sm:text-xs text-[#9aa7b7] mt-1 max-w-xs">
                Purchase development cards during your turn for 1 Wool + 1 Grain + 1 Ore.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-auto">
              {ownedCardTypes.map((cardType) => {
                const data = DEV_CARD_ASSETS[cardType];
                const count = cardCounts[cardType];
                const isSelected = activeSelectedCard === cardType;

                return (
                  <div
                    key={cardType}
                    onClick={() => handleSelectCard(cardType)}
                    className={`group relative aspect-[1008/1519] rounded-lg cursor-pointer transition-all duration-300 select-none flex flex-col justify-end ${
                      isSelected
                        ? 'ring-2 sm:ring-4 ring-[#f5b829] scale-[1.03] shadow-[0_0_20px_rgba(245,184,41,0.65)] z-20'
                        : 'hover:scale-[1.02] hover:brightness-110 opacity-95 hover:opacity-100 z-10'
                    }`}
                  >
                    {/* Card Front Image */}
                    <Image
                      src={data.front}
                      alt={data.title}
                      fill
                      className="object-cover rounded-lg shadow-[0_6px_14px_rgba(0,0,0,0.85)] border border-[#4e381f]"
                      priority
                    />

                    {/* Top Right: Stack Count Badge */}
                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-sm border border-[#e5ba55]/90 shadow-md flex items-center gap-1">
                      <span className="text-[9px] sm:text-[11px] text-amber-300 font-serif font-black">
                        x{count}
                      </span>
                    </div>

                    {/* Bottom Name Ribbon */}
                    <div className="relative z-10 w-full px-1 py-0.5 sm:py-1 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-lg text-center">
                      <span className="font-serif font-bold text-[10px] sm:text-xs text-[#fae19c] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] truncate block">
                        {data.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Right Panel: Card Details & 3D Flipping Preview */}
        <div className="absolute left-[68.2%] right-[3.8%] top-[18.5%] bottom-[26.5%] flex flex-col items-center justify-center z-20">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative cursor-pointer select-none [perspective:1200px]"
            title="Click card to flip face / details"
          >
            <div
              className={`relative w-36 sm:w-44 md:w-48 lg:w-52 aspect-[1008/1519] max-h-[44vh] transition-transform duration-700 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front Face */}
              <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden border-2 border-[#d4a34b] shadow-[0_10px_25px_rgba(0,0,0,0.95),0_0_20px_rgba(212,163,75,0.35)]">
                <Image
                  src={currentCardData.front}
                  alt={currentCardData.title}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Top Right Flip Indicator Badge */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-[#e5ba55]/80 shadow flex items-center gap-1 group-hover:scale-105 transition-transform">
                  <RotateCw className="w-2.5 h-2.5 text-amber-300" />
                  <span className="text-[9px] text-amber-200 font-bold">FLIP</span>
                </div>
              </div>

              {/* Back Face */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden border-2 border-[#d4a34b] shadow-[0_10px_25px_rgba(0,0,0,0.95),0_0_20px_rgba(212,163,75,0.35)]">
                <Image
                  src={currentCardData.back}
                  alt={`${currentCardData.title} Back`}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Top Right Flip Indicator Badge */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-[#e5ba55]/80 shadow flex items-center gap-1 group-hover:scale-105 transition-transform">
                  <RotateCw className="w-2.5 h-2.5 text-amber-300" />
                  <span className="text-[9px] text-amber-200 font-bold">FLIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flip Hint */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-[#cbb596] hover:text-[#fcd34d] transition-colors cursor-pointer"
          >
            <RotateCw className="w-3 h-3 animate-pulse" />
            <span className="font-serif">Click card to flip description</span>
          </button>
        </div>

        {/* 6. Extra Option Pickers for Year of Plenty / Monopoly (Floating above button) */}
        {activeSelectedCard === 'year_of_plenty' && isSelectedPlayable && (
          <div className="absolute left-[68.2%] right-[3.8%] bottom-[24.5%] z-30 p-1.5 rounded-lg bg-[#0c1117]/95 border border-[#523d24] flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-sm">
            <select
              value={yearRes1}
              onChange={(e) => setYearRes1(e.target.value as ResourceType)}
              className="bg-[#18202c] border border-[#523d24] rounded px-1.5 py-0.5 text-[11px] text-white cursor-pointer"
            >
              {RESOURCES_EN.map((r) => (
                <option key={r.type} value={r.type}>
                  {r.label}
                </option>
              ))}
            </select>
            <span className="text-[#f5b829] font-bold text-xs">+</span>
            <select
              value={yearRes2}
              onChange={(e) => setYearRes2(e.target.value as ResourceType)}
              className="bg-[#18202c] border border-[#523d24] rounded px-1.5 py-0.5 text-[11px] text-white cursor-pointer"
            >
              {RESOURCES_EN.map((r) => (
                <option key={r.type} value={r.type}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeSelectedCard === 'monopoly' && isSelectedPlayable && (
          <div className="absolute left-[68.2%] right-[3.8%] bottom-[24.5%] z-30 p-1.5 rounded-lg bg-[#0c1117]/95 border border-[#523d24] flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-sm">
            <span className="text-[10px] text-[#cbb596] font-serif">Resource:</span>
            <select
              value={monopolyRes}
              onChange={(e) => setMonopolyRes(e.target.value as ResourceType)}
              className="bg-[#18202c] border border-[#523d24] rounded px-2 py-0.5 text-[11px] text-white cursor-pointer flex-1"
            >
              {RESOURCES_EN.map((r) => (
                <option key={r.type} value={r.type}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 7. Right Panel: Activate Button Asset */}
        <div className="absolute left-[67.8%] right-[3.4%] bottom-[13.8%] h-[9.2%] flex flex-col items-center justify-center z-20">
          <button
            onClick={handlePlay}
            disabled={!isSelectedPlayable}
            className={`relative w-full h-full cursor-pointer transition-all flex items-center justify-center select-none ${
              isSelectedPlayable
                ? 'hover:brightness-110 active:scale-98 drop-shadow-[0_4px_14px_rgba(245,184,41,0.5)]'
                : 'opacity-50 grayscale cursor-not-allowed'
            }`}
          >
            <Image
              src="/assets/ingame/development_card/ingame_development_cards_activate_button_en.png"
              alt="Activate Card Button"
              fill
              className="object-contain pointer-events-none"
              priority
            />
          </button>
          {statusMessage && (
            <span className="absolute -top-4 text-[10px] font-serif text-[#f87171] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap pointer-events-none">
              {statusMessage}
            </span>
          )}
        </div>

        {/* 8. Bottom Center: Close Button Asset */}
        <div className="absolute left-[38.2%] right-[38.2%] bottom-[3.8%] h-[6.2%] flex items-center justify-center z-20">
          <button
            onClick={onClose}
            className="relative w-full h-full cursor-pointer hover:brightness-115 active:scale-95 transition-all select-none drop-shadow-md"
          >
            <Image
              src="/assets/ingame/development_card/ingame_development_cards_close_button_en.png"
              alt="Close Button"
              fill
              className="object-contain pointer-events-none"
              priority
            />
          </button>
        </div>
      </div>
    </div>
  );
};

