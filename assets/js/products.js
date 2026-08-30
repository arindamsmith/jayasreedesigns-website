/* =========================================================================
   products.js — reads assets/products.json and renders:
     - the featured collections on the home page  (#featured-root)
     - the filterable shop on the collections page (#shop-root)

   Every page reads the SAME assets/products.json. To change names, prices
   or photos, edit ONLY that file.

   Material filter facets are keyword-matched against each product's
   "material" description so the sidebar stays short. Add/adjust facets in
   MATERIAL_FACETS below if you introduce new materials.
   ========================================================================= */
(function () {
  "use strict";

  var DATA_URL = "assets/products.json";
  var IMG_BASE = "assets/images/products/";

  var MATERIAL_FACETS = [
    { id: "gold-plated-brass", label: "Gold-plated brass", test: /gold-plated brass/i },
    { id: "oxidised-silver", label: "Oxidised / German silver", test: /oxidis|german silver/i },
    { id: "copper-wire", label: "Copper wire", test: /copper/i },
    { id: "glass", label: "Glass beads & glass pearl", test: /glass/i },
    { id: "terracotta", label: "Terracotta clay", test: /terracotta/i },
    { id: "resin", label: "Resin & acrylic", test: /resin|acrylic/i },
    { id: "cz", label: "Cubic zirconia", test: /zirconia/i }
  ];

  var SORTS = {
    featured: function (a, b) { return a._i - b._i; },
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    "name-asc": function (a, b) { return a.name.localeCompare(b.name); }
  };

  /* ---------------------------------------------------------------- utils */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function money(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function medallion() {
    return el("span", { class: "medallion", "aria-hidden": "true" }, [
      el("span", { text: "JD" })
    ]);
  }

  function placeholderDataURI(name) {
    var safe = String(name).replace(/[<&>]/g, "").slice(0, 40);
    var mid = safe.length > 22 ? safe.slice(0, 22) : safe;
    var rest = safe.length > 22 ? safe.slice(22) : "";
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0F3D2E"/><stop offset="1" stop-color="#0A2B20"/>' +
      "</linearGradient></defs>" +
      '<rect width="600" height="600" fill="url(#g)"/>' +
      '<circle cx="300" cy="250" r="70" fill="none" stroke="#C9A227" stroke-width="4"/>' +
      '<text x="300" y="278" text-anchor="middle" fill="#E8CD7A" ' +
      'font-family="Georgia, serif" font-size="64" font-weight="700">JD</text>' +
      '<text x="300" y="400" text-anchor="middle" fill="#FAF6EE" ' +
      'font-family="Arial, sans-serif" font-size="26">' + mid + "</text>" +
      '<text x="300" y="436" text-anchor="middle" fill="#FAF6EE" ' +
      'font-family="Arial, sans-serif" font-size="26">' + rest + "</text>" +
      '<text x="300" y="520" text-anchor="middle" fill="#C9A227" ' +
      'font-family="Arial, sans-serif" font-size="18" letter-spacing="3">PHOTO COMING SOON</text>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function getParams() {
    return new URLSearchParams(location.search);
  }

  /* ------------------------------------------------------------ load data */
  var _cache = null;
  function load() {
    if (_cache) return Promise.resolve(_cache);
    return fetch(DATA_URL, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        data.products.forEach(function (p, i) { p._i = i; });
        data._collById = {};
        data.collections.forEach(function (c) { data._collById[c.id] = c; });
        _cache = data;
        return data;
      });
  }

  /* --------------------------------------------------------- product card */
  function card(product, data) {
    var coll = data._collById[product.collection];
    var img = el("img", {
      src: IMG_BASE + product.image,
      alt: product.name,
      loading: "lazy",
      width: "600",
      height: "600"
    });
    img.addEventListener("error", function handle() {
      img.removeEventListener("error", handle);
      img.src = placeholderDataURI(product.name);
    });

    var waHref = "https://wa.me/" + (window.JD ? window.JD.whatsappNumber : "918910661634") +
      "?text=" + encodeURIComponent(product.whatsapp);

    return el("article", { class: "product-card", "data-id": product.id }, [
      el("div", { class: "product-media" }, [img, medallion()]),
      el("div", { class: "product-body" }, [
        el("span", { class: "product-collection tag", text: coll ? coll.name : product.collection }),
        el("h3", { class: "product-name", text: product.name }),
        el("span", { class: "product-price", text: money(product.price) }),
        el("p", { class: "product-material material", text: product.material }),
        el("a", {
          class: "btn btn--block btn--sm",
          href: waHref,
          target: "_blank",
          rel: "noopener",
          "aria-label": "Order " + product.name + " on WhatsApp"
        }, [waIcon(), "Order on WhatsApp"])
      ])
    ]);
  }

  function waIcon() {
    var span = el("span", { class: "wa-icon", "aria-hidden": "true", html:
      '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">' +
      '<path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.2s-.7 1-.9 1.1c-.2.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5s0-.4 0-.6c-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4c-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.4 4.7 3.2 1.3 3.2.9 3.8.8.6 0 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/>' +
      '<path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>' +
      "</svg>" });
    return span;
  }

  /* ============================================================ HOME PAGE */
  function initHome(root, data) {
    root.innerHTML = "";
    data.collections.forEach(function (coll) {
      var items = data.products.filter(function (p) {
        return p.collection === coll.id && p.featured;
      });
      if (!items.length) {
        items = data.products.filter(function (p) { return p.collection === coll.id; }).slice(0, 3);
      }
      var block = el("div", { class: "collection-block" }, [
        el("div", { class: "collection-head" }, [
          el("h3", { text: coll.name }),
          el("a", { href: "collections.html?collection=" + coll.id, text: "View all →" }),
          el("p", { text: coll.blurb })
        ]),
        (function () {
          var grid = el("div", { class: "product-grid" });
          items.forEach(function (p) { grid.appendChild(card(p, data)); });
          return grid;
        })()
      ]);
      root.appendChild(block);
      root.appendChild(el("div", { class: "section-divider", "aria-hidden": "true" }, [medallion()]));
    });
    // drop the trailing divider
    if (root.lastElementChild && root.lastElementChild.classList.contains("section-divider")) {
      root.removeChild(root.lastElementChild);
    }
  }

  /* ===================================================== COLLECTIONS PAGE */
  function initShop(root, data) {
    root.innerHTML = "";
    var params = getParams();
    var state = {
      collections: (params.get("collection") || "").split(",").filter(Boolean),
      materials: (params.get("material") || "").split(",").filter(Boolean),
      prices: (params.get("price") || "").split(",").filter(Boolean),
      q: params.get("q") || "",
      sort: params.get("sort") || "featured"
    };

    /* ---- build DOM shell ---- */
    var grid = el("div", { class: "product-grid" });
    var countEl = el("span", { class: "results-count" });
    var chipsEl = el("div", { class: "active-filters" });
    var sortSel = el("select", { "aria-label": "Sort products" }, [
      el("option", { value: "featured", text: "Sort: Featured" }),
      el("option", { value: "price-asc", text: "Price: Low to High" }),
      el("option", { value: "price-desc", text: "Price: High to Low" }),
      el("option", { value: "name-asc", text: "Name: A–Z" })
    ]);
    sortSel.value = state.sort;

    var sidebar = el("aside", { class: "filters" });
    var filterToggle = el("button", {
      class: "filter-toggle", type: "button", "aria-expanded": "false", "aria-controls": "filters-body"
    }, ["Filter & sort", el("span", { "aria-hidden": "true", text: "▾" })]);
    var body = el("div", { class: "filters-body", id: "filters-body" });
    sidebar.appendChild(el("div", { class: "filters-header" }, [
      el("h2", { text: "Refine" }),
      el("button", { class: "link-clear btn btn--outline btn--sm", type: "button", text: "Clear all" })
    ]));
    sidebar.appendChild(filterToggle);
    sidebar.appendChild(body);

    /* ---- filter groups ---- */
    function group(title, options, selectedArr, onToggle) {
      var wrap = el("div", { class: "filter-group" }, [el("h3", { text: title })]);
      options.forEach(function (opt) {
        var input = el("input", { type: "checkbox", value: opt.id });
        if (selectedArr.indexOf(opt.id) !== -1) input.checked = true;
        input.addEventListener("change", function () { onToggle(opt.id, input.checked); });
        wrap.appendChild(el("label", { class: "filter-option" }, [
          input,
          el("span", { text: opt.label }),
          el("span", { class: "count", text: String(opt.count) })
        ]));
      });
      return wrap;
    }

    function countMatching(predicate) {
      return data.products.filter(predicate).length;
    }

    function rebuildFilters() {
      body.innerHTML = "";

      body.appendChild(group("Collection",
        data.collections.map(function (c) {
          return { id: c.id, label: c.name, count: countMatching(function (p) { return p.collection === c.id; }) };
        }),
        state.collections,
        function (id, on) { toggle("collections", id, on); }));

      body.appendChild(group("Material",
        MATERIAL_FACETS.map(function (f) {
          return { id: f.id, label: f.label, count: countMatching(function (p) { return f.test.test(p.material); }) };
        }).filter(function (o) { return o.count > 0; }),
        state.materials,
        function (id, on) { toggle("materials", id, on); }));

      body.appendChild(group("Price range",
        data.priceRanges.map(function (r) {
          return { id: r.id, label: r.label, count: countMatching(function (p) { return p.price >= r.min && p.price <= r.max; }) };
        }),
        state.prices,
        function (id, on) { toggle("prices", id, on); }));

      var clearBtn = el("button", { class: "btn btn--outline btn--sm btn--block", type: "button", text: "Clear all filters" });
      clearBtn.addEventListener("click", clearAll);
      body.appendChild(el("div", { class: "filters-actions" }, [clearBtn]));
    }

    function toggle(key, id, on) {
      var arr = state[key];
      var idx = arr.indexOf(id);
      if (on && idx === -1) arr.push(id);
      if (!on && idx !== -1) arr.splice(idx, 1);
      apply();
    }

    function clearAll() {
      state.collections = [];
      state.materials = [];
      state.prices = [];
      state.q = "";
      apply();
      rebuildFilters();
    }

    /* ---- filtering ---- */
    function filtered() {
      var mats = MATERIAL_FACETS.filter(function (f) { return state.materials.indexOf(f.id) !== -1; });
      var ranges = data.priceRanges.filter(function (r) { return state.prices.indexOf(r.id) !== -1; });
      var q = state.q.trim().toLowerCase();

      return data.products.filter(function (p) {
        if (state.collections.length && state.collections.indexOf(p.collection) === -1) return false;
        if (mats.length && !mats.some(function (f) { return f.test.test(p.material); })) return false;
        if (ranges.length && !ranges.some(function (r) { return p.price >= r.min && p.price <= r.max; })) return false;
        if (q) {
          var coll = data._collById[p.collection];
          var hay = (p.name + " " + p.material + " " + (coll ? coll.name : "") + " " + p.id).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      }).sort(SORTS[state.sort] || SORTS.featured);
    }

    /* ---- chips ---- */
    function labelFor(kind, id) {
      if (kind === "collections") { var c = data._collById[id]; return c ? c.name : id; }
      if (kind === "materials") { var f = MATERIAL_FACETS.filter(function (x) { return x.id === id; })[0]; return f ? f.label : id; }
      if (kind === "prices") { var r = data.priceRanges.filter(function (x) { return x.id === id; })[0]; return r ? r.label : id; }
      return id;
    }
    function renderChips() {
      chipsEl.innerHTML = "";
      var groups = [["collections", state.collections], ["materials", state.materials], ["prices", state.prices]];
      var any = false;
      groups.forEach(function (g) {
        g[1].forEach(function (id) {
          any = true;
          var btn = el("button", { type: "button", "aria-label": "Remove filter " + labelFor(g[0], id), text: "×" });
          btn.addEventListener("click", function () { toggle(g[0], id, false); rebuildFilters(); });
          chipsEl.appendChild(el("span", { class: "chip" }, [labelFor(g[0], id), btn]));
        });
      });
      if (state.q) {
        any = true;
        var qb = el("button", { type: "button", "aria-label": "Clear search", text: "×" });
        qb.addEventListener("click", function () { state.q = ""; apply(); });
        chipsEl.appendChild(el("span", { class: "chip" }, ['search: "' + state.q + '"', qb]));
      }
      chipsEl.style.display = any ? "flex" : "none";
    }

    /* ---- URL sync ---- */
    function syncURL() {
      var p = new URLSearchParams();
      if (state.collections.length) p.set("collection", state.collections.join(","));
      if (state.materials.length) p.set("material", state.materials.join(","));
      if (state.prices.length) p.set("price", state.prices.join(","));
      if (state.q) p.set("q", state.q);
      if (state.sort && state.sort !== "featured") p.set("sort", state.sort);
      var qs = p.toString();
      history.replaceState(null, "", qs ? "?" + qs : location.pathname);
    }

    /* ---- render ---- */
    function apply() {
      var items = filtered();
      grid.innerHTML = "";
      if (!items.length) {
        grid.appendChild(el("div", { class: "empty-state" }, [
          medallion(),
          el("h3", { text: "Nothing matches those filters — yet" }),
          el("p", { text: "Try removing a filter, or message us on WhatsApp for a custom piece." }),
          el("a", {
            class: "btn btn--sm",
            href: "https://wa.me/918910661634?text=" + encodeURIComponent("Hello Jayasree Designs! I'm looking for something specific — can you help?"),
            target: "_blank", rel: "noopener", text: "Ask on WhatsApp"
          })
        ]));
      } else {
        items.forEach(function (p) { grid.appendChild(card(p, data)); });
      }
      countEl.textContent = items.length + (items.length === 1 ? " piece" : " pieces");
      renderChips();
      syncURL();
    }

    /* ---- wire up ---- */
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; apply(); });
    filterToggle.addEventListener("click", function () {
      var open = body.classList.toggle("is-open");
      filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    sidebar.querySelector(".link-clear").addEventListener("click", function () { clearAll(); });

    root.appendChild(el("div", { class: "shop-layout" }, [
      sidebar,
      el("div", {}, [
        el("div", { class: "results-bar" }, [countEl, sortSel]),
        chipsEl,
        grid
      ])
    ]));

    rebuildFilters();
    apply();
  }

  /* ---------------------------------------------------------------- boot */
  function fail(root, msg) {
    root.innerHTML = "";
    root.appendChild(el("div", { class: "empty-state" }, [
      el("h3", { text: "Couldn't load the catalogue" }),
      el("p", { text: msg }),
      el("p", { class: "material", text: "If you opened this file directly, run a local server (see README)." })
    ]));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var homeRoot = document.getElementById("featured-root");
    var shopRoot = document.getElementById("shop-root");
    if (!homeRoot && !shopRoot) return;

    load().then(function (data) {
      if (homeRoot) initHome(homeRoot, data);
      if (shopRoot) initShop(shopRoot, data);
    }).catch(function (err) {
      if (homeRoot) fail(homeRoot, String(err));
      if (shopRoot) fail(shopRoot, String(err));
    });
  });
})();
