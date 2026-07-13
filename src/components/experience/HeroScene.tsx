import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * LAYERED MONOLITH
 * ────────────────────────────────────────────────────────────
 * A tall obsidian sculpture composed of ~64 individual slabs stacked
 * vertically. Each slab has real thickness, subtle random offset, and
 * an aperture cut through the middle 40% so a mechanical iris can
 * live inside the negative space.
 *
 * • Idle: every slab breathes on its own phase (float + rotate).
 * • Scroll: slabs separate along Y, drift on X, and rotate — as if the
 *   monument were disassembling to let the camera pass through.
 * • Center: a mechanical iris of 8 chrome blades that slowly rotates
 *   and opens/closes around a blood-red energy core.
 */

const SLAB_COUNT = 64;
const SLAB_TOTAL_HEIGHT = 4.6;
const SLAB_GAP = SLAB_TOTAL_HEIGHT / SLAB_COUNT;
const IRIS_INNER_INDEX = Math.floor(SLAB_COUNT * 0.42);
const IRIS_OUTER_INDEX = Math.floor(SLAB_COUNT * 0.58);

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight;
      setP(Math.min(1, Math.max(0, window.scrollY / (h * 1.4))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

/** Precomputed per-slab characteristics — stable across renders. */
function useSlabRecipes() {
  return useMemo(() => {
    const arr = [] as Array<{
      y0: number;
      widthBias: number;
      depthBias: number;
      xJitter: number;
      zJitter: number;
      rotZ: number;
      phase: number;
      isIrisRow: boolean;
      isKey: boolean;
    }>;
    for (let i = 0; i < SLAB_COUNT; i++) {
      const t = i / (SLAB_COUNT - 1); // 0 bottom → 1 top
      // Concentric silhouette — narrower at ends, wide near iris
      const bell = Math.sin(t * Math.PI); // 0..1..0
      const widthBias = 0.7 + bell * 0.55 + Math.random() * 0.05;
      const depthBias = 0.55 + bell * 0.35 + Math.random() * 0.04;
      arr.push({
        y0: (t - 0.5) * SLAB_TOTAL_HEIGHT,
        widthBias,
        depthBias,
        xJitter: (Math.random() - 0.5) * 0.02,
        zJitter: (Math.random() - 0.5) * 0.03,
        rotZ: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
        isIrisRow: i >= IRIS_INNER_INDEX && i <= IRIS_OUTER_INDEX,
        isKey: i % 8 === 0,
      });
    }
    return arr;
  }, []);
}

/** A single obsidian slab with chrome edge highlights. */
function Slab({
  index,
  recipe,
  scroll,
}: {
  index: number;
  recipe: ReturnType<typeof useSlabRecipes>[number];
  scroll: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Idle breathing — each slab has its own phase, tiny amplitude
    const idleY = Math.sin(t * 0.5 + recipe.phase) * 0.006;
    const idleRotY = Math.sin(t * 0.3 + recipe.phase) * 0.01;
    const idleRotX = Math.cos(t * 0.35 + recipe.phase) * 0.006;

    // Scroll separation — slabs fan out from center outward, keys further
    const from = (index - SLAB_COUNT / 2) / (SLAB_COUNT / 2); // -1..1
    const sepAmount = scroll * 1.4;
    const sepY = from * sepAmount * (recipe.isKey ? 1.15 : 0.85);
    const sepX = Math.sin(index * 0.9) * scroll * 0.18 + recipe.xJitter;
    const sepZ = Math.cos(index * 0.7) * scroll * 0.14 + recipe.zJitter;
    const sepRot = from * scroll * 0.12 + recipe.rotZ;

    ref.current.position.set(sepX, recipe.y0 + idleY + sepY, sepZ);
    ref.current.rotation.set(idleRotX, idleRotY, sepRot);
  });

  const width = 1.6 * recipe.widthBias;
  const depth = 0.28 * recipe.depthBias;
  const height = SLAB_GAP * 0.88;

  // Iris-row slabs have a wide cavity cut through — represented by a shorter
  // depth slab plus two side wings, so the negative space in the center is
  // preserved for the mechanical iris behind.
  if (recipe.isIrisRow) {
    const wing = width * 0.28;
    const gap = width - wing * 2;
    return (
      <group ref={ref}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (gap / 2 + wing / 2), 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[wing, height, depth]} />
            <meshPhysicalMaterial
              color="#050506"
              metalness={0.9}
              roughness={0.25}
              clearcoat={1}
              clearcoatRoughness={0.12}
              reflectivity={0.9}
            />
          </mesh>
        ))}
        {/* Chrome front edges */}
        {[-1, 1].map((s) => (
          <mesh key={`e${s}`} position={[s * (gap / 2 + wing / 2), height / 2 - 0.002, depth / 2]}>
            <boxGeometry args={[wing, 0.006, 0.004]} />
            <meshStandardMaterial color="#f0f0f4" metalness={1} roughness={0.08} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color={recipe.isKey ? "#070708" : "#050506"}
          metalness={0.88}
          roughness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
      {/* Front chrome top edge — catches the key light */}
      <mesh position={[0, height / 2 - 0.002, depth / 2]}>
        <boxGeometry args={[width * 0.98, 0.004, 0.004]} />
        <meshStandardMaterial color="#eaeaee" metalness={1} roughness={0.06} />
      </mesh>
      {/* Bottom shadow edge */}
      <mesh position={[0, -height / 2 + 0.001, depth / 2]}>
        <boxGeometry args={[width * 0.98, 0.003, 0.004]} />
        <meshStandardMaterial color="#101012" metalness={1} roughness={0.5} />
      </mesh>
      {/* Occasional red micro-seam glowing through */}
      {recipe.isKey && (
        <mesh position={[0, -height / 2 + 0.001, 0]}>
          <boxGeometry args={[width * 0.6, 0.002, depth * 1.02]} />
          <meshStandardMaterial
            color="#000"
            emissive="#d81828"
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** Mechanical iris — 8 chrome blades rotating around a red core. */
function MechanicalIris({ scroll }: { scroll: number }) {
  const ring = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const rim = useRef<THREE.Mesh>(null);
  const BLADE_COUNT = 8;
  const glowTex = useRadialGlowTexture();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z = t * 0.06;
    if (blades.current) {
      // Base slow rotation + open with scroll
      blades.current.rotation.z = -t * 0.09;
      const openAmt = 0.25 + scroll * 0.7; // radial offset
      blades.current.children.forEach((child, i) => {
        const a = (i / BLADE_COUNT) * Math.PI * 2;
        const m = child as THREE.Mesh;
        m.position.set(Math.cos(a) * openAmt, Math.sin(a) * openAmt, 0);
        m.rotation.z = a + Math.PI / 2;
      });
    }
    if (core.current) {
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2 + Math.sin(t * 1.8) * 0.5 + scroll * 1.5;
      core.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03);
    }
    if (rim.current) {
      const mat = rim.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.4 + Math.sin(t * 1.1) * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer chrome housing ring */}
      <group ref={ring}>
        <mesh>
          <torusGeometry args={[0.62, 0.028, 16, 96]} />
          <meshStandardMaterial color="#e6e6ea" metalness={1} roughness={0.14} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.72, 0.008, 12, 64]} />
          <meshStandardMaterial color="#b8b8bc" metalness={1} roughness={0.2} />
        </mesh>
        {/* Precision ticks */}
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          const long = i % 6 === 0;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[long ? 0.05 : 0.02, 0.005, 0.004]} />
              <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.18} />
            </mesh>
          );
        })}
      </group>

      {/* Iris blades — 8 chromed wedges circling the core */}
      <group ref={blades}>
        {Array.from({ length: BLADE_COUNT }).map((_, i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[0.44, 0.09, 0.03]} />
            <meshPhysicalMaterial
              color="#d0d0d4"
              metalness={1}
              roughness={0.14}
              clearcoat={1}
              clearcoatRoughness={0.1}
              iridescence={0.55}
              iridescenceIOR={1.6}
              iridescenceThicknessRange={[120, 520]}
            />
          </mesh>
        ))}
      </group>

      {/* Inner red rim */}
      <mesh ref={rim}>
        <torusGeometry args={[0.22, 0.012, 12, 64]} />
        <meshStandardMaterial color="#20000a" emissive="#e01822" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>

      {/* Blood-red energy core */}
      <mesh ref={core} position={[0, 0, -0.01]}>
        <circleGeometry args={[0.2, 64]} />
        <meshStandardMaterial
          color="#2a0004"
          emissive="#f01822"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* Radial glow sprite behind the core — adds bloom without post-fx */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial
          color="#ff1e2a"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={glowTex}
        />
      </mesh>

      {/* Core point light for volumetric feel */}
      <pointLight color="#ff1e2a" intensity={2.4} distance={4} position={[0, 0, 0.4]} />
    </group>
  );
}

