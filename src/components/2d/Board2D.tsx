'use client';

import React, { useMemo, useState, useRef } from 'react';
import { GameState, COLOR_MAP, PlayerColor } from '@/lib/catan/types';
import { getProbabilityPips } from '@/lib/catan/board';
import { isValidRoadPlacement, isValidSettlementPlacement } from '@/lib/catan/engine';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const BASE_SCALE = 36; // 1 unit = 36px (Tăng kích thước hex to rõ)
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

const PORT_IMAGE_MAP: Record<string, string> = {
  wood: '/assets/ingame/ingame_port_wood.png',
  brick: '/assets/ingame/ingame_port_brick.png',
  sheep: '/assets/ingame/ingame_port_sheep.png',
  wheat: '/assets/ingame/ingame_port_wheat.png',
  ore: '/assets/ingame/ingame_port_ore.png',
  generic: '/assets/ingame/ingame_port_generic.png',
};

const SETTLEMENT_IMAGE_MAP: Record<string, string> = {
  blue: '/assets/ingame/ingame_settlement_lvl1_blue.png',
  red: '/assets/ingame/ingame_settlement_lvl1_red.png',
  green: '/assets/ingame/ingame_settlement_lvl1_green.png',
  yellow: '/assets/ingame/ingame_settlement_lvl1_yellow.png',
  orange: '/assets/ingame/ingame_settlement_lvl1_orange.png',
  brown: '/assets/ingame/ingame_settlement_lvl1_brown.png',
  white: '/assets/ingame/ingame_settlement_lvl1_yellow.png',
  purple: '/assets/ingame/ingame_settlement_lvl1_blue.png',
};

