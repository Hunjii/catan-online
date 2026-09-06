'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

interface RulebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ isOpen, onClose }) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan select-none"
      onClick={onClose}
    >
      {/* Modal Container matching aspect ratio 1533 / 1016 */}
      <div
        className="relative w-full max-w-4xl sm:max-w-5xl aspect-[1533/1016] max-h-[92vh] flex items-center justify-center shadow-[0_25px_80px_rgba(0,0,0,0.95)] drop-shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Background Modal Frame Asset */}
        <Image
          src="/assets/ingame/ingame_rules_modal_vi.png"
          alt="Bảng luật chơi & bảng tra cứu Catan"
          fill
          className="object-contain pointer-events-none drop-shadow-2xl select-none"
          priority
        />

        {/* 2. Top-Right Close Button (X) using dedicated asset */}
        <button
          onClick={onClose}
          className="absolute top-[2.2%] right-[0.8%] sm:right-[0.6%] w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 hover:scale-110 active:scale-95 transition-transform duration-150 cursor-pointer drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] z-30"
          title="Đóng (Close)"
        >
          <Image
            src="/assets/ingame/ingame_rules_close_button.png"
            alt="Đóng"
            fill
            className="object-contain"
            priority
          />
        </button>
      </div>
    </div>
  );
};
