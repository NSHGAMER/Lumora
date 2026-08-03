import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export interface BuildingData {
  id: string;
  name: string;
  code: string;
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  activeClasses: number;
  students: number;
  faculty: number;
  aiOptimization: number;
}

const campusBuildings: BuildingData[] = [
  { id: 'b1', name: 'Computer Science Block', code: 'CS', pos: [-3, 0, -2], size: [1.6, 2.8, 1.6], color: '#06B6D4', activeClasses: 18, students: 742, faculty: 38, aiOptimization: 98 },
  { id: 'b2', name: 'Quantum Library & Archives', code: 'QLIB', pos: [3, 0, -2.5], size: [2.2, 3.8, 1.8], color: '#3B82F6', activeClasses: 12, students: 512, faculty: 14, aiOptimization: 99 },
  { id: 'b3', name: 'Administration Tower', code: 'ADMIN', pos: [0, 0, 0], size: [2.0, 4.8, 2.0], color: '#8B5CF6', activeClasses: 6, students: 120, faculty: 65, aiOptimization: 96 },
  { id: 'b4', name: 'Engineering Quad', code: 'ENG', pos: [-4, 0, 2], size: [2.4, 2.2, 2.0], color: '#22C55E', activeClasses: 22, students: 890, faculty: 48, aiOptimization: 97 },
  { id: 'b5', name: 'Innovation & AI Hub', code: 'HUB', pos: [4, 0, 2], size: [1.8, 3.2, 1.8], color: '#06B6D4', activeClasses: 15, students: 430, faculty: 28, aiOptimization: 100 },
  { id: 'b6', name: 'Quantum Laboratories', code: 'LAB', pos: [-1.8, 0, -3.5], size: [1.4, 1.8, 1.4], color: '#3B82F6', activeClasses: 8, students: 180, faculty: 22, aiOptimization: 99 },
  { id: 'b7', name: 'Grand Auditorium', code: 'AUD', pos: [1.8, 0, -3.8], size: [2.0, 1.6, 1.8], color: '#8B5CF6', activeClasses: 4, students: 600, faculty: 12, aiOptimization: 94 },
  { id: 'b8', name: 'Student Residences / Hostels', code: 'DORM', pos: [-5, 0, -0.5], size: [1.8, 2.5, 3.0], color: '#3B82F6', activeClasses: 0, students: 1240, faculty: 8, aiOptimization: 95 },
  { id: 'b9', name: 'Sports & Athletics Complex', code: 'ATH', pos: [5.2, 0, -0.2], size: [2.8, 1.4, 2.4], color: '#22C55E', activeClasses: 5, students: 320, faculty: 15, aiOptimization: 92 },
  { id: 'b10', name: 'Central Dining Commons', code: 'DINE', pos: [-2, 0, 3.8], size: [2.2, 1.2, 1.8], color: '#06B6D4', activeClasses: 0, students: 450, faculty: 20, aiOptimization: 96 },
  { id: 'b11', name: 'Campus Medical Center', code: 'MED', pos: [2.2, 0, 3.8], size: [1.6, 1.8, 1.6], color: '#22C55E', activeClasses: 3, students: 85, faculty: 18, aiOptimization: 98 },
];

