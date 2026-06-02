#!/usr/bin/env node
/**
 * Import photos from Desktop/website-ready into connieharris/images/
 * Uses Website-Selected (numbered picks) first, then fills from full folders.
 *
 * Usage: node tools/import-edited-photos.js [sourceDir]
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DEFAULT_SOURCE = path.join(process.env.HOME, "Desktop", "website-ready");
const SITE_PHOTOS = require(path.join(ROOT, "js", "photo-config.js"));

const DISCIPLINES = [
  { key: "murals", dir: "murals", selected: "Murals", full: "Murals" },
  { key: "fauxFinishes", dir: "faux-finishes", selected: "Wall-Finishes", full: "Wall Finishes" },
  { key: "basRelief", dir: "bas-relief", selected: "Bas-Relief", full: "Bas-Relief" },
  { key: "cabinetFinishes", dir: "cabinet-finishes", selected: "Cabinet-Finishes", full: "cabinet-finishes" },
  { key: "ceilingsFloors", dir: "ceilings-floors", selected: "Ceilings-Floors", full: "ceilings-floors" },
  { key: "chinoiserie", dir: "chinoiserie", selected: "Chinoiserie", full: "Chin" },
];

const PRESETS = {
  slide: { max: 1080, crop: true, aspect: [3, 4] },
  gallery: { max: 1080, crop: true, aspect: [3, 4] },
  work: { max: 1080, crop: true, aspect: [3, 4] },
};

const SLIDE_COUNT = 4;
const MAX_GALLERY = 14;

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function getSize(file) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${file}"`, { encoding: "utf8" });
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0);
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0);
  return { w, h };
}

function leadingNum(name) {
  const m = name.match(/^(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

/** Match IMG_1234 across .jpg/.jpeg duplicates. */
function imgStem(name) {
  const base = name.replace(/^\d+-/, "");
  const m = base.match(/IMG[_\s-]*(\d+|[A-F0-9-]{8,})/i);
  if (m) return m[0].replace(/[_\s-]/g, "").toUpperCase();
  return base.replace(/\.[^.]+$/, "").toLowerCase();
}

function toEntries(dir, files) {
  return files
    .map((f) => {
      const full = path.join(dir, f);
      const { w, h } = getSize(full);
      return { f, dir, full, area: w * h, w, h, numbered: Number.isFinite(leadingNum(f)) && leadingNum(f) !== Number.POSITIVE_INFINITY };
    })
    .filter((x) => x.area > 0);
}

function orderNumbered(entries) {
  return [...entries].sort((a, b) => leadingNum(a.f) - leadingNum(b.f) || a.f.localeCompare(b.f));
}

function orderByQuality(entries) {
  return [...entries].sort((a, b) => b.area - a.area || a.f.localeCompare(b.f));
}

function dedupeEntries(entries) {
  const seen = new Map();
  for (const item of entries) {
    const stem = imgStem(item.f);
    const prev = seen.get(stem);
    if (!prev || item.area > prev.area) seen.set(stem, item);
  }
  return [...seen.values()];
}

function buildRankedList(sourceDir, discipline) {
  const selectedDir = path.join(sourceDir, "Website-Selected", discipline.selected);
  const fullDir = path.join(sourceDir, discipline.full);

  const selected = fs.existsSync(selectedDir)
    ? orderNumbered(toEntries(selectedDir, listImages(selectedDir)))
    : [];

  const usedStems = new Set(selected.map((x) => imgStem(x.f)));
  let extras = [];

  if (fs.existsSync(fullDir)) {
    extras = orderByQuality(toEntries(fullDir, listImages(fullDir))).filter(
      (x) => !usedStems.has(imgStem(x.f))
    );
  }

  return dedupeEntries([...selected, ...extras]);
}

function cleanDir(galleryDir) {
  const dir = path.join(ROOT, "images", "gallery", galleryDir);
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (/^(slide|gallery)-\d+\.jpg$/i.test(f)) fs.unlinkSync(path.join(dir, f));
  }
}

function cropBox(w, h, aspectW, aspectH) {
  const target = aspectW / aspectH;
  const current = w / h;
  if (current > target) {
    const cropW = Math.round(h * target);
    return { cropW, cropH: h, x: Math.round((w - cropW) / 2), y: 0 };
  }
  const cropH = Math.round(w / target);
  return { cropW: w, cropH, x: 0, y: Math.round((h - cropH) / 2) };
}