/** Procedural radial-gradient texture for additive glow sprites. */
function useRadialGlowTexture() {
  return useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,90,100,1)");
    g.addColorStop(0.25, "rgba(220,20,32,0.55)");
    g.addColorStop(0.6, "rgba(90,4,10,0.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/** Outer engraved halo ring — glyph ticks orbiting the monolith. */
function GlyphHalo({ scroll }: { scroll: number }) {
  const g = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (g.current) g.current.rotation.z = t * 0.04 + scroll * 0.6;
    if (inner.current) inner.current.rotation.z = -t * 0.07 - scroll * 0.4;
  });
  const count = 72;
  return (
    <group position={[0, 0, -0.3]}>
      <group ref={g}>
        {Array.from({ length: count }).map((_, i) => {
          const a = (i / count) * Math.PI * 2;
          const long = i % 9 === 0;
          const r = 2.55;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[long ? 0.14 : 0.05, 0.006, 0.004]} />
              <meshStandardMaterial
                color={long ? "#ffd6d8" : "#8a8a8e"}
                metalness={1}
                roughness={0.2}
                emissive={long ? "#c81018" : "#000000"}
                emissiveIntensity={long ? 1.2 : 0}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>
      <group ref={inner}>
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r = 2.15;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.03, 0.004, 0.003]} />
              <meshStandardMaterial color="#5a5a5e" metalness={1} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Rising ember particles — additive red sparks drifting upward. */
function Embers({ count = 90 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 3.4;
      arr[i * 3 + 1] = -2.4 + Math.random() * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      speed[i] = 0.15 + Math.random() * 0.35;
    }
    return { arr, speed };
  }, [count]);
  const tex = useRadialGlowTexture();

  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = (ref.current.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + seeds.speed[i] * delta;
      const x = pos.getX(i) + Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.002;
      if (y > 2.6) y = -2.4;
      pos.setY(i, y);
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seeds.arr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        map={tex}
        color="#ff2a2a"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Monolith() {
  const group = useRef<THREE.Group>(null);
  const recipes = useSlabRecipes();
  const scroll = useScrollProgress();
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!group.current) return;
    const px = state.pointer.x;
    const py = state.pointer.y;
    target.current.x += (py * 0.1 - target.current.x) * 0.04;
    target.current.y += (px * 0.22 - target.current.y) * 0.04;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = target.current.y + Math.sin(t * 0.12) * 0.05;
    group.current.rotation.x = target.current.x + Math.sin(t * 0.35) * 0.012;
    group.current.position.y = Math.sin(t * 0.5) * 0.04;
  });

  return (
    <group ref={group} scale={0.9} position={[0, -0.1, 0]}>
      {recipes.map((r, i) => (
        <Slab key={i} index={i} recipe={r} scroll={scroll} />
      ))}
      <MechanicalIris scroll={scroll} />
    </group>
  );
}

