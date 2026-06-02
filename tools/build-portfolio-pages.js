#!/usr/bin/env node
/**
 * Build atelier practice pages — curated heroes, 3 spreads, gallery order, focal points.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { SITE_VERSION } = require(path.join(ROOT, "js", "site-config.js"));
const CACHE = SITE_VERSION;
/** Practice pages: magazine layout with photos and gallery. */
const INCLUDE_PHOTOS = true;
const SITE_PHOTOS = require(path.join(ROOT, "js", "photo-config.js"));
const { CURATED_PAGES } = require(path.join(ROOT, "js", "curated-pages.js"));
const { SITE_NAV, SITE_PRACTICES } = require(path.join(ROOT, "js", "site-config.js"));

const PAGES = [
  {
    file: "murals.html",
    key: "murals",
    active: "murals.html",
    title: "Murals",
    desc: "Hand-painted custom murals by Connie Harris, designed to fit architecture, light, and the story of each room.",
    meta: [
      ["Painted<br>Architecture", "The mural is where Connie paints without limits — color carried across walls and ceilings too large to ignore. Each is freehanded onto prepared surfaces, from Louisiana landscapes to storybook nurseries to scenes that reshape an entire room."],
      ["Drawn<br>to Scale", "Every commission begins on the wall itself — proportions, sightlines, and a color study shaped to the room before a single brushstroke is laid."],
      ["Into the<br>Architecture", "Finished work settles into its space, reading as part of the architecture and the light rather than a picture hung upon it."],
      ["Layer<br>upon Layer", "Glaze over brushwork over ground — depth built slowly, so the surface holds its atmosphere for decades."],
    ],
  },
  {
    file: "faux-finishes.html",
    key: "fauxFinishes",
    active: "faux-finishes.html",
    title: "Wall Finishes",
    desc: "Luxury faux finishes and decorative wall treatments crafted by hand for residential and hospitality interiors.",
    meta: [
      ["The Living<br>Wall", "Faux finishing is a centuries-old craft, and Connie has spent forty years stretching what it can do — across sheetrock, plaster, canvas, stone, and nearly any surface that will hold a finish."],
      ["Tested<br>by Hand", "Drag, depth, and sheen are proven on sample boards first, so the finish that reaches your walls is already resolved."],
      ["Quiet<br>Color", "Tone moves softly across the surface — rich at midday, warmer by evening, and never flat."],
      ["Made for<br>Living", "Protective finishing systems keep every wall as beautiful years on as the day it was sealed."],
    ],
  },
  {
    file: "bas-relief.html",
    key: "basRelief",
    active: "bas-relief.html",
    title: "Bas Relief",
    desc: "Custom bas relief surfaces by Connie Harris, adding sculpted dimension and architectural depth to interiors.",
    meta: [
      ["Sculpted<br>by Hand", "Bas relief turns a flat wall into something architectural — dimension modeled by hand and built up layer by layer. Quiet enough to live with, striking enough to remember."],
      ["Formed<br>in Plaster", "Relief is shaped in place, responding to the room's proportions and the way its light falls across the surface."],
      ["A Sense of<br>Permanence", "The finished wall reads as built-in — integral to the architecture, never simply applied to it."],
      ["Light<br>& Shadow", "Depth comes alive as daylight crosses the relief, the wall shifting in character from morning to evening."],
    ],
  },
  {
    file: "cabinet-finishes.html",
    key: "cabinetFinishes",
    active: "cabinet-finishes.html",
    title: "Cabinet Finishes",
    desc: "Custom cabinet finishing services with layered paint, patina, and protective topcoats built for long-term beauty.",
    meta: [
      ["Cabinetry,<br>Reconsidered", "A painted cabinet should outlast the trend that inspired it. Connie's finishes are built for the long view — tuned to the wood, the room, and the light it lives in."],
      ["Paint &<br>Patina", "Hand-worked aging lends depth and character while keeping every profile crisp and intentional."],
      ["In the<br>Detail", "Glaze is layered to catch panel edges and millwork, drawing the eye to the craftsmanship beneath."],
      ["Built to<br>Endure", "Topcoat systems are chosen for real life — kitchens, baths, and the rooms that work the hardest."],
    ],
  },
  {
    file: "ceilings-floors.html",
    key: "ceilingsFloors",
    active: "ceilings-floors.html",
    title: "Ceilings & Floors",
    desc: "Decorative ceiling and floor finishes that transform spatial atmosphere and complete interior design vision.",
    meta: [
      ["The Fifth<br>Wall", "The two surfaces most people overlook — Connie never does. A painted ceiling changes the very air of a room, and a finished floor grounds everything above it."],
      ["Overhead<br>Atmosphere", "Venetian-inspired plaster finishes bring depth overhead, shaped for both historic and modern homes."],
      ["Underfoot<br>Artistry", "Decorative floors balance genuine beauty with the durability a floor is asked to give."],
      ["One<br>Continuous Room", "Color and texture are coordinated with walls, trim, and cabinetry so every surface belongs to the same story."],
    ],
  },
  {
    file: "chinoiserie.html",
    key: "chinoiserie",
    active: "chinoiserie.html",
    title: "Chinoiserie",
    desc: "Hand-painted Chinoiserie by Connie Harris — custom panels, screens, and wall scenes with birds, blossoms, and garden landscapes.",
    meta: [
      ["A Garden,<br>Painted", "Chinoiserie is Connie's lyrical take on a centuries-old European tradition — birds, blossoms, pagodas, and garden scenes painted by hand across panels, screens, and entire rooms."],
      ["Composed<br>by Panel", "Color and composition are studied panel by panel, shaped for folding screens and feature walls."],
      ["In<br>Harmony", "Scenes are woven through moldings, cabinetry, and furnishings until the room reads as one continuous landscape."],
      ["Every Branch,<br>Placed", "Fine brushwork and narrative detail — each bird, branch, and blossom set with intention."],
    ],
  },
];

