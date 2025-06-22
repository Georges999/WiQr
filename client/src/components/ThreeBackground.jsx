import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Smooth animated gradient background
function AnimatedGradient() {
  const meshRef = useRef();
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_color1: { value: new THREE.Color('#0a0a0b') },
    u_color2: { value: new THREE.Color('#1a1a1c') },
    u_color3: { value: new THREE.Color('#2c2c2e') },
    u_color4: { value: new THREE.Color('#007aff') },
    u_color5: { value: new THREE.Color('#30d158') },
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform vec3 u_color4;
    uniform vec3 u_color5;
    varying vec2 vUv;

    void main() {
      vec2 st = vUv;
      
      // Create flowing gradient
      float t = u_time * 0.1;
      
      // Multiple sine waves for smooth movement
      float wave1 = sin(st.x * 2.0 + t) * 0.5 + 0.5;
      float wave2 = sin(st.y * 1.5 + t * 0.8) * 0.5 + 0.5;
      float wave3 = sin((st.x + st.y) * 1.2 + t * 0.6) * 0.5 + 0.5;
      
      // Combine waves for smooth color mixing
      float mix1 = wave1 * wave2;
      float mix2 = wave2 * wave3;
      float mix3 = wave3 * wave1;
      
      // Create smooth color transitions
      vec3 color = mix(u_color1, u_color2, mix1);
      color = mix(color, u_color3, mix2 * 0.3);
      
      // Add subtle accent colors
      color = mix(color, u_color4, mix3 * 0.05);
      color = mix(color, u_color5, wave1 * wave2 * 0.03);
      
      // Add subtle noise for texture
      float noise = fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
      color += noise * 0.02;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

// Floating geometric elements
function FloatingElement({ position, color, size = 0.02 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = position[0] + Math.sin(time * 0.5 + position[0]) * 0.5;
      meshRef.current.position.y = position[1] + Math.cos(time * 0.3 + position[1]) * 0.3;
      meshRef.current.rotation.z = time * 0.2;
      
      // Subtle scale breathing
      const scale = 1 + Math.sin(time * 0.8 + position[0] + position[1]) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <circleGeometry args={[size, 6]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.1}
      />
    </mesh>
  );
}

// Grid of floating elements
function FloatingElements() {
  const elements = useMemo(() => {
    const els = [];
    const colors = ['#007aff', '#30d158', '#ff9500', '#af52de', '#5ac8fa'];
    
    for (let i = 0; i < 20; i++) {
      els.push({
        position: [
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          -0.5
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 0.03 + 0.01
      });
    }
    return els;
  }, []);

  return (
    <>
      {elements.map((el, index) => (
        <FloatingElement
          key={index}
          position={el.position}
          color={el.color}
          size={el.size}
        />
      ))}
    </>
  );
}

function ThreeBackground() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <AnimatedGradient />
        <FloatingElements />
      </Canvas>
    </div>
  );
}

export default ThreeBackground; 