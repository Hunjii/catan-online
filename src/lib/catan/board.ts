import { HexTile, Vertex, Edge, HexTerrain, ResourceType, PortType } from './types';

export const HEX_RADIUS = 2.4; // 3D world units from center to vertex
const SQRT_3 = Math.sqrt(3);

export interface BoardData {
  hexes: HexTile[];
  vertices: Vertex[];
  edges: Edge[];
  robberHexId: number;
}

// 19 Hex layouts with axial coords (q, r)
const HEX_GRID_LAYOUT: { q: number; r: number }[] = [
  // Row 0 (3 hexes)
  { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },
  // Row 1 (4 hexes)
  { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
  // Row 2 (5 hexes)
  { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
  // Row 3 (4 hexes)
  { q: -2, r: 1 }, { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
  // Row 4 (3 hexes)
  { q: -2, r: 2 }, { q: -1, r: 2 }, { q: 0, r: 2 },
];

export const TERRAIN_RESOURCE_MAP: Record<HexTerrain, ResourceType | null> = {
  forest: 'wood',
  hills: 'brick',
  pasture: 'sheep',
  fields: 'wheat',
  mountains: 'ore',
  desert: null,
};

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate the 19 Hexes, 54 Vertices, 72 Edges and 9 Ports
export function generateBoard(randomize: boolean = true): BoardData {
  const baseTerrains: HexTerrain[] = [
    'forest', 'forest', 'forest', 'forest',
    'pasture', 'pasture', 'pasture', 'pasture',
    'fields', 'fields', 'fields', 'fields',
    'hills', 'hills', 'hills',
    'mountains', 'mountains', 'mountains',
    'desert',
  ];

  const baseNumbers: number[] = [
    2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12,
  ];

  const terrains = randomize ? shuffleArray(baseTerrains) : baseTerrains;
  const numbers = randomize ? shuffleArray(baseNumbers) : baseNumbers;

  // Build Hexes
  let numberIndex = 0;
  let desertHexId = 0;
  const hexes: HexTile[] = [];

  HEX_GRID_LAYOUT.forEach((layout, index) => {
    const terrain = terrains[index];
    const isDesert = terrain === 'desert';
    if (isDesert) desertHexId = index;

    const num = isDesert ? null : numbers[numberIndex++];
    // Axial to 3D Cartesian coordinates (Pointy-topped hexes: x = sqrt(3)*R*(q + r/2), z = 1.5*R*r)
    const x = HEX_RADIUS * SQRT_3 * (layout.q + layout.r / 2);
    const z = HEX_RADIUS * 1.5 * layout.r;

    hexes.push({
      id: index,
      coord: { q: layout.q, r: layout.r, s: -layout.q - layout.r },
      terrain,
      resource: TERRAIN_RESOURCE_MAP[terrain],
      numberToken: num,
      hasRobber: isDesert,
      center: { x, z },
    });
  });

  // Build Vertices and Edges with proximity merging
  const rawVertices: { x: number; y: number; z: number; hexIndex: number; corner: number }[] = [];

  hexes.forEach((hex) => {
    for (let c = 0; c < 6; c++) {
      // Pointy-topped hex corners at angles 30, 90, 150, 210, 270, 330 degrees
      const angleDeg = 30 + c * 60;
      const angleRad = (Math.PI / 180) * angleDeg;
      const vx = hex.center.x + HEX_RADIUS * Math.cos(angleRad);
      const vz = hex.center.z + HEX_RADIUS * Math.sin(angleRad);
      rawVertices.push({ x: vx, y: 0.15, z: vz, hexIndex: hex.id, corner: c });
    }
  });

  const mergedVertices: Vertex[] = [];
  const distanceThreshold = 0.35; // Merge within 0.35 units

  rawVertices.forEach((rv) => {
    let existing = mergedVertices.find(
      (mv) =>
        Math.hypot(mv.position.x - rv.x, mv.position.z - rv.z) < distanceThreshold
    );

    if (existing) {
      if (!existing.hexIndices.includes(rv.hexIndex)) {
        existing.hexIndices.push(rv.hexIndex);
      }
    } else {
      const vId = `v_${mergedVertices.length}`;
      mergedVertices.push({
        id: vId,
        hexIndices: [rv.hexIndex],
        adjacentVertexIds: [],
        adjacentEdgeIds: [],
        position: { x: rv.x, y: 0.15, z: rv.z },
        building: null,
        port: null,
      });
    }
  });

  // Build Edges
  const mergedEdges: Edge[] = [];

  hexes.forEach((hex) => {
    for (let c = 0; c < 6; c++) {
      const cNext = (c + 1) % 6;

      const angle1 = (Math.PI / 180) * (30 + c * 60);
      const v1x = hex.center.x + HEX_RADIUS * Math.cos(angle1);
      const v1z = hex.center.z + HEX_RADIUS * Math.sin(angle1);

      const angle2 = (Math.PI / 180) * (30 + cNext * 60);
      const v2x = hex.center.x + HEX_RADIUS * Math.cos(angle2);
      const v2z = hex.center.z + HEX_RADIUS * Math.sin(angle2);

      const vertex1 = mergedVertices.find(
        (v) => Math.hypot(v.position.x - v1x, v.position.z - v1z) < distanceThreshold
      );
      const vertex2 = mergedVertices.find(
        (v) => Math.hypot(v.position.x - v2x, v.position.z - v2z) < distanceThreshold
      );

      if (vertex1 && vertex2 && vertex1.id !== vertex2.id) {
        // Check if edge already exists
        const existingEdge = mergedEdges.find(
          (e) =>
            (e.vertexIds[0] === vertex1.id && e.vertexIds[1] === vertex2.id) ||
            (e.vertexIds[0] === vertex2.id && e.vertexIds[1] === vertex1.id)
        );

        if (existingEdge) {
          if (!existingEdge.hexIndices.includes(hex.id)) {
            existingEdge.hexIndices.push(hex.id);
          }
        } else {
          const edgeId = `e_${mergedEdges.length}`;
          const midX = (vertex1.position.x + vertex2.position.x) / 2;
          const midZ = (vertex1.position.z + vertex2.position.z) / 2;
          const rotY = Math.atan2(
            vertex2.position.z - vertex1.position.z,
            vertex2.position.x - vertex1.position.x
          );

          const edge: Edge = {
            id: edgeId,
            vertexIds: [vertex1.id, vertex2.id],
            hexIndices: [hex.id],
            position: { x: midX, y: 0.15, z: midZ },
            rotationY: rotY,
            road: null,
          };

          mergedEdges.push(edge);
          vertex1.adjacentEdgeIds.push(edgeId);
          vertex2.adjacentEdgeIds.push(edgeId);
          if (!vertex1.adjacentVertexIds.includes(vertex2.id)) vertex1.adjacentVertexIds.push(vertex2.id);
          if (!vertex2.adjacentVertexIds.includes(vertex1.id)) vertex2.adjacentVertexIds.push(vertex1.id);
        }
      }
    }
  });

  // Assign 9 standard Catan Ports along coastal vertices
  // Coastal vertices are vertices with hexIndices.length <= 2 and adjacentEdgeIds.length <= 2
  const coastalVertices = mergedVertices.filter((v) => v.hexIndices.length === 1);

  // Group coastal vertex pairs along shared coastal edges
  const coastalEdges = mergedEdges.filter((e) => e.hexIndices.length === 1);

  // 9 Ports standard types
  const portTypes: { type: PortType; ratio: number; resource: ResourceType | null }[] = [
    { type: 'generic_3_1', ratio: 3, resource: null },
    { type: 'wheat_2_1', ratio: 2, resource: 'wheat' },
    { type: 'ore_2_1', ratio: 2, resource: 'ore' },
    { type: 'generic_3_1', ratio: 3, resource: null },
    { type: 'sheep_2_1', ratio: 2, resource: 'sheep' },
    { type: 'generic_3_1', ratio: 3, resource: null },
    { type: 'brick_2_1', ratio: 2, resource: 'brick' },
    { type: 'wood_2_1', ratio: 2, resource: 'wood' },
    { type: 'generic_3_1', ratio: 3, resource: null },
  ];

  // Pick 9 spaced coastal edges to host ports
  const step = Math.max(1, Math.floor(coastalEdges.length / 9));
  for (let i = 0; i < 9 && i * step < coastalEdges.length; i++) {
    const cEdge = coastalEdges[i * step];
    const pInfo = portTypes[i];
    const v1 = mergedVertices.find((v) => v.id === cEdge.vertexIds[0]);
    const v2 = mergedVertices.find((v) => v.id === cEdge.vertexIds[1]);
    if (v1) v1.port = { ...pInfo };
    if (v2) v2.port = { ...pInfo };
  }

  return {
    hexes,
    vertices: mergedVertices,
    edges: mergedEdges,
    robberHexId: desertHexId,
  };
}

// Probability pips count for number tokens
export function getProbabilityPips(numberToken: number | null): number {
  if (!numberToken) return 0;
  switch (numberToken) {
    case 2:
    case 12:
      return 1;
    case 3:
    case 11:
      return 2;
    case 4:
    case 10:
      return 3;
    case 5:
    case 9:
      return 4;
    case 6:
    case 8:
      return 5;
    default:
      return 0;
  }
}
