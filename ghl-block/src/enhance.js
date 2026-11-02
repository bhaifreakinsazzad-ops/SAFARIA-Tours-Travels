/* SAFARIA v2 enhancer for the live GHL page (#safaria-site 3.2.x).
   It only adds behaviour to elements that already exist. It never moves or rewrites the
   site's markup, and every step is optional and wrapped in try/catch. */
(function () {
  "use strict";
  var W = window, D = document;
  if (W.__safariaV2) return; W.__safariaV2 = true;

  var CFG = Object.assign({
    phone: "+8801674178437",      // OPEN ITEM: the live site uses +8801641178437. Confirm before publishing.
    globe: true,                  // replace the 2D #sf-globe canvas with the three.js globe (desktop/tablet only)
    reveal: true,                 // scroll reveals on headings, lists, steps, prices
    pointer: true,                // magnetic hero CTA + destination card tilt (fine pointers only)
    dock: false,                  // mobile contact dock (turn on only if the page has no bottom bar of its own)
    quoteMount: null,             // CSS selector to mount the 3-step flight quote into, e.g. "#sf-quote-v2"
    onQuoteSubmit: null,          // function(q, text) → Promise: post to your GHL form/webhook; resolve only on success
    cdn: {
      anime: "https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm",
      motion: "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm",
      three: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    }
  }, W.SAFARIA_CONFIG || {});

  var t0 = performance.now();
  function safe(name, fn) { try { return fn(); } catch (e) { if (W.console) console.warn("[SAFARIA v2] " + name + " skipped:", e); } }
  function belowFold(el) { var r = el.getBoundingClientRect(); return r.top > innerHeight * 0.9; }
  function tag(sel, attr, root, onlyBelow) { Array.prototype.forEach.call(root.querySelectorAll(sel), function (el) { if (!el.hasAttribute(attr) && (!onlyBelow || belowFold(el))) el.setAttribute(attr, el.getAttribute(attr) || ""); }); }
  function imp(url) { return import(url).catch(function () { return null; }); }
  function idle(fn) { (W.requestIdleCallback || function (f) { return setTimeout(f, 200); })(fn, { timeout: 2000 }); }

  function ready(cb) {
    var root = D.getElementById("safaria-site");
    if (root && root.getAttribute("data-initialized") === "true") return cb(root);
    var done = false, finish = function () { if (done) return; done = true; mo && mo.disconnect(); var r = D.getElementById("safaria-site"); r && cb(r); };
    var mo = W.MutationObserver ? new MutationObserver(function () { var r = D.getElementById("safaria-site"); if (r && r.getAttribute("data-initialized") === "true") finish(); }) : null;
    mo && mo.observe(D.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-initialized"] });
    setTimeout(finish, 4000);
  }

  ready(function (root) {
    var S = W.Safaria; if (!S) return;
    S.configure({ phone: CFG.phone, source: "ghl-safaria-website" });
    var still = S.reduced(root);
    var mobile = W.matchMedia("(max-width: 767px)").matches;

    Promise.all([still ? null : imp(CFG.cdn.anime), still ? null : imp(CFG.cdn.motion)]).then(function (m) {
      S.use({ anime: m[0], motion: m[1] });

      /* 1. Hero entrance: only if we're early enough that it won't flash already-visible content */
      safe("hero", function () {
        if (still || performance.now() - t0 > 900 || W.scrollY > 40) return;
        var hero = root.querySelector(".sf-hero"); if (!hero) return;
        S.Motion.hero(hero, { art: ".sf-hero-art", lines: "#sf-hero-title", lead: ".sf-hero-copy .sf-lead", ctas: ".sf-hero-copy .sf-button", chips: ".sf-hero-bottom" });
      });

      /* 2. Scroll reveals: below the fold only, never inside forms or dialogs */
      safe("reveal", function () {
        if (!CFG.reveal || still) return;
        tag(".sf-section .sf-eyebrow, .sf-section h2, .sf-section .sf-lead", "data-sf-reveal", root, true);
        tag(".sf-service-list, .sf-why-grid, .sf-steps, .sf-prices, .sf-planning-grid", "data-sf-stagger", root, true);
        tag(".sf-service-image, .sf-agency-art", "data-sf-wipe", root, true);
        Array.prototype.forEach.call(root.querySelectorAll("form [data-sf-reveal], form [data-sf-stagger], dialog [data-sf-reveal]"), function (el) { el.removeAttribute("data-sf-reveal"); el.removeAttribute("data-sf-stagger"); });
        root.querySelectorAll(".sf-lagoon").forEach(function (el) { el.setAttribute("data-sf-depth", "0.05"); });
        S.Motion.reveal(root); S.Motion.parallax(root);
      });

      /* 3. Pointer polish */
      safe("pointer", function () {
        if (!CFG.pointer || still) return;
        var cta = root.querySelector(".sf-hero-copy .sf-gold"); cta && cta.setAttribute("data-sf-magnetic", "");
        root.querySelectorAll(".sf-destination-card").forEach(function (c) { if (getComputedStyle(c).transform === "none") c.setAttribute("data-sf-tilt", ""); });
        S.Motion.pointer(root);
      });

      /* 4. three.js globe ("image to code"): a live globe laid exactly over the globe painted in the
            hero art. Lazy, desktop/tablet only, and the 2D canvas is hidden only once WebGL actually runs. */
      safe("globe", function () {
        var hero = root.querySelector(".sf-hero"), art = hero && hero.querySelector(".sf-hero-art");
        if (!CFG.globe || still || mobile || !art || !S.HeroGlobe.supported()) return;
        var GLOBE = { cx: 1080, cy: 418, r: 404, w: 1536, h: 1024 }, FILL = 0.8;   // measured in hero-globe-dhaka.webp
        var host = D.createElement("div");
        host.className = "sf-globe-host";
        host.style.cssText = "position:absolute;pointer-events:none;z-index:1";
        function place() {
          var nw = art.naturalWidth || GLOBE.w, nh = art.naturalHeight || GLOBE.h, w = art.clientWidth, h = art.clientHeight, cs = getComputedStyle(art);
          var s = cs.objectFit === "cover" ? Math.max(w / nw, h / nh) : Math.min(w / nw, h / nh);
          var op = cs.objectPosition.split(" ").map(function (v) { return parseFloat(v) / 100; });
          var x0 = art.offsetLeft + (w - nw * s) * (isNaN(op[0]) ? 0.5 : op[0]), y0 = art.offsetTop + (h - nh * s) * (isNaN(op[1]) ? 0.5 : op[1]);
          var k = nw / GLOBE.w, R = GLOBE.r * k * s, side = 2 * R / FILL;
          host.style.left = (x0 + GLOBE.cx * k * s - side / 2) + "px"; host.style.top = (y0 + GLOBE.cy * k * s - side / 2) + "px";
          host.style.width = host.style.height = side + "px";
        }
        idle(function () {
          imp(CFG.cdn.three).then(function (THREE) {
            if (!THREE) return;
            S.use({ THREE: THREE });
            art.parentNode.insertBefore(host, art.nextSibling); place();
            // overlay: the painted Earth stays; three.js adds live route pulses aligned to its geography
            var g = S.HeroGlobe.mount(host, { fill: FILL, overlay: true, center: { lat: 14.4, lon: 86.7 } });
            if (!g) { host.remove(); return; }
            if (W.ResizeObserver) new ResizeObserver(place).observe(hero); else W.addEventListener("resize", place);
            var old = root.querySelector("#sf-globe"); if (old) old.style.visibility = "hidden";
            W.SafariaGlobe = g;
            root.addEventListener("click", function (e) {
              var card = e.target.closest && e.target.closest(".sf-destination-card"); if (!card) return;
              var h = card.querySelector("h3"), name = h ? h.textContent.trim().toLowerCase() : "";
              var d = S.destinations.filter(function (x) { return name.indexOf(x.city.toLowerCase()) === 0; })[0];
              d && g.focus(d.code);
            });
          });
        });
      });
    });

    /* 5. Optional components */
    safe("dock", function () {
      if (!CFG.dock || root.querySelector(".sf-dock")) return;
      var n = D.createElement("nav"); root.appendChild(n); S.ContactDock.render(n, { quoteHref: "#sf-enquiry" });
    });
    safe("quote", function () {
      var host = CFG.quoteMount && D.querySelector(CFG.quoteMount); if (!host) return;
      S.FlightQuote.mount(host, { source: "ghl-flight-quote-v2", onSubmit: CFG.onQuoteSubmit || undefined, onStart: function () { (W.dataLayer = W.dataLayer || []).push({ event: "safaria_flight_form_started" }); } });
    });

    /* 6. Analytics hooks on existing contact links (dataLayer only) */
    safe("track", function () {
      root.querySelectorAll('a[href*="wa.me"]').forEach(function (a) { a.hasAttribute("data-sf-event") || a.setAttribute("data-sf-event", "whatsapp_click"); });
      root.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.hasAttribute("data-sf-event") || a.setAttribute("data-sf-event", "call_click"); });
      S.track(root);
    });
  });
})();
