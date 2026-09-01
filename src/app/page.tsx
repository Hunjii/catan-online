'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { RulebookModal } from '@/components/ui/RulebookModal';
import { MultiplayerModal } from '@/components/ui/MultiplayerModal';
import { LeaderboardModal } from '@/components/ui/LeaderboardModal';
import { ShopModal, QuestsModal, FriendsModal, InventoryModal } from '@/components/ui/ExtraHomeModals';
import {
  Menu,
  Settings,
  Users,
  Bot,
  BookOpen,
  Trophy,
  ShoppingCart,
  Scroll,
  Package,
  Star,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { profile, updateProfile, isLoaded } = usePlayerProfile();

  // Modals state
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isRulebookOpen, setIsRulebookOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [aiNotice, setAiNotice] = useState(false);

  const handlePlayAI = () => {
    setAiNotice(true);
    setTimeout(() => {
      setAiNotice(false);
      // Create a single-player practice room
      router.push(`/room/SOLO_${Math.floor(1000 + Math.random() * 9000)}`);
    }, 1200);
  };

  return (
    <main className="min-h-screen w-full bg-dark-wood-pattern bg-cover bg-center bg-fixed flex flex-col justify-between p-3 sm:p-6 md:p-8 text-amber-50 font-catan select-none relative overflow-x-hidden">
      {/* Dark vignette overlay covering full PC screen */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80 pointer-events-none" />

      {/* 1. TOP HEADER (Full width on PC, max-w-7xl) */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 py-2">
        {/* Left: Menu button & CATAN Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setIsRulebookOpen(true)}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-black/60 border-2 border-catan-gold-trim/80 flex items-center justify-center text-catan-gold-trim hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-btn-wood"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest text-catan-gold-trim drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] leading-none">
              CATAN
            </h1>
            <span className="text-[10px] sm:text-xs text-amber-300/70 tracking-widest font-sans font-bold uppercase mt-1">
              Đảo Catan Huyền Thoại
            </span>
          </div>
        </div>

        {/* Right: Profile Pill & Settings Gear */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-black/70 border-2 border-catan-gold-trim/80 shadow-btn-wood hover:scale-105 active:scale-95 transition-all"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-catan-gold-trim shadow-inset-wood shrink-0 bg-catan-dark-wood">
              <Image
                src={
                  profile.avatar
                    ? `/assets/profile/portrait_${profile.avatar}_big.png`
                    : '/assets/profile/portrait_alexander_big.png'
                }
                alt={profile.name || 'Alexander'}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex flex-col items-start pr-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-catan-parchment tracking-wide">
                  {profile.name || 'Alexander'}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-catan-gold-trim font-bold bg-black/40 px-1.5 py-0.5 rounded-full border border-catan-gold-trim/40">
                  <Star className="w-3.5 h-3.5 fill-catan-gold-trim text-catan-gold-trim" /> 8
                </span>
              </div>
              {/* XP Progress Bar */}
              <div className="w-24 sm:w-28 h-2 bg-black/90 rounded-full border border-catan-gold-trim/50 overflow-hidden mt-1 relative">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-1/2 rounded-full" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-catan-parchment/60 font-sans font-bold mt-0.5">250 / 500 EXP</span>
            </div>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-black/60 border-2 border-catan-gold-trim/80 flex items-center justify-center text-catan-gold-trim hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-btn-wood"
            title="Cài đặt"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 2. MAIN MENU CARDS GRID (Responsive 2x2 Grid on PC, 1 col on Mobile) */}
      <div className="w-full max-w-7xl mx-auto my-auto py-4 sm:py-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Card 1: CHƠI TRỰC TUYẾN */}
          <div
            onClick={() => setIsMultiplayerOpen(true)}
            className="relative h-36 sm:h-44 md:h-52 lg:h-56 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-catan-gold-trim/85 overflow-hidden shadow-2xl group cursor-pointer hover:border-catan-gold-trim hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 bg-black"
          >
            <Image
              src="/assets/banner_multiplayer.jpg"
              alt="Chơi trực tuyến"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
            {/* Cinematic Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/90" />
            <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />

            <div className="absolute right-4 sm:right-6 md:right-8 inset-y-0 flex items-center gap-3 sm:gap-5 z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-black/70 border-2 sm:border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim shadow-inset-wood shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex flex-col text-right">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-catan-parchment tracking-wider drop-shadow-md group-hover:text-catan-gold-trim transition-colors">
                  CHƠI TRỰC TUYẾN
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-catan-parchment/80 font-sans drop-shadow font-medium mt-1">
                  Tham gia hoặc tạo phòng chơi
                </p>
                <div className="mt-2 hidden sm:inline-flex items-center justify-end gap-1.5 text-xs text-amber-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3.5 h-3.5" /> WebRTC P2P Đỉnh Cao
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: CHƠI VỚI MÁY */}
          <div
            onClick={handlePlayAI}
            className="relative h-36 sm:h-44 md:h-52 lg:h-56 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-catan-gold-trim/85 overflow-hidden shadow-2xl group cursor-pointer hover:border-catan-gold-trim hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 bg-black"
          >
            <Image
              src="/assets/banner_ai.jpg"
              alt="Chơi với máy"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/90" />
            <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />

            <div className="absolute right-4 sm:right-6 md:right-8 inset-y-0 flex items-center gap-3 sm:gap-5 z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-black/70 border-2 sm:border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim shadow-inset-wood shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex flex-col text-right">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-catan-parchment tracking-wider drop-shadow-md group-hover:text-catan-gold-trim transition-colors">
                  CHƠI VỚI MÁY
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-catan-parchment/80 font-sans drop-shadow font-medium mt-1">
                  {aiNotice ? 'Đang khởi tạo phòng Solo...' : 'Thử thách với AI'}
                </p>
                <div className="mt-2 hidden sm:inline-flex items-center justify-end gap-1.5 text-xs text-amber-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3.5 h-3.5" /> Luyện tập chiến thuật
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: HƯỚNG DẪN */}
          <div
            onClick={() => setIsRulebookOpen(true)}
            className="relative h-36 sm:h-44 md:h-52 lg:h-56 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-catan-gold-trim/85 overflow-hidden shadow-2xl group cursor-pointer hover:border-catan-gold-trim hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 bg-black"
          >
            <Image
              src="/assets/banner_guide.jpg"
              alt="Hướng dẫn"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/90" />
            <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />

            <div className="absolute right-4 sm:right-6 md:right-8 inset-y-0 flex items-center gap-3 sm:gap-5 z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-black/70 border-2 sm:border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim shadow-inset-wood shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex flex-col text-right">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-catan-parchment tracking-wider drop-shadow-md group-hover:text-catan-gold-trim transition-colors">
                  HƯỚNG DẪN
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-catan-parchment/80 font-sans drop-shadow font-medium mt-1">
                  Học cách chơi Catan
                </p>
                <div className="mt-2 hidden sm:inline-flex items-center justify-end gap-1.5 text-xs text-amber-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3.5 h-3.5" /> Chuẩn luật Klaus Teuber
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: BẢNG XẾP HẠNG */}
          <div
            onClick={() => setIsLeaderboardOpen(true)}
            className="relative h-36 sm:h-44 md:h-52 lg:h-56 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-catan-gold-trim/85 overflow-hidden shadow-2xl group cursor-pointer hover:border-catan-gold-trim hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 bg-black"
          >
            <Image
              src="/assets/banner_leaderboard.jpg"
              alt="Bảng xếp hạng"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/90" />
            <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />

            <div className="absolute right-4 sm:right-6 md:right-8 inset-y-0 flex items-center gap-3 sm:gap-5 z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-black/70 border-2 sm:border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim shadow-inset-wood shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex flex-col text-right">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-catan-parchment tracking-wider drop-shadow-md group-hover:text-catan-gold-trim transition-colors">
                  BẢNG XẾP HẠNG
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-catan-parchment/80 font-sans drop-shadow font-medium mt-1">
                  Xem thành tích của bạn
                </p>
                <div className="mt-2 hidden sm:inline-flex items-center justify-end gap-1.5 text-xs text-amber-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3.5 h-3.5" /> Vinh danh các bậc thầy
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION DOCK (Dock on PC, spanning grid on mobile) */}
      <footer className="w-full max-w-2xl mx-auto z-10 pt-2 pb-2">
        <nav className="w-full grid grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-3 border-2 border-catan-gold-trim/50 bg-black/70 rounded-2xl backdrop-blur-md shadow-2xl">
          {/* Item 1: Cửa hàng */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 sm:py-2 group transition-transform active:scale-95 hover:bg-white/5 rounded-xl"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-catan-gold-trim group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-catan-parchment group-hover:text-catan-gold-trim transition-colors">
              Cửa hàng
            </span>
          </button>

          {/* Item 2: Nhiệm vụ */}
          <button
            onClick={() => setIsQuestsOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 sm:py-2 group transition-transform active:scale-95 hover:bg-white/5 rounded-xl relative"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-catan-gold-trim group-hover:scale-110 transition-transform relative">
              <Scroll className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
              {/* Notification Badge '3' */}
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 border border-white text-[10px] font-sans font-black text-white flex items-center justify-center shadow-md animate-pulse">
                3
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-catan-parchment group-hover:text-catan-gold-trim transition-colors">
              Nhiệm vụ
            </span>
          </button>

          {/* Item 3: Bạn bè */}
          <button
            onClick={() => setIsFriendsOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 sm:py-2 group transition-transform active:scale-95 hover:bg-white/5 rounded-xl"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-catan-gold-trim group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-catan-parchment group-hover:text-catan-gold-trim transition-colors">
              Bạn bè
            </span>
          </button>

          {/* Item 4: Hòm đồ */}
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 sm:py-2 group transition-transform active:scale-95 hover:bg-white/5 rounded-xl"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-catan-gold-trim group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-catan-parchment group-hover:text-catan-gold-trim transition-colors">
              Hòm đồ
            </span>
          </button>
        </nav>
      </footer>

      {/* MODALS */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
      />
      <RulebookModal
        isOpen={isRulebookOpen}
        onClose={() => setIsRulebookOpen(false)}
      />
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={updateProfile}
      />
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />
      <QuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
      />
      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
      />
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
    </main>
  );
}
