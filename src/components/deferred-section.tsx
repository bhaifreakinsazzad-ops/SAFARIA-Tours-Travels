"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function DeferredSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (!window.IntersectionObserver) {
      const timer = window.setTimeout(() => setActive(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } }, { threshold: 0.01 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return active ? children : <section id={id} ref={ref} className="deferred-placeholder content-section" aria-label={title}><span className="eyebrow">SAFARIA</span><h2 className="display-heading">{title}</h2></section>;
}
