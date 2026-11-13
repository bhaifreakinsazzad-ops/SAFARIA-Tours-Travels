"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { animate } from "animejs";
import { origin, routes, type Language } from "@/lib/atlas-data";
import {
  applyStudioEnvironment,
  createCompositeAircraft,
  createInstancedStarfield,
  createOrbitalTelemetryRings,
  createOriginRadarBeacon,
  createTargetLockReticle,
  detectSoftwareWebGL,
  getRouteTelemetry,
  ThreeUISpatialCallout,
} from "@/lib/threeui";
import { AtlasFallback } from "./atlas-fallback";

type Props = {
  language: Language;
  onSelect: (code: string) => void;
  externalFocusCode?: string | null;
  onHoverRoute?: (code: string) => void;
};

type NodeEntry = {
  mesh: THREE.Mesh;
  visibleMesh: THREE.Mesh;
  halo: THREE.Mesh;
  label: HTMLElement;
  code: string;
  pos: THREE.Vector3;
  city: string;
};

const DEFAULT_ROT_X = THREE.MathUtils.degToRad(17);
const DEFAULT_ROT_Y = THREE.MathUtils.degToRad(-55);
const DEFAULT_CAM_Z = 3.25;
const ZOOMED_CAM_Z = 2.18;

// Scroll-orbit destination sequence as the user scrolls past the hero section
const SCROLL_WAYPOINT_CODES = ["DAC", "DXB", "RUH", "KUL", "LON"] as const;

// Reusable module-scope math vectors to prevent GC in the animation loop
const _worldPos = new THREE.Vector3();
const _tangentPos = new THREE.Vector3();
const _normalVec = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

function position(lat: number, lon: number, radius = 1.03) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  );
}

function getTargetRotationForCoord(lat: number, lon: number): { x: number; y: number } {
  return {
    x: THREE.MathUtils.clamp(THREE.MathUtils.degToRad(lat * 0.55), -0.45, 0.45),
    y: THREE.MathUtils.degToRad(-lon + 15),
  };
}

function arc(from: THREE.Vector3, to: THREE.Vector3) {
  const start = from.clone().normalize();
  const end = to.clone().normalize();
  const omega = Math.acos(THREE.MathUtils.clamp(start.dot(end), -1, 1));
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const a = Math.sin((1 - t) * omega) / Math.sin(omega);
    const b = Math.sin(t * omega) / Math.sin(omega);
    points.push(
      start
        .clone()
        .multiplyScalar(a)
        .addScaledVector(end, b)
        .multiplyScalar(1.04 + 0.17 * Math.sin(Math.PI * t)),
    );
  }
  return new THREE.CatmullRomCurve3(points);
}

