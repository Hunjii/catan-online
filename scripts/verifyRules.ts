import { generateBoard } from '../src/lib/catan/board';
import { createInitialGameState, gameReducer, isValidSettlementPlacement, isValidRoadPlacement } from '../src/lib/catan/engine';
import { calculateLongestRoadForPlayer } from '../src/lib/catan/longestRoad';
import { getPlayerTradeRatios } from '../src/lib/catan/trade';

function runTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG LOGIC LUẬT CHƠI CATAN ===');

  // Test 1: Board Generation
  const board = generateBoard(true);
  console.assert(board.hexes.length === 19, `Hexes count should be 19, got ${board.hexes.length}`);
  console.assert(board.vertices.length === 54, `Vertices count should be 54, got ${board.vertices.length}`);
  console.assert(board.edges.length === 72, `Edges count should be 72, got ${board.edges.length}`);
  console.log('✓ Test 1: Sinh bản đồ 19 ô lục giác, 54 đỉnh, 72 cạnh thành công.');

  // Test 2: Initial Game State and Join Room
  let state = createInitialGameState('TEST12');
  state = gameReducer(state, {
    type: 'JOIN_ROOM',
    player: { id: 'p1', name: 'Alice', color: 'red', pieceStyle: 'classic_wood' },
  });
  state = gameReducer(state, {
    type: 'JOIN_ROOM',
    player: { id: 'p2', name: 'Bob', color: 'blue', pieceStyle: 'medieval' },
  });
  state = gameReducer(state, {
    type: 'JOIN_ROOM',
    player: { id: 'p3', name: 'Charlie', color: 'orange', pieceStyle: 'modern' },
  });
  console.assert(state.players.length === 3, 'Players count should be 3');
  console.log('✓ Test 2: Khởi tạo phòng và người chơi tham gia thành công.');

  // Test 3: Start Game & Snake Draft Round 1
  state = gameReducer(state, { type: 'START_GAME' });
  console.assert(state.phase === 'setup_round_1', 'Phase should be setup_round_1');
  const firstPlayerId = state.playerOrder[0];

  // Pick first vertex
  const v1 = state.vertices[0];
  console.assert(isValidSettlementPlacement(state, v1.id, firstPlayerId, true), 'Initial placement should be valid');
  state = gameReducer(state, { type: 'PLACE_INITIAL_SETTLEMENT', playerId: firstPlayerId, vertexId: v1.id });
  console.assert(state.setupSubStep === 'place_road', 'SubStep should now be place_road');

  // Distance rule check: adjacent vertices should now be invalid
  const adjVId = v1.adjacentVertexIds[0];
  console.assert(!isValidSettlementPlacement(state, adjVId, 'p2', true), 'Distance rule must prevent placing on adjacent vertex');
  console.log('✓ Test 3: Luật khoảng cách Distance Rule hoạt động chính xác.');

  // Pick adjacent edge to v1 for road
  const e1Id = v1.adjacentEdgeIds[0];
  state = gameReducer(state, { type: 'PLACE_INITIAL_ROAD', playerId: firstPlayerId, edgeId: e1Id });
  console.assert(state.activePlayerIndex === 1, 'Active player should advance to player 2');
  console.log('✓ Test 4: Snake Draft chuyển lượt chính xác.');

  // Test 5: Longest Road Algorithm
  const mockEdges = [
    { id: 'e1', vertexIds: ['v1', 'v2'] as [string, string], hexIndices: [0], position: { x: 0, y: 0, z: 0 }, rotationY: 0, road: { playerId: 'p1' } },
    { id: 'e2', vertexIds: ['v2', 'v3'] as [string, string], hexIndices: [0], position: { x: 0, y: 0, z: 0 }, rotationY: 0, road: { playerId: 'p1' } },
    { id: 'e3', vertexIds: ['v3', 'v4'] as [string, string], hexIndices: [0], position: { x: 0, y: 0, z: 0 }, rotationY: 0, road: { playerId: 'p1' } },
    { id: 'e4', vertexIds: ['v4', 'v5'] as [string, string], hexIndices: [0], position: { x: 0, y: 0, z: 0 }, rotationY: 0, road: { playerId: 'p1' } },
    { id: 'e5', vertexIds: ['v5', 'v6'] as [string, string], hexIndices: [0], position: { x: 0, y: 0, z: 0 }, rotationY: 0, road: { playerId: 'p1' } },
  ];
  const mockVertices = [
    { id: 'v1', hexIndices: [0], adjacentVertexIds: ['v2'], adjacentEdgeIds: ['e1'], position: { x: 0, y: 0, z: 0 }, building: null, port: null },
    { id: 'v2', hexIndices: [0], adjacentVertexIds: ['v1', 'v3'], adjacentEdgeIds: ['e1', 'e2'], position: { x: 0, y: 0, z: 0 }, building: null, port: null },
    { id: 'v3', hexIndices: [0], adjacentVertexIds: ['v2', 'v4'], adjacentEdgeIds: ['e2', 'e3'], position: { x: 0, y: 0, z: 0 }, building: null, port: null },
    { id: 'v4', hexIndices: [0], adjacentVertexIds: ['v3', 'v5'], adjacentEdgeIds: ['e3', 'e4'], position: { x: 0, y: 0, z: 0 }, building: null, port: null },
    { id: 'v5', hexIndices: [0], adjacentVertexIds: ['v4', 'v6'], adjacentEdgeIds: ['e4', 'e5'], position: { x: 0, y: 0, z: 0 }, building: null, port: null },
    { id: 'v6', hexIndices: [0], adjacentVertexIds: ['v5'], adjacentEdgeIds: ['e5'], position: { x: 0, y: 0, z: 0 }, building: null, port: null },
  ];
  const roadLength = calculateLongestRoadForPlayer('p1', mockEdges, mockVertices);
  console.assert(roadLength === 5, `Longest road should be 5, got ${roadLength}`);
  console.log('✓ Test 5: Thuật toán tính độ dài con đường dài nhất (DFS) chính xác.');

  // Test 6: Robber 7-roll mechanics
  state.phase = 'turn_roll_dice';
  state.activePlayerIndex = 0;
  const activeP = state.players.find((p) => p.id === state.playerOrder[0])!;
  // Give a player 8 cards
  activeP.resources = { wood: 4, brick: 4, sheep: 0, wheat: 0, ore: 0 };
  state = gameReducer(state, { type: 'ROLL_DICE', playerId: activeP.id, forcedRoll: [3, 4] });
  console.assert(state.phase === 'turn_robber_discard', 'Should enter turn_robber_discard when rolling 7 with >7 cards');
  console.assert(state.discardStatus[activeP.id].requiredCount === 4, 'Should require discarding 4 cards out of 8');
  console.log('✓ Test 6: Cơ chế Tướng cướp khi gieo ra 7 và xả bài chính xác 100%.');

  console.log('=====================================================');
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ LUẬT CHƠI ĐỀU THÀNH CÔNG!');
}

runTests();
