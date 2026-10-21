(() => {
  "use strict";
  const noJsFallback = () => {
    document.documentElement.classList.remove("js");
    document.querySelectorAll(".g-item").forEach((li) => { li.hidden = false; });
    const f = document.getElementById("contact-form");
    if (f) f.noValidate = false;
    document.querySelectorAll(".pro-only").forEach((el) => { el.hidden = false; });
    const moreRow = document.querySelector(".more-row");
    if (moreRow) moreRow.hidden = true;
    if (window.BB_RELEASE) window.BB_RELEASE(); // the photos held for the largest paint (inline script in <head>)
  };
  try {
  document.documentElement.classList.add("js");
  const onMedia = (q, fn) => { const m = window.matchMedia(q); if (m.addEventListener) m.addEventListener("change", fn); else if (m.addListener) m.addListener(fn); return m; };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const EMAIL = "bbconstruct@outlook.be";
  const PHONE_HREF = "tel:" + "+32471410184";
  const PHONE_TEXT = "0471 41 01 84";
  const SITE = "www.bbconstruct.site";
  const CC = "nathan.lahy@sharpdev.be"; // testing phase only (business.test_cc): the team gets a copy of every prepared e-mail
  const GREETING = "Bonjour Benjamin,"; // « Bonjour <founder's first name>, » (business.founder)
  const PAGES = {"amenagement-exterieur": "Aménagement extérieur", "maconnerie-renovation": "Maçonnerie & rénovation", "terrassement-egouttage": "Terrassement & égouttage"}; // service page slug -> its name, so a request says which page it started from (?depuis=)
  const pageFrom = () => { const k = new URL(location.href).searchParams.get("depuis"); return k && Object.prototype.hasOwnProperty.call(PAGES, k) ? PAGES[k] : ""; };
  const openMail = (href) => (typeof window.BB_OPEN_MAIL === "function" ? window.BB_OPEN_MAIL(href) : window.location.assign(href));
  const MAILTO_MAX = 1800; // several mail clients drop mailto URLs past ~2000 characters
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  };
  const copyStatus = $("#copy-status");
  const announce = (msg) => { if (copyStatus) { copyStatus.textContent = ""; setTimeout(() => { copyStatus.textContent = msg; }, 30); } };
  const showForManualCopy = (container, text, key) => {
    let ta = $(`textarea.manual-copy[data-key="${key}"]`, container);
    if (!ta) {
      if (!$(".manual-copy-note", container)) {
        const p = Object.assign(document.createElement("p"), { className: "manual-copy-note" });
        p.textContent = "Copie automatique impossible\u202f: sélectionnez le texte ci-dessous puis copiez-le.";
        container.append(p);
      }
      ta = Object.assign(document.createElement("textarea"), { className: "manual-copy", readOnly: true });
      ta.dataset.key = key;
      ta.setAttribute("aria-label", `Texte à copier : ${key.replace(/^Copier /, "")}`);
      container.append(ta);
    }
    ta.value = text;
    ta.focus();
    ta.select();
  };
  const copyButton = (label, text, container) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "copy-btn";
    b.textContent = label;
    b.addEventListener("click", async () => {
      if (await copyText(text)) { b.textContent = `${label} ✓`; announce("Copié."); }
      else showForManualCopy(container, text, label);
    });
    return b;
  };
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    const ok = await copyText(b.dataset.copy);
    const lbl = $(".copy-label", b);
    lbl.textContent = ok ? "Copié ✓" : "Copier";
    announce(ok ? "Adresse e-mail copiée." : `Copie impossible\u202f: l'adresse est ${b.dataset.copy}.`);
    setTimeout(() => { lbl.textContent = "Copier"; }, 2500);
  }));
  const goToForm = ({ cat, who } = {}) => {
    const form = $("#contact-form");
    if (!form) return;
    const opt = cat ? Array.from($("#f-type").options).find((o) => o.dataset.cat === cat) : null;
    if (opt) opt.selected = true;
    const radio = who && $(`input[name="who"][value="${who}"]`, form);
    if (radio && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    const note = $("#form-preset");
    if (note) {
      const parts = [];
      if (who === "Professionnel") parts.push("Demande pour une entreprise");
      if (opt) parts.push(`Type de travaux choisi\u202f: ${opt.textContent.trim()} (modifiable plus bas)`);
      note.textContent = parts.join(" · ");
    }
    waFor(cat);
    form.scrollIntoView();
    $("#f-name").focus({ preventScroll: true });
  };
  function waFor(cat) {
    const wa = $("[data-wa-texts]");
    if (!wa) return;
    let texts = {};
    try { texts = JSON.parse(wa.dataset.waTexts); } catch { /* keep the generic text */ }
    wa.href = `${wa.href.split("?")[0]}?text=${encodeURIComponent((cat && texts[cat]) || wa.dataset.waText)}`;
  }
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav = $("#nav");
  const fab = $(".fab-call");
  const hero = $(".hero") || $(".page-hero"); // the service pages open on a text band, not the photo banner
  const contact = $("#contact");
  const onScroll = () => { if (header) header.classList.toggle("is-solid", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const menuOpen = () => !!nav && nav.classList.contains("is-open");
  const setMenu = (open, focusToggle) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    if (open) { const first = $("a", nav); if (first) first.focus(); }
    else if (focusToggle) toggle.focus();
  };
  if (toggle && nav) {
    toggle.addEventListener("click", () => setMenu(!menuOpen(), false));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => { if (menuOpen()) setMenu(false, false); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen()) setMenu(false, true); });
    header.addEventListener("focusout", (e) => {
      if (menuOpen() && e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setMenu(false, false);
    });
    document.addEventListener("pointerdown", (e) => {
      if (menuOpen() && !nav.contains(e.target) && !e.target.closest(".nav-toggle, .header-call, .brand")) setMenu(false, false);
    });
    let openY = 0;
    toggle.addEventListener("click", () => { openY = window.scrollY; });
    window.addEventListener("scroll", () => {
      if (menuOpen() && Math.abs(window.scrollY - openY) > 60) setMenu(false, nav.contains(document.activeElement)); // keep keyboard focus on the toggle
    }, { passive: true });
    onMedia("(min-width: 56.3125em)", (m) => { if (m.matches) setMenu(false, false); }); // the CSS burger ends at 56.25em
  }
  $$(".nav .has-sub").forEach((li) => {
    const btn = $(".sub-toggle", li), list = $(".sub", li);
    if (!btn || !list) return;
    const isOpen = () => btn.getAttribute("aria-expanded") === "true";
    let byHover = false;
    const set = (open) => { li.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); if (!open) byHover = false; };
    const wide = () => getComputedStyle(btn).display !== "none";
    btn.addEventListener("click", (e) => { if (byHover && e.detail > 0) { byHover = false; return; } set(!isOpen()); });
    $$("a", li).forEach((a) => a.addEventListener("click", () => set(false)));
    li.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && wide() && !isOpen()) { set(true); byHover = true; } });
    li.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && byHover) set(false); });
    li.addEventListener("focusout", (e) => { if (isOpen() && e.relatedTarget && !li.contains(e.relatedTarget)) set(false); });
    document.addEventListener("pointerdown", (e) => { if (isOpen() && !li.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !isOpen()) return;
      const inside = li.contains(document.activeElement);
      set(false);
      if (inside) btn.focus();
    });
  });
  if (fab && "IntersectionObserver" in window) {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => seen.set(en.target, en.isIntersecting));
      fab.classList.toggle("is-hidden", Array.from(seen.values()).some(Boolean));
    }, { threshold: 0 });
    [hero, contact, document.getElementById("realisations"), document.getElementById("services"), document.getElementById("chantiers")].forEach((el) => { if (el) io.observe(el); });
    const story = $("#a-propos .about-text");
    if (story) io.observe(story);
    document.querySelectorAll("main .btn-orange").forEach((el) => io.observe(el));
  } else if (fab) {
    fab.classList.remove("is-hidden");
  }
  const navLinks = nav ? $$("a[href^='#']", nav) : [];
  if (navLinks.length && "IntersectionObserver" in window) {
    const targets = new Map();
    navLinks.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const el = id === "haut" ? hero : document.getElementById(id);
      if (el) targets.set(el, id === "haut" ? null : a);
    });
    const inBand = new Set();
    const paint = () => {
      navLinks.forEach((l) => l.removeAttribute("aria-current"));
      const active = Array.from(inBand).pop();
      const link = active && targets.get(active);
      if (link) link.setAttribute("aria-current", "location");
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) inBand.add(en.target); else inBand.delete(en.target); });
      paint();
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach((_, el) => io.observe(el));
  }
  const gallery = $("#gallery");
  const items = gallery ? $$(".g-item", gallery) : [];
  const chips = $$(".chip[data-filter]");
  const more = $("#more");
  const status = $("#gallery-status");
  const pageSize = () => (window.matchMedia("(max-width: 700px)").matches ? 6 : 9);
  const CATS = new Set(chips.map((c) => c.dataset.filter));
  let filter = "all";
  let limit = pageSize();
  let revealGuardUntil = 0;
  const labelOf = (cat) => { const c = chips.find((x) => x.dataset.filter === cat); return c ? c.firstChild.textContent.trim() : ""; };
  const inFilter = (li, f) => f === "all" || li.dataset.cat === f || (f === "pro" && li.dataset.pro === "1");
  const matching = () => items.filter((li) => inFilter(li, filter));
  const fillRows = (match, n) => {
    if (!gallery || n >= match.length) return n;
    const cols = getComputedStyle(gallery).gridTemplateColumns.split(" ").filter(Boolean).length;
    if (cols < 2) return n;
    const span = (li) => { const cs = getComputedStyle(li), m = /span (\d+)/.exec(cs.gridColumnStart + " " + cs.gridColumnEnd);
      return m ? Number(m[1]) : cs.gridColumnEnd === "-1" ? cols : 1; };
    let used = match.slice(0, n).reduce((a, li) => a + span(li), 0);
    while (used % cols && n < match.length) used += span(match[n++]);
    return n;
  };
  const render = (announce) => {
    const match = matching();
    limit = fillRows(match, limit);
    if (match.length - limit <= 2) limit = Math.max(limit, match.length); // never leave one or two behind a button
    items.forEach((li) => { li.hidden = true; });
    match.forEach((li, i) => { li.hidden = i >= limit; });
    if (more) {
      const rest = match.length - limit;
      more.parentElement.hidden = rest <= 0;
      const next = Math.max(0, rest <= pageSize() + 2 ? rest : pageSize());
      more.textContent = `Afficher ${next} chantier${next > 1 ? "s" : ""} de plus`;
    }
    if (announce && status) {
      status.textContent = `${match.length} chantier${match.length > 1 ? "s" : ""} — ${filter === "all" ? "toutes catégories" : labelOf(filter)}`;
    }
  };
  const setFilter = (cat, announce, updateUrl = true) => {
    filter = CATS.has(cat) ? cat : "all";
    limit = pageSize();
    if (gallery) {
      gallery.classList.toggle("is-filtered", filter !== "all");
      $$("[data-sizes-plain]", gallery).forEach((el) => el.setAttribute("sizes", filter === "all" ? el.dataset.sizesWide : el.dataset.sizesPlain));
    }
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === filter)));
    render(announce);
    if (updateUrl && history.replaceState) {
      const url = new URL(location.href);
      if (filter === "all") url.searchParams.delete("cat"); else url.searchParams.set("cat", filter);
      history.replaceState(history.state, "", url);
    }
  };
  if (items.length) {
    $$("[data-count]").forEach((el) => {
      const cat = el.dataset.count;
      el.textContent = String(items.filter((li) => inFilter(li, cat)).length);
    });
    chips.forEach((c) => c.addEventListener("click", () => setFilter(c.dataset.filter, true)));
    if (more) {
      more.addEventListener("click", (e) => {
        if (e.detail > 1) return; // second click of a double click would land on the card that moved under it
        const firstNew = matching()[limit];
        const rest = matching().length - limit;
        limit += rest <= pageSize() + 2 ? rest : pageSize();
        render(false);
        revealGuardUntil = performance.now() + 500;
        const link = firstNew && $(".g-link", firstNew);
        if (link) link.focus();
      });
    }
    $$("[data-filter-link]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.filterLink, true)));
    const initial = new URL(location.href).searchParams.get("cat");
    setFilter(initial || "all", false, initial !== null && !CATS.has(initial)); // drop an unknown ?cat= from the URL
    const target = location.hash.startsWith("#chantier-") && document.getElementById(location.hash.slice(1));
    const reveal = (t) => {
      if (!t || !items.includes(t)) return;
      const outside = !inFilter(t, filter), held = t.hidden;
      if (outside) setFilter("all", false);
      if (t.hidden) { limit = matching().indexOf(t) + 1; render(false); }
      if (outside || held) requestAnimationFrame(() => t.scrollIntoView());
      t.classList.remove("is-target"); void t.offsetWidth; t.classList.add("is-target");
      clearTimeout(t.__target); t.__target = setTimeout(() => t.classList.remove("is-target"), 2400);
    };
    reveal(target);
    window.addEventListener("hashchange", () => { if (location.hash.startsWith("#chantier-")) reveal(document.getElementById(location.hash.slice(1))); });
    onMedia("(max-width: 700px)", () => render(false));
  }
  if ($("#contact-form")) {
    $$("[data-quote], [data-who]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      goToForm({ cat: a.dataset.quote, who: a.dataset.who });
    }));
  }
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const strips = new Map(); // .g-item -> its strip
  if (items.length && !window.BB_NO_SWIPE && "IntersectionObserver" in window) {
    items.forEach((item) => {
      const set = $$(".g-set li", item), link = $(".g-link", item), pic = link && $("picture", link);
      if (set.length < 2 || !pic) return;
      const frame = document.createElement("span");
      frame.className = "g-frame";
      link.before(frame);
      frame.append(link);
      $$(":scope > .g-cap, :scope > .g-meta", link).forEach((el) => { frame.append(el); });
      const cap = $(".g-cap", frame);
      if (cap) cap.setAttribute("aria-hidden", "true");
      $$(":scope > noscript", link).forEach((el) => el.remove());
      link.classList.add("g-strip");
      const first = document.createElement("span");
      first.className = "g-slide";
      link.prepend(first);
      first.append(pic);
      const slides = [first];
      set.slice(1).forEach((li) => {
        const sl = document.createElement("span"), im = document.createElement("img");
        sl.className = "g-slide";
        sl.setAttribute("aria-hidden", "true");
        if (li.dataset.ph) sl.style.backgroundImage = `url("${li.dataset.ph}")`;
        im.alt = ""; im.decoding = "async"; im.loading = "lazy";
        im.width = Number(li.dataset.w) || 4; im.height = Number(li.dataset.h) || 3;
        sl.append(im);
        link.append(sl);
        slides.push(sl);
      });
      const dots = document.createElement("span");
      dots.className = "g-dots";
      dots.setAttribute("aria-hidden", "true");
      slides.forEach(() => dots.append(document.createElement("i")));
      const arrow = (dir) => { const a = document.createElement("span"); a.className = `g-arrow g-arrow-${dir < 0 ? "prev" : "next"}`;
        a.setAttribute("aria-hidden", "true"); a.textContent = dir < 0 ? "‹" : "›"; a.addEventListener("click", (e) => { e.preventDefault(); go((want ?? at) + dir); }); return a; };
      frame.append(dots, arrow(-1), arrow(1));
      const desc = document.createElement("span");
      desc.className = "sr";
      desc.setAttribute("aria-hidden", "true");
      desc.id = `desc-${item.dataset.id}`;
      frame.after(desc);
      const describedBy = link.getAttribute("aria-describedby");
      item.classList.add("has-strip");
      let at = 0, moved = false, want = null;
      const width = () => link.clientWidth || 1;
      const shown = () => Math.min(slides.length - 1, Math.max(0, Math.round(link.scrollLeft / width())));
      const fetchSlide = (k) => {
        if (k <= 0 || k >= slides.length) return;
        const im = $("img", slides[k]);
        if (im.getAttribute("src")) return;
        const li = set[k], fw = width(), fh = link.clientHeight || 1;
        const ratio = li.dataset.cardCut ? 4 / 3 : (Number(li.dataset.w) || 4) / (Number(li.dataset.h) || 3);
        im.sizes = `${Math.ceil(fw * Math.max(1, ratio / (fw / fh)))}px`;
        im.srcset = li.dataset.card || li.dataset.srcset || "";
        im.addEventListener("load", () => { if (moved && k === at && !saveData) fetchSlide(k + 1); }, { once: true });
        im.src = im.srcset.split(" ")[0] || li.dataset.src;
      };
      const sync = () => {
        const now = shown();
        if (want !== null && now === want) want = null;
        if (now === at) return;
        dots.children[at].classList.remove("is-on");
        dots.children[now].classList.add("is-on");
        at = now;
        frame.classList.toggle("is-first", at === 0);
        frame.classList.toggle("is-last", at === slides.length - 1);
        if (at === 0) { link.setAttribute("aria-describedby", describedBy); desc.textContent = ""; }
        else { desc.textContent = `Photo ${at + 1} sur ${slides.length} : ${set[at].dataset.alt}`; link.setAttribute("aria-describedby", desc.id); }
        const im = $("img", slides[at]);
        if (moved && im && im.complete && im.naturalWidth && !saveData) fetchSlide(at + 1);
      };
      const go = (k, instant) => {
        k = Math.max(0, Math.min(slides.length - 1, k));
        want = instant || k === shown() ? null : k;
        fetchSlide(k);
        link.scrollTo({ left: k * width(), behavior: instant || getComputedStyle(link).scrollBehavior === "auto" ? "instant" : "smooth" });
      };
      let raf = 0;
      link.addEventListener("scroll", () => {
        link.__moved = performance.now();
        if (link.scrollLeft > 0) moved = true;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const w = width(), x = link.scrollLeft;
          for (let k = Math.floor(x / w); k <= Math.min(slides.length - 1, Math.ceil((x + w) / w) - 1); k++) fetchSlide(k);
          sync();
        });
      }, { passive: true });
      if ("ResizeObserver" in window) new ResizeObserver(() => { if (link.clientWidth) { want = null; link.scrollTo({ left: at * width(), behavior: "instant" }); sync(); } }).observe(link);
      const atEnd = (dx) => (dx > 0 && link.scrollLeft <= 0) || (dx < 0 && link.scrollLeft >= link.scrollWidth - link.clientWidth - 1);
      let t0 = null;
      link.addEventListener("wheel", () => { want = null; }, { passive: true });
      link.addEventListener("scrollend", () => { want = null; sync(); });
      link.addEventListener("touchstart", (e) => { want = null; t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
      link.addEventListener("touchmove", (e) => {
        if (!t0 || !e.cancelable) return;
        const dx = e.touches[0].clientX - t0.x, dy = e.touches[0].clientY - t0.y;
        if (Math.abs(dx) > 4 && Math.abs(dx) > Math.abs(dy)) fetchSlide(at + (dx < 0 ? 1 : -1));
        if (Math.abs(dx) > Math.abs(dy) && atEnd(dx)) e.preventDefault();
      }, { passive: false });
      link.addEventListener("wheel", (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && atEnd(-e.deltaX)) e.preventDefault(); }, { passive: false });
      dots.children[0].classList.add("is-on");
      frame.classList.add("is-first");
      strips.set(item, { strip: link, slides, shown, go });
    });
  }
  const svc = $(".cards-swipe");
  if (svc && svc.children.length > 1) {
    const cards = Array.from(svc.children), dots = document.createElement("div");
    dots.className = "cards-dots";
    dots.setAttribute("aria-hidden", "true");
    cards.forEach(() => dots.append(document.createElement("i")));
    svc.after(dots);
    const scrolls = () => svc.scrollWidth > svc.clientWidth + 1;
    let on = -1, raf = 0;
    const mark = () => {
      raf = 0;
      const line = svc.getBoundingClientRect().left + (parseFloat(getComputedStyle(svc).scrollPaddingLeft) || 0);
      let k = 0;
      if (svc.scrollLeft >= svc.scrollWidth - svc.clientWidth - 1 && scrolls()) k = cards.length - 1;
      else cards.forEach((c, i) => { if (Math.abs(c.getBoundingClientRect().left - line) < Math.abs(cards[k].getBoundingClientRect().left - line)) k = i; });
      if (k === on) return;
      if (on >= 0) dots.children[on].classList.remove("is-on");
      dots.children[k].classList.add("is-on");
      on = k;
    };
    mark();
    svc.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
    window.addEventListener("resize", () => { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
    const atEnd = (dx) => scrolls() && ((dx > 0 && svc.scrollLeft <= 0) || (dx < 0 && svc.scrollLeft >= svc.scrollWidth - svc.clientWidth - 1));
    let t0 = null;
    svc.addEventListener("touchstart", (e) => { t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
    const onMove = (e) => {
      if (!t0 || !e.cancelable) return;
      const dx = e.touches[0].clientX - t0.x, dy = e.touches[0].clientY - t0.y;
      if (Math.abs(dx) > Math.abs(dy) && atEnd(dx)) e.preventDefault();
    };
    const onWheel = (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && atEnd(-e.deltaX)) e.preventDefault(); };
    const arm = (m) => { const f = m.matches ? "addEventListener" : "removeEventListener"; svc[f]("touchmove", onMove, { passive: false }); svc[f]("wheel", onWheel, { passive: false }); };
    arm(onMedia("screen and (max-width: 640px)", arm));
    svc.addEventListener("focusin", (e) => {
      const card = e.target.closest(".card");
      let kb = true; try { kb = e.target.matches(":focus-visible"); } catch { /* Safari before 15.4 has no :focus-visible */ }
      if (card && scrolls() && kb) card.scrollIntoView({ block: "nearest", inline: "start", behavior: "instant" });
    });
  }
  const syncFilterFromUrl = () => {
    if (!items.length) return;
    const cat = new URL(location.href).searchParams.get("cat") || "all";
    if (cat !== filter) setFilter(cat, true, false);
  };
  const lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function" && items.length) {
    if (history.state && history.state.lb) history.replaceState(null, "", location.href); // left over from a reload
    const img = $("#lb-img"), cap = $("#lb-cap"), count = $("#lb-count"), title = $("#lb-title"), sum = $("#lb-sum");
    const live = $("#lb-live"), prev = $("#lb-prev"), next = $("#lb-next"), cta = $("#lb-cta");
    let openedAt = 0, closedAt = -1e9;
    const closeLb = () => { closedAt = performance.now(); lb.close(); };
    let set = [], idx = 0, card = null, pushed = false, savedY = 0, restoreTo = null, pendingContact = false;
    let ctaPreset = {};
    const toContact = () => { goToForm(ctaPreset); if (formHere) presetUrl(ctaPreset.cat, ctaPreset.who); };
    const formHere = !!$("#contact-form");
    const ctaBase = cta.getAttribute("href");
    const restore = () => {
      if (!restoreTo) return;
      window.scrollTo(0, savedY);
      restoreTo.focus({ preventScroll: true });
      restoreTo = null;
    };
    const pre = $("#lb-pre"), stage = $(".lb-stage", lb);
    const shownWidth = (li) => {
      const w = Number(li.dataset.w) || 4, h = Number(li.dataset.h) || 3;
      const box = stage.getBoundingClientRect();
      const sw = box.width || window.innerWidth, sh = box.height || window.innerHeight * 0.7;
      return Math.max(1, Math.ceil(Math.min(sw, sh * w / h)));
    };
    const load = (el, li) => {
      if (el === img) el.fetchPriority = "high"; // the photo asked for comes before any gallery photo still loading
      el.sizes = `${shownWidth(li)}px`;
      el.srcset = li.dataset.srcset || "";
      el.src = li.dataset.src;
    };
    const STOP = new Set("le la les de des du un une et en à a au aux sur dans avec par pour d l qui son sa ses".split(" "));
    const words = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z]+/g)?.filter((w) => w.length > 1 && !STOP.has(w)) || [];
    const capInAlt = (capText, altText) => { const c = words(capText), a = new Set(words(altText)); return c.length > 0 && c.filter((w) => a.has(w)).length / c.length >= 0.7; };
    const checkHead = () => { const head = $(".lb-head", lb); if (head.scrollHeight > head.clientHeight + 1) head.tabIndex = 0; else head.removeAttribute("tabindex"); };
    window.addEventListener("resize", () => { if (!lb.open) return; checkHead(); if (set[idx]) img.sizes = `${shownWidth(set[idx])}px`; });
    let cardSrc = "", cardCut = null, cardPreview = "", slideSrcs = [];
    const paintCard = () => {
      const layers = [cardSrc && `url("${cardSrc}")`, cardPreview].filter(Boolean);
      img.style.backgroundImage = layers.join(", ");
      if (!layers.length) return;
      const [l, t, r, b] = cardCut || [0, 0, 1, 1], w = r - l, h = b - t;
      const size = `${w * 100}% ${h * 100}%`, pos = `${w < 1 ? (l / (1 - w)) * 100 : 50}% ${h < 1 ? (t / (1 - h)) * 100 : 50}%`;
      img.style.backgroundSize = layers.map(() => size).join(", ");
      img.style.backgroundPosition = layers.map(() => pos).join(", ");
    };
    const paintSlide = (k) => {
      const li = set[k], cut = li.dataset.cardCut ? li.dataset.cardCut.split(" ").map(Number) : null;
      const layers = [slideSrcs[k] && `url("${slideSrcs[k]}")`, li.dataset.ph && `url("${li.dataset.ph}")`].filter(Boolean);
      img.style.backgroundImage = layers.join(", ");
      const [l, t, r, b] = cut || [0, 0, 1, 1], w = r - l, h = b - t;
      img.style.backgroundSize = layers.map(() => `${w * 100}% ${h * 100}%`).join(", ");
      img.style.backgroundPosition = layers.map(() => `${w < 1 ? (l / (1 - w)) * 100 : 50}% ${h < 1 ? (t / (1 - h)) * 100 : 50}%`).join(", ");
    };
    const show = (i, announce) => {
      idx = (i + set.length) % set.length;
      const p = set[idx];
      img.removeAttribute("srcset");
      img.removeAttribute("src");
      img.width = Number(p.dataset.w) || 1600;
      img.height = Number(p.dataset.h) || 1200;
      if (idx === 0) paintCard(); else paintSlide(idx);
      load(img, p);
      stage.classList.toggle("is-loading", !(img.complete && img.naturalWidth) && !img.style.backgroundImage);
      if (!img.complete) img.addEventListener("load", () => { if (set[idx] === p) stage.classList.remove("is-loading"); }, { once: true });
      img.alt = p.dataset.alt;
      const t = title.textContent.toLowerCase();
      cap.textContent = t.startsWith(p.dataset.cap.toLowerCase()) ? "" : p.dataset.cap;
      count.textContent = set.length > 1 ? `Photo ${idx + 1} sur ${set.length}` : "";
      prev.hidden = next.hidden = set.length < 2;
      if (announce) live.textContent = `Photo ${idx + 1} sur ${set.length} : ${capInAlt(p.dataset.cap, p.dataset.alt || "") ? "" : p.dataset.cap + ". "}${p.dataset.alt || ""}`.trim();
      requestAnimationFrame(checkHead);
      if (set.length > 1 && pre && !saveData) {
        const shown = idx, prefetch = () => { if (lb.open && idx === shown) load(pre, set[(shown + 1) % set.length]); };
        if (img.complete && img.naturalWidth) prefetch(); else img.addEventListener("load", prefetch, { once: true });
      }
    };
    const open = (item, k = 0) => {
      card = item;
      const ul = $(".g-set", item);
      set = $$("li", ul);
      const st = strips.get(item);
      slideSrcs = st ? st.slides.map((sl) => { const i = $("img", sl); return i && i.complete && i.naturalWidth && !i.currentSrc.startsWith("data:") ? i.currentSrc : ""; }) : [];
      const cardImg = $(".g-link img", item), cur = cardImg ? cardImg.currentSrc : "";
      cardSrc = cur && !cur.startsWith("data:") ? cur : "";
      cardCut = item.dataset.cut ? item.dataset.cut.split(" ").map(Number) : null;
      const link = $(".g-link", item), pv = link ? link.style.backgroundImage : "";
      cardPreview = /^url\(/.test(pv) ? pv : "";
      title.textContent = ul.dataset.title;
      sum.textContent = ul.dataset.summary;
      cta.dataset.cat = item.dataset.quoteCat || item.dataset.cat; // a job can preset another form type than its gallery category
      cta.dataset.pro = item.dataset.pro || "";
      if (!formHere) {
        const [base, hash] = ctaBase.split("#"), from = document.body.dataset.page;
        cta.href = `${base.split("?")[0]}?devis=${encodeURIComponent(cta.dataset.cat)}${cta.dataset.pro === "1" ? "&qui=pro" : ""}${from ? "&depuis=" + encodeURIComponent(from) : ""}${hash ? "#" + hash : ""}`;
      }
      savedY = window.scrollY;
      openedAt = performance.now();
      if (window.BB_HOLD) window.BB_HOLD(true, cardImg);
      lb.showModal(); // first: the photo's width is chosen from the size of the open viewer
      show(k, false);
      $("#lb-close").focus(); // a long summary can be scrollable, and the browser would otherwise focus it first
      document.documentElement.style.overflow = "hidden";
      if (history.pushState) { history.pushState({ lb: 1 }, ""); pushed = true; }
    };
    gallery.addEventListener("click", (e) => {
      const link = e.target.closest(".g-link");
      if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (e.detail > 1 && performance.now() < revealGuardUntil) return; // second click of a "more" double click; a first click or a key is never blocked
      if (e.detail > 1 && performance.now() - closedAt < 600) return; // second click of the double click that closed the viewer
      const item = link.closest(".g-item"), st = strips.get(item);
      if (st && performance.now() - (st.strip.__moved || -1e9) < 200) return;
      open(item, st ? Math.min(st.shown(), $$(".g-set li", item).length - 1) : 0);
    });
    prev.addEventListener("click", () => show(idx - 1, true));
    next.addEventListener("click", () => show(idx + 1, true));
    $("#lb-close").addEventListener("click", () => closeLb());
    lb.addEventListener("click", (e) => { if (!(e.detail > 1 && performance.now() - openedAt < 600) && !e.target.closest("#lb-img, .lb-btn, .lb-cta, .lb-cap, .lb-head, .lb-count")) closeLb(); });
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && set.length > 1) { e.preventDefault(); show(idx - 1, true); }
      if (e.key === "ArrowRight" && set.length > 1) { e.preventDefault(); show(idx + 1, true); }
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null || set.length < 2) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), true);
      x0 = null;
    });
    let goContact = false;
    cta.addEventListener("click", (e) => {
      if (!formHere) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        pushed = false;
        closeLb();
        location.replace(cta.href);
        return;
      }
      e.preventDefault(); // the close handler goes back in history first; navigating now would be undone
      ctaPreset = { cat: cta.dataset.cat, who: cta.dataset.pro === "1" ? "Professionnel" : undefined };
      goContact = true;
      closeLb();
    });
    window.addEventListener("popstate", () => {
      if (lb.open) { pushed = false; closeLb(); return; }
      if (history.state && history.state.lb) { history.back(); return; }
      if (pendingContact) { pendingContact = false; setTimeout(toContact, 30); return; }
      if (restoreTo) { setTimeout(restore, 30); return; }
      syncFilterFromUrl();
    });
    lb.addEventListener("close", () => {
      closedAt = performance.now();
      if (window.BB_HOLD) window.BB_HOLD(false);
      document.documentElement.style.overflow = "";
      img.removeAttribute("srcset");
      img.removeAttribute("src");
      img.style.backgroundImage = "";
      img.style.backgroundSize = img.style.backgroundPosition = "";
      stage.classList.remove("is-loading");
      live.textContent = "";
      const st = card && strips.get(card);
      if (st && set.length === st.slides.length) st.go(idx, true);
      const link = card && $(".g-link", card);
      const target = link && !link.closest("[hidden]") ? link : null;
      const wentBack = pushed;
      if (pushed) {
        pushed = false;
        restoreTo = target;
        history.back(); // popstate then runs restore()
      } else if (target) {
        restoreTo = target;
        setTimeout(restore, 0); // closed by Back: the history step already happened
      }
      if (goContact) {
        goContact = false;
        restoreTo = null;
        if (wentBack) pendingContact = true; else toContact();
      }
    });
  }
  if (!lb || typeof lb.showModal !== "function") window.addEventListener("popstate", syncFilterFromUrl);
  window.addEventListener("beforeprint", () => { if (window.BB_RELEASE) window.BB_RELEASE(); $$("img[loading='lazy']").forEach((i) => { i.loading = "eager"; }); });
  const form = $("#contact-form");
  if (form) {
    const out = $("#form-status");
    const fields = {
      name: { el: $("#f-name"), err: $("#e-name"), msg: "Indiquez votre nom.", label: "Nom" },
      town: { el: $("#f-town"), err: $("#e-town"), msg: "Indiquez la commune du chantier.", label: "Commune du chantier" },
      message: { el: $("#f-msg"), err: $("#e-msg"), msg: "Décrivez votre projet en quelques mots.", label: "Votre projet" },
    };
    const phone = $("#f-phone"), phoneErr = $("#e-phone"), type = $("#f-type"), company = $("#f-company");
    const counter = $("#f-msg-count"), proOnly = $(".pro-only"), limitLive = $("#f-msg-live");
    form.noValidate = true; // the script shows its own error summary; without it the browser validates
    proOnly.hidden = form.elements.who.value !== "Professionnel";
    counter.hidden = true; // shown only near the limit, see updateCount
    const setErr = (el, errEl, text) => {
      errEl.textContent = text;
      if (text) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    };
    Object.values(fields).forEach((f) => f.el.addEventListener("input", () => { if (f.el.value.trim()) setErr(f.el, f.err, ""); }));
    phone.addEventListener("input", () => setErr(phone, phoneErr, ""));
    let buildMail = null; // set below; the counter measures the real mailto length, not characters
    const updateCount = () => {
      if (!buildMail) return;
      const left = MAILTO_MAX - buildMail().href.length;
      const msg = fields.message.el.value;
      const perChar = msg.length > 20 ? encodeURIComponent(msg).length / msg.length : 1.6; // URL cost per character of this text
      const approx = Math.max(0, Math.min(fields.message.el.maxLength - msg.length, Math.floor(left / perChar / 10) * 10));
      const over = left < 0;
      if (over !== counter.classList.contains("is-over") && limitLive) limitLive.textContent = over
        ? "Message trop long pour être préparé automatiquement."
        : "Longueur du message à nouveau correcte.";
      counter.classList.toggle("is-over", over);
      counter.hidden = !over && approx >= 200;
      counter.textContent = left < 0
        ? "Message trop long pour être préparé automatiquement\u202f: raccourcissez-le, ou vous pourrez le copier."
        : approx > 0 ? `Vous pouvez encore écrire environ ${approx} lettres.` : "Limite atteinte.";
    };
    [fields.message.el, fields.name.el, fields.town.el, company, phone].forEach((el) => el.addEventListener("input", updateCount));
    type.addEventListener("change", updateCount);
    type.addEventListener("change", () => { const n = $("#form-preset"); if (n) n.textContent = ""; });
    type.addEventListener("change", () => { const o = type.selectedOptions[0]; waFor(o && o.dataset.cat); }); // the line said what a link chose; the visitor has now chosen
    const hint = $("#f-msg-hint"), hintHome = hint.textContent;
    const HINT_PRO = "Adresse ou zone du site, surface, accès et horaires, n° de bon de commande éventuel…";
    $$("input[name='who']", form).forEach((r) => r.addEventListener("change", () => {
      proOnly.hidden = form.elements.who.value !== "Professionnel";
      hint.textContent = proOnly.hidden ? hintHome : HINT_PRO;
      updateCount();
    }));
    buildMail = () => {
      const ph = phone.value.trim();
      const who = form.elements.who.value;
      const name = fields.name.el.value.trim();
      const town = fields.town.el.value.trim();
      const kind = type.value;
      const org = who === "Professionnel" && company.value.trim() ? company.value.trim() : "";
      const fromPage = pageFrom();
      const subject = `Demande de devis${org ? " — " + org : who === "Professionnel" ? " — entreprise" : ""}${kind ? " — " + kind : fromPage ? " — " + fromPage : ""} — ${town}`;
      const msg = fields.message.el.value.trim();
      const greets = /^(bonjour|bonsoir|salut|hello|coucou)\b|^(madame|monsieur|mesdames|messieurs|cher|chère|chers)\b[^.\n]{0,40},/i.test(msg);
      const lines = [
        ...(greets ? [] : [GREETING, ""]),
        msg, "",
        `Type de travaux : ${kind || "non précisé"}`,
        `Commune du chantier : ${town}`,
        `Nom : ${name}`,
      ];
      if (org) lines.push(`Société : ${org}`);
      const from = pageFrom();
      lines.push(`Téléphone : ${ph || "non communiqué"}`, `Demande : ${who.toLowerCase()}`, "", from ? `(Message préparé depuis la page ${from} du site ${SITE})` : `(Message préparé depuis le site ${SITE})`);
      const body = lines.join("\r\n");
      const href = `mailto:${EMAIL}?${CC ? `cc=${encodeURIComponent(CC)}&` : ""}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const plain = `À : ${EMAIL}\r\n${CC ? `Cc : ${CC}\r\n` : ""}Objet : ${subject}\r\n\r\n${body}`;
      return { href, plain };
    };
    updateCount();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = [];
      Object.values(fields).forEach((f) => {
        const ok = f.el.value.trim().length > 0;
        setErr(f.el, f.err, ok ? "" : f.msg);
        if (!ok) bad.push(f);
      });
      const ph = phone.value.trim();
      const phoneBad = ph && ph.replace(/[^\d]/g, "").length < 9;
      setErr(phone, phoneErr, phoneBad ? "Ce numéro semble incomplet (au moins 9 chiffres)." : "");
      out.classList.remove("is-error");
      if (bad.length || phoneBad) {
        const labels = bad.map((f) => f.label).concat(phoneBad ? ["Téléphone"] : []);
        out.classList.add("is-error");
        out.textContent = `${labels.length} champ${labels.length > 1 ? "s" : ""} à corriger\u202f: ${labels.join(", ")}.`;
        (bad[0] ? bad[0].el : phone).focus();
        return;
      }
      const { href, plain } = buildMail();
      out.replaceChildren();
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      const tel = Object.assign(document.createElement("a"), { href: PHONE_HREF, textContent: PHONE_TEXT });
      if (href.length > MAILTO_MAX) {
        out.classList.add("is-error");
        p1.textContent = "Votre message est trop long pour être préparé automatiquement. Copiez-le, puis collez-le dans un e-mail à " + EMAIL + ".";
        p2.append(copyButton("Copier le message", plain, out), copyButton("Copier l'adresse", EMAIL, out));
        out.append(p1, p2);
        return;
      }
      const strong = document.createElement("strong");
      strong.textContent = "Votre messagerie va s'ouvrir avec le message prêt.";
      p1.append(strong, " Ajoutez vos photos si vous le souhaitez, puis cliquez sur « Envoyer ».");
      p2.append("Rien ne s'ouvre\u202f? ", copyButton("Copier le message", plain, out), copyButton("Copier l'adresse", EMAIL, out), " puis collez-les dans votre webmail, ou appelez le ", tel, ".");
      out.append(p1, p2);
      openMail(href);
    });
  }
  const presetUrl = (cat, who) => {
    if (!history.replaceState) return;
    const u = new URL(location.href);
    if (cat) u.searchParams.set("devis", cat); else u.searchParams.delete("devis");
    if (who === "Professionnel") u.searchParams.set("qui", "pro"); else u.searchParams.delete("qui");
    u.hash = "contact-form";
    history.replaceState(history.state, "", u);
  };
  if (form) {
    const typeCat = () => { const o = $("#f-type").selectedOptions[0]; return (o && o.dataset.cat) || ""; };
    const follow = (e) => { if (!e.isTrusted) return; const u = new URL(location.href); if (u.searchParams.has("devis") || u.searchParams.has("qui") || u.hash === "#contact-form") presetUrl(typeCat(), form.elements.who.value); };
    $("#f-type").addEventListener("change", follow);
    $$("input[name='who']", form).forEach((r) => r.addEventListener("change", follow));
    $$("[data-quote], [data-who]").forEach((a) => a.addEventListener("click", () => presetUrl(typeCat(), form.elements.who.value)));
  }
  const preset = new URL(location.href).searchParams;
  if (form && (preset.has("devis") || preset.has("qui") || location.hash === "#contact-form")) {
    const cat = preset.get("devis") || undefined;
    const who = preset.get("qui") === "pro" ? "Professionnel" : undefined;
    const clean = new URL(location.href);
    clean.hash = "";
    if (history.replaceState) history.replaceState(history.state, "", clean);
    const land = () => {
      goToForm({ cat, who });
      clean.hash = "contact-form";
      if (history.replaceState) history.replaceState(history.state, "", clean);
    };
    if (document.readyState === "complete") land();
    else window.addEventListener("load", land, { once: true });
  }
  window.BB_READY = true; // last line: the inline check in <head> keeps the no-JS layout if anything above failed
  } catch (err) {
    noJsFallback();
    throw err;
  }
})();
