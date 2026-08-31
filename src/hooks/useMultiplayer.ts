'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '@/lib/catan/types';
import { GameAction } from '@/lib/catan/engine';
import { P2PManager, ConnectionStatus } from '@/lib/p2p/peerService';
import { PlayerProfile } from './usePlayerProfile';
import { soundEngine } from '@/lib/audio/soundEngine';

export function useMultiplayer(roomId: string, profile: PlayerProfile, isProfileLoaded: boolean) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isHost, setIsHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const p2pRef = useRef<P2PManager | null>(null);
  const lastStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    if (!isProfileLoaded || !roomId || !profile.id) return;

    const p2p = new P2PManager({
      onStateUpdate: (state) => {
        // Trigger sounds based on state transitions
        const prevState = lastStateRef.current;
        if (prevState) {
          if (state.lastDiceRoll && state.lastDiceRoll !== prevState.lastDiceRoll) {
            soundEngine.playDiceRoll();
          }
          if (state.winnerPlayerId && !prevState.winnerPlayerId) {
            soundEngine.playVictory();
          }
          if (state.phase === 'turn_robber_discard' && prevState.phase !== 'turn_robber_discard') {
            soundEngine.playRobber();
          }
        }
        lastStateRef.current = state;
        setGameState(state);
      },
      onStatusChange: (newStatus, isHostRole) => {
        setStatus(newStatus);
        setIsHost(isHostRole);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
    });

    p2pRef.current = p2p;
    p2p.init(roomId, profile);

    return () => {
      p2p.destroy();
    };
  }, [roomId, profile.id, isProfileLoaded]);

  const dispatch = useCallback((action: GameAction) => {
    if (p2pRef.current) {
      // Play local sound for immediate tactile feedback
      if (action.type === 'BUILD_ROAD' || action.type === 'BUILD_SETTLEMENT' || action.type === 'PLACE_INITIAL_ROAD' || action.type === 'PLACE_INITIAL_SETTLEMENT') {
        soundEngine.playBuildWood();
      } else if (action.type === 'UPGRADE_CITY') {
        soundEngine.playUpgradeCity();
      } else if (action.type === 'BUY_DEV_CARD' || action.type === 'EXECUTE_BANK_TRADE' || action.type === 'ACCEPT_TRADE_OFFER') {
        soundEngine.playResourceChime();
      } else {
        soundEngine.playClick();
      }
      p2pRef.current.sendAction(action);
    }
  }, []);

  return {
    gameState,
    status,
    isHost,
    errorMessage,
    dispatch,
  };
}
