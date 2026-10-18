/* BBconstruct — progressive enhancement only: every page is fully readable without JS.
   Runs on the home page (form, filters, gallery) and on the service pages (their own gallery, no form):
   every feature checks that its elements exist. */
(() => {
  "use strict";
  // if anything below throws, the page goes back to its no-JS state: no-JS layout, whole gallery, browser validation
  const noJsFallback = () => {
    document.documentElement.classList.remove("js");
    document.querySelectorAll(".g-item").forEach((li) => { li.hidden = false; });
    const f = document.getElementById("contact-form");
    if (f) f.noValidate = false;
    document.querySelectorAll(".pro-only").forEach((el) => { el.hidden = false; });
    const moreRow = document.querySelector(".more-row");
    if (moreRow) moreRow.hidden = true;
  };
  try {
  document.documentElement.classList.add("js");

  // older Safari lacks MediaQueryList.addEventListener
  const onMedia = (q, fn) => { const m = window.matchMedia(q); if (m.addEventListener) m.addEventListener("change", fn); else if (m.addListener) m.addListener(fn); return m; };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const EMAIL = "bbconstruct@outlook.be";
  const PHONE_HREF = "tel:+32471410184";
  const PHONE_TEXT = "0471 41 01 84";
  const MAILTO_MAX = 1800; // several mail clients drop mailto URLs past ~2000 characters

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // in-app browsers (Facebook, Instagram) often block the async clipboard: fall back to a selected textarea
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

  // every "ask for a quote" path lands on the form with what the link already knows
  const goToForm = ({ cat, who } = {}) => {
    const form = $("#contact-form");
    if (!form) return;
    const opt = cat && $(`#f-type option[data-cat="${cat}"]`);
    if (opt) opt.selected = true;
    const radio = who && $(`input[name="who"][value="${who}"]`, form);
    if (radio && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    form.scrollIntoView();
    $("#f-name").focus({ preventScroll: true });
  };

  /* ---------- header: solid on scroll, mobile menu */
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
    // close when keyboard focus leaves the menu and its toggle
    header.addEventListener("focusout", (e) => {
      if (menuOpen() && e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setMenu(false, false);
    });
    // a tap on the dimmed page, or scrolling it, dismisses the menu
    // the dimmed scrim is drawn by the header itself, so "outside" means outside the menu and the header controls
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

  /* "Services" dropdown on wide screens: Escape hides it until the pointer or the focus leaves (WCAG 1.4.13) */
  const subs = $$(".nav .has-sub");
  const dropdown = (li) => { const u = $(".sub", li); return !!u && getComputedStyle(u).position === "absolute"; };
  subs.forEach((li) => {
    li.addEventListener("mouseleave", () => li.classList.remove("sub-closed"));
    li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) li.classList.remove("sub-closed"); });
    li.addEventListener("focusin", (e) => { if (e.target.closest(".sub")) li.classList.remove("sub-closed"); });
  });
  if (subs.length) document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    subs.forEach((li) => {
      if (!dropdown(li) || !li.matches(":hover, :focus-within")) return;
      if (li.contains(document.activeElement)) $("a", li).focus();
      li.classList.add("sub-closed");
    });
  });

  /* floating call button: only once the hero (with its own call link) has scrolled away, and not over the contact section */
  if (fab && "IntersectionObserver" in window) {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => seen.set(en.target, en.isIntersecting));
      fab.classList.toggle("is-hidden", Array.from(seen.values()).some(Boolean));
    }, { threshold: 0 });
    // also hidden over the gallery and the services, whose cards carry their own links (the header call button stays on screen)
    [hero, contact, document.getElementById("realisations"), document.getElementById("services"), document.getElementById("chantiers")].forEach((el) => { if (el) io.observe(el); });
    // and whenever another orange call or quote button is on screen, so two orange buttons never meet
    document.querySelectorAll("main .btn-orange").forEach((el) => io.observe(el));
  } else if (fab) {
    fab.classList.remove("is-hidden");
  }

  /* current-section marker in the nav */
  // one owner: the section crossing the middle band of the viewport; the hero stands for "Accueil" and marks nothing
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

  /* ---------- gallery: one card per job, filters, "show more" */
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

  const render = (announce) => {
    const match = matching();
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
    // the page size changes with the breakpoint (rotation, resized window): recount what the button offers
    onMedia("(max-width: 700px)", () => render(false));
  }
  // quote links: on the page that has the form, they fill it in place; elsewhere they are plain links to it
  if ($("#contact-form")) {
    $$("[data-quote], [data-who]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      goToForm({ cat: a.dataset.quote, who: a.dataset.who });
    }));
  }

  // only when the URL's filter differs: in-page anchors and the lightbox's own history step must not reset the page
  const syncFilterFromUrl = () => {
    if (!items.length) return;
    const cat = new URL(location.href).searchParams.get("cat") || "all";
    if (cat !== filter) setFilter(cat, true, false);
  };

  /* ---------- lightbox: browses the photos of one job; Back closes it
     History contract: opening pushes one {lb:1} entry, so the phone's Back closes the photo instead of
     leaving the page. Closing by ✕, Escape or a click goes back over that entry (pushed -> history.back()),
     and popstate then restores the scroll and focus the browser's fragment scroll would otherwise lose.
     Forward onto a closed viewer's entry is skipped. Change one of these and check the other three. */
  const lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function" && items.length) {
    if (history.state && history.state.lb) history.replaceState(null, "", location.href); // left over from a reload
    const img = $("#lb-img"), cap = $("#lb-cap"), count = $("#lb-count"), title = $("#lb-title"), sum = $("#lb-sum");
    const live = $("#lb-live"), prev = $("#lb-prev"), next = $("#lb-next"), cta = $("#lb-cta");
    let openedAt = 0, closedAt = -1e9;
    // every way of closing goes through here, so the second click of a double click knows the viewer just closed
    const closeLb = () => { closedAt = performance.now(); lb.close(); };
    let set = [], idx = 0, card = null, pushed = false, savedY = 0, restoreTo = null, pendingContact = false;
    let ctaPreset = {};
    const toContact = () => goToForm(ctaPreset);
    // a service page has no form: the button is a link to the home page's form, with the type in the URL (?devis=, &qui=pro)
    const formHere = !!$("#contact-form");
    const ctaBase = cta.getAttribute("href");
    // restore position and focus once the history step is done: traversing back to an entry with a #fragment
    // would otherwise scroll to that fragment and drop the focus
    const restore = () => {
      if (!restoreTo) return;
      window.scrollTo(0, savedY);
      restoreTo.focus({ preventScroll: true });
      restoreTo = null;
    };

    // the browser picks the width (800, 1200 or 1600 px) from the size the photo is shown at and the screen density;
    // the next photo is fetched the same way into a hidden image, so it is the very file the viewer will then show
    const pre = $("#lb-pre"), stage = $(".lb-stage", lb);
    const shownWidth = (li) => {
      const w = Number(li.dataset.w) || 4, h = Number(li.dataset.h) || 3;
      const box = stage.getBoundingClientRect();
      const sw = box.width || window.innerWidth, sh = box.height || window.innerHeight * 0.7;
      return Math.max(1, Math.ceil(Math.min(sw, sh * w / h)));
    };
    const load = (el, li) => {
      el.sizes = `${shownWidth(li)}px`;
      el.srcset = li.dataset.srcset || "";
      el.src = li.dataset.src;
    };
    const checkHead = () => { const head = $(".lb-head", lb); if (head.scrollHeight > head.clientHeight + 1) head.tabIndex = 0; else head.removeAttribute("tabindex"); };
    // a rotated phone or a resized window shows the photo bigger: let the browser take a wider file if it now needs one
    window.addEventListener("resize", () => { if (!lb.open) return; checkHead(); if (set[idx]) img.sizes = `${shownWidth(set[idx])}px`; });
    const show = (i, announce) => {
      idx = (i + set.length) % set.length;
      const p = set[idx];
      img.width = Number(p.dataset.w) || 1600;
      img.height = Number(p.dataset.h) || 1200;
      load(img, p);
      img.alt = p.dataset.alt;
      const t = title.textContent.toLowerCase();
      cap.textContent = t.startsWith(p.dataset.cap.toLowerCase()) ? "" : p.dataset.cap;
      count.textContent = set.length > 1 ? `Photo ${idx + 1} sur ${set.length}` : "";
      prev.hidden = next.hidden = set.length < 2;
      if (announce) live.textContent = `Photo ${idx + 1} sur ${set.length} : ${p.dataset.cap}. ${p.dataset.alt || ""}`.trim();
      requestAnimationFrame(checkHead);
      if (set.length > 1 && pre) load(pre, set[(idx + 1) % set.length]);
    };

    const open = (item) => {
      card = item;
      const ul = $(".g-set", item);
      set = $$("li", ul);
      title.textContent = ul.dataset.title;
      sum.textContent = ul.dataset.summary;
      cta.dataset.cat = item.dataset.quoteCat || item.dataset.cat; // a job can preset another form type than its gallery category
      cta.dataset.pro = item.dataset.pro || "";
      if (!formHere) {
        const [base, hash] = ctaBase.split("#");
        cta.href = `${base.split("?")[0]}?devis=${encodeURIComponent(cta.dataset.cat)}${cta.dataset.pro === "1" ? "&qui=pro" : ""}${hash ? "#" + hash : ""}`;
      }
      savedY = window.scrollY;
      openedAt = performance.now();
      lb.showModal(); // first: the photo's width is chosen from the size of the open viewer
      show(0, false);
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
      open(link.closest(".g-item"));
    });
    prev.addEventListener("click", () => show(idx - 1, true));
    next.addEventListener("click", () => show(idx + 1, true));
    $("#lb-close").addEventListener("click", () => closeLb());
    // a click anywhere that is not the photo, a button or the link closes
    // the second click of the double click that opened the viewer must not close it
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
      if (!formHere) return; // follows the link to the home page's form
      e.preventDefault(); // the close handler goes back in history first; navigating now would be undone
      ctaPreset = { cat: cta.dataset.cat, who: cta.dataset.pro === "1" ? "Professionnel" : undefined };
      goContact = true;
      closeLb();
    });
    window.addEventListener("popstate", () => {
      if (lb.open) { pushed = false; closeLb(); return; }
      if (history.state && history.state.lb) { history.back(); return; }
      // the browser scrolls to the entry's #fragment (and drops focus) after popstate: act once it has
      if (pendingContact) { pendingContact = false; setTimeout(toContact, 30); return; }
      if (restoreTo) { setTimeout(restore, 30); return; }
      syncFilterFromUrl();
    });
    lb.addEventListener("close", () => {
      closedAt = performance.now();
      document.documentElement.style.overflow = "";
      img.removeAttribute("srcset");
      img.removeAttribute("src");
      live.textContent = "";
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

  /* lazy images never load for print: load them first */
  window.addEventListener("beforeprint", () => $$("img[loading='lazy']").forEach((i) => { i.loading = "eager"; }));

  /* ---------- contact form -> e-mail prepared in the visitor's own mail app (no backend, nothing stored) */
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
      const subject = `Demande de devis${org ? " — " + org : who === "Professionnel" ? " — entreprise" : ""}${kind ? " — " + kind : ""} — ${town}`;
      const lines = [
        "Bonjour Benjamin,", "",
        fields.message.el.value.trim(), "",
        `Type de travaux : ${kind || "non précisé"}`,
        `Commune du chantier : ${town}`,
        `Nom : ${name}`,
      ];
      if (org) lines.push(`Société : ${org}`);
      lines.push(`Téléphone : ${ph || "non communiqué"}`, `Demande : ${who.toLowerCase()}`, "", "(Message préparé depuis le site bbconstruct.site)");
      const body = lines.join("\r\n");
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const plain = `À : ${EMAIL}\r\nObjet : ${subject}\r\n\r\n${body}`;

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
      window.location.href = href;
    });
  }
  // arriving from a service page's quote link: ?devis=<type> (and &qui=pro) preset the form, then leave the URL
  const preset = new URL(location.href).searchParams;
  if (form && (preset.has("devis") || preset.has("qui"))) {
    const cat = preset.get("devis") || undefined;
    const who = preset.get("qui") === "pro" ? "Professionnel" : undefined;
    const clean = new URL(location.href);
    clean.searchParams.delete("devis");
    clean.searchParams.delete("qui");
    // the #contact-form fragment is for the no-JS case; with it in the URL, the browser's own jump to it at load
    // takes the focus back from the name field, so the script drops it and scrolls itself
    clean.hash = "";
    if (history.replaceState) history.replaceState(history.state, "", clean);
    // once the page is laid out (fonts, images), or the scroll lands short of the form
    if (document.readyState === "complete") goToForm({ cat, who });
    else window.addEventListener("load", () => goToForm({ cat, who }), { once: true });
  }
  window.BB_READY = true; // last line: the inline check in <head> keeps the no-JS layout if anything above failed
  } catch (err) {
    noJsFallback();
    throw err;
  }
})();
