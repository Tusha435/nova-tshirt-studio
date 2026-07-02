import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import TeeModel from "./TeeModel.jsx";
import StudioEnvironment from "./StudioEnvironment.jsx";

function AnimatedTee({ color, patternUrl, progress, velocity }) {
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
      <TeeModel color={color} patternUrl={patternUrl} progressRef={progress} />
    </group>
  );
}

export default function ScrollShirt({ color = "#7c5cff", patternUrl = null, progress, velocity }) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 7.3], fov: 38 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
      <ambientLight intensity={0.3} />
      <spotLight position={[5.5, 8, 5]} angle={0.38} penumbra={0.9} intensity={1.3} castShadow />
      <pointLight position={[-7, -1, -4]} intensity={0.5} color="#6d4aff" />
      <pointLight position={[7.2, 1.5, 4.2]} intensity={0.45} color="#00bee9" />

      <Float rotationIntensity={0.42} floatIntensity={0.18} floatingRange={[0.1, 0.16]}>
        <Suspense fallback={<Html center className="text-sm text-ink/70">Loading shirt…</Html>}>
          <AnimatedTee color={color} patternUrl={patternUrl} progress={progress} velocity={velocity} />
        </Suspense>
      </Float>

      <ContactShadows position={[0, -2.3, 0]} opacity={0.45} scale={13} blur={2.5} far={5} />
      <StudioEnvironment />
    </Canvas>
  );
}
