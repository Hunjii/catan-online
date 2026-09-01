'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState, COLOR_MAP } from '@/lib/catan/types';
import { Trophy, Crown, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface VictoryModalProps {
  gameState: GameState;
  onRestartGame?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  onRestartGame,
}) => {
  const winner = gameState.players.find((p) => p.id === gameState.winnerPlayerId);

  useEffect(() => {
    if (gameState.phase === 'game_over' && winner) {
      // Launch celebratory fireworks confetti
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [gameState.phase, winner]);

  if (gameState.phase !== 'game_over' || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col items-center text-center p-8 text-slate-100 relative">
        {/* Crown Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 animate-bounce">
          <Crown className="w-10 h-10 text-amber-400" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
          Vua Đảo Catan Đã Xuất Hiện!
        </span>

        <h1 className="text-3xl font-black text-white mb-2">
          {winner.name}
        </h1>

        <p className="text-sm text-slate-300 mb-6">
          Đã đạt <strong className="text-amber-400 text-base">{winner.victoryPoints} Điểm Chiến Thắng</strong> và thống nhất hòn đảo!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs mb-6">
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
            <span className="text-slate-400">Danh hiệu Đường dài:</span>
            <strong className="text-white text-sm mt-0.5">{winner.hasLongestRoad ? '🏆 Đạt được (+2 VP)' : 'Không có'}</strong>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
            <span className="text-slate-400">Đội quân Lớn nhất:</span>
            <strong className="text-white text-sm mt-0.5">{winner.hasLargestArmy ? '⚔️ Đạt được (+2 VP)' : 'Không có'}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <Home className="w-4 h-4" />
            Về Trang Chủ
          </Link>

          {onRestartGame && (
            <button
              onClick={onRestartGame}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi Ván Mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
