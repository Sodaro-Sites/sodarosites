/* Sodaro Sites: the interaction layer. Scroll progress, the hero spotlight, magnetic buttons, card tilt + spotlight,
   staggered reveals, and the hero "studio" (drag before/after, tap a business type to restyle the demo).
   Everything degrades: no JS = the plain page; reduced motion = no movement. */
(function () {
  "use strict";
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer: fine)").matches;

  // scroll progress bar
  var bar = document.createElement("div");
  bar.className = "fx-progress";
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty("--p", h > 0 ? Math.min(1, scrollY / h) : 0);
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // stagger reveals that sit side by side
  document.querySelectorAll(".grid, .pricing, .care").forEach(function (g) {
    Array.prototype.forEach.call(g.querySelectorAll(":scope > .reveal"), function (el, i) { el.style.setProperty("--d", i); });
  });

  // hero spotlight follows the pointer
  var hero = document.querySelector(".fx-hero");
  var spot = hero && hero.querySelector(".fx-spot");
  if (hero && spot && fine && !calm) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      spot.style.setProperty("--sx", e.clientX - r.left + "px");
      spot.style.setProperty("--sy", e.clientY - r.top + "px");
    });
  }

  // cards: spotlight everywhere, tilt on pointer devices
  document.querySelectorAll(".card, .plan").forEach(function (c) {
    c.classList.add("fx-card");
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px");
      c.style.setProperty("--my", y + "px");
      if (fine && !calm && c.classList.contains("lift")) {
        var rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 8;
        c.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      }
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });

  // magnetic primary buttons
  if (fine && !calm) {
    document.querySelectorAll(".btn-primary").forEach(function (b) {
      b.classList.add("fx-mag");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", (e.clientX - r.left - r.width / 2) * .18 + "px");
        b.style.setProperty("--by", (e.clientY - r.top - r.height / 2) * .3 + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  // the studio: before/after slider + business-type restyle
  var studio = document.querySelector("[data-studio]");
  if (!studio) return;
  var ba = studio.querySelector(".ba"), range = studio.querySelector(".ba-range");
  function setX(v) { ba.style.setProperty("--x", v + "%"); }
  range.addEventListener("input", function () { setX(range.value); stop(); });
  // a gentle sweep on load shows it can be dragged
  var auto = !calm, t0 = performance.now();
  function sweep(t) {
    if (!auto) return;
    var k = (t - t0) / 2600;
    if (k > 1) { setX(42); range.value = 42; return; }
    var v = 42 + Math.sin(k * Math.PI * 2) * 30 * (1 - k);
    setX(v.toFixed(1));
    requestAnimationFrame(sweep);
  }
  function stop() { auto = false; }
  if (auto) setTimeout(function () { t0 = performance.now(); requestAnimationFrame(sweep); }, 900);
  ba.addEventListener("pointerdown", stop);

  // example layouts only: the names say "Your ..." so no one mistakes them for a real client
  var THEMES = {
    restaurant: { t1: "#ff6b35", t2: "#7a1d0e", url: "yourpizzeria.com", name: "Your Pizzeria", h: "Brick-oven pies, made to order.", p: "Order online for pickup or delivery. Open late, seven days.",
      a: "Order online", b: "Call now", cards: [["Menu", "Real dishes, real prices"], ["Order", "Pickup or delivery"], ["Reviews", "★★★★★"]] },
    contractor: { t1: "#1f5bff", t2: "#0b1b3a", url: "yourroofingco.com", name: "Your Roofing Co.", h: "Roofs done right, the first time.", p: "Licensed, insured and local. Free estimates within 48 hours.",
      a: "Free estimate", b: "Call now", cards: [["Services", "Roofing · siding · gutters"], ["Our work", "Before & after photos"], ["Reviews", "★★★★★"]] },
    salon: { t1: "#d946ef", t2: "#3b0764", url: "yoursalon.com", name: "Your Salon", h: "Look good. Feel better.", p: "Book your cut, color or nails online in under a minute.",
      a: "Book online", b: "Text us", cards: [["Services", "Cut · color · nails"], ["Stylists", "Meet the team"], ["Reviews", "★★★★★"]] },
    shop: { t1: "#10b981", t2: "#064e3b", url: "yourshop.com", name: "Your Shop", h: "Local goods, shipped fast.", p: "Browse the catalog, buy online, or pick up in store today.",
      a: "Shop now", b: "Visit us", cards: [["Catalog", "Search everything"], ["Pickup", "Ready in an hour"], ["Reviews", "★★★★★"]] },
  };
  var nb = studio.querySelector(".new-body"), url = studio.querySelector(".pane-new .bar b");
  function theme(k) {
    var T = THEMES[k]; if (!T) return;
    studio.classList.add("swap");
    setTimeout(function () {
      ba.style.setProperty("--t1", T.t1); ba.style.setProperty("--t2", T.t2);
      url.textContent = T.url;
      nb.querySelector(".nb-nav b").textContent = T.name;
      nb.querySelector(".nb-h").textContent = T.h;
      nb.querySelector(".nb-p").textContent = T.p;
      var cta = nb.querySelectorAll(".nb-cta b"); cta[0].textContent = T.a; cta[1].textContent = T.b;
      var cs = nb.querySelectorAll(".nb-cards div");
      T.cards.forEach(function (c, i) { if (cs[i]) { cs[i].querySelector("b").textContent = c[0]; cs[i].querySelector("small").textContent = c[1]; } });
      studio.classList.remove("swap");
    }, calm ? 0 : 200);
    studio.querySelectorAll(".studio-tabs button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === k)); });
  }
  studio.querySelectorAll(".studio-tabs button").forEach(function (b) {
    b.addEventListener("click", function () { stop(); theme(b.dataset.theme); setX(3); range.value = 3; });   // show off the restyled site
  });
})();
