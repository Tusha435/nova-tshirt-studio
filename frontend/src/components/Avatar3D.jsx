import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { ContactShadows, PresentationControls, Html, useProgress } from "@react-three/drei";
import StudioEnvironment from "./StudioEnvironment.jsx";
import { getFabricMaps } from "./fabricMaps.js";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

const MODEL_URL = "/models/Soldier.glb";
useGLTF.preload(MODEL_URL);

function LoadingOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-3xl border border-ink/10 bg-ink/5 px-5 py-4 text-sm text-ink/80 backdrop-blur-xl">
        Loading avatar — {Math.round(progress)}%
      </div>
    </Html>
  );
}

function Human({ patternUrl, shirtColor }) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  // SkeletonUtils.clone keeps the skeleton bound to the cloned bones —
  // a naive scene.clone() leaves the skin attached to the original,
  // freezing the model in a broken T-pose.
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const idleName = names.find((name) => /idle/i.test(name)) || names[0];
    const action = actions[idleName];
    if (action) {
      action.reset().fadeIn(0.35).setLoop(THREE.LoopRepeat, Infinity).play();
    }
    return () => action?.fadeOut(0.2);
  }, [actions, names]);

  // Box3.setFromObject reads raw bind-space geometry and is wrong for
  // skinned meshes, so measure the bone-driven vertices after mount.
  const [fit, setFit] = useState(null);
  useEffect(() => {
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const v = new THREE.Vector3();
    cloned.traverse((child) => {
      if (child.isSkinnedMesh) {
        child.skeleton.update();
        const posAttr = child.geometry.attributes.position;
        const step = Math.max(1, Math.floor(posAttr.count / 600));
        for (let i = 0; i < posAttr.count; i += step) {
          v.fromBufferAttribute(posAttr, i);
          child.applyBoneTransform(i, v);
          v.applyMatrix4(child.matrixWorld);
          box.expandByPoint(v);
        }
      }
    });
    if (box.isEmpty()) box.setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const targetHeight = 2.75;
    const scale = targetHeight / (size.y || 1.8);
    const centerY = (box.min.y + box.max.y) / 2;
    const yOffset = -centerY * scale;
    const chestY = (box.min.y + size.y * 0.68) * scale + yOffset;
    setFit({ scale, yOffset, chestY });
  }, [cloned]);

  useMemo(() => {
    const { normalMap } = getFabricMaps();
    cloned.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        if (/vanguard_Mesh/i.test(object.name) || /shirt/i.test(object.name)) {
          const old = object.material;
          // Knit fabric with sheen so the garment catches light like cotton,
          // keeping the model's own texture detail underneath the tint.
          object.material = new THREE.MeshPhysicalMaterial({
            map: old.map || null,
            normalMap: old.normalMap || normalMap,
            color: new THREE.Color(shirtColor),
            roughness: 0.85,
            metalness: 0.02,
            sheen: 0.45,
            sheenRoughness: 0.65,
            sheenColor: new THREE.Color("#ffffff"),
          });
        }
      }
    });
  }, [cloned, shirtColor]);

  return (
    <group ref={group} dispose={null} visible={!!fit}>
      <primitive object={cloned} scale={fit?.scale ?? 1} position={[0, fit?.yOffset ?? 0, 0]} />
      {patternUrl && fit && <ChestDecal url={patternUrl} y={fit.chestY} />}
    </group>
  );
}

function ChestDecal({ url, y }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  // Open cylinder segment so the print curves around the chest
  // instead of floating on a flat plane.
  return (
    <mesh position={[0, y, 0.02]}>
      <cylinderGeometry args={[0.44, 0.44, 0.92, 32, 1, true, -0.62, 1.24]} />
      <meshPhysicalMaterial
        map={texture}
        transparent
        side={THREE.FrontSide}
        roughness={0.68}
        clearcoat={0.25}
        clearcoatRoughness={0.28}
        polygonOffset
        polygonOffsetFactor={-4}
      />
    </mesh>
  );
}

export default function Avatar3D({ patternUrl, shirtColor = "#7c5cff" }) {
  return (
    <Canvas shadows camera={{ position: [0, 0.2, 5.5], fov: 34 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
      <ambientLight intensity={0.3} />
      <spotLight position={[5.2, 8.5, 5]} angle={0.38} penumbra={0.85} intensity={1.4} castShadow />
      <pointLight position={[-6, 1, -3]} intensity={0.5} color="#6d4aff" />
      <pointLight position={[6, 0, 4]} intensity={0.45} color="#00bee9" />

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
      <StudioEnvironment />
    </Canvas>
  );
}