/**
 * Before/after comparison sliders — one discipline at a time.
 * Drop pairs in images/before-after/{discipline}/ as NN-before.jpg / NN-after.jpg.
 * Source files listed in excludeSources are kept out of the gallery on import and build.
 */
const BEFORE_AFTER = {
  murals: [
    {
      insertAfter: 4,
      title: "Before &<br>After",
      body: "Drag the handle to compare the color study on the wall and the finished mural — a hospitality bar in Baton Rouge.",
      before: "images/before-after/murals/01-before.jpg",
      after: "images/before-after/murals/01-after.jpg",
      beforeAlt: "Murals — bar niche color study before painting",
      afterAlt: "Murals — bar niche after painting",
      excludeSources: ["IMG_3148", "IMG_3161"],
      focal: { before: "center 46%", after: "center 42%" },
    },
  ],
  cabinetFinishes: [
    {
      insertAfter: 4,
      title: "Before &<br>After",
      body: "Drag the handle to compare the armoire in white primer and the finished wood glaze — layered patina built to honor every carved profile.",
      before: "images/before-after/cabinet-finishes/01-before.jpg",
      after: "images/before-after/cabinet-finishes/01-after.jpg",
      beforeAlt: "Cabinet Finishes — armoire before finishing",
      afterAlt: "Cabinet Finishes — armoire after finishing",
      excludeGallery: ["gallery-05", "gallery-11"],
      focal: { before: "center 48%", after: "center 45%" },
    },
  ],
  ceilingsFloors: [
    {
      insertAfter: 4,
      title: "Before &<br>After",
      body: "Drag the handle to compare the kitchen floor before painting and the finished black-and-white checkerboard — hand-painted over existing tile.",
      before: "images/before-after/ceilings-floors/01-before.jpg",
      after: "images/before-after/ceilings-floors/01-after.jpg",
      beforeAlt: "Ceilings & Floors — kitchen floor before painting",
      afterAlt: "Ceilings & Floors — kitchen floor after painting",
      excludeSources: ["IMG_4028"],
      focal: { before: "center 52%", after: "center 58%" },
    },
  ],
  fauxFinishes: [
    {
      insertAfter: 4,
      title: "Before &<br>After",
      body: "Drag the handle to compare the wall mid-finish and the completed metallic plaster — hand-stenciled pattern over a troweled ground.",
      before: "images/before-after/faux-finishes/01-before.jpg",
      after: "images/before-after/faux-finishes/01-after.jpg",
      beforeAlt: "Wall Finishes — decorative wall before finishing",
      afterAlt: "Wall Finishes — decorative wall after finishing",
      excludeSources: ["FA40726A"],
      focal: { before: "center 42%", after: "center 50%" },
    },
  ],
};

function normalizeStem(name) {
  const base = String(name).replace(/\.[^.]+$/, "").replace(/^\d+-/, "");
  const m = base.match(/IMG[_\s-]*(\d+)/i);
  if (m) return `IMG${m[1]}`.toUpperCase();
  return base.toLowerCase();
}

function beforeAfterGalleryExcludes(pageKey) {
  const entries = BEFORE_AFTER[pageKey] || [];
  const paths = new Set();
  const stems = new Set();
  const slots = new Set();

  entries.forEach((entry) => {
    if (entry.before) paths.add(entry.before);
    (entry.excludeSources || []).forEach((s) => stems.add(normalizeStem(s)));
    (entry.excludeGallery || []).forEach((slot) => slots.add(slot));
  });

  return { paths, stems, slots };
}

function shouldExcludeFromGallery(src, pageKey) {
  const { paths, stems, slots } = beforeAfterGalleryExcludes(pageKey);
  if (paths.has(src)) return true;

  const base = String(src).replace(/\.[^.]+$/, "").split("/").pop();
  if (slots.has(base)) return true;

  const key = normalizeStem(src);
  for (const stem of stems) {
    if (key === stem || key.includes(stem) || stem.includes(key)) return true;
  }
  return false;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { BEFORE_AFTER, beforeAfterGalleryExcludes, shouldExcludeFromGallery, normalizeStem };
}
