'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Edit3, Volume2, VolumeX, X } from 'lucide-react';
import { PlayerProfile } from '@/hooks/usePlayerProfile';
import { AvatarId, PlayerColor } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

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

const COLOR_OPTIONS: { id: PlayerColor; label: string; file: string }[] = [
  { id: 'red', label: 'Red', file: '/assets/profile/profile_color_red.png' },
  { id: 'blue', label: 'Blue', file: '/assets/profile/profile_color_blue.png' },
  { id: 'green', label: 'Green', file: '/assets/profile/profile_color_green.png' },
  { id: 'yellow', label: 'Yellow', file: '/assets/profile/profile_color_yellow.png' },
  { id: 'orange', label: 'Orange', file: '/assets/profile/profile_color_orange.png' },
  { id: 'brown', label: 'Brown', file: '/assets/profile/profile_color_brown.png' },
];

const STATS_ITEMS = [
  { icon: '/assets/icons/trophy.png', label: 'Victories', value: '47' },
  { icon: '/assets/icons/gold-hex.png', label: 'Total points', value: '102' },
  { icon: '/assets/icons/victory-star.png', label: 'Elo rating', value: '1450' },
  { icon: '/assets/icons/builder-hammers.png', label: 'Highest rank', value: 'Architect' },
];

function profileCode(id: string) {
  const digits = id.replace(/\D/g, '').slice(-3);
  return `#${digits.padStart(3, '0') || '493'}`;
}

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
    if (!isOpen) return;
    setName(profile.name || 'Alexander');
    setColor(profile.color || 'red');
    setAvatar(profile.avatar || 'alexander');
    setVolume(profile.soundVolume ?? 0.7);
    setIsMuted(profile.soundMuted ?? false);
    setIsEditingName(false);
    setShowSoundPopover(false);
  }, [isOpen, profile]);

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  if (!isOpen) return null;

  const currentAvatar = AVATAR_OPTIONS.find((option) => option.id === avatar) ?? AVATAR_OPTIONS[0];
  const playClick = () => soundEngine.playClick();

  const handleSave = () => {
    playClick();
    onSave({
      name: name.trim() || 'Alexander',
      color,
      avatar,
      soundVolume: volume,
      soundMuted: isMuted,
    });
    onClose();
  };

  const handleCancel = () => {
    playClick();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-2 backdrop-blur-[5px] sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          role="dialog"
          aria-modal="true"
          aria-label="Player profile"
          className="relative w-full max-w-[620px] aspect-[2/3] max-h-[96vh] shrink-0 overflow-visible font-cinzel"
          style={{
            backgroundImage: "url('/assets/profile/profile_background.png')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            filter: 'drop-shadow(0 22px 30px rgba(0, 0, 0, .8))',
            containerType: 'inline-size',
          }}
        >
          {/* Golden C on top-left heraldic red banner */}
          <div className="pointer-events-none absolute left-[19.0%] top-[10.8%] z-10 -translate-x-1/2 -translate-y-1/2 select-none">
            <span className="font-catan text-[clamp(2.4rem,9.2cqw,5.8rem)] font-black leading-none bg-gradient-to-b from-[#fff6b0] via-[#f5c647] to-[#804a08] bg-clip-text text-transparent drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]">
              C
            </span>
          </div>

          <div className="absolute left-1/2 top-[6.8%] z-10 flex w-[58%] -translate-x-1/2 flex-col items-center text-center">
            <div className="bg-gradient-to-b from-[#fff2a5] via-[#e4ad35] to-[#8f5313] bg-clip-text text-[clamp(1.5rem,6.8cqw,3.8rem)] font-black leading-[0.85] tracking-[0.14em] text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,.95)]">
              CATAN
            </div>
            <div className="mt-[2.5%] text-[clamp(.38rem,1.65cqw,1rem)] font-bold uppercase tracking-[.18em] text-[#e6b858] drop-shadow-[0_1px_2px_rgba(0,0,0,.95)]">
              Settle · Trade · Build
            </div>
          </div>

          <div className="absolute right-[9%] top-[6.2%] z-30 flex items-center gap-[clamp(0.25rem,1cqw,0.5rem)]">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowSoundPopover((open) => !open);
                }}
                className="flex h-[clamp(1.35rem,4.8cqw,2rem)] w-[clamp(1.35rem,4.8cqw,2rem)] items-center justify-center rounded-full border border-[#d09a35] bg-[#24150d]/90 text-[#f5cf69] shadow-[0_2px_5px_rgba(0,0,0,.8)] transition hover:scale-105 hover:text-white"
                aria-label="Sound settings"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-[55%] w-[55%]" /> : <Volume2 className="h-[55%] w-[55%]" />}
              </button>

              {showSoundPopover && (
                <div className="absolute right-0 top-[calc(100%+.5rem)] z-50 w-44 rounded-lg border border-[#bd8730] bg-[#1b1009]/95 p-2.5 text-[#f5e4bd] shadow-2xl backdrop-blur-md">
                  <div className="mb-2 flex items-center justify-between border-b border-[#a66c25]/50 pb-1.5 font-vietnam text-[10px] font-bold uppercase tracking-wide">
                    <span>Game volume</span>
                    <span>{isMuted ? 'Off' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);
                        soundEngine.setMuted(nextMuted);
                      }}
                      className="rounded bg-[#3b2415] p-1 text-[#f5cf69]"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                    <input
                      aria-label="Game volume"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(event) => {
                        const nextVolume = Number(event.target.value);
                        setVolume(nextVolume);
                        setIsMuted(false);
                        soundEngine.setVolume(nextVolume);
                        soundEngine.setMuted(false);
                      }}
                      className="h-1 w-full accent-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-[clamp(1.35rem,4.8cqw,2rem)] w-[clamp(1.35rem,4.8cqw,2rem)] items-center justify-center rounded-full border border-[#d09a35] bg-[#24150d]/90 text-[#f5cf69] shadow-[0_2px_5px_rgba(0,0,0,.8)] transition hover:scale-105 hover:text-white"
              aria-label="Close profile"
            >
              <X className="h-[58%] w-[58%]" />
            </button>
          </div>

          <div className="absolute left-[13%] top-[17.2%] z-10 flex w-[74%] items-center justify-center">
            <span className="font-cinzel text-[clamp(.6rem,2.2cqw,1.2rem)] font-bold uppercase tracking-[.18em] text-[#dfbe73] drop-shadow-[0_2px_3px_#000]">
              Player info
            </span>
          </div>

          <div className="absolute left-[14%] top-[22.6%] z-10 w-[53%] text-[#efc86d] drop-shadow-[0_2px_2px_rgba(0,0,0,.95)]">
            <span className="block text-[clamp(.42rem,1.55cqw,.85rem)] font-semibold uppercase tracking-[.18em] text-[#c49b51]">Settler</span>
            {isEditingName ? (
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setIsEditingName(false);
                  }}
                  maxLength={24}
                  className="min-w-0 flex-1 rounded border border-[#d5a33b] bg-[#211207]/90 px-2 py-0.5 font-vietnam text-[clamp(.8rem,3cqw,1.5rem)] font-bold text-[#ffe8a2] outline-none shadow-inner"
                  aria-label="Player name"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="rounded border border-[#d5a33b] bg-[#7b4a13] p-1.5 text-white transition hover:bg-[#92591a]"
                  aria-label="Confirm name"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="group mt-0.5 flex max-w-full items-center gap-1.5 text-left"
                title="Change player name"
              >
                <span className="truncate font-vietnam text-[clamp(.85rem,3.4cqw,1.75rem)] font-bold tracking-[.02em] text-[#f8d479]">
                  {name || 'Alexander'}
                </span>
                <Edit3 className="h-[clamp(.55rem,1.8cqw,1rem)] w-[clamp(.55rem,1.8cqw,1rem)] shrink-0 text-[#c89849] opacity-75 transition group-hover:opacity-100 group-hover:text-amber-300" />
              </button>
            )}
            <div className="mt-[2%] flex items-center gap-2">
              <span className="font-vietnam text-[clamp(.6rem,2.1cqw,1.05rem)] font-bold tracking-wider text-[#d3a950]">
                {profileCode(profile.id)}
              </span>
              <span className="text-[#8e682b] text-[clamp(.45rem,1.6cqw,.85rem)]">•</span>
              <span className="font-cormorant text-[clamp(.62rem,2.2cqw,1.15rem)] font-bold uppercase tracking-[.09em] text-[#d9bb7c]">
                Architect level
              </span>
            </div>
          </div>

          <div className="absolute right-[12.8%] top-[20%] z-10 w-[17.8%] aspect-square">
            <Image src={currentAvatar.file} alt={currentAvatar.name} fill className="object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,.9)]" sizes="200px" priority />
          </div>

          <div className="absolute left-[12.9%] top-[33.2%] z-10 grid h-[17.2%] w-[73.8%] grid-cols-2 grid-rows-2 gap-x-[2.8%] gap-y-[9%]">
            {STATS_ITEMS.map((stat) => (
              <div key={stat.label} className="flex h-full min-h-0 items-center gap-[6%] px-[6%]">
                <div className="relative aspect-square h-[68%] shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,.9)]">
                  <Image src={stat.icon} alt="" fill className="object-contain" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1 drop-shadow-[0_2px_2px_rgba(0,0,0,.95)]">
                  <span className="block truncate font-cormorant text-[clamp(.52rem,2.1cqw,1.1rem)] font-bold uppercase leading-none tracking-[.06em] text-[#d6b473]">{stat.label}</span>
                  <span className="mt-[3%] block truncate font-cormorant text-[clamp(.95rem,3.8cqw,2.0rem)] font-bold leading-none text-[#fce49d]">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute left-1/2 top-[54.7%] z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span className="rounded-full border border-[#8f5d21] bg-[#1d1108]/95 px-4 py-0.5 text-center font-cinzel text-[clamp(.52rem,1.9cqw,1rem)] font-bold uppercase tracking-[.14em] text-[#e5be6b] shadow-lg drop-shadow">
              Select avatar
            </span>
          </div>

          <div className="absolute left-[13%] top-[56.8%] z-10 w-[74%]">
            <div className="grid grid-cols-4 gap-[4%]">
              {AVATAR_OPTIONS.map((option) => {
                const selected = option.id === avatar;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      playClick();
                      setAvatar(option.id);
                    }}
                    className="group flex min-w-0 flex-col items-center focus:outline-none"
                    aria-pressed={selected}
                    aria-label={`Select ${option.name}`}
                  >
                    <span className={`relative mx-auto block aspect-square w-[70%] transition duration-200 ${selected ? 'scale-105 drop-shadow-[0_0_12px_rgba(255,191,45,.95)]' : 'opacity-80 group-hover:scale-105 group-hover:opacity-100'}`}>
                      <Image src={option.file} alt={option.name} fill className="object-contain" sizes="110px" />
                      {selected && <Image src="/assets/profile/profile_avatar_frame_selected.png" alt="" fill className="pointer-events-none object-contain" sizes="110px" />}
                    </span>
                    <span className={`mt-1.5 truncate font-cormorant text-[clamp(.44rem,1.65cqw,.95rem)] font-bold uppercase tracking-[.05em] ${selected ? 'text-[#f5cf73]' : 'text-[#c3a46a]'}`}>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute left-[13%] top-[67.2%] z-10 flex w-[74%] items-center justify-center gap-3 text-[#d7b875]">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8f5d21] to-[#d2a546]" />
            <span className="text-center font-cinzel text-[clamp(.52rem,1.9cqw,1rem)] font-bold uppercase tracking-[.12em] text-[#e5be6b] drop-shadow-[0_2px_2px_#000]">
              Choose player color
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8f5d21] to-[#d2a546]" />
          </div>

          <div className="absolute left-[9.5%] top-[70.5%] z-10 w-[81%]">
            <div className="grid grid-cols-6 gap-[2%]">
              {COLOR_OPTIONS.map((option) => {
                const selected = option.id === color;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      playClick();
                      setColor(option.id);
                    }}
                    tabIndex={-1}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className="group flex min-w-0 flex-col items-center outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                    aria-pressed={selected}
                    aria-label={`Select ${option.label} player color`}
                  >
                    <span className={`relative mx-auto block w-[84%] aspect-[971/1619] transition duration-200 ${selected ? 'scale-110 drop-shadow-[0_0_14px_rgba(255,191,45,.95)]' : 'opacity-80 group-hover:scale-105 group-hover:opacity-100'}`}>
                      <Image src={option.file} alt={option.label} fill className="object-contain" sizes="120px" />
                    </span>
                    <span className={`mt-1.5 truncate font-cormorant text-[clamp(.44rem,1.7cqw,1rem)] font-bold uppercase tracking-[.06em] ${selected ? 'text-[#f5cf73]' : 'text-[#c3a46a]'}`}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-[4.5%] left-[12%] z-20 flex w-[76%] items-center justify-center gap-[6%]">
            <button
              type="button"
              onClick={handleSave}
              tabIndex={-1}
              style={{ outline: 'none', boxShadow: 'none' }}
              className="group relative aspect-[2048/768] w-[47%] transition duration-200 hover:scale-[1.03] active:scale-[.98] outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
            >
              <Image src="/assets/profile/profile_button_save.png" alt="" fill className="object-contain" sizes="320px" />
              <span className="absolute inset-0 flex items-center justify-center px-[8%] pt-[1%] font-cinzel text-[clamp(.52rem,2.0cqw,1.15rem)] font-bold uppercase tracking-[.1em] text-[#fae3ac] drop-shadow-[0_2px_2px_#000]">Save changes</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              tabIndex={-1}
              style={{ outline: 'none', boxShadow: 'none' }}
              className="group relative aspect-[2048/768] w-[47%] transition duration-200 hover:scale-[1.03] active:scale-[.98] outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
            >
              <Image src="/assets/profile/profile_button_cancel.png" alt="" fill className="object-contain" sizes="320px" />
              <span className="absolute inset-0 flex items-center justify-center px-[8%] pt-[1%] font-cinzel text-[clamp(.52rem,2.0cqw,1.15rem)] font-bold uppercase tracking-[.1em] text-[#ded6c4] drop-shadow-[0_2px_2px_#000]">Cancel</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
