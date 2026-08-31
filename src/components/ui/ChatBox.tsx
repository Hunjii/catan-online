'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GameState, ChatMessage, PlayerColor } from '@/lib/catan/types';
import { COLOR_MAP } from '../3d/Settlement3D';
import { MessageSquare, Send, Smile, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatBoxProps {
  gameState: GameState;
  currentUserId: string;
  onSendMessage: (message: ChatMessage) => void;
}

const QUICK_EMOTES = ['🎉', '🎲', '⚔️', '😭', '👏', '💰', '🏠', '👑', '🤝', '🔥'];

export const ChatBox: React.FC<ChatBoxProps> = ({
  gameState,
  currentUserId,
  onSendMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || !myPlayer) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      playerId: myPlayer.id,
      playerName: myPlayer.name,
      playerColor: myPlayer.color,
      text: content,
      timestamp: Date.now(),
      isEmote: Boolean(textToSend && QUICK_EMOTES.includes(textToSend)),
    };

    onSendMessage(newMsg);
    if (!textToSend) setInputText('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-auto select-none">
      {/* Minimized Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-850 backdrop-blur-md border border-slate-700 text-slate-100 shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold">Trò Chuyện</span>
          {gameState.messages.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {gameState.messages.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl w-80 sm:w-96 h-96 flex flex-col shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in text-slate-100">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Phòng Trò Chuyện Realtime</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 text-xs">
            {gameState.messages.length === 0 ? (
              <div className="text-center text-slate-500 my-auto text-[11px]">
                Chưa có tin nhắn nào. Hãy gửi lời chào đến các bạn chơi!
              </div>
            ) : (
              gameState.messages.map((msg) => {
                const isMe = msg.playerId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isMe ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold mb-0.5" style={{ color: COLOR_MAP[msg.playerColor] }}>
                        {msg.playerName}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        msg.isEmote
                          ? 'text-2xl bg-transparent p-0'
                          : isMe
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emotes Row */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto">
            {QUICK_EMOTES.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSend(emoji)}
                className="hover:scale-125 transition-transform text-sm p-1"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-2.5 border-t border-slate-800 bg-slate-950/70"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tin nhắn..."
              maxLength={120}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
