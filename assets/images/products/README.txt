Product photos go here — one flat folder, no subfolders.

Name every file after the product's id from ../../products.json:

    JD-AK-045.jpg      anklet
    JD-BN-001.jpg      bangle
    JD-BR-014.jpg      bracelet
    JD-ER-001.jpg      earrings
    JD-NK-001.jpg      necklace
    JD-RG-001.jpg      ring

The category prefix (AK / BN / BR / ER / NK / RG) keeps this folder
grouped by type even though it is flat.

- Square (1:1) images look best, ~1000x1000px.
- .jpg is referenced in products.json; use .jpg (or change the
  "image" value in products.json to match your file).
- Any product with no matching photo shows an auto-generated
  "photo coming soon" placeholder, so nothing breaks in the meantime.
- _placeholder.svg in this folder is that fallback art.
