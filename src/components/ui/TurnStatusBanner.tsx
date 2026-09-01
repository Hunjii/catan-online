'use client';

import React from 'react';
import { AlertTriangle, Castle, Dices, HandCoins, ShieldAlert, Swords } from 'lucide-react';
import { GamePhase, GameState } from '@/lib/catan/types';

interface TurnStatusBannerProps {
  gameState: GameState;
  currentUserId: string;
}

type PhaseCopy = {
  eyebrow: string;
  title: string;
  detail: string;
  tone: 'gold' | 'red' | 'blue' | 'green';
  icon: React.ComponentType<{ className?: string }>;
};

const PHASE_COPY: Record<GamePhase, PhaseCopy> = {
  lobby: {
    eyebrow: 'PHÒNG CHỜ',
    title: 'Sẵn sàng khai phá',
    detail: 'Chờ chủ phòng bắt đầu ván đấu.',
    tone: 'blue',
    icon: Castle,
  },
  setup_round_1: {
    eyebrow: 'THIẾT LẬP · VÒNG 1',
    title: 'Đặt làng đầu tiên',
    detail: 'Chọn một giao điểm hợp lệ, sau đó nối đường khởi đầu.',
    tone: 'gold',
    icon: Castle,
  },
  setup_round_2: {
    eyebrow: 'THIẾT LẬP · VÒNG 2',
    title: 'Đặt làng thứ hai',
    detail: 'Bạn sẽ nhận tài nguyên từ các ô lân cận sau khi đặt làng.',
    tone: 'gold',
    icon: Castle,
  },
  turn_roll_dice: {
    eyebrow: 'GIAI ĐOẠN XÚC XẮC',
    title: 'Đến lượt gieo xúc xắc',
    detail: 'Gieo xúc xắc để kích hoạt tài nguyên trên đảo.',
    tone: 'gold',
    icon: Dices,
  },
  turn_robber_discard: {
    eyebrow: 'TƯỚNG CƯỚP · XẢ BÀI',
    title: 'Bảo vệ kho tài nguyên',
    detail: 'Người chơi có hơn 7 thẻ phải xả một nửa số thẻ.',
    tone: 'red',
    icon: ShieldAlert,
  },
  turn_robber_move: {
    eyebrow: 'TƯỚNG CƯỚP · DI CHUYỂN',
    title: 'Chọn ô cho Tướng cướp',
    detail: 'Chọn một ô khác để khóa sản lượng và chuẩn bị cướp bài.',
    tone: 'red',
    icon: Swords,
  },
  turn_robber_steal: {
    eyebrow: 'TƯỚNG CƯỚP · CƯỚP BÀI',
    title: 'Chọn một đối thủ',
    detail: 'Chọn người chơi cạnh ô cướp để lấy một thẻ ngẫu nhiên.',
    tone: 'red',
    icon: Swords,
  },
  turn_actions: {
    eyebrow: 'GIAI ĐOẠN HÀNH ĐỘNG',
    title: 'Xây dựng đế chế',
    detail: 'Giao thương, xây dựng hoặc mua bài phát triển trước khi kết thúc lượt.',
    tone: 'green',
    icon: HandCoins,
  },
  game_over: {
    eyebrow: 'KẾT THÚC VÁN ĐẤU',
    title: 'Đảo Catan đã có nhà vua',
    detail: 'Xem kết quả và bắt đầu lại một cuộc chinh phục mới.',
    tone: 'gold',
    icon: Castle,
  },
};

const TONE_STYLES = {
  gold: 'border-amber-300/70 shadow-[0_10px_35px_rgba(245,158,11,0.24)]',
  red: 'border-red-400/80 shadow-[0_10px_35px_rgba(220,38,38,0.25)]',
  blue: 'border-sky-300/70 shadow-[0_10px_35px_rgba(14,165,233,0.2)]',
  green: 'border-emerald-300/70 shadow-[0_10px_35px_rgba(16,185,129,0.2)]',
};

const ICON_TONE_STYLES = {
  gold: 'bg-amber-300/15 text-amber-200 border-amber-200/50',
  red: 'bg-red-400/15 text-red-200 border-red-300/50',
  blue: 'bg-sky-300/15 text-sky-200 border-sky-200/50',
  green: 'bg-emerald-300/15 text-emerald-200 border-emerald-200/50',
};

export const TurnStatusBanner: React.FC<TurnStatusBannerProps> = ({ gameState, currentUserId }) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const activePlayer = gameState.players.find((player) => player.id === activePlayerId);
  const copy = PHASE_COPY[gameState.phase];
  const Icon = copy.icon;
  const isMyTurn = activePlayerId === currentUserId;
  const diceLabel = gameState.lastDiceRoll
    ? `${gameState.lastDiceRoll[0]} + ${gameState.lastDiceRoll[1]} = ${gameState.lastDiceRoll[0] + gameState.lastDiceRoll[1]}`
    : 'Chưa gieo';

  return (
    <section
      aria-live="polite"
      className={`game-panel pointer-events-none relative overflow-hidden rounded-2xl border-2 px-3 py-2.5 text-catan-parchment backdrop-blur-md transition-all duration-300 ${TONE_STYLES[copy.tone]}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35" />
      <div className="relative flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${ICON_TONE_STYLES[copy.tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-sans text-[9px] font-black tracking-[0.18em] text-amber-200/75">{copy.eyebrow}</span>
            <span className="font-sans text-[9px] font-bold text-white/45">LƯỢT {String(gameState.turnNumber).padStart(2, '0')}</span>
          </div>
          <h2 className="truncate text-sm font-black tracking-wide text-white sm:text-base">{copy.title}</h2>
          <p className="truncate font-sans text-[10px] text-catan-parchment/75 sm:text-[11px]">{copy.detail}</p>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <span className={`rounded-full border px-2 py-0.5 font-sans text-[9px] font-black tracking-wider ${isMyTurn ? 'border-emerald-300/70 bg-emerald-400/15 text-emerald-100' : 'border-white/20 bg-black/25 text-white/60'}`}>
            {isMyTurn ? 'LƯỢT CỦA BẠN' : activePlayer ? `LƯỢT ${activePlayer.name}` : 'ĐANG CHỜ'}
          </span>
          <span className="flex items-center gap-1 font-sans text-[10px] font-bold text-amber-100/65">
            <AlertTriangle className="h-3 w-3 text-amber-300/80" /> Xúc xắc: {diceLabel}
          </span>
        </div>
      </div>
    </section>
  );
};
