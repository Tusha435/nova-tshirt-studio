import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import TeeModel from "./TeeModel.jsx";
import StudioEnvironment from "./StudioEnvironment.jsx";

// Gentle sway instead of a full spin, so the printed front stays visible.
function Sway({ children }) {
  const group = useRef();
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.55;
    }
  });
  return <group ref={group}>{children}</group>;
}

export default function MiniShirt({ color = "#7c5cff", patternUrl = null }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 5.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.28} />
      <directionalLight position={[3, 5, 4]} intensity={0.9} castShadow />

      <Float rotationIntensity={0.3} floatIntensity={0.25} floatingRange={[0.05, 0.12]}>
        <Sway>
          <TeeModel color={color} patternUrl={patternUrl} />
        </Sway>
      </Float>

      <ContactShadows position={[0, -1.7, 0]} opacity={0.4} scale={6} blur={2.4} far={4} />
      <StudioEnvironment />
    </Canvas>
  );
}
