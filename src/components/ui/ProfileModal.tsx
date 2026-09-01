'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProfile } from '@/hooks/usePlayerProfile';
import { PlayerColor, AvatarId, TileSetStyle, COLOR_MAP } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';
import { X, Volume2, VolumeX, Edit3, Check, RotateCcw } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSave: (updated: Partial<PlayerProfile>) => void;
}

const AVATAR_OPTIONS: { id: AvatarId; name: string; thumb: string; large: string }[] = [
  {
    id: 'alexander',
    name: 'Alexander',
    thumb: '/assets/profile/avatar_alexander.png',
    large: '/assets/profile/portrait_alexander_big.png',
  },
  {
    id: 'elara',
    name: 'Elara',
    thumb: '/assets/profile/avatar_elara.png',
    large: '/assets/profile/portrait_elara_big.png',
  },
  {
    id: 'magnus',
    name: 'Magnus',
    thumb: '/assets/profile/avatar_magnus.png',
    large: '/assets/profile/portrait_magnus_big.png',
  },
  {
    id: 'lyra',
    name: 'Lyra',
    thumb: '/assets/profile/avatar_lyra.png',
    large: '/assets/profile/portrait_lyra_big.png',
  },
];

const COLOR_OPTIONS: { id: PlayerColor; label: string; file: string; hex: string }[] = [
  { id: 'red', label: 'Đỏ', file: '/assets/profile/color_red.png', hex: '#e11d48' },
  { id: 'blue', label: 'Xanh Biển', file: '/assets/profile/color_blue.png', hex: '#0284c7' },
  { id: 'green', label: 'Xanh Lá', file: '/assets/profile/color_green.png', hex: '#16a34a' },
  { id: 'yellow', label: 'Vàng', file: '/assets/profile/color_yellow.png', hex: '#eab308' },
  { id: 'orange', label: 'Cam', file: '/assets/profile/color_orange.png', hex: '#ea580c' },
  { id: 'brown', label: 'Nâu', file: '/assets/profile/color_brown.png', hex: '#78350f' },
];

