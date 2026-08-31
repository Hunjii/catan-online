'use client';

import React, { useState } from 'react';
import { X, BookOpen, Calculator, Sparkles, Shield, Navigation } from 'lucide-react';

interface RulebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'costs' | 'rules' | 'probabilities'>('costs');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Sổ Tay Luật Chơi & Bảng Tra Cứu Catan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('costs')}
            className={`flex-1 py-3 border-b-2 transition-all ${
              activeTab === 'costs'
                ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Bảng Giá Xây Dựng
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 border-b-2 transition-all ${
              activeTab === 'rules'
                ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 Luật Chơi Chuẩn
          </button>
          <button
            onClick={() => setActiveTab('probabilities')}
            className={`flex-1 py-3 border-b-2 transition-all ${
              activeTab === 'probabilities'
                ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎲 Xác Suất Xúc Xắc
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4 text-sm text-slate-300">
          {/* Tab 1: Building Costs */}
          {activeTab === 'costs' && (
            <div className="flex flex-col gap-3">
              {/* Road */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🛣️</span> Con Đường (Road)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Nối dài mạng lưới đường của bạn.</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>🌲 1 Gỗ</span> + <span>🧱 1 Gạch</span>
                </div>
              </div>

              {/* Settlement */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🏠</span> Ngôi Làng (Settlement) <span className="text-amber-400 text-xs">(+1 VP)</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Thu hoạch 1 tài nguyên từ các ô kề bên. Tuân thủ Distance Rule.</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>🌲 1</span> + <span>🧱 1</span> + <span>🐑 1</span> + <span>🌾 1</span>
                </div>
              </div>

              {/* City */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🏰</span> Thành Phố (City) <span className="text-amber-400 text-xs">(+2 VP)</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Nâng cấp từ Làng có sẵn. Thu hoạch gấp đôi (2 tài nguyên).</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>🌾 2 Lúa mì</span> + <span>⛰️ 3 Đá</span>
                </div>
              </div>

              {/* Dev Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🎴</span> Thẻ Phát Triển (Dev Card)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Rút ngẫu nhiên (Hiệp sĩ, Điểm ẩn, Độc quyền...).</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>🐑 1 Cừu</span> + <span>🌾 1 Lúa mì</span> + <span>⛰️ 1 Đá</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Standard Rules */}
          {activeTab === 'rules' && (
            <div className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-amber-300 text-sm mb-1.5">1. Quy Tắc Khoảng Cách (Distance Rule)</h3>
                <p>
                  Một Ngôi Làng chỉ được xây dựng tại đỉnh mà tất cả các đỉnh lân cận (cách 1 đoạn đường) đều không có Làng hoặc Thành phố của bất kỳ ai.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-amber-300 text-sm mb-1.5">2. Tướng Cướp Khi Gieo Ra Số 7</h3>
                <p>
                  Mọi người chơi có trên 7 lá bài phải bỏ đi một nửa. Người gieo xúc xắc di chuyển Robber sang ô khác và cướp 1 thẻ của đối thủ ở ô đó. Ô bị Robber đứng sẽ không sinh tài nguyên!
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-amber-300 text-sm mb-1.5">3. Danh Hiệu Đặc Biệt (2 VP)</h3>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-300">
                  <li>
                    <strong className="text-white">Con Đường Dài Nhất:</strong> Chuỗi đường liên tục $\ge 5$ đoạn.
                  </li>
                  <li>
                    <strong className="text-white">Đội Quân Lớn Nhất:</strong> Kích hoạt $\ge 3$ thẻ Hiệp sĩ.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-amber-300 text-sm mb-1.5">4. Điều Kiện Thắng</h3>
                <p>
                  Người đầu tiên đạt <strong className="text-amber-400">10 Điểm Chiến Thắng (VP)</strong> trong lượt của mình sẽ giành chiến thắng chung cuộc!
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Probabilities */}
          {activeTab === 'probabilities' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                Xác suất khi gieo 2 viên xúc xắc 6 mặt (Tổng 36 tổ hợp khả dĩ):
              </p>
              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                {[
                  { num: 2, pips: 1, prob: '2.8%', red: false },
                  { num: 3, pips: 2, prob: '5.6%', red: false },
                  { num: 4, pips: 3, prob: '8.3%', red: false },
                  { num: 5, pips: 4, prob: '11.1%', red: false },
                  { num: 6, pips: 5, prob: '13.9%', red: true },
                  { num: 7, pips: 6, prob: '16.7%', red: true, note: 'Tướng cướp' },
                  { num: 8, pips: 5, prob: '13.9%', red: true },
                  { num: 9, pips: 4, prob: '11.1%', red: false },
                  { num: 10, pips: 3, prob: '8.3%', red: false },
                  { num: 11, pips: 2, prob: '5.6%', red: false },
                  { num: 12, pips: 1, prob: '2.8%', red: false },
                ].map((item) => (
                  <div
                    key={item.num}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-0.5 ${
                      item.red
                        ? 'bg-red-950/50 border-red-500/70 text-red-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-base font-black">{item.num}</span>
                    <span className="text-[10px] text-amber-400">{'•'.repeat(item.pips)}</span>
                    <span className="text-[10px] text-slate-400">{item.prob}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
