'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GameState, Player, PlayerColor } from '@/lib/catan/types';
import { Check, Crown } from 'lucide-react';

interface LobbyRoomProps {
  gameState: GameState;
  currentUserId: string;
  userAvatar?: string;
  isHost: boolean;
  status: string;
  roomId: string;
  onStartGame: () => void;
  onSetReady: (ready: boolean) => void;
  onOpenProfile: () => void;
  onOpenRulebook: () => void;
}

interface SlotTheme {
  index: number;
  number: string;
  color: PlayerColor;
  name: string;
  frame: string;
  defaultAvatar: string;
}

const SLOT_THEMES: SlotTheme[] = [
  {
    index: 0,
    number: '1',
    color: 'red',
    name: 'Ghế 1 (Đỏ)',
    frame: '/assets/lobby/lobby_player_slot_red.png',
    defaultAvatar: '/assets/avatars/alexander.png',
  },
  {
    index: 1,
    number: '2',
    color: 'blue',
    name: 'Ghế 2 (Xanh Biển)',
    frame: '/assets/lobby/lobby_player_slot_blue.png',
    defaultAvatar: '/assets/avatars/elara.png',
  },
  {
    index: 2,
    number: '3',
    color: 'green',
    name: 'Ghế 3 (Xanh Lá)',
    frame: '/assets/lobby/lobby_player_slot_green.png',
    defaultAvatar: '/assets/avatars/magnus.png',
  },
  {
    index: 3,
    number: '4',
    color: 'orange',
    name: 'Ghế 4 (Vàng Kim)',
    frame: '/assets/lobby/lobby_player_slot_orange.png',
    defaultAvatar: '/assets/avatars/lyra.png',
  },
];

function getPlayerAvatar(player: Player, slotIndex: number, userAvatar?: string): string {
  if (userAvatar) {
    return `/assets/avatars/${userAvatar}.png`;
  }
  const seed = (player.avatarSeed || '').toLowerCase();
  if (seed.includes('elara')) return '/assets/avatars/elara.png';
  if (seed.includes('magnus')) return '/assets/avatars/magnus.png';
  if (seed.includes('lyra')) return '/assets/avatars/lyra.png';
  if (seed.includes('alexander')) return '/assets/avatars/alexander.png';

  const name = (player.name || '').toLowerCase();
  if (name.includes('elara')) return '/assets/avatars/elara.png';
  if (name.includes('magnus')) return '/assets/avatars/magnus.png';
  if (name.includes('lyra')) return '/assets/avatars/lyra.png';
  if (name.includes('alexander')) return '/assets/avatars/alexander.png';

  return SLOT_THEMES[slotIndex]?.defaultAvatar || '/assets/avatars/alexander.png';
}

