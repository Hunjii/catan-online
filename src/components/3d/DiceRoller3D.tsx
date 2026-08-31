'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface DiceRoller3DProps {
  lastRoll: [number, number] | null;
  isRolling?: boolean;
}

// Target rotations [x, y, z] to face the camera for values 1-6
const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0], // Top face
  2: [Math.PI / 2, 0, 0], // Front face
  3: [0, 0, -Math.PI / 2], // Right face
  4: [0, 0, Math.PI / 2], // Left face
  5: [-Math.PI / 2, 0, 0], // Back face
  6: [Math.PI, 0, 0], // Bottom face
};

export const DiceRoller3D: React.FC<DiceRoller3DProps> = ({ lastRoll }) => {
  if (!lastRoll) return null;

  return (
    <group position={[0, 4.5, 7.5]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* Background backing plane */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[4.2, 2.2]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.7} />
      </mesh>

      {/* Die 1 */}
      <SingleDie value={lastRoll[0]} position={[-1.2, 0, 0]} />

      {/* Die 2 */}
      <SingleDie value={lastRoll[1]} position={[1.2, 0, 0]} />

      {/* Sum banner */}
      <Text
        position={[0, -0.85, 0.1]}
        fontSize={0.45}
        color="#facc15"
        anchorX="center"
        anchorY="middle"
      >
        {`Tổng: ${lastRoll[0] + lastRoll[1]}`}
      </Text>
    </group>
  );
};

function SingleDie({ value, position }: { value: number; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  const targetRotation = useRef<[number, number, number]>(FACE_ROTATIONS[value] || [0, 0, 0]);

  useEffect(() => {
    targetRotation.current = FACE_ROTATIONS[value] || [0, 0, 0];
  }, [value]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth damp interpolation to target rotation
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x,
        targetRotation.current[0],
        8,
        delta
      );
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        targetRotation.current[1],
        8,
        delta
      );
      meshRef.current.rotation.z = THREE.MathUtils.damp(
        meshRef.current.rotation.z,
        targetRotation.current[2],
        8,
        delta
      );
    }
  });

  return (
    <group ref={meshRef} position={position} scale={[0.8, 0.8, 0.8]}>
      {/* Cube Body */}
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Dots on Faces */}
      {/* Top Face (1) */}
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>

      {/* Bottom Face (6) */}
      <group position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {[-0.25, 0.25].map((x) =>
          [-0.28, 0, 0.28].map((y) => (
            <mesh key={`${x}_${y}`} position={[x, y, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          ))
        )}
      </group>

      {/* Front Face (2) */}
      <group position={[0, 0, 0.51]}>
        <mesh position={[-0.22, 0.22, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.22, -0.22, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Back Face (5) */}
      <group position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        {[-0.24, 0.24].map((x) =>
          [-0.24, 0.24].map((y) => (
            <mesh key={`${x}_${y}`} position={[x, y, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          ))
        )}
      </group>

      {/* Right Face (3) */}
      <group position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[-0.24, 0.24, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.24, -0.24, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Left Face (4) */}
      <group position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {[-0.24, 0.24].map((x) =>
          [-0.24, 0.24].map((y) => (
            <mesh key={`${x}_${y}`} position={[x, y, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}
