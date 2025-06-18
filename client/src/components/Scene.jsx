import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, TorusKnot } from '@react-three/drei';

function Knot() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <TorusKnot ref={meshRef} args={[1, 0.4, 256, 32]}>
      <meshStandardMaterial color={'#6a0dad'} wireframe />
    </TorusKnot>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Knot />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
