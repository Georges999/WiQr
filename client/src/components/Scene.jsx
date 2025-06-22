import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

function FloatingOrb({ position, color, scale = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[scale, 32, 32]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.6}
      />
    </Sphere>
  );
}

function Particles() {
  const particlesRef = useRef();
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
      particlesRef.current.rotation.x += delta * 0.05;
    }
  });

  const particlePositions = [];
  for (let i = 0; i < 50; i++) {
    particlePositions.push([
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ]);
  }

  return (
    <group ref={particlesRef}>
      {particlePositions.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Main floating orbs */}
      <FloatingOrb position={[-4, 2, -2]} color="#6366f1" scale={1.2} />
      <FloatingOrb position={[3, -1, -3]} color="#8b5cf6" scale={0.8} />
      <FloatingOrb position={[0, 3, -4]} color="#06b6d4" scale={1} />
      <FloatingOrb position={[-2, -3, 1]} color="#ec4899" scale={0.6} />
      
      {/* Particle system */}
      <Particles />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
