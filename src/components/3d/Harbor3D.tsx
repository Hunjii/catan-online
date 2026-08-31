'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { PortType } from '@/lib/catan/types';

interface Harbor3DProps {
  position: { x: number; y: number; z: number };
  port: {
    type: PortType;
    ratio: number;
    resource: string | null;
  };
}

const PORT_ICONS: Record<string, string> = {
  generic_3_1: '3:1 ?',
  wood_2_1: '2:1 🌲',
  brick_2_1: '2:1 🧱',
  sheep_2_1: '2:1 🐑',
  wheat_2_1: '2:1 🌾',
  ore_2_1: '2:1 ⛰️',
};

export const Harbor3D: React.FC<Harbor3DProps> = ({ position, port }) => {
  const label = PORT_ICONS[port.type] || `${port.ratio}:1`;

  return (
    <group position={[position.x, position.y + 0.1, position.z]}>
      {/* Pier post */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} />
      </mesh>

      {/* Floating Trade Badge */}
      <group position={[0, 0.6, 0]}>
        <mesh rotation={[-Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.85, 0.45, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          rotation={[-Math.PI / 4, 0, 0]}
          fontSize={0.24}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </group>
  );
};
