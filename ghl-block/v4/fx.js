/* SAFARIA v4 scroll and motion director.
   Ownership: one rAF-throttled scroll engine writes CSS variables (--hp, --ip, --on, --steps-p, --sv) and drives the
   three.js globes; anime.js 4 plays every entrance (split text, staggered grids, ripples, indicator flips).
   Nothing is hidden by CSS: elements are hidden inline right before an observed reveal, and always restored by a timer.
   Reduced motion: only the static journey layout runs. No libraries: WAAPI fallbacks keep everything visible. */
(function (W) {
  "use strict";
  var D = document, F = {}, X = null;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var EASE = "cubic-bezier(.22,1,.36,1)";

  F.init = function (o) {
    if (X) return; X = o;
    var root = o.root, still = o.still, mobile = o.mobile, S = o.S;
    var q = function (s, r) { return (r || root).querySelector(s); };
    var qa = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
    var fine = W.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var A = function () { var a = o.lib(); return a && a.animate ? a : null; };
    var pending = [];
    var vh = W.innerHeight, sy = W.scrollY || 0;

    /* ---------- animation helpers ---------- */
    function hideEls(els, y) { els.forEach(function (el) { el.style.opacity = "0"; if (y != null) el.style.transform = "translate3d(0," + (typeof y === "string" ? y : y + "px") + ",0)"; }); }
    function restore(els) { els.forEach(function (el) { el.style.opacity = ""; el.style.transform = ""; el.style.willChange = ""; }); }
    /* play(els, {y, scale, rot, dur, gap, delay, grid}) : from hidden to rest */
    function play(els, p) {
      if (!els.length) return;
      var dur = p.dur || 800, gap = p.gap == null ? 40 : p.gap, delay = p.delay || 0, a = A();
      var guard = setTimeout(function () { restore(els); }, delay + dur + gap * els.length + 1600);
      var done = function () { clearTimeout(guard); restore(els); };
      if (a && a.stagger) {
        try {
          var zero = typeof p.y === "string" ? "0%" : 0;
          var params = { opacity: [0, 1], duration: dur, ease: p.ease || "outExpo", onComplete: done };
          if (p.y != null) params.translateY = [p.y, zero];
          if (p.scale) params.scale = [p.scale, 1];
          if (p.rot != null) params.rotate = [p.rot, 0];
          params.delay = gap ? a.stagger(gap, p.grid ? { grid: p.grid, from: p.from || "first", start: delay } : { start: delay }) : delay;
          a.animate(els, params); return;
        } catch (e) { /* fall through to WAAPI */ }
      }
      els.forEach(function (el, i) {
        if (!el.animate) { done(); return; }
        var from = { opacity: 0, transform: "translate3d(0," + (p.y == null ? 0 : typeof p.y === "string" ? p.y : p.y + "px") + ",0)" + (p.scale ? " scale(" + p.scale + ")" : "") + (p.rot ? " rotate(" + p.rot + "deg)" : "") };
        var an = el.animate([from, { opacity: 1, transform: "none" }], { duration: dur, delay: delay + i * gap, easing: EASE, fill: "both" });
        an.onfinish = function () { if (i === els.length - 1) done(); };
      });
    }
    /* onView: IO with a 2.5s fallback for webviews where observers stay silent */
    function onView(el, cb, amount) {
      var fired = false, got = false, go = function () { if (fired) return; fired = true; io && io.disconnect(); cb(); }, io = null;
      pending.push(go);
      if (!W.IntersectionObserver) return go();
      io = new IntersectionObserver(function (es) { got = true; if (es[0].isIntersecting) go(); }, { threshold: amount || 0.2, rootMargin: "0px 0px -6% 0px" });
      io.observe(el); setTimeout(function () { if (!got) go(); }, 2500);
    }

    /* ---------- split text (words or characters), accessibility preserved ---------- */
    function split(el, mode) {
      if (!el || el.querySelector(".sf-w")) return [];
      var label = el.textContent.replace(/\s+/g, " ").trim(); if (!label) return [];
      var segm = mode === "chars" && W.Intl && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
      var tw = D.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n, units = [];
      while ((n = tw.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
      nodes.forEach(function (tn) {
        var frag = D.createDocumentFragment();
        tn.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(D.createTextNode(" ")); return; }
          var w = D.createElement("span"), wi = D.createElement("span"); w.className = "sf-w"; wi.className = "sf-wi"; w.setAttribute("aria-hidden", "true");
          if (mode === "chars" && segm) {
            Array.from(segm.segment(part)).forEach(function (g) { var c = D.createElement("span"); c.className = "sf-c"; c.textContent = g.segment; wi.appendChild(c); units.push(c); });
          } else { wi.textContent = part; units.push(wi); }
          w.appendChild(wi); frag.appendChild(w);
        });
        tn.parentNode.replaceChild(frag, tn);
      });
      el.setAttribute("aria-label", label); el.__fx = mode;
      return units;
    }

    if (still) { setupJourney(); return; }

    /* ---------- hero headline: characters (words in Bengali) ---------- */
    F.heroLines = function () {
      var lines = qa(".sf-hero h1 .sf-line"), mode = o.lang() === "bn" ? "words" : "chars", t = 0;
      lines.forEach(function (ln) {
        var u = split(ln, mode); if (!u.length) return;
        hideEls(u, "115%"); play(u, { y: "115%", rot: 7, dur: 1000, gap: mode === "chars" ? 22 : 90, delay: 120 + t });
        t += mode === "chars" ? 260 : 220;
      });
    };

    /* ---------- section headings: word mask reveal; lead copy: scroll-scrubbed words ---------- */
    var scrubs = [];
    function prepText(quiet) {
      qa(".sf-section h2:not(.sf-quote *)").forEach(function (h) {
        var u = split(h, "words"); if (!u.length) return;
        if (quiet) return;
        hideEls(u, "112%"); onView(h, function () { play(u, { y: "112%", dur: 900, gap: 45 }); }, 0.35);
      });
      scrubs = [];
      qa(".sf-heading .sf-lead, .sf-journey-lead").forEach(function (p) {
        var u = split(p, "words"); if (!u.length) u = qa(".sf-wi", p);
        u.forEach(function (w) { w.parentNode.classList.add("sf-sw"); });
        scrubs.push({ el: p, words: u.map(function (w) { return w.parentNode; }), seen: false });
      });
    }
    prepText(false);

    /* ---------- cards: grid-staggered entrance, pointer spotlight, ripples ---------- */
    F.cards = function (grid) {
      var kids = Array.prototype.slice.call(grid.children); if (!kids.length) return;
      var cols = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").length), rows = Math.ceil(kids.length / cols);
      hideEls(kids, 34); onView(grid, function () { play(kids, { y: 34, scale: 0.92, dur: 800, gap: 55, grid: [cols, rows], from: "first" }); }, 0.1);
    };
    if (fine && !mobile) {
      var SPOT = ".sf-destination-card, .sf-why-grid article, .sf-card, .sf-steps li, .sf-contact-list a, .sf-trial, .sf-journey-stops li";
      root.addEventListener("pointermove", function (e) {
        var c = e.target.closest && e.target.closest(SPOT); if (!c) return;
        var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px"); c.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      }, { passive: true });
    }
    root.addEventListener("pointerdown", function (e) {
      var b = e.target.closest && e.target.closest(".sf-button, .sf-mini, .sf-chip"); if (!b || b.disabled) return;
      var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = D.createElement("span");
      s.className = "sf-ripple"; s.setAttribute("aria-hidden", "true");
      s.style.cssText = "left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px;width:" + d + "px;height:" + d + "px";
      b.appendChild(s); var kill = function () { s.remove(); }, a = A();
      if (a) { try { a.animate(s, { scale: [0, 1], opacity: [0.35, 0], duration: 650, ease: "outQuart", onComplete: kill }); setTimeout(kill, 1200); return; } catch (x) { /* WAAPI */ } }
      if (s.animate) s.animate([{ transform: "scale(0)", opacity: 0.35 }, { transform: "scale(1)", opacity: 0 }], { duration: 650, easing: EASE }).onfinish = kill; else kill();
    }, { passive: true });
    qa(".sf-button.sf-gold").forEach(function (b) { if (fine && !b.hasAttribute("data-sf-magnetic")) b.setAttribute("data-sf-magnetic", ""); });
    if (S.Motion && S.Motion.pointer) S.Motion.pointer(root);

    /* ---------- decorative layers: orbs, image parallax, marquee ---------- */
    qa(".sf-vibe, .sf-enquiry, .sf-corporate, .sf-agency, .sf-why").forEach(function (sec, i) {
      sec.classList.add("sf-orbhost");
      ["a", "b"].forEach(function (k, j) { var orb = D.createElement("i"); orb.className = "sf-orb sf-orb-" + k; orb.setAttribute("aria-hidden", "true"); orb.setAttribute("data-fx-p", String(j ? -1.4 : 1)); sec.insertBefore(orb, sec.firstChild); });
    });
    qa("[data-sf-wipe] img").forEach(function (im) { im.setAttribute("data-fx-p", "1"); im.classList.add("sf-par"); });
    var disc = q("#sf-destinations");
    if (disc && !q(".sf-marquee")) {
      var names = o.DEST.filter(function (d) { return !d.origin; }).map(function (d) { return d.city; }), one = names.map(function (n) { return "<span>" + n.replace(/[<&]/g, "") + "</span><i>✦</i>"; }).join("");
      var mq = D.createElement("div"); mq.className = "sf-marquee"; mq.setAttribute("aria-hidden", "true");
      mq.innerHTML = '<div class="sf-marquee-skew"><div class="sf-marquee-track">' + one + one + "</div></div>";
      disc.parentNode.insertBefore(mq, disc);
    }

    /* ---------- cursor glow (fine pointers) ---------- */
    if (fine && !mobile) {
      var cur = D.createElement("div"); cur.className = "sf-cursor"; cur.setAttribute("aria-hidden", "true"); root.appendChild(cur);
      var cx = 0, cy = 0, tx = 0, ty = 0, run = false, shown = false;
      var loop = function () { cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; cur.style.transform = "translate3d(" + (cx - 200).toFixed(1) + "px," + (cy - 200).toFixed(1) + "px,0)"; if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4) requestAnimationFrame(loop); else run = false; };
      W.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return; tx = e.clientX; ty = e.clientY;
        var onDay = e.target.closest && e.target.closest('[data-theme="day"], input, select, textarea'); cur.style.opacity = onDay ? "0" : "1";
        if (!shown) { shown = true; cx = tx; cy = ty; }
        if (!run) { run = true; requestAnimationFrame(loop); }
      }, { passive: true });
      D.documentElement.addEventListener("pointerleave", function () { cur.style.opacity = "0"; });
    }

    /* ---------- section rail (wide screens) ---------- */
    var RAIL = ["sf-home", "sf-destinations", "sf-journey", "sf-services", "sf-corporate", "sf-agency", "sf-enquiry", "sf-contact"], rail = null, railLinks = [];
    if (fine && W.innerWidth >= 1200) {
      rail = D.createElement("nav"); rail.className = "sf-rail"; rail.setAttribute("aria-label", "Sections");
      RAIL.forEach(function (id) { if (!D.getElementById(id)) return; var a = D.createElement("a"); a.href = "#" + id; a.setAttribute("data-r", id); a.innerHTML = "<span></span><i></i>"; rail.appendChild(a); railLinks.push(a); });
      root.appendChild(rail);
    }
    function railLabels() {
      railLinks.forEach(function (a) {
        var s = D.getElementById(a.getAttribute("data-r")), h = s && (s.querySelector("h1, h2") || s.querySelector("strong"));
        var txt = h ? (h.getAttribute("aria-label") || h.textContent).replace(/\s+/g, " ").trim().slice(0, 42) : a.getAttribute("data-r");
        a.setAttribute("aria-label", txt); a.firstChild.textContent = txt;
      });
    }
    railLabels();

    /* ---------- journey (shared with the reduced-motion path) ---------- */
    var J = setupJourney();

    /* ---------- the single scroll engine ---------- */
    var hero = q(".sf-hero"), steps = q("#sf-steps"), stepLis = steps ? qa("li", steps) : [], par = [], parSet = [], mqEl = q(".sf-marquee"), lastY = sy, vel = 0, queued = false, quiet = 0;
    var watch = function (list, set) { if (!W.IntersectionObserver) { list.forEach(function (e) { set.push(e); }); return; } var io = new IntersectionObserver(function (es) { es.forEach(function (en) { var i = set.indexOf(en.target); if (en.isIntersecting && i < 0) set.push(en.target); else if (!en.isIntersecting && i >= 0) set.splice(i, 1); }); tick(); }, { rootMargin: "30% 0px" }); list.forEach(function (e) { io.observe(e); }); };
    par = qa("[data-fx-p]"); watch(par, parSet);
    var scrubIn = []; watch(scrubs.map(function (s) { return s.el; }), scrubIn);
    function setVar(el, k, v) { var key = "__" + k; if (el[key] !== v) { el[key] = v; el.style.setProperty(k, v); } }
    function tick() {
      queued = false; sy = W.scrollY || W.pageYOffset || 0; vh = W.innerHeight;
      var dv = sy - lastY; lastY = sy; vel += (clamp(dv / 60, -1, 1) - vel) * 0.25;
      /* hero */
      if (hero) {
        var hh = hero.offsetHeight || vh, hp = clamp(sy / (hh * 0.95), 0, 1);
        if (sy < hh * 1.4) { setVar(hero, "--hp", hp.toFixed(3)); if (o.heroGlobe()) o.heroGlobe().setScroll(hp); }
      }
      /* parallax */
      parSet.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-fx-p")) || 1, ip = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1) * k;
        setVar(el, "--ip", ip.toFixed(3));
      });
      /* scrub words */
      scrubs.forEach(function (s) {
        if (scrubIn.indexOf(s.el) < 0 && s.seen) return;
        var r = s.el.getBoundingClientRect(), p = clamp((vh * 0.92 - r.top) / (vh * 0.42 + r.height * 0.5), 0, 1), n = s.words.length; s.seen = p >= 1;
        for (var i = 0; i < n; i++) { var on = clamp(p * (n + 4) - i, 0, 1).toFixed(2); setVar(s.words[i], "--on", on); }
      });
      /* steps */
      if (steps) {
        var sr = steps.getBoundingClientRect(), sp = clamp((vh * 0.78 - sr.top) / Math.max(1, sr.height + vh * 0.1), 0, 1);
        setVar(steps, "--steps-p", sp.toFixed(3)); stepLis.forEach(function (li, i) { li.classList.toggle("sf-on", sp > i / stepLis.length + 0.02); });
      }
      /* marquee skew from scroll velocity */
      if (mqEl) setVar(mqEl, "--sv", vel.toFixed(3));
      /* journey */
      J && J.tick();
      /* rail */
      if (rail) {
        var act = null, vis = sy > vh * 0.5; rail.classList.toggle("sf-on", vis);
        railLinks.forEach(function (a) { var s = D.getElementById(a.getAttribute("data-r")); if (s && s.getBoundingClientRect().top <= vh * 0.5) act = a; });
        railLinks.forEach(function (a) { if (a === act) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      }
      if (Math.abs(vel) > 0.01) { queued = true; requestAnimationFrame(function () { vel *= 0.9; tick(); }); } else if (vel !== 0) { vel = 0; if (mqEl) setVar(mqEl, "--sv", "0"); }
    }
    var req = function () { if (!queued) { queued = true; requestAnimationFrame(tick); } };
    W.addEventListener("scroll", req, { passive: true }); W.addEventListener("resize", function () { vh = W.innerHeight; req(); });
    tick();
    /* nothing may stay hidden if observers never fire */
    setTimeout(function () { pending.forEach(function (g) { try { g(); } catch (e) { /* noop */ } }); }, 7000);

    F.refresh = function () {
      prepText(true); railLabels(); scrubIn.length = 0; watch(scrubs.map(function (s) { return s.el; }), scrubIn);
      J && J.lang(); req();
    };
  };

  /* ---------- journey: scroll-scrubbed route story on its own globe ---------- */
  function setupJourney() {
    var o = X, root = o.root, q = function (s, r) { return (r || root).querySelector(s); }, qa = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
    var sec = q("#sf-journey"), track = q("#sf-journey-track"), host = q("#sf-journey-globe"); if (!sec || !track || !host) return null;
    var lis = qa("#sf-journey-stops li"), n = lis.length, meter = q(".sf-journey-meter i"), to = q("#sf-journey-to"), cta = q("#sf-journey-cta");
    var J = { globe: null, idx: -1, mounting: false }, still = o.still;
    function setStop(i) {
      if (i === J.idx) return; J.idx = i; var code = lis[i].getAttribute("data-stop");
      lis.forEach(function (li, k) { li.setAttribute("data-state", k === i ? "on" : k < i ? "done" : "next"); if (k === i) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      if (to) {
        to.textContent = code; var a = o.lib();
        if (!still) { if (a && a.animate) { try { a.animate(to, { translateY: ["60%", "0%"], opacity: [0, 1], duration: 600, ease: "outExpo" }); } catch (e) { /* skip */ } } else if (to.animate) to.animate([{ opacity: 0, transform: "translateY(60%)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: EASE }); }
      }
      cta.setAttribute("data-code", code); J.globe && J.globe.select(code);
    }
    J.tick = function () {
      if (still) return;
      var r = track.getBoundingClientRect(), total = r.height - W.innerHeight, p = total > 0 ? clamp(-r.top / total, 0, 1) : 0, f = p * n, i = Math.min(n - 1, Math.floor(f));
      if (meter) meter.style.transform = "scaleX(" + p.toFixed(3) + ")";
      setStop(i); J.globe && J.globe.scrub(clamp(f - i, 0.02, 0.98));
    };
    J.lang = function () { var c = lis[Math.max(0, J.idx)]; if (to && c) to.textContent = c.getAttribute("data-stop"); };
    cta.addEventListener("click", function () { var c = cta.getAttribute("data-code") || lis[0].getAttribute("data-stop"); o.quoteFor(c); });
    lis.forEach(function (li, i) {
      li.addEventListener("click", function () {
        if (still) return; var r = track.getBoundingClientRect(), total = r.height - W.innerHeight, y = W.scrollY + r.top + total * ((i + 0.5) / n);
        W.scrollTo({ top: y, behavior: "smooth" });
      });
    });
    if (still) { lis.forEach(function (li) { li.setAttribute("data-state", "on"); }); }
    else setStop(0);
    /* globe: mounted once three.js is ready and the section is near the viewport */
    function mount() {
      if (J.globe || J.mounting || !o.mk) return; J.mounting = true;
      var g = o.mk(host, { points: o.mobile ? 11000 : 20000, stars: true });
      J.mounting = false; if (!g) { root.classList.add("sf-jnogl"); return; }
      J.globe = g; root.classList.add("sf-j3d"); g.zoom(o.mobile ? 1.02 : 1.12);
      g.select(lis[Math.max(0, J.idx)].getAttribute("data-stop"));
      if (host.animate && !still) host.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 1000, easing: EASE });
    }
    J.three = function () {
      if (!W.IntersectionObserver) return mount();
      var got = false, io = new IntersectionObserver(function (es) { got = true; if (es[0].isIntersecting) { io.disconnect(); mount(); } }, { rootMargin: "120% 0px" });
      io.observe(sec); setTimeout(function () { if (!got) { io.disconnect(); mount(); } }, 3000);
    };
    J.destroy = function () { J.globe && J.globe.destroy(); J.globe = null; };
    F.journey = J; return J;
  }

  F.three = function () { F.journey && F.journey.three(); };
  F.destroy = function () { F.journey && F.journey.destroy(); };
  F.refresh = F.refresh || function () {};
  F.heroLines = F.heroLines || function () {};
  F.cards = F.cards || null;
  W.SafariaFX = F;
})(window);
