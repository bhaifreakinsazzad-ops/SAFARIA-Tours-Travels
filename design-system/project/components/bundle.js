/* @ds-bundle: {"format":4,"namespace":"Safaria","components":[{"name":"Button"},{"name":"SectionHeading"},{"name":"Header"},{"name":"HeroGlobe"},{"name":"ServiceList"},{"name":"DestinationGrid"},{"name":"FlightQuote"},{"name":"PricePlan"},{"name":"Accordion"},{"name":"ContactDock"},{"name":"Footer"},{"name":"Motion"}]} */
/* SAFARIA design system runtime v2.0.0. Plain JS with no imports and no network.
   Optional libraries are handed in with Safaria.use({ anime, motion, THREE }).
   Without them, everything runs on the Web Animations API or as static HTML. */
(function () {
  "use strict";
  var W = window, D = document;
  var libs = { anime: null, motion: null, THREE: null };
  var config = { phone: "+8801674178437", email: "safariatoursandtravels@gmail.com", source: "safaria-website", respectSiteMotionToggle: true };

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function reduced(el) {
    if (W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    if (config.respectSiteMotionToggle && el && el.closest && el.closest('[data-motion="paused"]')) return true;
    return false;
  }
  function fine() { return W.matchMedia && W.matchMedia("(hover: hover) and (pointer: fine)").matches; }
  function digits(p) { return String(p).replace(/[^0-9]/g, ""); }

  /* ---------- icons (1.5px line set, 24 grid) ---------- */
  var ICONS = {
    plane: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z",
    globe: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9M12 3c-2.5 2.5-3.8 5.5-3.8 9s1.3 6.5 3.8 9",
    passport: "M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM12 8.5a3 3 0 1 0 0 6a3 3 0 1 0 0-6M9 17.5h6",
    visa: "M4 5h16v14H4zM8 10h8M8 14h5",
    hotel: "M3 20V6M3 13h18v7M21 13a3 3 0 0 0-3-3h-7v3M7 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3",
    map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
    briefcase: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
    handshake: "M3 12l4-4 4 2 3-2 4 1 3 3M7 8l5 5a1.5 1.5 0 0 0 2-2M10 15l2 2M13 12l3 3",
    whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.8zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z",
    phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
    sms: "M4 5h16v11H9l-5 4zM8 10.5h.01M12 10.5h.01M16 10.5h.01",
    chevron: "M6 9l6 6 6-6",
    arrow: "M5 12h14M13 6l6 6-6 6",
    swap: "M7 7h13l-3-3M17 17H4l3 3",
    check: "M5 12.5l4.5 4.5L19 7",
    alert: "M12 8v5M12 16.5v.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    close: "M6 6l12 12M18 6L6 18",
    menu: "M4 7h16M4 12h16M4 17h16",
    copy: "M8 8h12v12H8zM4 16V4h12"
  };
  function icon(name, cls) {
    return '<svg class="sf-icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + (ICONS[name] || ICONS.arrow) + '"/></svg>';
  }

  /* ---------- destinations (enquiry options, not route claims) ---------- */
  var DESTINATIONS = [
    { code: "DAC", city: "Dhaka", country: "Bangladesh", region: "domestic", lat: 23.84, lon: 90.40, origin: true },
    { code: "CGP", city: "Chattogram", country: "Bangladesh", region: "domestic", lat: 22.25, lon: 91.81 },
    { code: "CXB", city: "Cox's Bazar", country: "Bangladesh", region: "domestic", lat: 21.45, lon: 91.96 },
    { code: "ZYL", city: "Sylhet", country: "Bangladesh", region: "domestic", lat: 24.96, lon: 91.87 },
    { code: "SPD", city: "Saidpur", country: "Bangladesh", region: "domestic", lat: 25.76, lon: 88.91 },
    { code: "RJH", city: "Rajshahi", country: "Bangladesh", region: "domestic", lat: 24.44, lon: 88.62 },
    { code: "JSR", city: "Jashore", country: "Bangladesh", region: "domestic", lat: 23.18, lon: 89.16 },
    { code: "BZL", city: "Barishal", country: "Bangladesh", region: "domestic", lat: 22.80, lon: 90.30 },
    { code: "MAA", city: "Chennai", country: "India", region: "international", lat: 12.99, lon: 80.17 },
    { code: "KTM", city: "Kathmandu", country: "Nepal", region: "international", lat: 27.70, lon: 85.36 },
    { code: "BKK", city: "Bangkok", country: "Thailand", region: "international", lat: 13.69, lon: 100.75 },
    { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", region: "international", lat: 2.74, lon: 101.70 },
    { code: "SIN", city: "Singapore", country: "Singapore", region: "international", lat: 1.36, lon: 103.99 },
    { code: "DXB", city: "Dubai", country: "UAE", region: "international", lat: 25.25, lon: 55.36 },
    { code: "AUH", city: "Abu Dhabi", country: "UAE", region: "international", lat: 24.43, lon: 54.65 },
    { code: "DOH", city: "Doha", country: "Qatar", region: "international", lat: 25.27, lon: 51.61 },
    { code: "JED", city: "Jeddah", country: "Saudi Arabia", region: "international", lat: 21.68, lon: 39.16 },
    { code: "RUH", city: "Riyadh", country: "Saudi Arabia", region: "international", lat: 24.96, lon: 46.70 },
    { code: "DMM", city: "Dammam", country: "Saudi Arabia", region: "international", lat: 26.47, lon: 49.80 },
    { code: "MCT", city: "Muscat", country: "Oman", region: "international", lat: 23.59, lon: 58.28 },
    { code: "CAN", city: "Guangzhou", country: "China", region: "international", lat: 23.39, lon: 113.30 },
    { code: "BJS", city: "Beijing", country: "China", region: "international", lat: 39.90, lon: 116.40, note: "All Beijing airports" },
    { code: "MED", city: "Madinah", country: "Saudi Arabia", region: "international", lat: 24.55, lon: 39.71 },
    { code: "LON", city: "London", country: "United Kingdom", region: "international", lat: 51.47, lon: -0.45, note: "All London airports" },
    { code: "ROM", city: "Rome", country: "Italy", region: "international", lat: 41.80, lon: 12.25 },
    { code: "YTO", city: "Toronto", country: "Canada", region: "international", lat: 43.68, lon: -79.63 },
    { code: "TYO", city: "Tokyo", country: "Japan", region: "international", lat: 35.55, lon: 139.78, note: "Haneda or Narita" },
    { code: "NYC", city: "New York", country: "USA", region: "international", lat: 40.64, lon: -73.78, note: "All New York airports" },
    { code: "FL", city: "Florida", country: "USA", region: "international", lat: 27.9, lon: -81.7, note: "State: Miami, Orlando, Tampa, Fort Lauderdale and more" },
    { code: "SYD", city: "Sydney", country: "Australia", region: "international", lat: -33.94, lon: 151.18 },
    { code: "SEL", city: "Seoul", country: "South Korea", region: "international", lat: 37.46, lon: 126.44 },
    { code: "IST", city: "Istanbul", country: "Türkiye", region: "international", lat: 41.28, lon: 28.75 },
    { code: "CPT", city: "Cape Town", country: "South Africa", region: "international", lat: -33.97, lon: 18.60 }
  ];
  function destLabel(d) { return d.city + (d.region === "domestic" ? " (" + d.code + ")" : ", " + d.country); }
  function findDest(v) {
    v = String(v || "").trim().toLowerCase(); if (!v) return null;
    for (var i = 0; i < DESTINATIONS.length; i++) { var d = DESTINATIONS[i]; if (destLabel(d).toLowerCase() === v || d.code.toLowerCase() === v || d.city.toLowerCase() === v) return d; }
    return null;
  }

  /* ---------- Motion: one animation API; anime.js 4 when present, else WAAPI ---------- */
  var EASE = { out: ["outExpo", "cubic-bezier(.22,1,.36,1)"], inOut: ["inOutCubic", "cubic-bezier(.65,0,.35,1)"], spring: ["outBack(1.7)", "cubic-bezier(.34,1.56,.64,1)"] };
  var DUR = { micro: 120, short: 250, medium: 600, long: 1100, stagger: 70 };
  function tf(y, x, s) { return "translate3d(" + (x || 0) + "px," + (y || 0) + "px,0)" + (s != null ? " scale(" + s + ")" : ""); }
  /* Restore an element to its stylesheet state without letting the site's own CSS transitions replay the change */
  function clean(el) { el.style.transition = "none"; el.style.opacity = ""; el.style.transform = ""; el.style.willChange = ""; el.style.clipPath = ""; void el.offsetWidth; el.style.transition = ""; }
  /* animate(targets, {opacity:[a,b], y:[a,b], x:[a,b], scale:[a,b], clip:[a,b]}, {duration, delay, stagger, ease}) → Promise */
  function animate(targets, p, o) {
    o = o || {};
    var els = (targets instanceof Element) ? [targets] : Array.prototype.slice.call(targets || []);
    if (!els.length) return Promise.resolve();
    var dur = o.duration || DUR.medium, ease = EASE[o.ease || "out"], st = o.stagger || 0, base = o.delay || 0;
    if (reduced(els[0])) {
      els.forEach(function (el) { if (p.opacity) el.style.opacity = p.opacity[1]; el.style.transform = ""; el.style.clipPath = ""; });
      return Promise.resolve();
    }
    /* JS owns transform/opacity while it runs: CSS transitions are suspended so the two never fight */
    els.forEach(function (el) { el.style.willChange = "transform, opacity"; el.style.transition = "none"; });
    var A = libs.anime, made = [], settled = false;
    var finish = function () { if (settled) return; settled = true; clearTimeout(guard); made.forEach(function (a) { try { a.cancel(); } catch (e) {} }); els.forEach(clean); };
    /* Guard: if frames never arrive (hidden/background tab, throttled device), content is restored anyway */
    var guard = setTimeout(finish, base + st * els.length + dur + 1500);
    if (A && A.animate) {
      var params = { duration: dur, ease: ease[0], delay: st && A.stagger ? A.stagger(st, { start: base }) : base };
      if (p.opacity) params.opacity = p.opacity;
      if (p.y) params.translateY = p.y;
      if (p.x) params.translateX = p.x;
      if (p.scale) params.scale = p.scale;
      if (p.clip) params.clipPath = p.clip;
      return new Promise(function (res) {
        params.onComplete = function () { finish(); res(); };
        try { made.push(A.animate(els, params)); } catch (e) { finish(); res(); }
        setTimeout(res, base + st * els.length + dur + 1600);
      });
    }
    return Promise.all(els.map(function (el, i) {
      var f = {}, t = {};
      if (p.opacity) { f.opacity = p.opacity[0]; t.opacity = p.opacity[1]; }
      if (p.y || p.x || p.scale) { f.transform = tf(p.y && p.y[0], p.x && p.x[0], p.scale && p.scale[0]); t.transform = tf(p.y && p.y[1], p.x && p.x[1], p.scale && p.scale[1]); }
      if (p.clip) { f.clipPath = p.clip[0]; t.clipPath = p.clip[1]; }
      if (!el.animate) return Promise.resolve();
      var a = el.animate([f, t], { duration: dur, delay: base + i * st, easing: ease[1], fill: "both" }); made.push(a);
      return Promise.race([a.finished, new Promise(function (r) { setTimeout(r, base + st * els.length + dur + 1600); })]).catch(function () {});
    })).then(finish);
  }
  function hide(els, p) { (els instanceof Element ? [els] : els).forEach(function (el) { el.style.opacity = "0"; if (p && p.y) el.style.transform = tf(p.y); if (p && p.clip) el.style.clipPath = p.clip; }); }

  /* Motion's inView triggers the reveal; a native observer double-checks that observation works at all.
     If it delivers nothing within 2.5s (webviews, prerender, screenshot tools), the content shows immediately. */
  function whenVisible(el, cb, amount) {
    if (!("IntersectionObserver" in W)) { cb(); return; }
    var M = libs.motion, done = false, delivered = false, stopM = null, io;
    var go = function () { if (done) return; done = true; stopM && stopM(); io && io.disconnect(); cb(); };
    if (M && M.inView) stopM = M.inView(el, function () { go(); }, { amount: amount || 0.15 });
    io = new IntersectionObserver(function (es) { delivered = true; if (!stopM && es[0].isIntersecting) go(); }, { threshold: amount || 0.15 });
    io.observe(el);
    setTimeout(function () { if (!delivered) go(); }, 2500);
  }

  var Motion = {
    tokens: { duration: DUR, ease: EASE },
    animate: animate,
    /* Hero entrance. sel: {art, lines, lead, ctas, chips}; CTAs are visible by ~700ms */
    hero: function (root, sel) {
      sel = sel || {};
      var g = function (s, d) { return $$(s || d, root); };
      var art = g(sel.art, '[data-sf-hero="art"]'), lines = g(sel.lines, '[data-sf-hero="line"]'), lead = g(sel.lead, '[data-sf-hero="lead"]'), ctas = g(sel.ctas, '[data-sf-hero="cta"]'), chips = g(sel.chips, '[data-sf-hero="chip"]');
      if (reduced(root)) return Promise.resolve();
      hide(art); hide(lines, { y: 26 }); hide(lead, { y: 14 }); hide(ctas, { y: 10 }); hide(chips, { y: 8 });
      return Promise.all([
        animate(art, { opacity: [0, 1], scale: [1.04, 1] }, { duration: DUR.long }),
        animate(lines, { opacity: [0, 1], y: [26, 0] }, { duration: 800, delay: 120, stagger: DUR.stagger }),
        animate(lead, { opacity: [0, 1], y: [14, 0] }, { duration: DUR.medium, delay: 340 }),
        animate(ctas, { opacity: [0, 1], y: [10, 0] }, { duration: 500, delay: 460, stagger: 90 }),
        animate(chips, { opacity: [0, 1], y: [8, 0] }, { duration: 500, delay: 760, stagger: 60 })
      ]);
    },
    /* [data-sf-reveal], [data-sf-stagger] > *, [data-sf-wipe], [data-sf-count] inside root */
    reveal: function (root) {
      root = root || D;
      $$("[data-sf-reveal]:not([data-sf-done])", root).forEach(function (el) {
        el.setAttribute("data-sf-done", ""); if (reduced(el)) return;
        hide(el, { y: 18 }); whenVisible(el, function () { animate(el, { opacity: [0, 1], y: [18, 0] }); });
      });
      $$("[data-sf-stagger]:not([data-sf-done])", root).forEach(function (el) {
        el.setAttribute("data-sf-done", ""); if (reduced(el)) return;
        var kids = Array.prototype.slice.call(el.children); hide(kids, { y: 20 });
        whenVisible(el, function () { animate(kids, { opacity: [0, 1], y: [20, 0] }, { stagger: DUR.stagger }); });
      });
      $$("[data-sf-wipe]:not([data-sf-done])", root).forEach(function (el) {
        el.setAttribute("data-sf-done", ""); if (reduced(el)) return;
        var img = $("img", el); el.style.clipPath = "inset(0 100% 0 0)";
        whenVisible(el, function () {
          animate(el, { clip: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] }, { duration: DUR.long, ease: "inOut" });
          if (img) animate(img, { scale: [1.08, 1] }, { duration: 2400 });
        }, 0.25);
      });
      $$("[data-sf-count]:not([data-sf-done])", root).forEach(function (el) {
        el.setAttribute("data-sf-done", ""); var n = parseFloat(el.getAttribute("data-sf-count")); if (isNaN(n) || reduced(el)) return;
        var suf = el.getAttribute("data-sf-suffix") || "", fmt = function (v) { el.textContent = Math.round(v).toLocaleString() + suf; };
        whenVisible(el, function () {
          var A = libs.anime, o = { v: 0 };
          if (A && A.animate) { A.animate(o, { v: n, duration: 1400, ease: "outExpo", onUpdate: function () { fmt(o.v); }, onComplete: function () { fmt(n); } }); return; }
          var t0 = performance.now(); (function step(t) { var k = Math.min(1, (t - t0) / 1400); fmt(n * (1 - Math.pow(2, -10 * k))); if (k < 1) requestAnimationFrame(step); else fmt(n); })(t0);
        }, 0.6);
      });
    },
    /* [data-sf-depth="0.06"]: scroll parallax (transform only, max 6% of height) */
    parallax: function (root) {
      var els = $$("[data-sf-depth]", root || D).filter(function (el) { return !reduced(el); });
      if (!els.length) return function () {};
      var M = libs.motion, stops = [];
      els.forEach(function (el) {
        var k = Math.min(0.08, parseFloat(el.getAttribute("data-sf-depth")) || 0.05);
        var set = function (p) { el.style.transform = "translate3d(0," + ((p - 0.5) * k * el.offsetHeight).toFixed(1) + "px,0)"; };
        if (M && M.scroll) { stops.push(M.scroll(set, { target: el, offset: ["start end", "end start"] })); return; }
        var tick = false, on = function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; var r = el.getBoundingClientRect(), vh = innerHeight; set(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))); }); };
        W.addEventListener("scroll", on, { passive: true }); on(); stops.push(function () { W.removeEventListener("scroll", on); });
      });
      return function () { stops.forEach(function (s) { s && s(); }); };
    },
    /* [data-sf-magnetic] buttons and [data-sf-tilt] cards: fine pointers only */
    pointer: function (root) {
      if (!fine()) return;
      $$("[data-sf-magnetic]:not([data-sf-pt])", root || D).forEach(function (el) {
        el.setAttribute("data-sf-pt", ""); if (reduced(el)) return;
        el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.transform = tf(((e.clientY - r.top) / r.height - 0.5) * 8, ((e.clientX - r.left) / r.width - 0.5) * 12); });
        el.addEventListener("pointerleave", function () { animate(el, { x: [0, 0], y: [0, 0] }, { duration: DUR.short }); });
      });
      $$("[data-sf-tilt]:not([data-sf-pt])", root || D).forEach(function (el) {
        el.setAttribute("data-sf-pt", ""); if (reduced(el)) return;
        el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg)"; });
        el.addEventListener("pointerleave", function () { el.style.transition = "transform 250ms cubic-bezier(.22,1,.36,1)"; el.style.transform = ""; setTimeout(function () { el.style.transition = ""; }, 260); });
      });
    },
    init: function (root) { Motion.reveal(root); Motion.pointer(root); return Motion.parallax(root); }
  };

  /* ---------- Drawer (mobile nav, dialogs) ---------- */
  function Drawer(trigger, panel, veil) {
    var last = null;
    function set(open) {
      panel.setAttribute("data-open", open ? "true" : "false"); if (veil) veil.setAttribute("data-open", open ? "true" : "false");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        last = D.activeElement; panel.style.visibility = "visible";
        animate(panel, { x: [panel.offsetWidth, 0], opacity: [0.6, 1] }, { duration: DUR.medium, ease: "inOut" });
        var f = $("a, button, input", panel); f && f.focus();
      } else { (last || trigger).focus(); }
    }
    trigger.addEventListener("click", function () { set(panel.getAttribute("data-open") !== "true"); });
    veil && veil.addEventListener("click", function () { set(false); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    return { open: function () { set(true); }, close: function () { set(false); } };
  }

  /* ---------- Header: compact on scroll ---------- */
  var Header = {
    mount: function (header, opts) {
      opts = opts || {}; var on = false, scroller = opts.scroller || W;
      var check = function () { var y = scroller === W ? W.scrollY : scroller.scrollTop, c = y > 24; if (c !== on) { on = c; header.classList.toggle("sf-compact", c); } };
      scroller.addEventListener("scroll", check, { passive: true }); check();
      var b = $(".sf-burger", header), p = opts.drawer, v = opts.veil;
      return b && p ? Drawer(b, p, v) : null;
    }
  };

  /* ---------- Globe (three.js r160) ---------- */
  var HeroGlobe = {
    supported: function () { try { var c = D.createElement("canvas"); return !!(W.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } },
    mount: function (host, o) {
      o = o || {}; var T = o.THREE || libs.THREE;
      if (!T || !HeroGlobe.supported()) return null;
      if (navigator.connection && navigator.connection.saveData) return null;
      var still = reduced(host), mobile = W.matchMedia("(max-width: 767px)").matches;
      var low = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
      var cs = getComputedStyle(host), cv = function (n, d) { var v = cs.getPropertyValue(n).trim(); return /^#|^rgb/.test(v) ? v : d; };
      var GOLD = new T.Color(cv("--gold", "#d6b779")), IVORY = new T.Color(cv("--ivory", "#f8f5ec")), CORE = new T.Color(cv("--surface-100", "#062b27"));
      var renderer;
      try { renderer = new T.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: "low-power" }); } catch (e) { return null; }
      renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, mobile || low ? 1 : 1.5));
      var wrap = D.createElement("div"); wrap.className = "sf-globe3d"; wrap.appendChild(renderer.domElement); host.appendChild(wrap);
      if (o.caption !== false) { var cap = D.createElement("span"); cap.className = "sf-illustrative"; cap.textContent = o.caption || "Illustrative routes, not flight schedules"; host.appendChild(cap); }
      /* o.fill: sphere radius as a share of the box's smaller half-side (default 0.78); o.distance overrides */
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, 0.1, 100), fill = o.fill || 0.78, tanH = Math.tan(17.5 * Math.PI / 180);
      cam.position.set(0, 0, o.distance || 3.6);
      var g = new T.Group(); scene.add(g); if (o.offsetX) g.position.x = o.offsetX;
      var disposables = [];
      function ll(lat, lon, r) { var p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180; r = r || 1; return new T.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)); }
      /* o.overlay: draw only routes and markers over a globe that is already painted in an image.
         The core then writes depth only, so far-side arcs stay hidden behind the painted Earth. */
      var overlay = !!o.overlay;
      var coreG = new T.SphereGeometry(0.985, 48, 48), coreM = overlay ? new T.MeshBasicMaterial({ colorWrite: false }) : new T.MeshBasicMaterial({ color: CORE });
      g.add(new T.Mesh(coreG, coreM)); disposables.push(coreG, coreM);
      if (!overlay) {
      /* dotted shell */
      var N = low ? 1800 : 3800, pos = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) { var y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963; pos[i * 3] = Math.cos(th) * r; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(th) * r; }
      var dotG = new T.BufferGeometry(); dotG.setAttribute("position", new T.BufferAttribute(pos, 3));
      var dotM = new T.PointsMaterial({ color: GOLD, size: mobile ? 0.016 : 0.011, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false });
      g.add(new T.Points(dotG, dotM)); disposables.push(dotG, dotM);
      /* atmosphere rim */
      var rimG = new T.SphereGeometry(1.08, 48, 48), rimM = new T.ShaderMaterial({
        uniforms: { uColor: { value: GOLD } }, side: T.BackSide, blending: T.AdditiveBlending, transparent: true, depthWrite: false,
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform vec3 uColor; varying vec3 vN; void main(){ float k = pow(0.68 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(uColor, 1.0) * k * 0.9; }"
      });
      g.add(new T.Mesh(rimG, rimM)); disposables.push(rimG, rimM);
      }
      /* routes from Dhaka: one LineSegments draw call, travelling pulse in the shader */
      var list = o.destinations || DESTINATIONS, origin = list.filter(function (d) { return d.origin; })[0] || DESTINATIONS[0];
      var A = ll(origin.lat, origin.lon, 1.002), segs = [], ts = [], seeds = [], marks = [];
      list.forEach(function (d) {
        if (d === origin) return;
        var B = ll(d.lat, d.lon, 1.002), dist = A.distanceTo(B), M = A.clone().add(B).multiplyScalar(0.5).normalize().multiplyScalar(1 + Math.min(dist * 0.32, 0.42));
        var pts = new T.QuadraticBezierCurve3(A, M, B).getPoints(d.region === "domestic" ? 12 : 64), seed = Math.random();
        for (var k = 0; k < pts.length - 1; k++) { segs.push(pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z); ts.push(k / (pts.length - 1), (k + 1) / (pts.length - 1)); seeds.push(seed, seed); }
        marks.push(B.x, B.y, B.z);
      });
      var arcG = new T.BufferGeometry(); arcG.setAttribute("position", new T.Float32BufferAttribute(segs, 3)); arcG.setAttribute("aT", new T.Float32BufferAttribute(ts, 1)); arcG.setAttribute("aSeed", new T.Float32BufferAttribute(seeds, 1));
      var arcM = new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uDraw: { value: still ? 1 : 0 }, uColor: { value: GOLD } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: "attribute float aT; attribute float aSeed; varying float vT; varying float vS; void main(){ vT = aT; vS = aSeed; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform float uTime; uniform float uDraw; uniform vec3 uColor; varying float vT; varying float vS; void main(){ if (vT > uDraw) discard; float h = fract(uTime * 0.22 + vS); float p = exp(-pow((vT - h) * 11.0, 2.0)); gl_FragColor = vec4(uColor, 0.26 + 0.9 * p); }"
      });
      g.add(new T.LineSegments(arcG, arcM)); disposables.push(arcG, arcM);
      var mkG = new T.BufferGeometry(); mkG.setAttribute("position", new T.Float32BufferAttribute(marks, 3));
      var mkM = new T.PointsMaterial({ color: IVORY, size: 0.03, transparent: true, opacity: 0.9, depthWrite: false });
      g.add(new T.Points(mkG, mkM)); disposables.push(mkG, mkM);
      var orG = new T.BufferGeometry(); orG.setAttribute("position", new T.Float32BufferAttribute([A.x, A.y, A.z], 3));
      var orM = new T.PointsMaterial({ color: GOLD, size: 0.075, transparent: true, depthWrite: false });
      g.add(new T.Points(orG, orM)); disposables.push(orG, orM);
      /* orientation: face a city; sway; pointer drift; eased focus */
      function face(lat, lon, k) { var p = ll(lat, lon); return { y: Math.atan2(-p.x, p.z), x: Math.atan2(p.y, Math.sqrt(p.x * p.x + p.z * p.z)) * (k || 0.8) }; }
      /* o.center {lat, lon}: the point shown at the middle of the disc (overlay alignment) */
      var base = o.center ? face(o.center.lat, o.center.lon, 1) : face(origin.lat, origin.lon), cur = { x: base.x, y: base.y }, target = { x: base.x, y: base.y }, ptr = { x: 0, y: 0 };
      var drift = overlay ? 0.015 : 0.12;
      g.rotation.set(cur.x, cur.y, 0);
      function size() {
        var w = host.clientWidth || 1, h = host.clientHeight || 1, asp = w / h;
        renderer.setSize(w, h, false); cam.aspect = asp;
        if (!o.distance) cam.position.z = 1 / (fill * tanH * Math.min(1, asp));
        cam.updateProjectionMatrix(); if (still) renderer.render(scene, cam);
      }
      var ro = W.ResizeObserver ? new ResizeObserver(size) : null; ro ? ro.observe(host) : W.addEventListener("resize", size); size();
      var onPtr = function (e) { ptr.x = (e.clientX / innerWidth - 0.5); ptr.y = (e.clientY / innerHeight - 0.5); };
      if (!still && fine()) W.addEventListener("pointermove", onPtr, { passive: true });
      var visible = true, running = false, raf = 0, t0 = performance.now(), focused = false;
      function frame(t) {
        raf = 0; var s = (t - t0) / 1000;
        arcM.uniforms.uTime.value = s; arcM.uniforms.uDraw.value = Math.min(1, s / 1.8);
        var sway = focused || overlay ? 0 : Math.sin(s * Math.PI * 2 / 60) * 0.45;
        cur.y += (target.y + sway + ptr.x * drift - cur.y) * 0.045; cur.x += (target.x + ptr.y * drift * 0.66 - cur.x) * 0.045;
        g.rotation.set(cur.x, cur.y, 0); renderer.render(scene, cam); loop();
      }
      function loop() { if (running && visible && D.visibilityState === "visible" && !raf) raf = requestAnimationFrame(frame); }
      var io = W.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; loop(); }) : null; io && io.observe(host);
      var onVis = function () { loop(); }; D.addEventListener("visibilitychange", onVis);
      if (still) renderer.render(scene, cam); else { running = true; loop(); }
      wrap.style.opacity = "0"; animate(wrap, { opacity: [0, 1] }, { duration: DUR.long }).then(function () { wrap.style.opacity = ""; });
      return {
        focus: function (code) {
          var d = list.filter(function (x) { return x.code === code; })[0]; if (!d || overlay) return;
          var f = face(d.lat, d.lon); while (f.y - cur.y > Math.PI) f.y -= 2 * Math.PI; while (cur.y - f.y > Math.PI) f.y += 2 * Math.PI;
          target = f; focused = true; if (still) { g.rotation.set(f.x, f.y, 0); renderer.render(scene, cam); }
        },
        reset: function () { target = { x: base.x, y: base.y }; focused = false; },
        destroy: function () {
          running = false; raf && cancelAnimationFrame(raf); io && io.disconnect(); ro && ro.disconnect();
          W.removeEventListener("pointermove", onPtr); W.removeEventListener("resize", size); D.removeEventListener("visibilitychange", onVis);
          disposables.forEach(function (x) { x.dispose(); }); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
          wrap.remove(); cap && cap.remove();
        }
      };
    }
  };

  /* ---------- Destination grid ---------- */
  var DestinationGrid = {
    data: DESTINATIONS,
    render: function (host, o) {
      o = o || {}; var region = o.region || "all";
      var draw = function () {
        var items = DESTINATIONS.filter(function (d) { return !d.origin && (region === "all" || d.region === region); });
        if (o.limit) items = items.slice(0, o.limit);
        host.innerHTML = items.map(function (d) {
          return '<a class="sf-destination-card" data-sf-tilt href="' + esc(o.href ? o.href(d) : "#sf-enquiry") + '" data-code="' + d.code + '">' +
            '<span class="sf-code">' + esc(d.code) + '</span><p class="sf-eyebrow">' + esc(d.region === "domestic" ? "Domestic" : d.country) + '</p>' +
            '<h3>' + esc(d.city) + '</h3><p>' + esc(d.note || "Request a quote from Dhaka") + '</p></a>';
        }).join("");
        Motion.pointer(host);
        if (!reduced(host)) animate(host.children, { opacity: [0, 1], y: [16, 0] }, { duration: 500, stagger: 40 });
        if (o.onSelect) $$("a", host).forEach(function (a) { a.addEventListener("click", function (e) { o.onSelect(a.getAttribute("data-code"), e); }); });
      };
      draw();
      return { filter: function (r) { region = r; draw(); } };
    }
  };

  /* ---------- Flight quote: 3 steps, validation, human handoff ---------- */
  var FlightQuote = {
    summary: function (q) {
      var L = [
        "New Flight Quotation Request",
        "Customer: " + q.name, "Contact: " + q.phone + (q.email ? " · " + q.email : ""),
        "Trip Type: " + q.trip, "From: " + q.from, "To: " + q.to,
        "Departure: " + q.depart, "Return: " + (q.trip === "Round-trip" ? q.ret : "N/A"),
        "Adults: " + q.adults, "Children: " + q.children, "Infants: " + q.infants,
        "Cabin Class: " + q.cabin, "Preferred Airline: " + (q.airline || "Any"), "Baggage: " + (q.baggage || "Standard"),
        "Additional Requirements: " + (q.notes || "None"), "Enquiry Source: " + (q.source || config.source), "Submission Time: " + q.time
      ];
      return L.join("\n");
    },
    links: function (text) {
      var n = digits(config.phone);
      return { whatsapp: "https://wa.me/" + n + "?text=" + encodeURIComponent(text), call: "tel:+" + n, sms: "sms:+" + n + "?body=" + encodeURIComponent(text.slice(0, 600)), email: "mailto:" + config.email + "?subject=" + encodeURIComponent("Flight quotation request") + "&body=" + encodeURIComponent(text) };
    },
    mount: function (host, o) {
      o = o || {}; var uid = "sfq" + Math.random().toString(36).slice(2, 7), today = new Date().toISOString().slice(0, 10);
      var f = function (id, label, input, cls) { return '<div class="sf-q-field ' + (cls || "") + '"><label for="' + uid + id + '">' + label + '</label>' + input + '<p class="sf-q-error" id="' + uid + id + '-err" role="alert"></p></div>'; };
      var inp = function (id, type, extra) { return '<input id="' + uid + id + '" name="' + id + '" type="' + type + '" aria-describedby="' + uid + id + '-err" ' + (extra || "") + '>'; };
      var stepper = function (id, label, min, val) { return '<div class="sf-q-field"><span class="sf-q-legend" id="' + uid + id + '-l">' + label + '</span><div class="sf-q-stepper" role="group" aria-labelledby="' + uid + id + '-l"><output id="' + uid + id + '" aria-live="polite">' + val + '</output><span><button type="button" data-step="' + id + '" data-d="-1" aria-label="Fewer ' + label + '">−</button> <button type="button" data-step="' + id + '" data-d="1" aria-label="More ' + label + '">+</button></span></div><p class="sf-q-error" id="' + uid + id + '-err" role="alert"></p></div>'; };
      var dl = '<datalist id="' + uid + 'dl">' + DESTINATIONS.map(function (d) { return '<option value="' + esc(destLabel(d)) + '"></option>'; }).join("") + "</datalist>";
      host.classList.add("sf-quote");
      host.innerHTML = '<form novalidate>' + dl +
        '<ol class="sf-q-progress"><li aria-current="step">Route</li><li>Travellers</li><li>Contact</li></ol>' +
        '<div class="sf-q-step" data-step-i="0"><fieldset class="sf-q-segment"><legend class="sf-q-legend">Trip type</legend>' +
          ["One-way", "Round-trip", "Multi-city"].map(function (t, i) { return '<button type="button" class="sf-chip" data-trip="' + t + '" aria-pressed="' + (i === 1) + '">' + t + "</button>"; }).join("") + "</fieldset>" +
          '<div class="sf-q-grid">' + f("from", "From", inp("from", "text", 'list="' + uid + 'dl" autocomplete="off" value="Dhaka (DAC)" required')) +
          f("to", "To", inp("to", "text", 'list="' + uid + 'dl" autocomplete="off" placeholder="City or airport code" required')) +
          f("depart", "Departure date", inp("depart", "date", 'min="' + today + '" required')) +
          f("ret", "Return date", inp("ret", "date", 'min="' + today + '"'), "sf-q-ret") +
          f("legs", "Other legs (multi-city)", '<textarea id="' + uid + 'legs" name="legs" placeholder="e.g. Dubai → London, 12 Dec"></textarea>', "sf-q-full sf-q-legs") + "</div></div>" +
        '<div class="sf-q-step" data-step-i="1" hidden><div class="sf-q-grid">' + stepper("adults", "Adults (12+)", 1, 1) + stepper("children", "Children (2–11)", 0, 0) + stepper("infants", "Infants (under 2)", 0, 0) +
          f("cabin", "Cabin class", '<select id="' + uid + 'cabin" name="cabin"><option>Economy</option><option>Premium Economy</option><option>Business</option><option>First</option></select>') +
          f("airline", "Preferred airline (optional)", inp("airline", "text", 'placeholder="Any"')) +
          f("baggage", "Baggage preference (optional)", '<select id="' + uid + 'baggage" name="baggage"><option value="">Standard allowance</option><option>Extra checked bag</option><option>Cabin bag only</option></select>') + "</div></div>" +
        '<div class="sf-q-step" data-step-i="2" hidden><div class="sf-q-grid">' + f("name", "Full name", inp("name", "text", 'autocomplete="name" required')) +
          f("phone", "WhatsApp number", inp("phone", "tel", 'autocomplete="tel" placeholder="+880 1XXX XXXXXX" required')) +
          f("email", "Email (optional)", inp("email", "email", 'autocomplete="email"')) +
          f("notes", "Additional requirements", '<textarea id="' + uid + 'notes" name="notes" placeholder="Wheelchair, meal, flexible dates…"></textarea>', "sf-q-full") + "</div>" +
          '<p class="sf-q-privacy">We only use these details to prepare your quotation. Please don\'t send passport scans here. A SAFARIA agent will ask for documents securely if needed.</p></div>' +
        '<div class="sf-q-actions"><button type="button" class="sf-button sf-outline" data-back hidden>Back</button><button type="submit" class="sf-button sf-gold" data-sf-magnetic>Continue ' + icon("arrow") + "</button></div></form>" +
        '<div class="sf-q-result" hidden></div>';
      var form = $("form", host), steps = $$(".sf-q-step", host), prog = $$(".sf-q-progress li", host), back = $("[data-back]", host), next = $('[type="submit"]', host), out = $(".sf-q-result", host);
      var state = { step: 0, trip: "Round-trip", adults: 1, children: 0, infants: 0 };
      var el = function (id) { return D.getElementById(uid + id); };
      function tripUI() { $(".sf-q-ret", host).hidden = state.trip !== "Round-trip"; $(".sf-q-legs", host).hidden = state.trip !== "Multi-city"; }
      tripUI();
      $$("[data-trip]", host).forEach(function (b) { b.addEventListener("click", function () { state.trip = b.getAttribute("data-trip"); $$("[data-trip]", host).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); tripUI(); }); });
      $$("[data-step]", host).forEach(function (b) { b.addEventListener("click", function () {
        var k = b.getAttribute("data-step"), v = state[k] + (+b.getAttribute("data-d")), min = k === "adults" ? 1 : 0;
        if (v < min || v > 9) return; if (k === "infants" && v > state.adults) { err("infants", "Each infant must travel with an adult."); return; }
        state[k] = v; el(k).textContent = v; err(k, ""); if (k === "adults") err("infants", "");
        if (k === "adults" && state.infants > v) { state.infants = v; el("infants").textContent = v; }
      }); });
      function err(id, msg) { var e = el(id + "-err") || D.getElementById(uid + id + "-err"); if (e) e.innerHTML = msg ? icon("alert") + "<span>" + esc(msg) + "</span>" : ""; var i = el(id); if (i && i.tagName !== "OUTPUT") i.setAttribute("aria-invalid", msg ? "true" : "false"); return !msg; }
      function val(id) { var i = el(id); return i ? i.value.trim() : ""; }
      function check(s) {
        var ok = true;
        if (s === 0) {
          ok = err("from", val("from") ? "" : "Choose where you're flying from.") & ok;
          ok = err("to", !val("to") ? "Choose a destination." : val("to").toLowerCase() === val("from").toLowerCase() ? "Destination must differ from origin." : "") & ok;
          ok = err("depart", !val("depart") ? "Pick a departure date." : val("depart") < today ? "Date can't be in the past." : "") & ok;
          if (state.trip === "Round-trip") ok = err("ret", !val("ret") ? "Pick a return date." : val("ret") < val("depart") ? "Return must be after departure." : "") & ok; else err("ret", "");
        }
        if (s === 2) {
          ok = err("name", val("name").length < 2 ? "Enter your full name." : "") & ok;
          ok = err("phone", /^\+?[0-9][0-9 ()-]{7,17}$/.test(val("phone")) ? "" : "Enter a WhatsApp number with country code.") & ok;
          ok = err("email", !val("email") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email")) ? "" : "Check the email address.") & ok;
        }
        if (!ok) { var first = $('[aria-invalid="true"]', steps[s]); first && first.focus(); }
        return !!ok;
      }
      function go(n) {
        var cur = steps[state.step], nx = steps[n], dir = n > state.step ? 1 : -1;
        cur.hidden = true; nx.hidden = false; state.step = n;
        prog.forEach(function (li, i) { li.toggleAttribute("aria-current", false); li.classList.toggle("sf-done", i < n); if (i === n) li.setAttribute("aria-current", "step"); });
        back.hidden = n === 0; next.innerHTML = (n === 2 ? "Get my quote " : "Continue ") + icon("arrow");
        animate(nx, { opacity: [0, 1], x: [16 * dir, 0] }, { duration: 420 });
        var fi = $("input, select, textarea, button", nx); fi && fi.focus({ preventScroll: true });
        if (n === 1 && o.onStart) o.onStart();
      }
      back.addEventListener("click", function () { go(state.step - 1); });
      form.addEventListener("submit", function (e) {
        e.preventDefault(); if (!check(state.step)) return;
        if (state.step < 2) { go(state.step + 1); return; }
        var q = { trip: state.trip, from: val("from"), to: val("to") + (state.trip === "Multi-city" && val("legs") ? " + " + val("legs") : ""), depart: val("depart"), ret: val("ret"), adults: state.adults, children: state.children, infants: state.infants, cabin: val("cabin"), airline: val("airline"), baggage: val("baggage"), name: val("name"), phone: val("phone"), email: val("email"), notes: val("notes"), source: o.source || config.source, time: new Date().toLocaleString() };
        var text = FlightQuote.summary(q), L = FlightQuote.links(text);
        var finish = function (sent) {
          form.hidden = true; out.hidden = false;
          out.innerHTML = '<p class="sf-q-done">' + icon("check") + "<span>" + (sent ? "Enquiry received. A SAFARIA agent will contact you with a verified quotation." : "Your enquiry is ready. Send it to a SAFARIA agent:") + "</span></p>" +
            '<pre class="sf-q-summary" tabindex="0">' + esc(text) + "</pre>" +
            '<div class="sf-q-actions"><a class="sf-button sf-gold" href="' + L.whatsapp + '" target="_blank" rel="noopener">' + icon("whatsapp") + " Open in WhatsApp</a>" +
            '<a class="sf-button sf-outline" href="' + L.call + '">' + icon("phone") + " Call</a>" +
            '<a class="sf-button sf-outline" href="' + L.sms + '">' + icon("sms") + " SMS</a>" +
            '<button type="button" class="sf-button sf-outline" data-copy>' + icon("copy") + " Copy</button></div>" +
            '<p class="sf-q-privacy">WhatsApp opens with your details filled in. Press Send there to reach us. This is an enquiry, not a booking.</p>';
          animate(out, { opacity: [0, 1], y: [12, 0] }, { duration: 500 });
          var cp = $("[data-copy]", out);
          cp.addEventListener("click", function () { navigator.clipboard && navigator.clipboard.writeText(text).then(function () { cp.lastChild.textContent = " Copied"; }); });
          $(".sf-q-done", out).setAttribute("tabindex", "-1"); $(".sf-q-done", out).focus();
        };
        if (o.onSubmit) {
          next.disabled = true; next.textContent = "Sending…";
          Promise.resolve().then(function () { return o.onSubmit(q, text); }).then(function () { finish(true); }, function () { finish(false); });
        } else finish(false);
      });
      return { state: state, go: go };
    }
  };

  /* ---------- Price plan toggle ---------- */
  var PricePlan = {
    mount: function (host) {
      var btns = $$(".sf-billing-toggle button", host), cards = $$(".sf-price", host);
      btns.forEach(function (b) { b.addEventListener("click", function () {
        var plan = b.getAttribute("data-plan");
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        cards.forEach(function (c) { var on = c.getAttribute("data-plan") === plan; c.classList.toggle("sf-selected", on); if (on) animate(c, { scale: [0.98, 1] }, { duration: DUR.short, ease: "spring" }); });
      }); });
    }
  };

  /* ---------- Accordion: native <details> with animated height ---------- */
  var Accordion = {
    mount: function (host) {
      $$("details", host).forEach(function (d) {
        var s = $("summary", d), body = $(".sf-answer", d); if (!s || !body) return;
        s.addEventListener("click", function (e) {
          if (reduced(d) || !body.animate) return; e.preventDefault();
          if (d.open) { var h = body.offsetHeight; body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: DUR.short, easing: EASE.inOut[1] }).finished.then(function () { d.open = false; }); }
          else { d.open = true; var h2 = body.offsetHeight; body.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: DUR.medium * 0.6, easing: EASE.out[1] }); }
        });
      });
    }
  };

  /* ---------- Contact dock (mobile) ---------- */
  var ContactDock = {
    render: function (host, o) {
      o = o || {}; var n = digits(config.phone);
      host.classList.add("sf-dock"); host.setAttribute("aria-label", "Contact SAFARIA");
      host.innerHTML = '<a href="https://wa.me/' + n + '" target="_blank" rel="noopener" data-sf-event="whatsapp_click">' + icon("whatsapp") + "WhatsApp</a>" +
        '<a href="tel:+' + n + '" data-sf-event="call_click">' + icon("phone") + "Call</a>" +
        '<a class="sf-gold" href="' + esc(o.quoteHref || "#sf-enquiry") + '" data-sf-event="quote_click">' + icon("plane") + "Get a quote</a>";
      return host;
    }
  };

  /* ---------- analytics hook: dataLayer only, never counts clicks as bookings ---------- */
  function track(root) {
    (root || D).addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-sf-event]"); if (!a) return;
      (W.dataLayer = W.dataLayer || []).push({ event: "safaria_" + a.getAttribute("data-sf-event") });
    });
  }

  W.Safaria = {
    version: "2.0.0",
    config: config,
    use: function (l) { l = l || {}; if (l.anime) libs.anime = l.anime; if (l.motion) libs.motion = l.motion; if (l.THREE) libs.THREE = l.THREE; return libs; },
    configure: function (c) { for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) config[k] = c[k]; return config; },
    icon: icon,
    destinations: DESTINATIONS,
    reduced: reduced,
    track: track,
    Button: { icon: icon },
    SectionHeading: { reveal: function (el) { Motion.reveal(el); } },
    Header: Header,
    Drawer: Drawer,
    HeroGlobe: HeroGlobe,
    ServiceList: { mount: function (el) { el.setAttribute("data-sf-stagger", ""); Motion.reveal(el.parentNode); } },
    DestinationGrid: DestinationGrid,
    FlightQuote: FlightQuote,
    PricePlan: PricePlan,
    Accordion: Accordion,
    ContactDock: ContactDock,
    Footer: {},
    Motion: Motion
  };
})();
