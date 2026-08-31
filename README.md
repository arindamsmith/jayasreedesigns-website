# Jayasree Designs — static showcase site

Plain HTML, CSS and vanilla JS. **No build step, no npm, no framework.**
Deploys to Cloudflare Pages with **no build command** and the output
directory set to the project root.

---

## Deploy to Cloudflare Pages

1. Push this folder to a Git repo (GitHub / GitLab) **or** use
   `wrangler pages deploy .`
2. In Cloudflare Pages → *Create project*:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  (the project root)
3. Deploy. `404.html` is served automatically for unknown routes.

---

## Local preview

Every page reads `assets/products.json` with `fetch()` (the shop grid, and
the brand/contact hydration in `site.js`), which browsers block over the
`file://` protocol. Opened as a bare file the pages still render — they
fall back to the text baked into the HTML — but to see live data run any
static server from the project root:

```
python -m http.server 8080
# then open http://localhost:8080
```

(Node users: `npx --yes serve .` — dev-only, not a project dependency.)

---

## The one file you edit: `assets/products.json`

Everything on the shop (names, prices, materials, WhatsApp text, photos,
collections, price-range buckets) comes from this single file.

Each product object:

| key         | notes                                                                 |
|-------------|-----------------------------------------------------------------------|
| `id`        | e.g. `JD-NK-001`. Also the image filename stem. Category prefix keeps the flat folder sorted (`AK` anklet, `BN` bangle, `BR` bracelet, `ER` earrings, `NK` necklace, `RG` ring). |
| `name`      | shown on the card and in the WhatsApp message                        |
| `price`     | number, INR, no symbol (e.g. `1450`)                                  |
| `collection`| must match a `collections[].id` (`handcrafted-elegance`, `ethnic-soul`, `wire-art`, `everyday-colour`) |
| `material`  | full honest description — `gold-plated brass`, `glass pearl`, never `gold` / `pearl` alone |
| `image`     | filename only, lives in `assets/images/products/`                    |
| `featured`  | `true` puts it on the Home page for its collection                   |
| `whatsapp`  | the exact message pre-filled when the buyer taps *Order on WhatsApp* |

To **add a product**: add an object to `products`, drop
`assets/images/products/<id>.jpg` in place, done.
To **change a price / name / photo**: edit the field (and swap the file).

### Product photos

- One flat folder: `assets/images/products/` (no subfolders).
- Name each file after the product `id`: `JD-NK-001.jpg`, `JD-ER-014.jpg`.
- Any missing photo falls back to a generated "photo coming soon"
  placeholder automatically, so the grid never breaks.
- Square images (1:1) look best; ~1000×1000px is plenty.

### Material filter facets

The sidebar's **Material** filter is keyword-matched against each
product's `material` text (facet list at the top of
`assets/js/products.js`, `MATERIAL_FACETS`). Add a facet there only if you
introduce a genuinely new material family.

---

## Brand / contact details — edit ONE place

All brand and contact details live in the `brand` block at the top of
`assets/products.json`:

```jsonc
"brand": {
  "name": "Jayasree Designs",
  "tagline": "Celebrate yourself with handcrafted elegance",
  "headerTag": "Handcrafted elegance",
  "footerBlurb": "Celebrate yourself with handcrafted elegance. Handmade in Kolkata, India.",
  "instagram": "jayasreedesigns",              // handle without the @
  "instagramUrl": "https://instagram.com/jayasreedesigns",
  "whatsappNumber": "918910661634",             // country code + number, no +/spaces
  "whatsappDisplay": "+91 89106 61634",
  "whatsappDefaultText": "Hello Jayasree Designs! I found you ...",
  "email": "jayasreedesigns2026@gmail.com",
  "addressLine1": "Ultadanga VIII-M Housing",
  "addressLine2": "20/1 Ultadanga Main Road",
  "addressLine3": "Kolkata - 700067, WB, India"
}
```

`assets/js/site.js` runs on every page, fetches this block, and fills any
element carrying a hook:

| hook (HTML attribute)        | what `site.js` sets                                   |
|------------------------------|------------------------------------------------------|
| `data-jd="name"`             | text ← `brand.name`                                  |
| `data-jd="tagline"`          | text ← `brand.tagline`                               |
| `data-jd="header-tag"`       | text ← `brand.headerTag`                             |
| `data-jd="footer-blurb"`     | text ← `brand.footerBlurb`                           |
| `data-jd="whatsapp-display"` | text ← `brand.whatsappDisplay`                       |
| `data-jd="instagram-handle"` | text ← `@` + `brand.instagram`                       |
| `data-jd="email"`            | text ← `brand.email`                                 |
| `data-jd="address"`          | text ← name + the three address lines, `<br>` between |
| `data-jd-wa`                 | `href` ← `wa.me/<number>` (＋ `?text=` from an optional `data-wa-text` on the same element) |
| `data-jd-ig`                 | `href` ← `brand.instagramUrl`                        |
| `data-jd-email`              | `href` ← `mailto:<email>` (and text, if the link has no child elements) |

The HTML also contains the current values as plain text/links, so pages
still read correctly with JS disabled or opened over `file://`. Keep the
fallback text in sync when you change something important, or just let
`products.json` be the source of truth once the site is deployed.

**Not hooked up:** the `<title>`/`<meta name="description">` tags and body
copy (hero, About story, policy clauses) are per-page prose — edit those
in the HTML directly.

---

## File map

```
index.html              Home — hero, story teaser, featured pieces
collections.html         Filterable shop (collection / material / price)
about.html               Solo-maker story
contact.html             WhatsApp, Instagram, email, studio address
shipping-policy.html      Dispatch days, courier handling, delivery windows
refund-policy.html        Cancellation window, refund timeline, non-returnable
privacy-policy.html       What we collect, sharing, retention
terms.html                Orders, pricing, handmade variation, liability
404.html                  Custom not-found page
assets/
  products.json           ← single source of truth: catalogue + brand block
  css/styles.css           one stylesheet, design tokens as CSS custom properties
  js/site.js               header/nav/search/menu + brand hydration (all pages)
  js/products.js            reads products.json, renders Home + Collections
  images/
    logo.jpeg              header logo + favicon
    Banner3.png            story/about imagery
    products/              flat folder, one photo per product id
      _placeholder.svg     fallback art (also generated inline by JS)
_headers                  Cloudflare Pages caching + security headers
robots.txt
```

---

## Not in this version (planned next phase)

- Shopping cart and Razorpay checkout. Every CTA is intentionally
  **Order on WhatsApp** for now.
