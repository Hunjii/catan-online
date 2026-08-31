'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { HexTile } from '@/lib/catan/types';
import { HEX_RADIUS, getProbabilityPips } from '@/lib/catan/board';

interface HexTile3DProps {
  hex: HexTile;
  isHovered?: boolean;
  isSelectableForRobber?: boolean;
  onHexClick?: (hexId: number) => void;
}

const TERRAIN_COLORS: Record<string, string> = {
  forest: '#2d6a4f',
  hills: '#b7410e',
  pasture: '#70e000',
  fields: '#fca311',
  mountains: '#6c757d',
  desert: '#e9d8a6',
};

export const HexTile3D: React.FC<HexTile3DProps> = ({
  hex,
  isSelectableForRobber = false,
  onHexClick,
}) => {
  const pips = useMemo(() => getProbabilityPips(hex.numberToken), [hex.numberToken]);
  const isRedNumber = hex.numberToken === 6 || hex.numberToken === 8;

  // Hexagon geometry with radius
  const hexGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(HEX_RADIUS, HEX_RADIUS, 0.4, 6);
  }, []);

  return (
    <group
      position={[hex.center.x, 0, hex.center.z]}
      onClick={(e) => {
        e.stopPropagation();
        if (onHexClick) onHexClick(hex.id);
      }}
    >
      {/* Main Hex Base */}
      <mesh
        geometry={hexGeometry}
        position={[0, 0.2, 0]}
        rotation={[0, Math.PI / 6, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={isSelectableForRobber ? '#ff0055' : TERRAIN_COLORS[hex.terrain]}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Decorative 3D Elements based on Terrain */}
      {hex.terrain === 'forest' && (
        <group position={[0, 0.4, 0]}>
          <PineTree position={[-0.7, 0, -0.5]} scale={0.7} />
          <PineTree position={[0.6, 0, -0.4]} scale={0.8} />
          <PineTree position={[-0.3, 0, 0.6]} scale={0.9} />
          <PineTree position={[0.5, 0, 0.5]} scale={0.6} />
        </group>
      )}

      {hex.terrain === 'mountains' && (
        <group position={[0, 0.4, 0]}>
          <MountainPeak position={[-0.5, 0, -0.4]} scale={0.9} />
          <MountainPeak position={[0.6, 0, -0.3]} scale={0.7} />
          <MountainPeak position={[0, 0, 0.5]} scale={0.8} />
        </group>
      )}

      {hex.terrain === 'hills' && (
        <group position={[0, 0.4, 0]}>
          <ClayMound position={[-0.6, 0, 0.3]} />
          <ClayMound position={[0.5, 0, -0.4]} />
        </group>
      )}

      {hex.terrain === 'pasture' && (
        <group position={[0, 0.4, 0]}>
          <SheepModel position={[-0.6, 0, 0.4]} />
          <SheepModel position={[0.5, 0, -0.5]} />
        </group>
      )}

      {/* Number Token (Disk + Number + Probability Pips) */}
      {hex.numberToken && (
        <group position={[0, 0.43, 0]}>
          {/* Parchment Token Disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.75, 32]} />
            <meshStandardMaterial color="#fffbe6" roughness={0.5} />
          </mesh>

          {/* Number Text */}
          <Text
            position={[0, 0.05, -0.1]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.55}
            color={isRedNumber ? '#d00000' : '#222222'}
            anchorX="center"
            anchorY="middle"
          >
            {hex.numberToken.toString()}
          </Text>

          {/* Probability Pips (dots) */}
          <group position={[0, 0.05, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
            {Array.from({ length: pips }).map((_, i) => (
              <mesh
                key={i}
                position={[(i - (pips - 1) / 2) * 0.18, 0, 0]}
              >
                <circleGeometry args={[0.05, 12]} />
                <meshBasicMaterial color={isRedNumber ? '#d00000' : '#222222'} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};

function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 6]} />
        <meshStandardMaterial color="#582f0e" />
      </mesh>
      {/* Foliage Cones */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.4, 0.5, 6]} />
        <meshStandardMaterial color="#1b4332" />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.3, 0.4, 6]} />
        <meshStandardMaterial color="#2d6a4f" />
      </mesh>
    </group>
  );
}

function MountainPeak({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.6, 0.8, 5]} />
        <meshStandardMaterial color="#495057" roughness={0.9} />
      </mesh>
      {/* Snow cap */}
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.25, 0.35, 5]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
      </mesh>
    </group>
  );
}

function ClayMound({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], 0.15, position[2]]}>
      <sphereGeometry args={[0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshStandardMaterial color="#9c3b0f" roughness={0.9} />
    </mesh>
  );
}

function SheepModel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={[0.4, 0.4, 0.4]}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      {/* Head */}
      <mesh position={[0.2, 0.35, 0]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}
