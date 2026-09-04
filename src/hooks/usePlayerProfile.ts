'use client';

import { useState, useEffect } from 'react';
import { PlayerColor, PieceStyle, AvatarId, TileSetStyle } from '@/lib/catan/types';
import { soundEngine } from '@/lib/audio/soundEngine';

export interface PlayerProfile {
  id: string;
  name: string;
  /** True after the user explicitly saves a name in the profile modal. */
  nameIsCustom?: boolean;
  color: PlayerColor;
  avatar: AvatarId;
  tileSetStyle: TileSetStyle;
  pieceStyle: PieceStyle;
  avatarSeed: string;
  soundVolume: number;
  soundMuted: boolean;
}

const STORAGE_KEY = 'catan_3d_player_profile';
const DEFAULT_NAME = 'Alexander';

function generateRandomName(): string {
  const titles = ['Alexander', 'Elara', 'Magnus', 'Lyra', 'Khai Hoang', 'Lãnh Chúa', 'Thương Nhân'];
  const name = titles[Math.floor(Math.random() * titles.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${name} #${num}`;
}

function generatePlayerId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return `player_${window.crypto.randomUUID()}`;
  }

  return 'player_' + Math.random().toString(36).substring(2, 9);
}

const DEFAULT_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'orange', 'brown'];

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile>({
    id: '',
    name: DEFAULT_NAME,
    color: 'red',
    avatar: 'alexander',
    tileSetStyle: 'classic',
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
        const savedName = typeof parsed.name === 'string' ? parsed.name.trim() : '';
        const isLegacyDefaultName = !parsed.nameIsCustom && savedName === DEFAULT_NAME;
        const id = parsed.id || generatePlayerId();
        const name = isLegacyDefaultName || !savedName ? generateRandomName() : savedName;
        const normalizedProfile = {
          ...parsed,
          id,
          name,
          nameIsCustom: parsed.nameIsCustom ?? false,
          avatar: parsed.avatar || 'alexander',
          tileSetStyle: parsed.tileSetStyle || 'classic',
          pieceStyle: parsed.pieceStyle || 'classic_wood',
          avatarSeed: parsed.avatarSeed || id,
          color: parsed.color || 'red',
        };
        setProfile({
          ...normalizedProfile,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProfile));
        soundEngine.setVolume(parsed.soundVolume ?? 0.7);
        soundEngine.setMuted(parsed.soundMuted ?? false);
      } else {
        const newId = generatePlayerId();
        const initial: PlayerProfile = {
          id: newId,
          name: generateRandomName(),
          nameIsCustom: false,
          color: 'red',
          avatar: 'alexander',
          tileSetStyle: 'classic',
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
      const next = {
        ...prev,
        ...updates,
        ...(updates.name !== undefined ? { nameIsCustom: true } : {}),
      };
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
