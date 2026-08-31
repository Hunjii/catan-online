'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { RulebookModal } from '@/components/ui/RulebookModal';
import { COLOR_MAP } from '@/components/3d/Settlement3D';
import {
  Play,
  PlusCircle,
  LogIn,
  BookOpen,
  Settings,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react';

function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function HomePage() {
  const router = useRouter();
  const { profile, updateProfile, isLoaded } = usePlayerProfile();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRulebookModalOpen, setIsRulebookModalOpen] = useState(false);

  const handleCreateRoom = () => {
    const code = generateRandomRoomCode();
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (cleanCode.length >= 3) {
      router.push(`/room/${cleanCode}`);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-between p-4 sm:p-8 bg-radial-gradient overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏝️</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
              CATAN <span className="text-amber-400">3D</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Bản Quyền Luật Chuẩn Quốc Tế</p>
          </div>
        </div>

        {/* Profile Pill */}
        {isLoaded && (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-inner border border-white/30"
              style={{ backgroundColor: COLOR_MAP[profile.color] }}
            >
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
              {profile.name}
            </span>
            <Settings className="w-3.5 h-3.5 text-amber-400 ml-1" />
          </button>
        )}
      </header>

      {/* Hero Content */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center my-auto py-10 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Chơi Trực Tiếp Trên Trình Duyệt • Không Cần Cài Đặt
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
          Chinh Phục & Xây Dựng <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
            Hòn Đảo Catan Huyền Thoại
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Trải nghiệm board game đỉnh cao với đồ hoạ 3D sống động, xúc xắc chân thực, phòng chơi trực tuyến thời gian thực với bạn bè qua kết nối WebRTC serverless P2P.
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          {/* Create Room */}
          <button
            onClick={handleCreateRoom}
            className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-2xl shadow-amber-500/30 transform hover:-translate-y-1 active:translate-y-0 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-black/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-lg">Tạo Phòng Mới</span>
            <span className="text-xs font-semibold text-slate-900/80 mt-1">
              Nhận mã phòng & Link mời bạn bè
            </span>
          </button>

          {/* Join Room */}
          <form
            onSubmit={handleJoinRoom}
            className="flex flex-col items-center justify-between p-6 rounded-3xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-2xl hover:border-amber-400/60 transition-all"
          >
            <div className="flex flex-col items-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-2 text-amber-400">
                <LogIn className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-white">Vào Phòng Đã Có</span>
            </div>

            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Nhập mã phòng..."
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm text-amber-300 uppercase outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={roomCodeInput.trim().length < 3}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-400 font-bold text-sm border border-slate-600 transition-all"
              >
                Vào
              </button>
            </div>
          </form>
        </div>

        {/* Extra Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setIsRulebookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Tra Cứu Luật Chơi Catan
          </button>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            Tuỳ Biến Quân Cờ 3D & Âm Thanh
          </button>
        </div>
      </div>

      {/* Feature Highlights Footer */}
      <footer className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-slate-800/80 text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Luật Chuẩn Klaus Teuber</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-blue-400 shrink-0" />
          <span>WebRTC P2P Multiplayer</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>3D Three.js & Xúc Xắc Vật Lý</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Deploy Tối Ưu Vercel</span>
        </div>
      </footer>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={updateProfile}
      />
      <RulebookModal
        isOpen={isRulebookModalOpen}
        onClose={() => setIsRulebookModalOpen(false)}
      />
    </main>
  );
}
