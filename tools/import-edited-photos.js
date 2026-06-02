#!/usr/bin/env node
/**
 * Import photos from Desktop/website-ready into connieharris/images/
 * (3:4 crop, sized for web). Picks largest files for slides, rest for gallery.
 *
 * Usage: node tools/import-edited-photos.js [sourceDir]
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DEFAULT_SOURCE = path.join(process.env.HOME, "Desktop", "website-ready");
const SITE_PHOTOS = require(path.join(ROOT, "js", "photo-config.js"));

const FOLDER_TO_KEY = {
  "Bas-Relief": { key: "basRelief", dir: "bas-relief" },
  Chinoiserie: { key: "chinoiserie", dir: "chinoiserie" },
  Murals: { key: "murals", dir: "murals" },
  "Wall-Finishes": { key: "fauxFinishes", dir: "faux-finishes" },
  "Cabinet-Finishes": { key: "cabinetFinishes", dir: "cabinet-finishes" },
  "Ceilings-Floors": { key: "ceilingsFloors", dir: "ceilings-floors" },
};

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

/**
 * Keep the curator's numbered order (01-, 02-, …). The leading number is the
 * intended priority — #1 becomes slide-01 (the cover/lead), and so on.
 * Unreadable files are dropped.
 */
function orderImages(dir, files) {
  return files
    .map((f) => {
      const full = path.join(dir, f);
      const { w, h } = getSize(full);
      return { f, area: w * h, w, h };
    })
    .filter((x) => x.area > 0)
    .sort((a, b) => leadingNum(a.f) - leadingNum(b.f) || a.f.localeCompare(b.f));
}

function leadingNum(name) {
  const m = name.match(/^(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
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

function assignFolder(sourceDir, folderName, meta) {
  const dir = path.join(sourceDir, folderName);
  const files = listImages(dir);
  if (!files.length) {
    console.log(`  skip ${folderName} (empty)`);
    return null;
  }

  const ranked = orderImages(dir, files);
  const full = (f) => path.join(dir, f);
  const { key, dir: galleryDir } = meta;

  const slideCount = Math.min(SLIDE_COUNT, ranked.length);
  const galleryCount = Math.min(MAX_GALLERY, Math.max(0, ranked.length - slideCount));

  const slides = ranked.slice(0, slideCount);
  const gallery = ranked.slice(slideCount, slideCount + galleryCount);

  cleanDir(galleryDir);

  const slidePaths = Array.from(
    { length: slideCount },
    (_, i) => `images/gallery/${galleryDir}/slide-${String(i + 1).padStart(2, "0")}.jpg`
  );
  slides.forEach((item, i) => {
    exportImage(full(item.f), slidePaths[i], PRESETS.slide);
  });

  const galleryPaths = galleryPathList(galleryDir, galleryCount);
  gallery.forEach((item, i) => {
    if (galleryPaths[i]) exportImage(full(item.f), galleryPaths[i], PRESETS.gallery);
  });

  const workSrc = slides[0] || ranked[0];
  if (SITE_PHOTOS.home.work[key] && workSrc) {
    exportImage(full(workSrc.f), SITE_PHOTOS.home.work[key], PRESETS.work);
  }

  console.log(
    `  ✓ ${folderName}: ${slideCount} slides, ${gallery.length} gallery (${ranked.length} source files)`
  );

  return { key, dir: galleryDir, slideCount, galleryCount };
}

function assignHomeHero(sourceDir) {
  const muralDir = path.join(sourceDir, "Murals");
  const files = listImages(muralDir);
  if (!files.length) return;
  const ranked = orderImages(muralDir, files);
  exportImage(path.join(muralDir, ranked[0].f), SITE_PHOTOS.home.hero, PRESETS.work);

  const brDir = path.join(sourceDir, "Bas-Relief");
  const br = listImages(brDir);
  if (br.length) {
    const r = orderImages(brDir, br);
    exportImage(path.join(brDir, r[0].f), SITE_PHOTOS.contact.hero, PRESETS.work);
  }

  console.log("  ✓ home hero, contact hero");
}

function main() {
  const sourceDir = process.argv[2] || DEFAULT_SOURCE;
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source not found: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`Importing photos from ${sourceDir}\n`);

  const manifest = [];
  for (const [folder, meta] of Object.entries(FOLDER_TO_KEY)) {
    const m = assignFolder(sourceDir, folder, meta);
    if (m) manifest.push(m);
  }

  updatePhotoConfig(manifest);
  assignHomeHero(sourceDir);

  console.log("\nDone. Updated photo-config.js");
  console.log("Next: node tools/build-portfolio-pages.js");
}

main();
