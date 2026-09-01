'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GameState, COLOR_MAP, PlayerColor } from '@/lib/catan/types';
import { Copy, Check, Users, Play, Settings, BookOpen, Crown, Menu, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';

interface LobbyRoomProps {
  gameState: GameState;
  currentUserId: string;
  isHost: boolean;
  status: string;
  roomId: string;
  onStartGame: () => void;
  onSetReady: (ready: boolean) => void;
  onOpenProfile: () => void;
  onOpenRulebook: () => void;
}

const PLAYER_SLOT_THEMES: { index: number; color: PlayerColor; name: string; avatar: string; ring: string; bg: string }[] = [
  { index: 1, color: 'red', name: 'Ghế 1 (Đỏ)', avatar: '/assets/avatar_hung_orig.png', ring: 'border-red-500 shadow-red-500/50', bg: 'from-red-950/80 to-stone-900/90' },
  { index: 2, color: 'blue', name: 'Ghế 2 (Xanh Biển)', avatar: '/assets/avatar_mai_orig.png', ring: 'border-blue-500 shadow-blue-500/50', bg: 'from-blue-950/80 to-stone-900/90' },
  { index: 3, color: 'green', name: 'Ghế 3 (Xanh Lá)', avatar: '/assets/avatar_nam_orig.png', ring: 'border-emerald-500 shadow-emerald-500/50', bg: 'from-emerald-950/80 to-stone-900/90' },
  { index: 4, color: 'orange', name: 'Ghế 4 (Vàng Kim)', avatar: '/assets/avatar_linh_orig.png', ring: 'border-amber-500 shadow-amber-500/50', bg: 'from-amber-950/80 to-stone-900/90' },
];

export const LobbyRoom: React.FC<LobbyRoomProps> = ({
  gameState,
  currentUserId,
  isHost,
  status,
  roomId,
  onStartGame,
  onSetReady,
  onOpenProfile,
  onOpenRulebook,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const isMeReady = myPlayer?.isReady ?? false;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = isHost && gameState.players.length >= 2;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-catan flex flex-col justify-between p-3 sm:p-5">
      {/* 1. MEDIEVAL TAVERN FULLSCREEN BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/bg_lobby_tavern.jpg"
          alt="Medieval Tavern Lobby"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Ambient Warm Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* 2. TOP FLOATING NAVIGATION BAR */}
      <header className="relative z-30 w-full flex items-center justify-between pointer-events-none">
        {/* Top Left: Return to Home button + CATAN Brand */}
        <div className="flex items-center gap-4 bg-black/85 border-3 border-catan-gold-trim px-5 py-3 sm:px-6 sm:py-3.5 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto">
          <button
            onClick={() => router.push('/')}
            className="text-catan-gold-trim hover:scale-110 active:scale-95 transition-transform flex items-center gap-2.5 font-black text-base sm:text-lg cursor-pointer"
            title="Về Trang Chủ"
          >
            <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" /> Trang Chủ
          </button>
          <div className="w-0.5 h-8 bg-catan-gold-trim/50" />
          <span className="font-black text-3xl sm:text-4xl tracking-widest text-catan-gold-trim drop-shadow-md">
            CATAN
          </span>
        </div>

        {/* Top Center: Room Code Pill & Copy Invite Link */}
        <div className="flex items-center gap-3.5 bg-black/85 border-3 border-catan-gold-trim px-5 py-3 sm:px-6 sm:py-3.5 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto">
          <span className="text-sm sm:text-base text-catan-parchment/80 uppercase tracking-widest font-sans font-black">Mã Phòng:</span>
          <strong className="text-amber-300 font-mono font-black text-lg sm:text-xl tracking-widest px-3 py-1 rounded-xl bg-black/70 border border-catan-gold-trim/50">
            {roomId}
          </strong>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm sm:text-base transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-5 h-5 stroke-[3]" /> : <Copy className="w-5 h-5 stroke-[3]" />}
            {copied ? 'Đã Chép Link' : 'Sao Chép Link'}
          </button>
        </div>

        {/* Top Right: Custom Profile & Rulebook */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 px-5 py-3 rounded-3xl bg-black/85 border-3 border-catan-gold-trim text-catan-gold-trim hover:bg-black/95 text-sm sm:text-base font-bold shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 stroke-[2.5]" /> Hồ Sơ
          </button>
          <button
            onClick={onOpenRulebook}
            className="flex items-center gap-2.5 px-5 py-3 rounded-3xl bg-black/85 border-3 border-catan-gold-trim text-catan-gold-trim hover:bg-black/95 text-sm sm:text-base font-bold shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 stroke-[2.5]" /> Luật Chơi
          </button>
        </div>
      </header>

      {/* 3. MAIN SCENE OVERLAY: Left Panel (4 Player Slots) + Center Table Placards */}
      <div className="relative z-20 flex-1 w-full flex items-center justify-between pointer-events-none my-2">
        
        {/* LEFT COLUMN: 4 Medieval Player Slots matching background frame */}
        <div className="w-64 sm:w-76 md:w-84 flex flex-col gap-2.5 sm:gap-3 pointer-events-auto bg-black/75 border-2 border-catan-gold-trim/80 p-3 sm:p-4 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-1 border-b border-catan-gold-trim/40">
            <span className="text-xs font-black uppercase tracking-widest text-catan-gold-trim flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" /> Danh Sách Hội Đồng ({gameState.players.length}/4)
            </span>
            <span className="text-[10px] text-catan-parchment/60 font-sans">Chuẩn 4 Ghế</span>
          </div>

          {/* 4 Player Slots */}
          <div className="flex flex-col gap-2.5">
            {PLAYER_SLOT_THEMES.map((theme, i) => {
              const player = gameState.players[i];
              const isMe = player?.id === currentUserId;

              return (
                <div
                  key={`slot_${theme.index}`}
                  className={`relative flex items-center gap-2.5 p-2 rounded-2xl border-2 transition-all shadow-md
                    ${
                      player
                        ? `bg-gradient-to-r ${theme.bg} ${theme.ring} ring-1 ring-amber-400/30`
                        : 'bg-black/40 border-stone-800 opacity-60'
                    }
                  `}
                >
                  {/* Left: Number Shield & Avatar */}
                  <div className="relative shrink-0 flex items-center gap-1.5">
                    {/* Number Shield */}
                    <div
                      className="w-6 h-7 rounded-md flex items-center justify-center font-black text-xs text-white shadow-md border border-white/40"
                      style={{ backgroundColor: COLOR_MAP[theme.color as PlayerColor] }}
                    >
                      {theme.index}
                    </div>

                    {/* Avatar Circle */}
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-catan-gold-trim shadow-inner bg-stone-900">
                      {player ? (
                        <Image
                          src={theme.avatar}
                          alt={player.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-600 font-bold">
                          ?
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: 2 Stacked Wooden Placards */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    {/* Top Placard: Name + Badges */}
                    <div className="px-2.5 py-0.5 rounded-lg bg-black/60 border border-catan-gold-trim/50 flex items-center justify-between gap-1 shadow-inner">
                      <span className="font-bold text-xs sm:text-sm text-catan-parchment truncate">
                        {player ? player.name : `Đang chờ người chơi...`}
                      </span>
                      {player && (
                        <div className="flex items-center gap-1 shrink-0">
                          {player.isHost && (
                            <span title="Chủ Phòng">
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          )}
                          {isMe && (
                            <span className="text-[10px] text-amber-300 font-sans font-bold">
                              (Bạn)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Placard: Ready Status */}
                    <div className="px-2 py-0.5 rounded-lg bg-black/40 border border-catan-gold-trim/30 flex items-center justify-between text-[11px] font-sans">
                      {player ? (
                        player.isReady || player.isHost ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đã Sẵn Sàng
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                            ⏳ Chưa Sẵn Sàng
                          </span>
                        )
                      ) : (
                        <span className="text-stone-500 font-medium">Ghế còn trống</span>
                      )}

                      {player && (
                        <span className="text-[10px] text-stone-400 font-sans">
                          {player.pieceStyle === 'classic_wood' ? 'Gỗ Cổ Điển' : 'Trung Cổ'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER / RIGHT AREA: 4 Placards Floating over the Round Table */}
        <div className="flex-1 h-full relative hidden lg:flex items-center justify-center pointer-events-none">
          {/* Table Placard 1 (Top Left - Seat 1) */}
          <div className="absolute top-[38%] left-[28%] -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-black/85 border-2 border-red-500/80 shadow-[0_10px_25px_rgba(239,68,68,0.4)] backdrop-blur-md pointer-events-auto flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black text-amber-200 tracking-wide">
              {gameState.players[0]?.name || 'Ghế 1: Trống'}
            </span>
          </div>

          {/* Table Placard 2 (Top Right - Seat 2) */}
          <div className="absolute top-[38%] right-[28%] translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-black/85 border-2 border-blue-500/80 shadow-[0_10px_25px_rgba(59,130,246,0.4)] backdrop-blur-md pointer-events-auto flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-black text-amber-200 tracking-wide">
              {gameState.players[1]?.name || 'Ghế 2: Trống'}
            </span>
          </div>

          {/* Table Placard 3 (Bottom Left - Seat 3) */}
          <div className="absolute bottom-[28%] left-[32%] -translate-x-1/2 translate-y-1/2 px-4 py-1.5 rounded-xl bg-black/85 border-2 border-emerald-500/80 shadow-[0_10px_25px_rgba(34,197,94,0.4)] backdrop-blur-md pointer-events-auto flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-amber-200 tracking-wide">
              {gameState.players[2]?.name || 'Ghế 3: Trống'}
            </span>
          </div>

          {/* Table Placard 4 (Bottom Right - Seat 4) */}
          <div className="absolute bottom-[28%] right-[32%] translate-x-1/2 translate-y-1/2 px-4 py-1.5 rounded-xl bg-black/85 border-2 border-amber-500/80 shadow-[0_10px_25px_rgba(245,158,11,0.4)] backdrop-blur-md pointer-events-auto flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-black text-amber-200 tracking-wide">
              {gameState.players[3]?.name || 'Ghế 4: Trống'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ACTION FOOTER BAR */}
      <footer className="relative z-30 w-full flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-black/85 border-2 border-catan-gold-trim/80 shadow-2xl backdrop-blur-md pointer-events-auto">
        {/* Left: Host/Client Status Info */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-catan-parchment">
              {isHost ? '👑 Bạn là Chủ Phòng (Quyền bắt đầu trận đấu)' : '🎮 Bạn là Khách (Hãy sẵn sàng để bắt đầu)'}
            </span>
            <span className="text-[11px] text-amber-300/80 font-sans">
              Yêu cầu tối thiểu 2 người chơi để khai màn đảo Catan ({gameState.players.length}/4 người)
            </span>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Client: Ready Toggle Button */}
          {!isHost && (
            <button
              onClick={() => onSetReady(!isMeReady)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm sm:text-base tracking-wider transition-all shadow-xl active:scale-95
                ${
                  isMeReady
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-300 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 border-2 border-amber-300 shadow-amber-500/30'
                }
              `}
            >
              {isMeReady ? (
                <>
                  <ShieldCheck className="w-5 h-5" /> ĐÃ SẴN SÀNG
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" /> BẤM SẴN SÀNG
                </>
              )}
            </button>
          )}

          {/* Host: Start Game Button */}
          {isHost && (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base tracking-widest uppercase transition-all shadow-2xl font-catan
                ${
                  canStart
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-stone-950 border-3 border-amber-200 shadow-amber-500/40 active:scale-95 animate-pulse cursor-pointer'
                    : 'bg-stone-800 text-stone-500 border-2 border-stone-700 cursor-not-allowed'
                }
              `}
            >
              <Play className="w-5 h-5 fill-current" />
              BẮT ĐẦU VÁN ĐẤU ({gameState.players.length}/4)
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
