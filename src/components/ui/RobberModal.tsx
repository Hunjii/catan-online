'use client';

import React, { useState } from 'react';
import { GameState, ResourceType, COLOR_MAP } from '@/lib/catan/types';
import { Skull, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RobberModalProps {
  gameState: GameState;
  currentUserId: string;
  onSubmitDiscard: (discarded: Partial<Record<ResourceType, number>>) => void;
  onStealResource: (victimPlayerId: string) => void;
}

const RESOURCES: { type: ResourceType; label: string; icon: string }[] = [
  { type: 'wood', label: 'Gỗ', icon: '🌲' },
  { type: 'brick', label: 'Gạch', icon: '🧱' },
  { type: 'sheep', label: 'Cừu', icon: '🐑' },
  { type: 'wheat', label: 'Lúa mì', icon: '🌾' },
  { type: 'ore', label: 'Đá', icon: '⛰️' },
];

export const RobberModal: React.FC<RobberModalProps> = ({
  gameState,
  currentUserId,
  onSubmitDiscard,
  onStealResource,
}) => {
  const [discarding, setDiscarding] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  if (!myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;

  // Case 1: Discard Phase
  const discardStatus = gameState.discardStatus[currentUserId];
  const mustDiscard = gameState.phase === 'turn_robber_discard' && discardStatus && !discardStatus.hasDiscarded;

  // Case 2: Steal Phase
  const mustSteal =
    gameState.phase === 'turn_robber_steal' &&
    isMyTurn &&
    gameState.stealingEligiblePlayerIds.length > 0;

  if (!mustDiscard && !mustSteal) return null;

  // Discard logic
  const selectedDiscardCount = Object.values(discarding).reduce((a, b) => a + b, 0);
  const requiredDiscardCount = discardStatus?.requiredCount || 0;

  const handleDiscardSubmit = () => {
    if (selectedDiscardCount === requiredDiscardCount) {
      onSubmitDiscard(discarding);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-red-500/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-red-950/60 border-b border-red-800/50">
          <Skull className="w-6 h-6 text-red-400 animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-white">
              {mustDiscard ? 'Tướng Cướp Đột Kích: Xả Bớt Bài!' : 'Cướp Tài Nguyên Từ Đối Thủ'}
            </h2>
            <p className="text-xs text-red-300">
              {mustDiscard
                ? `Bạn đang có hơn 7 thẻ. Bắt buộc phải bỏ đi ${requiredDiscardCount} thẻ.`
                : 'Chọn 1 đối thủ sở hữu nhà trên ô này để lấy 1 thẻ ngẫu nhiên.'}
            </p>
          </div>
        </div>

        {/* Content: Discard */}
        {mustDiscard && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-semibold bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span>Đã chọn bỏ: <strong className="text-red-400">{selectedDiscardCount} / {requiredDiscardCount}</strong> thẻ</span>
              {selectedDiscardCount === requiredDiscardCount && (
                <span className="text-emerald-400">✓ Đã đủ số lượng</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {RESOURCES.map((r) => {
                const available = myPlayer.resources[r.type] || 0;
                const chosen = discarding[r.type] || 0;

                return (
                  <div
                    key={r.type}
                    className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.icon}</span>
                      <span>{r.label} (Bạn có: {available})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDiscarding((p) => ({ ...p, [r.type]: Math.max(0, chosen - 1) }))}
                        disabled={chosen <= 0}
                        className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-amber-400">{chosen}</span>
                      <button
                        onClick={() =>
                          setDiscarding((p) => ({
                            ...p,
                            [r.type]: Math.min(available, chosen + 1),
                          }))
                        }
                        disabled={chosen >= available || selectedDiscardCount >= requiredDiscardCount}
                        className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleDiscardSubmit}
              disabled={selectedDiscardCount !== requiredDiscardCount}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-2 ${
                selectedDiscardCount === requiredDiscardCount
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Xác Nhận Xả Bài ({selectedDiscardCount}/{requiredDiscardCount})
            </button>
          </div>
        )}

        {/* Content: Steal */}
        {mustSteal && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-slate-300">
              Nhấp vào một đối thủ dưới đây để cướp ngẫu nhiên 1 lá bài tài nguyên từ tay họ:
            </p>

            <div className="flex flex-col gap-2.5">
              {gameState.stealingEligiblePlayerIds.map((victimId) => {
                const victim = gameState.players.find((p) => p.id === victimId);
                if (!victim) return null;
                const totalCards = Object.values(victim.resources).reduce((a, b) => a + b, 0);

                return (
                  <button
                    key={victim.id}
                    onClick={() => onStealResource(victim.id)}
                    className="flex items-center justify-between p-4 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500 rounded-2xl transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs border border-white/30"
                        style={{ backgroundColor: COLOR_MAP[victim.color] }}
                      >
                        {victim.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{victim.name}</div>
                        <div className="text-xs text-slate-400">Đang giữ: {totalCards} lá bài</div>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-600/80 text-white border border-red-500">
                      Cướp 1 thẻ
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
