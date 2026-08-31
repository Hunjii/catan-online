import { Edge, Vertex } from './types';

/**
 * Calculates the longest unbroken continuous road path for a given player.
 * Uses DFS with edge-visit tracking and respects enemy settlement interruption rules.
 */
export function calculateLongestRoadForPlayer(
  playerId: string,
  edges: Edge[],
  vertices: Vertex[]
): number {
  // Get all roads owned by this player
  const playerRoads = edges.filter((e) => e.road?.playerId === playerId);
  if (playerRoads.length === 0) return 0;

  const vertexMap = new Map<string, Vertex>();
  vertices.forEach((v) => vertexMap.set(v.id, v));

  const edgeMap = new Map<string, Edge>();
  edges.forEach((e) => edgeMap.set(e.id, e));

  // Build adjacency graph for player's roads
  // Map vertexId -> list of edgeIds owned by player
  const playerVertexToEdges = new Map<string, string[]>();

  playerRoads.forEach((edge) => {
    edge.vertexIds.forEach((vId) => {
      if (!playerVertexToEdges.has(vId)) {
        playerVertexToEdges.set(vId, []);
      }
      playerVertexToEdges.get(vId)!.push(edge.id);
    });
  });

  let maxRoadLength = 0;

  // DFS function to explore paths starting from a vertex
  function dfs(
    currentVertexId: string,
    visitedEdgeIds: Set<string>
  ): number {
    const connectedEdgeIds = playerVertexToEdges.get(currentVertexId) || [];
    let longestFromHere = 0;

    for (const edgeId of connectedEdgeIds) {
      if (visitedEdgeIds.has(edgeId)) continue;

      const edge = edgeMap.get(edgeId);
      if (!edge) continue;

      const nextVertexId =
        edge.vertexIds[0] === currentVertexId
          ? edge.vertexIds[1]
          : edge.vertexIds[0];

      const nextVertex = vertexMap.get(nextVertexId);

      // Check if enemy settlement/city is blocking this vertex
      const isBlockedByOpponent =
        nextVertex?.building && nextVertex.building.playerId !== playerId;

      visitedEdgeIds.add(edgeId);

      if (isBlockedByOpponent) {
        // Road reaches this vertex, but cannot pass through to further roads
        longestFromHere = Math.max(longestFromHere, 1);
      } else {
        // Can continue traversing from nextVertex
        const subLength = 1 + dfs(nextVertexId, visitedEdgeIds);
        longestFromHere = Math.max(longestFromHere, subLength);
      }

      visitedEdgeIds.delete(edgeId);
    }

    return longestFromHere;
  }

  // Run DFS from all vertices where the player has roads
  playerVertexToEdges.forEach((_, startVertexId) => {
    const visited = new Set<string>();
    const length = dfs(startVertexId, visited);
    if (length > maxRoadLength) {
      maxRoadLength = length;
    }
  });

  return maxRoadLength;
}

/**
 * Checks and updates the Longest Road holder among all players.
 */
export function evaluateLongestRoad(
  players: { id: string; longestRoadLength: number }[],
  currentHolderId: string | null,
  currentRecord: number
): { holderId: string | null; recordLength: number } {
  let newHolderId = currentHolderId;
  let newRecord = currentRecord;

  // Check if current holder dropped below 5 (e.g. broken by opponent settlement)
  if (currentHolderId) {
    const holder = players.find((p) => p.id === currentHolderId);
    if (!holder || holder.longestRoadLength < 5) {
      newHolderId = null;
      newRecord = 4;
    } else {
      newRecord = holder.longestRoadLength;
    }
  }

  // Find if anyone surpasses the current record
  players.forEach((player) => {
    if (player.longestRoadLength >= 5) {
      if (!newHolderId) {
        newHolderId = player.id;
        newRecord = player.longestRoadLength;
      } else if (player.id !== newHolderId && player.longestRoadLength > newRecord) {
        newHolderId = player.id;
        newRecord = player.longestRoadLength;
      }
    }
  });

  return { holderId: newHolderId, recordLength: newRecord };
}
