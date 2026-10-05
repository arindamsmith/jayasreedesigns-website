#!/usr/bin/env python3
"""
Regenerates the site's product/banner/logo images as compressed, correctly
sized WebP files. Re-run this whenever a new or replaced product photo is
dropped into assets/images/products/ (as a .jpg).

What it does:
  - assets/images/products/*.jpg
      -> assets/images/products/<name>.webp        (full size, for the lightbox zoom)
      -> assets/images/products/thumb/<name>.webp   (small, for the product grid card)
      original .jpg is moved to assets/images/_originals/products/
  - assets/images/Banner3.jpg
      -> assets/images/Banner3.webp
      original moved to assets/images/_originals/
  - assets/images/logo.jpg
      resized in place (stays a .jpg — used as <link rel="icon">, and WebP
      favicon support is inconsistent), original backed up first.

Originals are never deleted, only moved under assets/images/_originals/,
which isn't referenced by the site so it isn't deployed-weight, just a
recovery copy.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "assets", "images")
PRODUCTS = os.path.join(IMAGES, "products")
THUMB_DIR = os.path.join(PRODUCTS, "thumb")
ORIG_PRODUCTS = os.path.join(IMAGES, "_originals", "products")
ORIG_ROOT = os.path.join(IMAGES, "_originals")

FULL_MAX = 1200
FULL_QUALITY = 82
THUMB_MAX = 700
THUMB_QUALITY = 78
BANNER_MAX = 1400
BANNER_QUALITY = 82
LOGO_SIZE = 160

os.makedirs(THUMB_DIR, exist_ok=True)
os.makedirs(ORIG_PRODUCTS, exist_ok=True)
os.makedirs(ORIG_ROOT, exist_ok=True)


def resized(im, max_dim):
    im = im.convert("RGB")
    w, h = im.size
    if max(w, h) <= max_dim:
        return im
    if w >= h:
        new_w, new_h = max_dim, round(h * max_dim / w)
    else:
        new_h, new_w = max_dim, round(w * max_dim / h)
    return im.resize((new_w, new_h), Image.LANCZOS)


def process_product(fname):
    src_path = os.path.join(PRODUCTS, fname)
    base, _ = os.path.splitext(fname)
    im = Image.open(src_path)

    full = resized(im, FULL_MAX)
    full.save(os.path.join(PRODUCTS, base + ".webp"), "WEBP", quality=FULL_QUALITY)

    thumb = resized(im, THUMB_MAX)
    thumb.save(os.path.join(THUMB_DIR, base + ".webp"), "WEBP", quality=THUMB_QUALITY)

    im.close()
    os.replace(src_path, os.path.join(ORIG_PRODUCTS, fname))
    return os.path.getsize(os.path.join(PRODUCTS, base + ".webp")), \
        os.path.getsize(os.path.join(THUMB_DIR, base + ".webp"))


def process_banner():
    src_path = os.path.join(IMAGES, "Banner3.jpg")
    if not os.path.exists(src_path):
        return None
    im = Image.open(src_path)
    out = resized(im, BANNER_MAX)
    out_path = os.path.join(IMAGES, "Banner3.webp")
    out.save(out_path, "WEBP", quality=BANNER_QUALITY)
    size = out.size
    im.close()
    os.replace(src_path, os.path.join(ORIG_ROOT, "Banner3.jpg"))
    return out_path, size, os.path.getsize(out_path)


def process_logo():
    src_path = os.path.join(IMAGES, "logo.jpg")
    if not os.path.exists(src_path):
        return None
    im = Image.open(src_path).convert("RGB")
    backup_path = os.path.join(ORIG_ROOT, "logo.jpg")
    if not os.path.exists(backup_path):
        im.save(backup_path, "JPEG", quality=92)
    out = im.resize((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)
    out.save(src_path, "JPEG", quality=88, optimize=True)
    im.close()
    return os.path.getsize(src_path)


def main():
    total_before = 0
    total_after = 0
    jpgs = sorted(f for f in os.listdir(PRODUCTS) if f.lower().endswith((".jpg", ".jpeg")))
    print(f"Processing {len(jpgs)} product photos...")
    for fname in jpgs:
        before = os.path.getsize(os.path.join(PRODUCTS, fname))
        full_size, thumb_size = process_product(fname)
        total_before += before
        total_after += full_size + thumb_size
        print(f"  {fname}: {before/1024:.0f}KB -> full {full_size/1024:.0f}KB + thumb {thumb_size/1024:.0f}KB")

    banner = process_banner()
    if banner:
        print(f"Banner3.jpg -> Banner3.webp {banner[1][0]}x{banner[1][1]}, {banner[2]/1024:.0f}KB")

    logo_size = process_logo()
    if logo_size:
        print(f"logo.jpg resized to {LOGO_SIZE}x{LOGO_SIZE}, {logo_size/1024:.0f}KB")

    print(f"\nProduct photos: {total_before/1024:.0f}KB -> {total_after/1024:.0f}KB "
          f"({100*(1-total_after/total_before):.0f}% smaller)")


if __name__ == "__main__":
    main()
