"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { animate, stagger } from "animejs";
import { Radio, Sparkles, ArrowUpRight, Plane, CheckCircle2 } from "lucide-react";
import { applyStudioEnvironment, createCompositeAircraft, detectSoftwareWebGL } from "@/lib/threeui";
import { SAFARIA_CONFIG } from "@/config/constants";

export type B2BPainCategory =
  | "PAIN_FARE"
  | "PAIN_BOOKING"
  | "PAIN_PAYMENT"
  | "PAIN_AFTERCARE"
  | "PAIN_TRUST"
  | "PAIN_GROWTH";

interface OfferHookItem {
  id: string;
  corridor: string;
  painCategory: B2BPainCategory;
  planRecommended: "MONTHLY" | "ANNUAL";
  titleBn: string;
  titleEn: string;
  hookBn: string;
  hookEn: string;
  yieldBn: string;
  yieldEn: string;
  offersCount: string;
}

const BANGLADESH_B2B_OFFER_HOOKS: OfferHookItem[] = [
  {
    id: "hook-saudi-umrah",
    corridor: "DAC ➔ JED / RUH / MED",
    painCategory: "PAIN_BOOKING",
    planRecommended: "ANNUAL",
    titleBn: "সৌদি ওমরাহ কাফেলা ও লেবার গ্রুপ ব্লক",
    titleEn: "Saudi Umrah Kafela & KSA Labor Group Blocks",
    hookBn: "সৌদি এয়ারলাইন্স ও বিমানের গ্রুপ পিএনআর হোল্ড, ০% SAFARIA মার্কআপ এবং মক্কা-মদিনা ট্রান্সফার বান্ডেল।",
    hookEn: "Lock Saudia & Biman group PNR allocations with 0% SAFARIA markup plus Makkah–Madinah land support.",
    yieldBn: "গড় সাব-এজেন্ট মার্জিন: +৳৩,৫০০/যাত্রী",
    yieldEn: "Avg Sub-Agent Yield: +৳3,500/pax",
    offersCount: "6 Saudi & Umrah Offers",
  },
  {
    id: "hook-gulf-expat",
    corridor: "DAC ➔ DXB / SHJ / DOH / MCT",
    painCategory: "PAIN_FARE",
    planRecommended: "MONTHLY",
    titleBn: "দুবাই, কাতার ও মধ্যপ্রাচ্য এক্সপ্যাট নেট ফেয়ার",
    titleEn: "UAE, Qatar & Oman Expat Wholesale Net Fares",
    hookBn: "জিডিএস টার্মিনাল ছাড়াই ১২ মিনিটে প্রবাসী ও ভিজিট ভিসার যাত্রীদের জন্য ভেরিফায়েড হোলসেল কোটেশন।",
    hookEn: "12-minute verified wholesale net quotes for Gulf expat and visit-visa flyers without a GDS terminal.",
    yieldBn: "গড় সাব-এজেন্ট মার্জিন: +৳২,৪০০/টিকেট",
    yieldEn: "Avg Sub-Agent Yield: +৳2,400/ticket",
    offersCount: "8 Flight & Care Offers",
  },
  {
    id: "hook-student-uk-cad",
    corridor: "DAC / ZYL ➔ LHR / MAN / YYZ",
    painCategory: "PAIN_TRUST",
    planRecommended: "ANNUAL",
    titleBn: "সিলেট-লন্ডন, কানাডা ও স্টুডেন্ট এক্সট্রা ব্যাগেজ",
    titleEn: "Sylhet–UK, Canada & Student Extra-Baggage Desk",
    hookBn: "শিক্ষার্থীদের অতিরিক্ত ব্যাগেজ কোটা এবং পাসপোর্ট নাম অডিটের মাধ্যমে ৳১৫,০০০+ এয়ারলাইন জরিমানা প্রতিরোধ।",
    hookEn: "Student extra-baggage allocations and pre-issuance passport name audits that eliminate ৳15,000+ fines.",
    yieldBn: "গড় সাব-এজেন্ট মার্জিন: +৳৪,৮০০/টিকেট",
    yieldEn: "Avg Sub-Agent Yield: +৳4,800/ticket",
    offersCount: "5 Student & Premium Offers",
  },
  {
    id: "hook-asean-holiday",
    corridor: "DAC ➔ KUL / SIN / BKK / MLE",
    painCategory: "PAIN_GROWTH",
    planRecommended: "MONTHLY",
    titleBn: "মালয়েশিয়া, সিঙ্গাপুর ও থাইল্যান্ড ভিসা + ট্যুর প্যাক",
    titleEn: "Malaysia, Singapore & Bangkok Visa + Holiday Packs",
    hookBn: "হোলসেল এয়ার টিকিটের সাথে ভিসা চেকলিস্ট, হোটেল ও এয়ারপোর্ট ট্রান্সফার যুক্ত করে দ্বিগুণ এজেন্সি প্রফিট।",
    hookEn: "Combine wholesale air tickets with visa processing, hotel stays, and airport transfers for double margin.",
    yieldBn: "কম্বো মার্জিন: +৳৫,২০০/প্যাকেজ",
    yieldEn: "Combo Agency Yield: +৳5,200/pack",
    offersCount: "7 Visa, Hotel & Tour Offers",
  },
];

