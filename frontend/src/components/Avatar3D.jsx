import React, { useEffect, useMemo, useRef, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { ContactShadows, PresentationControls, Html, useProgress } from "@react-three/drei";
import SafeEnvironment from "./SafeEnvironment.jsx";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/Soldier.glb";
useGLTF.preload(MODEL_URL);

function LoadingOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80 backdrop-blur-xl">
        Loading avatar — {Math.round(progress)}%
      </div>
    </Html>
  );
}

function Human({ patternUrl, shirtColor }) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const idleName = names.find((name) => /idle/i.test(name)) || names[0];
    const action = actions[idleName];
    if (action) {
      action.reset().fadeIn(0.35).setLoop(THREE.LoopRepeat, Infinity).play();
    }
    return () => action?.fadeOut(0.2);
  }, [actions, names]);

  const { scale, yOffset, chestY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const targetHeight = 2.75;
    const scaleFactor = targetHeight / (size.y || 1.8);
    const centerY = (box.min.y + box.max.y) / 2;
    const yOffsetValue = -centerY * scaleFactor;
    const chestPos = (box.min.y + size.y * 0.68) * scaleFactor + yOffsetValue;
    return { scale: scaleFactor, yOffset: yOffsetValue, chestY: chestPos };
  }, [cloned]);

  useMemo(() => {
    cloned.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        if (/vanguard_Mesh/i.test(object.name) || /shirt/i.test(object.name)) {
          object.material = object.material.clone();
          object.material.color = new THREE.Color(shirtColor);
          object.material.roughness = 0.82;
          object.material.metalness = 0.05;
        }
      }
    });
  }, [cloned, shirtColor]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={cloned} scale={scale} position={[0, yOffset, 0]} />
      {patternUrl && <ChestDecal url={patternUrl} y={chestY} />}
    </group>
  );
}

function ChestDecal({ url, y }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return (
    <mesh position={[0, y, 0.42]}>
      <planeGeometry args={[0.82, 0.9, 10, 10]} />
      <meshPhysicalMaterial
        map={texture}
        transparent
        roughness={0.68}
        clearcoat={0.3}
        clearcoatRoughness={0.22}
        polygonOffset
        polygonOffsetFactor={-4}
      />
    </mesh>
  );
}

export default function Avatar3D({ patternUrl, shirtColor = "#7c5cff" }) {
  return (
    <Canvas shadows camera={{ position: [0, 0.2, 5.5], fov: 34 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <spotLight position={[5.2, 8.5, 5]} angle={0.38} penumbra={0.85} intensity={2.6} castShadow />
      <pointLight position={[-6, 1, -3]} intensity={1.3} color="#7c5cff" />
      <pointLight position={[6, 0, 4]} intensity={1.25} color="#00f0ff" />
      <pointLight position={[0, -1.3, 3]} intensity={0.9} color="#ff3df0" />

      <PresentationControls
        global
        snap
        polar={[-0.18, 0.25]}
        azimuth={[-0.9, 0.9]}
        config={{ mass: 1.05, tension: 220 }}
      >
        <Suspense fallback={<LoadingOverlay />}>
          <Human patternUrl={patternUrl} shirtColor={shirtColor} />
        </Suspense>
      </PresentationControls>

      <ContactShadows position={[0, -1.45, 0]} opacity={0.55} scale={6} blur={2.8} far={4} />
      <SafeEnvironment preset="studio" />
    </Canvas>
  );
}