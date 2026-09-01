'use client';

import React from 'react';
import { X, Trophy, Medal, Crown, Star, Flame } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOP_PLAYERS = [
  { rank: 1, name: 'Hùng Sơn Tặc', elo: 1840, wins: 42, rate: '78%', avatar: '👑', badge: 'Vua Catan' },
  { rank: 2, name: 'Mai Nông Dân', elo: 1765, wins: 38, rate: '72%', avatar: '🌾', badge: 'Trùm Lúa Mì' },
  { rank: 3, name: 'Nam Thợ Xây', elo: 1690, wins: 31, rate: '67%', avatar: '🏰', badge: 'Vua Đường Bộ' },
  { rank: 4, name: 'Linh Thương Gia', elo: 1580, wins: 26, rate: '61%', avatar: '🪙', badge: 'Bậc Thầy Giao Thương' },
  { rank: 5, name: 'Bảo Hiệp Sĩ', elo: 1510, wins: 22, rate: '58%', avatar: '⚔️', badge: 'Đội Quân Lớn Nhất' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-wood-pattern bg-cover border-4 border-catan-gold-trim rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-catan-parchment font-catan">
        <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-catan-dark-wood bg-black/40 relative z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-catan-gold-trim animate-bounce" />
            <h2 className="text-xl font-black text-catan-gold-trim tracking-wider">BẢNG XẾP HẠNG HUYỀN THOẠI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/40 text-catan-parchment hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-3 relative z-10 max-h-[70vh] overflow-y-auto">
          {TOP_PLAYERS.map((p) => {
            const isTop1 = p.rank === 1;
            const isTop2 = p.rank === 2;
            const isTop3 = p.rank === 3;

            return (
              <div
                key={p.rank}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                  isTop1
                    ? 'bg-gradient-to-r from-amber-950/90 to-yellow-950/70 border-catan-gold-trim shadow-lg scale-[1.02]'
                    : isTop2
                    ? 'bg-slate-900/80 border-slate-400'
                    : isTop3
                    ? 'bg-amber-950/60 border-amber-700'
                    : 'bg-black/40 border-catan-dark-wood'
                }`}
              >
                {/* Rank & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center font-black text-lg text-catan-gold-trim">
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${p.rank}`}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-catan-dark-wood border-2 border-catan-gold-trim flex items-center justify-center text-xl shadow-inset-wood">
                    {p.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-catan-parchment flex items-center gap-1.5">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-catan-gold-trim/80 font-sans">{p.badge}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-end">
                  <span className="font-black text-base text-catan-gold-trim flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-500" /> {p.elo}
                  </span>
                  <span className="text-[11px] text-catan-parchment/60 font-sans">Thắng {p.wins} ({p.rate})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
