import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const InnerNucleus = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.4;
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.08;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Core Glowing Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#3B82F6"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Soft Breathing Outer Glow Shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const RotatingRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.y = time * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.6;
      ring2Ref.current.rotation.z = time * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -time * 0.3;
      ring3Ref.current.rotation.z = -time * 0.7;
    }
  });

  return (
    <group>
      {/* Outer Ring 1 (Cyan) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.6, 0.015, 16, 100]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.8} />
      </mesh>

      {/* Ring 2 (Blue) */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.9, 0.012, 16, 100]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.7} />
      </mesh>

      {/* Ring 3 (Purple) */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.2, 0.01, 16, 100]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

const ParticleSwarm = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 180;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color('#06B6D4');
    const blue = new THREE.Color('#3B82F6');
    const purple = new THREE.Color('#8B5CF6');

    for (let i = 0; i < count; i++) {
      const radius = 1.2 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      const chosenColor = colorChoice < 0.4 ? cyan : colorChoice < 0.8 ? blue : purple;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.15;
    pointsRef.current.rotation.z = time * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const SceneContainer = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Mouse tilt interaction
    const targetX = (state.pointer.y * Math.PI) / 8;
    const targetY = (state.pointer.x * Math.PI) / 8;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <InnerNucleus />
      <RotatingRings />
      <ParticleSwarm />
    </group>
  );
};

export const JSRCoreSphere: React.FC = () => {
  return (
    <div className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] relative mx-auto">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#06B6D4" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#8B5CF6" />
        <SceneContainer />
      </Canvas>
    </div>
  );
};
