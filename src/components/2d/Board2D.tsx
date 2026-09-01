'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { GameState, COLOR_MAP } from '@/lib/catan/types';
import { getProbabilityPips } from '@/lib/catan/board';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const BASE_SCALE = 32; // 1 unit = 32px
const HEX_RADIUS_PX = 2.4 * BASE_SCALE;

interface Board2DProps {
  gameState: GameState;
  currentUserId: string;
  buildMode: 'none' | 'road' | 'settlement' | 'city';
  onSelectVertex: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onSelectHex: (id: number) => void;
}

const TERRAIN_FALLBACK_COLORS: Record<string, string> = {
  forest: '#2d6a4f',
  hills: '#b04a2d',
  pasture: '#74c69d',
  fields: '#e9c46a',
  mountains: '#6c757d',
  desert: '#d4a373',
};

const PORT_RESOURCE_ICONS: Record<string, string> = {
  wood: '🪵',
  brick: '🧱',
  sheep: '🐑',
  wheat: '🌾',
  ore: '🪨',
};

// Points for a pointy-topped hex centered at 0,0
const HEX_POINTS = [0, 1, 2, 3, 4, 5]
  .map((i) => {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    return `${HEX_RADIUS_PX * Math.cos(angle_rad)},${HEX_RADIUS_PX * Math.sin(angle_rad)}`;
  })
  .join(' ');