function basenameKey(src) {
  return path.basename(src, path.extname(src));
}

function indexGallery(g) {
  const map = new Map();
  [...g.slides, ...g.gallery].forEach((src) => map.set(basenameKey(src), src));
  return map;
}

function pick(map, key) {
  return key ? map.get(key) : undefined;
}

function resolveCurated(g, curated) {
  const map = indexGallery(g);
  const cover = pick(map, curated.cover) || g.slides[0];
  const portfolio = curated.portfolio.map((k) => pick(map, k)).filter(Boolean).slice(0, 3);

  const ordered = [];
  const seen = new Set();
  for (const key of curated.galleryOrder || []) {
    const src = pick(map, key);
    if (src && !seen.has(src)) {
      ordered.push(src);
      seen.add(src);
    }
  }
  for (const src of [...g.slides, ...g.gallery]) {
    if (!seen.has(src)) {
      ordered.push(src);
      seen.add(src);
    }
  }

  const preview = curated.galleryPreview
    .map((k) => pick(map, k))
    .filter(Boolean)
    .slice(0, 6);

  return { cover, portfolio, galleryOrder: ordered, galleryPreview: preview };
}

function focalFor(curated, key) {
  if (!curated?.focal) return "center 38%";
  return curated.focal[key] || curated.focal.cover || "center 38%";
}

function focusClassFor(curated, src) {
  const key = basenameKey(src);
  const kind = curated.focus?.[key];
  if (!kind) return "";
  return ` magazine-art-frame--focus-${kind}`;
}

function navBlock(activeHref) {
  const links = SITE_NAV.map(({ href, label }) => {
    const active = href === activeHref ? ' class="active"' : "";
    return `    <a href="${href}"${active}>${label}</a>`;
  }).join("\n");

  return `<header class="topbar">
  <a class="brand" href="index.html">Connie Harris</a>
  <div class="topbar-end">
    <button class="menu-btn" id="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false">Menu</button>
    <nav class="nav" aria-label="Primary">
${links}
    </nav>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu">
${links}
</div>`;
}

