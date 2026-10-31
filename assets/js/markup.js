/* Sodaro Sites home: the markup hero. Type a business name and pick a trade: the example site rebuilds with that
   name; flip to "The old way" for the red-pen critique. One build-and-ink sequence on load; after that, motion only
   answers what the visitor does. */
(function () {
  "use strict";
  var stage = document.getElementById("mkStage");
  if (!stage) return;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nw = stage.querySelector(".mk-new"), url = document.getElementById("mkUrl"), input = document.getElementById("mkName");
  var cta = document.getElementById("mkCta");

  // example layouts only: the default names say "Your ...", so no one mistakes them for a client
  var TRADES = {
    contractor: { t1: "#2a5bff", t2: "#0b1d5c", name: "Your Roofing Co.", h: "Roofs done right, the first time.", p: "Licensed, insured and local. Free estimates within 48 hours.",
      a: "Free estimate", b: "Call now", c1: "Services", d1: "Roofing, siding, gutters", c2: "Our work", d2: "Before and after photos" },
    restaurant: { t1: "#ff7a3d", t2: "#5c1408", name: "Your Pizzeria", h: "Brick-oven pies, made to order.", p: "Order online for pickup or delivery. Open late, seven days.",
      a: "Order online", b: "Call now", c1: "Menu", d1: "Real dishes, real prices", c2: "Order", d2: "Pickup or delivery" },
    salon: { t1: "#e05bd6", t2: "#3d0a45", name: "Your Salon", h: "Look good. Feel better.", p: "Book your cut, color or nails online in under a minute.",
      a: "Book online", b: "Text us", c1: "Services", d1: "Cut, color, nails", c2: "Stylists", d2: "Meet the team" },
    shop: { t1: "#17b388", t2: "#063f31", name: "Your Shop", h: "Local goods, ready today.", p: "Browse the catalog, buy online, or pick up in store.",
      a: "Shop now", b: "Visit us", c1: "Catalog", d1: "Search everything", c2: "Pickup", d2: "Ready in an hour" },
  };
  var trade = "contractor";

  function slug(s) { return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "").slice(0, 28); }
  function render(swap) {
    var T = TRADES[trade], name = (input.value || "").trim() || T.name;
    function apply() {
      nw.style.setProperty("--t1", T.t1); nw.style.setProperty("--t2", T.t2);
      nw.querySelectorAll("[data-f]").forEach(function (el) { var k = el.dataset.f; el.textContent = k === "name" ? name : T[k]; });
      url.textContent = (slug(name) || slug(T.name)) + ".com";
      nw.classList.remove("swap");
    }
    if (swap && !calm) { nw.classList.add("swap"); setTimeout(apply, 180); } else apply();
    // the demo request carries what they typed, so the form starts filled in
    if (cta) cta.href = "contact.html" + ((input.value || "").trim() ? "?business=" + encodeURIComponent(input.value.trim()) + "&type=" + trade : "") + "#demo";
  }
  input.addEventListener("input", function () { render(false); });
  document.querySelectorAll(".mk-trades button").forEach(function (b) {
    b.addEventListener("click", function () {
      trade = b.dataset.trade;
      document.querySelectorAll(".mk-trades button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      view("new"); render(true);
    });
  });

  // new site / the old way: the pen redraws for whichever is showing
  function view(v) {
    if (stage.dataset.view === v) return;
    stage.dataset.view = v;
    stage.querySelectorAll(".mk-switch button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.view === v)); });
    stage.classList.remove("inked"); void stage.offsetWidth; stage.classList.add("inked");
  }
  stage.querySelectorAll(".mk-switch button").forEach(function (b) { b.addEventListener("click", function () { view(b.dataset.view); }); });

  // the one load moment: the demo builds, then the pen writes on it
  stage.querySelectorAll(".mk-ink path, .mk-ink ellipse").forEach(function (p) { p.setAttribute("pathLength", "1"); });
  if (calm) { stage.classList.add("inked"); }
  else {
    stage.classList.add("build");
    setTimeout(function () { stage.classList.add("inked"); }, 900);
  }
})();
