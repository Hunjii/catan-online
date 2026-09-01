const HEX_RADIUS = 2.4;
const SQRT_3 = Math.sqrt(3);

const HEX_GRID_LAYOUT = [
  { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },
  { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
  { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
  { q: -2, r: 1 }, { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
  { q: -2, r: 2 }, { q: -1, r: 2 }, { q: 0, r: 2 },
];

function generateBoard() {
  const hexes = [];
  HEX_GRID_LAYOUT.forEach((layout, index) => {
    const x = HEX_RADIUS * SQRT_3 * (layout.q + layout.r / 2);
    const z = HEX_RADIUS * 1.5 * layout.r;
    hexes.push({ id: index, center: { x, z } });
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

  return { hexes, vertices: mergedVertices, edges: mergedEdges };
}

const { vertices, edges } = generateBoard();

// For every vertex, find all edges that have this vertex in edge.vertexIds
vertices.forEach((v) => {
  const matchingEdges = edges.filter(e => e.vertexIds.includes(v.id));
  console.log(`Vertex ${v.id} (hexes: ${v.hexIndices.length}): adjacentEdgeIds=${v.adjacentEdgeIds.length}, matchingEdges=${matchingEdges.length}`);
});