export function JourneyAtlas({
  language,
  onSelect,
  externalFocusCode,
  onHoverRoute,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const onHoverRouteRef = useRef(onHoverRoute);

  const [ready, setReady] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [fleetWarp, setFleetWarp] = useState(false);
  const [focusedCode, setFocusedCode] = useState<string>("DAC");
  const [scrollZoomPct, setScrollZoomPct] = useState<number>(100);
  const [pinnedTargetCode, setPinnedTargetCode] = useState<string | null>(null);

  const autoOrbitRef = useRef(false);
  const fleetWarpRef = useRef(false);
  const pinnedTargetRef = useRef<string | null>(null);
  const focusedCodeRef = useRef<string>("DAC");
  const targetRotRef = useRef<{ x: number; y: number; zCam?: number } | null>(null);
  const pointerParallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollOrbitStateRef = useRef<{
    progress: number;
    rotX: number;
    rotY: number;
    camZ: number;
    activeCode: string;
  }>({
    progress: 0,
    rotX: DEFAULT_ROT_X,
    rotY: DEFAULT_ROT_Y,
    camZ: DEFAULT_CAM_Z,
    activeCode: "DAC",
  });
  const focusRouteControlRef = useRef<((code: string, fromScroll?: boolean) => void) | null>(null);

  // motion.dev scroll-linked camera orbit & node zoom pipeline
  const { scrollY } = useScroll();
  const rawHeroScrollProgress = useTransform(scrollY, [0, 680], [0, 1], { clamp: true });
  const smoothScrollProgress = useSpring(rawHeroScrollProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0005,
  });

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onHoverRouteRef.current = onHoverRoute;
  }, [onHoverRoute]);

  useEffect(() => {
    autoOrbitRef.current = autoOrbit;
  }, [autoOrbit]);

  useEffect(() => {
    fleetWarpRef.current = fleetWarp;
  }, [fleetWarp]);

  useEffect(() => {
    pinnedTargetRef.current = pinnedTargetCode;
  }, [pinnedTargetCode]);

  useEffect(() => {
    focusedCodeRef.current = focusedCode;
  }, [focusedCode]);

  // Synchronize external focus code from Hero interactive command console or destination buttons
  useEffect(() => {
    if (!externalFocusCode) return;
    pinnedTargetRef.current = externalFocusCode === "DAC" ? null : externalFocusCode;
    const rafId = window.requestAnimationFrame(() => {
      setPinnedTargetCode(externalFocusCode === "DAC" ? null : externalFocusCode);
      focusRouteControlRef.current?.(externalFocusCode, false);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [externalFocusCode]);

  // Listen to motion.dev spring-smoothed scroll progress to drive 3D camera orbit & destination zoom
  useMotionValueEvent(smoothScrollProgress, "change", (progress) => {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const zoomMultiplier = Math.round(100 + clamped * 48);
    setScrollZoomPct(zoomMultiplier);

    if (clamped <= 0.02) {
      scrollOrbitStateRef.current = {
        progress: 0,
        rotX: DEFAULT_ROT_X,
        rotY: DEFAULT_ROT_Y,
        camZ: DEFAULT_CAM_Z,
        activeCode: pinnedTargetRef.current || "DAC",
      };
      return;
    }

    const pinnedCode = pinnedTargetRef.current;
    if (pinnedCode && pinnedCode !== "DAC") {
      const pinnedRoute = routes.find((r) => r.code === pinnedCode);
      if (pinnedRoute) {
        const target = getTargetRotationForCoord(pinnedRoute.lat, pinnedRoute.lon);
        const t = THREE.MathUtils.smoothstep(clamped, 0.02, 0.85);
        scrollOrbitStateRef.current = {
          progress: clamped,
          rotX: THREE.MathUtils.lerp(DEFAULT_ROT_X, target.x, t),
          rotY: THREE.MathUtils.lerp(DEFAULT_ROT_Y, target.y, t),
          camZ: THREE.MathUtils.lerp(DEFAULT_CAM_Z, ZOOMED_CAM_Z, t),
          activeCode: pinnedCode,
        };
        focusRouteControlRef.current?.(pinnedCode, true);
        return;
      }
    }

    const waypoints = SCROLL_WAYPOINT_CODES.map((code) => {
      if (code === "DAC") return { code: "DAC", x: DEFAULT_ROT_X, y: DEFAULT_ROT_Y };
      const r = routes.find((item) => item.code === code);
      if (!r) return { code, x: DEFAULT_ROT_X, y: DEFAULT_ROT_Y };
      const rot = getTargetRotationForCoord(r.lat, r.lon);
      return { code, x: rot.x, y: rot.y };
    });

    const totalSegments = waypoints.length - 1;
    const scaled = clamped * totalSegments;
    const segIdx = Math.min(Math.floor(scaled), totalSegments - 1);
    const localT = scaled - segIdx;
    const smoothT = localT * localT * (3 - 2 * localT);

    const fromWp = waypoints[segIdx];
    const toWp = waypoints[segIdx + 1];
    const activeWp = localT > 0.35 ? toWp : fromWp;

    scrollOrbitStateRef.current = {
      progress: clamped,
      rotX: THREE.MathUtils.lerp(fromWp.x, toWp.x, smoothT),
      rotY: THREE.MathUtils.lerp(fromWp.y, toWp.y, smoothT),
      camZ: THREE.MathUtils.lerp(DEFAULT_CAM_Z, ZOOMED_CAM_Z, THREE.MathUtils.smoothstep(clamped, 0.02, 0.92)),
      activeCode: activeWp.code,
    };

    if (activeWp.code !== focusedCode) {
      focusRouteControlRef.current?.(activeWp.code, true);
    }
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.WebGLRenderingContext || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (window.innerWidth <= 720 && ((memory !== undefined && memory <= 2) || navigator.hardwareConcurrency <= 2)) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0, 0, DEFAULT_CAM_Z);

    const envTexture = applyStudioEnvironment(renderer, scene);

    const group = new THREE.Group();
    group.rotation.set(DEFAULT_ROT_X, DEFAULT_ROT_Y, 0);
    scene.add(group);

    // Warm/Cool Three-Point Studio Lighting
    scene.add(new THREE.HemisphereLight(0x9dc1b4, 0x041713, 1.35));
    const keyLight = new THREE.DirectionalLight(0xf6d9a7, 2.2);
    keyLight.position.set(-3, 3, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x10b981, 0.95);
    rimLight.position.set(3, -2, -4);
    scene.add(rimLight);

    const sharedGeos: THREE.BufferGeometry[] = [];
    const sharedMats: THREE.Material[] = [];

    // Instanced Orbital Starfield & Spatial Telemetry Dust
    const starfield = createInstancedStarfield(sharedGeos, sharedMats, 135);
    scene.add(starfield);

    // Globe Core Mesh
    const globeGeometry = new THREE.SphereGeometry(1, 64, 48);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.18,
      emissive: 0x0b2e27,
      emissiveIntensity: 0.24,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.rotation.y = -Math.PI / 2;
    group.add(globe);

    // Atmospheric Fresnel Rim Shader
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.045, 48, 32),
      new THREE.ShaderMaterial({
        vertexShader:
          "varying vec3 vNormal; varying vec3 vEye; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vEye=normalize(-mv.xyz); gl_Position=projectionMatrix*mv;}",
        fragmentShader:
          "varying vec3 vNormal; varying vec3 vEye; void main(){float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vEye)),0.0),3.0); gl_FragColor=vec4(0.812,0.710,0.486,rim*0.58);}",
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    group.add(atmosphere);

    // ThreeUI Orbital Telemetry Rings
    const orbitalRings = createOrbitalTelemetryRings(sharedGeos, sharedMats);
    group.add(orbitalRings);

    // ThreeUI Target-Lock Reticle & Spatial Hologram Callout
    const reticle = createTargetLockReticle(sharedGeos, sharedMats);
    reticle.group.visible = false;
    group.add(reticle.group);

    const spatialCallout = new ThreeUISpatialCallout(renderer.capabilities.getMaxAnisotropy());
    group.add(spatialCallout.sprite);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = "atlas-label-layer";
    labelRenderer.domElement.style.pointerEvents = "none";
    host.append(renderer.domElement, labelRenderer.domElement);
    renderer.domElement.className = "atlas-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const nodes: NodeEntry[] = [];
    const originPosition = position(origin.lat, origin.lon);
    const nodeGeometry = new THREE.SphereGeometry(0.017, 16, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffd783 });
    const haloGeometry = new THREE.SphereGeometry(0.035, 16, 12);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd783,
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const hitGeometry = new THREE.SphereGeometry(0.09, 12, 8);
    const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

    const originMesh = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 12), nodeMaterial);
    originMesh.position.copy(originPosition);
    group.add(originMesh);
    const originHalo = new THREE.Mesh(haloGeometry, haloMaterial);
    originHalo.position.copy(originPosition);
    group.add(originHalo);

    // Multi-part 3D Origin Radar Beacon at Dhaka (DAC)
    const originBeacon = createOriginRadarBeacon(originPosition, sharedGeos, sharedMats);
    group.add(originBeacon.group);

    const originLabel = document.createElement("div");
    originLabel.className = "atlas-node-label atlas-origin-label";
    originLabel.textContent = "DAC";
    const originLabelObject = new CSS2DObject(originLabel);
    originLabelObject.position.copy(
      originPosition.clone().multiplyScalar(1.08).add(new THREE.Vector3(-0.07, -0.08, 0)),
    );
    group.add(originLabelObject);

    const arcs: {
      code: string;
      curve: THREE.CatmullRomCurve3;
      aircraft: THREE.Group;
      material: THREE.ShaderMaterial;
      glowMaterial: THREE.MeshBasicMaterial;
      phase: number;
    }[] = [];

    for (const [index, route] of routes.entries()) {
      const pos = position(route.lat, route.lon);
      const visibleMesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      visibleMesh.position.copy(pos);
      group.add(visibleMesh);
      const halo = new THREE.Mesh(haloGeometry, haloMaterial.clone());
      halo.position.copy(pos);
      group.add(halo);
      sharedMats.push(visibleMesh.material as THREE.Material, halo.material as THREE.Material);

      const mesh = new THREE.Mesh(hitGeometry, hitMaterial);
      mesh.position.copy(pos);
      mesh.userData.code = route.code;
      group.add(mesh);

      const curve = arc(originPosition, pos);
      const tube = new THREE.TubeGeometry(curve, 96, 0.0045, 5, false);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: index * 0.17 },
          uHighlight: { value: 0 },
        },
        vertexShader:
          "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader:
          "uniform float uTime; uniform float uPhase; uniform float uHighlight; varying vec2 vUv; void main(){float dash=step(0.24 - uHighlight*0.14, fract(vUv.x*19.0 - uTime*(0.45 + uHighlight*0.35) + uPhase)); float pulse=0.75 + 0.25*sin(uTime*1.8 + uPhase*6.28); vec3 baseCol=mix(vec3(0.94,0.77,0.48), vec3(0.06,0.92,0.65), uHighlight*0.55); gl_FragColor=vec4(baseCol, dash*(pulse + uHighlight*0.35));}",
        transparent: true,
        depthWrite: false,
      });
      const glowTube = new THREE.TubeGeometry(curve, 96, 0.011, 5, false);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd78b,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      sharedGeos.push(tube, glowTube);
      sharedMats.push(material, glowMaterial);
      group.add(new THREE.Mesh(tube, material));
      group.add(new THREE.Mesh(glowTube, glowMaterial));

      // Composite 6-Part 3D Jet Aircraft per Corridor
      const aircraft = createCompositeAircraft(sharedGeos, sharedMats);
      const initT = index / routes.length;
      aircraft.position.copy(curve.getPointAt(initT));
      group.add(aircraft);
      arcs.push({ code: route.code, curve, aircraft, material, glowMaterial, phase: initT });

      const label = document.createElement("div");
      label.className = "atlas-node-label";
      label.textContent = route.code;
      const tooltip = document.createElement("span");
      tooltip.className = "atlas-tooltip";
      tooltip.textContent = `${route[language]} · ${route.code} · ${origin[language]} (DAC)`;
      label.append(tooltip);
      const labelObject = new CSS2DObject(label);
      labelObject.position.copy(pos.clone().multiplyScalar(1.08));
      if (route.code === "KUL") labelObject.position.add(new THREE.Vector3(-0.02, 0.09, 0));
      if (route.code === "SIN") labelObject.position.add(new THREE.Vector3(0, -0.11, 0));
      if (route.code === "CAN") labelObject.position.add(new THREE.Vector3(-0.06, 0.06, 0));
      group.add(labelObject);
      nodes.push({ mesh, visibleMesh, halo, label, code: route.code, pos, city: route[language] });
    }

    let composer: EffectComposer | null = null;
    if (!isSoftwareGl && window.matchMedia("(min-width: 850px)").matches) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.45, 0.84);
      composer.addPass(bloom);
      composer.addPass(
        new ShaderPass({
          uniforms: { tDiffuse: { value: null } },
          vertexShader:
            "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
          fragmentShader:
            "uniform sampler2D tDiffuse; varying vec2 vUv; void main(){vec4 c=texture2D(tDiffuse,vUv); float a=smoothstep(0.0005,0.004,max(c.r,max(c.g,c.b))); gl_FragColor=vec4(c.rgb,a);}",
        }),
      );
    }

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      "/earth-emerald.webp",
      () => render(),
      undefined,
      () => undefined,
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    globeMaterial.map = texture;
    globeMaterial.needsUpdate = true;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();
    let active = false;
    let intersecting = true;
    let disposed = false;
    let hovering: NodeEntry | undefined;
    let drag: { x: number; y: number; moved: boolean } | null = null;
    let contextLost = false;
    let lastLockedCode = "";

    function highlightCorridor(activeCode: string) {
      for (const item of arcs) {
        const isMatch = item.code === activeCode;
        item.material.uniforms.uHighlight.value = isMatch ? 1 : 0;
        item.glowMaterial.opacity = isMatch ? 0.28 : 0.09;
        item.glowMaterial.color.setHex(isMatch ? 0x10b981 : 0xffd78b);
        item.aircraft.scale.setScalar(isMatch ? 1.45 : 1);
      }
      for (const n of nodes) {
        const isMatch = n.code === activeCode;
        n.visibleMesh.scale.setScalar(isMatch ? 1.55 : 1);
        (n.halo.material as THREE.MeshBasicMaterial).opacity = isMatch ? 0.35 : 0.11;
      }
    }

    function lockReticleOnNode(node: NodeEntry | undefined, pulse = true) {
      if (!node) {
        reticle.group.visible = false;
        spatialCallout.hide();
        highlightCorridor("");
        lastLockedCode = "";
        return;
      }
      reticle.group.position.copy(node.pos).multiplyScalar(1.015);
      _normalVec.copy(node.pos).normalize();
      _lookTarget.copy(reticle.group.position).add(_normalVec);
      reticle.group.lookAt(_lookTarget);
      reticle.group.visible = true;
      highlightCorridor(node.code);

      if (pulse && lastLockedCode !== node.code) {
        reticle.pulseWithAnime();
      }
      lastLockedCode = node.code;

      const telemetry = getRouteTelemetry(node.code, node.city);
      spatialCallout.updateTelemetry(telemetry);
      spatialCallout.sprite.position.copy(node.pos).multiplyScalar(1.22);
    }

    focusRouteControlRef.current = (code: string, fromScroll = false) => {
      setFocusedCode(code);
      if (code === "DAC") {
        if (!fromScroll) {
          targetRotRef.current = { x: DEFAULT_ROT_X, y: DEFAULT_ROT_Y, zCam: DEFAULT_CAM_Z };
        }
        lockReticleOnNode(undefined, false);
        return;
      }
      const routeObj = routes.find((r) => r.code === code);
      const nodeObj = nodes.find((n) => n.code === code);
      if (routeObj && !fromScroll) {
        const rot = getTargetRotationForCoord(routeObj.lat, routeObj.lon);
        targetRotRef.current = { x: rot.x, y: rot.y, zCam: 2.48 };
      }
      if (nodeObj) {
        lockReticleOnNode(nodeObj, !fromScroll);
      }
    };

    function render() {
      if (disposed || contextLost) return;
      group.updateMatrixWorld(true);
      originMesh.getWorldPosition(_worldPos);
      originLabel.style.visibility = _worldPos.z > 0.1 ? "visible" : "hidden";
      for (const node of nodes) {
        node.mesh.getWorldPosition(_worldPos);
        node.label.style.visibility = _worldPos.z > 0.1 ? "visible" : "hidden";
      }
      if (composer) composer.render();
      else renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }

    function animateLoop() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();
      const speedMult = fleetWarpRef.current ? 2.2 : 1.0;

      // Animate orbital telemetry rings & instanced starfield parallax
      orbitalRings.rotation.y = time * 0.08 * speedMult;
      orbitalRings.rotation.z = Math.sin(time * 0.25) * 0.05;
      starfield.rotation.y = time * 0.018 + pointerParallaxRef.current.x * 0.12;
      starfield.rotation.x = pointerParallaxRef.current.y * 0.08;

      // Animate Dhaka Origin Radar Beacon expanding pulse wave
      const pulsePhase = (time * 0.85) % 1;
      originBeacon.pulseRing.scale.setScalar(1 + pulsePhase * 1.9);
      originBeacon.pulseMat.opacity = (1 - pulsePhase) * 0.75;

      // Rotate reticle if visible
      if (reticle.group.visible) {
        reticle.group.rotateZ(delta * 1.4 * speedMult);
      }

      const scrollState = scrollOrbitStateRef.current;

      // Smooth exponential damping for scroll-driven camera orbit/zoom, presets, or auto-orbit
      if (!drag && !hovering) {
        if (scrollState.progress > 0.02) {
          group.rotation.x = THREE.MathUtils.damp(group.rotation.x, scrollState.rotX, 6.5, delta);
          group.rotation.y = THREE.MathUtils.damp(group.rotation.y, scrollState.rotY, 6.5, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, scrollState.camZ, 6.5, delta);
        } else if (targetRotRef.current) {
          group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetRotRef.current.x, 5.5, delta);
          group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotRef.current.y, 5.5, delta);
          const targetCamZ = targetRotRef.current.zCam ?? DEFAULT_CAM_Z;
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 5.5, delta);
          if (
            Math.abs(group.rotation.x - targetRotRef.current.x) < 0.002 &&
            Math.abs(group.rotation.y - targetRotRef.current.y) < 0.002 &&
            Math.abs(camera.position.z - targetCamZ) < 0.004
          ) {
            targetRotRef.current = null;
          }
        } else {
          camera.position.z = THREE.MathUtils.damp(camera.position.z, DEFAULT_CAM_Z, 5, delta);
          if (autoOrbitRef.current) {
            group.rotation.y += delta * 0.2 * speedMult;
          }
        }
      }

      // Advance composite 3D aircraft fleet along great-circle curves with tangent orientation
      const activeCode = focusedCodeRef.current;
      for (const item of arcs) {
        item.material.uniforms.uTime.value = time * speedMult;
        const routeBoost = item.code === activeCode ? 1.35 : 1.0;
        const t = (time * 0.11 * speedMult * routeBoost + item.phase) % 1;
        const nextT = Math.min(t + 0.02, 1);
        item.curve.getPointAt(t, item.aircraft.position);
        item.curve.getPointAt(nextT, _tangentPos);
        item.aircraft.lookAt(_tangentPos);
      }
      render();
    }

    function sync() {
      const shouldRun = intersecting && !document.hidden && !contextLost;
      if (host) host.dataset.rendering = shouldRun ? "running" : "paused";
      if (shouldRun !== active) {
        active = shouldRun;
        renderer.setAnimationLoop(active ? animateLoop : null);
      }
    }

    function resize() {
      if (!host) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
      composer?.setSize(width, height);
      render();
    }

    function hit(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect();
      const nx = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const ny = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      pointerParallaxRef.current = { x: nx, y: ny };
      pointer.set(nx, ny);
      raycaster.setFromCamera(pointer, camera);
      const found = raycaster.intersectObjects(nodes.map((node) => node.mesh))[0];
      return nodes.find((node) => node.mesh === found?.object);
    }

    function move(event: PointerEvent) {
      if (drag) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        targetRotRef.current = null;
        group.rotation.y += dx * 0.006;
        group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + dy * 0.004, -0.5, 0.5);
        drag.x = event.clientX;
        drag.y = event.clientY;
        render();
        return;
      }
      const next = hit(event);
      if (hovering !== next) {
        hovering?.label.classList.remove("is-hovered");
        next?.label.classList.add("is-hovered");
        hovering = next;
        lockReticleOnNode(next, true);
        if (next) {
          setFocusedCode(next.code);
          onHoverRouteRef.current?.(next.code);
        }
        renderer.domElement.style.cursor = next ? "pointer" : "grab";
      }
    }

    function down(event: PointerEvent) {
      drag = { x: event.clientX, y: event.clientY, moved: false };
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function up(event: PointerEvent) {
      const wasClick = drag && !drag.moved;
      drag = null;
      if (wasClick) {
        const node = hit(event);
        if (node) onSelectRef.current(node.code);
      }
    }

    function lost(event: Event) {
      event.preventDefault();
      contextLost = true;
      setReady(false);
      sync();
    }

    const intersection = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      },
      { threshold: 0.01 },
    );
    intersection.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    document.addEventListener("visibilitychange", sync);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", up);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    resize();
    const readyFrame = requestAnimationFrame(() => setReady(true));
    sync();

    return () => {
      disposed = true;
      focusRouteControlRef.current = null;
      if (host) delete host.dataset.rendering;
      cancelAnimationFrame(readyFrame);
      renderer.setAnimationLoop(null);
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("pointercancel", up);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      envTexture?.dispose();
      texture.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      originMesh.geometry.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      hitGeometry.dispose();
      hitMaterial.dispose();
      sharedGeos.forEach((geometry) => geometry.dispose());
      sharedMats.forEach((material) => material.dispose());
      spatialCallout.dispose();
      composer?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    };
  }, [language]);

  const bn = language === "bn";

  const handleDockNodeSelect = (code: string) => {
    setAutoOrbit(false);
    setPinnedTargetCode(code === "DAC" ? null : code);
    focusRouteControlRef.current?.(code, false);
    if (code !== "DAC") {
      onHoverRouteRef.current?.(code);
    }
    if (dockRef.current) {
      animate(dockRef.current, {
        scale: [0.985, 1],
        duration: 240,
        ease: "outQuad",
      });
    }
  };

  return (
    <div className="atlas-visual" aria-label="Interactive globe of enquiry destinations from Dhaka">
      <div className="atlas-stage" ref={hostRef} aria-hidden="true" />
      <div className={`atlas-static ${ready ? "atlas-static-hidden" : ""}`}>
        <AtlasFallback />
      </div>

      {/* Collapsible Bottom ThreeUI Spatial Control Dock (No backdrop-filter over WebGL) */}
      {ready && (
        <div
          ref={dockRef}
          className="pointer-events-auto absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center max-w-[95%]"
          aria-label={bn ? "থ্রিডি গ্লোব কন্ট্রোল ডক" : "3D Globe Spatial Control Dock"}
        >
          <button
            type="button"
            onClick={() => setHudCollapsed((prev) => !prev)}
            className="mb-1 rounded-t-lg border border-b-0 border-[rgba(207,181,124,0.35)] bg-[#041713] px-3 py-0.5 text-[10px] font-mono font-bold text-[#cfb57c] hover:text-[#f3f0e7] transition-colors whitespace-nowrap"
          >
            {hudCollapsed
              ? bn
                ? "▴ কন্ট্রোল দেখুন"
                : "▴ Show 3D Dock"
              : bn
                ? "▾ কন্ট্রোল লুকান"
                : "▾ Hide 3D Dock"}
          </button>

          <AnimatePresence initial={false}>
            {!hudCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5 rounded-xl border border-[rgba(207,181,124,0.4)] bg-[#041713] px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.65)] overflow-x-auto max-w-full"
              >
                <button
                  type="button"
                  onClick={() => setAutoOrbit((prev) => !prev)}
                  aria-pressed={autoOrbit}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors whitespace-nowrap shrink-0 ${
                    autoOrbit
                      ? "bg-[#10b981] text-[#041713]"
                      : "bg-[#092c27] text-[#cfb57c] hover:bg-[#12423a]"
                  }`}
                >
                  {autoOrbit ? (bn ? "অরবিট: চালু" : "Orbit: ON") : bn ? "অটো-অরবিট" : "Auto-Orbit"}
                </button>

                <button
                  type="button"
                  onClick={() => setFleetWarp((prev) => !prev)}
                  aria-pressed={fleetWarp}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors whitespace-nowrap shrink-0 ${
                    fleetWarp
                      ? "bg-[#cfb57c] text-[#041713]"
                      : "bg-[#092c27] text-[#10b981] hover:bg-[#12423a]"
                  }`}
                >
                  {fleetWarp ? "2X WARP" : "1X FLEET"}
                </button>

                <span
                  className="rounded bg-[#092c27] border border-[rgba(16,185,129,0.35)] px-2 py-0.5 text-[9px] font-mono font-bold text-[#10b981] whitespace-nowrap shrink-0 tabular-nums"
                  title={bn ? "স্ক্রল করলে গন্তব্য নোডে ক্যামেরা জুম হয়" : "Scroll-linked camera orbit & node zoom"}
                >
                  {bn ? `জুম ${scrollZoomPct}%` : `ZOOM ${scrollZoomPct}%`}
                </span>

                <span className="text-[rgba(207,181,129,0.3)] text-xs select-none">|</span>

                {(["DAC", "RUH", "JED", "DXB", "KUL", "LON"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleDockNodeSelect(code)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      focusedCode === code
                        ? "bg-[#cfb57c] text-[#041713] font-bold"
                        : "text-[#b1c3bc] hover:bg-[#092c27] hover:text-[#f3f0e7]"
                    }`}
                  >
                    {code === "DAC" ? (bn ? "রিসেট" : "DAC") : code}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
