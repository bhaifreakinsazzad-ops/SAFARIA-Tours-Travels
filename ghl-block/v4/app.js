/* SAFARIA v4 application. Wires the markup to the design-system runtime (window.Safaria) and the v4 globe + fx.js (scroll director).
   Ownership: CSS = hover/focus; anime.js 4 (through Safaria.Motion) = entrances, staggers, steps, counters;
   Motion 11 = when things start (inView) and scroll progress; three.js (SafariaGlobeV4) = the canvas only.
   Everything is optional: with no libraries the page is fully usable. */
(function () {
  "use strict";
  var W = window, D = document;
  var root = D.getElementById("safaria-v4"), S = W.Safaria;
  if (!root || !S || W.__safariaV4) return;
  W.__safariaV4 = true;

  var CFG = Object.assign({
    phone: "+8801674178437",   // OPEN ITEM: the live site uses +8801641178437. Confirm which number is official.
    email: "safariatoursandtravels@gmail.com",
    vibeUrl: "https://trippin.vibing.world/",
    lang: "bn",                // default language: "bn" or "en"
    globe: true,               // interactive three.js globe in the hero
    motion: true,              // anime.js / Motion enhancements
    dock: true,                // mobile contact dock (WhatsApp / Call / Quote)
    webhooks: {},              // { flight, studio, corporate, agency, partner, tracker }: GHL inbound-webhook URLs
    onSubmit: null,            // function(type, data, text) → Promise. Resolve only when your CRM accepted the enquiry.
    cdn: {
      anime: "https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm",
      motion: "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm",
      three: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    }
  }, W.SAFARIA_CONFIG || {});
  CFG.webhooks = CFG.webhooks || {};

  var BN = /*__BN__*/{}, QBN = /*__QBN__*/{}, IMG = W.__SF_IMG || {};
  var t0 = performance.now(), lang = "bn", L = { anime: null, motion: null, THREE: null }, globe = null, quote = null;
  S.configure({ phone: CFG.phone, email: CFG.email, source: "ghl-safaria-v4" });
  var still = S.reduced(root), mobile = W.matchMedia("(max-width: 767px)").matches;

  function q(s, r) { return (r || root).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function t(key, en) { return lang === "bn" && BN[key] != null ? BN[key] : en; }
  function safe(name, fn) { try { return fn(); } catch (e) { if (W.console) console.warn("[SAFARIA v4] " + name + " skipped:", e); } }
  function imp(u) { return import(u).catch(function () { return null; }); }
  function idle(fn) { (W.requestIdleCallback || function (f) { return setTimeout(f, 200); })(fn, { timeout: 2500 }); }
  function track(name, data) { (W.dataLayer = W.dataLayer || []).push(Object.assign({ event: "safaria_" + name }, data || {})); }
  function say(msg) { var l = q("#sf-live"); if (l) { l.textContent = ""; setTimeout(function () { l.textContent = msg; }, 30); } }
  function store(k, v) { try { if (v === undefined) return W.localStorage.getItem(k); W.localStorage.setItem(k, v); } catch (e) { return null; } }
  var digits = function (p) { return String(p).replace(/[^0-9]/g, ""); };

  /* ---------- 1. static wiring: images, icons, contact links ---------- */
  qa("[data-img]").forEach(function (im) {
    var src = IMG[im.getAttribute("data-img")]; if (!src) return;
    im.addEventListener("load", function () { im.classList.add("sf-loaded"); });
    im.src = src; if (im.complete) im.classList.add("sf-loaded");
  });
  function icons(scope) { qa("i[data-icon]", scope).forEach(function (n) { var tmp = D.createElement("span"); tmp.innerHTML = S.icon(n.getAttribute("data-icon")); n.parentNode.replaceChild(tmp.firstChild, n); }); }
  var num = digits(CFG.phone), waBase = "https://wa.me/" + num;
  function contactLinks(scope) {
    qa("[data-wa]", scope).forEach(function (a) { a.href = waBase + "?text=" + encodeURIComponent("Hello SAFARIA, I would like to ask about travel."); });
    qa("[data-wa-demo]", scope).forEach(function (a) { a.href = waBase + "?text=" + encodeURIComponent("Hello SAFARIA, I would like a demo of the agency partnership programme."); });
    qa("[data-call]", scope).forEach(function (a) { a.href = "tel:+" + num; });
    qa("[data-sms]", scope).forEach(function (a) { a.href = "sms:+" + num; });
    qa("[data-mail]", scope).forEach(function (a) { a.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent("Travel enquiry"); });
  }
  icons(); contactLinks();
  var foot = q("#sf-foot-phone"); if (foot) foot.textContent = CFG.phone;
  var vl = q("#sf-vibe-link"); if (vl) vl.href = CFG.vibeUrl;

  /* ---------- 2. destinations data ---------- */
  var DEST = S.destinations, ORIGIN = DEST.filter(function (d) { return d.origin; })[0];
  var CONT = { MAA: "southAsia", KTM: "southAsia", BKK: "southeastAsia", KUL: "southeastAsia", SIN: "southeastAsia", DXB: "middleEast", AUH: "middleEast", DOH: "middleEast", JED: "middleEast", RUH: "middleEast", DMM: "middleEast", MCT: "middleEast", MED: "middleEast", CAN: "eastAsia", BJS: "eastAsia", TYO: "eastAsia", SEL: "eastAsia", LON: "europe", ROM: "europe", IST: "europe", YTO: "northAmerica", NYC: "northAmerica", FL: "northAmerica", SYD: "oceania", CPT: "africa" };
  DEST.forEach(function (d) { d.cont = d.region === "domestic" ? "domestic" : CONT[d.code]; });
  function label(d) { return d.city + (d.region === "domestic" ? " (" + d.code + ")" : ", " + d.country); }
  function byCode(c) { return DEST.filter(function (d) { return d.code === c; })[0]; }
  var dl = q("#sf-dest-list"); dl.innerHTML = DEST.map(function (d) { return '<option value="' + esc(label(d)) + '"></option>'; }).join("");

  /* ---------- 3. FAQ (built before translation capture) ---------- */
  var FAQ = [
    ["q1", "What does 0% markup mean?", "a1", "SAFARIA adds no profit markup on eligible air tickets. The supplier’s net fare, mandatory taxes and actual third-party charges are paid separately. Other services are priced separately."],
    ["q2", "Does the subscription include the ticket price?", "a2", "No. The monthly ৳20,000 or annual ৳130,000 subscription is for qualified agency access. Ticket value is separate and prepaid; no supplier credit is included."],
    ["q3", "Is visa approval guaranteed?", "a3", "No. SAFARIA helps with documents and application preparation. The final decision belongs to the embassy, consulate or immigration authority."],
    ["q4", "How do I ask for a quotation?", "a4", "Use the flight enquiry form, or message us on WhatsApp with the route, dates, number of travellers and services needed. Price and availability are re-checked before booking."],
    ["q5", "How does the agency trial work?", "a5", "When a qualified agency completes the application and verification, the 72-hour trial starts. Usage credits and programme rules apply, and limits are shared before activation. Trial credits cannot buy tickets."],
    ["q6", "What are the payment and refund rules?", "a6", "SAFARIA’s final cancellation and refund policy is still being confirmed. Get the written airline, supplier and subscription terms before paying. No refund rate or timeline is promised here."],
    ["q7", "Which services can I ask for?", "a7", "Flights, visa assistance, hotels, tours and transport. In Travel Studio you can choose one or several; scope is confirmed in the quotation."],
    ["q8", "Can I ask about domestic and international flights?", "a8", "Yes. Give the route and dates for a quotation. This is not live inventory or a fare guarantee."],
    ["q9", "Is a booking confirmed once I send an enquiry?", "a9", "No. A quotation, verified details, verified payment and the supplier’s confirmation come first."],
    ["q10", "Does 0% markup include taxes?", "a10", "0% applies only to SAFARIA’s own markup on eligible air tickets. Airline fare, mandatory taxes and actual third-party charges are payable."],
    ["q11", "How much does the annual plan save?", "a11", "The ৳130,000 annual plan is ৳110,000 less than twelve ৳20,000 monthly payments (৳240,000), about ৳10,833 a month."],
    ["q12", "Does the trial guarantee ticket availability?", "a12", "No. The 72 hours start from the recorded activation time after approval. Availability and verified-payment rules apply; trial credit is not ticket money."],
    ["q13", "How will an agency reach you?", "a13", "Fill in the agency application and review it, then open WhatsApp to send it to the verified number. Opening WhatsApp alone does not submit the application."]
  ];
  q("#sf-faq-list").innerHTML = FAQ.map(function (f) {
    return '<details><summary><span data-i="' + f[0] + '">' + esc(f[1]) + '</span><i data-icon="chevron"></i></summary><div class="sf-answer" data-i="' + f[2] + '">' + esc(f[3]) + "</div></details>";
  }).join("");
  icons(q("#sf-faq-list"));

  /* ---------- 4. i18n: English lives in the markup, Bengali in the BN table ---------- */
  var REG = [];
  function collect(scope) {
    qa("[data-i]", scope).forEach(function (el) { if (!el.__i) { el.__i = { k: el.getAttribute("data-i"), en: el.innerHTML }; REG.push(["h", el]); } });
    qa("[data-ip]", scope).forEach(function (el) { if (!el.__p) { el.__p = { k: el.getAttribute("data-ip"), en: el.getAttribute("placeholder") || "" }; REG.push(["p", el]); } });
    qa("[data-ia]", scope).forEach(function (el) { if (!el.__a) { var at = el.tagName === "IMG" ? "alt" : "aria-label"; el.__a = { k: el.getAttribute("data-ia"), at: at, en: el.getAttribute("data-alt") || el.getAttribute(at) || "" }; REG.push(["a", el]); } });
  }
  collect();
  var QSEL = "#sf-quote-mount, #sf-dock";
  function trTree(node, to) {
    var w = D.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (n2) {
      var v = n2.nodeValue, key = v.trim(); if (!key) return;
      if (to === "bn") { if (QBN[key] != null) { n2.__en = n2.__en || v; n2.nodeValue = v.replace(key, QBN[key]); } }
      else if (n2.__en != null) { n2.nodeValue = n2.__en; n2.__en = null; }
    });
    if (node.querySelectorAll) qa("[placeholder]", node).forEach(function (el) {
      var p = el.getAttribute("placeholder");
      if (to === "bn" && QBN[p] != null) { el.__pen = el.__pen || p; el.setAttribute("placeholder", QBN[p]); } else if (to !== "bn" && el.__pen) { el.setAttribute("placeholder", el.__pen); el.__pen = null; }
    });
  }
  function applyLang(l) {
    lang = l; root.lang = l; root.setAttribute("data-lang", l);
    REG.forEach(function (r) {
      var el = r[1];
      if (r[0] === "h") el.innerHTML = (l === "bn" && BN[el.__i.k] != null) ? BN[el.__i.k] : el.__i.en;
      else if (r[0] === "p") el.setAttribute("placeholder", (l === "bn" && BN[el.__p.k] != null) ? BN[el.__p.k] : el.__p.en);
      else el.setAttribute(el.__a.at, (l === "bn" && BN[el.__a.k] != null) ? BN[el.__a.k] : el.__a.en);
    });
    qa(QSEL).forEach(function (h) { trTree(h, l); });
    renderDest(); updatePass(); budget();
    if (W.SafariaFX && W.SafariaFX.refresh) W.SafariaFX.refresh();
    var b = q("[data-sf-lang]"); if (b) b.setAttribute("aria-label", l === "bn" ? "Switch to English" : "বাংলায় দেখুন");
  }
  var saved = store("sf_lang"); lang = (saved === "en" || saved === "bn") ? saved : (CFG.lang === "en" ? "en" : "bn");

  /* ---------- 5. destination explorer ---------- */
  var FILTERS = [["all", "All destinations"], ["domestic", "Domestic"], ["southAsia", "South Asia"], ["southeastAsia", "Southeast Asia"], ["middleEast", "Middle East"], ["eastAsia", "East Asia"], ["europe", "Europe"], ["northAmerica", "North America"], ["oceania", "Oceania"], ["africa", "Africa"], ["saved", "Saved"]];
  var state = { filter: "all", search: "", all: false, saved: [], sel: null };
  try { state.saved = JSON.parse(store("sf_saved") || "[]") || []; } catch (e) { state.saved = []; }
  var grid = q("#sf-dest-grid"), fbar = q("#sf-filters");
  function renderFilters() {
    fbar.innerHTML = FILTERS.map(function (f) { return '<button type="button" class="sf-chip" data-f="' + f[0] + '" aria-pressed="' + (state.filter === f[0]) + '">' + esc(t(f[0] === "all" ? "all" : f[0] === "saved" ? "savedOnly" : f[0], f[1])) + "</button>"; }).join("");
  }
  function matches(d) {
    if (d.origin) return false;
    if (state.filter === "saved" && state.saved.indexOf(d.code) < 0) return false;
    if (state.filter !== "all" && state.filter !== "saved" && d.cont !== state.filter) return false;
    var s = state.search.trim().toLowerCase(); return !s || (d.city + " " + d.country + " " + d.code).toLowerCase().indexOf(s) >= 0;
  }
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
  function renderDest(animate) {
    renderFilters();
    var items = DEST.filter(matches), limited = !state.all && state.filter === "all" && !state.search.trim() && items.length > 12;
    var shown = limited ? items.slice(0, 12) : items;
    grid.innerHTML = shown.map(function (d) {
      var on = state.saved.indexOf(d.code) >= 0, region = d.region === "domestic" ? t("domestic", "Domestic") : d.country;
      return '<article class="sf-destination-card" data-code="' + d.code + '" data-sf-tilt' + (state.sel === d.code ? ' data-on="true"' : "") + '>' +
        '<div class="sf-top"><span class="sf-code">' + d.code + '</span><button type="button" class="sf-save" data-act="save" aria-pressed="' + on + '" aria-label="' + esc(t("saveDest", "Save") + " " + d.city) + '">' + STAR + "</button></div>" +
        '<div><p class="sf-eyebrow">' + esc(region) + "</p><h3>" + esc(d.city) + "</h3><p>" + esc(d.note || t("fromDhaka", "Request a quote from Dhaka")) + "</p></div>" +
        '<div class="sf-card-actions"><button type="button" class="sf-mini" data-act="globe">' + esc(t("viewGlobe", "View on globe")) + '</button><button type="button" class="sf-mini" data-act="quote">' + esc(t("getQuote", "Get a quote")) + "</button></div></article>";
    }).join("");
    q("#sf-dest-empty").hidden = shown.length > 0;
    var more = q("#sf-dest-more"); more.hidden = !limited;
    q("#sf-dest-clear").hidden = !(state.saved.length && state.filter === "saved");
    if (animate !== false && !S.reduced(root)) { S.Motion.pointer(grid); if (W.SafariaFX && W.SafariaFX.cards) W.SafariaFX.cards(grid); else S.Motion.animate(grid.children, { opacity: [0, 1], y: [14, 0] }, { duration: 480, stagger: 35 }); }
  }
  fbar.addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (!b) return; state.filter = b.getAttribute("data-f"); renderDest(); });
  q("#sf-dest-search").addEventListener("input", function (e) { state.search = e.target.value; renderDest(false); });
  q("#sf-dest-more").addEventListener("click", function () { state.all = true; renderDest(); });
  q("#sf-dest-clear").addEventListener("click", function () { state.saved = []; store("sf_saved", "[]"); renderDest(false); });
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"), card = e.target.closest("[data-code]"); if (!b || !card) return;
    var code = card.getAttribute("data-code"), a = b.getAttribute("data-act");
    if (a === "save") {
      var i = state.saved.indexOf(code); if (i >= 0) state.saved.splice(i, 1); else { state.saved.push(code); addStamp(code); }
      store("sf_saved", JSON.stringify(state.saved)); b.setAttribute("aria-pressed", String(i < 0)); q("#sf-dest-clear").hidden = !(state.saved.length && state.filter === "saved");
    } else if (a === "globe") { selectDest(code); scrollToId("sf-home"); }
    else if (a === "quote") { selectDest(code, true); prefillQuote({ to: label(byCode(code)) }); scrollToId("sf-enquiry"); }
  });

  /* pass card + journal stamps */
  var pass = q("#sf-pass"), passTo = q("#sf-pass-to"), passCity = q("#sf-pass-city"), passCta = q("#sf-pass-cta");
  function updatePass() {
    var d = state.sel && byCode(state.sel); if (!d) { passCity.textContent = globe ? t("passHint", "Tap a glowing point on the globe") : t("passHint2", "Choose a destination below"); return; }
    passTo.textContent = d.code; passCity.textContent = label(d) + " · " + t("illustrative", "Illustrative route"); passCta.hidden = false;
  }
  function addStamp(code) {
    var box = q("#sf-stamps"); if (!box || q('[data-s="' + code + '"]', box)) return;
    var ghost = q(".sf-stamp-ghost", box); ghost && ghost.remove();
    var s = D.createElement("span"); s.className = "sf-stamp"; s.setAttribute("data-s", code); s.textContent = code;
    s.style.setProperty("--r", (Math.round(Math.random() * 16) - 8) + "deg"); if (!S.reduced(root)) s.style.animation = "sf-stamp-in 520ms var(--ease-out) both";
    box.appendChild(s); while (box.children.length > 9) box.removeChild(box.firstChild);
  }
  function selectDest(code, quiet) {
    var d = byCode(code); if (!d || d.origin) return; state.sel = code;
    globe && globe.select(code); pass.hidden = false; updatePass();
    if (!quiet && !S.reduced(root)) S.Motion.animate(pass, { opacity: [0.4, 1], y: [10, 0], scale: [0.985, 1] }, { duration: 520 });
    addStamp(code);
    qa(".sf-destination-card").forEach(function (c) { if (c.getAttribute("data-code") === code) c.setAttribute("data-on", "true"); else c.removeAttribute("data-on"); });
    say(label(d) + ". " + t("illustrative", "Illustrative route") + ".");
    track("destination_selected", { destination: code });
  }
  passCta.addEventListener("click", function () { var d = state.sel && byCode(state.sel); if (d) prefillQuote({ to: label(d) }); });

  /* ---------- 6. flight quote (design-system component) + prefill ---------- */
  function post(url, payload) {
    return W.fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(function (r) { if (!r.ok) throw new Error("webhook " + r.status); });
  }
  function deliver(type, data, text) {
    if (CFG.onSubmit) return Promise.resolve().then(function () { return CFG.onSubmit(type, data, text); });
    if (CFG.webhooks[type]) return post(CFG.webhooks[type], Object.assign({ type: type, summary: text, source: "ghl-safaria-v4" }, data));
    return Promise.reject(new Error("no-webhook"));
  }
  var qm = q("#sf-quote-mount");
  quote = S.FlightQuote.mount(qm, {
    source: "ghl-safaria-v4-flight",
    onStart: function () { track("flight_form_started"); },
    onSubmit: function (data, text) {
      track("flight_form_submitted", { delivered: !!(CFG.onSubmit || CFG.webhooks.flight) });
      return deliver("flight", data, text);
    }
  });
  function prefillQuote(v) {
    var set = function (n, val) { var i = q('input[name="' + n + '"]', qm); if (i && val) { i.value = val; i.dispatchEvent(new Event("input", { bubbles: true })); } };
    if (quote && quote.go && quote.state.step !== 0 && !q("form", qm).hidden) quote.go(0);
    set("from", v.from); set("to", v.to); set("depart", v.depart);
  }
  var qf = q(".sf-quick-form");
  qf.addEventListener("submit", function (e) {
    e.preventDefault();
    prefillQuote({ from: q("#sf-quick-from").value.trim(), to: q("#sf-quick-to").value.trim(), depart: q("#sf-quick-date").value });
    scrollToId("sf-enquiry"); setTimeout(function () { var f = q('input[name="to"]', qm); f && !f.value ? f.focus({ preventScroll: true }) : (q('input[name="depart"]', qm) || {}).focus && q('input[name="depart"]', qm).focus({ preventScroll: true }); }, 500);
  });

  /* ---------- 7. generic enquiry forms (studio, corporate, agency, partner, tracker) ---------- */
  var TITLES = { studio: "New Travel Studio Enquiry", corporate: "New Corporate Travel Enquiry", agency: "New B2B Agency Application", partner: "New Partner Hub Enquiry", tracker: "Flight Status Question (not live tracking)" };
  var EVENTS = { studio: "studio_enquiry_submitted", corporate: "corporate_enquiry_submitted", agency: "b2b_application_submitted", partner: "partner_enquiry_submitted", tracker: "flight_status_question" };
  function fieldErr(f, msg) {
    var wrap = f.closest(".sf-q-field"), id = (f.id || f.name) + "-e", e = wrap && D.getElementById(id);
    if (wrap && !e) { e = D.createElement("p"); e.id = id; e.className = "sf-q-error"; e.setAttribute("role", "alert"); wrap.appendChild(e); }
    if (e) e.innerHTML = msg ? S.icon("alert") + "<span>" + esc(msg) + "</span>" : "";
    f.setAttribute("aria-invalid", msg ? "true" : "false"); if (e) f.setAttribute("aria-describedby", id);
    return !msg;
  }
  function initForm(form) {
    var type = form.getAttribute("data-sf-form"), out = q(".sf-result", form), started = false;
    form.addEventListener("input", function () { if (!started) { started = true; track(type + "_form_started"); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var ok = true, first = null;
      qa("input, select, textarea", form).forEach(function (f) {
        if (f.type === "checkbox") return;
        var v = f.value.trim(), kind = f.getAttribute("data-kind"), msg = "";
        if (f.required && !v) msg = t("errReq", "Please fill in this field.");
        else if (kind === "phone" && v && !/^\+?[0-9][0-9 ()-]{7,17}$/.test(v)) msg = t("errPhone", "Enter a number with country code.");
        else if (kind === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = t("errEmail", "Check the email address.");
        if (!fieldErr(f, msg)) { ok = false; first = first || f; }
      });
      if (!ok) { first.focus(); return; }
      var data = { enquiryType: type }, lines = [TITLES[type]], svc = [];
      qa("input, select, textarea", form).forEach(function (f) {
        if (f.type === "checkbox") { if (f.checked) svc.push(f.value); return; }
        var v = f.value.trim(), lab = f.getAttribute("data-label"); if (!lab) return; data[f.name] = v; if (v) lines.push("- " + lab + ": " + v);
      });
      if (form.querySelector('input[type="checkbox"]')) { data.services = svc; lines.push("- Services: " + (svc.join(", ") || "Not specified")); }
      lines.push("- Enquiry Source: ghl-safaria-v4-" + type, "- Submission Time: " + new Date().toLocaleString());
      var text = lines.join("\n"), links = S.FlightQuote.links(text), btn = q('[type="submit"]', form);
      var show = function (sent) {
        out.hidden = false;
        out.innerHTML = '<p class="sf-q-done">' + S.icon("check") + "<span>" + esc(sent ? t("resDone", "Enquiry received. A SAFARIA agent will contact you.") : t("resReady", "Your enquiry is ready. Send it to a SAFARIA agent:")) + "</span></p>" +
          '<pre class="sf-q-summary" tabindex="0">' + esc(text) + "</pre>" +
          '<div class="sf-q-actions"><a class="sf-button sf-gold" href="' + links.whatsapp + '" target="_blank" rel="noopener" data-sf-event="whatsapp_click">' + S.icon("whatsapp") + " " + esc(t("openWa", "Open in WhatsApp")) + "</a>" +
          '<a class="sf-button sf-outline" href="' + links.call + '" data-sf-event="call_click">' + S.icon("phone") + " " + esc(t("callB", "Call")) + "</a>" +
          '<a class="sf-button sf-outline" href="' + links.sms + '">' + S.icon("sms") + " SMS</a>" +
          '<button type="button" class="sf-button sf-outline" data-copy>' + S.icon("copy") + " <span>" + esc(t("copyB", "Copy")) + "</span></button></div>" +
          '<p class="sf-q-privacy">' + esc(t("resNote", "WhatsApp opens with your details filled in. Press Send there to reach us. This is an enquiry, not a booking.")) + "</p>";
        var cp = q("[data-copy]", out); cp.addEventListener("click", function () { navigator.clipboard && navigator.clipboard.writeText(text).then(function () { cp.lastChild.textContent = t("copiedB", "Copied"); }); });
        var d = q(".sf-q-done", out); d.setAttribute("tabindex", "-1"); d.focus();
        if (!S.reduced(root)) S.Motion.animate(out, { opacity: [0, 1], y: [12, 0] }, { duration: 500 });
        btn.disabled = false;
      };
      track(EVENTS[type], { delivered: !!(CFG.onSubmit || CFG.webhooks[type]) });
      btn.disabled = true;
      deliver(type, data, text).then(function () { show(true); }, function () { show(false); });
    });
  }
  qa("form[data-sf-form]").forEach(initForm);

  /* ---------- 8. budget estimate (planning aid, never a quotation) ---------- */
  function budget() {
    var v = {}; qa("#sf-budget [data-b]").forEach(function (i) { v[i.getAttribute("data-b")] = Math.max(0, parseFloat(i.value) || 0); });
    var total = (v.flights + v.hotel * v.nights + v.daily * v.days + v.other) * (1 + Math.min(50, v.buffer) / 100);
    q("#sf-budget-out").textContent = "৳" + Math.round(total).toLocaleString(lang === "bn" ? "bn-BD" : "en-BD"); return Math.round(total);
  }
  q("#sf-budget").addEventListener("input", budget);
  q("#sf-budget-use").addEventListener("click", function () {
    var n = budget(); if (!n) return;
    var notes = q('textarea[name="notes"]', qm); if (notes) notes.value = (notes.value ? notes.value + "\n" : "") + "Planning budget estimate: BDT " + n.toLocaleString("en-BD") + " (my own estimate, not a quotation)";
    scrollToId("sf-enquiry"); say(t("budgetAdded", "Estimate added to your enquiry notes."));
  });

  /* ---------- 9. navigation: language, drawer, anchors, active link, header ---------- */
  q("[data-sf-lang]").addEventListener("click", function () { var n = lang === "bn" ? "en" : "bn"; store("sf_lang", n); applyLang(n); track("lang_changed", { lang: n }); });
  var header = q(".sf-header"), drawerEl = q("#sf-drawer"), veil = q("#sf-veil");
  var drawer = S.Header.mount(header, { drawer: drawerEl, veil: veil });
  qa("[data-sf-drawer-close]").forEach(function (b) { b.addEventListener("click", function () { drawer && drawer.close(); }); });
  function scrollToId(id) {
    var el = D.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: S.reduced(root) ? "auto" : "smooth", block: "start" });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); setTimeout(function () { try { el.focus({ preventScroll: true }); } catch (e) {} }, 400);
  }
  root.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute("href").slice(1); if (!id || !D.getElementById(id)) return;
    e.preventDefault();
    var svc = a.getAttribute("data-svc");
    if (svc) { var cb = q('#sfp-studio input[value="' + svc + '"]'); if (cb) cb.checked = true; }
    scrollToId(id);
  });
  var NAVMAP = { "sf-home": "#sf-home", "sf-quick": "#sf-home", "sf-destinations": "#sf-destinations", "sf-services": "#sf-services", "sfp-studio": "#sf-services", "sf-corporate": "#sf-corporate", "sf-agency": "#sf-agency", "sf-enquiry": "#sf-enquiry", "sf-contact": "#sf-contact" };
  if (W.IntersectionObserver) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (!en.isIntersecting) return; var h = NAVMAP[en.target.id]; qa(".sf-nav a").forEach(function (a) { if (a.getAttribute("href") === h) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(NAVMAP).forEach(function (id) { var s = D.getElementById(id); s && navIO.observe(s); });
  }

  /* ---------- 10. components from the design system ---------- */
  S.PricePlan.mount(q("#sf-pricing"));
  S.Accordion.mount(q("#sf-faq-list"));
  if (CFG.dock) { S.ContactDock.render(q("#sf-dock"), { quoteHref: "#sf-enquiry" }); } else q("#sf-dock").hidden = true;
  S.track(root);
  collect(); applyLang(lang);
  /* translate the runtime-rendered quote and dock, and anything they add later (steps, errors, results) */
  if (W.MutationObserver) qa(QSEL).forEach(function (h) {
    new MutationObserver(function (ms) { if (lang !== "bn") return; ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 3) { var k = n.nodeValue.trim(); if (QBN[k] != null) { n.__en = n.nodeValue; n.nodeValue = n.nodeValue.replace(k, QBN[k]); } } else if (n.nodeType === 1) trTree(n, "bn"); }); }); }).observe(h, { childList: true, subtree: true });
  });
  root.setAttribute("data-sf-v4", still ? "reduced-motion" : "motion");
  if (W.console) console.info("[SAFARIA v4] active · " + (still ? "reduced motion: animations off, still globe" : "motion on") + (mobile ? " · mobile" : ""));

  /* ---------- 11. motion (anime.js via Safaria.Motion, Motion 11 inView/scroll) ---------- */
  function startMotion() {
    safe("fx", function () {
      if (!W.SafariaFX || !CFG.motion && !still) return;
      W.SafariaFX.init({
        root: root, S: S, still: still, mobile: mobile, DEST: DEST, lib: function () { return L.anime; }, lang: function () { return lang; },
        heroGlobe: function () { return globe; },
        mk: function (hostEl, opts) { return L.THREE ? W.SafariaGlobeV4.mount(hostEl, L.THREE, Object.assign({ destinations: DEST, still: still, land: W.__SF_LAND }, opts)) : null; },
        quoteFor: function (code) { var d = byCode(code); if (!d) return; selectDest(code, true); prefillQuote({ to: label(d) }); }
      });
      if (L.THREE) W.SafariaFX.three();
    });
    safe("hero", function () {
      if (still || W.scrollY > 60) return;
      S.Motion.hero(q(".sf-hero"), { art: ".sf-none", lines: ".sf-none" });
      W.SafariaFX && W.SafariaFX.heroLines && W.SafariaFX.heroLines();
    });
    safe("reveal", function () {
      if (still) return;
            S.Motion.reveal(root); S.Motion.pointer(root); S.Motion.parallax(root);
    });
    safe("steps", function () {
      var ol = q("#sf-steps"), lis = qa("li", ol); if (!ol || (CFG.motion && !still)) return;   // v4: fx.js ties the steps to scroll
      var go = function () { lis.forEach(function (li, i) { setTimeout(function () { li.classList.add("sf-on"); }, still ? 0 : i * 260); }); };
      if (!W.IntersectionObserver) return go();
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { threshold: 0.3 }); io.observe(ol);
      setTimeout(function () { if (!lis[0].classList.contains("sf-on") && ol.getBoundingClientRect().top < innerHeight) go(); }, 3000);
    });
    safe("progress", function () {
      var bar = q(".sf-progress i"); if (!bar || still) return;
      var set = function (p) { bar.style.transform = "scaleX(" + Math.max(0, Math.min(1, p)) + ")"; };
      if (L.motion && L.motion.scroll) { L.motion.scroll(set); return; }
      var tick = false; W.addEventListener("scroll", function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; var h = D.documentElement.scrollHeight - innerHeight; set(h > 0 ? W.scrollY / h : 0); }); }, { passive: true });
    });
  }
  if (CFG.motion && !still) {
    var begun = false, begin = function () { if (begun) return; begun = true; startMotion(); };
    Promise.all([imp(CFG.cdn.anime), imp(CFG.cdn.motion)]).then(function (m) { L.anime = m[0]; L.motion = m[1]; S.use({ anime: m[0], motion: m[1] }); begin(); });
    setTimeout(begin, 700);   // never wait on the network: Safaria.Motion falls back to the Web Animations API until anime.js arrives
  } else { startMotion(); }

  /* ---------- 12. 3D globe: lazy, one renderer, static fallback ---------- */
  var host = q("#sf-globe-host"), tip = q("#sf-globe-tip");
  function noGL() { root.classList.add("sf-nogl"); pass.hidden = !state.sel; updatePass(); }
  safe("globe", function () {
    var lite = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    if (!CFG.globe || lite || !W.SafariaGlobeV4 || !W.SafariaGlobeV4.supported()) return noGL();
    var mountIt = function () {
      imp(CFG.cdn.three).then(function (T) {
        if (!T) return noGL();
        L.THREE = T; S.use({ THREE: T });
        W.SafariaFX && W.SafariaFX.three && W.SafariaFX.three();
        globe = W.SafariaGlobeV4.mount(host, T, {
          destinations: DEST, still: still, land: W.__SF_LAND,
          onPick: function (code) { selectDest(code); },
          onHover: function (h) { if (!h) { tip.hidden = true; return; } var d = byCode(h.code); tip.textContent = d.city + " · " + d.code; tip.style.left = h.x + "px"; tip.style.top = h.y + "px"; tip.hidden = false; }
        });
        if (!globe) return noGL();
        root.classList.add("sf-3d"); if (state.sel) globe.select(state.sel);
        host.style.opacity = "0"; S.Motion.animate(host, { opacity: [0, 1], scale: [0.94, 1] }, { duration: 1100 }).then(function () { host.style.opacity = ""; });
        updatePass();
      });
    };
    /* IntersectionObserver can stay silent in webviews and screenshot tools: after 2.5s without a callback, mount anyway */
    var done = false, got = false, io = null, go = function () { if (done) return; done = true; io && io.disconnect(); idle(mountIt); };
    if (W.IntersectionObserver) { io = new IntersectionObserver(function (es) { got = true; if (es[0].isIntersecting) go(); }, { rootMargin: "200px" }); io.observe(host); }
    setTimeout(function () { if (!got) go(); }, 2500);
  });
  W.addEventListener("pagehide", function () { globe && globe.destroy(); globe = null; W.SafariaFX && W.SafariaFX.destroy(); });

  W.SafariaV4 = { selectDest: selectDest, setLang: function (l) { store("sf_lang", l); applyLang(l); }, prefillQuote: prefillQuote, version: "4.0.0", globe: function () { return globe; } };
})();
