import type PeerType from 'peerjs';
import type { DataConnection } from 'peerjs';
import { PeerMessage } from './messageProtocol';
import { GameState } from '../catan/types';
import { GameAction, gameReducer, createInitialGameState } from '../catan/engine';
import { PlayerProfile } from '@/hooks/usePlayerProfile';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface MultiplayerCallbacks {
  onStateUpdate: (state: GameState) => void;
  onStatusChange: (status: ConnectionStatus, isHost: boolean) => void;
  onError: (errorMsg: string) => void;
}

export class P2PManager {
  private peer: PeerType | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private isHost: boolean = false;
  private roomId: string = '';
  private profile: PlayerProfile | null = null;
  private currentState: GameState | null = null;
  private callbacks: MultiplayerCallbacks;
  private isDestroyed: boolean = false;

  constructor(callbacks: MultiplayerCallbacks) {
    this.callbacks = callbacks;
  }

  public async init(roomId: string, profile: PlayerProfile) {
    if (typeof window === 'undefined') return;
    this.roomId = roomId.toUpperCase().trim();
    this.profile = profile;
    this.isDestroyed = false;
    this.callbacks.onStatusChange('connecting', false);

    const Peer = (await import('peerjs')).default;
    const hostPeerId = `catan3d_room_${this.roomId}`;

    // Try becoming host first (standard for room creators)
    this.becomeHost(Peer, hostPeerId);
  }

  private becomeHost(Peer: any, hostPeerId: string) {
    if (this.isDestroyed) return;
    this.isHost = true;
    const hostPeer = new Peer(hostPeerId);

    hostPeer.on('open', () => {
      if (this.isDestroyed) {
        hostPeer.destroy();
        return;
      }
      this.peer = hostPeer;
      this.callbacks.onStatusChange('connected', true);

      // Create Initial Game State
      let initialState = createInitialGameState(this.roomId);
      if (this.profile) {
        initialState = gameReducer(initialState, {
          type: 'JOIN_ROOM',
          player: {
            id: this.profile.id,
            name: this.profile.name,
            color: this.profile.color,
            pieceStyle: this.profile.pieceStyle,
            avatarSeed: this.profile.avatar || this.profile.avatarSeed || 'alexander',
          },
        });
      }

      this.currentState = initialState;
      this.callbacks.onStateUpdate(this.currentState);
    });

    hostPeer.on('connection', (conn: DataConnection) => {
      this.connections.set(conn.peer, conn);

      conn.on('open', () => {
        // Send current state to newly joined client
        if (this.currentState) {
          conn.send({
            type: 'STATE_SYNC',
            state: this.currentState,
          } as PeerMessage);
        }
      });

      conn.on('data', (data: any) => {
        this.handleHostReceivedData(conn, data as PeerMessage);
      });

      conn.on('close', () => {
        this.connections.delete(conn.peer);
      });
    });

    hostPeer.on('error', (err: any) => {
      if (this.isDestroyed) return;
      if (err?.type === 'unavailable-id') {
        // Host ID is taken -> A host is already running! Connect as client!
        hostPeer.destroy();
        this.connectAsClient(Peer, hostPeerId);
        return;
      }
      console.error('Host Peer error:', err);
      this.callbacks.onError(`Room host error: ${err?.type || err}`);
    });
  }

  private connectAsClient(Peer: any, hostPeerId: string) {
    if (this.isDestroyed) return;
    this.isHost = false;
    const clientPeerId = `catan3d_client_${this.roomId}_${this.profile?.id || 'anon'}_${Math.random().toString(36).substring(2, 6)}`;
    const clientPeer = new Peer(clientPeerId);

    clientPeer.on('open', () => {
      if (this.isDestroyed) {
        clientPeer.destroy();
        return;
      }
      this.peer = clientPeer;
      const conn = clientPeer.connect(hostPeerId, { reliable: true });

      conn.on('open', () => {
        if (this.isDestroyed) return;
        this.hostConnection = conn;
        this.callbacks.onStatusChange('connected', false);

        // Send JOIN_ROOM action to host
        if (this.profile) {
          this.sendAction({
            type: 'JOIN_ROOM',
            player: {
              id: this.profile.id,
              name: this.profile.name,
              color: this.profile.color,
              pieceStyle: this.profile.pieceStyle,
              avatarSeed: this.profile.avatar || this.profile.avatarSeed || 'alexander',
            },
          });
        }
      });

      conn.on('data', (data: any) => {
        this.handleClientReceivedData(data as PeerMessage);
      });

      conn.on('close', () => {
        this.callbacks.onStatusChange('disconnected', false);
        this.callbacks.onError('Lost connection to host.');
      });

      conn.on('error', (err: any) => {
        console.warn('Client DataConnection error:', err);
      });
    });

    clientPeer.on('error', (err: any) => {
      if (this.isDestroyed) return;
      if (err?.type === 'peer-unavailable') {
        // Host does not exist, become host
        clientPeer.destroy();
        this.becomeHost(Peer, hostPeerId);
        return;
      }
      console.error('Client peer error:', err);
      this.callbacks.onError(`Client connection error: ${err?.type || err}`);
    });
  }

  private handleHostReceivedData(conn: DataConnection, msg: PeerMessage) {
    if (msg.type === 'CLIENT_ACTION') {
      if (this.currentState) {
        const nextState = gameReducer(this.currentState, msg.action);
        this.currentState = nextState;
        this.callbacks.onStateUpdate(this.currentState);
        this.broadcastState(this.currentState);
      }
    }
  }

  private handleClientReceivedData(msg: PeerMessage) {
    if (msg.type === 'STATE_SYNC') {
      this.currentState = msg.state;
      this.callbacks.onStateUpdate(this.currentState);
    }
  }

  public sendAction(action: GameAction) {
    if (this.isHost) {
      if (this.currentState) {
        const nextState = gameReducer(this.currentState, action);
        this.currentState = nextState;
        this.callbacks.onStateUpdate(this.currentState);
        this.broadcastState(this.currentState);
      }
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send({
          type: 'CLIENT_ACTION',
          action,
        } as PeerMessage);
      }
    }
  }

  private broadcastState(state: GameState) {
    const msg: PeerMessage = {
      type: 'STATE_SYNC',
      state,
    };
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
