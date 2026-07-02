import React from "react";
import { Environment, Lightformer } from "@react-three/drei";

// Apparel-studio light rig rendered locally with Lightformers:
// key softbox overhead, cool/warm side fills, and a broad front fill.
// No HDR downloads — reflections and fabric sheen work offline.
export default function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#1c1c22"]} />
      <Lightformer
        form="rect"
        intensity={2.1}
        rotation-x={Math.PI / 2}
        position={[0, 5, -1]}
        scale={[9, 9, 1]}
      />
      <Lightformer
        form="rect"
        intensity={0.9}
        rotation-y={Math.PI / 2}
        position={[-5.5, 1, -1]}
        scale={[6, 3.5, 1]}
        color="#dcecff"
      />
      <Lightformer
        form="rect"
        intensity={0.75}
        rotation-y={-Math.PI / 2}
        position={[5.5, 0.5, 0.5]}
        scale={[6, 3.5, 1]}
        color="#fff1e4"
      />
      <Lightformer
        form="rect"
        intensity={0.5}
        position={[0, 0.5, 6.5]}
        scale={[9, 5, 1]}
      />
      <Lightformer
        form="circle"
        intensity={0.7}
        rotation-x={-Math.PI / 2}
        position={[0, -4.5, 0]}
        scale={[7, 7, 1]}
        color="#cfd6ff"
      />
    </Environment>
  );
}
