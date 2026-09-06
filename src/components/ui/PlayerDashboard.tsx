'use client';

import React from 'react';
import Image from 'next/image';
import { GameState, COLOR_MAP } from '@/lib/catan/types';
import { Plus, Navigation, Shield } from 'lucide-react';

interface PlayerDashboardProps {
  gameState: GameState;
  currentUserId: string;
}

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

// Fallback color mapping for custom player colors
const SAFE_COLOR_MAP: Record<string, string> = {
  ...COLOR_MAP,
  red: '#e11d48',
  blue: '#1d63ed',
  green: '#15803d',
  yellow: '#eab308',
  orange: '#ea580c',
  brown: '#78350f',
  white: '#f8fafc',
  purple: '#9333ea',
};

interface VintageTheme {
  normalBg: string;
  activeBg: string;
  normalBorder: string;
  activeBorder: string;
  glow: string;
  tokenBg: string;
  tokenBorder: string;
  tokenText: string;
  turnBadgeBg: string;
  turnBadgeBorder: string;
  turnBadgeText: string;
}

const VINTAGE_OPPONENT_THEMES: Record<string, VintageTheme> = {
  red: {
    normalBg: 'bg-gradient-to-r from-[#381013]/95 via-[#240a0c]/95 to-[#140607]/95',
    activeBg: 'bg-gradient-to-r from-[#52181b] via-[#350f12] to-[#1e080a]',
    normalBorder: 'border-[#732427]/80 hover:border-[#9c3539]',
    activeBorder: 'border-[#f87171]',
    glow: 'shadow-[0_0_14px_rgba(225,29,72,0.35),inset_0_1px_1px_rgba(255,200,200,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#381013] to-[#140607]',
    tokenBorder: '#9c3539',
    tokenText: 'text-[#fecaca]',
    turnBadgeBg: 'bg-red-950/80',
    turnBadgeBorder: 'border-red-500/50',
    turnBadgeText: 'text-red-200',
  },
  blue: {
    normalBg: 'bg-gradient-to-r from-[#0d2235]/95 via-[#081622]/95 to-[#040d15]/95',
    activeBg: 'bg-gradient-to-r from-[#153653] via-[#0d2235] to-[#081623]',
    normalBorder: 'border-[#1f4b6e]/80 hover:border-[#2e6d9e]',
    activeBorder: 'border-[#38bdf8]',
    glow: 'shadow-[0_0_14px_rgba(56,189,248,0.35),inset_0_1px_1px_rgba(200,230,255,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#0d2235] to-[#040d15]',
    tokenBorder: '#2e6d9e',
    tokenText: 'text-[#bae6fd]',
    turnBadgeBg: 'bg-sky-950/80',
    turnBadgeBorder: 'border-sky-500/50',
    turnBadgeText: 'text-sky-200',
  },
  green: {
    normalBg: 'bg-gradient-to-r from-[#112715]/95 via-[#0a190e]/95 to-[#050f08]/95',
    activeBg: 'bg-gradient-to-r from-[#1b3d21] via-[#112715] to-[#0a180d]',
    normalBorder: 'border-[#24542d]/80 hover:border-[#357942]',
    activeBorder: 'border-[#4ade80]',
    glow: 'shadow-[0_0_14px_rgba(74,222,128,0.35),inset_0_1px_1px_rgba(200,255,200,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#112715] to-[#050f08]',
    tokenBorder: '#357942',
    tokenText: 'text-[#bbf7d0]',
    turnBadgeBg: 'bg-emerald-950/80',
    turnBadgeBorder: 'border-emerald-500/50',
    turnBadgeText: 'text-emerald-200',
  },
  yellow: {
    normalBg: 'bg-gradient-to-r from-[#302106]/95 via-[#1f1504]/95 to-[#120d02]/95',
    activeBg: 'bg-gradient-to-r from-[#47320a] via-[#302106] to-[#1d1404]',
    normalBorder: 'border-[#6e4c15]/80 hover:border-[#9c6c1f]',
    activeBorder: 'border-[#facc15]',
    glow: 'shadow-[0_0_14px_rgba(250,204,21,0.35),inset_0_1px_1px_rgba(255,245,180,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#302106] to-[#120d02]',
    tokenBorder: '#9c6c1f',
    tokenText: 'text-[#fef08a]',
    turnBadgeBg: 'bg-amber-950/80',
    turnBadgeBorder: 'border-amber-500/50',
    turnBadgeText: 'text-amber-200',
  },
  orange: {
    normalBg: 'bg-gradient-to-r from-[#331606]/95 via-[#210e04]/95 to-[#140802]/95',
    activeBg: 'bg-gradient-to-r from-[#4d2109] via-[#331606] to-[#1f0d04]',
    normalBorder: 'border-[#733414]/80 hover:border-[#a34b1d]',
    activeBorder: 'border-[#fb923c]',
    glow: 'shadow-[0_0_14px_rgba(251,146,60,0.35),inset_0_1px_1px_rgba(255,220,180,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#331606] to-[#140802]',
    tokenBorder: '#a34b1d',
    tokenText: 'text-[#fed7aa]',
    turnBadgeBg: 'bg-orange-950/80',
    turnBadgeBorder: 'border-orange-500/50',
    turnBadgeText: 'text-orange-200',
  },
  brown: {
    normalBg: 'bg-gradient-to-r from-[#28170c]/95 via-[#1a0e07]/95 to-[#100804]/95',
    activeBg: 'bg-gradient-to-r from-[#3d2212] via-[#28170c] to-[#180e07]',
    normalBorder: 'border-[#5c331a]/80 hover:border-[#854a26]',
    activeBorder: 'border-[#d97706]',
    glow: 'shadow-[0_0_16px_rgba(217,119,6,0.35),inset_0_1px_1px_rgba(255,225,180,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#28170c] to-[#100804]',
    tokenBorder: '#854a26',
    tokenText: 'text-[#fde68a]',
    turnBadgeBg: 'bg-amber-950/80',
    turnBadgeBorder: 'border-amber-600/50',
    turnBadgeText: 'text-amber-200',
  },
  white: {
    normalBg: 'bg-gradient-to-r from-[#24221f]/95 via-[#171614]/95 to-[#0e0d0c]/95',
    activeBg: 'bg-gradient-to-r from-[#35332f] via-[#24221f] to-[#151412]',
    normalBorder: 'border-[#524d46]/80 hover:border-[#756f64]',
    activeBorder: 'border-[#e2e8f0]',
    glow: 'shadow-[0_0_14px_rgba(226,232,240,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]',
    tokenBg: 'bg-gradient-to-b from-[#24221f] to-[#0e0d0c]',
    tokenBorder: '#756f64',
    tokenText: 'text-[#f8fafc]',
    turnBadgeBg: 'bg-stone-800/80',
    turnBadgeBorder: 'border-stone-400/50',
    turnBadgeText: 'text-stone-200',
  },
  purple: {
    normalBg: 'bg-gradient-to-r from-[#25102e]/95 via-[#170a1d]/95 to-[#0e0612]/95',
    activeBg: 'bg-gradient-to-r from-[#381846] via-[#25102e] to-[#16091c]',
    normalBorder: 'border-[#552469]/80 hover:border-[#7a3496]',
    activeBorder: 'border-[#c084fc]',
    glow: 'shadow-[0_0_14px_rgba(192,132,252,0.35),inset_0_1px_1px_rgba(240,200,255,0.12)]',
    tokenBg: 'bg-gradient-to-b from-[#25102e] to-[#0e0612]',
    tokenBorder: '#7a3496',
    tokenText: 'text-[#f3e8ff]',
    turnBadgeBg: 'bg-purple-950/80',
    turnBadgeBorder: 'border-purple-500/50',
    turnBadgeText: 'text-purple-200',
  },
};

