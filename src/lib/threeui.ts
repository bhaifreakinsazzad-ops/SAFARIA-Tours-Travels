"use client";

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { animate } from "animejs";

/**
 * ThreeUI (threeui.js) — Spatial 3D Interface, Composite Procedural Fleet,
 * Instanced Starfield & Holographic Telemetry Engine for SAFARIA Tours & Travels.
 */

export interface SpatialTelemetryData {
  code: string;
  city: string;
  flightLevel: string;
  mach: string;
  distanceNm: number;
  durationEn: string;
  durationBn: string;
  corridorTagEn: string;
  corridorTagBn: string;
  headingDeg: number;
}

const ROUTE_TELEMETRY: Record<
  string,
  {
    fl: string;
    mach: string;
    nm: number;
    durEn: string;
    durBn: string;
    tagEn: string;
    tagBn: string;
    hdg: number;
  }
> = {
  RUH: {
    fl: "FL380",
    mach: "M0.84",
    nm: 2340,
    durEn: "5h 35m",
    durBn: "৫ ঘণ্টা ৩৫ মি.",
    tagEn: "Saudi Royal & Workforce Corridor",
    tagBn: "সৌদি ও প্রবাসী রুট",
    hdg: 278,
  },
  JED: {
    fl: "FL390",
    mach: "M0.85",
    nm: 2780,
    durEn: "6h 25m",
    durBn: "৬ ঘণ্টা ২৫ মি.",
    tagEn: "Umrah & Red Sea Gateway",
    tagBn: "ওমরাহ ও জেদ্দা গেটওয়ে",
    hdg: 274,
  },
  CXB: {
    fl: "FL210",
    mach: "M0.68",
    nm: 165,
    durEn: "0h 55m",
    durBn: "৫৫ মিনিট",
    tagEn: "Domestic Coastal Express",
    tagBn: "কক্সবাজার কোস্টাল এক্সপ্রেস",
    hdg: 152,
  },
  KUL: {
    fl: "FL360",
    mach: "M0.82",
    nm: 1420,
    durEn: "3h 55m",
    durBn: "৩ ঘণ্টা ৫৫ মি.",
    tagEn: "Student & ASEAN Mobility Hub",
    tagBn: "মালয়েশিয়া স্টুডেন্ট ও আসিয়ান হাব",
    hdg: 148,
  },
  SIN: {
    fl: "FL370",
    mach: "M0.83",
    nm: 1550,
    durEn: "4h 15m",
    durBn: "৪ ঘণ্টা ১৫ মি.",
    tagEn: "Executive & Medical Care Hub",
    tagBn: "সিঙ্গাপুর প্রিমিয়াম ও মেডিকেল রুট",
    hdg: 146,
  },
  DXB: {
    fl: "FL380",
    mach: "M0.84",
    nm: 1920,
    durEn: "4h 50m",
    durBn: "৪ ঘণ্টা ৫০ মি.",
    tagEn: "Global Transit & Gulf Hub",
    tagBn: "দুবাই ও গ্লোবাল ট্রানজিট হাব",
    hdg: 282,
  },
  CAN: {
    fl: "FL350",
    mach: "M0.81",
    nm: 1290,
    durEn: "3h 40m",
    durBn: "৩ ঘণ্টা ৪০ মি.",
    tagEn: "China Student & Trade Corridor",
    tagBn: "চীন স্টুডেন্ট ও বাণিজ্যিক রুট",
    hdg: 86,
  },
  LON: {
    fl: "FL400",
    mach: "M0.86",
    nm: 4320,
    durEn: "10h 30m",
    durBn: "১০ ঘণ্টা ৩০ মি.",
    tagEn: "UK Long-Haul & Diaspora Route",
    tagBn: "যুক্তরাজ্য লং-হল ও প্রবাসী রুট",
    hdg: 312,
  },
};

