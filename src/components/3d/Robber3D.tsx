'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Robber3DProps {
  position: { x: number; z: number };
}

export const Robber3D: React.FC<Robber3DProps> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle hovering breathing animation
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = 0.5 + Math.sin(t * 2.5) * 0.08;
      groupRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[position.x, 0.5, position.z]} scale={[0.7, 0.7, 0.7]}>
      {/* Base Pedestal */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Robber Torso */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 0.5, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Robber Head & Hood */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#020617" roughness={0.2} />
      </mesh>

      {/* Red Eyes / Visor */}
      <mesh position={[0, 0.98, 0.18]}>
        <boxGeometry args={[0.16, 0.04, 0.08]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};
