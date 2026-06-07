/**
 * Heroes, portfolio spreads, and gallery order per discipline.
 * Photos are imported in numbered order: slide-01 is the cover, then slide-02…
 * Gallery mosaic shows only works not already on cover/portfolio spreads (deduped at build time).
 */
const base = (focal) => ({
  cover: "slide-01",
  portfolio: ["slide-02", "slide-03", "slide-04", "gallery-01", "gallery-02"],
  focal: { cover: focal },
  focus: {},
});

const CURATED_PAGES = {
  murals: {
    ...base("center 35%"),
    focal: {
      cover: "center 35%",
      "slide-02": "center 32%",
    },
  },
  fauxFinishes: base("center 38%"),
  basRelief: {
    ...base("center 40%"),
    focal: { cover: "center 40%", "slide-01": "center 40%" },
  },
  cabinetFinishes: base("center 40%"),
  ceilingsFloors: {
    ...base("center 28%"),
    focal: {
      cover: "center 28%",
      "slide-03": "center 48%",
    },
  },
  chinoiserie: {
    ...base("center 42%"),
    focal: { cover: "center 42%", "slide-01": "center 42%" },
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CURATED_PAGES };
}
