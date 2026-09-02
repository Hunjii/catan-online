'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Keyboard, Info } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [suggestedCode, setSuggestedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuggestedCode(generateRandomRoomCode());
      setRoomCode('');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const code = suggestedCode || generateRandomRoomCode();
    router.push(`/room/${code}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomCode.trim().toUpperCase();
    if (clean.length >= 3) {
      router.push(`/room/${clean}`);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && suggestedCode) {
      navigator.clipboard.writeText(`${window.location.origin}/room/${suggestedCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Dialog Board: Aspect ratio matches 1486 / 942 ≈ 1.577 */}
      <div
        className="relative z-10 w-full max-w-[650px] aspect-[1486/942] drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Base Wooden Board Asset */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <Image
            src="/assets/wait_room/wait_room_background.png"
            alt="Room Background"
            fill
            className="object-fill"
            priority
          />
        </div>

        {/* 2. Top Header Plaque (hanging slightly over top border) */}
        <div className="absolute -top-[14.5%] left-1/2 -translate-x-1/2 w-[55%] aspect-[2052/644] z-30 pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] flex items-center justify-center">
          <Image
            src="/assets/wait_room/wait_room_header_plaque.png"
            alt="Header Plaque"
            fill
            className="object-contain"
            priority
          />
          {/* Header Title Text */}
          <span className="relative z-10 pt-[5.5%] text-[#fed25c] font-catan font-black tracking-widest text-[clamp(13px,2.4vw,22px)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_0_8px_rgba(245,196,65,0.35)]">
            CREATE NEW ROOM
          </span>
        </div>

        {/* 3. Close Button (top-right corner of board) */}
        <button
          onClick={onClose}
          className="absolute -top-[0.5%] right-[0.8%] w-[7.8%] aspect-square z-40 hover:scale-110 active:scale-95 transition-transform cursor-pointer drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          title="Close"
        >
          <Image
            src="/assets/wait_room/wait_room_close_button.png"
            alt="Close"
            fill
            className="object-contain"
          />
        </button>

        {/* 4. Action Card: HOST & INVITE FRIENDS */}
        <button
          type="button"
          onClick={handleCreate}
          className="absolute top-[14%] left-[10%] w-[80%] h-[23.5%] z-20 group hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-left"
        >
          <Image
            src="/assets/wait_room/wait_room_create_card.png"
            alt="Create Room Card"
            fill
            className="object-fill pointer-events-none"
          />
          {/* Text positioned between the (+) circle on the left and (>) on the right */}
          <div className="absolute inset-0 pl-[18.5%] pr-[10%] flex flex-col justify-center pointer-events-none">
            <span className="text-[#fefbf2] font-catan font-black text-[clamp(12.5px,2.4vw,19px)] tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight">
              HOST &amp; INVITE FRIENDS
            </span>
            <span className="text-[#a49682] font-sans font-medium text-[clamp(9.5px,1.6vw,14px)] mt-0.5 sm:mt-1 leading-tight">
              Create a new room and invite friends to play
            </span>
          </div>
        </button>

        {/* 5. Divider 1: ENTER EXISTING ROOM CODE */}
        <div className="absolute top-[41.2%] left-0 right-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 bg-[#1b1008]/85 text-[#cfab63] font-catan font-bold text-[clamp(8.5px,1.4vw,12.5px)] tracking-widest uppercase rounded">
            <span className="text-[#a47a32] text-[8px] sm:text-[10px]">◇</span>
            <span>ENTER EXISTING ROOM CODE</span>
            <span className="text-[#a47a32] text-[8px] sm:text-[10px]">◇</span>
          </div>
        </div>

        {/* 6. Form: Code Input + JOIN Button */}
        <form
          onSubmit={handleJoin}
          className="absolute top-[47%] left-[6.6%] w-[86.8%] h-[11%] flex items-center gap-2 sm:gap-3 z-20"
        >
          {/* Input Box */}
          <div className="relative flex-1 h-full bg-[#120b06]/95 border-2 border-[#543b1f] hover:border-[#8f6a36] focus-within:border-[#cfab63] rounded-xl flex items-center px-3 sm:px-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] transition-colors">
            <div className="text-[#967440] mr-2 sm:mr-3 shrink-0">
              <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="w-full bg-transparent text-[#f5f1e8] font-mono font-bold text-[clamp(11px,1.8vw,16px)] uppercase placeholder:text-[#6a5642] outline-none tracking-wider"
            />
          </div>

          {/* JOIN Button */}
          <button
            type="submit"
            disabled={roomCode.trim().length < 3}
            className="relative h-full aspect-[1292/564] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] transition-all cursor-pointer shrink-0"
            title="Join Room"
          >
            <Image
              src="/assets/wait_room/wait_room_join_button.png"
              alt="Join"
              fill
              className="object-fill"
            />
          </button>
        </form>


        {/* 8. Parchment Panel: Room Code Preview + Copy */}
        <div
          onClick={handleCopy}
          className="absolute top-[67.4%] left-[6.6%] w-[86.8%] h-[18.7%] z-20 flex items-center justify-between px-[4%] cursor-pointer group"
          title="Click to copy room link"
        >
          {/* Spacer on left to balance the copy button on the right */}
          <div className="h-[68%] aspect-square shrink-0 pointer-events-none" />

          {/* Center: Monospace Code Display */}
          <div className="relative z-10 flex-1 flex items-center justify-center text-center">
            <span className="text-[#2b1a0d] font-catan font-black text-[clamp(14px,2.6vw,25px)] tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
              CODE: {suggestedCode || 'CAT688'}
            </span>
          </div>

          {/* Right: Copy Button using wait_room_copy_button.png asset */}
          <button
            type="button"
            onClick={handleCopy}
            className="relative z-10 h-[68%] aspect-square shrink-0 hover:scale-110 active:scale-95 transition-transform cursor-pointer drop-shadow-md"
            title="Copy room link"
          >
            <Image
              src="/assets/wait_room/wait_room_copy_button.png"
              alt="Copy"
              fill
              className="object-contain"
            />
          </button>

          {/* Floating 'Copied' Toast */}
          {copied && (
            <span className="absolute -top-7 right-3 bg-emerald-800 text-emerald-100 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-lg border border-emerald-500 animate-fade-in">
              Copied!
            </span>
          )}
        </div>

        {/* 9. Bottom Pill Info Hint */}
        <div className="absolute top-[88.2%] left-0 right-0 h-[6.5%] flex items-center justify-center gap-1.5 sm:gap-2 text-[#9a8470] text-[clamp(8px,1.25vw,12px)] font-sans pointer-events-none z-10 px-4">
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 stroke-[2] text-[#9a8470]" />
          <span>Share this room code with friends to invite them to join</span>
        </div>
      </div>
    </div>
  );
};
