/* =========================================================================
   site.js — shared UI behaviour for every page
   - mobile nav toggle
   - header search toggle + submit -> collections.html?q=
   - active nav link (based on current filename)
   - footer year
   - brand hydration: fills [data-jd] / [data-jd-wa] / [data-jd-ig] /
     [data-jd-email] elements from the "brand" block in assets/products.json,
     so brand/contact details are edited in ONE place.

   The HTML keeps real fallback text/links, so pages still work with no JS
   or when opened over file:// (where the fetch is blocked).
   No dependencies. Safe to load with `defer`.
   ========================================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "918910661634"; // fallback only; real value comes from products.json
  var IMG_BASE = "assets/images/products/";
  var catalog = null; // { products, _collById } — filled once products.json loads

  /* ---- active nav link ------------------------------------------------- */
  function markActiveNav() {
    // The host serves pages without ".html" (/about), locally they keep it
    // (/about.html) — compare page names with the extension stripped.
    function page(p) { return (p.replace(/\.html$/, "") || "index"); }
    var path = page(location.pathname.split("/").pop());
    var links = document.querySelectorAll(".nav a, .footer-nav a");
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      if (page(href) === path) {
        if (a.closest(".nav")) a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---- mobile menu -------------------------------------------------- */
  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- header search + type-ahead --------------------------------------- */
  function matchesQuery(p, q) {
    var collNames = (p.collections || []).map(function (id) {
      var c = catalog._collById[id];
      return c ? c.name : "";
    }).join(" ");
    var hay = (p.name + " " + (p.description || "") + " " + (p.material || "") + " " + collNames + " " + p.id).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function initSearch() {
    var btn = document.querySelector(".search-toggle");
    var box = document.querySelector(".header-search");
    if (!btn || !box) return;
    var input = box.querySelector("input");

    var list = document.createElement("ul");
    list.className = "search-suggest";
    list.id = "header-search-suggest";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    box.appendChild(list);

    if (input) {
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-controls", list.id);
    }

    function close() {
      list.hidden = true;
      list.textContent = "";
      if (input) input.setAttribute("aria-expanded", "false");
    }

    function render(q, matches) {
      list.textContent = "";
      if (!matches.length) {
        var empty = document.createElement("li");
        empty.className = "search-suggest__empty";
        empty.textContent = "No pieces match “" + q + "”";
        list.appendChild(empty);
      } else {
        matches.slice(0, 6).forEach(function (p) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.href = "collections.html?q=" + encodeURIComponent(p.name);
          a.setAttribute("role", "option");

          var img = document.createElement("img");
          img.src = IMG_BASE + ((p.images && p.images[0]) || "");
          img.alt = "";
          img.loading = "lazy";

          var text = document.createElement("span");
          var name = document.createElement("span");
          name.className = "search-suggest__name";
          name.textContent = p.name;
          var price = document.createElement("span");
          price.className = "search-suggest__price";
          price.textContent = window.JD.formatPrice(p.price);
          text.appendChild(name);
          text.appendChild(price);

          a.appendChild(img);
          a.appendChild(text);
          li.appendChild(a);
          list.appendChild(li);
        });
      }
      list.hidden = false;
      if (input) input.setAttribute("aria-expanded", "true");
    }

    function update() {
      if (!input) return;
      var q = input.value.trim().toLowerCase();
      if (!q) { close(); return; }
      if (!catalog) return; // products.json still loading — try again once it lands
      render(q, catalog.products.filter(function (p) { return matchesQuery(p, q); }));
    }

    btn.addEventListener("click", function () {
      var open = box.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && input) input.focus();
      if (!open) close();
    });

    if (input) {
      input.addEventListener("input", update);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
    }

    box.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (input && input.value || "").trim();
      location.href = "collections.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });

    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) close();
    });

    // once products.json resolves, re-run for whatever the visitor already typed
    box._jdRetrySuggestions = update;
  }

  /* ---- footer year -------------------------------------------------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---- brand hydration --------------------------------------------- */
  function waLink(brand, text) {
    var num = (brand && brand.whatsappNumber) || WHATSAPP_NUMBER;
    var msg = text || (brand && brand.whatsappDefaultText) || "";
    return "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  function hydrateBrand(brand) {
    if (!brand) return;

    // plain text nodes: <span data-jd="name"> etc.
    var TEXT = {
      name: brand.name,
      tagline: brand.tagline,
      "header-tag": brand.headerTag,
      "footer-blurb": brand.footerBlurb,
      "whatsapp-display": brand.whatsappDisplay,
      "instagram-handle": brand.instagram ? "@" + brand.instagram : null,
      email: brand.email
    };
    document.querySelectorAll("[data-jd]").forEach(function (el) {
      var key = el.getAttribute("data-jd");
      if (key === "address") {
        var lines = [brand.name, brand.addressLine1, brand.addressLine2, brand.addressLine3]
          .filter(Boolean);
        el.textContent = "";
        lines.forEach(function (line, i) {
          if (i) el.appendChild(document.createElement("br"));
          el.appendChild(document.createTextNode(line));
        });
        return;
      }
      if (TEXT[key] != null) el.textContent = TEXT[key];
    });

    // links
    document.querySelectorAll("[data-jd-wa]").forEach(function (a) {
      a.setAttribute("href", waLink(brand, a.getAttribute("data-wa-text") || ""));
    });
    document.querySelectorAll("[data-jd-ig]").forEach(function (a) {
      if (brand.instagramUrl) a.setAttribute("href", brand.instagramUrl);
    });
    document.querySelectorAll("[data-jd-email]").forEach(function (a) {
      if (!brand.email) return;
      a.setAttribute("href", "mailto:" + brand.email);
      if (!a.children.length && a.getAttribute("data-jd-email") !== "href-only") {
        a.textContent = brand.email;
      }
    });
  }

  function loadCatalog() {
    fetch("assets/products.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        if (d.brand) {
          window.JD.brand = d.brand;
          if (d.brand.whatsappNumber) window.JD.whatsappNumber = d.brand.whatsappNumber;
          hydrateBrand(d.brand);
        }
        if (Array.isArray(d.products)) {
          var collById = {};
          (d.collections || []).forEach(function (c) { collById[c.id] = c; });
          catalog = { products: d.products, _collById: collById };
          var box = document.querySelector(".header-search");
          if (box && box._jdRetrySuggestions) box._jdRetrySuggestions();
        }
      })
      .catch(function () { /* file:// or offline — HTML fallbacks stay */ });
  }

  /* ---- expose helpers for other scripts ---------------------------- */
  window.JD = window.JD || {};
  window.JD.whatsappNumber = WHATSAPP_NUMBER;
  window.JD.waLink = function (message) { return waLink(window.JD.brand, message); };
  window.JD.formatPrice = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };

  document.addEventListener("DOMContentLoaded", function () {
    markActiveNav();
    initMenu();
    initSearch();
    setYear();
    loadCatalog();
  });
})();
