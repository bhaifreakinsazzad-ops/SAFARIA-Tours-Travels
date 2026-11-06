"use client";

export function focusInvalidField(selector: string) {
  const field = document.querySelector<HTMLElement>(selector);
  field?.focus();
  if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void import("animejs").then(({ animate }) => {
    if (field.isConnected) animate(field, { x: [0, -5, 5, -3, 3, 0], duration: 320, ease: "outQuad" });
  });
}
