/** Site navigation, practice list, and asset cache version. */
const SITE_VERSION = "20260601i";

/** Update when a custom domain is connected. */
const SITE_BASE_URL = "https://rauth91.github.io/connieharrisart";
const SITE_OG_IMAGE = `${SITE_BASE_URL}/images/home/hero.jpg`;
const SITE_TAGLINE = "Forty years at Chatsworth Plantation. Surfaces that tell a story.";

const SITE_PRACTICES = [
  { href: "murals.html", label: "Murals", slug: "murals" },
  { href: "faux-finishes.html", label: "Wall Finishes", slug: "faux-finishes" },
  { href: "bas-relief.html", label: "Bas Relief", slug: "bas-relief" },
  { href: "cabinet-finishes.html", label: "Cabinets", slug: "cabinet-finishes" },
  { href: "ceilings-floors.html", label: "Ceilings & Floors", slug: "ceilings-floors" },
  { href: "chinoiserie.html", label: "Chinoiserie", slug: "chinoiserie" },
];

const SITE_NAV = [
  { href: "index.html#work", label: "Work" },
  { href: "index.html#studio", label: "Studio" },
  { href: "classes.html", label: "Classes" },
  { href: "contact.html", label: "Contact" },
];

const SITE_NAV_WORK = "index.html#work";

if (typeof window !== "undefined") {
  window.SITE_VERSION = SITE_VERSION;
  window.SITE_BASE_URL = SITE_BASE_URL;
  window.SITE_OG_IMAGE = SITE_OG_IMAGE;
  window.SITE_TAGLINE = SITE_TAGLINE;
  window.SITE_PRACTICES = SITE_PRACTICES;
  window.SITE_NAV = SITE_NAV;
  window.SITE_NAV_WORK = SITE_NAV_WORK;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SITE_VERSION,
    SITE_BASE_URL,
    SITE_OG_IMAGE,
    SITE_TAGLINE,
    SITE_PRACTICES,
    SITE_NAV,
    SITE_NAV_WORK,
  };
}
