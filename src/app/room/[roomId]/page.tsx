'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { LeaderboardModal } from '@/components/ui/LeaderboardModal';
import {
  Loader2,
  Menu,
  BookOpen,
  BarChart3,
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
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  if (!isProfileLoaded || !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4 font-catan p-4">
        {errorMessage ? (
          <div className="text-center max-w-md bg-slate-900/90 border border-red-500/40 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-2">Connection Failed</h2>
            <p className="text-xs text-slate-300 font-sans mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-sans text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-lg"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-catan-gold-trim">Connecting to room {roomId}...</h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Establishing serverless P2P WebRTC network</p>
            </div>
          </>
        )}
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
          userAvatar={profile.avatar}
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
    <div className="ingame-shell relative min-h-screen w-screen overflow-hidden select-none font-catan">
      {/* 1. CENTRAL BOARD STAGE */}
      <div className="absolute inset-x-0 bottom-24 top-16 z-10 sm:inset-x-[6%] lg:inset-x-[14%] lg:bottom-22 lg:top-14">
        <Board2D
          gameState={gameState}
          currentUserId={profile.id}
          buildMode={buildMode}
          onSelectVertex={handleSelectVertex}
          onSelectEdge={handleSelectEdge}
          onSelectHex={handleSelectHex}
        />
      </div>

      {/* 2. TOP NAVIGATION */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3 sm:p-4">
        {/* Left: CATAN Brand Logo */}
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 select-none">
          <div className="relative w-9 sm:w-11 aspect-[333/450] shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]">
            <Image
              src="/assets/header/header_banner_c.png"
              alt="Catan Banner"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff3b0] via-[#e5b84c] to-[#966318] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-serif">
            CATAN
          </span>
        </div>

        {/* Center: Turn & Phase Status Banner */}
        <div className="pointer-events-auto absolute left-1/2 top-2 sm:top-3 -translate-x-1/2 z-40 w-[min(92vw,30rem)]">
          <TurnStatusBanner gameState={gameState} currentUserId={profile.id} />
        </div>

        {/* Right: 4 Action Buttons using dedicated assets */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsRulebookOpen(true)}
            className="relative h-11 w-11 sm:h-12 sm:w-12 hover:scale-105 active:scale-95 transition-transform duration-150 drop-shadow-md cursor-pointer shrink-0"
            title="Tra cứu luật chơi (Rulebook)"
          >
            <Image
              src="/assets/ingame/ingame_action_rulebook_button.png"
              alt="Rulebook"
              fill
              className="object-contain"
            />
          </button>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="relative h-11 w-11 sm:h-12 sm:w-12 hover:scale-105 active:scale-95 transition-transform duration-150 drop-shadow-md cursor-pointer shrink-0"
            title="Bảng xếp hạng / Thống kê (Leaderboard)"
          >
            <Image
              src="/assets/ingame/ingame_action_stats_button.png"
              alt="Leaderboard"
              fill
              className="object-contain"
            />
          </button>
          <button
            onClick={() => setIsRulebookOpen(true)}
            className="relative h-11 w-11 sm:h-12 sm:w-12 hover:scale-105 active:scale-95 transition-transform duration-150 drop-shadow-md cursor-pointer shrink-0"
            title="Trợ giúp (Help)"
          >
            <Image
              src="/assets/ingame/ingame_action_help_button.png"
              alt="Help"
              fill
              className="object-contain"
            />
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="relative h-11 w-11 sm:h-12 sm:w-12 hover:scale-105 active:scale-95 transition-transform duration-150 drop-shadow-md cursor-pointer shrink-0"
            title="Cài đặt / Hồ sơ (Settings)"
          >
            <Image
              src="/assets/ingame/ingame_action_settings_button.png"
              alt="Settings"
              fill
              className="object-contain"
            />
          </button>
        </div>
      </header>

      {/* 3. LEFT COLUMN: players + chat */}
      <div className="pointer-events-none absolute bottom-3 left-3 top-20 z-30 flex w-[min(21rem,calc(100vw-1.5rem))] flex-col justify-between sm:bottom-4 sm:left-4 sm:w-80 md:w-[21.5rem] lg:w-[22.5rem]">
        {/* Middle: 4 Players Pods (Vertically Centered on Left) */}
        <div className="pointer-events-auto my-auto py-1">
          <PlayerDashboard gameState={gameState} currentUserId={profile.id} />
        </div>

        {/* Bottom: Activity Log & Chat Box (Anchored at Bottom-Left) */}
        <div className="pointer-events-auto mt-auto">
          <ChatBox
            gameState={gameState}
            currentUserId={profile.id}
            onSendMessage={(msg) => dispatch({ type: 'SEND_CHAT', message: msg })}
          />
        </div>
      </div>

      {/* 4. RIGHT COLUMN: action stack + dice */}
      <div className="pointer-events-none absolute bottom-3 right-3 top-20 z-30 flex w-[min(19rem,calc(100vw-1.5rem))] flex-col justify-between sm:bottom-4 sm:right-4 sm:w-72 md:w-80">
        <div className="pointer-events-auto flex h-full w-full flex-col justify-between">
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

      {/* 5. BOTTOM CENTER: resource hand */}
      <div className="pointer-events-auto absolute bottom-1 left-1/2 z-40 flex w-[min(58vw,58rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 justify-center px-1 sm:bottom-2">
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

      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />

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