const getVintageTheme = (color: string): VintageTheme => {
  return VINTAGE_OPPONENT_THEMES[color] || VINTAGE_OPPONENT_THEMES.brown;
};

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  gameState,
  currentUserId,
}) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const activePlayer = gameState.players.find((p) => p.id === activePlayerId);
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const mySlotIndex = gameState.playerOrder.findIndex((id) => id === currentUserId);

  const totalSlots = 4;
  const currentPlayersCount = gameState.playerOrder.length;
  const openSeatsCount = Math.max(0, totalSlots - currentPlayersCount);

  // Calculate detailed points breakdown for current user
  const mySettlementsCount = Object.values(gameState.vertices).filter(
    (v) => v.building?.playerId === currentUserId && v.building.type === 'settlement'
  ).length;
  const mySettlementsPoints = mySettlementsCount * 1;

  const myCitiesCount = Object.values(gameState.vertices).filter(
    (v) => v.building?.playerId === currentUserId && v.building.type === 'city'
  ).length;
  const myCitiesPoints = myCitiesCount * 2;

  const myDevCardVp = myPlayer
    ? myPlayer.devCards.filter((c) => c === 'victory_point').length
    : 0;

  const myLongestRoadVp = myPlayer?.hasLongestRoad ? 2 : 0;
  const myLargestArmyVp = myPlayer?.hasLargestArmy ? 2 : 0;

  const myTotalPoints = myPlayer
    ? myPlayer.victoryPoints
    : mySettlementsPoints + myCitiesPoints + myDevCardVp + myLongestRoadVp + myLargestArmyVp;

  const isMyTurn = activePlayerId === currentUserId;
  const myPlayerColorHex = myPlayer ? (SAFE_COLOR_MAP[myPlayer.color] || '#eab308') : '#eab308';

  // Opponents list (other players excluding self)
  const opponentIds = gameState.playerOrder.filter((id) => id !== currentUserId);

  return (
    <div className="flex w-full flex-col gap-2.5 sm:gap-3 select-none font-catan">
      {/* 1. CURRENT USER PROFILE & SCORE DETAILS CARD (Authentic medieval game card matching reference) */}
      {myPlayer && (
        <div className="relative flex flex-col rounded-2xl px-[12%] pt-[11%] pb-[11%] text-slate-100 shadow-[0_16px_36px_rgba(0,0,0,0.92)] overflow-hidden">
          {/* Authentic High-Res Medieval Game Frame Asset */}
          <Image
            src="/assets/ingame/ingame_score_card_frame.png"
            alt="Score Card Frame"
            fill
            className="object-fill pointer-events-none -z-0 select-none"
            priority
          />

          {/* Inner Content sitting safely within the frame's dark wood center */}
          <div className="relative z-10 flex flex-col w-full">
            {/* Top Row: Avatar + Name + Turn Ribbon */}
            <div className="flex items-center gap-3 sm:gap-3.5">
              {/* Avatar Medallion with Ultra-Prominent Player Color Border & Radiant Aura */}
              <div className="relative shrink-0 flex items-center justify-center">
                {/* Luminous Pulsing Color Aura */}
                <div
                  className="absolute -inset-1.5 rounded-full blur-md opacity-90 animate-pulse pointer-events-none"
                  style={{ backgroundColor: myPlayerColorHex }}
                />

                {/* Outer Ring strictly using Player's Primary Color */}
                <div
                  className="relative h-15 w-15 sm:h-16 sm:w-16 rounded-full p-[3.5px] shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: myPlayerColorHex,
                    boxShadow: `0 0 24px ${myPlayerColorHex}, 0 0 45px ${myPlayerColorHex}99, 0 6px 16px rgba(0,0,0,0.95), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.6)`,
                  }}
                >
                  <div
                    className="relative w-full h-full rounded-full overflow-hidden border-[2.5px] bg-black shadow-[inset_0_3px_8px_rgba(0,0,0,0.95)]"
                    style={{ borderColor: myPlayerColorHex }}
                  >
                    <Image
                      src={getAvatarSrc(myPlayer.avatarSeed || myPlayer.name, mySlotIndex >= 0 ? mySlotIndex : 0)}
                      alt={myPlayer.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Name & Turn Ribbon */}
              <div className="min-w-0 flex-1 flex flex-col items-start">
                <span className="truncate w-full font-serif font-black text-xs sm:text-sm text-white tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  {myPlayer.name}
                </span>

                {/* Turn Ribbon Badge with Swallowtail cut */}
                {isMyTurn ? (
                  <div className="relative inline-flex items-center px-2.5 py-0.5 mt-0.5 bg-gradient-to-r from-[#15803d] via-[#22c55e] to-[#15803d] border-y border-[#86efac]/80 text-white font-serif font-black text-[9px] sm:text-[10px] tracking-wider shadow-[0_2px_6px_rgba(0,0,0,0.6)] uppercase [clip-path:polygon(0_0,calc(100%-6px)_0,100%_50%,calc(100%-6px)_100%,0_100%)]">
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pr-1">YOUR TURN</span>
                  </div>
                ) : (
                  <div className="relative inline-flex items-center px-2.5 py-0.5 mt-0.5 bg-gradient-to-r from-[#5c2b09] via-[#85410d] to-[#5c2b09] border-y border-[#fbbf24]/60 text-[#fef3c7] font-serif font-bold text-[9px] sm:text-[10px] tracking-wider shadow-[0_2px_6px_rgba(0,0,0,0.6)] uppercase [clip-path:polygon(0_0,calc(100%-6px)_0,100%_50%,calc(100%-6px)_100%,0_100%)] max-w-full">
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate pr-1">
                      {activePlayer?.name.toUpperCase() || 'OPPONENT'}&apos;S TURN
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Center Plaque: Total Points */}
            <div className="w-full my-2 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-[#221307]/90 via-[#140b04]/90 to-[#0b0502]/90 border border-[#8a6834]/80 flex items-center justify-between shadow-[inset_0_3px_10px_rgba(0,0,0,0.95),0_2px_6px_rgba(0,0,0,0.7)] backdrop-blur-xs">
              <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                <Image
                  src="/assets/icons/trophy.png"
                  alt="Trophy"
                  fill
                  className="object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.85)]"
                  priority
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="font-serif text-[10px] sm:text-[11px] font-semibold text-[#cbb596] tracking-wider">
                  Total Points
                </span>
                <span className="font-serif font-black text-2xl sm:text-3xl text-[#facc15] leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] mt-0.5">
                  {myTotalPoints}
                </span>
              </div>
            </div>

            {/* Detailed Points Breakdown Rows */}
            <div className="flex flex-col gap-0.5 w-full">
              {/* 1. Victory Points (from dev cards) */}
              <div className="flex items-center justify-between py-0.5 px-1 border-b border-[#3b2310]/80 shadow-[0_1px_0_rgba(255,235,170,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="relative h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0">
                    <Image
                      src="/assets/icons/victory-star.png"
                      alt="Star"
                      fill
                      className="object-contain drop-shadow"
                    />
                  </div>
                  <span className="font-serif text-[11px] sm:text-xs font-semibold text-[#e8dccb]">Victory Points</span>
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-[#facc15] drop-shadow">{myDevCardVp}</span>
              </div>

              {/* 2. Longest Road */}
              <div className="flex items-center justify-between py-0.5 px-1 border-b border-[#3b2310]/80 shadow-[0_1px_0_rgba(255,235,170,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="relative h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 flex items-center justify-center">
                    <Image
                      src="/assets/ingame/ingame_road_piece.png"
                      alt="Road"
                      fill
                      className="object-contain drop-shadow"
                    />
                  </div>
                  <span className="font-serif text-[11px] sm:text-xs font-semibold text-[#e8dccb]">Longest Road</span>
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-[#facc15] drop-shadow">{myLongestRoadVp}</span>
              </div>

              {/* 3. Largest Army */}
              <div className="flex items-center justify-between py-0.5 px-1 border-b border-[#3b2310]/80 shadow-[0_1px_0_rgba(255,235,170,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="relative h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 flex items-center justify-center">
                    <Image
                      src="/assets/icons/knight-helmet.png"
                      alt="Knight Helmet"
                      fill
                      className="object-contain drop-shadow"
                    />
                  </div>
                  <span className="font-serif text-[11px] sm:text-xs font-semibold text-[#e8dccb]">Largest Army</span>
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-[#facc15] drop-shadow">{myLargestArmyVp}</span>
              </div>

              {/* 4. Settlement */}
              <div className="flex items-center justify-between py-0.5 px-1 border-b border-[#3b2310]/80 shadow-[0_1px_0_rgba(255,235,170,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="relative h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0">
                    <Image
                      src="/assets/ingame/ingame_settlement_piece.png"
                      alt="Settlement"
                      fill
                      className="object-contain drop-shadow"
                    />
                  </div>
                  <span className="font-serif text-[11px] sm:text-xs font-semibold text-[#e8dccb]">Settlement</span>
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-[#facc15] drop-shadow">{mySettlementsPoints}</span>
              </div>

              {/* 5. City */}
              <div className="flex items-center justify-between py-0.5 px-1">
                <div className="flex items-center gap-2">
                  <div className="relative h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0">
                    <Image
                      src="/assets/ingame/ingame_city_piece.png"
                      alt="City"
                      fill
                      className="object-contain drop-shadow"
                    />
                  </div>
                  <span className="font-serif text-[11px] sm:text-xs font-semibold text-[#e8dccb]">City</span>
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-[#facc15] drop-shadow">{myCitiesPoints}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OPPONENTS LIST (No Victory Points displayed, only Cards & Badges) */}
      <div className="flex flex-col gap-2 rounded-2xl bg-[#140d07]/90 p-2.5 sm:p-3 border border-[#442c16]/80 shadow-md backdrop-blur-md">
        <div className="px-1 pb-1 text-[11px] font-serif font-bold text-[#cbb596] uppercase tracking-wider flex items-center justify-between border-b border-[#2d1b0d]">
          <span>Opponents</span>
          <span className="text-[10px] text-stone-400">Cards</span>
        </div>

        {opponentIds.map((playerId) => {
          const player = gameState.players.find((p) => p.id === playerId);
          if (!player) return null;

          const isActive = playerId === activePlayerId;
          const totalCards = Object.values(player.resources).reduce((a, b) => a + b, 0);
          const playerColorHex = SAFE_COLOR_MAP[player.color] || '#eab308';
          const slotIndex = gameState.playerOrder.findIndex((id) => id === playerId);
          const theme = getVintageTheme(player.color);

          return (
            <div
              key={player.id}
              className={`group relative flex items-center justify-between gap-3 rounded-xl p-2 sm:p-2.5 transition-all overflow-hidden border shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),inset_0_-2px_4px_rgba(0,0,0,0.6),0_3px_8px_rgba(0,0,0,0.65)] ${
                isActive
                  ? `${theme.activeBg} ${theme.activeBorder} ${theme.glow}`
                  : `${theme.normalBg} ${theme.normalBorder}`
              }`}
            >
              {/* Left: Avatar with Color Ring */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-full border-2 bg-black/60 shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                  style={{ borderColor: playerColorHex }}
                >
                  <Image
                    src={getAvatarSrc(player.avatarSeed || player.name, slotIndex)}
                    alt={player.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>

                {/* Name & Dev Cards Info */}
                <div className="min-w-0 flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs sm:text-sm font-bold text-[#fcfbf9] font-vietnam drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {player.name}
                    </span>
                    {isActive && (
                      <span className={`shrink-0 rounded px-1.5 py-0.2 text-[8px] font-bold font-vietnam border ${theme.turnBadgeBg} ${theme.turnBadgeBorder} ${theme.turnBadgeText} shadow-sm`}>
                        Turn
                      </span>
                    )}
                  </div>

                  {/* Badges: Dev Cards & Special Titles */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Dev Cards Count */}
                    <div className="flex items-center gap-1 text-[11px] text-stone-300 font-vietnam drop-shadow-sm">
                      <div className="relative h-3.5 w-3 shrink-0">
                        <Image
                          src="/assets/ingame/ingame_card_icon.svg"
                          alt="Dev Cards"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold">{player.devCards.length}</span>
                    </div>

                    {/* Special Title Badges */}
                    {player.hasLongestRoad && (
                      <span
                        className="flex items-center gap-0.5 rounded bg-blue-950/90 px-1 py-0.2 text-[8px] font-bold text-blue-200 border border-blue-500/50 shadow-sm"
                        title={`Con đường dài nhất (${player.longestRoadLength} đoạn)`}
                      >
                        <Navigation className="h-2 w-2" />
                        Road
                      </span>
                    )}
                    {player.hasLargestArmy && (
                      <span
                        className="flex items-center gap-0.5 rounded bg-red-950/90 px-1 py-0.2 text-[8px] font-bold text-red-200 border border-red-500/50 shadow-sm"
                        title={`Đội quân lớn nhất (${player.playedKnights} hiệp sĩ)`}
                      >
                        <Shield className="h-2 w-2" />
                        Army
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Resource Cards Count Token */}
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] ${theme.tokenBg} text-xs sm:text-sm font-bold ${theme.tokenText} shadow-[0_2px_6px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]`}
                style={{ borderColor: theme.tokenBorder }}
                title={`${totalCards} Resource Cards in hand`}
              >
                {totalCards}
              </div>
            </div>
          );
        })}

        {/* 3. Open Seat Slots */}
        {Array.from({ length: openSeatsCount }).map((_, index) => (
          <div
            key={`open-seat-${index}`}
            className="flex items-center gap-2.5 rounded-xl border border-[#2a1b0e]/60 bg-[#0d0805]/40 p-2 text-stone-500 shadow-inner"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-stone-700/40 bg-stone-900/40">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-stone-400">Open Seat</span>
          </div>
        ))}
      </div>
    </div>
  );
};

