"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { offers, offerCategories } from "@/data/catalog";
import type { Language } from "@/lib/atlas-data";

const labels: Record<string, [string, string]> = {
  flights: ["ফ্লাইট", "Flights"], student: ["শিক্ষার্থী", "Student"], saudi: ["সৌদি রুট", "Saudi"],
  premium: ["প্রিমিয়াম", "Premium"], care: ["যাত্রা-পরবর্তী সহায়তা", "Care"], services: ["অন্যান্য সেবা", "Services"],
};

export function OffersBento({ language, onSelect }: { language: Language; onSelect: (id: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!root.current || reduceMotion) return;
    const groups = Array.from(root.current.querySelectorAll<HTMLElement>(".offer-group"));
    const observer = new IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const cards = Array.from(entry.target.querySelectorAll<HTMLElement>(".offer-card"));
        const { animate, stagger } = await import("animejs");
        animate(cards, { opacity: [0, 1], scale: [0.95, 1], y: [20, 0], delay: stagger(55), duration: 540, ease: "outQuad" });
      }
    }, { threshold: 0.08 });
    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, [reduceMotion]);

  return <section id="sf26-offers" className="bg-sf-000 p-space-5 rounded-radius-md shadow-header" ref={root} aria-labelledby="offers-title">
    <div className="section-heading"><p className="eyebrow">01 / CURATED SERVICES</p><h2 id="offers-title" className="display-heading">{language === "bn" ? "যাত্রার প্রতিটি পর্যায়ে" : "Every part of the journey"}</h2><p>{language === "bn" ? "আপনার পরিকল্পনার জন্য বিকল্প জানতে একটি কোটেশন অনুরোধ করুন।" : "Explore options for your plans and request a tailored quotation."}</p></div>
    {offerCategories.map((category) => <div className="offer-group" key={category}>
      <h3>{labels[category][language === "bn" ? 0 : 1]} <span>{String(offers.filter((item) => item.category === category).length).padStart(2, "0")}</span></h3>
      <div className="offer-grid">{offers.filter((item) => item.category === category).map((offer, index) => <motion.button key={offer.id} type="button" className={`offer-card ${index === 0 ? "offer-card-featured" : ""}`} onClick={() => onSelect(offer.id)} variants={{ hover: { y: -4, borderColor: "#cfb57c", boxShadow: "0 18px 50px rgba(0,0,0,.28), inset 0 0 0 1px rgba(207,181,124,.28)" }, focus: { borderColor: "#cfb57c" } }} whileHover={reduceMotion ? undefined : "hover"} whileFocus={reduceMotion ? undefined : "focus"}>
        <span className="offer-index">{String(index + 1).padStart(2, "0")}</span>
        <strong>{language === "bn" ? offer.bn_title : offer.en_title}</strong>
        <span className="offer-description">{language === "bn" ? offer.bn_description : offer.en_description}</span>
        <motion.span className="offer-action" variants={{ hover: { scale: 1.08 } }} aria-hidden="true">{language === "bn" ? "জানুন" : "Ask"} <span>↗</span></motion.span>
      </motion.button>)}</div>
    </div>)}
  </section>;
}
