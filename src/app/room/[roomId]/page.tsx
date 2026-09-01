'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { LobbyRoom } from '@/components/ui/LobbyRoom';
import { Board2D } from '@/components/2d/Board2D';
import { PlayerDashboard } from '@/components/ui/PlayerDashboard';
import { PlayerHand } from '@/components/ui/PlayerHand';
import { ActionPanel } from '@/components/ui/ActionPanel';
import { TradeModal } from '@/components/ui/TradeModal';
import { DevCardModal } from '@/components/ui/DevCardModal';
import { RobberModal } from '@/components/ui/RobberModal';
import { RulebookModal } from '@/components/ui/RulebookModal';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { ChatBox } from '@/components/ui/ChatBox';
import { VictoryModal } from '@/components/ui/VictoryModal';
import { TurnStatusBanner } from '@/components/ui/TurnStatusBanner';
import {
  Loader2,
  Wifi,
  WifiOff,
  Menu,
  Dices,
  HelpCircle,
  Settings,
} from 'lucide-react';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = (params.roomId as string)?.toUpperCase() || 'DEFAULT';

  const { profile, updateProfile, isLoaded: isProfileLoaded } = usePlayerProfile();
  const { gameState, status, isHost, errorMessage, dispatch } = useMultiplayer(
    roomId,
    profile,
    isProfileLoaded
  );

  // UI Local Modals State
  const [buildMode, setBuildMode] = useState<'none' | 'road' | 'settlement' | 'city'>('none');
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isDevCardsOpen, setIsDevCardsOpen] = useState(false);
  const [isRulebookOpen, setIsRulebookOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!isProfileLoaded || !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4 font-catan">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-catan-gold-trim">Đang kết nối phòng {roomId}...</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Đang thiết lập mạng P2P WebRTC serverless</p>
        </div>
      </div>
    );
  }

  // 1. Lobby Phase
  if (gameState.phase === 'lobby') {
    return (
      <div className="relative min-h-screen bg-slate-950 overflow-hidden font-catan">
        <LobbyRoom
          gameState={gameState}
          currentUserId={profile.id}
          isHost={isHost}
          status={status}
          roomId={roomId}
          onStartGame={() => dispatch({ type: 'START_GAME' })}
          onSetReady={(ready) =>
            dispatch({ type: 'SET_READY', playerId: profile.id, isReady: ready })
          }
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenRulebook={() => setIsRulebookOpen(true)}
        />

        {/* Modals */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onSave={(updated) => {
            updateProfile(updated);
            dispatch({
              type: 'UPDATE_PROFILE',
              playerId: profile.id,
              name: updated.name || profile.name,
              color: updated.color || profile.color,
              pieceStyle: updated.pieceStyle || profile.pieceStyle,
            });
          }}
        />
        <RulebookModal
          isOpen={isRulebookOpen}
          onClose={() => setIsRulebookOpen(false)}
        />
      </div>
    );
  }

  // 2. Active Game Phase (Full 100vw/100vh Canvas + Floating Transparent HUD)
  const handleSelectVertex = (vertexId: string) => {
    if (gameState.phase === 'setup_round_1' || gameState.phase === 'setup_round_2') {
      if (gameState.setupSubStep === 'place_settlement') {
        dispatch({ type: 'PLACE_INITIAL_SETTLEMENT', playerId: profile.id, vertexId });
      }
    } else if (gameState.phase === 'turn_actions') {
      if (buildMode === 'settlement') {
        dispatch({ type: 'BUILD_SETTLEMENT', playerId: profile.id, vertexId });
        setBuildMode('none');
      } else if (buildMode === 'city') {
        dispatch({ type: 'UPGRADE_CITY', playerId: profile.id, vertexId });
        setBuildMode('none');
      }
    }
  };

  const handleSelectEdge = (edgeId: string) => {
    if (gameState.phase === 'setup_round_1' || gameState.phase === 'setup_round_2') {
      if (gameState.setupSubStep === 'place_road') {
        dispatch({ type: 'PLACE_INITIAL_ROAD', playerId: profile.id, edgeId });
      }
    } else if (gameState.phase === 'turn_actions') {
      if (buildMode === 'road' || gameState.roadBuildingRoadsRemaining > 0) {
        dispatch({ type: 'BUILD_ROAD', playerId: profile.id, edgeId });
        if (gameState.roadBuildingRoadsRemaining <= 1) {
          setBuildMode('none');
        }
      }
    }
  };

  const handleSelectHex = (hexId: number) => {
    if (gameState.phase === 'turn_robber_move') {
      dispatch({ type: 'MOVE_ROBBER', playerId: profile.id, hexId });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-catan">
      
      {/* Realistic Deep Blue Ocean Water Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/bg_ocean.jpg"
          alt="Ocean Background"
          fill
          className="object-cover object-center scale-105"
          priority
        />
        {/* Soft Ambient Depth Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* 1. FULLSCREEN 2D BOARD CANVAS (100% width & height with Pan & Zoom) */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Board2D
          gameState={gameState}
          currentUserId={profile.id}
          buildMode={buildMode}
          onSelectVertex={handleSelectVertex}
          onSelectEdge={handleSelectEdge}
          onSelectHex={handleSelectHex}
        />
      </div>

      {/* 2. FLOATING TRANSPARENT TOP HEADER */}
      <header className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        {/* Top Left: Hamburger + CATAN Logo Box */}
        <div className="flex items-center gap-4 px-5 py-3 sm:px-6 sm:py-3.5 rounded-3xl bg-black/85 border-3 border-catan-gold-trim shadow-[0_15px_35px_rgba(0,0,0,0.7)] backdrop-blur-xl pointer-events-auto">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-2xl text-catan-gold-trim hover:bg-white/15 hover:scale-115 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
            title="Menu Chính / Về Trang Chủ"
          >
            <Menu className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
          </button>
          <div className="w-0.5 h-8 bg-catan-gold-trim/50" />
          <span className="font-black text-3xl sm:text-4xl tracking-widest text-catan-gold-trim drop-shadow-md pr-2">
            CATAN
          </span>
        </div>

        {/* Top Right: 3 Big Action Badges */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          {/* Dice stats icon */}
          <button
            onClick={() => dispatch({ type: 'ROLL_DICE', playerId: profile.id })}
            className="w-15 h-15 sm:w-17 sm:h-17 rounded-3xl bg-black/85 border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim hover:bg-white/15 hover:scale-110 active:scale-95 transition-all shadow-2xl cursor-pointer"
            title="Đổ Xúc Xắc"
          >
            <Dices className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
          </button>

          {/* Rules / Help icon */}
          <button
            onClick={() => setIsRulebookOpen(true)}
            className="w-15 h-15 sm:w-17 sm:h-17 rounded-3xl bg-black/85 border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim hover:bg-white/15 hover:scale-110 active:scale-95 transition-all shadow-2xl cursor-pointer"
            title="Tra Cứu Luật Chơi"
          >
            <HelpCircle className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
          </button>

          {/* Settings gear icon */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-15 h-15 sm:w-17 sm:h-17 rounded-3xl bg-black/85 border-3 border-catan-gold-trim flex items-center justify-center text-catan-gold-trim hover:bg-white/15 hover:scale-110 active:scale-95 transition-all shadow-2xl cursor-pointer"
            title="Cài Đặt / Hồ Sơ"
          >
            <Settings className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* 2.5. Persistent turn context: keeps the next action visible without opening a modal */}
      <div className="absolute left-1/2 top-[4.75rem] z-30 w-[min(92vw,34rem)] -translate-x-1/2 sm:top-[5.25rem]">
        <TurnStatusBanner gameState={gameState} currentUserId={profile.id} />
      </div>

      {/* 3. FLOATING LEFT COLUMN: Players List (Middle) & Chat (Bottom-Left) */}
      <div className="absolute left-3 sm:left-4 top-16 bottom-3 sm:bottom-4 w-64 sm:w-72 md:w-80 flex flex-col justify-between pointer-events-none z-20">
        {/* Middle: 4 Players Pods (Vertically Centered on Left) */}
        <div className="my-auto py-1 pointer-events-auto">
          <PlayerDashboard gameState={gameState} currentUserId={profile.id} />
        </div>

        {/* Bottom: Activity Log & Chat Box (Anchored at Bottom-Left) */}
        <div className="mt-auto pointer-events-auto">
          <ChatBox
            gameState={gameState}
            currentUserId={profile.id}
            onSendMessage={(msg) => dispatch({ type: 'SEND_CHAT', message: msg })}
          />
        </div>
      </div>

      {/* 4. FLOATING RIGHT COLUMN: Actions, Resources & Dice Bowl */}
      <div className="absolute right-3 sm:right-4 top-16 bottom-3 sm:bottom-4 w-64 sm:w-72 md:w-80 flex flex-col justify-between pointer-events-none z-20">
        <div className="w-full h-full flex flex-col justify-between pointer-events-auto">
          <ActionPanel
            gameState={gameState}
            currentUserId={profile.id}
            buildMode={buildMode}
            setBuildMode={setBuildMode}
            onRollDice={() => dispatch({ type: 'ROLL_DICE', playerId: profile.id })}
            onBuyDevCard={() => dispatch({ type: 'BUY_DEV_CARD', playerId: profile.id })}
            onEndTurn={() => dispatch({ type: 'END_TURN', playerId: profile.id })}
            onOpenTrade={() => setIsTradeOpen(true)}
            onOpenDevCards={() => setIsDevCardsOpen(true)}
            onOpenRulebook={() => setIsRulebookOpen(true)}
          />
        </div>
      </div>

      {/* 5. FLOATING BOTTOM CENTER: Player's Resource Cards Hand */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-4xl flex justify-center px-4">
        <PlayerHand
          gameState={gameState}
          currentUserId={profile.id}
          onOpenDevCards={() => setIsDevCardsOpen(true)}
        />
      </div>

      {/* INTERACTIVE MODALS */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        gameState={gameState}
        currentUserId={profile.id}
        onExecuteBankTrade={(give, count, get) => {
          dispatch({
            type: 'EXECUTE_BANK_TRADE',
            playerId: profile.id,
            give,
            giveCount: count,
            get,
          });
          setIsTradeOpen(false);
        }}
        onCreateTradeOffer={(giving, requesting) => {
          dispatch({ type: 'CREATE_TRADE_OFFER', playerId: profile.id, giving, requesting });
        }}
        onAcceptTradeOffer={(offerId) => {
          dispatch({ type: 'ACCEPT_TRADE_OFFER', playerId: profile.id, offerId });
          setIsTradeOpen(false);
        }}
        onCancelTradeOffer={() => {
          dispatch({ type: 'CANCEL_TRADE_OFFER', playerId: profile.id });
        }}
      />

      <DevCardModal
        isOpen={isDevCardsOpen}
        onClose={() => setIsDevCardsOpen(false)}
        gameState={gameState}
        currentUserId={profile.id}
        onPlayDevCard={(card, extraData) => {
          dispatch({ type: 'PLAY_DEV_CARD', playerId: profile.id, card, extraData });
        }}
      />

      <RobberModal
        gameState={gameState}
        currentUserId={profile.id}
        onSubmitDiscard={(discarded) => {
          dispatch({ type: 'SUBMIT_DISCARD', playerId: profile.id, discardedResources: discarded });
        }}
        onStealResource={(victimPlayerId) => {
          dispatch({ type: 'STEAL_RESOURCE', playerId: profile.id, victimPlayerId });
        }}
      />

      <RulebookModal isOpen={isRulebookOpen} onClose={() => setIsRulebookOpen(false)} />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={(updated) => {
          updateProfile(updated);
          dispatch({
            type: 'UPDATE_PROFILE',
            playerId: profile.id,
            name: updated.name || profile.name,
            color: updated.color || profile.color,
            pieceStyle: updated.pieceStyle || profile.pieceStyle,
          });
        }}
      />

      <VictoryModal
        gameState={gameState}
        onRestartGame={() => dispatch({ type: 'START_GAME' })}
      />
    </div>
  );
}
