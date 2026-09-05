export type ResourceType = 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';

export type HexTerrain = 'forest' | 'hills' | 'pasture' | 'fields' | 'mountains' | 'desert';

export type DevCardType = 'knight' | 'victory_point' | 'road_building' | 'year_of_plenty' | 'monopoly';

export type PortType =
  | 'generic_3_1'
  | 'wood_2_1'
  | 'brick_2_1'
  | 'sheep_2_1'
  | 'wheat_2_1'
  | 'ore_2_1';

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'brown' | 'white' | 'purple';

export const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#e11d48',
  blue: '#0284c7',
  green: '#16a34a',
  yellow: '#eab308',
  orange: '#ea580c',
  brown: '#78350f',
  white: '#f8fafc',
  purple: '#9333ea',
};

export type AvatarId = 'alexander' | 'elara' | 'magnus' | 'lyra';

export type TileSetStyle = 'classic' | 'art_nouveau' | 'viking' | 'fantasy';

export type PieceStyle = 'classic_wood' | 'medieval' | 'modern';

export interface ResourceCost {
  wood?: number;
  brick?: number;
  sheep?: number;
  wheat?: number;
  ore?: number;
}

export const BUILDING_COSTS: Record<'road' | 'settlement' | 'city' | 'devCard', Record<ResourceType, number>> = {
  road: { wood: 1, brick: 1, sheep: 0, wheat: 0, ore: 0 },
  settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1, ore: 0 },
  city: { wood: 0, brick: 0, sheep: 0, wheat: 2, ore: 3 },
  devCard: { wood: 0, brick: 0, sheep: 1, wheat: 1, ore: 1 },
};

export interface HexCoordinate {
  q: number;
  r: number;
  s: number; // q + r + s = 0
}

export interface HexTile {
  id: number;
  coord: HexCoordinate;
  terrain: HexTerrain;
  resource: ResourceType | null;
  numberToken: number | null;
  hasRobber: boolean;
  center: { x: number; z: number };
}

export interface Vertex {
  id: string; // Unique string identifier e.g. "v_0_1"
  hexIndices: number[]; // Index of adjacent hex tiles (1 to 3 hexes)
  adjacentVertexIds: string[]; // 2 to 3 adjacent vertices
  adjacentEdgeIds: string[]; // 2 to 3 adjacent edges
  position: { x: number; y: number; z: number };
  building: {
    type: 'settlement' | 'city';
    playerId: string;
    color?: PlayerColor;
  } | null;
  port: {
    type: PortType;
    ratio: number;
    resource: ResourceType | null;
  } | null;
}

export interface Edge {
  id: string; // Unique string identifier e.g. "e_0_1"
  vertexIds: [string, string]; // Exactly 2 endpoint vertices
  hexIndices: number[]; // Adjacent 1 or 2 hexes
  position: { x: number; y: number; z: number };
  rotationY: number; // Angle for 3D road placement
  road: {
    playerId: string;
    color?: PlayerColor;
  } | null;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  pieceStyle: PieceStyle;
  avatarSeed: string;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;

  // Inventory
  resources: Record<ResourceType, number>;
  devCards: DevCardType[];
  newDevCardsBoughtThisTurn: DevCardType[];
  playedKnights: number;

  // Inventory pieces remaining
  roadsLeft: number; // Start with 15
  settlementsLeft: number; // Start with 5
  citiesLeft: number; // Start with 4

  // Achievements & Points
  victoryPoints: number; // Total (including hidden VP cards)
  publicVictoryPoints: number; // Visible to opponents
  hasLongestRoad: boolean;
  hasLargestArmy: boolean;
  longestRoadLength: number;
}

export type GamePhase =
  | 'lobby'
  | 'setup_round_1' // Settlement 1 -> Road 1
  | 'setup_round_2' // Settlement 2 -> Road 2 (+ grant initial resources)
  | 'turn_roll_dice'
  | 'turn_robber_discard' // When 7 is rolled and players with >7 cards must discard
  | 'turn_robber_move' // Active player places Robber on a new hex
  | 'turn_robber_steal' // Active player selects a player adjacent to new hex to steal from
  | 'turn_actions' // Main trading and building
  | 'game_over';

export type SetupSubStep = 'place_settlement' | 'place_road';

export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  giving: Record<ResourceType, number>;
  requesting: Record<ResourceType, number>;
  status: 'open' | 'accepted' | 'rejected' | 'cancelled';
  acceptedByPlayerId?: string;
}

export interface DiscardStatus {
  [playerId: string]: {
    requiredCount: number;
    hasDiscarded: boolean;
  };
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  playerId?: string;
  text: string;
  type: 'system' | 'roll' | 'build' | 'trade' | 'robber' | 'dev_card' | 'victory' | 'chat';
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: PlayerColor;
  text: string;
  timestamp: number;
  isEmote?: boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  playerOrder: string[]; // Array of playerIds in turn sequence
  activePlayerIndex: number; // Index in playerOrder

  phase: GamePhase;
  setupSubStep: SetupSubStep;
  setupLastPlacedVertexId: string | null;
  turnNumber: number;

  // Board
  hexes: HexTile[];
  vertices: Vertex[];
  edges: Edge[];
  robberHexId: number;

  // Dice & Roll
  lastDiceRoll: [number, number] | null;
  isDiceRolling: boolean;

  // 7-Roll Robber State
  discardStatus: DiscardStatus;
  robberMovedToHexId: number | null;
  stealingEligiblePlayerIds: string[];

  // Development Cards
  devCardDeck: DevCardType[];
  hasPlayedDevCardThisTurn: boolean;
  roadBuildingRoadsRemaining: number; // 2 or 1 when Road Building card is active

  // Special Titles
  longestRoadPlayerId: string | null;
  longestRoadLength: number;
  largestArmyPlayerId: string | null;
  largestArmyCount: number;

  // Robber Steal Event Notification
  lastStealEvent: StealEvent | null;

  // Trading
  currentTradeOffer: TradeOffer | null;

  // Logs & Chat
  logs: GameLogEntry[];
  messages: ChatMessage[];

  // Winner
  winnerPlayerId: string | null;
}

export interface StealEvent {
  id: string;
  thiefId: string;
  victimId: string;
  resource: ResourceType;
  timestamp: number;
}
