'use client';

import { useState, useEffect } from 'react';
import { PlayerColor, PieceStyle } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

export interface PlayerProfile {
  id: string;
  name: string;
  color: PlayerColor;
  pieceStyle: PieceStyle;
  avatarSeed: string;
  soundVolume: number;
  soundMuted: boolean;
}

const STORAGE_KEY = 'catan_3d_player_profile';

function generateRandomName(): string {
  const adjectives = ['Hào Hiệp', 'Dũng Cảm', 'Khôn Ngoan', 'Bí Ẩn', 'Thần Tốc', 'Kiên Cường', 'Vui Vẻ', 'Bất Khả Chiến Bại'];
  const nouns = ['Lãnh Chúa', 'Thương Nhân', 'Hiệp Sĩ', 'Nhà Khai Hoang', 'Nhà Giả Kim', 'Thuyền Trưởng', 'Bá Tước', 'Đại Gia'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${noun} ${adj} #${num}`;
}

const DEFAULT_COLORS: PlayerColor[] = ['red', 'blue', 'orange', 'white', 'green', 'purple'];

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile>({
    id: '',
    name: '',
    color: 'red',
    pieceStyle: 'classic_wood',
    avatarSeed: '',
    soundVolume: 0.7,
    soundMuted: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        soundEngine.setVolume(parsed.soundVolume ?? 0.7);
        soundEngine.setMuted(parsed.soundMuted ?? false);
      } else {
        const newId = 'player_' + Math.random().toString(36).substring(2, 9);
        const randomName = generateRandomName();
        const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        const initial: PlayerProfile = {
          id: newId,
          name: randomName,
          color: randomColor,
          pieceStyle: 'classic_wood',
          avatarSeed: newId,
          soundVolume: 0.7,
          soundMuted: false,
        };
        setProfile(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to read profile from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save profile', e);
      }
      if (updates.soundVolume !== undefined) {
        soundEngine.setVolume(updates.soundVolume);
      }
      if (updates.soundMuted !== undefined) {
        soundEngine.setMuted(updates.soundMuted);
      }
      return next;
    });
  };

  return { profile, updateProfile, isLoaded };
}
