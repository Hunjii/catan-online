'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GameState, ChatMessage, COLOR_MAP } from '@/lib/catan/types';
import { Send, Sparkles } from 'lucide-react';

interface ChatBoxProps {
  gameState: GameState;
  currentUserId: string;
  onSendMessage: (message: ChatMessage) => void;
}

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
      color: l.playerId
        ? COLOR_MAP[gameState.players.find((p) => p.id === l.playerId)?.color || 'red']
        : '#f59e0b',
      isLog: true,
      playerName: gameState.players.find((p) => p.id === l.playerId)?.name,
    })),
    ...(gameState.messages || []).map((m) => ({
      id: m.id,
      text: m.text,
      timestamp: m.timestamp,
      color: COLOR_MAP[m.playerColor],
      isLog: false,
      playerName: m.playerName,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="w-full h-36 sm:h-44 max-h-[24vh] bg-black/80 border-2 border-catan-gold-trim/70 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden pointer-events-auto select-none font-catan">
      
      {/* Logs & Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 text-xs sm:text-sm font-sans">
        {combinedEntries.length === 0 ? (
          <div className="text-catan-parchment/60 my-auto text-center text-xs">
            Trận đấu đã bắt đầu! Chúc các bạn chơi vui vẻ.
          </div>
        ) : (
          combinedEntries.slice(-15).map((entry) => (
            <div key={entry.id} className="leading-snug">
              {entry.playerName ? (
                <span
                  className="font-black mr-1.5"
                  style={{ color: entry.color }}
                >
                  {entry.playerName}
                </span>
              ) : null}
              <span
                className={
                  entry.isLog
                    ? 'text-catan-parchment/90 font-medium'
                    : 'text-white font-bold bg-white/10 px-1.5 py-0.5 rounded'
                }
              >
                {entry.isLog && entry.playerName
                  ? entry.text.replace(entry.playerName, '').trim()
                  : entry.text}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-1.5 p-2 bg-black/80 border-t border-catan-gold-trim/40"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          maxLength={100}
          className="flex-1 bg-black/60 border border-catan-gold-trim/50 focus:border-catan-gold-trim rounded-xl px-3 py-1.5 text-xs text-catan-parchment placeholder:text-catan-parchment/40 outline-none font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-xl bg-catan-gold-trim/90 hover:bg-catan-gold-trim text-black flex items-center justify-center disabled:opacity-40 shadow-sm transition-transform active:scale-90"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
