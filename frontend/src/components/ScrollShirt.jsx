import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, Float, Html } from "@react-three/drei";
import SafeEnvironment from "./SafeEnvironment.jsx";
import * as THREE from "three";

function makeBody() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.95, 1.12);
  shape.lineTo(-1.4, 0.76);
  shape.lineTo(-0.98, 0.54);
  shape.lineTo(-0.9, -1.22);
  shape.quadraticCurveTo(-0.88, -1.42, -0.58, -1.42);
  shape.lineTo(0.58, -1.42);
  shape.quadraticCurveTo(0.88, -1.42, 0.9, -1.22);
  shape.lineTo(0.98, 0.54);
  shape.lineTo(1.4, 0.76);
  shape.lineTo(0.95, 1.12);
  shape.quadraticCurveTo(0, 1.02, -0.95, 1.12);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.12,
    bevelSegments: 4,
    steps: 1,
    curveSegments: 24,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function Sleeve({ side, color }) {
  return (
    <mesh position={[side * 1.06, 0.62, 0]} rotation={[0, 0, side * -0.94]}>
      <capsuleGeometry args={[0.25, 0.34, 10, 24]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.06} />
    </mesh>
  );
}

function Decal({ url, progress }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = useRef();

  useFrame(() => {
    if (!mesh.current) return;
    const p = THREE.MathUtils.clamp((progress.current - 0.1) / 0.55, 0, 1);
    mesh.current.material.opacity = p;
    const scale = 0.78 + p * 0.28;
    mesh.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={mesh} position={[0, 0.12, 0.34]}>
      <planeGeometry args={[1.38, 1.7, 12, 12]} />
      <meshPhysicalMaterial
        map={texture}
        transparent
        opacity={0}
        roughness={0.38}
        clearcoat={0.4}
        clearcoatRoughness={0.24}
        polygonOffset
        polygonOffsetFactor={-3}
      />
    </mesh>
  );
}

function Shirt({ color, patternUrl, progress, velocity }) {
  const bodyGeometry = useMemo(makeBody, []);
  const group = useRef();
  const momentum = useRef(0);

  useFrame((state, dt) => {
    const scroll = progress.current;
    const vel = velocity?.current || 0;
    momentum.current = THREE.MathUtils.damp(momentum.current, vel * 1.2, 5, dt);

    if (group.current) {
      group.current.rotation.y = scroll * Math.PI * 1.5 + Math.sin(state.clock.elapsedTime * 0.32) * 0.04 + momentum.current * 0.12;
      group.current.rotation.x = scroll * 0.26 + vel * 0.08;
      group.current.rotation.z = vel * -0.08;
      const scale = 0.9 + scroll * 0.4;
      const stretch = 1 + Math.abs(vel) * 0.06;
      group.current.scale.set(scale / Math.sqrt(stretch), scale * stretch, scale / Math.sqrt(stretch));
      group.current.position.y = -scroll * 0.24;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={bodyGeometry} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.06} />
      </mesh>
      <Sleeve side={1} color={color} />
      <Sleeve side={-1} color={color} />
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.055, 15, 48, Math.PI * 1.2]} />
        <meshStandardMaterial color={color} roughness={0.84} metalness={0.06} />
      </mesh>
      {patternUrl && (
        <Suspense fallback={<Html center className="text-sm text-ink/70">Loading design…</Html>}>
          <Decal url={patternUrl} progress={progress} />
        </Suspense>
      )}
    </group>
  );
}

export default function ScrollShirt({ color = "#7c5cff", patternUrl = null, progress, velocity }) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 7.3], fov: 38 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
      <ambientLight intensity={0.55} />
      <spotLight position={[5.5, 8, 5]} angle={0.38} penumbra={0.9} intensity={2.5} castShadow />
      <pointLight position={[-7, -1, -4]} intensity={1.2} color="#7c5cff" />
      <pointLight position={[7.2, 1.5, 4.2]} intensity={1.4} color="#00f0ff" />
      <pointLight position={[0, 4.5, 2]} intensity={0.9} color="#ff3df0" />

      <Float rotationIntensity={0.42} floatIntensity={0.18} floatingRange={[0.1, 0.16]}>
        <Suspense fallback={<Html center className="text-sm text-ink/70">Loading shirt…</Html>}>
          <Shirt color={color} patternUrl={patternUrl} progress={progress} velocity={velocity} />
        </Suspense>
      </Float>

      <ContactShadows position={[0, -2.3, 0]} opacity={0.45} scale={13} blur={2.5} far={5} />
      <SafeEnvironment preset="dawn" />
    </Canvas>
  );
}