interface Props {
  bn: boolean;
  selectedPain: B2BPainCategory;
  onSelectHook: (pain: B2BPainCategory, plan: "MONTHLY" | "ANNUAL", corridorLabel: string) => void;
}

export function B2BThreeCommandHub({ bn, selectedPain, onSelectHook }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeHookId, setActiveHookId] = useState<string>("hook-saudi-umrah");
  const [webglReady, setWebglReady] = useState(false);
  const targetAngleRef = useRef<number>(0);

  useEffect(() => {
    const host = stageRef.current;
    if (!host || !window.WebGLRenderingContext || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 25);
    camera.position.set(0, 0.85, 4.1);
    camera.lookAt(0, 0, 0);

    const envTexture = applyStudioEnvironment(renderer, scene);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.className = "w-full h-full block";
    host.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Studio Lighting
    scene.add(new THREE.HemisphereLight(0x9dc1b4, 0x031412, 1.4));
    const dirLight = new THREE.DirectionalLight(0xf6d9a7, 2.4);
    dirLight.position.set(-3, 4, 5);
    scene.add(dirLight);
    const emeraldLight = new THREE.DirectionalLight(0x10b981, 1.2);
    emeraldLight.position.set(3, -2, -3);
    scene.add(emeraldLight);

    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];

    // Central Dhaka B2B Wholesale Command Core (Faceted Gold & Emerald Hub)
    const coreGeo = new THREE.IcosahedronGeometry(0.68, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x093029,
      roughness: 0.28,
      metalness: 0.72,
      emissive: 0x05201b,
      emissiveIntensity: 0.4,
    });
    const wireGeo = new THREE.IcosahedronGeometry(0.705, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc5a059,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    geos.push(coreGeo, wireGeo);
    mats.push(coreMat, wireMat);

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    rootGroup.add(coreMesh, wireMesh);

    // 6 Orbiting Operational Desk Nodes + Supply Ring
    const ringGeo = new THREE.TorusGeometry(1.38, 0.008, 12, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc5a059,
      transparent: true,
      opacity: 0.45,
    });
    const outerRingGeo = new THREE.TorusGeometry(1.68, 0.005, 8, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3,
    });
    geos.push(ringGeo, outerRingGeo);
    mats.push(ringMat, outerRingMat);

    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2.2;
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2.2;
    rootGroup.add(orbitRing, outerRing);

    const nodeGeo = new THREE.OctahedronGeometry(0.095, 0);
    const nodeMatGold = new THREE.MeshStandardMaterial({
      color: 0xdfc19b,
      roughness: 0.2,
      metalness: 0.88,
      emissive: 0xc5a059,
      emissiveIntensity: 0.35,
    });
    geos.push(nodeGeo);
    mats.push(nodeMatGold);

    const deskNodes: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const deskMesh = new THREE.Mesh(nodeGeo, nodeMatGold);
      deskMesh.position.set(Math.cos(angle) * 1.38, Math.sin(angle * 2) * 0.12, Math.sin(angle) * 1.38);
      rootGroup.add(deskMesh);
      deskNodes.push(deskMesh);
    }

    // 3 Composite 3D Aircraft orbiting the B2B Wholesale Supply Ring
    const aircraftFleet: { group: THREE.Group; phase: number; radius: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const jet = createCompositeAircraft(geos, mats);
      jet.scale.setScalar(1.85);
      rootGroup.add(jet);
      aircraftFleet.push({ group: jet, phase: (i / 3) * Math.PI * 2, radius: 1.68 });
    }

    const clock = new THREE.Clock();
    const lookTarget = new THREE.Vector3();
    let disposed = false;

    function renderFrame() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      coreMesh.rotation.y = elapsed * 0.22;
      wireMesh.rotation.y = -elapsed * 0.15;
      wireMesh.rotation.x = Math.sin(elapsed * 0.4) * 0.15;

      rootGroup.rotation.y = THREE.MathUtils.damp(
        rootGroup.rotation.y,
        targetAngleRef.current + elapsed * 0.14,
        4.5,
        delta,
      );

      for (const [idx, node] of deskNodes.entries()) {
        node.rotation.y = elapsed * 1.4 + idx;
        node.rotation.x = elapsed * 0.9;
      }

      for (const item of aircraftFleet) {
        const angle = elapsed * 0.55 + item.phase;
        const nextAngle = angle + 0.05;
        item.group.position.set(
          Math.cos(angle) * item.radius,
          Math.sin(angle * 2) * 0.18,
          Math.sin(angle) * item.radius,
        );
        lookTarget.set(
          Math.cos(nextAngle) * item.radius,
          Math.sin(nextAngle * 2) * 0.18,
          Math.sin(nextAngle) * item.radius,
        );
        item.group.lookAt(lookTarget);
      }

      renderer.render(scene, camera);
    }

    function resize() {
      if (!host) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(w, h);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    renderer.setAnimationLoop(renderFrame);
    const raf = window.requestAnimationFrame(() => setWebglReady(true));

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      renderer.setAnimationLoop(null);
      ro.disconnect();
      envTexture?.dispose();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const handleHookClick = (hook: OfferHookItem, index: number) => {
    setActiveHookId(hook.id);
    targetAngleRef.current = (index / BANGLADESH_B2B_OFFER_HOOKS.length) * Math.PI * 2;
    onSelectHook(hook.painCategory, hook.planRecommended, hook.corridor);

    if (cardsContainerRef.current) {
      const items = cardsContainerRef.current.querySelectorAll(".b2b-corridor-hook-card");
      animate(items, {
        scale: [0.985, 1],
        delay: stagger(40),
        duration: 340,
        ease: "outQuad",
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:px-6 lg:px-8 space-y-8">
      {/* Official WhatsApp B2B Community Channel Spotlight Banner */}
      <div className="rounded-2xl border border-[#10b981]/45 bg-gradient-to-r from-[#062821] via-[#041b17] to-[#06201c] p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/15 px-3 py-0.5 text-[11px] font-mono font-bold text-[#10b981] uppercase">
            <Radio className="h-3.5 w-3.5" />
            <span>
              {bn
                ? "অফিসিয়াল বাংলাদেশ B2B এজেন্সি কমিউনিটি চ্যানেল"
                : "OFFICIAL BANGLADESH B2B AGENCY COMMUNITY CHANNEL"}
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f7f2ea]">
            {bn
              ? "প্রতিদিনের হোলসেল ফেয়ার ড্রপ, ওমরাহ সিট ব্লক ও এয়ারলাইন সার্কুলার সবার আগে পান"
              : "Daily Dhaka Wholesale Fare Drops, Umrah Seat Blocks & Airline Waiver Alerts"}
          </h2>
          <p className="text-xs sm:text-sm text-[#a3b8b0] leading-relaxed">
            {bn
              ? "ঢাকা, চট্টগ্রাম, সিলেট ও সারা বাংলাদেশের ট্রাভেল এজেন্সি মালিক এবং টিকেটিং এক্সিকিউটিভদের অফিসিয়াল SAFARIA কমিউনিটি চ্যানেলে যুক্ত হয়ে প্রতিদিনের স্পেশাল বিটুবি অফার ও নেট রেট আপডেট পান।"
              : "Join travel agency owners and ticketing executives across Dhaka, Sylhet, and Chattogram on our official WhatsApp Broadcast Channel for real-time B2B inventory alerts."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <a
            href={SAFARIA_CONFIG.whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10b981] px-5 py-3 text-xs sm:text-sm font-bold text-[#031412] hover:bg-[#34d399] transition-all shadow-lg shadow-[#10b981]/20"
          >
            <Radio className="h-4 w-4" />
            <span>
              {bn ? "অফিসিয়াল WhatsApp চ্যানেলে জয়েন করুন" : "Join Official WhatsApp Channel"}
            </span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#b2b-subscription-enquiry"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#c5a059]/50 bg-[#031412] px-4 py-2 text-xs font-bold text-[#c5a059] hover:border-[#c5a059] transition-colors text-center"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {bn ? "৭২ ঘণ্টার ফ্রি B2B ট্রায়াল ও সাবস্ক্রিপশন" : "Enquire 72h Trial & B2B Subscription"}
            </span>
          </a>
        </div>
      </div>

      {/* Interactive 3D Command Core + 4 High-Converting Bangladeshi Offer Hooks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Three.js 3D B2B Wholesale Network Orb */}
        <div className="lg:col-span-5 rounded-2xl border border-[#c5a059]/35 bg-[#041916] p-5 flex flex-col justify-between relative overflow-hidden min-h-[340px]">
          <div className="relative z-10 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
              <Plane className="h-3.5 w-3.5 text-[#10b981]" />
              <span>{bn ? "থ্রিডি হোলসেল নেটওয়ার্ক হাব" : "3D WHOLESALE COMMAND CORE"}</span>
            </span>
            <span className="rounded bg-[#031412] border border-[#c5a059]/30 px-2 py-0.5 font-mono text-[10px] text-[#10b981]">
              {selectedPain.replace("PAIN_", "DESK: ")}
            </span>
          </div>

          <div
            ref={stageRef}
            className="relative my-2 h-56 w-full flex items-center justify-center"
            aria-label={bn ? "থ্রিডি বি২বি কমান্ড হাব" : "3D B2B Command Hub"}
          >
            {!webglReady && (
              <div className="text-center space-y-1 text-xs text-[#a3b8b0] font-mono">
                <span className="block text-[#c5a059] font-bold">DAC ➔ 33 GLOBAL CORRIDORS</span>
                <span>6 Operational Desks • 0% SAFARIA Markup</span>
              </div>
            )}
          </div>

          <div className="relative z-10 rounded-xl border border-[#c5a059]/25 bg-[#031412]/90 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#a3b8b0]">{bn ? "সক্রিয় অফার ক্যাটালগ:" : "Active B2B Catalog:"}</span>
              <span className="text-[#c5a059] font-bold">
                {bn ? "২৬টি কিউরেটেড সার্ভিস ও ৩৩টি গন্তব্য" : "26 Curated Services • 33 Cities"}
              </span>
            </div>
            <p className="text-[11px] text-[#a3b8b0]">
              {bn
                ? "ডানপাশের যেকোনো বাংলাদেশি করিডোর হুকে ক্লিক করলে আপনার এজেন্সির জন্য উপযুক্ত ডেস্ক ও সাবস্ক্রিপশন ফর্ম স্বয়ংক্রিয়ভাবে প্রস্তুত হবে।"
                : "Select any high-margin Bangladesh corridor hook on the right to configure your B2B subscription enquiry."}
            </p>
          </div>
        </div>

        {/* Right: 4 High-Converting B2B Offer Hooks for Bangladeshi Agencies */}
        <div
          ref={cardsContainerRef}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {BANGLADESH_B2B_OFFER_HOOKS.map((hook, idx) => {
            const isSelected = activeHookId === hook.id;
            return (
              <button
                key={hook.id}
                type="button"
                onClick={() => handleHookClick(hook, idx)}
                className={`b2b-corridor-hook-card rounded-2xl border p-5 text-left transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "border-[#c5a059] bg-[#06201c] shadow-lg shadow-[#c5a059]/15 ring-1 ring-[#c5a059]"
                    : "border-[#c5a059]/20 bg-[#06201c]/65 hover:border-[#c5a059]/50 hover:bg-[#06201c]"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-[#031412] border border-[#c5a059]/35 px-2 py-0.5 font-mono text-[10px] font-bold text-[#c5a059]">
                      {hook.corridor}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                      {hook.offersCount}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#f7f2ea]">
                    {bn ? hook.titleBn : hook.titleEn}
                  </h3>

                  <p className="text-xs text-[#a3b8b0] leading-relaxed">
                    {bn ? hook.hookBn : hook.hookEn}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#c5a059]/15">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{bn ? hook.yieldBn : hook.yieldEn}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#c5a059]">
                    <span>
                      {bn ? "সাবস্ক্রিপশন ও ট্রায়াল এনকোয়ারি" : "Enquire B2B Subscription"}
                    </span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