export function getRouteTelemetry(code: string, city: string): SpatialTelemetryData {
  const spec = ROUTE_TELEMETRY[code] || {
    fl: "FL370",
    mach: "M0.83",
    nm: 1850,
    durEn: "4h 30m",
    durBn: "৪ ঘণ্টা ৩০ মি.",
    tagEn: "International Corridor",
    tagBn: "আন্তর্জাতিক রুট",
    hdg: 270,
  };
  return {
    code,
    city,
    flightLevel: spec.fl,
    mach: spec.mach,
    distanceNm: spec.nm,
    durationEn: spec.durEn,
    durationBn: spec.durBn,
    corridorTagEn: spec.tagEn,
    corridorTagBn: spec.tagBn,
    headingDeg: spec.hdg,
  };
}

/**
 * Detects software WebGL (SwiftShader, llvmpipe, Basic Render) without leaving
 * any canvas in the DOM.
 */
export function detectSoftwareWebGL(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Generates a zero-dependency procedural RoomEnvironment reflection texture.
 */
export function applyStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): THREE.Texture | null {
  try {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();
    return envTexture;
  } catch {
    return null;
  }
}

/**
 * Builds a composite 6-part procedural 3D jet aircraft (`THREE.Group`) across
 * primary silhouette (fuselage), secondary read (swept delta wings & tailfin),
 * and accent detail (twin engine nacelles & glowing exhaust plume).
 */
export function createCompositeAircraft(
  sharedGeos: THREE.BufferGeometry[],
  sharedMats: THREE.Material[]
): THREE.Group {
  const jet = new THREE.Group();

  // 1. Primary Silhouette: Tapered Fuselage
  const fuselageGeo = new THREE.ConeGeometry(0.0085, 0.048, 8);
  fuselageGeo.rotateX(Math.PI / 2);
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xf7e7c4,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0xcfb57c,
    emissiveIntensity: 0.25,
  });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  jet.add(fuselage);

  // 2. Secondary Read: Swept Main Wings
  const wingGeo = new THREE.BoxGeometry(0.044, 0.0018, 0.014);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xcfb57c,
    metalness: 0.65,
    roughness: 0.45,
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, 0, -0.002);
  jet.add(wings);

  // 3. Secondary Read: Vertical Tail Stabilizer
  const tailGeo = new THREE.BoxGeometry(0.002, 0.013, 0.011);
  const tail = new THREE.Mesh(tailGeo, wingMat);
  tail.position.set(0, 0.006, -0.016);
  jet.add(tail);

  // 4 & 5. Accent Detail: Twin Under-Wing Engine Nacelles
  const engineGeo = new THREE.CylinderGeometry(0.0026, 0.0022, 0.012, 6);
  engineGeo.rotateX(Math.PI / 2);
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0x10b981,
    emissiveIntensity: 0.4,
  });
  const leftEngine = new THREE.Mesh(engineGeo, engineMat);
  leftEngine.position.set(-0.011, -0.002, 0.001);
  const rightEngine = new THREE.Mesh(engineGeo, engineMat);
  rightEngine.position.set(0.011, -0.002, 0.001);
  jet.add(leftEngine, rightEngine);

  // 6. Accent Detail: Glowing Jet Plume Halo
  const plumeGeo = new THREE.SphereGeometry(0.016, 8, 8);
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0xffd58a,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const plume = new THREE.Mesh(plumeGeo, plumeMat);
  plume.position.set(0, 0, -0.018);
  jet.add(plume);

  sharedGeos.push(fuselageGeo, wingGeo, tailGeo, engineGeo, plumeGeo);
  sharedMats.push(fuselageMat, wingMat, engineMat, plumeMat);

  return jet;
}

/**
 * Creates an InstancedMesh orbital starfield & spatial telemetry dust cloud around the globe
 * (single draw call, precomputed bounding sphere, deterministic golden-spiral distribution).
 */
