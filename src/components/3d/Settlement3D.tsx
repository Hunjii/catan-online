'use client';

import React from 'react';
import { PlayerColor, PieceStyle } from '@/lib/catan/types';

interface Settlement3DProps {
  position: { x: number; y: number; z: number };
  color: PlayerColor;
  pieceStyle?: PieceStyle;
}

export const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  orange: '#ea580c',
  white: '#f1f5f9',
  green: '#16a34a',
  purple: '#9333ea',
};

export const Settlement3D: React.FC<Settlement3DProps> = ({
  position,
  color,
  pieceStyle = 'classic_wood',
}) => {
  const mainColor = COLOR_MAP[color] || '#dc2626';

  return (
    <group position={[position.x, position.y + 0.2, position.z]} scale={[0.8, 0.8, 0.8]}>
      {/* Base House Body */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.45, 0.36, 0.45]} />
        <meshStandardMaterial
          color={mainColor}
          roughness={pieceStyle === 'classic_wood' ? 0.6 : 0.2}
          metalness={pieceStyle === 'modern' ? 0.4 : 0.1}
        />
      </mesh>

      {/* Roof: Triangular Prism */}
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.46]} />
        <meshStandardMaterial
          color={pieceStyle === 'medieval' ? '#334155' : mainColor}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};
