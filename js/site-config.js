/** Site navigation, practice list, and asset cache version. */
const SITE_VERSION = "20260601";

const SITE_PRACTICES = [
  { href: "murals.html", label: "Murals", slug: "murals" },
  { href: "faux-finishes.html", label: "Wall Finishes", slug: "faux-finishes" },
  { href: "bas-relief.html", label: "Bas Relief", slug: "bas-relief" },
  { href: "cabinet-finishes.html", label: "Cabinets", slug: "cabinet-finishes" },
  { href: "ceilings-floors.html", label: "Ceilings & Floors", slug: "ceilings-floors" },
  { href: "chinoiserie.html", label: "Chinoiserie", slug: "chinoiserie" },
];

const SITE_NAV = [
  { href: "index.html", label: "Home" },
  ...SITE_PRACTICES.map(({ href, label }) => ({ href, label })),
  { href: "classes.html", label: "Classes" },
  { href: "contact.html", label: "Contact" },
];

if (typeof window !== "undefined") {
  window.SITE_VERSION = SITE_VERSION;
  window.SITE_PRACTICES = SITE_PRACTICES;
  window.SITE_NAV = SITE_NAV;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SITE_VERSION, SITE_PRACTICES, SITE_NAV };
}