function exportImage(srcPath, destRel, opts) {
  const { max, crop = false, aspect } = opts;
  const dest = path.join(ROOT, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = dest + ".tmp.jpg";

  execSync(`sips -s format jpeg "${srcPath}" --out "${tmp}"`, { stdio: "pipe" });

  let { w, h } = getSize(tmp);
  if (crop && aspect) {
    const [aspectW, aspectH] = aspect;
    const box = cropBox(w, h, aspectW, aspectH);
    if (box.cropW < w || box.cropH < h) {
      execSync(
        `sips -c ${box.cropH} ${box.cropW} --cropOffset ${box.y} ${box.x} "${tmp}"`,
        { stdio: "pipe" }
      );
    }
    ({ w, h } = getSize(tmp));
  }

  const longest = Math.max(w, h);
  if (longest > max) {
    execSync(`sips -Z ${max} "${tmp}"`, { stdio: "pipe" });
  }

  fs.renameSync(tmp, dest);
}

function galleryPathList(folderDir, count) {
  return Array.from(
    { length: count },
    (_, i) => `images/gallery/${folderDir}/gallery-${String(i + 1).padStart(2, "0")}.jpg`
  );
}

function updatePhotoConfig(manifest) {
  const configPath = path.join(ROOT, "js", "photo-config.js");
  const site = require(configPath);
  for (const { key, dir, slideCount, galleryCount } of manifest) {
    site.gallery[key] = {
      slides: Array.from(
        { length: slideCount },
        (_, i) => `images/gallery/${dir}/slide-${String(i + 1).padStart(2, "0")}.jpg`
      ),
      gallery: galleryPathList(dir, galleryCount),
    };
  }
  const body = JSON.stringify(site, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"/g, '"');
  const out = `const SITE_PHOTOS = ${body};\n\nif (typeof window !== "undefined") {\n  window.SITE_PHOTOS = SITE_PHOTOS;\n}\nif (typeof module !== "undefined" && module.exports) {\n  module.exports = SITE_PHOTOS;\n}\n`;
  fs.writeFileSync(configPath, out);
}

function assignFolder(sourceDir, discipline) {
  const ranked = buildRankedList(sourceDir, discipline);
  if (!ranked.length) {
    console.log(`  skip ${discipline.dir} (no images)`);
    return null;
  }

  const { key, dir: galleryDir } = discipline;
  const slideCount = Math.min(SLIDE_COUNT, ranked.length);
  const galleryCount = Math.min(MAX_GALLERY, Math.max(0, ranked.length - slideCount));

  const slides = ranked.slice(0, slideCount);
  const gallery = ranked.slice(slideCount, slideCount + galleryCount);

  cleanDir(galleryDir);

  slides.forEach((item, i) => {
    exportImage(item.full, `images/gallery/${galleryDir}/slide-${String(i + 1).padStart(2, "0")}.jpg`, PRESETS.slide);
  });

  gallery.forEach((item, i) => {
    exportImage(item.full, `images/gallery/${galleryDir}/gallery-${String(i + 1).padStart(2, "0")}.jpg`, PRESETS.gallery);
  });

  const workSrc = slides[0] || ranked[0];
  if (SITE_PHOTOS.home.work[key] && workSrc) {
    exportImage(workSrc.full, SITE_PHOTOS.home.work[key], PRESETS.work);
  }

  const selectedCount = ranked.filter((x) => x.numbered).length;
  console.log(
    `  ✓ ${discipline.dir}: ${slideCount} slides, ${gallery.length} gallery (${selectedCount} curated picks + ${ranked.length - selectedCount} extras)`
  );

  return { key, dir: galleryDir, slideCount, galleryCount };
}

function assignHomeHero(sourceDir) {
  const muralRanked = buildRankedList(sourceDir, { selected: "Murals", full: "Murals" });
  if (muralRanked.length) {
    exportImage(muralRanked[0].full, SITE_PHOTOS.home.hero, PRESETS.work);
  }

  const brRanked = buildRankedList(sourceDir, {
    selected: "Bas-Relief",
    full: "Bas-Relief",
  });
  if (brRanked.length && SITE_PHOTOS.contact?.hero) {
    exportImage(brRanked[0].full, SITE_PHOTOS.contact.hero, PRESETS.work);
  }

  console.log("  ✓ home hero");
}

function assignClasses(sourceDir) {
  const classDir = path.join(sourceDir, "Class");
  const files = orderByQuality(toEntries(classDir, listImages(classDir)));
  if (!files.length) return;

  if (SITE_PHOTOS.classes?.hero) {
    exportImage(files[0].full, SITE_PHOTOS.classes.hero, PRESETS.work);
  }
  if (SITE_PHOTOS.classes?.signature && files[1]) {
    exportImage(files[1].full, SITE_PHOTOS.classes.signature, PRESETS.work);
  }

  console.log(`  ✓ classes page (${Math.min(files.length, 2)} photos)`);
}

function main() {
  const sourceDir = process.argv[2] || DEFAULT_SOURCE;
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source not found: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`Importing from ${sourceDir}`);
  console.log(`  Priority: Website-Selected numbered picks, then full folders by resolution\n`);

  const manifest = [];
  for (const discipline of DISCIPLINES) {
    const m = assignFolder(sourceDir, discipline);
    if (m) manifest.push(m);
  }

  updatePhotoConfig(manifest);
  assignHomeHero(sourceDir);
  assignClasses(sourceDir);

  console.log("\nDone. Updated photo-config.js");
  console.log("Next: node tools/build-portfolio-pages.js");
}

main();
