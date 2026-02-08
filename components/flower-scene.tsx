'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PetalProps {
  position: [number, number, number];
  rotation: [number, number, number];
  delay: number;
  index: number;
}

function Petal({ position, rotation, delay, index }: PetalProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame(() => {
    if (!ref.current || !started) return;

    const elapsed = Date.now() - (Date.now() - delay);
    const progress = Math.min((elapsed - delay) / 1200, 1);

    if (progress >= 0 && progress <= 1) {
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      ref.current.scale.setScalar(easeProgress);

      const rotationAmount = easeProgress * Math.PI * 0.3;
      ref.current.rotation.x = rotation[0] + rotationAmount * Math.sin(index);
      ref.current.rotation.y = rotation[1] + rotationAmount * Math.cos(index);
      ref.current.rotation.z = rotation[2] + rotationAmount * 0.5;

      const sway = Math.sin(progress * Math.PI * 2) * 0.05;
      ref.current.position.y = position[1] + sway;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={[0, 0, 0]}>
      <sphereGeometry args={[0.12, 32, 32]} />
      <meshStandardMaterial
        color="#ff4081"
        metalness={0.2}
        roughness={0.3}
        emissive="#ff1744"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

interface FlowerProps {
  position: [number, number, number];
  delay: number;
}

function Flower({ position, delay }: FlowerProps) {
  const petalCount = 12;
  const petals = [];
  const petalRadius = 0.35;

  // Create multi-layer petals
  for (let layer = 0; layer < 2; layer++) {
    const layerDelay = delay + layer * 150;
    const radius = petalRadius - layer * 0.1;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + (layer * Math.PI) / petalCount;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.1 + layer * 0.15;

      petals.push(
        <Petal
          key={`${layer}-${i}`}
          position={[x, y, z]}
          rotation={[angle, 0, 0]}
          delay={layerDelay + i * 30}
          index={i + layer * petalCount}
        />
      );
    }
  }

  const stemRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!stemRef.current) return;
    const time = Date.now() * 0.001;
    stemRef.current.rotation.z = Math.sin(time + delay * 0.01) * 0.02;
  });

  return (
    <group position={position}>
      {/* Flower center */}
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.6}
          roughness={0.2}
          emissive="#ffed4e"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Petals */}
      {petals}

      {/* Stem */}
      <mesh ref={stemRef} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 12]} />
        <meshStandardMaterial color="#2d5016" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Left leaf */}
      <mesh position={[-0.15, -0.3, 0]} rotation={[0, 0, Math.PI / 5]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="#3d7c2e" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Right leaf */}
      <mesh position={[0.15, -0.3, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="#3d7c2e" metalness={0.1} roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function FlowerScene() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={['#000000']} />

        {/* Lighting setup */}
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#ffb3d9" />
        <pointLight position={[0, 5, 5]} intensity={0.6} color="#ffd700" />

        {/* Blooming flowers */}
        <Flower position={[0, 0, 0]} delay={0} />
        <Flower position={[-1.5, 0.5, -0.8]} delay={300} />
        <Flower position={[1.5, 0.5, -0.8]} delay={600} />
        <Flower position={[-0.8, -0.8, -0.4]} delay={450} />
        <Flower position={[0.8, -0.8, -0.4]} delay={750} />
      </Canvas>

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">
            Happy Valentine's Day!
          </h1>
          <p className="text-2xl text-pink-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Your flowers are blooming for you
          </p>
        </div>
      </div>
    </div>
  );
}
