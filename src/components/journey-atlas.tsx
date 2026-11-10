"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { origin, routes, type Language } from "@/lib/atlas-data";
import { AtlasFallback } from "./atlas-fallback";

type Props = { language: Language; onSelect: (code: string) => void };
type NodeEntry = { mesh: THREE.Mesh; label: HTMLElement; code: string };

function position(lat: number, lon: number, radius = 1.03) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  );
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
    points.push(start.clone().multiplyScalar(a).addScaledVector(end, b).multiplyScalar(1.04 + 0.17 * Math.sin(Math.PI * t)));
  }
  return new THREE.CatmullRomCurve3(points);
}

export function JourneyAtlas({ language, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.WebGLRenderingContext || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (window.innerWidth <= 720 && ((memory !== undefined && memory <= 2) || navigator.hardwareConcurrency <= 2)) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0, 0, 3.25);
    const group = new THREE.Group();
    group.rotation.set(THREE.MathUtils.degToRad(17), THREE.MathUtils.degToRad(-55), 0);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0x9dc1b4, 1.25));
    const light = new THREE.DirectionalLight(0xf6d9a7, 2.1);
    light.position.set(-3, 3, 5);
    scene.add(light);

    const globeGeometry = new THREE.SphereGeometry(1, 64, 48);
    const globeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0.14, emissive: 0x0b2e27, emissiveIntensity: 0.22 });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.rotation.y = -Math.PI / 2;
    group.add(globe);
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.045, 48, 32),
      new THREE.ShaderMaterial({
        vertexShader: "varying vec3 vNormal; varying vec3 vEye; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vEye=normalize(-mv.xyz); gl_Position=projectionMatrix*mv;}",
        fragmentShader: "varying vec3 vNormal; varying vec3 vEye; void main(){float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vEye)),0.0),3.0); gl_FragColor=vec4(0.812,0.710,0.486,rim*0.55);}",
        transparent: true, side: THREE.FrontSide, depthWrite: false, blending: THREE.AdditiveBlending,
      }),
    );
    group.add(atmosphere);

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
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xffd783, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending });
    const hitGeometry = new THREE.SphereGeometry(0.09, 12, 8);
    const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const originMesh = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 12), nodeMaterial);
    originMesh.position.copy(originPosition);
    group.add(originMesh);
    const originHalo = new THREE.Mesh(haloGeometry, haloMaterial);
    originHalo.position.copy(originPosition);
    group.add(originHalo);
    const originLabel = document.createElement("div");
    originLabel.className = "atlas-node-label atlas-origin-label";
    originLabel.textContent = "DAC";
    const originLabelObject = new CSS2DObject(originLabel);
    originLabelObject.position.copy(originPosition.clone().multiplyScalar(1.08).add(new THREE.Vector3(-0.07, -0.08, 0)));
    group.add(originLabelObject);
    const routeGeometries: THREE.BufferGeometry[] = [];
    const routeMaterials: THREE.Material[] = [];
    const arcs: { curve: THREE.CatmullRomCurve3; particle: THREE.Mesh; material: THREE.ShaderMaterial; phase: number }[] = [];
    const particleGeometry = new THREE.SphereGeometry(0.014, 10, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffd58a, toneMapped: false });
    const particleGlowGeometry = new THREE.SphereGeometry(0.038, 10, 8);
    const particleGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending });
    for (const [index, route] of routes.entries()) {
      const pos = position(route.lat, route.lon);
      const visibleMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      visibleMesh.position.copy(pos);
      group.add(visibleMesh);
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(pos);
      group.add(halo);
      const mesh = new THREE.Mesh(hitGeometry, hitMaterial);
      mesh.position.copy(pos);
      mesh.userData.code = route.code;
      group.add(mesh);
      const curve = arc(originPosition, pos);
      const tube = new THREE.TubeGeometry(curve, 96, 0.0045, 5, false);
      const material = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPhase: { value: index * 0.17 } },
        vertexShader: "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: "uniform float uTime; uniform float uPhase; varying vec2 vUv; void main(){float dash=step(0.28,fract(vUv.x*19.0-uTime*0.42+uPhase)); float pulse=0.75+0.25*sin(uTime*1.8+uPhase*6.28); gl_FragColor=vec4(0.94,0.77,0.48,dash*pulse);}",
        transparent: true, depthWrite: false,
      });
      const glowTube = new THREE.TubeGeometry(curve, 96, 0.011, 5, false);
      const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd78b, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending });
      routeGeometries.push(tube);
      routeMaterials.push(material);
      routeGeometries.push(glowTube);
      routeMaterials.push(glowMaterial);
      group.add(new THREE.Mesh(tube, material));
      group.add(new THREE.Mesh(glowTube, glowMaterial));
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.add(new THREE.Mesh(particleGlowGeometry, particleGlowMaterial));
      particle.position.copy(curve.getPointAt(index / routes.length));
      group.add(particle);
      arcs.push({ curve, particle, material, phase: index / routes.length });

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
      nodes.push({ mesh, label, code: route.code });
    }

    let composer: EffectComposer | null = null;
    if (window.matchMedia("(min-width: 850px)").matches) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.45, 0.84);
      composer.addPass(bloom);
      composer.addPass(new ShaderPass({
        uniforms: { tDiffuse: { value: null } },
        vertexShader: "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: "uniform sampler2D tDiffuse; varying vec2 vUv; void main(){vec4 c=texture2D(tDiffuse,vUv); float a=smoothstep(0.0005,0.004,max(c.r,max(c.g,c.b))); gl_FragColor=vec4(c.rgb,a);}",
      }));
    }

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/earth-emerald.webp", () => render(), undefined, () => undefined);
    texture.colorSpace = THREE.SRGBColorSpace;
    globeMaterial.map = texture;
    globeMaterial.needsUpdate = true;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const world = new THREE.Vector3();
    const clock = new THREE.Clock();
    let active = false;
    let intersecting = true;
    let disposed = false;
    let hovering: NodeEntry | undefined;
    let drag: { x: number; y: number; moved: boolean } | null = null;
    let contextLost = false;

    function render() {
      if (disposed || contextLost) return;
      group.updateMatrixWorld(true);
      originMesh.getWorldPosition(world);
      originLabel.style.visibility = world.z > 0.1 ? "visible" : "hidden";
      for (const node of nodes) {
        node.mesh.getWorldPosition(world);
        node.label.style.visibility = world.z > 0.1 ? "visible" : "hidden";
      }
      if (composer) composer.render(); else renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }

    function animate() {
      const time = clock.getElapsedTime();
      for (const item of arcs) {
        item.material.uniforms.uTime.value = time;
        item.particle.position.copy(item.curve.getPointAt((time * 0.1 + item.phase) % 1));
      }
      render();
    }

    function sync() {
      const shouldRun = intersecting && !document.hidden && !contextLost;
      if (host) host.dataset.rendering = shouldRun ? "running" : "paused";
      if (shouldRun !== active) {
        active = shouldRun;
        renderer.setAnimationLoop(active ? animate : null);
      }
    }

    function resize() {
      if (!host) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
      composer?.setSize(width, height);
      render();
    }

    function hit(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const found = raycaster.intersectObjects(nodes.map((node) => node.mesh))[0];
      return nodes.find((node) => node.mesh === found?.object);
    }

    function move(event: PointerEvent) {
      if (drag) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
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

    const intersection = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync(); }, { threshold: 0.01 });
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
      routeGeometries.forEach((geometry) => geometry.dispose());
      routeMaterials.forEach((material) => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleGlowGeometry.dispose();
      particleGlowMaterial.dispose();
      composer?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    };
  }, [language]);

  return (
    <section className="bg-sf-000 p-space-5 rounded-radius-md shadow-header" aria-label="Interactive globe of enquiry destinations from Dhaka">
      <div className="atlas-stage w-full h-full" ref={hostRef} aria-hidden="true" />
      <div className={`atlas-static ${ready ? "atlas-static-hidden" : ""} bg-sf-100 p-space-4 rounded-radius-sm`}><AtlasFallback /></div>
    </section>
  );
}
