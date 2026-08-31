'use client';

import React, { useState } from 'react';
import { Vertex, Edge } from '@/lib/catan/types';

interface VertexHighlightProps {
  vertex: Vertex;
  onSelect: (vertexId: string) => void;
  color?: string;
  type?: 'settlement' | 'city';
}

export const VertexHighlight: React.FC<VertexHighlightProps> = ({
  vertex,
  onSelect,
  color = '#22c55e',
  type = 'settlement',
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={[vertex.position.x, vertex.position.y + 0.25, vertex.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(vertex.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh scale={hovered ? [1.3, 1.3, 1.3] : [1, 1, 1]}>
        <sphereGeometry args={[type === 'city' ? 0.35 : 0.28, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={hovered ? 0.9 : 0.5}
          transparent
          opacity={hovered ? 0.95 : 0.75}
        />
      </mesh>
    </group>
  );
};

interface EdgeHighlightProps {
  edge: Edge;
  onSelect: (edgeId: string) => void;
  color?: string;
}

export const EdgeHighlight: React.FC<EdgeHighlightProps> = ({
  edge,
  onSelect,
  color = '#38bdf8',
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={[edge.position.x, edge.position.y + 0.22, edge.position.z]}
      rotation={[0, -edge.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(edge.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh scale={hovered ? [1.1, 1.3, 1.3] : [1, 1, 1]}>
        <boxGeometry args={[1.2, 0.2, 0.32]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={hovered ? 0.9 : 0.45}
          transparent
          opacity={hovered ? 0.95 : 0.7}
        />
      </mesh>
    </group>
  );
};
