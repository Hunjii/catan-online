'use client';

import React, { useState } from 'react';
import { GameState, ResourceType, Player } from '@/lib/catan/types';
import { getPlayerTradeRatios } from '@/lib/catan/trade';
import { X, ArrowRight, ArrowRightLeft, Building2, Users } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  currentUserId: string;
  onExecuteBankTrade: (give: ResourceType, giveCount: number, get: ResourceType) => void;
  onCreateTradeOffer: (giving: Record<ResourceType, number>, requesting: Record<ResourceType, number>) => void;
  onAcceptTradeOffer: (offerId: string) => void;
  onCancelTradeOffer: () => void;
}

const RESOURCES: { type: ResourceType; label: string; icon: string }[] = [
  { type: 'wood', label: 'Gỗ', icon: '🌲' },
  { type: 'brick', label: 'Gạch', icon: '🧱' },
  { type: 'sheep', label: 'Cừu', icon: '🐑' },
  { type: 'wheat', label: 'Lúa mì', icon: '🌾' },
  { type: 'ore', label: 'Đá', icon: '⛰️' },
];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  gameState,
  currentUserId,
  onExecuteBankTrade,
  onCreateTradeOffer,
  onAcceptTradeOffer,
  onCancelTradeOffer,
}) => {
  const [tab, setTab] = useState<'bank' | 'players'>('bank');

  // Bank Trade State
  const [giveRes, setGiveRes] = useState<ResourceType>('wood');
  const [getRes, setGetRes] = useState<ResourceType>('brick');

  // Domestic Trade State
  const [giving, setGiving] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });
  const [requesting, setRequesting] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

  if (!isOpen) return null;

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  if (!myPlayer) return null;

  const ratios = getPlayerTradeRatios(myPlayer.id, gameState.vertices);
  const requiredRatio = ratios[giveRes];
  const myAvailable = myPlayer.resources[giveRes] || 0;
  const canBankTrade = myAvailable >= requiredRatio && giveRes !== getRes;

  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;

  const activeOffer = gameState.currentTradeOffer;

  const handleBankTrade = () => {
    if (canBankTrade) {
      onExecuteBankTrade(giveRes, requiredRatio, getRes);
    }
  };

  const handleCreateOffer = () => {
    const giveTotal = Object.values(giving).reduce((a, b) => a + b, 0);
    const reqTotal = Object.values(requesting).reduce((a, b) => a + b, 0);
    if (giveTotal > 0 && reqTotal > 0) {
      onCreateTradeOffer(giving, requesting);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Thị Trường Giao Thương Catan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30">
          <button
            onClick={() => setTab('bank')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === 'bank'
                ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Cảng & Ngân Hàng ({ratios.generic}:1 / 2:1)
          </button>
          <button
            onClick={() => setTab('players')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === 'players'
                ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Giao Dịch Người Chơi
          </button>
        </div>

        {/* Tab 1: Bank / Harbor Trade */}
        {tab === 'bank' && (
          <div className="p-6 flex flex-col gap-5">
            <p className="text-xs text-slate-400">
              Đổi tài nguyên với Ngân hàng hoặc Bến cảng bạn sở hữu. Tỉ lệ hiện tại của bạn:
            </p>

            {/* Ratios Display */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {RESOURCES.map((r) => (
                <div
                  key={r.type}
                  className={`p-2 rounded-xl border ${
                    ratios[r.type] === 2
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : ratios[r.type] === 3
                      ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-lg">{r.icon}</div>
                  <div className="font-bold">{ratios[r.type]}:1</div>
                  <div className="text-[10px] text-slate-400">{r.label}</div>
                </div>
              ))}
            </div>

            {/* Trade Selector */}
            <div className="flex items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {/* Give */}
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Bạn đưa ({requiredRatio} thẻ):</label>
                <select
                  value={giveRes}
                  onChange={(e) => setGiveRes(e.target.value as ResourceType)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  {RESOURCES.map((r) => (
                    <option key={r.type} value={r.type}>
                      {r.icon} {r.label} (Bạn có: {myPlayer.resources[r.type] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center text-amber-400 pt-5">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Get */}
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Bạn nhận (1 thẻ):</label>
                <select
                  value={getRes}
                  onChange={(e) => setGetRes(e.target.value as ResourceType)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  {RESOURCES.map((r) => (
                    <option key={r.type} value={r.type} disabled={r.type === giveRes}>
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleBankTrade}
              disabled={!canBankTrade || !isMyTurn}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                canBankTrade && isMyTurn
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {!isMyTurn
                ? 'Chỉ được đổi trong lượt của bạn'
                : canBankTrade
                ? `Đổi ${requiredRatio} ${giveRes} lấy 1 ${getRes}`
                : `Không đủ ${requiredRatio} ${giveRes} để đổi`}
            </button>
          </div>
        )}

        {/* Tab 2: Player-to-Player Trade */}
        {tab === 'players' && (
          <div className="p-6 flex flex-col gap-5">
            {/* If an active offer exists */}
            {activeOffer && activeOffer.status === 'open' && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    Đề nghị từ {gameState.players.find((p) => p.id === activeOffer.fromPlayerId)?.name}:
                  </span>
                  {activeOffer.fromPlayerId === currentUserId && (
                    <button
                      onClick={onCancelTradeOffer}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Huỷ đề nghị
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-around text-sm bg-slate-900/80 p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-slate-400">Đưa: </span>
                    {Object.entries(activeOffer.giving)
                      .filter(([_, c]) => c > 0)
                      .map(([res, c]) => `${c} ${res}`)
                      .join(', ') || 'Không có'}
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs text-slate-400">Yêu cầu: </span>
                    {Object.entries(activeOffer.requesting)
                      .filter(([_, c]) => c > 0)
                      .map(([res, c]) => `${c} ${res}`)
                      .join(', ') || 'Không có'}
                  </div>
                </div>

                {activeOffer.fromPlayerId !== currentUserId && (
                  <button
                    onClick={() => onAcceptTradeOffer(activeOffer.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
                  >
                    Đồng Ý Trao Đổi
                  </button>
                )}
              </div>
            )}

            {/* Create Offer Form (Active Player Only) */}
            {isMyTurn && (!activeOffer || activeOffer.status !== 'open') && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Giving Column */}
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
                    <span className="text-xs font-bold text-emerald-400">Bạn muốn đưa:</span>
                    {RESOURCES.map((r) => (
                      <div key={r.type} className="flex items-center justify-between text-xs">
                        <span>{r.icon} {r.label}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setGiving((p) => ({ ...p, [r.type]: Math.max(0, p[r.type] - 1) }))}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold">{giving[r.type]}</span>
                          <button
                            onClick={() =>
                              setGiving((p) => ({
                                ...p,
                                [r.type]: Math.min(myPlayer.resources[r.type] || 0, p[r.type] + 1),
                              }))
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Requesting Column */}
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
                    <span className="text-xs font-bold text-amber-400">Bạn muốn nhận:</span>
                    {RESOURCES.map((r) => (
                      <div key={r.type} className="flex items-center justify-between text-xs">
                        <span>{r.icon} {r.label}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setRequesting((p) => ({ ...p, [r.type]: Math.max(0, p[r.type] - 1) }))}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold">{requesting[r.type]}</span>
                          <button
                            onClick={() => setRequesting((p) => ({ ...p, [r.type]: p[r.type] + 1 }))}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateOffer}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
                >
                  Đăng Đề Nghị Giao Thương
                </button>
              </div>
            )}

            {!isMyTurn && (!activeOffer || activeOffer.status !== 'open') && (
              <p className="text-xs text-slate-400 text-center py-6">
                Chỉ người chơi đang có lượt mới có thể khởi tạo đề nghị giao dịch.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
