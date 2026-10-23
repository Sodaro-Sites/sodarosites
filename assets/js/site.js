/* Sodaro Sites — shared script */

/* ============================================================
   ONE PLACE FOR ALL PAYMENT LINKS.
   Paste each Stripe payment link URL between the quotes.
   Leave a value as "" and every button for it safely falls back
   to "contact us" instead of breaking.
   ============================================================ */
const SODARO_CONFIG = {
  stripe: {
    localHero: "https://buy.stripe.com/00w14ocom0RSczo5YxbV600",       // Local Hero Pack — $499 one-time
    corporate: "https://buy.stripe.com/cNi00kgEC8kk56W4UtbV601",       // Better Than Corporate — $899 one-time
    careLocal: "https://buy.stripe.com/dRmbJ2com8kk7f4fz7bV602",       // Sodaro Care (Local) — $49/month
    careCorporate: "https://buy.stripe.com/7sY4gAgEC8kkargfz7bV603"    // Sodaro Care (Corporate) — $99/month
  },
  contact: {
    email: "sodarosites@gmail.com",
    phoneDisplay: "(631) 383-6322",
    phoneE164: "+16313836322"
  },
  // Free form relay. First submission sends a one-time activation email to the inbox above.
  formEndpoint: "https://formsubmit.co/ajax/sodarosites@gmail.com",
  formTimeoutMs: 12000
};

(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var cfg = SODARO_CONFIG;

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Buy buttons read from the config ---------- */
  function isStripeLink(url) {
    return typeof url === "string" && /^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com)\//.test(url);
  }
  document.querySelectorAll("[data-buy]").forEach(function (btn) {
    var key = btn.getAttribute("data-buy");
    var url = cfg.stripe[key];
    if (isStripeLink(url)) {
      btn.setAttribute("href", url);
      btn.setAttribute("rel", "noopener");
    } else {
      // Safe fallback: no live link yet, so route to contact instead of a dead button.
      btn.setAttribute("href", "contact.html?package=" + encodeURIComponent(key) + "#demo");
      btn.setAttribute("title", "Contact us to complete your purchase");
      var note = btn.parentElement && btn.parentElement.querySelector(".buy-fallback");
      if (note) note.hidden = false;
    }
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Demo request form ---------- */
  var form = document.getElementById("demo-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector("button[type=submit]");
  var labelEl = submitBtn ? submitBtn.querySelector(".label-text") : null;

  // Pre-select package from ?package=
  var params = new URLSearchParams(window.location.search);
  var pkg = params.get("package");
  var pkgMap = {
    localHero: "Local Hero Pack ($499)",
    corporate: "Better Than Corporate ($899)",
    careLocal: "Sodaro Care Local ($49/mo)",
    careCorporate: "Sodaro Care Corporate ($99/mo)"
  };
  var pkgSelect = form.querySelector("[name=package]");
  if (pkg && pkgMap[pkg] && pkgSelect) {
    Array.prototype.forEach.call(pkgSelect.options, function (o) {
      if (o.value === pkgMap[pkg]) pkgSelect.value = o.value;
    });
    if (pkg === "localHero" || pkg === "corporate" || pkg === "careLocal" || pkg === "careCorporate") {
      var pn = document.getElementById("pay-notice");
      if (pn) pn.hidden = false;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function collect() {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name === "_honey") return;
      data[el.name] = (el.value || "").trim();
    });
    return data;
  }

  function mailtoFor(data) {
    var lines = [
      "Business: " + (data.business || ""),
      "Name: " + (data.name || ""),
      "Phone: " + (data.phone || ""),
      "Email: " + (data.email || ""),
      "Town: " + (data.town || ""),
      "Current site / Facebook / Google: " + (data.links || ""),
      "What the business does: " + (data.about || ""),
      "Package leaning: " + (data.package || "")
    ];
    return "mailto:" + cfg.contact.email +
      "?subject=" + encodeURIComponent("Free demo request — " + (data.business || "new business")) +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("loading", on);
    submitBtn.setAttribute("aria-disabled", on ? "true" : "false");
    submitBtn.disabled = on;
    if (labelEl) labelEl.textContent = on ? "Sending…" : "Get my free demo";
  }

  function showStatus(kind, html) {
    statusEl.className = "form-status show " + kind;
    statusEl.innerHTML = html;
    statusEl.setAttribute("tabindex", "-1");
    statusEl.focus({ preventScroll: true });
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form._honey && form._honey.value) return; // bot
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var data = collect();
    var payload = Object.assign({}, data, {
      _subject: "New free demo request — " + (data.business || "Sodaro Sites"),
      _template: "table",
      _captcha: "false"
    });

    setLoading(true);
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, cfg.formTimeoutMs);

    fetch(cfg.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || String(json.success) !== "true") throw new Error("send failed");
          return json;
        });
      })
      .then(function () {
        clearTimeout(timer);
        setLoading(false);
        form.reset();
        showStatus("ok",
          "Got it, " + escapeHtml(data.name || "thanks") + "! Your request for <strong>" + escapeHtml(data.business || "your business") +
          "</strong> is in. Aaron will reach out within 1 business day. Want it faster? Call or text <a href=\"tel:" +
          cfg.contact.phoneE164 + "\">" + cfg.contact.phoneDisplay + "</a>.");
      })
      .catch(function () {
        clearTimeout(timer);
        setLoading(false);
        showStatus("err",
          "We couldn't send that automatically — nothing is lost. Tap <a href=\"" + mailtoFor(data) +
          "\">email it to us instead</a> (it's pre-filled), or call/text <a href=\"tel:" + cfg.contact.phoneE164 + "\">" +
          cfg.contact.phoneDisplay + "</a>.");
      });
  });
})();
