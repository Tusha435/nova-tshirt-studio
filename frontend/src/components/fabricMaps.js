import * as THREE from "three";

// Procedurally generated cotton-jersey knit maps (normal + roughness).
// Built once on the CPU — no texture downloads, always available offline.
let cached = null;

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function getFabricMaps() {
  if (cached) return cached;

  const S = 256;
  const RIBS = 22;
  const height = new Float32Array(S * S);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = (x / S) * RIBS * Math.PI * 2;
      const v = (y / S) * RIBS * Math.PI * 2;
      // interlocking knit loops: vertical ribs modulated by course waves
      const knit =
        Math.sin(u + Math.sin(v * 0.5) * 0.85) * 0.6 +
        Math.sin(v + Math.cos(u * 0.5) * 0.6) * 0.4;
      const fuzz = hash(x, y) * 0.14;
      height[y * S + x] = knit * 0.5 + 0.5 + fuzz;
    }
  }

  const normalData = new Uint8Array(S * S * 4);
  const strength = 2.1;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const xl = height[y * S + ((x - 1 + S) % S)];
      const xr = height[y * S + ((x + 1) % S)];
      const yu = height[((y - 1 + S) % S) * S + x];
      const yd = height[((y + 1) % S) * S + x];
      const nx = (xl - xr) * strength;
      const ny = (yu - yd) * strength;
      const inv = 1 / Math.hypot(nx, ny, 1);
      const i4 = (y * S + x) * 4;
      normalData[i4] = (nx * inv * 0.5 + 0.5) * 255;
      normalData[i4 + 1] = (ny * inv * 0.5 + 0.5) * 255;
      normalData[i4 + 2] = (inv * 0.5 + 0.5) * 255;
      normalData[i4 + 3] = 255;
    }
  }
  const normalMap = new THREE.DataTexture(normalData, S, S);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(5, 5);
  normalMap.needsUpdate = true;

  const roughData = new Uint8Array(S * S * 4);
  for (let i = 0; i < S * S; i++) {
    const r = Math.max(0, Math.min(255, 205 + (height[i] - 0.65) * 50));
    roughData[i * 4] = roughData[i * 4 + 1] = roughData[i * 4 + 2] = r;
    roughData[i * 4 + 3] = 255;
  }
  const roughnessMap = new THREE.DataTexture(roughData, S, S);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(5, 5);
  roughnessMap.needsUpdate = true;

  cached = { normalMap, roughnessMap };
  return cached;
}