export function createInstancedStarfield(
  sharedGeos: THREE.BufferGeometry[],
  sharedMats: THREE.Material[],
  count = 135
): THREE.InstancedMesh {
  const starGeo = new THREE.OctahedronGeometry(0.0065, 0);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.InstancedMesh(starGeo, starMat, count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const radius = 1.28 + ((i * 17) % 19) * 0.022;

    dummy.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    const scale = 0.65 + ((i * 13) % 7) * 0.14;
    dummy.scale.setScalar(scale);
    dummy.rotation.set(i * 0.3, i * 0.5, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.setHex(i % 3 === 0 ? 0x10b981 : i % 2 === 0 ? 0xcfb57c : 0xf3f0e7);
    mesh.setColorAt(i, color);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();

  sharedGeos.push(starGeo);
  sharedMats.push(starMat);

  return mesh;
}

/**
 * Creates a multi-part 3D Radar Beacon & Expanding Pulse Ring at the Dhaka (DAC) origin hub.
 */
export function createOriginRadarBeacon(
  originPos: THREE.Vector3,
  sharedGeos: THREE.BufferGeometry[],
  sharedMats: THREE.Material[]
): {
  group: THREE.Group;
  pulseRing: THREE.Mesh;
  pulseMat: THREE.MeshBasicMaterial;
} {
  const group = new THREE.Group();
  group.position.copy(originPos);

  const normal = originPos.clone().normalize();
  const lookTarget = originPos.clone().add(normal);
  group.lookAt(lookTarget);

  // Outer radar ring
  const ringGeo = new THREE.RingGeometry(0.028, 0.036, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xcfb57c,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const baseRing = new THREE.Mesh(ringGeo, ringMat);
  group.add(baseRing);

  // Animated expanding pulse wave ring
  const pulseGeo = new THREE.RingGeometry(0.032, 0.04, 32);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulseRing);

  // Vertical holographic spire along normal
  const spireGeo = new THREE.CylinderGeometry(0.001, 0.004, 0.085, 8);
  spireGeo.rotateX(Math.PI / 2);
  spireGeo.translate(0, 0, 0.042);
  const spireMat = new THREE.MeshBasicMaterial({
    color: 0xcfb57c,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const spire = new THREE.Mesh(spireGeo, spireMat);
  group.add(spire);

  sharedGeos.push(ringGeo, pulseGeo, spireGeo);
  sharedMats.push(ringMat, pulseMat, spireMat);

  return { group, pulseRing, pulseMat };
}

/**
 * Creates ThreeUI 3D Orbital Telemetry Rings around the globe for spatial depth.
 */
export function createOrbitalTelemetryRings(
  sharedGeos: THREE.BufferGeometry[],
  sharedMats: THREE.Material[]
): THREE.Group {
  const orbitalGroup = new THREE.Group();

  // Outer Equatorial Telemetry Ring
  const eqRingGeo = new THREE.RingGeometry(1.18, 1.186, 96);
  const eqRingMat = new THREE.MeshBasicMaterial({
    color: 0xcfb57c,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const eqRing = new THREE.Mesh(eqRingGeo, eqRingMat);
  eqRing.rotation.x = Math.PI / 2;
  orbitalGroup.add(eqRing);

  // Inclined Polar Radar Ring
  const polarRingGeo = new THREE.RingGeometry(1.23, 1.235, 96);
  const polarRingMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const polarRing = new THREE.Mesh(polarRingGeo, polarRingMat);
  polarRing.rotation.x = THREE.MathUtils.degToRad(32);
  polarRing.rotation.y = THREE.MathUtils.degToRad(24);
  orbitalGroup.add(polarRing);

  // Counter-rotating Meridian Telemetry Arc Ring
  const meridianRingGeo = new THREE.RingGeometry(1.14, 1.144, 96);
  const meridianRingMat = new THREE.MeshBasicMaterial({
    color: 0xf3f0e7,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const meridianRing = new THREE.Mesh(meridianRingGeo, meridianRingMat);
  meridianRing.rotation.x = THREE.MathUtils.degToRad(-48);
  meridianRing.rotation.z = THREE.MathUtils.degToRad(18);
  orbitalGroup.add(meridianRing);

  sharedGeos.push(eqRingGeo, polarRingGeo, meridianRingGeo);
  sharedMats.push(eqRingMat, polarRingMat, meridianRingMat);

  return orbitalGroup;
}

/**
 * Creates a ThreeUI 3D Target-Lock Reticle that locks onto hovered/focused airport nodes
 * and animates via anime.js.
 */
export function createTargetLockReticle(
  sharedGeos: THREE.BufferGeometry[],
  sharedMats: THREE.Material[]
): {
  group: THREE.Group;
  pulseWithAnime: () => void;
} {
  const group = new THREE.Group();

  const innerGeo = new THREE.RingGeometry(0.032, 0.04, 24);
  const outerGeo = new THREE.RingGeometry(0.05, 0.056, 24);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const innerMesh = new THREE.Mesh(innerGeo, mat);
  const outerMesh = new THREE.Mesh(outerGeo, mat);
  group.add(innerMesh, outerMesh);

  sharedGeos.push(innerGeo, outerGeo);
  sharedMats.push(mat);

  const scaleState = { s: 1 };
  const pulseWithAnime = () => {
    try {
      animate(scaleState, {
        s: [1.55, 1],
        duration: 540,
        ease: "outElastic(1, .6)",
        onUpdate: () => {
          group.scale.setScalar(scaleState.s);
        },
      });
    } catch {
      group.scale.setScalar(1);
    }
  };

  return { group, pulseWithAnime };
}

/**
 * ThreeUI Spatial Hologram Panel: Renders a high-DPI procedural CanvasTexture
 * onto a 3D billboard Sprite in the WebGL scene (zero extra DOM canvas nodes).
 */
export class ThreeUISpatialCallout {
  public sprite: THREE.Sprite;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private texture: THREE.CanvasTexture;
  private material: THREE.SpriteMaterial;

  constructor(maxAnisotropy = 4) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 176;
    this.ctx = this.canvas.getContext("2d");

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = maxAnisotropy;

    this.material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    this.sprite = new THREE.Sprite(this.material);
    this.sprite.scale.set(0.58, 0.195, 1);
    this.sprite.renderOrder = 25;
    this.sprite.visible = false;
  }

  public updateTelemetry(data: SpatialTelemetryData) {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, 512, 176);

    // Background dark emerald glass card
    ctx.fillStyle = "rgba(4, 23, 19, 0.94)";
    ctx.strokeStyle = "rgba(207, 181, 124, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 160, 20);
    ctx.fill();
    ctx.stroke();

    // Accent top bar
    ctx.fillStyle = "#10b981";
    ctx.fillRect(28, 8, 120, 4);

    // Header route string
    ctx.fillStyle = "#cfb57c";
    ctx.font = "bold 22px monospace";
    ctx.fillText(`DAC ➔ ${data.code} · ${data.flightLevel} · HDG ${data.headingDeg}°`, 28, 48);

    // City & duration
    ctx.fillStyle = "#f3f0e7";
    ctx.font = "bold 29px sans-serif";
    ctx.fillText(`${data.city} (${data.durationEn})`, 28, 92);

    // Corridor tag
    ctx.fillStyle = "#b1c3bc";
    ctx.font = "600 18px sans-serif";
    ctx.fillText(data.corridorTagEn, 28, 124);

    // Telemetry footer
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 19px monospace";
    ctx.fillText(`${data.distanceNm} NM · ${data.mach} · CLICK TO QUOTE ↗`, 28, 152);

    this.texture.needsUpdate = true;
    this.sprite.visible = true;
  }

  public hide() {
    this.sprite.visible = false;
  }

  public dispose() {
    this.texture.dispose();
    this.material.dispose();
  }
}
