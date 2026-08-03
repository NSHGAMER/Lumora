import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BuildingBox = ({ position, height, color }: { position: [number, number, number]; height: number; color: string; name?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = (height / 2) + Math.sin(time + position[0]) * 0.05;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[1.2, height, 1.2]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
          wireframe={false}
        />
      </mesh>
      {/* Base wireframe outline */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1.22, height + 0.02, 1.22]} />
        <meshBasicMaterial color="#06B6D4" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const GridScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
  });

  const buildings = [
    { pos: [-2, 0, -2] as [number, number, number], height: 2.2, color: '#3B82F6', name: 'Turing Science Center' },
    { pos: [2, 0, -2] as [number, number, number], height: 3.5, color: '#06B6D4', name: 'Quantum Library' },
    { pos: [-2, 0, 2] as [number, number, number], height: 1.8, color: '#8B5CF6', name: 'Engineering Quad' },
    { pos: [2, 0, 2] as [number, number, number], height: 2.8, color: '#22C55E', name: 'BioTech Innovation Hub' },
    { pos: [0, 0, 0] as [number, number, number], height: 4.2, color: '#06B6D4', name: 'Lumora Central Tower' },
  ];

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      <gridHelper args={[20, 20, '#06B6D4', '#1E293B']} position={[0, 0, 0]} />
      {buildings.map((b, idx) => (
        <BuildingBox key={idx} position={b.pos} height={b.height} color={b.color} name={b.name} />
      ))}
    </group>
  );
};

export const CampusNodeGrid: React.FC = () => {
  return (
    <div className="w-full h-[320px] rounded-2xl overflow-hidden relative border border-white/10 bg-[#05070B]/90">
      <Canvas camera={{ position: [0, 6, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 15, 10]} intensity={1.5} color="#06B6D4" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#8B5CF6" />
        <GridScene />
      </Canvas>
      
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>3D Telemetry Grid Active</span>
      </div>
    </div>
  );
};