const CITY_IMAGE_MAP: Record<string, string> = {
  blue: '/assets/ingame/ingame_settlement_lvl2_blue.png',
  red: '/assets/ingame/ingame_settlement_lvl2_red.png',
  green: '/assets/ingame/ingame_settlement_lvl2_green.png',
  yellow: '/assets/ingame/ingame_settlement_lvl2_yellow.png',
  orange: '/assets/ingame/ingame_settlement_lvl2_orange.png',
  brown: '/assets/ingame/ingame_settlement_lvl2_brown.png',
  white: '/assets/ingame/ingame_settlement_lvl2_yellow.png',
  purple: '/assets/ingame/ingame_settlement_lvl2_blue.png',
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
  const [zoom, setZoom] = useState(1.0); // Default 1.0x fits the full board nicely in center
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, hasMoved: false });

  // Only allow panning when zoomed in (> 1.02x)
  const canPan = zoom > 1.02;

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
    // Comfortable padding around the island and harbors, scaling down the hex tiles slightly
    const PADDING_PX = 72;
    minX = minX * BASE_SCALE - HEX_RADIUS_PX - PADDING_PX;
    maxX = maxX * BASE_SCALE + HEX_RADIUS_PX + PADDING_PX;
    minZ = minZ * BASE_SCALE - HEX_RADIUS_PX - PADDING_PX;
    maxZ = maxZ * BASE_SCALE + HEX_RADIUS_PX + PADDING_PX;

    const width = maxX - minX;
    const height = maxZ - minZ;
    const cx = (minX + maxX) / 2;
    const cy = (minZ + maxZ) / 2;

    // Frame size hugging the island with natural sea margin
    const frameHeight = height * 1.10;
    const frameWidth = Math.max(width * 1.15, frameHeight * 1.34);

    return {
      minX,
      minZ,
      width,
      height,
      cx,
      cy,
      frameWidth,
      frameHeight,
    };
  }, [hexes]);

  // Compute actual zoomed/panned viewBox string
  const currentViewBox = useMemo(() => {
    const w = baseViewBox.width / zoom;
    const h = baseViewBox.height / zoom;
    const effectivePanX = canPan ? pan.x : 0;
    const effectivePanY = canPan ? pan.y : 0;
    const x = baseViewBox.cx - w / 2 - effectivePanX;
    const y = baseViewBox.cy - h / 2 - effectivePanY;
    return `${x} ${y} ${w} ${h}`;
  }, [baseViewBox, zoom, pan, canPan]);

  // Compute unified harbor port structures along coastal edges
  const portStructures = useMemo(() => {
    const list: {
      id: string;
      port: NonNullable<(typeof vertices)[0]['port']>;
      portX: number;
      portY: number;
      v1X: number;
      v1Y: number;
      v2X: number;
      v2Y: number;
    }[] = [];

    // Group ports by coastal edges connecting 2 port vertices of same type
    edges.forEach((edge) => {
      const v1 = vertices.find((v) => v.id === edge.vertexIds[0]);
      const v2 = vertices.find((v) => v.id === edge.vertexIds[1]);
      if (v1?.port && v2?.port && v1.port.type === v2.port.type) {
        const v1X = v1.position.x * BASE_SCALE;
        const v1Y = v1.position.z * BASE_SCALE;
        const v2X = v2.position.x * BASE_SCALE;
        const v2Y = v2.position.z * BASE_SCALE;

        const midX = (v1X + v2X) / 2;
        const midY = (v1Y + v2Y) / 2;
        const distFromCenter = Math.hypot(midX, midY) || 1;
        const offset = 34; // Distance outward into sea
        const portX = midX + (midX / distFromCenter) * offset;
        const portY = midY + (midY / distFromCenter) * offset;

        list.push({
          id: `port-structure-${edge.id}`,
          port: v1.port,
          portX,
          portY,
          v1X,
          v1Y,
          v2X,
          v2Y,
        });
      }
    });

    // Fallback if any lone port vertex exists
    if (list.length === 0) {
      vertices.filter((v) => v.port).forEach((v) => {
        const vx = v.position.x * BASE_SCALE;
        const vy = v.position.z * BASE_SCALE;
        const dist = Math.hypot(vx, vy) || 1;
        list.push({
          id: `port-vertex-${v.id}`,
          port: v.port!,
          portX: vx + (vx / dist) * 30,
          portY: vy + (vy / dist) * 30,
          v1X: vx,
          v1Y: vy,
          v2X: vx,
          v2Y: vy,
        });
      });
    }

    return list;
  }, [edges, vertices]);

  // Handle Drag / Pan Events (Only active when zoomed in)
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      hasMoved: false,
    };
    if (e.button !== 0 || !canPan) return;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !canPan) return;
    const dx = (e.clientX - dragStartRef.current.x) / zoom;
    const dy = (e.clientY - dragStartRef.current.y) / zoom;
    if (Math.hypot(dx, dy) > 8) {
      dragStartRef.current.hasMoved = true;
    }
    const maxPanX = (baseViewBox.width * (zoom - 1)) / (2 * zoom);
    const maxPanY = (baseViewBox.height * (zoom - 1)) / (2 * zoom);
    const newX = dragStartRef.current.panX + dx;
    const newY = dragStartRef.current.panY + dy;
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((prev) => {
      const nextZoom = Math.min(Math.max(prev * zoomFactor, 1.0), 2.3);
      if (nextZoom <= 1.02) {
        setPan({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 2.3));
  const handleZoomOut = () => {
    setZoom((z) => {
      const nextZoom = Math.max(z / 1.2, 1.0);
      if (nextZoom <= 1.02) {
        setPan({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      className={`ingame-board-stage w-full h-full relative select-none overflow-hidden touch-none ${
        canPan ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 1. FLOATING PAN / ZOOM CONTROLS (Shifted left to avoid Action Panel overlap) */}
      <div className="absolute right-[4.5rem] sm:right-[6rem] md:right-[7.5rem] top-3 z-40 flex flex-col gap-1.5 pointer-events-auto font-catan">
        <button
          onClick={handleZoomIn}
          className="ingame-icon-button h-9 w-9 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="Phóng to (Zoom In)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="ingame-icon-button h-9 w-9 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="Thu nhỏ (Zoom Out)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="ingame-icon-button h-9 w-9 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="Căn giữa bàn cờ (Reset View)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. MAIN SVG CANVAS */}
      <svg
        viewBox={currentViewBox}
        className="relative z-10 h-full w-full overflow-visible drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)]"
      >
        <defs>
          {/* Ocean Water Pattern */}
          <pattern
            id="pat-ocean"
            patternUnits="userSpaceOnUse"
            width="512"
            height="512"
          >
            <image
              href="/assets/ingame/ingame_board_frame.png"
              x="0"
              y="0"
              width="512"
              height="512"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          {/* Ocean Radial Depth Gradient */}
          <radialGradient id="grad-ocean-vignette" cx="50%" cy="50%" r="50%">
            <stop offset="35%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="80%" stopColor="#0369a1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#082f49" stopOpacity="0.85" />
          </radialGradient>

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

          <pattern
            id="pat-desert"
            patternUnits="userSpaceOnUse"
            width={HEX_RADIUS_PX * 2}
            height={HEX_RADIUS_PX * 2}
            x={-HEX_RADIUS_PX}
            y={-HEX_RADIUS_PX}
          >
            <image
              href="/assets/ingame/hex_desert.png"
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

          {/* Robber Active Pulsing Glow & Target Aura */}
          <filter id="robber-active-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="1" />
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#f59e0b" floodOpacity="0.85" />
          </filter>

          <filter id="hex-target-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 0. INTEGRATED OCEAN & BOARD FRAME (Using /assets/ingame/ingame_board_frame.png) */}
        <g id="ocean-backdrop" className="pointer-events-none">
          {/* Main Board Frame & Sea Image */}
          <image
            href="/assets/ingame/ingame_board_frame.png"
            x={baseViewBox.cx - baseViewBox.frameWidth / 2}
            y={baseViewBox.cy - baseViewBox.frameHeight / 2}
            width={baseViewBox.frameWidth}
            height={baseViewBox.frameHeight}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Island Coral Reef & Shallow Blue Water */}
          <g opacity="0.6">
            {hexes.map((hex) => {
              const cx = hex.center.x * BASE_SCALE;
              const cy = hex.center.z * BASE_SCALE;
              return (
                <polygon
                  key={`shallow-${hex.id}`}
                  points={HEX_POINTS}
                  transform={`translate(${cx}, ${cy}) scale(1.3)`}
                  fill="#38bdf8"
                  opacity="0.18"
                  filter="blur(12px)"
                />
              );
            })}
          </g>
        </g>

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
            const isRobberMovePhase = gameState.phase === 'turn_robber_move';
            const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
            const isMyTurn = currentUserId === activePlayerId;
            const isInteractive = isRobberMovePhase && !isRobber && isMyTurn;

            let fillPattern = TERRAIN_FALLBACK_COLORS[hex.terrain];
            if (hex.terrain === 'forest') fillPattern = 'url(#pat-forest)';
            else if (hex.terrain === 'fields') fillPattern = 'url(#pat-fields)';
            else if (hex.terrain === 'mountains') fillPattern = 'url(#pat-mountains)';
            else if (hex.terrain === 'pasture') fillPattern = 'url(#pat-pasture)';
            else if (hex.terrain === 'hills') fillPattern = 'url(#pat-hills)';
            else if (hex.terrain === 'desert') fillPattern = 'url(#pat-desert)';

            return (
              <g
                key={hex.id}
                transform={`translate(${cx}, ${cy})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInteractive && !dragStartRef.current.hasMoved) {
                    onSelectHex(hex.id);
                  }
                }}
                className={
                  isInteractive
                    ? 'cursor-pointer group pointer-events-auto transition-transform'
                    : 'pointer-events-none'
                }
                style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
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

                {/* Pulsing Hex Highlight when in Robber Placement Phase */}
                {isInteractive && (
                  <polygon
                    points={HEX_POINTS}
                    fill="rgba(245, 158, 11, 0.12)"
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeDasharray="10 6"
                    className="animate-pulse"
                    filter="url(#hex-target-glow)"
                  />
                )}

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

                {/* Ghost Robber Hover Placement Preview on valid target hex */}
                {isInteractive && (
                  <g className="opacity-0 group-hover:opacity-90 transition-opacity duration-150 pointer-events-none">
                    <circle
                      cx="0"
                      cy="-5"
                      r="36"
                      fill="rgba(239, 68, 68, 0.25)"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="6 3"
                    />
                    <image
                      href="/assets/ingame/ingame_robber_piece.png"
                      x="-28"
                      y="-45"
                      width="56"
                      height="72"
                      opacity="0.85"
                      filter="url(#robber-active-glow)"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}

                {/* 3D Robber Pawn Piece (Enhanced when in active placement phase) */}
                {isRobber && (
                  isRobberMovePhase && isMyTurn ? (
                    <g className="pointer-events-none">
                      {/* 1. Pulsing Red & Amber Beacon Aura */}
                      <circle
                        cx="0"
                        cy="-5"
                        r="44"
                        fill="rgba(239, 68, 68, 0.2)"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        className="animate-ping"
                      />
                      <circle
                        cx="0"
                        cy="-5"
                        r="34"
                        fill="rgba(245, 158, 11, 0.25)"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray="6 3"
                      />

                      {/* 2. Floating Animated Robber Piece with gentle bobbing */}
                      <g className="animate-gentle-bob">
                        <g filter="url(#robber-active-glow)">
                          <image
                            href="/assets/ingame/ingame_robber_piece.png"
                            x="-30"
                            y="-48"
                            width="60"
                            height="76"
                            preserveAspectRatio="xMidYMid meet"
                          />
                        </g>

                        {/* 3. Floating "MOVE ROBBER" Badge above piece */}
                        <g transform="translate(0, -58)" filter="url(#token-shadow)">
                          <rect
                            x="-40"
                            y="-12"
                            width="80"
                            height="22"
                            rx="6"
                            fill="#7f1d1d"
                            stroke="#facc15"
                            strokeWidth="1.8"
                          />
                          <text
                            x="0"
                            y="3.5"
                            textAnchor="middle"
                            fontSize="9.5"
                            fontWeight="900"
                            fill="#fef08a"
                            fontFamily="var(--font-cinzel), Georgia, serif"
                            letterSpacing="0.5"
                          >
                            MOVE ROBBER
                          </text>
                        </g>
                      </g>
                    </g>
                  ) : (
                    <g className="pointer-events-none" filter="url(#piece-shadow)">
                      <image
                        href="/assets/ingame/ingame_robber_piece.png"
                        x="-28"
                        y="-45"
                        width="56"
                        height="72"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )
                )}
              </g>
            );
          })}
        </g>

        {/* 3. Harbor Ports (Bến Cảng Ven Biển với Asset Hình Ảnh & Tỷ Lệ Dynamic) */}
        <g id="ports">
          {portStructures.map((item) => {
            const portImg = item.port.resource
              ? PORT_IMAGE_MAP[item.port.resource]
              : PORT_IMAGE_MAP.generic;
            const ratioLabel = `${item.port.ratio}:1`;

            return (
              <g key={item.id} className="pointer-events-none">
                {/* Dual Wooden Dock Bridges to the 2 Coast Vertices */}
                <line
                  x1={item.portX}
                  y1={item.portY}
                  x2={item.v1X}
                  y2={item.v1Y}
                  stroke="#3a200f"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter="url(#token-shadow)"
                />
                <line
                  x1={item.portX}
                  y1={item.portY}
                  x2={item.v1X}
                  y2={item.v1Y}
                  stroke="#a87139"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <line
                  x1={item.portX}
                  y1={item.portY}
                  x2={item.v2X}
                  y2={item.v2Y}
                  stroke="#3a200f"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter="url(#token-shadow)"
                />
                <line
                  x1={item.portX}
                  y1={item.portY}
                  x2={item.v2X}
                  y2={item.v2Y}
                  stroke="#a87139"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Port Asset Icon Image */}
                <g filter="url(#piece-shadow)">
                  <image
                    href={portImg}
                    x={item.portX - 22}
                    y={item.portY - 22}
                    width="44"
                    height="44"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* Dynamic Ratio Badge (2:1 or 3:1) */}
                <g
                  transform={`translate(${item.portX}, ${item.portY + 16})`}
                  filter="url(#token-shadow)"
                >
                  {/* Badge Background Pill */}
                  <rect
                    x="-14"
                    y="-7"
                    width="28"
                    height="14"
                    rx="4"
                    fill="#180e06"
                    stroke="#d4a034"
                    strokeWidth="1.2"
                  />
                  {/* Ratio Text */}
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="900"
                    fill="#fef08a"
                    fontFamily="var(--font-cinzel), Georgia, serif"
                  >
                    {ratioLabel}
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

            const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
            const isMyTurn = currentUserId === activePlayerId;

            const isSetupRoad =
              isMyTurn &&
              gameState.phase.startsWith('setup_') &&
              gameState.setupSubStep === 'place_road';

            const isNormalRoad =
              isMyTurn &&
              gameState.phase === 'turn_actions' &&
              (buildMode === 'road' || gameState.roadBuildingRoadsRemaining > 0);

            let isInteractive = false;
            if (!hasRoad) {
              if (isSetupRoad) {
                const targetVertexId =
                  gameState.setupLastPlacedVertexId ||
                  gameState.vertices
                    .filter(
                      (v) =>
                        v.building?.playerId === activePlayerId &&
                        v.building.type === 'settlement'
                    )
                    .pop()?.id;
                isInteractive = isValidRoadPlacement(
                  gameState,
                  edge.id,
                  activePlayerId,
                  targetVertexId
                );
              } else if (isNormalRoad) {
                isInteractive = isValidRoadPlacement(
                  gameState,
                  edge.id,
                  activePlayerId
                );
              }
            }

            return (
              <g
                key={edge.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInteractive && !dragStartRef.current.hasMoved) {
                    onSelectEdge(edge.id);
                  }
                }}
                className={isInteractive ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
              >
                {/* Generous Hitbox for click/touch */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(0,0,0,0.001)"
                  strokeWidth="38"
                  strokeLinecap="round"
                  className={isInteractive ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                  style={{ pointerEvents: isInteractive ? 'stroke' : 'none' }}
                />

                {/* Built Road Piece (Thick 3D Solid Wooden Road - 14px) */}
                {hasRoad ? (
                  <g style={{ pointerEvents: 'none' }}>
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
                    <g style={{ pointerEvents: 'none' }}>
                      {/* 1. Wide Ambient Yellow Glow Bar */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#f59e0b"
                        strokeWidth="18"
                        strokeLinecap="round"
                        opacity="0.45"
                        className="animate-pulse"
                      />
                      {/* 2. Main Pulsing Dashed Gold Line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#fde047"
                        strokeWidth="9"
                        strokeDasharray="8 5"
                        strokeLinecap="round"
                        className="animate-pulse"
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
            const playerColor =
              player?.color || (vertex.building?.color as PlayerColor) || 'blue';

            const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
            const isMyTurn = currentUserId === activePlayerId;

            const isSetupSettlement =
              isMyTurn &&
              gameState.phase.startsWith('setup_') &&
              gameState.setupSubStep === 'place_settlement';

            const isNormalSettlement =
              isMyTurn &&
              gameState.phase === 'turn_actions' &&
              buildMode === 'settlement';

            const canBuildHere =
              !hasBuilding &&
              ((isSetupSettlement &&
                isValidSettlementPlacement(gameState, vertex.id, activePlayerId, true)) ||
                (isNormalSettlement &&
                  isValidSettlementPlacement(gameState, vertex.id, activePlayerId, false)));

            const canUpgrade =
              isMyTurn &&
              gameState.phase === 'turn_actions' &&
              buildMode === 'city' &&
              vertex.building?.playerId === currentUserId &&
              vertex.building.type === 'settlement';
            const isInteractive = canBuildHere || canUpgrade;

            return (
              <g
                key={vertex.id}
                transform={`translate(${cx}, ${cy})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInteractive && !dragStartRef.current.hasMoved) {
                    onSelectVertex(vertex.id);
                  }
                }}
                className={isInteractive ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
              >
                {/* Hitbox */}
                <circle
                  cx="0"
                  cy="0"
                  r="26"
                  fill="rgba(0,0,0,0.001)"
                  className={isInteractive ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                  style={{ pointerEvents: isInteractive ? 'all' : 'none' }}
                />

                {hasBuilding ? (
                  vertex.building!.type === 'settlement' ? (
                    /* 3D Settlement Piece (Nhà cấp 1) */
                    <g filter="url(#piece-shadow)" className="cursor-default" style={{ pointerEvents: 'none' }}>
                      <ellipse cx="0" cy="5" rx="14" ry="5.5" fill="#000000" opacity="0.45" />
                      <image
                        href={SETTLEMENT_IMAGE_MAP[playerColor] || SETTLEMENT_IMAGE_MAP.blue}
                        x="-20"
                        y="-25"
                        width="40"
                        height="36"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  ) : (
                    /* 3D City Piece (Nhà cấp 2) */
                    <g filter="url(#piece-shadow)" className="cursor-default" style={{ pointerEvents: 'none' }}>
                      <ellipse cx="0" cy="6" rx="18" ry="6.5" fill="#000000" opacity="0.5" />
                      <image
                        href={CITY_IMAGE_MAP[playerColor] || CITY_IMAGE_MAP.blue}
                        x="-24"
                        y="-29"
                        width="48"
                        height="40"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )
                ) : (
                  isInteractive && (
                    <g className="cursor-pointer" style={{ pointerEvents: 'none' }}>
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
