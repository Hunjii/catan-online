'use client';

import React, { useState } from 'react';
import { GameState, DevCardType, ResourceType } from '@/lib/catan/types';
import { DEV_CARD_INFO } from '@/lib/catan/devCards';
import { X, Play, ShieldAlert } from 'lucide-react';

interface DevCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  currentUserId: string;
  onPlayDevCard: (card: DevCardType, extraData?: any) => void;
}

const RESOURCES: { type: ResourceType; label: string; icon: string }[] = [
  { type: 'wood', label: 'Gỗ', icon: '🌲' },
  { type: 'brick', label: 'Gạch', icon: '🧱' },
  { type: 'sheep', label: 'Cừu', icon: '🐑' },
  { type: 'wheat', label: 'Lúa mì', icon: '🌾' },
  { type: 'ore', label: 'Đá', icon: '⛰️' },
];

export const DevCardModal: React.FC<DevCardModalProps> = ({
  isOpen,
  onClose,
  gameState,
  currentUserId,
  onPlayDevCard,
}) => {
  const [selectedCard, setSelectedCard] = useState<DevCardType | null>(null);
  const [yearRes1, setYearRes1] = useState<ResourceType>('wheat');
  const [yearRes2, setYearRes2] = useState<ResourceType>('ore');
  const [monopolyRes, setMonopolyRes] = useState<ResourceType>('ore');

  if (!isOpen) return null;

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  if (!myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const alreadyPlayedThisTurn = gameState.hasPlayedDevCardThisTurn;

  const playableCards = myPlayer.devCards.filter(
    (c) => !myPlayer.newDevCardsBoughtThisTurn.includes(c)
  );

  const handlePlay = (card: DevCardType) => {
    let extraData: any = {};
    if (card === 'year_of_plenty') {
      extraData = { res1: yearRes1, res2: yearRes2 };
    } else if (card === 'monopoly') {
      extraData = { resource: monopolyRes };
    }
    onPlayDevCard(card, extraData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎴</span>
            <h2 className="text-lg font-bold text-white">Thẻ Phát Triển Của Bạn</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {alreadyPlayedThisTurn && (
            <div className="flex items-center gap-2 p-3 bg-amber-950/50 border border-amber-500/40 rounded-xl text-amber-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Bạn đã kích hoạt 1 thẻ phát triển trong lượt này. (Quy chuẩn Catan: tối đa 1 thẻ/lượt).
            </div>
          )}

          {myPlayer.devCards.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Bạn chưa sở hữu thẻ phát triển nào. Hãy mua thêm trong lượt hành động (1 Cừu + 1 Lúa mì + 1 Đá).
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {myPlayer.devCards.map((card, idx) => {
                const info = DEV_CARD_INFO[card];
                const isBoughtThisTurn = myPlayer.newDevCardsBoughtThisTurn.includes(card);
                const canPlay =
                  isMyTurn &&
                  gameState.phase === 'turn_actions' &&
                  !alreadyPlayedThisTurn &&
                  !isBoughtThisTurn &&
                  card !== 'victory_point';

                return (
                  <div
                    key={`${card}_${idx}`}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                      selectedCard === card
                        ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-bold text-white text-sm">
                          <span>{info.badge}</span>
                          <span>{info.viTitle}</span>
                        </div>
                        {isBoughtThisTurn && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                            Vừa mua lượt này
                          </span>
                        )}
                        {card === 'victory_point' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                            +1 Điểm ẩn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">{info.viDescription}</p>
                    </div>

                    {/* Extra Selector options for Year of Plenty or Monopoly */}
                    {card === 'year_of_plenty' && canPlay && (
                      <div className="flex items-center gap-2 text-xs bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <select
                          value={yearRes1}
                          onChange={(e) => setYearRes1(e.target.value as ResourceType)}
                          className="bg-slate-800 rounded px-2 py-1 text-white"
                        >
                          {RESOURCES.map((r) => (
                            <option key={r.type} value={r.type}>{r.icon} {r.label}</option>
                          ))}
                        </select>
                        <span>+</span>
                        <select
                          value={yearRes2}
                          onChange={(e) => setYearRes2(e.target.value as ResourceType)}
                          className="bg-slate-800 rounded px-2 py-1 text-white"
                        >
                          {RESOURCES.map((r) => (
                            <option key={r.type} value={r.type}>{r.icon} {r.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {card === 'monopoly' && canPlay && (
                      <div className="flex items-center gap-2 text-xs bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Chọn loại:</span>
                        <select
                          value={monopolyRes}
                          onChange={(e) => setMonopolyRes(e.target.value as ResourceType)}
                          className="bg-slate-800 rounded px-2 py-1 text-white flex-1"
                        >
                          {RESOURCES.map((r) => (
                            <option key={r.type} value={r.type}>{r.icon} {r.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Play Button */}
                    {card !== 'victory_point' && (
                      <button
                        onClick={() => handlePlay(card)}
                        disabled={!canPlay}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          canPlay
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Kích Hoạt Thẻ
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
