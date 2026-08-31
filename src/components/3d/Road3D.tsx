'use client';

import React from 'react';
import { PlayerColor, PieceStyle } from '@/lib/catan/types';
import { COLOR_MAP } from './Settlement3D';

interface Road3DProps {
  position: { x: number; y: number; z: number };
  rotationY: number;
  color: PlayerColor;
  pieceStyle?: PieceStyle;
}

export const Road3D: React.FC<Road3DProps> = ({
  position,
  rotationY,
  color,
  pieceStyle = 'classic_wood',
}) => {
  const mainColor = COLOR_MAP[color] || '#dc2626';

  return (
    <group
      position={[position.x, position.y + 0.2, position.z]}
      rotation={[0, -rotationY, 0]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.16, 0.28]} />
        <meshStandardMaterial
          color={mainColor}
          roughness={pieceStyle === 'classic_wood' ? 0.7 : 0.2}
          metalness={pieceStyle === 'modern' ? 0.3 : 0.1}
        />
      </mesh>
    </group>
  );
};
