'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, PlusCircle, LogIn, Users, Sparkles, Copy, Check } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    const code = generateRandomRoomCode();
    setCreatedCode(code);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomCode.trim().toUpperCase();
    if (clean.length >= 3) {
      router.push(`/room/${clean}`);
    }
  };

  const handleEnterCreated = () => {
    if (createdCode) {
      router.push(`/room/${createdCode}`);
    }
  };

  const handleCopyLink = () => {
    if (createdCode && typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/room/${createdCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-wood-pattern bg-cover border-4 border-catan-gold-trim rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-catan-parchment font-catan">
        <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-catan-dark-wood bg-black/40 relative z-10">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-catan-gold-trim" />
            <h2 className="text-xl font-black text-catan-gold-trim tracking-wider">CHƠI TRỰC TUYẾN</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/40 text-catan-parchment hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 relative z-10">
          {!createdCode ? (
            <>
              {/* Create Room Button */}
              <button
                onClick={handleCreate}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-catan-dark-wood font-black text-lg border-2 border-catan-gold-trim shadow-btn-wood hover:-translate-y-0.5 active:translate-y-0 active:shadow-btn-wood-active transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-6 h-6 text-catan-dark-wood" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">Tạo Phòng Mới</span>
                    <span className="text-[11px] text-catan-dark-wood/80 font-normal font-sans">Làm chủ phòng & mời bạn bè</span>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-catan-dark-wood" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-catan-dark-wood/80" />
                <span className="text-xs text-catan-parchment/60 uppercase tracking-widest font-bold">HOẶC</span>
                <div className="flex-1 h-0.5 bg-catan-dark-wood/80" />
              </div>

              {/* Join Room Form */}
              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <label className="text-xs font-bold text-catan-parchment/90">Nhập mã phòng đã có:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: CAT688"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="flex-1 bg-catan-parchment border-2 border-catan-dark-wood rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg text-catan-dark-wood placeholder:text-catan-dark-wood/40 uppercase outline-none focus:border-catan-gold-trim shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={roomCode.trim().length < 3}
                    className="px-6 py-2.5 rounded-xl bg-catan-dark-wood hover:bg-catan-light-wood disabled:opacity-50 text-catan-gold-trim font-black text-sm border-2 border-catan-gold-trim shadow-btn-wood active:scale-95 transition-all"
                  >
                    VÀO
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="text-sm text-catan-parchment">Phòng của bạn đã được khởi tạo:</div>
              <div className="px-6 py-3 rounded-2xl bg-catan-dark-wood border-2 border-catan-gold-trim text-3xl font-mono font-black text-catan-gold-trim tracking-widest shadow-inset-wood">
                {createdCode}
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black/40 hover:bg-black/60 border-2 border-catan-dark-wood text-xs font-bold text-catan-parchment transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Đã sao chép Link' : 'Sao chép Link Mời'}
                </button>
                <button
                  onClick={handleEnterCreated}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-catan-dark-wood font-black text-sm border-2 border-catan-gold-trim shadow-btn-wood transition-all"
                >
                  Vào Phòng Ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