export const LobbyRoom: React.FC<LobbyRoomProps> = ({
  gameState,
  currentUserId,
  userAvatar,
  isHost,
  roomId,
  onStartGame,
  onSetReady,
  onOpenRulebook,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const isMeReady = myPlayer?.isReady ?? false;

  // Host can only start if >= 2 players and ALL other players are ready
  const canStart =
    isHost &&
    gameState.players.length >= 2 &&
    gameState.players.every((p) => p.isReady || p.isHost);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-catan flex flex-col justify-between p-3 sm:p-4 md:p-5">
      {/* 1. CASTLE HALL FULLSCREEN BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/lobby/lobby_background.png"
          alt="Medieval Castle Lobby"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Soft atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/55 pointer-events-none" />
      </div>

      {/* 2. TOP FLOATING HEADER (WELL-BALANCED) */}
      {/* 2. TOP FLOATING HEADER (BORDERLESS ASSETS & ENLARGED ROOM CODE) */}
      <header className="relative z-30 w-full flex items-center justify-between pointer-events-none px-2 sm:px-4 lg:px-6">
        {/* Top Left: LOBBY CATAN Plaque */}
        <div className="relative w-44 sm:w-52 md:w-60 lg:w-68 aspect-[2.79/1] pointer-events-auto filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)]">
          <Image
            src="/assets/lobby/lobby_title_header.png"
            alt="LOBBY CATAN"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Top Center: Room Code Panel with Integrated Copy Button (Slightly Reduced) */}
        <div className="relative w-60 sm:w-72 md:w-84 lg:w-[370px] aspect-[2.94/1] pointer-events-auto filter drop-shadow-[0_10px_24px_rgba(0,0,0,0.88)]">
          <Image
            src="/assets/lobby/lobby_room_code_panel.png"
            alt="Room Code Panel"
            fill
            className="object-contain pointer-events-none"
            priority
          />
          {/* Room Code Text */}
          <div className="absolute left-[12%] right-[12%] top-[34%] bottom-[20%] flex items-center justify-center">
            <span className="font-mono font-black text-lg sm:text-xl md:text-2xl lg:text-3xl text-amber-200 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {roomId}
            </span>
          </div>

          {/* Copy Button embedded in the right golden octagon socket */}
          <button
            onClick={handleCopyLink}
            className="absolute left-[76.2%] top-[29.5%] w-[15.8%] h-[44%] flex items-center justify-center cursor-pointer group hover:scale-110 active:scale-95 transition-transform"
            title="Sao chép link mời phòng"
          >
            <div className="relative w-full h-full">
              <Image
                src="/assets/lobby/lobby_copy_button.png"
                alt="Copy Link"
                fill
                className="object-contain"
              />
            </div>
          </button>
        </div>

        {/* Top Right: RULES & LEAVE ROOM Buttons (Equal Width & Height) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 pointer-events-auto">
          {/* RULES Button */}
          <button
            onClick={onOpenRulebook}
            className="relative w-28 sm:w-34 md:w-40 lg:w-44 aspect-[2.82/1] filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] hover:brightness-115 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Tra Cứu Luật Chơi"
          >
            <Image
              src="/assets/lobby/lobby_rules_button.png"
              alt="RULES"
              fill
              className="object-contain"
            />
          </button>

          {/* LEAVE ROOM Button */}
          <button
            onClick={() => router.push('/')}
            className="relative w-28 sm:w-34 md:w-40 lg:w-44 aspect-[2.82/1] filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] hover:brightness-115 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Rời Phòng Về Trang Chủ"
          >
            <Image
              src="/assets/lobby/lobby_leave_room_button.png"
              alt="LEAVE ROOM"
              fill
              className="object-contain"
            />
          </button>
        </div>
      </header>

      {/* Copy notification toast */}
      {copied && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-black/90 border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
          <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
          <span>Đã sao chép liên kết phòng vào bộ nhớ tạm!</span>
        </div>
      )}

      {/* 3. CENTER: 4 VERTICAL CARDS (TIGHT SPACING OVERCOMING PNG PADDING) */}
      <main className="relative z-20 flex-1 w-full flex items-center justify-center my-auto px-2 sm:px-4 py-1">
        <div className="flex flex-row items-center justify-center -space-x-4 sm:-space-x-8 md:-space-x-12 lg:-space-x-14">
          {SLOT_THEMES.map((theme, i) => {
            const player = gameState.players[i];
            const isMe = player?.id === currentUserId;

            if (player) {
              const avatarSrc = getPlayerAvatar(player, i, isMe ? userAvatar : undefined);
              const [mainName, tagNumber] = player.name.includes('#')
                ? player.name.split('#')
                : [player.name, ''];

              return (
                <div
                  key={`occupied_slot_${theme.number}`}
                  className="relative h-[48vh] sm:h-[51vh] md:h-[54vh] lg:h-[56vh] max-h-[540px] min-h-[330px] aspect-[2/3] flex flex-col items-center select-none filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] group transition-transform duration-300 hover:scale-[1.02]"
                >
                  {/* Avatar Circle positioned behind the banner cutout */}
                  <div className="absolute left-[22.2%] top-[20.5%] w-[55.6%] aspect-square rounded-full overflow-hidden z-0 bg-stone-900 border border-amber-900/40">
                    <Image
                      src={avatarSrc}
                      alt={player.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 150px, 240px"
                    />
                  </div>

                  {/* Medieval Banner Frame Image */}
                  <Image
                    src={theme.frame}
                    alt={theme.name}
                    fill
                    className="object-contain pointer-events-none z-10"
                    priority
                  />

                  {/* Top Shield Number (1, 2, 3, 4) */}
                  <div className="absolute top-[3.2%] left-1/2 -translate-x-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center pointer-events-none">
                    <span className="font-grenze font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-amber-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {theme.number}
                    </span>
                  </div>

                  {/* Green translucent READY banner */}
                  {player.isReady && (
                    <div
                      className="absolute top-[49%] -translate-y-1/2 inset-x-[13%] z-20 bg-emerald-600/55 backdrop-blur-[2px] border-y border-emerald-300/35 py-2 sm:py-2.5 md:py-3 rounded-sm flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
                      title="READY"
                    >
                      <span className="font-catan font-black text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.22em] uppercase text-white/75 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        READY
                      </span>
                    </div>
                  )}

                  {/* Player Name and Tag # (shifted down into plaque optical center) */}
                  <div className="absolute top-[63.8%] inset-x-[11%] flex flex-col items-center justify-center gap-0.5 z-20 px-1 text-center">
                    {/* Name + Crown line */}
                    <div className="flex items-center justify-center gap-1.5 max-w-full">
                      <span className="font-serif font-black text-xs sm:text-sm md:text-base text-amber-100 tracking-wide truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {mainName.trim()}
                      </span>

                      {/* Host Crown */}
                      {player.isHost && (
                        <span title="Chủ Phòng (Host)">
                          <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] shrink-0" />
                        </span>
                      )}
                    </div>

                    {/* Tag # on separate line below */}
                    {tagNumber && (
                      <span className="font-mono font-bold text-[10px] sm:text-xs text-amber-300/80 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        #{tagNumber.trim()}
                      </span>
                    )}

                    {/* Self tag if not host */}
                    {isMe && !player.isHost && (
                      <span className="text-[9px] sm:text-[10px] text-amber-300 font-sans font-bold tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/40 mt-0.5">
                        (Bạn)
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Empty Slot (Purely visual placeholder)
            return (
              <div
                key={`empty_slot_${theme.number}`}
                className="relative h-[48vh] sm:h-[51vh] md:h-[54vh] lg:h-[56vh] max-h-[540px] min-h-[330px] aspect-[2/3] flex flex-col items-center select-none filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]"
              >
                <Image
                  src="/assets/lobby/lobby_player_slot_empty.png"
                  alt={`Ghế ${theme.number} Còn Trống`}
                  fill
                  className="object-contain pointer-events-none z-10"
                  priority
                />
                {/* Top Shield Number on empty slot */}
                <div className="absolute top-[3.2%] left-1/2 -translate-x-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center pointer-events-none">
                  <span className="font-grenze font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-amber-700/85 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {theme.number}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. BOTTOM ACTION SECTION (WELL-PROPORTIONED) */}
      <footer className="relative z-30 w-full flex flex-col items-center justify-center gap-1.5 pb-2 sm:pb-3 pointer-events-auto">
        {/* Roman-style Player Count Display */}
        <div className="flex items-center justify-center gap-2.5 select-none mb-0.5">
          <span className="text-amber-400/70 text-xs sm:text-sm">❖</span>
          <span className="font-cinzel font-black tracking-[0.25em] text-sm sm:text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-b from-[#fff8db] via-[#fed25c] to-[#b37e16] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_0_14px_rgba(254,210,92,0.45)]">
            PLAYERS: {gameState.players.length} / 4
          </span>
          <span className="text-amber-400/70 text-xs sm:text-sm">❖</span>
        </div>

        {isHost ? (
          // HOST: START GAME BUTTON
          <div className="flex flex-col items-center gap-1.5">
            {canStart ? (
              <button
                onClick={onStartGame}
                className="relative transition-all duration-300 hover:scale-105 active:scale-95 filter drop-shadow-[0_0_32px_rgba(245,158,11,0.85)] cursor-pointer"
                title="Bắt đầu ván đấu Catan"
              >
                <div className="relative w-64 sm:w-76 md:w-88 lg:w-96 aspect-[2.6/1]">
                  <Image
                    src="/assets/lobby/lobby_start_game_button.png"
                    alt="START GAME"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </button>
            ) : (
              <div
                className="relative cursor-not-allowed select-none filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]"
                title="Chưa đủ điều kiện bắt đầu (Cần tối thiểu 2 người và tất cả người chơi đã Sẵn Sàng)"
              >
                <div className="relative w-64 sm:w-76 md:w-88 lg:w-96 aspect-[2.6/1]">
                  <Image
                    src="/assets/lobby/lobby__not_start_game_button.png"
                    alt="START GAME (Chưa sẵn sàng)"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Helper status text under Host button */}
            {!canStart && (
              <span className="text-[11px] sm:text-xs text-amber-200/85 font-sans font-bold tracking-wide bg-black/70 px-4 py-1 rounded-full border border-amber-500/35 shadow-md">
                {gameState.players.length < 2
                  ? 'Cần tối thiểu 2 người chơi để bắt đầu trận'
                  : 'Đang đợi tất cả người chơi Sẵn Sàng (READY)...'}
              </span>
            )}
          </div>
        ) : (
          // GUEST: READY TOGGLE BUTTON (USING UNREADY/READY BADGE ASSETS)
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => onSetReady(!isMeReady)}
              className="relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              title={isMeReady ? 'Bấm để huỷ Sẵn Sàng' : 'Bấm để Sẵn Sàng'}
            >
              <div
                className={`relative w-64 sm:w-76 md:w-88 lg:w-96 aspect-[3.48/1] transition-all
                  ${
                    isMeReady
                      ? 'filter drop-shadow-[0_0_30px_rgba(34,197,94,0.85)]'
                      : 'filter drop-shadow-[0_0_20px_rgba(0,0,0,0.85)]'
                  }
                `}
              >
                <Image
                  src={
                    isMeReady
                      ? '/assets/lobby/lobby_ready_badge.png'
                      : '/assets/lobby/lobby_unready_badge.png'
                  }
                  alt={isMeReady ? 'READY (Đã sẵn sàng)' : 'READY (Chưa sẵn sàng)'}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </button>

            {/* Helper status text under Guest button */}
            <span className="text-[11px] sm:text-xs text-amber-200/85 font-sans font-bold tracking-wide bg-black/70 px-4 py-1 rounded-full border border-amber-500/35 shadow-md">
              {isMeReady
                ? 'Bạn đã Sẵn Sàng! Chờ Chủ phòng khai màn trận đấu.'
                : 'Bấm nút để báo cho Chủ phòng biết bạn đã Sẵn Sàng'}
            </span>
          </div>
        )}
      </footer>
    </div>
  );
};