function Dust({ count = 500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.018;
    const pos = (points.current.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.0014);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#d8b0b4" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Two crossing volumetric red shafts. */
function LightShafts() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) {
      (a.current.material as THREE.MeshBasicMaterial).opacity = 0.10 + Math.sin(t * 0.8) * 0.025;
      a.current.rotation.z = Math.sin(t * 0.2) * 0.06;
    }
    if (b.current) {
      (b.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + Math.cos(t * 0.7) * 0.02;
      b.current.rotation.z = -0.5 + Math.cos(t * 0.15) * 0.05;
    }
  });
  return (
    <>
      <mesh ref={a} position={[0, 3, -0.5]}>
        <coneGeometry args={[1.4, 7, 32, 1, true]} />
        <meshBasicMaterial color="#c81018" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={b} position={[-1, 3, -0.2]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.9, 6, 24, 1, true]} />
        <meshBasicMaterial color="#8b0000" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function CameraRig() {
  const { camera } = useThree();
  const scroll = useScrollProgress();
  const target = useRef(new THREE.Vector3(0, 0.05, 0));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Handheld breathing
    const bx = Math.sin(t * 0.24) * 0.06;
    const by = Math.cos(t * 0.19) * 0.04;
    // Dolly — start further away, push in as the monolith is being explored
    const dolly = 6.4 - scroll * 2.6;
    // Slight orbit as user scrolls
    const angle = scroll * Math.PI * 0.45;
    const desiredX = Math.sin(angle) * dolly + bx;
    const desiredZ = Math.cos(angle) * dolly;
    const desiredY = 0.15 + scroll * 0.4 + by;
    camera.position.x += (desiredX - camera.position.x) * 0.04;
    camera.position.y += (desiredY - camera.position.y) * 0.04;
    camera.position.z += (desiredZ - camera.position.z) * 0.04;
    camera.lookAt(target.current);
  });
  return null;
}

export function HeroScene() {
  return <SceneCanvas />;
}

function SceneCanvas() {
  const scroll = useScrollProgress();
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6.4], fov: 36 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      shadows
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={["#040405", 5, 16]} />
      <ambientLight intensity={0.06} />
      {/* Narrow blood-red key from above */}
      <spotLight
        position={[0, 7, 1.5]}
        target-position={[0, 0, 0]}
        intensity={110}
        angle={0.3}
        penumbra={0.95}
        color="#ff1e2a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Cool chrome rim from behind */}
      <spotLight position={[-4.5, 2.4, -3]} intensity={55} angle={0.7} penumbra={1} color="#a8bcff" />
      {/* Warm fill front-right */}
      <spotLight position={[3.5, 1.8, 4]} intensity={26} angle={0.6} penumbra={1} color="#ffffff" />
      <Environment preset="night" />
      <LightShafts />
      <GlyphHalo scroll={scroll} />
      <Monolith />
      <Embers />
      <Dust />
      <ContactShadows position={[0, -2.4, 0]} opacity={0.75} scale={12} blur={3.2} far={4.5} color="#000000" />
      <CameraRig />
    </Canvas>
  );
}