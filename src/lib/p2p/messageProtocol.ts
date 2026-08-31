import { GameAction } from '../catan/engine';
import { GameState } from '../catan/types';

export type PeerMessage =
  | { type: 'CLIENT_ACTION'; action: GameAction }
  | { type: 'STATE_SYNC'; state: GameState }
  | { type: 'HEARTBEAT'; timestamp: number }
  | { type: 'ERROR'; message: string };
