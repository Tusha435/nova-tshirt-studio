import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

function makeBody() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.9, 1.1);
  shape.lineTo(-1.35, 0.74);
  shape.lineTo(-0.95, 0.52);
  shape.lineTo(-0.88, -1.2);
  shape.quadraticCurveTo(-0.86, -1.38, -0.56, -1.38);
  shape.lineTo(0.56, -1.38);
  shape.quadraticCurveTo(0.86, -1.38, 0.88, -1.2);
  shape.lineTo(0.95, 0.52);
  shape.lineTo(1.35, 0.74);
  shape.lineTo(0.9, 1.1);
  shape.quadraticCurveTo(0, 1.0, -0.9, 1.1);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 20,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function Tee({ color }) {
  const meshRef = useRef();
  const bodyGeometry = useMemo(makeBody, []);
  useFrame((state, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.65;
  });

  return (
    <mesh ref={meshRef} geometry={bodyGeometry}>
      <meshStandardMaterial color={color} roughness={0.86} metalness={0.06} />
    </mesh>
  );
}

export default function MiniShirt({ color = "#7c5cff" }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 38 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.68} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <pointLight position={[-4, -1, -2]} intensity={1.3} color="#00f0ff" />
      <pointLight position={[4, 2, 3]} intensity={1.1} color="#ff3df0" />

      <Float rotationIntensity={0.45} floatIntensity={0.25} floatingRange={[0.05, 0.12]}>
        <Tee color={color} />
      </Float>

      <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={5} blur={2.4} far={4} />
    </Canvas>
  );
}