export const Board2D: React.FC<Board2DProps> = ({
  gameState,
  currentUserId,
  buildMode,
  onSelectVertex,
  onSelectEdge,
  onSelectHex,
}) => {
  const { hexes, vertices, edges, robberHexId } = gameState;

  // Pan & Zoom State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.15); // Default 1.15x for a nice large initial view
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, hasMoved: false });

  // Calculate SVG ViewBox dynamically based on board size with comfortable margin
  const baseViewBox = useMemo(() => {
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    hexes.forEach((h) => {
      if (h.center.x < minX) minX = h.center.x;
      if (h.center.x > maxX) maxX = h.center.x;
      if (h.center.z < minZ) minZ = h.center.z;
      if (h.center.z > maxZ) maxZ = h.center.z;
    });
    // Add extra padding for coastal harbors
    minX = minX * BASE_SCALE - HEX_RADIUS_PX - 90;
    maxX = maxX * BASE_SCALE + HEX_RADIUS_PX + 90;
    minZ = minZ * BASE_SCALE - HEX_RADIUS_PX - 90;
    maxZ = maxZ * BASE_SCALE + HEX_RADIUS_PX + 90;

    return {
      minX,
      minZ,
      width: maxX - minX,
      height: maxZ - minZ,
      cx: (minX + maxX) / 2,
      cy: (minZ + maxZ) / 2,
    };
  }, [hexes]);

  // Compute actual zoomed/panned viewBox string
  const currentViewBox = useMemo(() => {
    const w = baseViewBox.width / zoom;
    const h = baseViewBox.height / zoom;
    const x = baseViewBox.cx - w / 2 - pan.x;
    const y = baseViewBox.cy - h / 2 - pan.y;
    return `${x} ${y} ${w} ${h}`;
  }, [baseViewBox, zoom, pan]);

  // Handle Drag / Pan Events
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      hasMoved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStartRef.current.x) / zoom;
    const dy = (e.clientY - dragStartRef.current.y) / zoom;
    if (Math.hypot(dx, dy) > 8) {
      dragStartRef.current.hasMoved = true;
    }
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 2.5));
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.6));
  const handleResetView = () => {
    setZoom(1.15);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      className={`w-full h-full relative select-none overflow-hidden touch-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 1. FLOATING PAN / ZOOM CONTROLS (Top Right of board) */}
      <div className="absolute top-20 right-6 z-40 flex flex-col gap-2 pointer-events-auto font-catan">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-black/80 hover:bg-black border-2 border-catan-gold-trim/80 text-catan-gold-trim flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          title="Phóng to (Zoom In)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-black/80 hover:bg-black border-2 border-catan-gold-trim/80 text-catan-gold-trim flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          title="Thu nhỏ (Zoom Out)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 rounded-xl bg-black/80 hover:bg-black border-2 border-catan-gold-trim/80 text-catan-gold-trim flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          title="Căn giữa bàn cờ (Reset View)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. MAIN SVG CANVAS */}
      <svg
        viewBox={currentViewBox}
        className="w-full h-full drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)] overflow-visible"
      >
        <defs>
          {/* Hex Terrain Texture Patterns */}
          <pattern
            id="pat-forest"
            patternUnits="userSpaceOnUse"
            width={HEX_RADIUS_PX * 2}
            height={HEX_RADIUS_PX * 2}
            x={-HEX_RADIUS_PX}
            y={-HEX_RADIUS_PX}
          >
            <image
              href="/assets/hex_forest.jpg"
              x="0"
              y="0"
              width={HEX_RADIUS_PX * 2}
              height={HEX_RADIUS_PX * 2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <pattern
            id="pat-fields"
            patternUnits="userSpaceOnUse"
            width={HEX_RADIUS_PX * 2}
            height={HEX_RADIUS_PX * 2}
            x={-HEX_RADIUS_PX}
            y={-HEX_RADIUS_PX}
          >
            <image
              href="/assets/hex_fields.jpg"
              x="0"
              y="0"
              width={HEX_RADIUS_PX * 2}
              height={HEX_RADIUS_PX * 2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <pattern
            id="pat-mountains"
            patternUnits="userSpaceOnUse"
            width={HEX_RADIUS_PX * 2}
            height={HEX_RADIUS_PX * 2}
            x={-HEX_RADIUS_PX}
            y={-HEX_RADIUS_PX}
          >
            <image
              href="/assets/hex_mountains.jpg"
              x="0"
              y="0"
              width={HEX_RADIUS_PX * 2}
              height={HEX_RADIUS_PX * 2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <pattern
            id="pat-pasture"
            patternUnits="userSpaceOnUse"
            width={HEX_RADIUS_PX * 2}
            height={HEX_RADIUS_PX * 2}
            x={-HEX_RADIUS_PX}
            y={-HEX_RADIUS_PX}
          >
            <image
              href="/assets/hex_pasture.jpg"
              x="0"
              y="0"
              width={HEX_RADIUS_PX * 2}
              height={HEX_RADIUS_PX * 2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <pattern
            id="pat-hills"
            patternUnits="userSpaceOnUse"
            width={HEX_RADIUS_PX * 2}
            height={HEX_RADIUS_PX * 2}
            x={-HEX_RADIUS_PX}
            y={-HEX_RADIUS_PX}
          >
            <image
              href="/assets/hex_hills.jpg"
              x="0"
              y="0"
              width={HEX_RADIUS_PX * 2}
              height={HEX_RADIUS_PX * 2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          {/* Procedural gradient for Desert */}
          <radialGradient id="grad-desert" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dfc08f" />
            <stop offset="80%" stopColor="#c49b63" />
            <stop offset="100%" stopColor="#96703c" />
          </radialGradient>

          {/* Gold Token Shadow Filter */}
          <filter id="token-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.7" />
          </filter>

          <filter id="piece-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.85" />
          </filter>

          <filter id="road-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* 1. Coastal Sand Shore Outer Glow */}
        <g id="shores" opacity="0.85">
          {hexes.map((hex) => {
            const cx = hex.center.x * BASE_SCALE;
            const cy = hex.center.z * BASE_SCALE;
            return (
              <polygon
                key={`shore-${hex.id}`}
                points={HEX_POINTS}
                transform={`translate(${cx}, ${cy}) scale(1.12)`}
                fill="#d8b275"
                opacity="0.4"
                filter="blur(5px)"
              />
            );
          })}
        </g>

        {/* 2. Hex Tiles (Bàn Cờ Lục Giác) */}
        <g id="hexes">
          {hexes.map((hex) => {
            const cx = hex.center.x * BASE_SCALE;
            const cy = hex.center.z * BASE_SCALE;
            const isRobber = hex.id === robberHexId;
            const isInteractive = gameState.phase === 'turn_robber_move' && !isRobber;

            let fillPattern = TERRAIN_FALLBACK_COLORS[hex.terrain];
            if (hex.terrain === 'forest') fillPattern = 'url(#pat-forest)';
            else if (hex.terrain === 'fields') fillPattern = 'url(#pat-fields)';
            else if (hex.terrain === 'mountains') fillPattern = 'url(#pat-mountains)';
            else if (hex.terrain === 'pasture') fillPattern = 'url(#pat-pasture)';
            else if (hex.terrain === 'hills') fillPattern = 'url(#pat-hills)';
            else if (hex.terrain === 'desert') fillPattern = 'url(#grad-desert)';

            return (
              <g
                key={hex.id}
                transform={`translate(${cx}, ${cy})`}
                onClick={() => {
                  if (!dragStartRef.current.hasMoved && isInteractive) {
                    onSelectHex(hex.id);
                  }
                }}
                className={
                  isInteractive
                    ? 'cursor-pointer hover:opacity-85 transition-opacity'
                    : ''
                }
              >
                {/* 3D Hex Wooden Rim */}
                <polygon
                  points={HEX_POINTS}
                  fill="#c89d5c"
                  stroke="#5c3a21"
                  strokeWidth="5"
                />

                {/* Hex Texture Fill */}
                <polygon
                  points={HEX_POINTS}
                  fill={fillPattern}
                  stroke="#e8cca4"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />

                {/* Number Token */}
                {hex.numberToken && !isRobber && (
                  <g className="pointer-events-none" filter="url(#token-shadow)">
                    {/* Parchment circular coin */}
                    <circle
                      cx="0"
                      cy="0"
                      r="20"
                      fill="#fbf1db"
                      stroke="#78350f"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="17"
                      fill="none"
                      stroke="#d4b483"
                      strokeWidth="1"
                      strokeDasharray="3 1.5"
                    />

                    {/* Number Value */}
                    <text
                      x="0"
                      y="6"
                      textAnchor="middle"
                      fontSize="18"
                      fontWeight="900"
                      fill={
                        hex.numberToken === 6 || hex.numberToken === 8
                          ? '#dc2626'
                          : '#1c1917'
                      }
                      fontFamily="var(--font-playfair), Georgia, serif"
                    >
                      {hex.numberToken}
                    </text>

                    {/* Probability Dots/Pips */}
                    <g transform="translate(0, 13)">
                      {Array.from({
                        length: getProbabilityPips(hex.numberToken),
                      }).map((_, i, arr) => (
                        <circle
                          key={i}
                          cx={(i - (arr.length - 1) / 2) * 5}
                          cy="0"
                          r="1.8"
                          fill={
                            hex.numberToken === 6 || hex.numberToken === 8
                              ? '#dc2626'
                              : '#1c1917'
                          }
                        />
                      ))}
                    </g>
                  </g>
                )}

                {/* 3D Robber Pawn Piece */}
                {isRobber && (
                  <g className="pointer-events-none" filter="url(#piece-shadow)">
                    <ellipse cx="0" cy="9" rx="15" ry="7" fill="#020617" opacity="0.9" />
                    <path
                      d="M-9,9 C-8,1 -4,-4 -4,-10 C-8,-11 -8,-18 0,-18 C8,-18 8,-11 4,-10 C4,-4 8,1 9,9 Z"
                      fill="#1e293b"
                      stroke="#020617"
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="-15" r="7" fill="#334155" />
                    <circle cx="-2" cy="-17" r="2.5" fill="#94a3b8" opacity="0.7" />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 3. Harbor Ports (Bến Cảng Ven Biển) */}
        <g id="ports">
          {vertices
            .filter((v) => v.port)
            .map((vertex) => {
              const cx = vertex.position.x * BASE_SCALE;
              const cy = vertex.position.z * BASE_SCALE;
              const port = vertex.port!;
              const icon = port.resource
                ? PORT_RESOURCE_ICONS[port.resource]
                : '3:1';

              return (
                <g key={`port-${vertex.id}`} transform={`translate(${cx}, ${cy})`}>
                  {/* Wooden Pier Bridge */}
                  <line
                    x1="0"
                    y1="0"
                    x2={cx > 0 ? 18 : -18}
                    y2={cy > 0 ? 18 : -18}
                    stroke="#5c3a21"
                    strokeWidth="7"
                    strokeLinecap="round"
                    filter="url(#token-shadow)"
                  />
                  {/* Port Flag Token */}
                  <g
                    transform={`translate(${cx > 0 ? 25 : -25}, ${
                      cy > 0 ? 25 : -25
                    })`}
                    filter="url(#token-shadow)"
                  >
                    <rect
                      x="-16"
                      y="-14"
                      width="32"
                      height="28"
                      rx="7"
                      fill="#fbf1db"
                      stroke="#78350f"
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="900"
                      fill="#3d2314"
                      fontFamily="var(--font-playfair), serif"
                    >
                      {icon}
                    </text>
                  </g>
                </g>
              );
            })}
        </g>

        {/* 4. Roads (Đường Đi Bằng Gỗ 3D Nổi Bật - 14px Thick) */}
        <g id="edges">
          {edges.map((edge) => {
            const v1 = vertices.find((v) => v.id === edge.vertexIds[0]);
            const v2 = vertices.find((v) => v.id === edge.vertexIds[1]);
            if (!v1 || !v2) return null;

            const x1 = v1.position.x * BASE_SCALE;
            const y1 = v1.position.z * BASE_SCALE;
            const x2 = v2.position.x * BASE_SCALE;
            const y2 = v2.position.z * BASE_SCALE;

            const hasRoad = !!edge.road;
            const player = hasRoad
              ? gameState.players.find((p) => p.id === edge.road?.playerId)
              : null;
            const roadColor = player
              ? COLOR_MAP[player.color]
              : (edge.road?.color && COLOR_MAP[edge.road.color]) || '#00d2ff';

            const isInteractive =
              !hasRoad &&
              (buildMode === 'road' ||
                (gameState.phase === 'turn_actions' &&
                  gameState.roadBuildingRoadsRemaining > 0) ||
                (gameState.phase.startsWith('setup_') &&
                  gameState.setupSubStep === 'place_road' &&
                  (!gameState.setupLastPlacedVertexId ||
                    edge.vertexIds.includes(gameState.setupLastPlacedVertexId))));

            return (
              <g
                key={edge.id}
                onClick={() => {
                  if (!dragStartRef.current.hasMoved && isInteractive) {
                    onSelectEdge(edge.id);
                  }
                }}
              >
                {/* Generous Hitbox for click/touch */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="34"
                  className={isInteractive ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                />

                {/* Built Road Piece (Thick 3D Solid Wooden Road - 14px) */}
                {hasRoad ? (
                  <g>
                    {/* 1. Deep Drop Shadow Underlay */}
                    <line
                      x1={x1}
                      y1={y1 + 3}
                      x2={x2}
                      y2={y2 + 3}
                      stroke="#000000"
                      strokeWidth="16"
                      strokeLinecap="round"
                      opacity="0.65"
                    />
                    {/* 2. Dark Bevel Outer Border */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#020617"
                      strokeWidth="15"
                      strokeLinecap="round"
                    />
                    {/* 3. Main Vibrant Player Color Road Bar */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={roadColor}
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    {/* 4. 3D Top Highlight Gloss Core */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      opacity="0.65"
                    />
                  </g>
                ) : (
                  isInteractive && (
                    <g>
                      {/* 1. Wide Ambient Yellow Glow Bar */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#f59e0b"
                        strokeWidth="16"
                        strokeLinecap="round"
                        opacity="0.4"
                        className="animate-pulse"
                      />
                      {/* 2. Main Pulsing Dashed Gold Line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#fde047"
                        strokeWidth="8"
                        strokeDasharray="8 5"
                        strokeLinecap="round"
                        className="animate-pulse cursor-pointer hover:stroke-white hover:stroke-width-11 transition-all"
                      />
                    </g>
                  )
                )}
              </g>
            );
          })}
        </g>

        {/* 5. Vertices (Làng & Thành Phố 3D) */}
        <g id="vertices">
          {vertices.map((vertex) => {
            const cx = vertex.position.x * BASE_SCALE;
            const cy = vertex.position.z * BASE_SCALE;

            const hasBuilding = !!vertex.building;
            const player = hasBuilding
              ? gameState.players.find((p) => p.id === vertex.building?.playerId)
              : null;
            const buildingColor = player
              ? COLOR_MAP[player.color]
              : (vertex.building?.color && COLOR_MAP[vertex.building.color]) || '#00e676';

            const canBuildHere =
              buildMode === 'settlement' ||
              (gameState.phase.startsWith('setup_') &&
                gameState.setupSubStep === 'place_settlement');
            const canUpgrade =
              buildMode === 'city' &&
              vertex.building?.playerId === currentUserId &&
              vertex.building.type === 'settlement';
            const isInteractive = (!hasBuilding && canBuildHere) || canUpgrade;

            return (
              <g
                key={vertex.id}
                transform={`translate(${cx}, ${cy})`}
                onClick={() => {
                  if (!dragStartRef.current.hasMoved && isInteractive) {
                    onSelectVertex(vertex.id);
                  }
                }}
                className={isInteractive ? 'cursor-pointer' : 'pointer-events-none'}
              >
                {/* Hitbox */}
                <circle
                  cx="0"
                  cy="0"
                  r="24"
                  fill="transparent"
                  className={isInteractive ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                />

                {hasBuilding ? (
                  vertex.building!.type === 'settlement' ? (
                    /* 3D Settlement (Ngôi Làng Gỗ) */
                    <g filter="url(#piece-shadow)" className="cursor-default">
                      <ellipse cx="0" cy="10" rx="15" ry="6" fill="#000" opacity="0.6" />
                      <polygon
                        points="-11,9 11,9 11,-2 0,-14 -11,-2"
                        fill={buildingColor}
                        stroke="#0f172a"
                        strokeWidth="3"
                      />
                      <polygon
                        points="-10,-2 0,-12 10,-2 0,-8"
                        fill="#ffffff"
                        opacity="0.45"
                      />
                      <rect x="-3" y="2" width="6" height="7" fill="#0f172a" rx="1" />
                    </g>
                  ) : (
                    /* 3D City (Thành Phố Pháo Đài) */
                    <g filter="url(#piece-shadow)" className="cursor-default">
                      <ellipse cx="0" cy="12" rx="18" ry="7" fill="#000" opacity="0.6" />
                      <polygon
                        points="-16,11 16,11 16,-2 7,-2 7,-16 -7,-16 -7,-2 -16,-2"
                        fill={buildingColor}
                        stroke="#0f172a"
                        strokeWidth="3"
                      />
                      <polygon
                        points="-7,-16 0,-23 7,-16"
                        fill="#fbbf24"
                        stroke="#0f172a"
                        strokeWidth="2.5"
                      />
                      <rect x="-3" y="3" width="6" height="8" fill="#0f172a" rx="1" />
                    </g>
                  )
                ) : (
                  isInteractive && (
                    <g className="cursor-pointer hover:scale-125 transition-transform">
                      <circle
                        cx="0"
                        cy="0"
                        r="14"
                        fill="#fbbf24"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="animate-ping opacity-80"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="10"
                        fill="#f59e0b"
                        stroke="#78350f"
                        strokeWidth="2.5"
                        filter="url(#token-shadow)"
                      />
                    </g>
                  )
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
