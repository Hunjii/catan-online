const HEX_RADIUS = 2.4;
const SQRT_3 = Math.sqrt(3);

const HEX_GRID_LAYOUT = [
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

function generateBoard() {
  const hexes = [];
  HEX_GRID_LAYOUT.forEach((layout, index) => {
    const x = HEX_RADIUS * SQRT_3 * (layout.q + layout.r / 2);
    const z = HEX_RADIUS * 1.5 * layout.r;
    hexes.push({ id: index, q: layout.q, r: layout.r, center: { x, z } });
  });

  const rawVertices = [];
  hexes.forEach((hex) => {
    for (let c = 0; c < 6; c++) {
      const angleDeg = 30 + c * 60;
      const angleRad = (Math.PI / 180) * angleDeg;
      const vx = hex.center.x + HEX_RADIUS * Math.cos(angleRad);
      const vz = hex.center.z + HEX_RADIUS * Math.sin(angleRad);
      rawVertices.push({ x: vx, y: 0.15, z: vz, hexIndex: hex.id, corner: c });
    }
  });

  const mergedVertices = [];
  const distanceThreshold = 0.35;

  rawVertices.forEach((rv) => {
    let existing = mergedVertices.find(
      (mv) => Math.hypot(mv.position.x - rv.x, mv.position.z - rv.z) < distanceThreshold
    );
    if (existing) {
      if (!existing.hexIndices.includes(rv.hexIndex)) existing.hexIndices.push(rv.hexIndex);
    } else {
      const vId = `v_${mergedVertices.length}`;
      mergedVertices.push({
        id: vId,
        hexIndices: [rv.hexIndex],
        adjacentVertexIds: [],
        adjacentEdgeIds: [],
        position: { x: rv.x, y: 0.15, z: rv.z },
      });
    }
  });

  const mergedEdges = [];
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
        const existingEdge = mergedEdges.find(
          (e) =>
            (e.vertexIds[0] === vertex1.id && e.vertexIds[1] === vertex2.id) ||
            (e.vertexIds[0] === vertex2.id && e.vertexIds[1] === vertex1.id)
        );

        if (existingEdge) {
          if (!existingEdge.hexIndices.includes(hex.id)) existingEdge.hexIndices.push(hex.id);
        } else {
          const edgeId = `e_${mergedEdges.length}`;
          const edge = {
            id: edgeId,
            vertexIds: [vertex1.id, vertex2.id],
            hexIndices: [hex.id],
            position: {
              x: (vertex1.position.x + vertex2.position.x) / 2,
              y: 0.15,
              z: (vertex1.position.z + vertex2.position.z) / 2,
            },
            road: null
          };
          mergedEdges.push(edge);
          vertex1.adjacentEdgeIds.push(edgeId);
          vertex2.adjacentEdgeIds.push(edgeId);
        }
      }
    }
  });

  return { hexes, vertices: mergedVertices, edges: mergedEdges };
}

const { hexes, vertices, edges } = generateBoard();

// Check if any edge has invalid coordinates or 0 length
edges.forEach(e => {
  const v1 = vertices.find(v => v.id === e.vertexIds[0]);
  const v2 = vertices.find(v => v.id === e.vertexIds[1]);
  const len = Math.hypot(v1.position.x - v2.position.x, v1.position.z - v2.position.z);
  if (len < 0.1) {
    console.log(`ZERO LENGTH EDGE ${e.id}: len=${len}`);
  }
});

// Let's check the vertex in media_1788193631018.png:
// Top-Left: Pasture (Sheep 10)
// Top-Right: Fields (Wheat 11)
// Bottom: Forest (Wood, top corner)
// Let's find vertices between 3 hexes where one is Forest and one is Pasture and one is Fields:
vertices.forEach(v => {
  const connected = edges.filter(e => e.vertexIds.includes(v.id));
  const types = connected.map(e => {
    const v1 = vertices.find(ver => ver.id === e.vertexIds[0]);
    const v2 = vertices.find(ver => ver.id === e.vertexIds[1]);
    const dx = Math.abs(v1.position.x - v2.position.x);
    const dz = Math.abs(v1.position.z - v2.position.z);
    return `${e.id} (${dx < 0.01 ? 'VERTICAL' : 'DIAG'}, len=${Math.hypot(dx, dz).toFixed(2)})`;
  });
  console.log(`Vertex ${v.id} (pos: ${v.position.x.toFixed(2)}, ${v.position.z.toFixed(2)}): ${connected.length} edges: ${types.join(', ')}`);
});