const BuildingMesh = ({
  data,
  isHovered,
  onHover,
}: {
  data: BuildingData;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Subtle breathing pulse
    meshRef.current.position.y = (data.size[1] / 2) + Math.sin(time * 1.5 + data.pos[0]) * 0.04;
  });

  return (
    <group position={data.pos}>
      {/* Main Solid Wireframe Building */}
      <mesh
        ref={meshRef}
        position={[0, data.size[1] / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(data.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={data.size} />
        <meshStandardMaterial
          color={isHovered ? '#06B6D4' : data.color}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={isHovered ? 0.9 : 0.65}
          wireframe={false}
        />
      </mesh>

      {/* Bright Outer Wireframe Grid */}
      <mesh position={[0, data.size[1] / 2, 0]}>
        <boxGeometry args={[data.size[0] + 0.04, data.size[1] + 0.04, data.size[2] + 0.04]} />
        <meshBasicMaterial
          color={isHovered ? '#06B6D4' : '#3B82F6'}
          wireframe
          transparent
          opacity={isHovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Building Base Glow Plate */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[data.size[0] + 0.6, data.size[2] + 0.6]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={isHovered ? 0.4 : 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Interactive Tooltip HTML overlay */}
      {isHovered && (
        <Html position={[0, data.size[1] + 0.6, 0]} center distanceFactor={12}>
          <div className="w-56 p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl text-slate-100 space-y-2 pointer-events-none font-sans z-50">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-xs font-mono">
              <span className="text-cyan-400 font-bold">{data.code}</span>
              <span className="text-emerald-400 font-bold">{data.aiOptimization}% AI OPTIMIZED</span>
            </div>

            <div className="font-heading font-bold text-sm text-white">{data.name}</div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300 pt-1">
              <div>Classes: <span className="text-white font-bold">{data.activeClasses}</span></div>
              <div>Students: <span className="text-white font-bold">{data.students}</span></div>
              <div>Faculty: <span className="text-white font-bold">{data.faculty}</span></div>
              <div>Status: <span className="text-emerald-400">ONLINE</span></div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const DataLines = () => {
  const lineMeshRef = useRef<THREE.LineSegments>(null);

  const [positions, colors] = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const cyan = new THREE.Color('#06B6D4');
    const purple = new THREE.Color('#8B5CF6');

    // Connect building positions with glowing wire lines
    for (let i = 0; i < campusBuildings.length; i++) {
      for (let j = i + 1; j < campusBuildings.length; j++) {
        const b1 = campusBuildings[i];
        const b2 = campusBuildings[j];
        const dx = b1.pos[0] - b2.pos[0];
        const dz = b1.pos[2] - b2.pos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 5.5) {
          pos.push(b1.pos[0], 0.2, b1.pos[2]);
          pos.push(b2.pos[0], 0.2, b2.pos[2]);

          col.push(cyan.r, cyan.g, cyan.b);
          col.push(purple.r, purple.g, purple.b);
        }
      }
    }
    return [new Float32Array(pos), new Float32Array(col)];
  }, []);

  useFrame((state) => {
    if (!lineMeshRef.current) return;
    const time = state.clock.getElapsedTime();
    lineMeshRef.current.rotation.y = time * 0.02;
  });

  return (
    <lineSegments ref={lineMeshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.4} linewidth={1.5} />
    </lineSegments>
  );
};

const CampusScene = ({
  hoveredBuilding,
  setHoveredBuilding,
}: {
  hoveredBuilding: string | null;
  setHoveredBuilding: (id: string | null) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.04;
  });

  return (
    <group ref={groupRef} rotation={[0.45, 0, 0]}>
      <gridHelper args={[24, 24, '#06B6D4', '#1E293B']} position={[0, 0, 0]} />
      <DataLines />

      {campusBuildings.map((b) => (
        <BuildingMesh
          key={b.id}
          data={b}
          isHovered={hoveredBuilding === b.id}
          onHover={setHoveredBuilding}
        />
      ))}
    </group>
  );
};

export const LivingCampusCanvas: React.FC = () => {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  return (
    <div className="w-full h-[520px] sm:h-[620px] rounded-3xl overflow-hidden relative border border-cyan-500/30 bg-[#05070B]/95 shadow-2xl shadow-cyan-950/40">
      <Canvas camera={{ position: [0, 10, 14], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 15, 10]} intensity={2} color="#06B6D4" />
        <pointLight position={[-10, 10, -10]} intensity={1.5} color="#8B5CF6" />
        <CampusScene hoveredBuilding={hoveredBuilding} setHoveredBuilding={setHoveredBuilding} />
      </Canvas>

      {/* Top Left HUD Telemetry Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>DIGITAL TWIN TELEMETRY: 11 BUILDINGS SYNCED</span>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden sm:block">
        <div className="px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-[11px] font-mono text-slate-400">
          Hover over any building node to reveal live telemetry
        </div>
      </div>
    </div>
  );
};
