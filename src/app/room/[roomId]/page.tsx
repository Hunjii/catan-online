'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { LobbyRoom } from '@/components/ui/LobbyRoom';
import { CatanScene } from '@/components/3d/CatanScene';
import { PlayerDashboard } from '@/components/ui/PlayerDashboard';
import { ActionPanel } from '@/components/ui/ActionPanel';
import { TradeModal } from '@/components/ui/TradeModal';
import { DevCardModal } from '@/components/ui/DevCardModal';
import { RobberModal } from '@/components/ui/RobberModal';
import { RulebookModal } from '@/components/ui/RulebookModal';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { ChatBox } from '@/components/ui/ChatBox';
import { VictoryModal } from '@/components/ui/VictoryModal';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export default function GameRoomPage() {
  const params = useParams();
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Đang kết nối phòng {roomId}...</h2>
          <p className="text-xs text-slate-400 mt-1">Đang thiết lập mạng P2P WebRTC serverless</p>
        </div>
      </div>
    );
  }

  // 1. Lobby Phase
  if (gameState.phase === 'lobby') {
    return (
      <div className="relative min-h-screen bg-slate-950 overflow-hidden">
        {/* Connection Badge */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs">
          {status === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-medium">Đã kết nối {isHost ? '(Host)' : '(Client)'}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-medium">{status}...</span>
            </>
          )}
        </div>

        <LobbyRoom
          gameState={gameState}
          currentUserId={profile.id}
          isHost={isHost}
          roomId={roomId}
          onStartGame={() => dispatch({ type: 'START_GAME' })}
          onSetReady={(ready) => dispatch({ type: 'SET_READY', playerId: profile.id, isReady: ready })}
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
        <RulebookModal isOpen={isRulebookOpen} onClose={() => setIsRulebookOpen(false)} />
      </div>
    );
  }

  // 2. Active Game Phase (3D Canvas + HUD)
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
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Catan Scene */}
      <CatanScene
        gameState={gameState}
        currentUserId={profile.id}
        buildMode={buildMode}
        onSelectVertex={handleSelectVertex}
        onSelectEdge={handleSelectEdge}
        onSelectHex={handleSelectHex}
      />

      {/* Top and Bottom Player Dashboard HUD */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
        <PlayerDashboard gameState={gameState} currentUserId={profile.id} />
      </div>

      {/* Floating Action Controls */}
      <div className="absolute bottom-24 sm:bottom-28 left-0 right-0 z-30 pointer-events-none">
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

      {/* Real-time Chat Box */}
      <ChatBox
        gameState={gameState}
        currentUserId={profile.id}
        onSendMessage={(msg) => dispatch({ type: 'SEND_CHAT', message: msg })}
      />

      {/* Interactive Modals */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        gameState={gameState}
        currentUserId={profile.id}
        onExecuteBankTrade={(give, count, get) => {
          dispatch({ type: 'EXECUTE_BANK_TRADE', playerId: profile.id, give, giveCount: count, get });
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
