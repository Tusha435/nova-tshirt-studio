import React, { Suspense, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Decal } from "@react-three/drei";
import * as THREE from "three";
import { getFabricMaps } from "./fabricMaps.js";

// Shared photoreal tee: draped cloth wrinkles baked into the geometry,
// knit fabric material with sheen, and the pattern projected onto the
// wrinkled surface (drei Decal) so the print follows every fold.

function makeTeeGeometry() {
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
    bevelThickness: 0.13,
    bevelSize: 0.13,
    bevelSegments: 6,
    steps: 2,
    curveSegments: 32,
  });
  geometry.center();

  // Drape: layered folds on the front/back panels, calmer around the
  // chest print area so the decal reads cleanly.
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const panel = THREE.MathUtils.smoothstep(Math.abs(v.z), 0.18, 0.34);
    const calm =
      v.z > 0
        ? 1 - 0.7 * Math.exp(-(v.x * v.x * 1.6 + (v.y - 0.1) * (v.y - 0.1) * 1.3) * 2.2)
        : 1;
    const folds =
      Math.sin(v.x * 3.4 + v.y * 1.7) * Math.cos(v.y * 4.6 - v.x * 0.9) * 0.6 +
      Math.sin(v.y * 8.2 + v.x * 5.1) * 0.28 +
      Math.sin(v.x * 12.7 - v.y * 9.3) * 0.12;
    pos.setZ(i, v.z + Math.sign(v.z) * folds * 0.034 * panel * calm);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function PatternDecal({ url, progressRef }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const mat = useRef();

  useFrame(() => {
    if (!mat.current || !progressRef) return;
    mat.current.opacity = THREE.MathUtils.clamp((progressRef.current - 0.1) / 0.55, 0, 1);
  });

  return (
    <Decal position={[0, 0.06, 0.34]} rotation={[0, 0, 0]} scale={[1.35, 1.6, 0.9]}>
      <meshPhysicalMaterial
        ref={mat}
        map={texture}
        transparent
        opacity={progressRef ? 0 : 1}
        roughness={0.62}
        clearcoat={0.22}
        clearcoatRoughness={0.32}
        polygonOffset
        polygonOffsetFactor={-6}
      />
    </Decal>
  );
}

export default function TeeModel({ color = "#7c5cff", patternUrl = null, progressRef = null }) {
  const geometry = useMemo(makeTeeGeometry, []);
  const { normalMap, roughnessMap } = getFabricMaps();
  const normalScale = useMemo(() => new THREE.Vector2(0.32, 0.32), []);
  const collarColor = useMemo(() => new THREE.Color(color).multiplyScalar(0.88), [color]);

  const fabric = {
    color,
    roughness: 0.82,
    metalness: 0.02,
    sheen: 0.5,
    sheenRoughness: 0.6,
    sheenColor: "#ffffff",
    normalMap,
    normalScale,
    roughnessMap,
  };

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial {...fabric} />
        {patternUrl && (
          <Suspense fallback={null}>
            <PatternDecal url={patternUrl} progressRef={progressRef} />
          </Suspense>
        )}
      </mesh>
      <mesh position={[1.06, 0.62, 0]} rotation={[0, 0, -0.94]} castShadow>
        <capsuleGeometry args={[0.25, 0.34, 12, 28]} />
        <meshPhysicalMaterial {...fabric} />
      </mesh>
      <mesh position={[-1.06, 0.62, 0]} rotation={[0, 0, 0.94]} castShadow>
        <capsuleGeometry args={[0.25, 0.34, 12, 28]} />
        <meshPhysicalMaterial {...fabric} />
      </mesh>
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.06, 16, 48, Math.PI * 1.2]} />
        <meshPhysicalMaterial {...fabric} color={collarColor} />
      </mesh>
    </group>
  );
}
