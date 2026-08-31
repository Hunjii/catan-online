import {
  GameState,
  Player,
  ResourceType,
  DevCardType,
  BUILDING_COSTS,
  GameLogEntry,
  ChatMessage,
  PlayerColor,
  PieceStyle,
} from './types';
import { generateBoard } from './board';
import { calculateLongestRoadForPlayer, evaluateLongestRoad } from './longestRoad';
import { createDevCardDeck } from './devCards';
import { getPlayerTradeRatios, hasEnoughResources } from './trade';

export type GameAction =
  | { type: 'JOIN_ROOM'; player: Partial<Player> & { id: string; name: string } }
  | { type: 'LEAVE_ROOM'; playerId: string }
  | { type: 'UPDATE_PROFILE'; playerId: string; name: string; color: PlayerColor; pieceStyle: PieceStyle }
  | { type: 'SET_READY'; playerId: string; isReady: boolean }
  | { type: 'START_GAME'; randomizeBoard?: boolean }
  | { type: 'PLACE_INITIAL_SETTLEMENT'; playerId: string; vertexId: string }
  | { type: 'PLACE_INITIAL_ROAD'; playerId: string; edgeId: string }
  | { type: 'ROLL_DICE'; playerId: string; forcedRoll?: [number, number] }
  | { type: 'SUBMIT_DISCARD'; playerId: string; discardedResources: Partial<Record<ResourceType, number>> }
  | { type: 'MOVE_ROBBER'; playerId: string; hexId: number }
  | { type: 'STEAL_RESOURCE'; playerId: string; victimPlayerId: string }
  | { type: 'BUILD_ROAD'; playerId: string; edgeId: string }
  | { type: 'BUILD_SETTLEMENT'; playerId: string; vertexId: string }
  | { type: 'UPGRADE_CITY'; playerId: string; vertexId: string }
  | { type: 'BUY_DEV_CARD'; playerId: string }
  | { type: 'PLAY_DEV_CARD'; playerId: string; card: DevCardType; extraData?: any }
  | { type: 'EXECUTE_BANK_TRADE'; playerId: string; give: ResourceType; giveCount: number; get: ResourceType }
  | { type: 'CREATE_TRADE_OFFER'; playerId: string; giving: Record<ResourceType, number>; requesting: Record<ResourceType, number> }
  | { type: 'ACCEPT_TRADE_OFFER'; playerId: string; offerId: string }
  | { type: 'CANCEL_TRADE_OFFER'; playerId: string }
  | { type: 'END_TURN'; playerId: string }
  | { type: 'SEND_CHAT'; message: ChatMessage };

export function createInitialGameState(roomId: string): GameState {
  const board = generateBoard(true);

  return {
    roomId,
    players: [],
    playerOrder: [],
    activePlayerIndex: 0,
    phase: 'lobby',
    setupSubStep: 'place_settlement',
    turnNumber: 0,
    hexes: board.hexes,
    vertices: board.vertices,
    edges: board.edges,
    robberHexId: board.robberHexId,
    lastDiceRoll: null,
    isDiceRolling: false,
    discardStatus: {},
    robberMovedToHexId: null,
    stealingEligiblePlayerIds: [],
    devCardDeck: createDevCardDeck(),
    hasPlayedDevCardThisTurn: false,
    roadBuildingRoadsRemaining: 0,
    longestRoadPlayerId: null,
    longestRoadLength: 0,
    largestArmyPlayerId: null,
    largestArmyCount: 0,
    currentTradeOffer: null,
    logs: [
      {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: 'Phòng chơi được tạo. Chào mừng đến với Catan 3D!',
        type: 'system',
      },
    ],
    messages: [],
    winnerPlayerId: null,
  };
}