const TILE_STYLES: { id: TileSetStyle; label: string; file: string }[] = [
  { id: 'classic', label: 'Cổ Điển', file: '/assets/profile/tile_classic.png' },
  { id: 'art_nouveau', label: 'Nghệ Thuật', file: '/assets/profile/tile_art_nouveau.png' },
  { id: 'viking', label: 'Viking', file: '/assets/profile/tile_viking.png' },
  { id: 'fantasy', label: 'Kỳ Ảo', file: '/assets/profile/tile_fantasy.png' },
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
  const [tileSetStyle, setTileSetStyle] = useState<TileSetStyle>(profile.tileSetStyle || 'classic');
  const [volume, setVolume] = useState(profile.soundVolume ?? 0.7);
  const [isMuted, setIsMuted] = useState(profile.soundMuted ?? false);
  const [showSoundPopover, setShowSoundPopover] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Alexander');
      setColor(profile.color || 'red');
      setAvatar(profile.avatar || 'alexander');
      setTileSetStyle(profile.tileSetStyle || 'classic');
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
      tileSetStyle,
      soundVolume: volume,
      soundMuted: isMuted,
    });
    onClose();
  };

  const handleReset = () => {
    soundEngine.playClick();
    // Reset to system default: Alexander, Red, Classic
    setName('Alexander');
    setColor('red');
    setAvatar('alexander');
    setTileSetStyle('classic');
    setIsEditingName(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[580px] aspect-[636/846] rounded-2xl shadow-2xl overflow-hidden font-catan"
          style={{
            backgroundImage: "url('/assets/profile/modal_clean_template.png')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          {/* Header Title Placement */}
          <div className="absolute top-[2.2%] left-1/2 -translate-x-1/2 w-[52%] h-[6.5%] flex items-center justify-center pointer-events-none">
            <h1 className="text-amber-100 font-catan font-black tracking-widest text-xs sm:text-sm uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              HỒ SƠ & CÁ THỂ HÓA
            </h1>
          </div>

          {/* Top-Right Sound & Close Buttons */}
          <div className="absolute top-[2.1%] right-[4.2%] flex items-center gap-1.5 z-30">
            {/* Sound Setting Button */}
            <div className="relative">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowSoundPopover(!showSoundPopover);
                }}
                className="w-8 h-8 rounded-lg bg-stone-800/90 hover:bg-stone-700 border border-amber-600/60 shadow-md flex items-center justify-center text-amber-200 hover:text-white transition-all transform hover:scale-105 active:scale-95"
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
                <div className="absolute right-0 top-10 w-56 p-3 rounded-xl bg-stone-950/95 border-2 border-amber-500/70 shadow-2xl z-40 backdrop-blur-md animate-fade-in flex flex-col gap-2.5">
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
              className="w-8 h-8 rounded-lg overflow-hidden relative shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border border-amber-800/40"
              title="Đóng"
            >
              <Image
                src="/assets/profile/btn_close_x.png"
                alt="Close"
                fill
                className="object-cover"
                sizes="36px"
              />
            </button>
          </div>

          {/* Top Section: Player Name & Subtitle */}
          <div className="absolute top-[14.8%] left-[15.5%] w-[42%] flex flex-col z-20">
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#72522c] uppercase drop-shadow-sm">
              NGƯỜI ĐỊNH CƯ:
            </span>

            {/* Editable Name Field */}
            <div className="mt-0.5 relative flex items-center min-h-[34px]">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false);
                    }}
                    maxLength={20}
                    className="w-full bg-[#fbf3e0] border-2 border-amber-700/80 rounded-md px-2 py-0.5 text-base sm:text-lg font-black text-[#2e1d0f] outline-none shadow-inner"
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 rounded bg-amber-700 text-white hover:bg-amber-600 shadow"
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
                  <span className="text-xl sm:text-2xl font-black text-[#26170b] uppercase tracking-wide drop-shadow-sm truncate max-w-[180px]">
                    {name || 'Alexander'}
                  </span>
                  <Edit3 className="w-3.5 h-3.5 text-[#865d32] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#72522c] uppercase mt-0.5 drop-shadow-sm">
              KIẾN TRÚC SƯ
            </span>
          </div>

          {/* Top-Right Big Avatar Portrait */}
          <div className="absolute top-[14%] right-[14.5%] w-[26.5%] aspect-square z-20 flex items-center justify-center">
            <div className="relative w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <Image
                src={currentAvatar.large}
                alt={currentAvatar.name}
                fill
                className="object-contain"
                sizes="160px"
                priority
              />
            </div>
          </div>

          {/* Middle & Bottom: Customization Section */}
          <div className="absolute top-[46.5%] left-[13.5%] right-[13.5%] bottom-[5%] flex flex-col z-20">
            {/* Header: TÙY BIẾN */}
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-2.5">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#8a6336] to-transparent opacity-80" />
              <h2 className="text-xs sm:text-sm font-black tracking-widest text-[#3b230d] uppercase">
                TÙY BIẾN
              </h2>
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#8a6336] to-transparent opacity-80" />
            </div>

            {/* Subsection 1: CHỌN ẢNH ĐẠI DIỆN */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#6e4d27] uppercase mb-1">
                CHỌN ẢNH ĐẠI DIỆN
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-[340px]">
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
                        className={`relative w-12 h-13 sm:w-14 sm:h-15 rounded-xl transition-all duration-200 transform ${
                          isSelected
                            ? 'scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] ring-2 ring-amber-400'
                            : 'hover:scale-105 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={opt.thumb}
                          alt={opt.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold mt-0.5 tracking-wide transition-colors ${
                          isSelected ? 'text-amber-900 font-black' : 'text-[#5d401f]'
                        }`}
                      >
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subsection 2: CHỌN MÀU SẮC */}
            <div className="flex flex-col items-center mt-2.5 sm:mt-3">
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#6e4d27] uppercase mb-1">
                CHỌN MÀU QUÂN CỜ
              </span>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full">
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
                        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 transform ${
                          isSelected
                            ? 'scale-115 ring-2 ring-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.95)]'
                            : 'hover:scale-105 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={opt.file}
                          alt={opt.label}
                          fill
                          className="object-contain"
                          sizes="40px"
                        />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
                          isSelected ? 'text-amber-900 font-black' : 'text-[#5d401f]'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subsection 3: PHONG CÁCH BẢN ĐỒ */}
            <div className="flex flex-col items-center mt-2.5 sm:mt-3">
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#6e4d27] uppercase mb-1">
                PHONG CÁCH BẢN ĐỒ
              </span>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-[390px]">
                {TILE_STYLES.map((opt) => {
                  const isSelected = tileSetStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setTileSetStyle(opt.id);
                      }}
                      className="group flex flex-col items-center focus:outline-none"
                    >
                      <div
                        className={`relative w-full aspect-[110/56] rounded-md overflow-hidden transition-all duration-200 transform ${
                          isSelected
                            ? 'scale-105 ring-2 ring-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                            : 'hover:scale-102 opacity-85 hover:opacity-100 border border-stone-800/20'
                        }`}
                      >
                        <Image
                          src={opt.file}
                          alt={opt.label}
                          fill
                          className="object-cover"
                          sizes="110px"
                        />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold mt-0.5 tracking-tight transition-colors text-center ${
                          isSelected ? 'text-amber-900 font-black' : 'text-[#5d401f]'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: LƯU THAY ĐỔI & ĐẶT LẠI */}
            <div className="mt-auto pt-3 flex items-center justify-center gap-3 sm:gap-4 w-full">
              {/* Save Changes Button */}
              <button
                onClick={handleSave}
                className="relative w-[56%] h-11 sm:h-12 rounded-xl overflow-hidden shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center"
              >
                <Image
                  src="/assets/profile/btn_save_blank.png"
                  alt="Save Changes"
                  fill
                  className="object-fill"
                  sizes="260px"
                />
                <span className="relative z-10 pl-6 text-xs sm:text-sm font-catan font-black tracking-widest text-[#411b00] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] group-hover:text-[#281000] transition-colors">
                  LƯU THAY ĐỔI
                </span>
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="relative w-[34%] h-11 sm:h-12 rounded-xl overflow-hidden shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center"
              >
                <Image
                  src="/assets/profile/btn_reset_blank.png"
                  alt="Reset"
                  fill
                  className="object-fill"
                  sizes="160px"
                />
                <span className="relative z-10 text-xs sm:text-sm font-catan font-black tracking-wider text-stone-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors">
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
