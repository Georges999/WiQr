import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Subtle aurora background - much less intense
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

    // Simplified noise function
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
      
      for (int i = 0; i < 4; i++) {
        value += amplitude * smoothNoise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 st = vUv;
      float t = u_time * 0.05; // Much slower movement
      
      // Subtle flowing waves
      vec2 wave1 = vec2(
        sin(st.x * 2.0 + t) * 0.1,
        cos(st.y * 1.5 + t * 0.7) * 0.08
      );
      
      vec2 wave2 = vec2(
        cos(st.x * 1.8 + t * 0.8) * 0.12,
        sin(st.y * 1.2 + t * 1.2) * 0.1
      );
      
      // Combine waves for gentle movement
      vec2 distortion = wave1 + wave2;
      vec2 distortedUV = st + distortion;
      
      // Subtle noise patterns
      float noise1 = fbm(distortedUV * 1.2 + t * 0.3);
      float noise2 = fbm(distortedUV * 0.8 - t * 0.2);
      
      // Gentle color bands
      float band1 = sin(st.y * 3.0 + noise1 * 2.0 + t) * 0.5 + 0.5;
      float band2 = sin(st.y * 2.0 + noise2 * 2.5 + t * 1.3) * 0.5 + 0.5;
      
      // Subtle color palette
      vec3 color1 = vec3(0.08, 0.05, 0.15); // Dark purple base
      vec3 color2 = vec3(0.0, 0.15, 0.3);   // Subtle blue
      vec3 color3 = vec3(0.1, 0.02, 0.2);   // Muted purple
      vec3 color4 = vec3(0.0, 0.2, 0.15);   // Subtle teal
      
      // Gentle color mixing
      vec3 finalColor = mix(color1, color2, band1 * noise1 * 0.6);
      finalColor = mix(finalColor, color3, band2 * noise2 * 0.4);
      
      // Subtle highlights
      float highlight = smoothstep(0.8, 1.0, noise1 + noise2);
      finalColor += highlight * 0.05;
      
      // Gentle radial gradient
      float radial = 1.0 - length(st - 0.5) * 0.4;
      finalColor *= radial;
      
      // Much more subtle final output
      finalColor = pow(finalColor, vec3(1.1));
      finalColor *= 0.8; // Reduce overall intensity
      
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

// Subtle constellation with fewer particles
function ConstellationField() {
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const particleCount = 30; // Reduced particle count
    const pos = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
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
        
        // Gentle movement
        positions[i] = originalX + Math.sin(time * 0.2 + originalX) * 0.05;
        positions[i + 1] = originalY + Math.cos(time * 0.15 + originalY) * 0.03;
        positions[i + 2] += Math.sin(time * 0.3 + originalX + originalY) * 0.01;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.z = Math.sin(time * 0.02) * 0.05;
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
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
      />
    </points>
  );
}

function ThreeBackground() {
  return (
    <div className="fixed inset-0 w-screen h-screen" style={{ zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <AuroraBackground />
        <ConstellationField />
      </Canvas>
    </div>
  );
}

export default ThreeBackground; 