Product photos go here — one flat folder, no subfolders.

Name every file after the product's id from ../../products.json, plus
a photo number. -1 is the main photo:

    JD-ER-109-1.jpg    earrings, main photo
    JD-ER-109-2.jpg    earrings, 2nd photo
    JD-NK-068-1.jpg    necklace set
    JD-PER-014-1.jpg   polymer clay earrings
    JD-PNK-003-1.jpg   polymer clay necklace set

List every photo, in order, in that product's "images" array in
products.json.

- JPEG, longest side no more than 1800px, quality ~82.
- Replacing a photo? Use a new filename (e.g. JD-ER-109-1b.jpg) and
  update "images" -- browsers may show the old one for up to a day
  if the name is reused.
- A listed photo that is missing shows an auto-generated
  "photo coming soon" placeholder, so nothing breaks.
- _placeholder.svg in this folder is that fallback art.