function addLog(
  state: GameState,
  text: string,
  type: GameLogEntry['type'] = 'system',
  playerId?: string
) {
  state.logs.push({
    id: `log_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    text,
    type,
    playerId,
  });
}

/**
 * Validates Distance Rule for placing a settlement on a vertex.
 */
export function isValidSettlementPlacement(
  state: GameState,
  vertexId: string,
  playerId: string,
  isInitialSetup: boolean = false
): boolean {
  const vertex = state.vertices.find((v) => v.id === vertexId);
  if (!vertex || vertex.building) return false;

  // Distance Rule: No settlement on any adjacent vertex
  for (const adjVId of vertex.adjacentVertexIds) {
    const adjV = state.vertices.find((v) => v.id === adjVId);
    if (adjV?.building) return false;
  }

  if (isInitialSetup) return true;

  // In normal play, must be connected to player's road
  const hasConnectedRoad = vertex.adjacentEdgeIds.some((eId) => {
    const edge = state.edges.find((e) => e.id === eId);
    return edge?.road?.playerId === playerId;
  });

  return hasConnectedRoad;
}

/**
 * Validates Road placement on an edge.
 */
export function isValidRoadPlacement(
  state: GameState,
  edgeId: string,
  playerId: string,
  connectedToVertexId?: string
): boolean {
  const edge = state.edges.find((e) => e.id === edgeId);
  if (!edge || edge.road) return false;

  // In initial setup, road must connect directly to the newly placed settlement
  if (connectedToVertexId) {
    return edge.vertexIds.includes(connectedToVertexId);
  }

  // In normal play: must connect to player's road OR player's settlement/city
  const connectsToOwnBuilding = edge.vertexIds.some((vId) => {
    const v = state.vertices.find((ver) => ver.id === vId);
    return v?.building?.playerId === playerId;
  });

  if (connectsToOwnBuilding) return true;

  // Or connects to player's existing road via an endpoint that is NOT blocked by opponent building
  const connectsToOwnRoad = edge.vertexIds.some((vId) => {
    const v = state.vertices.find((ver) => ver.id === vId);
    if (v?.building && v.building.playerId !== playerId) return false; // Blocked

    return v?.adjacentEdgeIds.some((adjEdgeId) => {
      if (adjEdgeId === edgeId) return false;
      const adjEdge = state.edges.find((e) => e.id === adjEdgeId);
      return adjEdge?.road?.playerId === playerId;
    });
  });

  return connectsToOwnRoad;
}

/**
 * Recalculate Victory Points and Longest Road / Largest Army
 */
export function recalculatePlayerStats(state: GameState) {
  // Update Longest Road for each player
  state.players.forEach((player) => {
    player.longestRoadLength = calculateLongestRoadForPlayer(
      player.id,
      state.edges,
      state.vertices
    );
  });

  const { holderId, recordLength } = evaluateLongestRoad(
    state.players,
    state.longestRoadPlayerId,
    state.longestRoadLength
  );

  state.longestRoadPlayerId = holderId;
  state.longestRoadLength = recordLength;

  state.players.forEach((p) => {
    p.hasLongestRoad = p.id === holderId;
  });

  // Update Largest Army
  let topKnightPlayerId: string | null = state.largestArmyPlayerId;
  let topKnights = state.largestArmyCount;

  state.players.forEach((player) => {
    if (player.playedKnights >= 3) {
      if (!topKnightPlayerId) {
        topKnightPlayerId = player.id;
        topKnights = player.playedKnights;
      } else if (player.id !== topKnightPlayerId && player.playedKnights > topKnights) {
        topKnightPlayerId = player.id;
        topKnights = player.playedKnights;
      }
    }
  });

  state.largestArmyPlayerId = topKnightPlayerId;
  state.largestArmyCount = topKnights;

  state.players.forEach((p) => {
    p.hasLargestArmy = p.id === topKnightPlayerId;
  });

  // Calculate Victory Points
  state.players.forEach((player) => {
    let vp = 0;

    // Settlements = 1 VP
    const settlementsCount = state.vertices.filter(
      (v) => v.building?.type === 'settlement' && v.building.playerId === player.id
    ).length;

    // Cities = 2 VP
    const citiesCount = state.vertices.filter(
      (v) => v.building?.type === 'city' && v.building.playerId === player.id
    ).length;

    vp += settlementsCount * 1;
    vp += citiesCount * 2;

    if (player.hasLongestRoad) vp += 2;
    if (player.hasLargestArmy) vp += 2;

    player.publicVictoryPoints = vp;

    // Hidden Dev Card VP
    const hiddenVp = player.devCards.filter((c) => c === 'victory_point').length;
    player.victoryPoints = vp + hiddenVp;

    // Win condition check (10 VP)
    if (player.victoryPoints >= 10 && !state.winnerPlayerId) {
      state.winnerPlayerId = player.id;
      state.phase = 'game_over';
      addLog(
        state,
        `🎉 Chúc mừng ${player.name} đã xuất sắc đạt ${player.victoryPoints} Điểm Chiến Thắng và trở thành Vua Đảo Catan!`,
        'victory',
        player.id
      );
    }
  });
}

/**
 * Main Catan Game Reducer
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const nextState: GameState = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case 'JOIN_ROOM': {
      const existing = nextState.players.find((p) => p.id === action.player.id);
      if (existing) {
        existing.connected = true;
        existing.name = action.player.name || existing.name;
      } else {
        const availableColors: PlayerColor[] = ['red', 'blue', 'orange', 'white', 'green', 'purple'];
        const usedColors = nextState.players.map((p) => p.color);
        const assignedColor = availableColors.find((c) => !usedColors.includes(c)) || 'red';

        const isHost = nextState.players.length === 0;
        const newPlayer: Player = {
          id: action.player.id,
          name: action.player.name,
          color: action.player.color || assignedColor,
          pieceStyle: action.player.pieceStyle || 'classic_wood',
          avatarSeed: action.player.avatarSeed || action.player.name,
          isHost,
          isReady: isHost, // Host is ready by default
          connected: true,
          resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
          devCards: [],
          newDevCardsBoughtThisTurn: [],
          playedKnights: 0,
          roadsLeft: 15,
          settlementsLeft: 5,
          citiesLeft: 4,
          victoryPoints: 0,
          publicVictoryPoints: 0,
          hasLongestRoad: false,
          hasLargestArmy: false,
          longestRoadLength: 0,
        };
        nextState.players.push(newPlayer);
        addLog(nextState, `${newPlayer.name} đã tham gia phòng.`);
      }
      return nextState;
    }

    case 'LEAVE_ROOM': {
      const player = nextState.players.find((p) => p.id === action.playerId);
      if (player) {
        player.connected = false;
        addLog(nextState, `${player.name} đã rời phòng.`);
      }
      return nextState;
    }

    case 'UPDATE_PROFILE': {
      const player = nextState.players.find((p) => p.id === action.playerId);
      if (player) {
        player.name = action.name;
        player.color = action.color;
        player.pieceStyle = action.pieceStyle;
      }
      return nextState;
    }

    case 'SET_READY': {
      const player = nextState.players.find((p) => p.id === action.playerId);
      if (player) player.isReady = action.isReady;
      return nextState;
    }

    case 'START_GAME': {
      if (nextState.players.length < 2) return nextState; // Support 2-4 players

      // Shuffle player turn order
      const order = [...nextState.players.map((p) => p.id)];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }

      nextState.playerOrder = order;
      nextState.activePlayerIndex = 0;
      nextState.phase = 'setup_round_1';
      nextState.setupSubStep = 'place_settlement';
      nextState.turnNumber = 1;

      const firstPlayer = nextState.players.find((p) => p.id === order[0]);
      addLog(
        nextState,
        `Trò chơi bắt đầu! Thứ tự lượt: ${order
          .map((id) => nextState.players.find((p) => p.id === id)?.name)
          .join(' ➔ ')}. Lượt của ${firstPlayer?.name} đặt Làng đầu tiên.`
      );
      return nextState;
    }

    case 'PLACE_INITIAL_SETTLEMENT': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId) return nextState;
      if (nextState.setupSubStep !== 'place_settlement') return nextState;

      const isValid = isValidSettlementPlacement(nextState, action.vertexId, activePlayerId, true);
      if (!isValid) return nextState;

      const vertex = nextState.vertices.find((v) => v.id === action.vertexId);
      const player = nextState.players.find((p) => p.id === activePlayerId);
      if (!vertex || !player || player.settlementsLeft <= 0) return nextState;

      vertex.building = { type: 'settlement', playerId: activePlayerId };
      player.settlementsLeft--;

      // If this is Round 2 Setup, grant initial resources from surrounding hexes
      if (nextState.phase === 'setup_round_2') {
        const granted: ResourceType[] = [];
        vertex.hexIndices.forEach((hexId) => {
          const hex = nextState.hexes.find((h) => h.id === hexId);
          if (hex && hex.resource) {
            player.resources[hex.resource]++;
            granted.push(hex.resource);
          }
        });
        if (granted.length > 0) {
          addLog(
            nextState,
            `${player.name} nhận tài nguyên khởi đầu: ${granted.join(', ')}.`,
            'system',
            player.id
          );
        }
      }

      nextState.setupSubStep = 'place_road';
      addLog(nextState, `${player.name} đã đặt Làng. Hãy đặt 1 Con đường nối từ làng này.`, 'build', player.id);
      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'PLACE_INITIAL_ROAD': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId) return nextState;
      if (nextState.setupSubStep !== 'place_road') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      const edge = nextState.edges.find((e) => e.id === action.edgeId);
      if (!player || !edge || player.roadsLeft <= 0) return nextState;

      // Find the most recently placed settlement by this player
      const playerSettlements = nextState.vertices.filter(
        (v) => v.building?.playerId === activePlayerId && v.building.type === 'settlement'
      );
      const latestSettlement = playerSettlements[playerSettlements.length - 1];

      const isValid = isValidRoadPlacement(nextState, action.edgeId, activePlayerId, latestSettlement?.id);
      if (!isValid) return nextState;

      edge.road = { playerId: activePlayerId };
      player.roadsLeft--;
      addLog(nextState, `${player.name} đã đặt Con đường khởi đầu.`, 'build', player.id);

      // Snake Draft Progression:
      // Round 1: 0 -> 1 -> 2 -> 3
      // Round 2: 3 -> 2 -> 1 -> 0
      const totalPlayers = nextState.playerOrder.length;

      if (nextState.phase === 'setup_round_1') {
        if (nextState.activePlayerIndex < totalPlayers - 1) {
          nextState.activePlayerIndex++;
          nextState.setupSubStep = 'place_settlement';
          const nextPlayer = nextState.players.find((p) => p.id === nextState.playerOrder[nextState.activePlayerIndex]);
          addLog(nextState, `Lượt của ${nextPlayer?.name} đặt Làng và Đường vòng 1.`);
        } else {
          // Transition to Round 2 (last player goes first in Round 2)
          nextState.phase = 'setup_round_2';
          nextState.setupSubStep = 'place_settlement';
          const nextPlayer = nextState.players.find((p) => p.id === nextState.playerOrder[nextState.activePlayerIndex]);
          addLog(nextState, `Bắt đầu Vòng 2! ${nextPlayer?.name} đặt Làng thứ hai và nhận tài nguyên khởi đầu.`);
        }
      } else if (nextState.phase === 'setup_round_2') {
        if (nextState.activePlayerIndex > 0) {
          nextState.activePlayerIndex--;
          nextState.setupSubStep = 'place_settlement';
          const nextPlayer = nextState.players.find((p) => p.id === nextState.playerOrder[nextState.activePlayerIndex]);
          addLog(nextState, `Lượt của ${nextPlayer?.name} đặt Làng thứ hai.`);
        } else {
          // End of setup phase! Transition to regular turn game cycle
          nextState.phase = 'turn_roll_dice';
          nextState.activePlayerIndex = 0;
          nextState.turnNumber = 1;
          const firstPlayer = nextState.players.find((p) => p.id === nextState.playerOrder[0]);
          addLog(nextState, `🎉 Hoàn tất giai đoạn thiết lập! Bắt đầu lượt 1 của ${firstPlayer?.name}. Hãy gieo xúc xắc!`);
        }
      }

      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'ROLL_DICE': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_roll_dice') {
        return nextState;
      }

      const d1 = action.forcedRoll ? action.forcedRoll[0] : Math.floor(Math.random() * 6) + 1;
      const d2 = action.forcedRoll ? action.forcedRoll[1] : Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      nextState.lastDiceRoll = [d1, d2];

      const player = nextState.players.find((p) => p.id === activePlayerId);
      addLog(nextState, `🎲 ${player?.name} đã gieo xúc xắc: [${d1}, ${d2}] ➔ Tổng điểm: ${total}`, 'roll', player?.id);

      if (total === 7) {
        // Robber Activation: check if any player has > 7 resource cards
        const discardStatus: Record<string, { requiredCount: number; hasDiscarded: boolean }> = {};
        let anyoneMustDiscard = false;

        nextState.players.forEach((p) => {
          const totalCards = Object.values(p.resources).reduce((a, b) => a + b, 0);
          if (totalCards > 7) {
            const discardCount = Math.floor(totalCards / 2);
            discardStatus[p.id] = { requiredCount: discardCount, hasDiscarded: false };
            anyoneMustDiscard = true;
            addLog(nextState, `⚠️ ${p.name} đang có ${totalCards} thẻ và phải bỏ bớt ${discardCount} thẻ!`, 'robber', p.id);
          }
        });

        if (anyoneMustDiscard) {
          nextState.discardStatus = discardStatus;
          nextState.phase = 'turn_robber_discard';
        } else {
          nextState.phase = 'turn_robber_move';
          addLog(nextState, `${player?.name}, hãy chọn 1 ô lục giác mới để di chuyển Tướng cướp.`, 'robber', player?.id);
        }
      } else {
        // Distribute resources for matching number
        const matchingHexes = nextState.hexes.filter(
          (h) => h.numberToken === total && !h.hasRobber && h.resource !== null
        );

        matchingHexes.forEach((hex) => {
          // Find all vertices around this hex
          const hexVertices = nextState.vertices.filter((v) => v.hexIndices.includes(hex.id));
          hexVertices.forEach((vertex) => {
            if (vertex.building && hex.resource) {
              const res = hex.resource;
              const receiver = nextState.players.find((p) => p.id === vertex.building!.playerId);
              if (receiver) {
                const amount = vertex.building.type === 'city' ? 2 : 1;
                receiver.resources[res] += amount;
                addLog(
                  nextState,
                  `${receiver.name} nhận +${amount} ${res} từ ô ${hex.terrain} (${total}).`,
                  'system',
                  receiver.id
                );
              }
            }
          });
        });

        nextState.phase = 'turn_actions';
      }

      return nextState;
    }

    case 'SUBMIT_DISCARD': {
      if (nextState.phase !== 'turn_robber_discard') return nextState;
      const status = nextState.discardStatus[action.playerId];
      if (!status || status.hasDiscarded) return nextState;

      const player = nextState.players.find((p) => p.id === action.playerId);
      if (!player) return nextState;

      const discardedTotal = Object.values(action.discardedResources).reduce((a, b) => (a || 0) + (b || 0), 0);
      if (discardedTotal !== status.requiredCount) return nextState;

      // Deduct resources
      for (const [res, count] of Object.entries(action.discardedResources)) {
        const r = res as ResourceType;
        player.resources[r] = Math.max(0, player.resources[r] - (count || 0));
      }

      status.hasDiscarded = true;
      addLog(nextState, `${player.name} đã xả ${discardedTotal} thẻ tài nguyên.`, 'robber', player.id);

      // Check if all required players discarded
      const allDone = Object.values(nextState.discardStatus).every((s) => s.hasDiscarded);
      if (allDone) {
        nextState.discardStatus = {};
        nextState.phase = 'turn_robber_move';
        const activePlayer = nextState.players.find((p) => p.id === nextState.playerOrder[nextState.activePlayerIndex]);
        addLog(nextState, `${activePlayer?.name}, hãy chọn 1 ô lục giác mới để di chuyển Tướng cướp.`, 'robber', activePlayer?.id);
      }

      return nextState;
    }

    case 'MOVE_ROBBER': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_robber_move') return nextState;
      if (action.hexId === nextState.robberHexId) return nextState; // Must move to a different hex

      // Update robber position
      nextState.hexes.forEach((h) => (h.hasRobber = h.id === action.hexId));
      nextState.robberHexId = action.hexId;
      nextState.robberMovedToHexId = action.hexId;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      const targetHex = nextState.hexes.find((h) => h.id === action.hexId);
      addLog(
        nextState,
        `🦹 ${player?.name} đã di chuyển Tướng cướp đến ô ${targetHex?.terrain} (số ${targetHex?.numberToken || 'Sa mạc'}).`,
        'robber',
        player?.id
      );

      // Find players with settlements/cities on this hex (excluding active player)
      const adjacentVertices = nextState.vertices.filter((v) => v.hexIndices.includes(action.hexId));
      const victimIds = Array.from(
        new Set(
          adjacentVertices
            .map((v) => v.building?.playerId)
            .filter((pId): pId is string => Boolean(pId) && pId !== activePlayerId)
        )
      );

      // Filter victims who actually have at least 1 resource card
      const eligibleVictims = victimIds.filter((vId) => {
        const victim = nextState.players.find((p) => p.id === vId);
        if (!victim) return false;
        return Object.values(victim.resources).reduce((a, b) => a + b, 0) > 0;
      });

      if (eligibleVictims.length > 0) {
        nextState.stealingEligiblePlayerIds = eligibleVictims;
        nextState.phase = 'turn_robber_steal';
      } else {
        nextState.phase = 'turn_actions';
      }

      return nextState;
    }

    case 'STEAL_RESOURCE': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_robber_steal') return nextState;
      if (!nextState.stealingEligiblePlayerIds.includes(action.victimPlayerId)) return nextState;

      const thief = nextState.players.find((p) => p.id === activePlayerId);
      const victim = nextState.players.find((p) => p.id === action.victimPlayerId);
      if (!thief || !victim) return nextState;

      // Pick a random resource from victim's cards
      const availableCards: ResourceType[] = [];
      for (const [res, count] of Object.entries(victim.resources)) {
        for (let i = 0; i < count; i++) availableCards.push(res as ResourceType);
      }

      if (availableCards.length > 0) {
        const stolenRes = availableCards[Math.floor(Math.random() * availableCards.length)];
        victim.resources[stolenRes]--;
        thief.resources[stolenRes]++;
        addLog(nextState, `${thief.name} đã cướp 1 thẻ tài nguyên từ ${victim.name}.`, 'robber', thief.id);
      }

      nextState.stealingEligiblePlayerIds = [];
      nextState.phase = 'turn_actions';
      return nextState;
    }

    case 'BUILD_ROAD': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      const edge = nextState.edges.find((e) => e.id === action.edgeId);
      if (!player || !edge || player.roadsLeft <= 0) return nextState;

      const isFreeRoadFromCard = nextState.roadBuildingRoadsRemaining > 0;
      if (!isFreeRoadFromCard && !hasEnoughResources(player, BUILDING_COSTS.road)) {
        return nextState;
      }

      if (!isValidRoadPlacement(nextState, action.edgeId, activePlayerId)) {
        return nextState;
      }

      if (!isFreeRoadFromCard) {
        player.resources.wood -= 1;
        player.resources.brick -= 1;
      } else {
        nextState.roadBuildingRoadsRemaining--;
      }

      edge.road = { playerId: activePlayerId };
      player.roadsLeft--;

      addLog(nextState, `${player.name} đã xây 1 Con đường mới.`, 'build', player.id);
      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'BUILD_SETTLEMENT': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      const vertex = nextState.vertices.find((v) => v.id === action.vertexId);
      if (!player || !vertex || player.settlementsLeft <= 0) return nextState;

      if (!hasEnoughResources(player, BUILDING_COSTS.settlement)) return nextState;
      if (!isValidSettlementPlacement(nextState, action.vertexId, activePlayerId, false)) return nextState;

      player.resources.wood -= 1;
      player.resources.brick -= 1;
      player.resources.sheep -= 1;
      player.resources.wheat -= 1;

      vertex.building = { type: 'settlement', playerId: activePlayerId };
      player.settlementsLeft--;

      addLog(nextState, `🏠 ${player.name} đã xây 1 Ngôi làng mới (+1 VP).`, 'build', player.id);
      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'UPGRADE_CITY': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      const vertex = nextState.vertices.find((v) => v.id === action.vertexId);
      if (!player || !vertex || player.citiesLeft <= 0) return nextState;

      if (vertex.building?.type !== 'settlement' || vertex.building.playerId !== activePlayerId) {
        return nextState;
      }
      if (!hasEnoughResources(player, BUILDING_COSTS.city)) return nextState;

      player.resources.wheat -= 2;
      player.resources.ore -= 3;

      vertex.building = { type: 'city', playerId: activePlayerId };
      player.settlementsLeft++;
      player.citiesLeft--;

      addLog(nextState, `🏰 ${player.name} đã nâng cấp Thành phố (+2 VP, nhân đôi sản lượng).`, 'build', player.id);
      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'BUY_DEV_CARD': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      if (!player || nextState.devCardDeck.length === 0) return nextState;
      if (!hasEnoughResources(player, BUILDING_COSTS.devCard)) return nextState;

      player.resources.sheep -= 1;
      player.resources.wheat -= 1;
      player.resources.ore -= 1;

      const drawnCard = nextState.devCardDeck.pop()!;
      player.devCards.push(drawnCard);
      player.newDevCardsBoughtThisTurn.push(drawnCard);

      addLog(nextState, `🎴 ${player.name} đã mua 1 Thẻ Phát Triển.`, 'dev_card', player.id);
      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'PLAY_DEV_CARD': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;
      if (nextState.hasPlayedDevCardThisTurn) return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      if (!player) return nextState;

      // Cannot play a card bought in the same turn
      const playableCards = player.devCards.filter((c) => !player.newDevCardsBoughtThisTurn.includes(c));
      const cardIndex = playableCards.indexOf(action.card);
      if (cardIndex === -1) return nextState;

      // Remove 1 instance from player's devCards
      const mainIndex = player.devCards.indexOf(action.card);
      player.devCards.splice(mainIndex, 1);
      nextState.hasPlayedDevCardThisTurn = true;

      switch (action.card) {
        case 'knight': {
          player.playedKnights++;
          addLog(nextState, `⚔️ ${player.name} đã kích hoạt thẻ Hiệp Sĩ (Đã kích hoạt: ${player.playedKnights}).`, 'dev_card', player.id);
          nextState.phase = 'turn_robber_move';
          break;
        }
        case 'road_building': {
          nextState.roadBuildingRoadsRemaining = Math.min(2, player.roadsLeft);
          addLog(nextState, `🛣️ ${player.name} kích hoạt thẻ Xây Dựng Đường (+2 đường miễn phí).`, 'dev_card', player.id);
          break;
        }
        case 'year_of_plenty': {
          const res1 = action.extraData?.res1 as ResourceType;
          const res2 = action.extraData?.res2 as ResourceType;
          if (res1 && res2) {
            player.resources[res1]++;
            player.resources[res2]++;
            addLog(nextState, `🌾 ${player.name} kích hoạt thẻ Năm Bội Thu và nhận +1 ${res1}, +1 ${res2}.`, 'dev_card', player.id);
          }
          break;
        }
        case 'monopoly': {
          const targetRes = action.extraData?.resource as ResourceType;
          if (targetRes) {
            let totalStolen = 0;
            nextState.players.forEach((other) => {
              if (other.id !== activePlayerId) {
                const count = other.resources[targetRes] || 0;
                other.resources[targetRes] = 0;
                totalStolen += count;
              }
            });
            player.resources[targetRes] += totalStolen;
            addLog(nextState, `👑 ${player.name} kích hoạt thẻ Độc Quyền [${targetRes}] và thu về tổng cộng ${totalStolen} thẻ!`, 'dev_card', player.id);
          }
          break;
        }
      }

      recalculatePlayerStats(nextState);
      return nextState;
    }

    case 'EXECUTE_BANK_TRADE': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      if (!player) return nextState;

      const ratios = getPlayerTradeRatios(player.id, nextState.vertices);
      const requiredRatio = ratios[action.give];

      if (action.giveCount < requiredRatio) return nextState;
      if (player.resources[action.give] < action.giveCount) return nextState;

      const multiplier = Math.floor(action.giveCount / requiredRatio);
      player.resources[action.give] -= multiplier * requiredRatio;
      player.resources[action.get] += multiplier;

      addLog(
        nextState,
        `⚓ ${player.name} đổi cảng/ngân hàng: ${multiplier * requiredRatio} ${action.give} ➔ ${multiplier} ${action.get}.`,
        'trade',
        player.id
      );
      return nextState;
    }

    case 'CREATE_TRADE_OFFER': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      if (!player || !hasEnoughResources(player, action.giving)) return nextState;

      nextState.currentTradeOffer = {
        id: `trade_${Date.now()}`,
        fromPlayerId: activePlayerId,
        giving: action.giving,
        requesting: action.requesting,
        status: 'open',
      };

      addLog(nextState, `🤝 ${player.name} đã đưa ra đề nghị giao thương với mọi người.`, 'trade', player.id);
      return nextState;
    }

    case 'ACCEPT_TRADE_OFFER': {
      if (!nextState.currentTradeOffer || nextState.currentTradeOffer.status !== 'open') return nextState;
      if (action.playerId === nextState.currentTradeOffer.fromPlayerId) return nextState;

      const initiator = nextState.players.find((p) => p.id === nextState.currentTradeOffer!.fromPlayerId);
      const acceptor = nextState.players.find((p) => p.id === action.playerId);
      if (!initiator || !acceptor) return nextState;

      const offer = nextState.currentTradeOffer;

      // Validate both players still have required resources
      if (!hasEnoughResources(initiator, offer.giving) || !hasEnoughResources(acceptor, offer.requesting)) {
        return nextState;
      }

      // Execute trade
      for (const [res, count] of Object.entries(offer.giving)) {
        const r = res as ResourceType;
        initiator.resources[r] -= count;
        acceptor.resources[r] += count;
      }

      for (const [res, count] of Object.entries(offer.requesting)) {
        const r = res as ResourceType;
        acceptor.resources[r] -= count;
        initiator.resources[r] += count;
      }

      nextState.currentTradeOffer = null;
      addLog(nextState, `🤝 ${initiator.name} và ${acceptor.name} đã hoàn tất giao dịch!`, 'trade');
      return nextState;
    }

    case 'CANCEL_TRADE_OFFER': {
      if (nextState.currentTradeOffer && nextState.currentTradeOffer.fromPlayerId === action.playerId) {
        nextState.currentTradeOffer = null;
      }
      return nextState;
    }

    case 'END_TURN': {
      const activePlayerId = nextState.playerOrder[nextState.activePlayerIndex];
      if (action.playerId !== activePlayerId || nextState.phase !== 'turn_actions') return nextState;

      const player = nextState.players.find((p) => p.id === activePlayerId);
      if (player) {
        player.newDevCardsBoughtThisTurn = [];
      }

      nextState.hasPlayedDevCardThisTurn = false;
      nextState.roadBuildingRoadsRemaining = 0;
      nextState.currentTradeOffer = null;

      // Advance to next player
      nextState.activePlayerIndex = (nextState.activePlayerIndex + 1) % nextState.playerOrder.length;
      if (nextState.activePlayerIndex === 0) {
        nextState.turnNumber++;
      }

      nextState.phase = 'turn_roll_dice';
      const nextPlayer = nextState.players.find((p) => p.id === nextState.playerOrder[nextState.activePlayerIndex]);
      addLog(nextState, `➔ Đến lượt của ${nextPlayer?.name}.`);
      return nextState;
    }

    case 'SEND_CHAT': {
      nextState.messages.push(action.message);
      return nextState;
    }

    default:
      return nextState;
  }
}
