/* =========================================================================
   site.js — shared UI behaviour for every page
   - mobile nav toggle
   - header search toggle + submit -> collections.html?q=
   - active nav link (based on current filename)
   - footer year
   No dependencies. Safe to load with `defer`.
   ========================================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "918910661634";

  /* ---- active nav link ------------------------------------------------- */
  function markActiveNav() {
    var path = location.pathname.split("/").pop() || "index.html";
    var links = document.querySelectorAll(".nav a, .footer-nav a");
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      if (href === path || (path === "" && href === "index.html")) {
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
    // close menu when a link is tapped
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- header search --------------------------------------------------- */
  function initSearch() {
    var btn = document.querySelector(".search-toggle");
    var box = document.querySelector(".header-search");
    if (!btn || !box) return;
    var input = box.querySelector("input");
    btn.addEventListener("click", function () {
      var open = box.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && input) input.focus();
    });
    box.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (input && input.value || "").trim();
      location.href = "collections.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  /* ---- footer year -------------------------------------------------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---- expose a tiny helper for other scripts ------------------------ */
  window.JD = window.JD || {};
  window.JD.whatsappNumber = WHATSAPP_NUMBER;
  window.JD.waLink = function (message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message || "");
  };
  window.JD.formatPrice = function (n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  };

  document.addEventListener("DOMContentLoaded", function () {
    markActiveNav();
    initMenu();
    initSearch();
    setYear();
  });
})();
