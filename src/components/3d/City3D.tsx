'use client';

import React from 'react';
import { PlayerColor, PieceStyle } from '@/lib/catan/types';
import { COLOR_MAP } from './Settlement3D';

interface City3DProps {
  position: { x: number; y: number; z: number };
  color: PlayerColor;
  pieceStyle?: PieceStyle;
}

export const City3D: React.FC<City3DProps> = ({
  position,
  color,
  pieceStyle = 'classic_wood',
}) => {
  const mainColor = COLOR_MAP[color] || '#dc2626';

  return (
    <group position={[position.x, position.y + 0.2, position.z]} scale={[0.85, 0.85, 0.85]}>
      {/* Lower Wing */}
      <mesh position={[-0.18, 0.2, 0]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.45]} />
        <meshStandardMaterial
          color={mainColor}
          roughness={pieceStyle === 'classic_wood' ? 0.6 : 0.2}
        />
      </mesh>
      {/* Lower Wing Roof */}
      <mesh position={[-0.18, 0.48, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.26, 0.26, 0.46]} />
        <meshStandardMaterial color={pieceStyle === 'medieval' ? '#1e293b' : mainColor} />
      </mesh>

      {/* Tall Fortress Spire Tower */}
      <mesh position={[0.2, 0.35, 0]} castShadow>
        <boxGeometry args={[0.42, 0.7, 0.45]} />
        <meshStandardMaterial
          color={mainColor}
          roughness={0.5}
          metalness={pieceStyle === 'modern' ? 0.4 : 0.1}
        />
      </mesh>
      {/* Tower Roof Pyramid */}
      <mesh position={[0.2, 0.82, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.32, 0.35, 4]} />
        <meshStandardMaterial color={pieceStyle === 'medieval' ? '#0f172a' : '#ffd166'} />
      </mesh>
    </group>
  );
};
