'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProfile } from '@/hooks/usePlayerProfile';
import { PlayerColor, AvatarId } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';
import { X, Volume2, VolumeX, Edit3, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSave: (updated: Partial<PlayerProfile>) => void;
}

const AVATAR_OPTIONS: { id: AvatarId; name: string; file: string }[] = [
  { id: 'alexander', name: 'Alexander', file: '/assets/avatars/alexander.png' },
  { id: 'elara', name: 'Elara', file: '/assets/avatars/elara.png' },
  { id: 'magnus', name: 'Magnus', file: '/assets/avatars/magnus.png' },
  { id: 'lyra', name: 'Lyra', file: '/assets/avatars/lyra.png' },
];

const COLOR_OPTIONS: { id: PlayerColor; label: string; bgGradient: string; hex: string }[] = [
  { id: 'red', label: 'Đỏ', bgGradient: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800', hex: '#e11d48' },
  { id: 'blue', label: 'Xanh Biển', bgGradient: 'bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700', hex: '#0284c7' },
  { id: 'green', label: 'Xanh Lá', bgGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-green-700', hex: '#16a34a' },
  { id: 'yellow', label: 'Vàng', bgGradient: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600', hex: '#eab308' },
  { id: 'orange', label: 'Cam', bgGradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700', hex: '#ea580c' },
  { id: 'brown', label: 'Nâu', bgGradient: 'bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900', hex: '#78350f' },
];

const STATS_ITEMS = [
  {
    icon: '/assets/icons/trophy.png',
    label: 'TRẬN THẮNG',
    value: '47',
  },
  {
    icon: '/assets/icons/gold-hex.png',
    label: 'TỔNG TRẬN',
    value: '102',
  },
  {
    icon: '/assets/icons/victory-star.png',
    label: 'ĐIỂM VP',
    value: '1450',
  },
  {
    icon: '/assets/icons/builder-hammers.png',
    label: 'CẤP BẬC',
    value: 'Kiến Trúc Sư',
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name || 'Alexander');
  const [isEditingName, setIsEditingName] = useState(false);
  const [color, setColor] = useState<PlayerColor>(profile.color || 'red');
  const [avatar, setAvatar] = useState<AvatarId>(profile.avatar || 'alexander');
  const [volume, setVolume] = useState(profile.soundVolume ?? 0.7);
  const [isMuted, setIsMuted] = useState(profile.soundMuted ?? false);
  const [showSoundPopover, setShowSoundPopover] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Alexander');
      setColor(profile.color || 'red');
      setAvatar(profile.avatar || 'alexander');
      setVolume(profile.soundVolume ?? 0.7);
      setIsMuted(profile.soundMuted ?? false);
      setIsEditingName(false);
      setShowSoundPopover(false);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  if (!isOpen) return null;

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === avatar) || AVATAR_OPTIONS[0];

  const handleSave = () => {
    soundEngine.playClick();
    onSave({
      name: name.trim() || 'Alexander',
      color,
      avatar,
      soundVolume: volume,
      soundMuted: isMuted,
    });
    onClose();
  };

  const handleReset = () => {
    soundEngine.playClick();
    setName('Alexander');
    setColor('red');
    setAvatar('alexander');
    setIsEditingName(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[530px] aspect-[1024/1536] max-h-[94vh] rounded-3xl shadow-2xl font-catan"
          style={{
            backgroundImage: "url('/assets/ui/profile-frame.png')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          {/* 1. Header Title Plaque (Centered neatly over the top wooden frame) */}
          <div
            className="absolute top-[2.2%] left-1/2 -translate-x-1/2 w-[58%] aspect-[2172/724] z-30 pointer-events-none flex items-center justify-center"
            style={{
              backgroundImage: "url('/assets/ui/title-plaque.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            <h1 className="font-catan font-black uppercase text-amber-100 tracking-widest text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pb-0.5">
              HỒ SƠ & CÁ THỂ HÓA
            </h1>
          </div>

          {/* 2. Top-Right Utility Buttons: Sound & Close */}
          <div className="absolute top-[2.8%] right-[5%] z-30 flex items-center gap-1.5">
            {/* Sound Button */}
            <div className="relative">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowSoundPopover(!showSoundPopover);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-900/90 hover:bg-stone-800 border-2 border-amber-600/70 shadow-md flex items-center justify-center text-amber-200 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                title="Cài đặt âm thanh"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                )}
              </button>

              {/* Sound Popover */}
              {showSoundPopover && (
                <div className="absolute right-0 top-10 w-56 p-3 rounded-xl bg-stone-950/95 border-2 border-amber-500/80 shadow-2xl z-40 backdrop-blur-md animate-fade-in flex flex-col gap-2.5 text-amber-100 font-sans">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200 border-b border-amber-900/50 pb-1.5">
                    <span>ÂM LƯỢNG GAME</span>
                    <span>{isMuted ? 'Tắt' : `${Math.round(volume * 100)}%`}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = !isMuted;
                        setIsMuted(next);
                        soundEngine.setMuted(next);
                      }}
                      className="p-1 rounded bg-stone-800 text-amber-300 hover:bg-stone-700"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        soundEngine.setVolume(val);
                        if (isMuted) {
                          setIsMuted(false);
                          soundEngine.setMuted(false);
                        }
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Close Button [X] */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-900/90 hover:bg-stone-800 border-2 border-amber-600/70 shadow-md flex items-center justify-center text-amber-200 hover:text-white transition-all transform hover:scale-105 active:scale-95 group"
              title="Đóng"
            >
              <X className="w-4 h-4 text-amber-300 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* 3. Inner Parchment Content Area (Starting cleanly at 13.5% to avoid title plaque, ending at 7.5%) */}
          <div className="absolute top-[18%] bottom-[8%] left-[19%] right-[19%] flex flex-col justify-between z-20 overflow-hidden">
            {/* Upper Section: Settler Info + 4 Stats Badges + Big Avatar */}
            <div className="flex items-start justify-between gap-2.5">
              {/* Left Column: Name & 4 Stats */}
              <div className="flex-1 flex flex-col min-w-0 pr-1">
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#72522c] uppercase drop-shadow-sm">
                  NGƯỜI ĐỊNH CƯ:
                </span>

                {/* Editable Name Field */}
                <div className="relative flex items-center min-h-[32px] my-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingName(false);
                        }}
                        maxLength={24}
                        className="w-full bg-[#fbf3e0] border-2 border-amber-700/80 rounded px-2 py-0.5 text-sm sm:text-base font-black text-[#2e1d0f] outline-none shadow-inner"
                      />
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1 rounded bg-amber-700 text-white hover:bg-amber-600 shadow shrink-0"
                        title="Xác nhận"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingName(true)}
                      className="group flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                      title="Bấm để đổi tên"
                    >
                      <span className="text-base sm:text-lg font-black text-[#26170b] uppercase tracking-wide drop-shadow-sm leading-tight break-words">
                        {name || 'Alexander'}
                      </span>
                      <Edit3 className="w-3.5 h-3.5 text-[#865d32] opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#72522c] uppercase mb-2 drop-shadow-sm">
                  KIẾN TRÚC SƯ
                </span>

                {/* 4 Stats Parchment Badges (No truncation, comfortable spacing) */}
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {STATS_ITEMS.map((st, i) => (
                    <div
                      key={i}
                      className="bg-[#edd6b3]/95 border border-[#b89558]/80 rounded-lg px-2 py-1.5 flex items-center gap-2 shadow-sm min-w-0"
                    >
                      <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0 drop-shadow-sm">
                        <Image
                          src={st.icon}
                          alt={st.label}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase text-[#735029] leading-none mb-0.5 whitespace-nowrap">
                          {st.label}
                        </span>
                        <span className="text-[11px] sm:text-xs font-black text-[#2a1708] leading-none whitespace-nowrap">
                          {st.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Big Avatar (Transparent background directly on parchment) */}
              <div className="w-[34%] aspect-square shrink-0 relative flex items-center justify-center self-center">
                <div className="relative w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">
                  <Image
                    src={currentAvatar.file}
                    alt={currentAvatar.name}
                    fill
                    className="object-contain"
                    sizes="140px"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Middle Section: Customization (Divider + 2 Subsections: Avatar & Color) */}
            <div className="flex flex-col gap-3 sm:gap-4 my-auto">
              {/* Divider: TÙY BIẾN */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-[#8a6336] to-transparent opacity-80" />
                <h2 className="text-xs sm:text-sm font-black tracking-widest text-[#3b230d] uppercase">
                  TÙY BIẾN
                </h2>
                <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-[#8a6336] to-transparent opacity-80" />
              </div>

              {/* Subsection 1: CHỌN ẢNH ĐẠI DIỆN (Larger, prominent avatars) */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#6e4d27] uppercase mb-2">
                  CHỌN ẢNH ĐẠI DIỆN
                </span>
                <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-[340px]">
                  {AVATAR_OPTIONS.map((opt) => {
                    const isSelected = avatar === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setAvatar(opt.id);
                        }}
                        className="group flex flex-col items-center focus:outline-none"
                      >
                        <div
                          className={`relative w-14 h-14 sm:w-16 sm:h-16 transition-all duration-200 transform ${
                            isSelected
                              ? 'scale-110 drop-shadow-[0_0_14px_rgba(245,158,11,0.95)]'
                              : 'hover:scale-105 opacity-80 hover:opacity-100 drop-shadow-sm'
                          }`}
                        >
                          <Image
                            src={opt.file}
                            alt={opt.name}
                            fill
                            className="object-contain"
                            sizes="70px"
                          />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold mt-1 tracking-wide transition-colors ${
                            isSelected ? 'text-amber-950 font-black' : 'text-[#5d401f]'
                          }`}
                        >
                          {opt.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subsection 2: CHỌN MÀU QUÂN CỜ (Larger 3D color blocks) */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#6e4d27] uppercase mb-2">
                  CHỌN MÀU QUÂN CỜ
                </span>
                <div className="flex items-center justify-center gap-3 sm:gap-3.5 w-full">
                  {COLOR_OPTIONS.map((opt) => {
                    const isSelected = color === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setColor(opt.id);
                        }}
                        className="group flex flex-col items-center focus:outline-none"
                      >
                        <div
                          className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${opt.bgGradient} border-2 border-white/40 shadow-lg transition-all duration-200 transform ${
                            isSelected
                              ? 'scale-115 ring-3 ring-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.95)]'
                              : 'hover:scale-105 opacity-90 hover:opacity-100'
                          }`}
                        >
                          {/* 3D Bevel Highlight */}
                          <div className="absolute inset-0 rounded-lg border-t border-white/60 pointer-events-none" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold mt-1 tracking-tight transition-colors ${
                            isSelected ? 'text-amber-950 font-black' : 'text-[#5d401f]'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons: LƯU THAY ĐỔI & ĐẶT LẠI */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full pt-2">
              {/* Save Changes Primary Button */}
              <button
                onClick={handleSave}
                className="relative w-[58%] aspect-[2172/724] rounded-xl overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center"
                style={{
                  backgroundImage: "url('/assets/ui/primary-button.png')",
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div className="flex items-center justify-center gap-2 relative z-10 pb-0.5">
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5 shrink-0 drop-shadow">
                    <Image
                      src="/assets/icons/builder-hammers.png"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="20px"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-catan font-black tracking-widest text-[#3d1a00] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] group-hover:text-[#251000] transition-colors">
                    LƯU THAY ĐỔI
                  </span>
                </div>
              </button>

              {/* Reset Secondary Button */}
              <button
                onClick={handleReset}
                className="w-[36%] aspect-[2172/724] rounded-xl bg-gradient-to-b from-[#6b6762] via-[#524e49] to-[#3b3834] border-2 border-[#8c857b] shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group hover:border-amber-400/80"
              >
                <span className="text-xs sm:text-sm font-catan font-black tracking-wider text-stone-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors">
                  ĐẶT LẠI
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
