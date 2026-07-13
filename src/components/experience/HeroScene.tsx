import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * The Monolith — obsidian slab with a chrome-beveled abstract eye aperture.
 * Reacts to cursor; camera orbits based on scroll.
 */
function Monolith() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const iris = useRef<THREE.Mesh>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;
    const px = state.pointer.x;
    const py = state.pointer.y;
    // Gentle magnetic pull toward cursor
    target.current.x += (py * 0.14 - target.current.x) * 0.05;
    target.current.y += (px * 0.28 - target.current.y) * 0.05;
    const t = state.clock.elapsedTime;
    // Slow rotation + breathing
    group.current.rotation.y = t * 0.12 + target.current.y;
    group.current.rotation.x = target.current.x + Math.sin(t * 0.4) * 0.02;
    group.current.position.y = Math.sin(t * 0.6) * 0.06;

    if (core.current) {
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.4 + Math.sin(t * 1.4) * 0.35;
    }
    if (iris.current) {
      iris.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group ref={group} scale={0.78} position={[0, -0.4, 0]}>
      {/* Obsidian slab (rounded tall monolith) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 3.4, 0.35]} />
        <meshPhysicalMaterial
          color="#050506"
          metalness={0.85}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Chrome bevel front frame */}
      <mesh position={[0, 0, 0.176]}>
        <boxGeometry args={[1.44, 3.34, 0.005]} />
        <meshStandardMaterial color="#000000" metalness={1} roughness={0.35} />
      </mesh>
      {/* Chrome edge highlights (top/bottom/side lines) */}
      {[
        { p: [0, 1.7, 0.18], s: [1.5, 0.008, 0.02] },
        { p: [0, -1.7, 0.18], s: [1.5, 0.008, 0.02] },
        { p: [0.75, 0, 0.18], s: [0.008, 3.4, 0.02] },
        { p: [-0.75, 0, 0.18], s: [0.008, 3.4, 0.02] },
      ].map((e, i) => (
        <mesh key={i} position={e.p as [number, number, number]}>
          <boxGeometry args={e.s as [number, number, number]} />
          <meshStandardMaterial color="#e8e8ec" metalness={1} roughness={0.05} />
        </mesh>
      ))}

      {/* Inner recessed cavity — the aperture */}
      <mesh position={[0, 0.15, 0.18]}>
        <boxGeometry args={[1.0, 1.0, 0.02]} />
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Chrome hexagonal outer ring — abstract, geometric */}
      <mesh position={[0, 0.15, 0.2]} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.42, 0.02, 12, 6]} />
        <meshStandardMaterial color="#e2e2e6" metalness={1} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0.15, 0.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.36, 0.008, 12, 64]} />
        <meshStandardMaterial color="#c4c4c8" metalness={1} roughness={0.18} />
      </mesh>

      {/* Rotating tick ring (surveillance feel) */}
      <group ref={iris} position={[0, 0.15, 0.205]}>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const long = i % 6 === 0;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[long ? 0.05 : 0.02, 0.006, 0.005]} />
              <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* Red inner core — the illuminated aperture */}
      <mesh ref={core} position={[0, 0.15, 0.19]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 64]} />
        <meshStandardMaterial
          color="#3a0006"
          emissive="#c8101c"
          emissiveIntensity={1.4}
          metalness={0.2}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* Black pupil slit */}
      <mesh position={[0, 0.15, 0.205]}>
        <boxGeometry args={[0.06, 0.24, 0.005]} />
        <meshStandardMaterial color="#000000" metalness={0} roughness={1} />
      </mesh>

      {/* Bottom serial plate */}
      <mesh position={[0, -1.35, 0.181]}>
        <boxGeometry args={[0.7, 0.14, 0.005]} />
        <meshStandardMaterial color="#0a0a0b" metalness={0.9} roughness={0.4} />
      </mesh>
      {/* Chrome bolts */}
      {[-0.62, 0.62].map((x) =>
        [-1.55, 1.55].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.185]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.08} />
          </mesh>
        )),
      )}

      {/* Backside red rim glow */}
      <pointLight position={[0, 0.15, 0.35]} intensity={2.6} color="#ff2030" distance={3} />
    </group>
  );
}

function Dust({ count = 400 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
    const geo = points.current.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.0016);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.014} color="#d6b0b4" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Volumetric-style red beam using a stretched cone with additive blending. */
function LightShaft() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.11 + Math.sin(t * 0.9) * 0.03;
    ref.current.rotation.z = Math.sin(t * 0.2) * 0.04;
  });
  return (
    <mesh ref={ref} position={[0, 2.5, -0.5]} rotation={[0, 0, 0]}>
      <coneGeometry args={[1.2, 6, 32, 1, true]} />
      <meshBasicMaterial color="#c81018" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Scroll-driven camera rig: subtle orbit as user scrolls the hero. */
function CameraRig() {
  const { camera } = useThree();
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight;
      setScroll(Math.min(1, Math.max(0, window.scrollY / (h * 1.2))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const target = useRef(new THREE.Vector3(0, 0.2, 0));
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Base slow idle drift
    const idleX = Math.sin(t * 0.18) * 0.15;
    const idleY = Math.cos(t * 0.14) * 0.08;
    // Scroll orbit angle
    const a = scroll * Math.PI * 0.6;
    const r = 5.6 - scroll * 0.8;
    const desiredX = Math.sin(a) * r + idleX;
    const desiredZ = Math.cos(a) * r;
    const desiredY = 0.2 + scroll * 0.6 + idleY;
    camera.position.x += (desiredX - camera.position.x) * 0.05;
    camera.position.y += (desiredY - camera.position.y) * 0.05;
    camera.position.z += (desiredZ - camera.position.z) * 0.05;
    camera.lookAt(target.current);
  });
  return null;
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.6], fov: 38 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#040405"]} />
      <fog attach="fog" args={["#040405", 4, 14]} />
      <ambientLight intensity={0.08} />
      {/* Key light — narrow blood-red beam from above */}
      <spotLight position={[0, 6, 1.5]} target-position={[0, 0, 0]} intensity={90} angle={0.28} penumbra={0.9} color="#ff1e2a" castShadow shadow-mapSize={[1024, 1024]} />
      {/* Cool chrome rim from behind */}
      <spotLight position={[-4, 2, -3]} intensity={40} angle={0.7} penumbra={1} color="#a0b8ff" />
      {/* Warm fill from front-right */}
      <spotLight position={[3.5, 1.5, 4]} intensity={22} angle={0.6} penumbra={1} color="#ffffff" />
      <Environment preset="night" />
      <LightShaft />
      <Monolith />
      <Dust />
      <ContactShadows position={[0, -1.85, 0]} opacity={0.7} scale={10} blur={3} far={4} color="#000000" />
      <CameraRig />
    </Canvas>
  );
}