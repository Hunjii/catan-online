'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GameState, ChatMessage, COLOR_MAP } from '@/lib/catan/types';

interface ChatBoxProps {
  gameState: GameState;
  currentUserId: string;
  onSendMessage: (message: ChatMessage) => void;
}

const CHAT_PLAYER_COLORS: Record<string, string> = {
  red: '#f87171',
  blue: '#38bdf8',
  green: '#4ade80',
  yellow: '#fde047',
  orange: '#fb923c',
  brown: '#d6d3d1',
  white: '#f8fafc',
  purple: '#c084fc',
};

export const ChatBox: React.FC<ChatBoxProps> = ({
  gameState,
  currentUserId,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages, gameState.logs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || !myPlayer) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      playerId: myPlayer.id,
      playerName: myPlayer.name,
      playerColor: myPlayer.color,
      text: content,
      timestamp: Date.now(),
    };

    onSendMessage(newMsg);
    setInputText('');
  };

  // Combine logs and chat messages sorted by timestamp
  const combinedEntries = [
    ...(gameState.logs || []).map((l) => ({
      id: l.id,
      text: l.text,
      timestamp: l.timestamp,
      color: '#e5b84c',
      isLog: true,
      playerName: gameState.players.find((p) => p.id === l.playerId)?.name,
    })),
    ...(gameState.messages || []).map((m) => ({
      id: m.id,
      text: m.text,
      timestamp: m.timestamp,
      color: CHAT_PLAYER_COLORS[m.playerColor] || COLOR_MAP[m.playerColor] || '#38bdf8',
      isLog: false,
      playerName: m.playerName,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex h-44 sm:h-48 max-h-[26vh] w-full flex-col justify-between rounded-2xl bg-[#140d07]/92 p-2.5 sm:p-3 border border-[#442c16]/90 shadow-[0_12px_28px_rgba(0,0,0,0.75)] backdrop-blur-md select-none font-catan pointer-events-auto">
      {/* Messages & Logs Feed */}
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-1.5 py-1 ingame-scrollbar">
        {combinedEntries.length === 0 ? (
          <div className="my-auto text-center font-vietnam text-xs text-stone-400/70">
            Trận đấu đã bắt đầu! Chúc các bạn chơi vui vẻ.
          </div>
        ) : (
          combinedEntries.slice(-25).map((entry) => (
            <div key={entry.id} className="leading-snug text-xs sm:text-[13px] font-vietnam">
              {entry.isLog ? (
                // 1. GAME SYSTEM LOG
                <div>
                  <span className="font-bold text-[#e5b84c] mr-1.5">Game:</span>
                  <span className="text-[#f3d38c] font-medium">{entry.text}</span>
                </div>
              ) : (
                // 2. PLAYER CHAT MESSAGE
                <div>
                  <span className="font-semibold mr-1.5" style={{ color: entry.color }}>
                    {entry.playerName}:
                  </span>
                  <span className="text-stone-200">{entry.text}</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Divider */}
      <div className="border-t border-[#352010]/80 mt-1 pt-1.5">
        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="flex items-center rounded-xl border border-[#3e2714]/90 bg-[#120a05] px-2.5 py-1 gap-2 focus-within:border-[#9c7128]/80 transition-colors shadow-inner"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            maxLength={120}
            className="flex-1 bg-transparent font-vietnam text-xs sm:text-[13px] text-stone-200 placeholder:text-[#8a6845] outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-7 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1e130a] border border-[#3e2714] hover:bg-[#2e1d0f] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            title="Gửi tin nhắn"
          >
            <div className="relative h-4 w-4">
              <Image
                src="/assets/ingame/ingame_icon_send.svg"
                alt="Send"
                fill
                className="object-contain"
              />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};
