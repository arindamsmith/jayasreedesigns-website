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

The Collections and Home pages read `assets/products.json` with `fetch()`,
which browsers block over the `file://` protocol. Run any static server
from the project root:

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

## Brand / contact details

Hard-coded in the page headers/footers and in `assets/products.json`
(`brand` block). Search-and-replace across `*.html` if the WhatsApp
number, Instagram handle or email ever change:

- WhatsApp Business: `918910661634`  (links use `https://wa.me/918910661634`)
- Instagram: `@jayasreedesigns`
- Email / studio address: currently placeholders marked `(TBC)` on the
  Contact page and policy pages.

---

## File map

```
index.html              Home — hero, story teaser, featured pieces
collections.html         Filterable shop (collection / material / price)
about.html               Solo-maker story
contact.html             WhatsApp, Instagram, email + address placeholders
shipping-policy.html      Scaffold: dispatch days, couriers, delivery windows
refund-policy.html        Scaffold: cancellation window, refund timeline, non-returnable
privacy-policy.html       Scaffold
terms.html                Scaffold
404.html                  Custom not-found page
assets/
  products.json           ← the single source of truth for the catalogue
  css/styles.css           one stylesheet, design tokens as CSS custom properties
  js/site.js               header/nav/search/menu behaviour (all pages)
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
