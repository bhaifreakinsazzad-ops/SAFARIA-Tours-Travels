"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plane, Compass, Clock, MapPin, ArrowRight } from "lucide-react";
import { SITE_CONFIG, AtlasRoute } from "@/lib/config/siteConfig";

interface JourneyAtlasProps {
  lang: "bn" | "en";
  onSelectRoute?: (route: AtlasRoute) => void;
}

export function JourneyAtlas({ lang, onSelectRoute }: JourneyAtlasProps) {
  const isBn = lang === "bn";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeRoute, setActiveRoute] = useState<AtlasRoute>(SITE_CONFIG.routes[0]);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Three.js interactive globe setup
  useEffect(() => {
    let animationFrameId: number;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setWebglSupported(false);
      return;
    }

    // Dynamic import Three.js to guarantee client-side only loading
    let isMounted = true;
    import("three")
      .then((THREE) => {
        if (!isMounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const width = canvas.parentElement?.clientWidth || 500;
        const height = canvas.parentElement?.clientHeight || 450;

        try {
          scene = new THREE.Scene();
          camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
          camera.position.z = 240;

          renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
          });
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

          // Sphere globe group
          const globeGroup = new THREE.Group();
          scene.add(globeGroup);

          // Wireframe sphere
          const sphereGeo = new THREE.SphereGeometry(75, 28, 28);
          const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x064e3b,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
          });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          globeGroup.add(sphere);

          // Inner solid glow sphere
          const innerGeo = new THREE.SphereGeometry(73, 28, 28);
          const innerMat = new THREE.MeshBasicMaterial({
            color: 0x041713,
            transparent: true,
            opacity: 0.9,
          });
          const innerSphere = new THREE.Mesh(innerGeo, innerMat);
          globeGroup.add(innerSphere);

          // Ambient & point lights
          const ambientLight = new THREE.AmbientLight(0xd6b779, 0.7);
          scene.add(ambientLight);

          // Flight arc curve helper
          const latLngToVector3 = (lat: number, lng: number, radius: number) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            return new THREE.Vector3(
              -radius * Math.sin(phi) * Math.cos(theta),
              radius * Math.cos(phi),
              radius * Math.sin(phi) * Math.sin(theta)
            );
          };

          // Dhaka origin point
          const dhakaCoords = [23.8433, 90.3978];
          const dhakaVec = latLngToVector3(dhakaCoords[0], dhakaCoords[1], 75);

          // Dhaka beacon
          const beaconGeo = new THREE.SphereGeometry(1.6, 12, 12);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf0d6a1 });
          const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
          beaconMesh.position.copy(dhakaVec);
          globeGroup.add(beaconMesh);

          // Destination markers & flight trajectories
          SITE_CONFIG.routes.forEach((route) => {
            const destVec = latLngToVector3(route.coordinates.dest[0], route.coordinates.dest[1], 75);

            // Dest point
            const markerGeo = new THREE.SphereGeometry(1.2, 8, 8);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0x7fd4a8 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.copy(destVec);
            globeGroup.add(marker);

            // Flight Arc Curve
            const midVec = dhakaVec.clone().add(destVec).multiplyScalar(0.5);
            midVec.normalize().multiplyScalar(75 + 18); // Arc elevation
            const curve = new THREE.QuadraticBezierCurve3(dhakaVec, midVec, destVec);
            const curvePoints = curve.getPoints(32);
            const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const curveMat = new THREE.LineBasicMaterial({
              color: 0xd6b779,
              transparent: true,
              opacity: 0.6,
            });
            const arcLine = new THREE.Line(curveGeo, curveMat);
            globeGroup.add(arcLine);
          });

          // Gentle continuous rotation
          const animate = () => {
            if (!isMounted) return;
            globeGroup.rotation.y += 0.0025;
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
          };

          animate();
        } catch (e) {
          console.warn("WebGL initialization failed, falling back to SVG:", e);
          setWebglSupported(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to import Three.js:", err);
        setWebglSupported(false);
      });

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
    };
  }, []);

  const handleSelect = (route: AtlasRoute) => {
    setActiveRoute(route);
    if (onSelectRoute) {
      onSelectRoute(route);
    } else {
      // Smooth scroll to flight quote form
      const el = document.getElementById("flight-quote");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="sf-atlas" className="relative bg-surface-100 py-16 sm:py-24 border-b border-safaria-line">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-safaria-gold">
            <Compass className="h-4 w-4" />
            <span>{isBn ? "গ্লোবাল রুট নেটওয়ার্ক" : "Global Route Network"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-safaria-ink">
            {isBn ? "সাফারিয়া জার্নি অ্যাটলাস" : "SAFARIA Journey Atlas"}
          </h2>
          <p className="text-sm sm:text-base text-safaria-inkMuted">
            {isBn
              ? "ঢাকা থেকে মধ্যপ্রাচ্য, ইউরোপ, দক্ষিণ-পূর্ব এশিয়া ও অভ্যন্তরীণ গন্তব্যের সুসংগঠিত ফ্লাইট সংযোগ।"
              : "Direct and connected flight corridors connecting Dhaka to premier worldwide transit and leisure hubs."}
          </p>
        </div>

        {/* Interactive Atlas Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Globe Canvas / SVG Fallback */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[460px] rounded-2xl border border-safaria-line bg-surface-0/60 p-4 shadow-panel overflow-hidden">
            {webglSupported ? (
              <canvas ref={canvasRef} className="w-full h-full max-w-[480px] max-h-[440px] cursor-grab" />
            ) : (
              /* SVG Fallback for Reduced-Motion & Non-WebGL */
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="h-40 w-40 rounded-full border-2 border-dashed border-safaria-gold/40 flex items-center justify-center bg-surface-200/50">
                  <Compass className="h-16 w-16 text-safaria-gold animate-spin-slow" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-safaria-ink">
                    {isBn ? "ফ্লাইট রুট ম্যাপ (স্ট্যাটিক ভিউ)" : "Flight Corridor Map (SVG Mode)"}
                  </h4>
                  <p className="text-xs text-safaria-inkMuted max-w-sm">
                    {isBn
                      ? "আপনার ডিভাইসে থ্রিডি মোশন হ্রাস করা হয়েছে। রুট নির্বাচন করে নিচে বিস্তারিত দেখুন।"
                      : "Three.js motion minimized for your device. Select routes from the grid below."}
                  </p>
                </div>
              </div>
            )}

            {/* Globe status badge */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-safaria-inkMuted bg-surface-200/80 px-3 py-1.5 rounded-full border border-safaria-line/40 backdrop-blur">
              <span className="flex items-center gap-1.5 text-safaria-gold font-medium">
                <MapPin className="h-3 w-3" />
                {isBn ? "কেন্দ্রস্থল: হযরত শাহজালাল (DAC)" : "Hub: Hazrat Shahjalal (DAC)"}
              </span>
              <span>8 Primary Routes Active</span>
            </div>
          </div>

          {/* Active Route Details Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-safaria-gold/40 bg-surface-200 p-6 shadow-panel">
              <div className="flex items-center justify-between border-b border-safaria-line/40 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-safaria-gold">
                  {activeRoute.region}
                </span>
                <span className="flex items-center gap-1 text-xs text-safaria-inkMuted">
                  <Clock className="h-3.5 w-3.5 text-safaria-gold" />
                  {activeRoute.flightDuration}
                </span>
              </div>

              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between font-mono text-xl font-bold text-safaria-ink">
                  <div>
                    <span className="text-safaria-gold">{activeRoute.originIata}</span>
                    <p className="text-xs font-sans text-safaria-inkMuted font-normal">
                      {activeRoute.originName}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Plane className="h-5 w-5 text-safaria-gold" />
                    <span className="text-[10px] text-safaria-success font-sans">Verified Corridor</span>
                  </div>
                  <div className="text-right">
                    <span className="text-safaria-gold">{activeRoute.destIata}</span>
                    <p className="text-xs font-sans text-safaria-inkMuted font-normal">
                      {activeRoute.destName}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-surface-input p-3 border border-safaria-line/30 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-safaria-inkMuted">{isBn ? "ফ্লাইট ফ্রিকোয়েন্সি:" : "Frequency:"}</span>
                    <span className="font-medium text-safaria-ink">{activeRoute.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-safaria-inkMuted">{isBn ? "জনপ্রিয় উদ্দেশ্য:" : "Popular For:"}</span>
                    <span className="font-medium text-safaria-gold">{activeRoute.popularFor}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelect(activeRoute)}
                className="w-full flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo py-3 text-xs font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all"
              >
                <span>{isBn ? "এই রুটের জন্য কোটেশন নিন" : "Request Quote For This Route"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick 8 Routes Selector Pill Grid */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-safaria-inkMuted">
                {isBn ? "অন্যান্য আন্তর্জাতিক ও দেশীয় রুটসমূহ:" : "Explore Corridors:"}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {SITE_CONFIG.routes.map((route) => {
                  const isSelected = activeRoute.id === route.id;
                  return (
                    <button
                      key={route.id}
                      onClick={() => setActiveRoute(route)}
                      className={`rounded-lg px-2 py-2 text-center text-xs font-mono font-semibold transition-all border ${
                        isSelected
                          ? "border-safaria-gold bg-safaria-gold/20 text-safaria-gold"
                          : "border-safaria-line/60 bg-surface-200/50 text-safaria-ink hover:border-safaria-gold/40"
                      }`}
                    >
                      {route.originIata}–{route.destIata}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
