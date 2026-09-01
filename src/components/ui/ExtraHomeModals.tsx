'use client';

import React from 'react';
import { X, ShoppingBag, Scroll, Users, Package, Check, Sparkles, Coins, Gift } from 'lucide-react';

interface ExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Shop Modal
export const ShopModal: React.FC<ExtraModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const items = [
    { name: 'Xúc Xắc Vàng Hoàng Gia', price: '500 Vàng', icon: '🎲', desc: 'Hiệu ứng phát sáng vàng khi đổ xúc xắc' },
    { name: 'Bộ Quân Cờ Thép Hiệp Sĩ', price: '1,200 Vàng', icon: '🏰', desc: 'Mô hình nhà và thành phố phong cách hiệp sĩ trung cổ' },
    { name: 'Khung Avatar Rồng Lửa', price: '800 Vàng', icon: '🐉', desc: 'Khung avatar động bao quanh chân dung' },
    { name: 'Gói Thẻ Catan Cổ Điển 1995', price: '1,500 Vàng', icon: '📜', desc: 'Phong cách vẽ tay cổ điển kỷ niệm 30 năm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan">
      <div className="bg-wood-pattern bg-cover border-4 border-catan-gold-trim rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-catan-parchment">
        <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-catan-dark-wood bg-black/40 relative z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-catan-gold-trim" />
            <h2 className="text-xl font-black text-catan-gold-trim tracking-wider">CỬA HÀNG THƯƠNG NHÂN</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/40 text-catan-parchment"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 max-h-[70vh] overflow-y-auto">
          {items.map((it, idx) => (
            <div key={idx} className="flex flex-col justify-between p-3.5 rounded-xl bg-black/50 border-2 border-catan-dark-wood hover:border-catan-gold-trim transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-lg bg-catan-dark-wood border border-catan-gold-trim/40">{it.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-catan-parchment group-hover:text-catan-gold-trim transition-colors">{it.name}</h4>
                  <p className="text-[10px] text-catan-parchment/60 font-sans leading-tight mt-0.5">{it.desc}</p>
                </div>
              </div>
              <button className="mt-3 w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-catan-dark-wood font-black text-xs border border-catan-gold-trim shadow-sm">
                {it.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Quests Modal
export const QuestsModal: React.FC<ExtraModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const quests = [
    { title: 'Xây dựng 5 Ngôi Làng', progress: '3/5', reward: '100 EXP + 50 Vàng', done: false },
    { title: 'Chiến thắng 1 Trận Trực Tuyến', progress: '1/1', reward: '250 EXP + 120 Vàng', done: true },
    { title: 'Kích hoạt 3 Thẻ Phát Triển', progress: '2/3', reward: '150 EXP + 80 Vàng', done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan">
      <div className="bg-wood-pattern bg-cover border-4 border-catan-gold-trim rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-catan-parchment">
        <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-catan-dark-wood bg-black/40 relative z-10">
          <div className="flex items-center gap-2">
            <Scroll className="w-6 h-6 text-catan-gold-trim" />
            <h2 className="text-xl font-black text-catan-gold-trim tracking-wider">NHIỆM VỤ HẰNG NGÀY</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/40 text-catan-parchment"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex flex-col gap-3 relative z-10">
          {quests.map((q, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-black/50 border-2 border-catan-dark-wood">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-catan-parchment">{q.title}</span>
                <span className="text-[11px] text-catan-gold-trim font-sans mt-0.5">Thưởng: {q.reward}</span>
              </div>
              {q.done ? (
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md animate-pulse">
                  Nhận Thưởng
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-catan-dark-wood border border-catan-dark-wood text-xs font-mono font-bold text-catan-parchment/80">
                  {q.progress}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Friends Modal
export const FriendsModal: React.FC<ExtraModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const friends = [
    { name: 'Mai', status: 'Đang chơi trong phòng CAT688', online: true },
    { name: 'Nam', status: 'Trực tuyến (Ở sảnh)', online: true },
    { name: 'Linh', status: 'Offline 2 giờ trước', online: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan">
      <div className="bg-wood-pattern bg-cover border-4 border-catan-gold-trim rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-catan-parchment">
        <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-catan-dark-wood bg-black/40 relative z-10">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-catan-gold-trim" />
            <h2 className="text-xl font-black text-catan-gold-trim tracking-wider">DANH SÁCH BẠN BÈ</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/40 text-catan-parchment"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex flex-col gap-3 relative z-10">
          {friends.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-black/50 border-2 border-catan-dark-wood">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-catan-dark-wood border border-catan-gold-trim flex items-center justify-center font-bold">
                    {f.name.substring(0, 1)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${f.online ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-catan-parchment">{f.name}</span>
                  <span className="text-[10px] text-catan-parchment/60 font-sans">{f.status}</span>
                </div>
              </div>
              {f.online && (
                <button className="px-3 py-1 rounded-lg bg-catan-dark-wood hover:bg-catan-light-wood border border-catan-gold-trim text-xs font-bold text-catan-gold-trim">
                  Mời Chơi
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Inventory Modal
export const InventoryModal: React.FC<ExtraModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const items = [
    { name: 'Xúc Xắc Gỗ Mộc', type: 'Skin Xúc Xắc', icon: '🎲' },
    { name: 'Bộ Cờ Gỗ Cổ Điển', type: 'Mô Hình Quân Cờ', icon: '🏡' },
    { name: 'Avatar Người Khai Phá', type: 'Chân Dung', icon: '🧔' },
    { name: 'Hòm Báu Tân Thủ', type: 'Vật Phẩm Mở Được', icon: '📦' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-catan">
      <div className="bg-wood-pattern bg-cover border-4 border-catan-gold-trim rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-catan-parchment">
        <div className="absolute inset-0 shadow-inset-wood pointer-events-none" />
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-catan-dark-wood bg-black/40 relative z-10">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-catan-gold-trim" />
            <h2 className="text-xl font-black text-catan-gold-trim tracking-wider">HÒM ĐỒ CÁ NHÂN</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/40 text-catan-parchment"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3 relative z-10">
          {items.map((it, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/50 border-2 border-catan-dark-wood text-center">
              <span className="text-3xl mb-1">{it.icon}</span>
              <span className="font-bold text-xs text-catan-parchment">{it.name}</span>
              <span className="text-[10px] text-catan-parchment/60 font-sans">{it.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
