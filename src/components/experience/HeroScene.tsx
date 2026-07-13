import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, ContactShadows } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function ChromeBadge() {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!group.current) return;
    const mx = state.pointer.x;
    const my = state.pointer.y;
    target.current.x += (my * 0.35 - target.current.x) * 0.06;
    target.current.y += (mx * 0.55 - target.current.y) * 0.06;
    group.current.rotation.x = target.current.x;
    group.current.rotation.y = state.clock.elapsedTime * 0.15 + target.current.y;
  });

  return (
    <group ref={group}>
      {/* Outer chrome ring */}
      <mesh castShadow>
        <torusGeometry args={[1.6, 0.09, 64, 200]} />
        <meshStandardMaterial color="#e8e8ec" metalness={1} roughness={0.15} />
      </mesh>
      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[1.35, 0.03, 32, 200]} />
        <meshStandardMaterial color="#8a0a10" metalness={0.9} roughness={0.25} emissive="#5a0308" emissiveIntensity={0.6} />
      </mesh>
      {/* Glass core */}
      <mesh>
        <cylinderGeometry args={[1.15, 1.15, 0.14, 64]} />
        <MeshTransmissionMaterial
          thickness={0.6}
          transmission={1}
          roughness={0.05}
          ior={1.4}
          chromaticAberration={0.06}
          backside
          color="#1a0508"
        />
      </mesh>
      {/* Red gem */}
      <mesh position={[0, 0, 0.08]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshPhysicalMaterial
          color="#7a0008"
          metalness={0.4}
          roughness={0.1}
          clearcoat={1}
          emissive="#a80510"
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* Chrome pin bolts */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0]}>
            <sphereGeometry args={[0.06, 24, 24]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.05} />
          </mesh>
        );
      })}
    </group>
  );
}

function Particles({ count = 220 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.03;
    const geo = points.current.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + Math.sin(state.clock.elapsedTime + i) * 0.002);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#e6b7bc" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#050203"]} />
      <fog attach="fog" args={["#050203", 5, 14]} />
      <ambientLight intensity={0.15} />
      <spotLight position={[6, 6, 4]} intensity={40} angle={0.4} penumbra={0.6} color="#ffffff" castShadow />
      <spotLight position={[-6, -3, 3]} intensity={30} angle={0.6} penumbra={1} color="#c81020" />
      <pointLight position={[0, 0, 2]} intensity={2.5} color="#ff3040" />
      <Environment preset="warehouse" />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <ChromeBadge />
      </Float>
      <Particles />
      <ContactShadows position={[0, -1.9, 0]} opacity={0.55} scale={8} blur={2.4} far={4} color="#8a0010" />
    </Canvas>
  );
}