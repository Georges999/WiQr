import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Aurora-like flowing background with dynamic colors
function AuroraBackground() {
  const meshRef = useRef();
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2() },
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
    uniform vec2 u_mouse;
    varying vec2 vUv;

    // Noise function for organic movement
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float smoothNoise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 0.0;
      
      for (int i = 0; i < 6; i++) {
        value += amplitude * smoothNoise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 st = vUv;
      float t = u_time * 0.15;
      
      // Create flowing aurora waves
      vec2 wave1 = vec2(
        sin(st.x * 3.0 + t) * 0.1,
        cos(st.y * 2.0 + t * 0.7) * 0.1
      );
      
      vec2 wave2 = vec2(
        cos(st.x * 2.5 + t * 0.8) * 0.15,
        sin(st.y * 1.8 + t * 1.2) * 0.12
      );
      
      vec2 wave3 = vec2(
        sin((st.x + st.y) * 1.5 + t * 0.5) * 0.08,
        cos((st.x - st.y) * 2.2 + t * 0.9) * 0.1
      );
      
      // Combine waves for complex movement
      vec2 distortion = wave1 + wave2 + wave3;
      vec2 distortedUV = st + distortion;
      
      // Create flowing noise patterns
      float noise1 = fbm(distortedUV * 2.0 + t * 0.3);
      float noise2 = fbm(distortedUV * 1.5 - t * 0.2);
      float noise3 = fbm(distortedUV * 3.0 + t * 0.5);
      
      // Create aurora-like color bands
      float band1 = sin(st.y * 8.0 + noise1 * 3.0 + t) * 0.5 + 0.5;
      float band2 = sin(st.y * 6.0 + noise2 * 4.0 + t * 1.3) * 0.5 + 0.5;
      float band3 = sin(st.y * 10.0 + noise3 * 2.0 + t * 0.8) * 0.5 + 0.5;
      
      // Dynamic color palette that shifts over time
      vec3 color1 = vec3(0.1, 0.05, 0.2); // Deep purple base
      vec3 color2 = vec3(0.0, 0.3, 0.6);  // Ocean blue
      vec3 color3 = vec3(0.2, 0.1, 0.4);  // Royal purple
      vec3 color4 = vec3(0.0, 0.5, 0.3);  // Emerald
      vec3 color5 = vec3(0.6, 0.2, 0.8);  // Magenta
      vec3 color6 = vec3(0.0, 0.4, 0.8);  // Bright blue
      
      // Time-based color shifting
      float colorShift = sin(t * 0.5) * 0.5 + 0.5;
      color2 = mix(color2, color6, colorShift);
      color4 = mix(color4, color5, sin(t * 0.3) * 0.5 + 0.5);
      
      // Blend colors based on noise and bands
      vec3 finalColor = mix(color1, color2, band1 * noise1);
      finalColor = mix(finalColor, color3, band2 * noise2 * 0.7);
      finalColor = mix(finalColor, color4, band3 * noise3 * 0.5);
      
      // Add subtle highlights
      float highlight = smoothstep(0.7, 1.0, noise1 + noise2);
      finalColor += highlight * 0.1;
      
      // Add depth with radial gradient
      float radial = 1.0 - length(st - 0.5) * 0.8;
      finalColor *= radial;
      
      // Enhance contrast and saturation
      finalColor = pow(finalColor, vec3(0.9));
      finalColor *= 1.2;
      
      gl_FragColor = vec4(finalColor, 1.0);
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

// Constellation of floating particles that form patterns
function ConstellationField() {
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const particleCount = 60;
    const pos = new Float32Array(particleCount * 3);
    
    // Create constellation patterns
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in constellation-like clusters
      const cluster = Math.floor(i / 12);
      const clusterX = (cluster % 3 - 1) * 3;
      const clusterY = (Math.floor(cluster / 3) - 1) * 2;
      
      pos[i * 3] = clusterX + (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = clusterY + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const originalX = positions[i];
        const originalY = positions[i + 1];
        
        positions[i] = originalX + Math.sin(time * 0.5 + originalX) * 0.1;
        positions[i + 1] = originalY + Math.cos(time * 0.3 + originalY) * 0.08;
        positions[i + 2] += Math.sin(time * 0.8 + originalX + originalY) * 0.02;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.z = Math.sin(time * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Morphing geometric shapes that add visual interest
function MorphingGeometry() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Morph the geometry
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.1;
      
      // Pulsing scale
      const scale = 1 + Math.sin(time * 0.4) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // Floating movement
      meshRef.current.position.y = Math.sin(time * 0.2) * 0.5;
      meshRef.current.position.x = Math.cos(time * 0.15) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <torusGeometry args={[1, 0.3, 16, 100]} />
      <meshBasicMaterial 
        color="#007aff" 
        transparent 
        opacity={0.05}
        wireframe={true}
      />
    </mesh>
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
        <AuroraBackground />
        <ConstellationField />
        <MorphingGeometry />
      </Canvas>
    </div>
  );
}

export default ThreeBackground; 