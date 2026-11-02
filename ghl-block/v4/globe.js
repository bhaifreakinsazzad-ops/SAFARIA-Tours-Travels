/* SAFARIA v4 globe: one three.js renderer, lazy, interactive.
   Earth is points on a sphere (one draw call), routes are one LineSegments buffer with a shader pulse,
   the plane is a tiny mesh on the selected route. Routes are ILLUSTRATIVE, never flight schedules.
   Ownership: three.js owns the canvas only; DOM labels are driven by the app (anime.js). */
(function (W) {
  "use strict";
  var D = document;
  function ll(T, lat, lon, r) { var p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180; r = r || 1; return new T.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)); }
  function face(T, lat, lon) { var p = ll(T, lat, lon); return { y: Math.atan2(-p.x, p.z), x: Math.atan2(p.y, Math.sqrt(p.x * p.x + p.z * p.z)) * 0.85 }; }

  function supported() { try { var c = D.createElement("canvas"); return !!(W.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } }

  function mount(host, T, o) {
    o = o || {};
    if (!T || !supported()) return null;
    if (navigator.connection && navigator.connection.saveData) return null;
    var still = !!o.still, list = o.destinations, origin = list.filter(function (d) { return d.origin; })[0] || list[0];
    var mobile = W.matchMedia("(max-width: 767px)").matches;
    var low = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
    var cs = getComputedStyle(host), cv = function (n, d) { var v = cs.getPropertyValue(n).trim(); return /^#|^rgb/.test(v) ? v : d; };
    var GOLD = new T.Color(cv("--gold", "#d6b779")), IVORY = new T.Color(cv("--ivory", "#f8f5ec")), CORE = new T.Color(cv("--surface-100", "#062b27")), EMER = new T.Color("#0a5a45");
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: "low-power" }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, mobile || low ? 1 : 1.5));
    var cv2 = renderer.domElement; cv2.className = "sf-globe-canvas"; cv2.setAttribute("aria-hidden", "true"); host.insertBefore(cv2, host.firstChild);
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, 0.1, 100), tanH = Math.tan(17.5 * Math.PI / 180), fill = 0.9;
    var g = new T.Group(); scene.add(g);
    var disp = [];
    var add = function (m, geo, mat) { g.add(m); disp.push(geo, mat); return m; };

    /* Earth core + dotted shell + atmosphere */
    var coreG = new T.SphereGeometry(0.985, 48, 48), coreM = new T.MeshBasicMaterial({ color: CORE });
    add(new T.Mesh(coreG, coreM), coreG, coreM);
    /* round soft dot sprite shared by every point layer */
    var sc = D.createElement("canvas"); sc.width = sc.height = 32; var sx = sc.getContext("2d"), gr = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.55, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); sx.fillStyle = gr; sx.fillRect(0, 0, 32, 32);
    var sprite = new T.CanvasTexture(sc); disp.push(sprite);
    /* dotted Earth: Fibonacci points; those over land (1-degree mask) are bright, ocean is faint */
    var landBits = null;
    if (o.land) { try { var bin = atob(o.land); landBits = new Uint8Array(bin.length); for (var b = 0; b < bin.length; b++) landBits[b] = bin.charCodeAt(b); } catch (e) { landBits = null; } }
    function isLand(py, px, pz) {
      var phi = Math.acos(Math.max(-1, Math.min(1, py))), th = Math.atan2(pz, -px); if (th < 0) th += 2 * Math.PI;
      var lat = 90 - phi * 180 / Math.PI, lon = th * 180 / Math.PI - 180, x = Math.min(359, Math.max(0, Math.floor(lon + 180))), y = Math.min(179, Math.max(0, Math.floor(90 - lat))), i = y * 360 + x;
      return (landBits[i >> 3] >> (i & 7)) & 1;
    }
    var N = o.points || (low ? 14000 : (mobile ? 18000 : 30000)), lp = [], op = [];
    for (var i = 0; i < N; i++) {
      var y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963, px = Math.cos(th) * r, pz = Math.sin(th) * r;
      if (landBits ? isLand(y, px, pz) : true) lp.push(px, y, pz); else if (i % 7 === 0) op.push(px, y, pz);
    }
    var dotG = new T.BufferGeometry(); dotG.setAttribute("position", new T.Float32BufferAttribute(lp, 3));
    var dotM = new T.PointsMaterial({ color: GOLD, size: mobile ? 0.026 : 0.0165, map: sprite, alphaTest: 0.05, transparent: true, opacity: 0.95, depthWrite: false });
    add(new T.Points(dotG, dotM), dotG, dotM);
    if (op.length) {
      var seaG = new T.BufferGeometry(); seaG.setAttribute("position", new T.Float32BufferAttribute(op, 3));
      var seaM = new T.PointsMaterial({ color: IVORY, size: mobile ? 0.014 : 0.009, map: sprite, alphaTest: 0.05, transparent: true, opacity: 0.12, depthWrite: false });
      add(new T.Points(seaG, seaM), seaG, seaM);
    }
    var rimG = new T.SphereGeometry(1.1, 48, 48), rimM = new T.ShaderMaterial({
      uniforms: { uColor: { value: GOLD } }, side: T.BackSide, blending: T.AdditiveBlending, transparent: true, depthWrite: false,
      vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 uColor; varying vec3 vN; void main(){ float k = pow(0.7 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(uColor, 1.0) * k * 0.85; }"
    });
    add(new T.Mesh(rimG, rimM), rimG, rimM);
    /* soft emerald inner glow */
    var glowG = new T.SphereGeometry(0.99, 32, 32), glowM = new T.ShaderMaterial({
      uniforms: { uColor: { value: EMER } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 uColor; varying vec3 vN; void main(){ float k = pow(1.0 - abs(dot(vN, vec3(0.0,0.0,1.0))), 2.2); gl_FragColor = vec4(uColor, 1.0) * k * 0.7; }"
    });
    add(new T.Mesh(glowG, glowM), glowG, glowM);

    /* Routes: one buffer; aId lets the shader highlight the selected one */
    var A = ll(T, origin.lat, origin.lon, 1.002), segs = [], ts = [], seeds = [], ids = [], marks = [], mIdx = [], curves = {};
    list.forEach(function (d, ix) {
      if (d === origin) return;
      var B = ll(T, d.lat, d.lon, 1.002), dist = A.distanceTo(B), M = A.clone().add(B).multiplyScalar(0.5).normalize().multiplyScalar(1 + Math.min(dist * 0.32, 0.42));
      var cu = new T.QuadraticBezierCurve3(A, M, B); curves[d.code] = cu;
      var pts = cu.getPoints(d.region === "domestic" ? 12 : 64), seed = Math.random();
      for (var k = 0; k < pts.length - 1; k++) { segs.push(pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z); ts.push(k / (pts.length - 1), (k + 1) / (pts.length - 1)); seeds.push(seed, seed); ids.push(ix, ix); }
      marks.push(B.x, B.y, B.z); mIdx.push(d.code);
    });
    var arcG = new T.BufferGeometry(); arcG.setAttribute("position", new T.Float32BufferAttribute(segs, 3)); arcG.setAttribute("aT", new T.Float32BufferAttribute(ts, 1)); arcG.setAttribute("aSeed", new T.Float32BufferAttribute(seeds, 1)); arcG.setAttribute("aId", new T.Float32BufferAttribute(ids, 1));
    var arcM = new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uDraw: { value: still ? 1 : 0 }, uColor: { value: GOLD }, uSel: { value: -1 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: "attribute float aT; attribute float aSeed; attribute float aId; varying float vT; varying float vS; varying float vI; void main(){ vT = aT; vS = aSeed; vI = aId; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform float uTime; uniform float uDraw; uniform float uSel; uniform vec3 uColor; varying float vT; varying float vS; varying float vI; void main(){ if (vT > uDraw) discard; float h = fract(uTime * 0.22 + vS); float p = exp(-pow((vT - h) * 11.0, 2.0)); float on = uSel < 0.0 ? 1.0 : (abs(vI - uSel) < 0.5 ? 1.0 : 0.0); float base = uSel < 0.0 ? 0.26 : (on > 0.5 ? 0.85 : 0.08); gl_FragColor = vec4(uColor, base + (on > 0.5 ? 0.9 : 0.25) * p); }"
    });
    add(new T.LineSegments(arcG, arcM), arcG, arcM);
    var mkG = new T.BufferGeometry(); mkG.setAttribute("position", new T.Float32BufferAttribute(marks, 3));
    var mkM = new T.PointsMaterial({ color: IVORY, size: mobile ? 0.07 : 0.05, map: sprite, alphaTest: 0.05, transparent: true, opacity: 1, depthWrite: false });
    add(new T.Points(mkG, mkM), mkG, mkM);
    var orG = new T.BufferGeometry(); orG.setAttribute("position", new T.Float32BufferAttribute([A.x, A.y, A.z], 3));
    var orM = new T.PointsMaterial({ color: GOLD, size: 0.12, map: sprite, alphaTest: 0.05, transparent: true, depthWrite: false });
    add(new T.Points(orG, orM), orG, orM);

    /* Selected-city ring + plane (shared, moved on select) */
    var ringG = new T.RingGeometry(0.02, 0.028, 40), ringM = new T.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false });
    var ring = new T.Mesh(ringG, ringM); ring.visible = false; g.add(ring); disp.push(ringG, ringM);
    var pv = new Float32Array([0, 0, 0.05, -0.028, 0, -0.03, 0, 0.006, -0.012, 0.028, 0, -0.03, 0, 0, 0.05, 0, 0.006, -0.012, 0, 0.006, -0.012, 0.028, 0, -0.03, 0, 0, -0.022]);
    var plG = new T.BufferGeometry(); plG.setAttribute("position", new T.BufferAttribute(pv, 3)); plG.computeVertexNormals();
    var plM = new T.MeshBasicMaterial({ color: IVORY, side: T.DoubleSide });
    var plane = new T.Mesh(plG, plM); plane.visible = false; plane.scale.setScalar(1.5); g.add(plane); disp.push(plG, plM);

    /* distant stars: one Points draw call, parallaxes with scroll */
    var stars = null;
    if (o.stars !== false) {
      var sp = [], SN = mobile || low ? 260 : 700;
      for (var si = 0; si < SN; si++) { var u = Math.random() * 2 - 1, a = Math.random() * 6.2832, rr = Math.sqrt(1 - u * u), d = 3 + Math.random() * 3; sp.push(Math.cos(a) * rr * d, u * d, Math.sin(a) * rr * d); }
      var stG = new T.BufferGeometry(); stG.setAttribute("position", new T.Float32BufferAttribute(sp, 3));
      var stM = new T.PointsMaterial({ color: IVORY, size: mobile ? 0.05 : 0.032, map: sprite, alphaTest: 0.05, transparent: true, opacity: 0.55, depthWrite: false });
      stars = new T.Points(stG, stM); scene.add(stars); disp.push(stG, stM);
    }
    var base = face(T, 18, 80), cur = { x: base.x, y: base.y }, target = { x: base.x, y: base.y }, ptr = { x: 0, y: 0 }, sel = null, tPlane = 0, auto = !still, zoomC = 1, zoomT = 1, baseZ = 4, sOff = { x: 0, y: 0 }, hold = null;
    g.rotation.set(cur.x, cur.y, 0);

    function size() {
      var w = host.clientWidth || 1, h = host.clientHeight || 1, asp = w / h;
      renderer.setSize(w, h, false); cam.aspect = asp; baseZ = 1 / (fill * tanH * Math.min(1, asp)); cam.position.z = baseZ / zoomC; cam.updateProjectionMatrix();
      if (still) renderer.render(scene, cam);
    }
    var ro = W.ResizeObserver ? new ResizeObserver(size) : null; ro ? ro.observe(host) : W.addEventListener("resize", size); size();

    /* picking: nearest front-facing marker within 22px */
    var tmp = new T.Vector3(), camDir = new T.Vector3();
    function pick(cx, cy) {
      var rect = cv2.getBoundingClientRect(), best = null, bd = 22 * 22; camDir.copy(cam.position).normalize(); g.updateMatrixWorld();
      for (var i = 0; i < mIdx.length; i++) {
        tmp.set(marks[i * 3], marks[i * 3 + 1], marks[i * 3 + 2]).applyMatrix4(g.matrixWorld);
        if (tmp.clone().normalize().dot(camDir) < 0.12) continue;
        tmp.project(cam); var sx = rect.left + (tmp.x + 1) / 2 * rect.width, sy = rect.top + (1 - tmp.y) / 2 * rect.height, dx = sx - cx, dy = sy - cy, d2 = dx * dx + dy * dy;
        if (d2 < bd) { bd = d2; best = { code: mIdx[i], x: sx - rect.left, y: sy - rect.top }; }
      }
      return best;
    }
    var drag = null, moved = 0, hoverCode = null, lastInteract = 0;
    function down(e) { drag = { x: e.clientX, y: e.clientY, ry: target.y, rx: target.x, id: e.pointerId }; moved = 0; try { cv2.setPointerCapture(e.pointerId); } catch (x) {} }
    function move(e) {
      if (drag) { var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); if (moved > 4) { target.y = drag.ry + dx * 0.006; target.x = Math.max(-1.1, Math.min(1.1, drag.rx + dy * 0.004)); lastInteract = performance.now(); auto = false; if (still) { cur.x = target.x; cur.y = target.y; g.rotation.set(cur.x, cur.y, 0); renderer.render(scene, cam); } } return; }
      if (e.pointerType === "touch") return;
      var h = pick(e.clientX, e.clientY); var code = h ? h.code : null;
      if (code !== hoverCode) { hoverCode = code; cv2.style.cursor = code ? "pointer" : "grab"; o.onHover && o.onHover(h); }
    }
    function up(e) { if (drag && moved <= 4) { var h = pick(e.clientX, e.clientY); if (h) o.onPick && o.onPick(h.code); } drag = null; }
    cv2.style.cursor = "grab"; cv2.style.touchAction = "pan-y";
    cv2.addEventListener("pointerdown", down); cv2.addEventListener("pointermove", move); cv2.addEventListener("pointerup", up); cv2.addEventListener("pointercancel", function () { drag = null; });
    cv2.addEventListener("pointerleave", function () { if (hoverCode) { hoverCode = null; o.onHover && o.onHover(null); } });
    var onPtr = function (e) { ptr.x = (e.clientX / innerWidth - 0.5); ptr.y = (e.clientY / innerHeight - 0.5); };
    if (!still && W.matchMedia("(hover: hover) and (pointer: fine)").matches) W.addEventListener("pointermove", onPtr, { passive: true });

    var visible = true, running = false, raf = 0, t0 = performance.now(), last = t0;
    var ptan = new T.Vector3(), pp = new T.Vector3(), pn = new T.Vector3();
    function placePlane(t) {
      var cu = curves[sel]; if (!cu) return; pp.copy(cu.getPoint(t)); ptan.copy(cu.getTangent(t)).normalize(); pn.copy(pp).normalize();
      plane.position.copy(pp); plane.up.copy(pn); plane.lookAt(pp.clone().add(ptan));
    }
    function frame(t) {
      raf = 0; var s = (t - t0) / 1000, dt = Math.min(0.05, (t - last) / 1000); last = t;
      arcM.uniforms.uTime.value = s; arcM.uniforms.uDraw.value = Math.min(1, s / 1.8);
      if (auto && !sel && t - lastInteract > 2500) target.y += dt * 0.12;
      cur.y += (target.y + ptr.x * 0.1 - cur.y) * 0.06; cur.x += (target.x + ptr.y * 0.07 - cur.x) * 0.06;
      g.rotation.set(cur.x + sOff.x, cur.y + sOff.y, 0);
      if (Math.abs(zoomT - zoomC) > 0.0008) { zoomC += (zoomT - zoomC) * 0.08; cam.position.z = baseZ / zoomC; }
      if (stars) { stars.rotation.y = s * 0.006 + sOff.y * 0.25; stars.rotation.x = sOff.x * 0.4; }
      if (sel) { tPlane = hold != null ? hold : (tPlane + dt * 0.14) % 1; placePlane(tPlane); ring.scale.setScalar(1 + 0.35 * Math.sin(s * 3)); ringM.opacity = 0.55 + 0.35 * Math.sin(s * 3); }
      renderer.render(scene, cam); loop();
    }
    function loop() { if (running && visible && D.visibilityState === "visible" && !raf) raf = requestAnimationFrame(frame); }
    var io = W.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) last = performance.now(); loop(); }) : null; io && io.observe(host);
    var onVis = function () { last = performance.now(); loop(); }; D.addEventListener("visibilitychange", onVis);
    if (still) renderer.render(scene, cam); else { running = true; loop(); }

    function setSel(code) {
      var d = list.filter(function (x) { return x.code === code; })[0]; if (!d || d === origin) return false;
      sel = code; arcM.uniforms.uSel.value = list.indexOf(d);
      /* look at the mid-point of the route (not just the destination) so the whole arc is in view */
      var mv = curves[code].getPoint(0.5).normalize(), f = { y: Math.atan2(-mv.x, mv.z), x: Math.atan2(mv.y, Math.sqrt(mv.x * mv.x + mv.z * mv.z)) * 0.85 };
      while (f.y - cur.y > Math.PI) f.y -= 2 * Math.PI; while (cur.y - f.y > Math.PI) f.y += 2 * Math.PI;
      target = f; auto = false; lastInteract = performance.now();
      var B = ll(T, d.lat, d.lon, 1.004); ring.position.copy(B); ring.lookAt(B.clone().multiplyScalar(2)); ring.visible = true; plane.visible = true; tPlane = still ? 0.5 : 0; placePlane(tPlane);
      if (still) { cur.x = target.x; cur.y = target.y; g.rotation.set(cur.x, cur.y, 0); renderer.render(scene, cam); }
      return true;
    }
    return {
      select: setSel,
      /* scroll hooks (used by the page): p 0..1 */
      setScroll: function (p) { p = Math.max(0, Math.min(1, p)); zoomT = 1 + p * 0.32; sOff.y = p * 1.1; sOff.x = p * 0.18; },
      zoom: function (z) { zoomT = Math.max(0.8, Math.min(2.2, z)); },
      scrub: function (t) { hold = (t == null) ? null : Math.max(0, Math.min(1, t)); },
      clear: function () { sel = null; arcM.uniforms.uSel.value = -1; ring.visible = false; plane.visible = false; target = { x: base.x, y: cur.y }; auto = !still; if (still) renderer.render(scene, cam); },
      destroy: function () {
        running = false; raf && cancelAnimationFrame(raf); io && io.disconnect(); ro && ro.disconnect();
        W.removeEventListener("pointermove", onPtr); W.removeEventListener("resize", size); D.removeEventListener("visibilitychange", onVis);
        disp.forEach(function (x) { x && x.dispose && x.dispose(); }); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); cv2.remove();
      }
    };
  }
  W.SafariaGlobeV4 = { mount: mount, supported: supported };
})(window);
