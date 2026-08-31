'use client';

import React, { useState } from 'react';
import { PlayerProfile } from '@/hooks/usePlayerProfile';
import { PlayerColor, PieceStyle } from '@/lib/catan/types';
import { COLOR_MAP } from '../3d/Settlement3D';
import { X, User, Palette, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSave: (updated: Partial<PlayerProfile>) => void;
}

const AVAILABLE_COLORS: { color: PlayerColor; label: string }[] = [
  { color: 'red', label: 'Đỏ Thẫm' },
  { color: 'blue', label: 'Xanh Biển' },
  { color: 'orange', label: 'Cam Rực' },
  { color: 'white', label: 'Trắng Sáng' },
  { color: 'green', label: 'Lục Bảo' },
  { color: 'purple', label: 'Tím Quý Tộc' },
];

const PIECE_STYLES: { style: PieceStyle; label: string; desc: string }[] = [
  { style: 'classic_wood', label: 'Gỗ Cổ Điển', desc: 'Chất liệu gỗ tự nhiên phong cách boardgame truyền thống.' },
  { style: 'medieval', label: 'Trung Cổ Kỳ Ảo', desc: 'Mái ngói lâu đài, pháo đài đá kiên cố.' },
  { style: 'modern', label: 'Hiện Đại Tinh Gọn', desc: 'Bề mặt bóng bẩy ánh kim loại sang trọng.' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [color, setColor] = useState<PlayerColor>(profile.color);
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>(profile.pieceStyle);
  const [volume, setVolume] = useState(profile.soundVolume);
  const [isMuted, setIsMuted] = useState(profile.soundMuted);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      name: name.trim() || profile.name,
      color,
      pieceStyle,
      soundVolume: volume,
      soundMuted: isMuted,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Hồ Sơ & Cá Thể Hoá Người Chơi</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* Nickname Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Tên Hiển Thị (Nickname):</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Nhập tên người chơi..."
              className="bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Màu Sắc Quân Cờ:</label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setColor(c.color)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    color === c.color
                      ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: COLOR_MAP[c.color] }}
                  />
                  <span className="text-xs font-medium text-slate-200">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3D Piece Styles */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Phong Cách Mô Hình 3D (Piece Style):</label>
            <div className="flex flex-col gap-2">
              {PIECE_STYLES.map((ps) => (
                <button
                  key={ps.style}
                  onClick={() => setPieceStyle(ps.style)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    pieceStyle === ps.style
                      ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-300">{ps.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{ps.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Settings */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Cài Đặt Âm Thanh:</label>
            <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg ${isMuted ? 'bg-red-950/60 text-red-400' : 'bg-slate-800 text-amber-400'}`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="flex-1 accent-amber-400"
              />
              <span className="text-xs text-slate-400 w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
          >
            Lưu Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
};
