#!/usr/bin/env node
/**
 * Center-crop gallery images to 3:4 for consistent editorial framing.
 * Only downscales; never upscales. Overwrites files in images/gallery/.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const GALLERY = path.join(ROOT, "images", "gallery");
const ASPECT_W = 3;
const ASPECT_H = 4;
const MAX_LONGEST = 1080;
const MIN_LONGEST = 810;

function getSize(file) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${file}"`, { encoding: "utf8" });
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0);
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0);
  return { w, h };
}

function cropBox(w, h) {
  const target = ASPECT_W / ASPECT_H;
  const current = w / h;
  if (Math.abs(current - target) < 0.02) {
    return null;
  }
  if (current > target) {
    const cropW = Math.round(h * target);
    return { cropW, cropH: h, x: Math.round((w - cropW) / 2), y: 0 };
  }
  const cropH = Math.round(w / target);
  return { cropW: w, cropH, x: 0, y: Math.round((h - cropH) / 2) };
}

function normalizeFile(file) {
  const tmp = `${file}.normalize.tmp.jpg`;
  execSync(`sips -s format jpeg "${file}" --out "${tmp}"`, { stdio: "pipe" });

  let { w, h } = getSize(tmp);
  const box = cropBox(w, h);
  if (box) {
    execSync(
      `sips -c ${box.cropH} ${box.cropW} --cropOffset ${box.y} ${box.x} "${tmp}"`,
      { stdio: "pipe" }
    );
    ({ w, h } = getSize(tmp));
  }

  let longest = Math.max(w, h);
  if (longest > MAX_LONGEST) {
    execSync(`sips -Z ${MAX_LONGEST} "${tmp}"`, { stdio: "pipe" });
    longest = MAX_LONGEST;
  } else if (longest < MIN_LONGEST) {
    execSync(`sips -Z ${MIN_LONGEST} "${tmp}"`, { stdio: "pipe" });
  }

  fs.renameSync(tmp, file);
  const final = getSize(file);
  return { cropped: Boolean(box), upscaled: final.w < w || final.h < h, ...final };
}

function walk(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += walk(full);
      continue;
    }
    if (!/\.(jpe?g)$/i.test(entry.name)) continue;
    const result = normalizeFile(full);
    const rel = path.relative(GALLERY, full);
    console.log(`  ✓ ${rel} → ${result.w}×${result.h}${result.cropped ? " (cropped)" : ""}`);
    count++;
  }
  return count;
}

console.log("Normalizing gallery images to 3:4 …\n");
const n = walk(GALLERY);
console.log(`\nDone. ${n} images processed.`);