function siblingLinks(currentHref) {
  return SITE_PRACTICES.filter((p) => p.href !== currentHref)
    .map((p) => `<a href="${p.href}">${p.label}</a>`)
    .join("\n");
}

function altFromPath(src) {
  const base = path.basename(src, path.extname(src)).replace(/-/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function spreadTitlePlain(html) {
  return html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim();
}

function formatTitle(html) {
  const parts = html.split(/<br\s*\/?>/i);
  if (parts.length < 2) return html;
  return `${parts[0]}<br><span class="title-accent">${parts.slice(1).join(" ")}</span>`;
}

function watermark(title) {
  return `<span class="magazine-watermark" aria-hidden="true">${title}</span>`;
}

function photoFigure(src, alt, loading, extraClass, curated) {
  const cls = extraClass ? ` magazine-photo--${extraClass}` : "";
  const key = basenameKey(src);
  const focal = focalFor(curated, key);
  const frameExtra = focusClassFor(curated, src);
  const immersive = extraClass === "cover" ? " magazine-photo--immersive" : "";

  return `<figure class="magazine-photo${cls}${immersive}">
      <img class="magazine-photo-ambient" src="${src}" alt="" aria-hidden="true" loading="${loading}" decoding="async" style="object-position:${focal}" />
      <div class="magazine-photo-inner">
        <div class="magazine-art-frame${frameExtra}">
          <img class="magazine-photo-main" src="${src}" alt="${alt}" loading="${loading}" decoding="async" data-focal="${focal}" />
        </div>
      </div>
    </figure>`;
}

function buildGallerySpread(page, preview, galleryOrder) {
  const m = page.meta[3];
  const previewHtml = preview
    .map(
      (src, i) => `
      <button type="button" class="magazine-gallery-thumb" data-gallery-src="${src}">
        <img src="${src}" alt="${page.title} — ${altFromPath(src)}" loading="lazy" decoding="async" />
        <span class="magazine-gallery-thumb-num">${String(i + 1).padStart(2, "0")}</span>
      </button>`
    )
    .join("");

  return `
  <section class="magazine-spread magazine-spread--gallery" data-page="gallery" id="gallery" data-spread-label="${spreadTitlePlain(m[0])}">
    ${watermark(page.title)}
    <div class="magazine-gallery-layout">
      <header class="magazine-gallery-head">
        <div class="magazine-rule"><p class="eyebrow">${page.title} · Gallery</p></div>
        <h2>${formatTitle(m[0])}</h2>
        <p>${m[1]}</p>
        <p class="magazine-gallery-stat">${galleryOrder.length}<span>Works in this collection</span></p>
        <button type="button" class="magazine-gallery-cta" id="magazine-gallery-open">
          <span>View full collection</span>
          <span class="magazine-gallery-cta-arrow" aria-hidden="true">→</span>
        </button>
      </header>
      <div class="magazine-gallery-preview" aria-label="Gallery preview">
        ${previewHtml}
      </div>
    </div>
  </section>`;
}

function buildGalleryChrome(page, images) {
  const gridHtml = images
    .map(
      (src) => `
      <button type="button" class="magazine-gallery-item" data-gallery-src="${src}">
        <img src="${src}" alt="${page.title} — ${altFromPath(src)}" loading="lazy" decoding="async" />
      </button>`
    )
    .join("");

  return `
<div class="magazine-gallery-panel" id="magazine-gallery-panel" aria-hidden="true">
  <header class="magazine-gallery-panel-head">
    <div>
      <p class="eyebrow">${page.title} · Gallery</p>
      <p class="magazine-gallery-panel-count">${images.length} works</p>
    </div>
    <button type="button" class="magazine-gallery-close" id="magazine-gallery-close">Close</button>
  </header>
  <div class="magazine-gallery-grid" id="magazine-gallery-grid">
    ${gridHtml}
  </div>
</div>

<div class="magazine-lightbox" id="magazine-lightbox" aria-hidden="true">
  <button type="button" class="magazine-lightbox-close" id="magazine-lightbox-close">Close</button>
  <button type="button" class="magazine-lightbox-nav magazine-lightbox-prev" id="magazine-lightbox-prev" aria-label="Previous image">←</button>
  <img id="magazine-lightbox-img" alt="" />
  <button type="button" class="magazine-lightbox-nav magazine-lightbox-next" id="magazine-lightbox-next" aria-label="Next image">→</button>
  <p class="magazine-lightbox-caption" id="magazine-lightbox-caption"></p>
  <p class="magazine-lightbox-meta" id="magazine-lightbox-meta"></p>
</div>`;
}

function buildPhotoSpread(page, index, total, src, curated) {
  const m = page.meta[(index + 1) % page.meta.length];
  const num = String(index + 1).padStart(2, "0");
  const tot = String(total).padStart(2, "0");

  return `
  <section class="magazine-spread" data-page="${index + 1}" data-spread-label="${spreadTitlePlain(m[0])}">
    ${watermark(page.title)}
    <div class="magazine-copy">
      <div class="magazine-rule"><p class="eyebrow">${page.title} · ${num} / ${tot}</p></div>
      <h2>${formatTitle(m[0])}</h2>
      <p>${m[1]}</p>
    </div>
    ${photoFigure(src, `${page.title} — ${altFromPath(src)}`, index < 1 ? "eager" : "lazy", "", curated)}
  </section>`;
}

function buildTextSpread(page, metaIndex, spreadNum, total, options = {}) {
  const m = page.meta[metaIndex];
  const num = String(spreadNum).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  const isCover = options.cover;
  const extraClass = isCover ? "magazine-spread--cover is-active" : "";
  const actions = isCover
    ? `<div class="spread-actions">
        <a class="btn dark" href="contact.html">Commission</a>
        <a class="btn" href="index.html#work">All disciplines</a>
      </div>`
    : "";
  const eyebrow = isCover ? page.title : `${page.title} · ${num} / ${tot}`;

  return `
  <section class="magazine-spread magazine-spread--text ${extraClass}" data-page="${isCover ? "cover" : spreadNum}" data-spread-label="${spreadTitlePlain(m[0])}">
    ${watermark(page.title)}
    <div class="magazine-copy">
      <div class="magazine-rule"><p class="eyebrow">${eyebrow}</p></div>
      <h2>${formatTitle(m[0])}</h2>
      <p>${m[1]}</p>
      ${actions}
    </div>
  </section>`;
}

function buildPage(page) {
  const m0 = page.meta[0];
  let coverSpread;
  let photos = "";
  let gallerySpread = "";
  let galleryChrome = "";
  let railLabels;

  if (INCLUDE_PHOTOS) {
    const g = SITE_PHOTOS.gallery[page.key];
    const curatedCfg = CURATED_PAGES[page.key];
    const { cover, portfolio, galleryOrder, galleryPreview } = resolveCurated(g, curatedCfg);

    railLabels = [
      spreadTitlePlain(m0[0]),
      ...portfolio.map((_, i) => spreadTitlePlain(page.meta[(i + 1) % page.meta.length][0])),
      spreadTitlePlain(page.meta[3][0]),
      "Continue exploring",
    ];

    coverSpread = `
  <section class="magazine-spread magazine-spread--cover magazine-spread--immersive is-active" data-page="cover" data-spread-label="${spreadTitlePlain(m0[0])}">
    ${watermark(page.title)}
    <div class="magazine-copy">
      <div class="magazine-rule"><p class="eyebrow">${page.title}</p></div>
      <h2>${formatTitle(m0[0])}</h2>
      <p>${m0[1]}</p>
      <div class="spread-actions">
        <a class="btn dark" href="contact.html">Commission</a>
        <a class="btn" href="index.html#work">All disciplines</a>
      </div>
    </div>
    ${photoFigure(cover, page.title, "eager", "cover", curatedCfg)}
  </section>`;

    photos = portfolio
      .map((src, i) => buildPhotoSpread(page, i, portfolio.length, src, curatedCfg))
      .join("");

    gallerySpread = buildGallerySpread(page, galleryPreview, galleryOrder);
    galleryChrome = buildGalleryChrome(page, galleryOrder);
  } else {
    const textSpreadCount = page.meta.length - 1;

    railLabels = [
      spreadTitlePlain(m0[0]),
      ...page.meta.slice(1).map((m) => spreadTitlePlain(m[0])),
      "Continue exploring",
    ];

    coverSpread = buildTextSpread(page, 0, 0, textSpreadCount, { cover: true });

    photos = page.meta
      .slice(1)
      .map((_, i) => buildTextSpread(page, i + 1, i + 1, textSpreadCount))
      .join("");
  }

  const spreadRail = `
<nav class="magazine-rail" id="magazine-rail" aria-label="Spread index">
${railLabels
  .map(
    (label, i) =>
      `<button type="button" class="magazine-rail-dot" data-spread-index="${i}" aria-label="${label}"><span class="magazine-rail-tip">${label}</span></button>`
  )
  .join("\n")}
</nav>`;

  const outro = `
  <section class="magazine-spread magazine-spread--outro" data-spread-label="Continue exploring">
    <span class="magazine-watermark" aria-hidden="true">Studio</span>
    <div class="magazine-copy">
      <div class="magazine-rule"><p class="eyebrow">Continue exploring</p></div>
      <h2>More from<br><span class="title-accent">the studio</span></h2>
      <p>Each discipline is a room in Connie's practice — murals, wall finishes, bas relief, cabinetry, ceilings, floors, and chinoiserie.</p>
      <div class="practice-links">
        ${siblingLinks(page.active)}
      </div>
      <div class="spread-actions">
        <a class="btn dark" href="contact.html">Contact Connie</a>
        <a class="btn" href="index.html">Home</a>
      </div>
    </div>
  </section>`;

  return `<!doctype html>
<html lang="en" class="magazine-html">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${page.desc}" />
<meta property="og:title" content="${page.title} | Connie Harris" />
<meta property="og:description" content="${page.desc}" />
<meta name="theme-color" content="#12100d" />
<link rel="icon" type="image/svg+xml" href="images/favicon.svg" />
<title>${page.title} | Connie Harris</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,500;1,200;1,300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/style.css?v=${CACHE}" />
<link rel="stylesheet" href="css/magazine.css?v=${CACHE}" />
<script src="js/site-config.js?v=${CACHE}"></script>
<script src="js/site-nav.js?v=${CACHE}" defer></script>
</head>
<body class="magazine-page${INCLUDE_PHOTOS ? "" : " magazine-page--text"}">
${navBlock(page.active)}

<div class="magazine-grain" aria-hidden="true"></div>
<div class="magazine-progress" aria-hidden="true"><div class="magazine-progress-fill" id="magazine-progress-fill"></div></div>

<nav class="magazine-nav" aria-label="Page navigation">
  <button type="button" id="magazine-prev" aria-label="Previous page">←</button>
  <button type="button" id="magazine-next" aria-label="Next page">→</button>
</nav>
<button type="button" class="magazine-tap-next" id="magazine-tap-next" aria-label="Next page"></button>
<button type="button" class="magazine-tap-prev" id="magazine-tap-prev" aria-label="Previous page"></button>

<div class="magazine-ui" aria-hidden="true">
  <span class="magazine-page-num" id="magazine-page-num">01</span>
  <span class="magazine-spread-label" id="magazine-spread-label"></span>
  <span class="magazine-hint">Scroll to turn the page</span>
</div>
${spreadRail}

<main class="magazine-book" id="magazine-book">
${coverSpread}
${photos}
${gallerySpread}
${outro}
</main>
${galleryChrome}

<script src="js/main.js?v=${CACHE}"></script>
<script src="js/magazine.js?v=${CACHE}"></script>
</body>
</html>
`;
}

for (const page of PAGES) {
  fs.writeFileSync(path.join(ROOT, page.file), buildPage(page));
  console.log(`✓ ${page.file}`);
}

console.log(
  INCLUDE_PHOTOS
    ? "\nCurated atelier pages built (with photos)."
    : "\nText-only practice pages built (no photos)."
);
