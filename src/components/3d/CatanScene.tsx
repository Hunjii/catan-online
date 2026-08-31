'use client';

import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { GameState, Vertex, Edge } from '@/lib/catan/types';
import { HexTile3D } from './HexTile3D';
import { Settlement3D } from './Settlement3D';
import { City3D } from './City3D';
import { Road3D } from './Road3D';
import { Robber3D } from './Robber3D';
import { Harbor3D } from './Harbor3D';
import { DiceRoller3D } from './DiceRoller3D';
import { VertexHighlight, EdgeHighlight } from './BoardHighlight';
import { isValidSettlementPlacement, isValidRoadPlacement } from '@/lib/catan/engine';

interface CatanSceneProps {
  gameState: GameState;
  currentUserId: string;
  buildMode: 'none' | 'road' | 'settlement' | 'city';
  onSelectVertex: (vertexId: string) => void;
  onSelectEdge: (edgeId: string) => void;
  onSelectHex: (hexId: number) => void;
}

export const CatanScene: React.FC<CatanSceneProps> = ({
  gameState,
  currentUserId,
  buildMode,
  onSelectVertex,
  onSelectEdge,
  onSelectHex,
}) => {
  const activePlayerId = gameState.playerOrder[gameState.activePlayerIndex];
  const isMyTurn = activePlayerId === currentUserId;

  // Determine eligible vertices for highlight
  const validVertices = useMemo(() => {
    if (!isMyTurn) return [];

    if (gameState.phase === 'setup_round_1' || gameState.phase === 'setup_round_2') {
      if (gameState.setupSubStep === 'place_settlement') {
        return gameState.vertices.filter((v) =>
          isValidSettlementPlacement(gameState, v.id, currentUserId, true)
        );
      }
    } else if (gameState.phase === 'turn_actions') {
      if (buildMode === 'settlement') {
        return gameState.vertices.filter((v) =>
          isValidSettlementPlacement(gameState, v.id, currentUserId, false)
        );
      }
      if (buildMode === 'city') {
        return gameState.vertices.filter(
          (v) => v.building?.type === 'settlement' && v.building.playerId === currentUserId
        );
      }
    }
    return [];
  }, [gameState, currentUserId, isMyTurn, buildMode]);

  // Determine eligible edges for highlight
  const validEdges = useMemo(() => {
    if (!isMyTurn) return [];

    if (gameState.phase === 'setup_round_1' || gameState.phase === 'setup_round_2') {
      if (gameState.setupSubStep === 'place_road') {
        // Must connect to the player's most recently placed settlement
        const playerSettlements = gameState.vertices.filter(
          (v) => v.building?.playerId === currentUserId && v.building.type === 'settlement'
        );
        const latestSettlement = playerSettlements[playerSettlements.length - 1];
        return gameState.edges.filter((e) =>
          isValidRoadPlacement(gameState, e.id, currentUserId, latestSettlement?.id)
        );
      }
    } else if (gameState.phase === 'turn_actions') {
      if (buildMode === 'road' || gameState.roadBuildingRoadsRemaining > 0) {
        return gameState.edges.filter((e) =>
          isValidRoadPlacement(gameState, e.id, currentUserId)
        );
      }
    }
    return [];
  }, [gameState, currentUserId, isMyTurn, buildMode]);

  const isSelectingRobberHex =
    isMyTurn &&
    gameState.phase === 'turn_robber_move';

  // Get active robber tile
  const robberHex = gameState.hexes.find((h) => h.id === gameState.robberHexId);

  // Player Map for quick color lookup
  const playerMap = useMemo(() => {
    const map = new Map<string, { color: any; pieceStyle: any }>();
    gameState.players.forEach((p) =>
      map.set(p.id, { color: p.color, pieceStyle: p.pieceStyle })
    );
    return map;
  }, [gameState.players]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 22, 20], fov: 42 }}
        shadows
      >
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[10, 25, 10]} inclination={0.6} azimuth={0.25} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[15, 30, 15]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 15, -10]} intensity={0.4} color="#ffd166" />

          {/* Ocean Water Plane */}
          <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.2} />
          </mesh>

          {/* Island Hexes */}
          <group>
            {gameState.hexes.map((hex) => (
              <HexTile3D
                key={hex.id}
                hex={hex}
                isSelectableForRobber={isSelectingRobberHex && hex.id !== gameState.robberHexId}
                onHexClick={(hexId) => {
                  if (isSelectingRobberHex) {
                    onSelectHex(hexId);
                  }
                }}
              />
            ))}
          </group>

          {/* Harbors / Ports */}
          <group>
            {gameState.vertices
              .filter((v) => v.port !== null)
              .map((v) => (
                <Harbor3D key={`port_${v.id}`} position={v.position} port={v.port!} />
              ))}
          </group>

          {/* Placed Roads */}
          <group>
            {gameState.edges
              .filter((e) => e.road !== null)
              .map((e) => {
                const pInfo = playerMap.get(e.road!.playerId);
                return (
                  <Road3D
                    key={`road_${e.id}`}
                    position={e.position}
                    rotationY={e.rotationY}
                    color={pInfo?.color || 'red'}
                    pieceStyle={pInfo?.pieceStyle}
                  />
                );
              })}
          </group>

          {/* Placed Settlements & Cities */}
          <group>
            {gameState.vertices
              .filter((v) => v.building !== null)
              .map((v) => {
                const pInfo = playerMap.get(v.building!.playerId);
                if (v.building!.type === 'city') {
                  return (
                    <City3D
                      key={`bldg_${v.id}`}
                      position={v.position}
                      color={pInfo?.color || 'red'}
                      pieceStyle={pInfo?.pieceStyle}
                    />
                  );
                }
                return (
                  <Settlement3D
                    key={`bldg_${v.id}`}
                    position={v.position}
                    color={pInfo?.color || 'red'}
                    pieceStyle={pInfo?.pieceStyle}
                  />
                );
              })}
          </group>

          {/* Robber */}
          {robberHex && <Robber3D position={robberHex.center} />}

          {/* 3D Dice Display */}
          <DiceRoller3D lastRoll={gameState.lastDiceRoll} />

          {/* Highlight Eligible Vertices (for building settlement/city) */}
          <group>
            {validVertices.map((v) => (
              <VertexHighlight
                key={`hl_v_${v.id}`}
                vertex={v}
                type={buildMode === 'city' ? 'city' : 'settlement'}
                color={buildMode === 'city' ? '#38bdf8' : '#22c55e'}
                onSelect={onSelectVertex}
              />
            ))}
          </group>

          {/* Highlight Eligible Edges (for building roads) */}
          <group>
            {validEdges.map((e) => (
              <EdgeHighlight
                key={`hl_e_${e.id}`}
                edge={e}
                color="#f59e0b"
                onSelect={onSelectEdge}
              />
            ))}
          </group>

          <OrbitControls
            maxPolarAngle={Math.PI / 2.2}
            minDistance={10}
            maxDistance={40}
            target={[0, 0, 0]}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
