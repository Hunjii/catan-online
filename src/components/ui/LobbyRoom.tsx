'use client';

import React, { useState } from 'react';
import { GameState } from '@/lib/catan/types';
import { COLOR_MAP } from '../3d/Settlement3D';
import { Copy, Check, Users, Play, Settings, BookOpen, Crown, Sparkles } from 'lucide-react';

interface LobbyRoomProps {
  gameState: GameState;
  currentUserId: string;
  isHost: boolean;
  roomId: string;
  onStartGame: () => void;
  onSetReady: (ready: boolean) => void;
  onOpenProfile: () => void;
  onOpenRulebook: () => void;
}

export const LobbyRoom: React.FC<LobbyRoomProps> = ({
  gameState,
  currentUserId,
  isHost,
  roomId,
  onStartGame,
  onSetReady,
  onOpenProfile,
  onOpenRulebook,
}) => {
  const [copied, setCopied] = useState(false);
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = isHost && gameState.players.length >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 select-none">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏝️</span>
              <h1 className="text-xl font-black text-white">Phòng Chờ Catan 3D Online</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chia sẻ mã hoặc liên kết mời bạn bè tham gia cùng xây dựng đảo Catan!
            </p>
          </div>

          {/* Room Code Badge & Copy */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 pl-3 rounded-2xl border border-slate-700 shadow-inner">
            <span className="text-xs text-slate-400 font-mono">Mã:</span>
            <strong className="text-amber-300 font-mono font-black text-sm tracking-wider">
              {roomId}
            </strong>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã chép link' : 'Sao chép link'}
            </button>
          </div>
        </div>

        {/* Player Slot List */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              Người Chơi Đã Vào ({gameState.players.length}/4)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
              >
                <Settings className="w-3.5 h-3.5" /> Tuỳ biến hồ sơ
              </button>
              <button
                onClick={onOpenRulebook}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Xem luật
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameState.players.map((player) => {
              const isMe = player.id === currentUserId;

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isMe
                      ? 'bg-slate-950/80 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner text-sm border-2 border-white/30"
                      style={{ backgroundColor: COLOR_MAP[player.color] }}
                    >
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <span>{player.name}</span>
                        {isMe && <span className="text-amber-300 text-xs font-normal">(Bạn)</span>}
                        {player.isHost && (
                          <span title="Chủ phòng">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Kiểu 3D: <span className="text-slate-300 font-medium">{player.pieceStyle}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Sẵn sàng
                  </span>
                </div>
              );
            })}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 4 - gameState.players.length) }).map((_, i) => (
              <div
                key={`empty_${i}`}
                className="p-4 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs font-medium"
              >
                Đang chờ người chơi {gameState.players.length + i + 1}...
              </div>
            ))}
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400">
            💡 <strong>Mẹo:</strong> Game hỗ trợ từ 2 đến 4 người chơi. Khi tất cả đã sẵn sàng, Chủ phòng hãy bấm nút "Bắt Đầu Ván Đấu".
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isHost ? '👑 Bạn là Chủ phòng' : '🎮 Đang chờ Chủ phòng bắt đầu game'}
          </div>

          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl ${
                canStart
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Bắt Đầu Ván Đấu ({gameState.players.length}/4)
            </button>
          ) : (
            <span className="text-xs font-semibold text-amber-300 animate-pulse">
              Đang chờ chủ phòng xuất phát...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
