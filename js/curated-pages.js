/**
 * Heroes, portfolio spreads, and gallery order per discipline.
 * Photos are imported in the curator's numbered order: slide-01 is the
 * lead (photo #1), then slide-02… and gallery-01… Missing keys are skipped,
 * and any extra imported images are appended to the gallery automatically.
 */
const galleryKeys = (slides, galleries) => [
  ...Array.from({ length: slides }, (_, i) => `slide-${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: galleries }, (_, i) => `gallery-${String(i + 1).padStart(2, "0")}`),
];

const base = (focal) => ({
  cover: "slide-01",
  portfolio: ["slide-02", "slide-03", "gallery-01"],
  galleryPreview: ["slide-01", "slide-02", "slide-03", "slide-04", "gallery-01", "gallery-02"],
  galleryOrder: galleryKeys(4, 14),
  focal: { cover: focal },
  focus: {},
});

const CURATED_PAGES = {
  murals: base("center 35%"),
  fauxFinishes: base("center 38%"),
  basRelief: base("center 35%"),
  cabinetFinishes: base("center 40%"),
  ceilingsFloors: base("center 28%"),
  chinoiserie: base("center 36%"),
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CURATED_PAGES };
}
