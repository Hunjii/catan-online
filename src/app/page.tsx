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
  Settings,
  Star,
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
    <main
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex flex-col justify-between p-3 sm:p-6 md:p-8 text-amber-50 font-catan select-none relative overflow-x-hidden"
      style={{ backgroundImage: "url('/assets/man_background.png')" }}
    >
      {/* 1. TOP HEADER (Framed in medieval wooden panel) */}
      <header className="relative w-full max-w-7xl mx-auto z-20 pt-1 pb-2">
        <div className="relative w-full aspect-[6/1] sm:aspect-[7.5/1] md:aspect-[8.5/1] min-h-[72px] sm:min-h-[88px] md:min-h-[100px] flex items-center justify-between px-2 sm:px-6 md:px-8">
          {/* Header Wooden Panel Background */}
          <Image
            src="/assets/header/header_panel.png"
            alt="Header Panel"
            fill
            className="object-fill pointer-events-none -z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
            priority
          />

          {/* Left: Banner + Brand */}
          <div className="flex items-center gap-3 sm:gap-5 pl-1 sm:pl-3">
            <div className="relative -mt-2 sm:-mt-4 md:-mt-5 w-14 sm:w-22 md:w-26 lg:w-28 aspect-[333/450] shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)] z-10">
              <Image
                src="/assets/header/header_banner_c.png"
                alt="Catan Banner"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fff3b0] via-[#e5b84c] to-[#966318] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none font-serif">
                CATAN
              </h1>
              <span className="text-[9px] sm:text-xs md:text-sm text-[#e0b560] tracking-[0.18em] font-sans font-bold uppercase mt-0.5 drop-shadow flex items-center gap-1">
                <span className="text-[8px] sm:text-[10px] opacity-75">❖</span> ĐẢO CATAN HUYỀN THOẠI <span className="text-[8px] sm:text-[10px] opacity-75">❖</span>
              </span>
            </div>
          </div>

          {/* Right: Profile Panel + Settings */}
          <div className="flex items-center gap-2 sm:gap-3 pr-1 sm:pr-2">
            {/* Profile Card Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="relative w-48 sm:w-64 md:w-72 aspect-[673/283] hover:scale-[1.03] active:scale-[0.98] transition-transform text-left group"
            >
              {/* Avatar circle */}
              <div className="absolute left-[4.5%] top-[10.6%] w-[29.6%] aspect-square rounded-full overflow-hidden z-0">
                <Image
                  src={`/assets/avatars/${profile.avatar || 'alexander'}.png`}
                  alt={profile.name || 'Alexander'}
                  fill
                  className="object-cover scale-110"
                  sizes="64px"
                />
              </div>

              {/* Profile Frame Panel Image Overlay */}
              <Image
                src="/assets/header/header_profile_panel.png"
                alt="Profile Frame"
                fill
                className="object-fill pointer-events-none z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                priority
              />

              {/* Player Info (Name, Level/Star, EXP) */}
              <div className="absolute left-[38%] right-[6%] top-[12%] z-20 flex items-center justify-between">
                <span className="font-bold text-[11px] sm:text-sm md:text-base text-[#fdf0cf] tracking-wide truncate drop-shadow max-w-[95px] sm:max-w-[130px] md:max-w-[150px]">
                  {profile.name || 'Alexander'}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] sm:text-xs text-amber-300 font-bold bg-black/70 px-1.5 py-0.5 rounded-full border border-amber-500/50 shadow-sm shrink-0">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" /> 8
                </span>
              </div>

              {/* EXP Bar Fill inside groove */}
              <div className="absolute left-[38.6%] w-[49%] top-[51%] h-[10%] z-20 rounded-full overflow-hidden bg-black/40">
                <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 w-1/2 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              </div>

              {/* EXP Text */}
              <div className="absolute left-[38%] right-[6%] bottom-[10%] z-20">
                <span className="text-[8px] sm:text-[10px] text-[#dec396]/90 font-sans font-bold drop-shadow">
                  250 / 500 EXP
                </span>
              </div>
            </button>

            {/* Settings Gear Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-b from-[#2d1b0f] to-[#120904] border-2 border-[#caa055] flex items-center justify-center text-[#e8ba5d] hover:text-amber-200 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,230,150,0.3)] shrink-0"
              title="Cài đặt"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 drop-shadow" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN MENU CARDS GRID (Responsive 2x2 Grid on PC, 1 col on Mobile) */}
      <div className="w-full max-w-7xl mx-auto my-auto py-3 sm:py-6 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Card 1: PLAY ONLINE */}
          <div
            onClick={() => setIsMultiplayerOpen(true)}
            className="relative aspect-[1918/630] group cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
          >
            {/* Pre-composited Card Board Asset */}
            <Image
              src="/assets/menu_action/card_board_multiplayer.png"
              alt="Play Online"
              fill
              className="object-contain pointer-events-none z-0"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />

            {/* Cinematic Gradient shadow inside inner window */}
            <div className="absolute inset-[13%_4%] bg-gradient-to-r from-black/85 via-black/35 to-black/55 pointer-events-none z-0 rounded-sm" />

            {/* Flag / Heraldic Banner Asset */}
            <div className="absolute right-[4%] top-[8%] bottom-[8%] w-[24%] max-w-[120px] aspect-[2/3] z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 flex items-center justify-center">
              <Image
                src="/assets/menu_action/action_banner_multiplayer.png"
                alt="Multiplayer Banner"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Left Content */}
            <div className="absolute left-[7%] inset-y-0 right-[30%] flex flex-col justify-center z-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-cinzel-decorative tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff5be] via-[#e5b84c] to-[#966318] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] group-hover:from-amber-100 group-hover:to-amber-300 transition-all">
                PLAY ONLINE
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#f0e2cc] font-cormorant font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] max-w-sm mt-1 sm:mt-1.5 leading-snug italic">
                Join or create a room and play with friends
              </p>
            </div>
          </div>

          {/* Card 2: VS AI BOTS */}
          <div
            onClick={handlePlayAI}
            className="relative aspect-[1918/630] group cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
          >
            {/* Pre-composited Card Board Asset */}
            <Image
              src="/assets/menu_action/card_board_ai.png"
              alt="VS AI Bots"
              fill
              className="object-contain pointer-events-none z-0"
              sizes="(max-width: 768px) 100vw, 600px"
            />

            {/* Cinematic Gradient shadow inside inner window */}
            <div className="absolute inset-[13%_4%] bg-gradient-to-r from-black/85 via-black/35 to-black/55 pointer-events-none z-0 rounded-sm" />

            {/* Flag / Heraldic Banner Asset */}
            <div className="absolute right-[4%] top-[8%] bottom-[8%] w-[24%] max-w-[120px] aspect-[2/3] z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 flex items-center justify-center">
              <Image
                src="/assets/menu_action/action_banner_ai.png"
                alt="AI Banner"
                fill
                className="object-contain"
              />
            </div>

            {/* Left Content */}
            <div className="absolute left-[7%] inset-y-0 right-[30%] flex flex-col justify-center z-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-cinzel-decorative tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff5be] via-[#e5b84c] to-[#966318] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] group-hover:from-amber-100 group-hover:to-amber-300 transition-all">
                VS AI BOTS
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#f0e2cc] font-cormorant font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] max-w-sm mt-1 sm:mt-1.5 leading-snug italic">
                {aiNotice ? 'Launching Solo Room...' : 'Practice strategy and challenge AI colonists'}
              </p>
            </div>
          </div>

          {/* Card 3: HOW TO PLAY */}
          <div
            onClick={() => setIsRulebookOpen(true)}
            className="relative aspect-[1918/630] group cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
          >
            {/* Pre-composited Card Board Asset */}
            <Image
              src="/assets/menu_action/card_board_guide.png"
              alt="How to Play"
              fill
              className="object-contain pointer-events-none z-0"
              sizes="(max-width: 768px) 100vw, 600px"
            />

            {/* Cinematic Gradient shadow inside inner window */}
            <div className="absolute inset-[13%_4%] bg-gradient-to-r from-black/85 via-black/35 to-black/55 pointer-events-none z-0 rounded-sm" />

            {/* Flag / Heraldic Banner Asset */}
            <div className="absolute right-[4%] top-[8%] bottom-[8%] w-[24%] max-w-[120px] aspect-[2/3] z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 flex items-center justify-center">
              <Image
                src="/assets/menu_action/action_banner_guide.png"
                alt="Guide Banner"
                fill
                className="object-contain"
              />
            </div>

            {/* Left Content */}
            <div className="absolute left-[7%] inset-y-0 right-[30%] flex flex-col justify-center z-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-cinzel-decorative tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff5be] via-[#e5b84c] to-[#966318] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] group-hover:from-amber-100 group-hover:to-amber-300 transition-all">
                HOW TO PLAY
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#f0e2cc] font-cormorant font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] max-w-sm mt-1 sm:mt-1.5 leading-snug italic">
                Learn rules, trading, and settlement building
              </p>
            </div>
          </div>

          {/* Card 4: LEADERBOARD */}
          <div
            onClick={() => setIsLeaderboardOpen(true)}
            className="relative aspect-[1918/630] group cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
          >
            {/* Pre-composited Card Board Asset */}
            <Image
              src="/assets/menu_action/card_board_leaderboard.png"
              alt="Leaderboard"
              fill
              className="object-contain pointer-events-none z-0"
              sizes="(max-width: 768px) 100vw, 600px"
            />

            {/* Cinematic Gradient shadow inside inner window */}
            <div className="absolute inset-[13%_4%] bg-gradient-to-r from-black/85 via-black/35 to-black/55 pointer-events-none z-0 rounded-sm" />

            {/* Flag / Heraldic Banner Asset */}
            <div className="absolute right-[4%] top-[8%] bottom-[8%] w-[24%] max-w-[120px] aspect-[2/3] z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 flex items-center justify-center">
              <Image
                src="/assets/menu_action/action_banner_leaderboard.png"
                alt="Leaderboard Banner"
                fill
                className="object-contain"
              />
            </div>

            {/* Left Content */}
            <div className="absolute left-[7%] inset-y-0 right-[30%] flex flex-col justify-center z-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-cinzel-decorative tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff5be] via-[#e5b84c] to-[#966318] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] group-hover:from-amber-100 group-hover:to-amber-300 transition-all">
                LEADERBOARD
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#f0e2cc] font-cormorant font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] max-w-sm mt-1 sm:mt-1.5 leading-snug italic">
                View rankings, achievements, and stats
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION DOCK (Dock on PC, spanning grid on mobile) */}
      <footer className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto z-10 pt-2 pb-2">
        <nav aria-label="Quick menu" className="home-nav-dock w-full aspect-[2128/515]">
          <Image
            src="/assets/menu/menu_shell_4_columns.png"
            alt="Menu Dock"
            fill
            className="home-nav-board object-fill"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />

          <div className="relative z-10 grid h-full grid-cols-4 items-center px-1 sm:px-3 md:px-5 pt-1 sm:pt-2 md:pt-2.5 pb-1">
            {/* Item 1: Shop */}
            <button
              onClick={() => setIsShopOpen(true)}
              className="home-nav-item flex flex-col items-center justify-center mt-0 sm:mt-0.5 md:mt-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Image
                src="/assets/menu/menu_badge_shop.png"
                alt="Shop"
                width={1254}
                height={1254}
                className="home-nav-badge h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
              />
              <span className="home-nav-label text-xs sm:text-base md:text-lg font-bold">Shop</span>
            </button>

            {/* Item 2: Missions */}
            <button
              onClick={() => setIsQuestsOpen(true)}
              className="home-nav-item relative flex flex-col items-center justify-center mt-0 sm:mt-0.5 md:mt-1 transition-transform active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <Image
                  src="/assets/menu/menu_badge_missions.png"
                  alt="Missions"
                  width={1254}
                  height={1254}
                  className="home-nav-badge h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
                />
                <Image
                  src="/assets/menu/menu_badge_notification_3.png"
                  alt="3 notifications"
                  width={1254}
                  height={1254}
                  className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 object-contain z-20 drop-shadow-md"
                />
              </div>
              <span className="home-nav-label text-xs sm:text-base md:text-lg font-bold">Missions</span>
            </button>

            {/* Item 3: Friends */}
            <button
              onClick={() => setIsFriendsOpen(true)}
              className="home-nav-item flex flex-col items-center justify-center mt-0 sm:mt-0.5 md:mt-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Image
                src="/assets/menu/menu_badge_friends.png"
                alt="Friends"
                width={1295}
                height={1214}
                className="home-nav-badge h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
              />
              <span className="home-nav-label text-xs sm:text-base md:text-lg font-bold">Friends</span>
            </button>

            {/* Item 4: Inventory */}
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="home-nav-item flex flex-col items-center justify-center mt-0 sm:mt-0.5 md:mt-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Image
                src="/assets/menu/menu_badge_inventory.png"
                alt="Inventory"
                width={1254}
                height={1254}
                className="home-nav-badge h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
              />
              <span className="home-nav-label text-xs sm:text-base md:text-lg font-bold">Inventory</span>
            </button>
          </div>
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
