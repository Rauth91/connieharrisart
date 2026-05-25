#!/usr/bin/env node
/**
 * Copies client photos into the site using js/photo-config.js paths.
 * Usage: node tools/replace-photos.js
 *
 * Name files in client-photos/ to match destination filenames:
 * hero.jpg, slide-01.jpg, gallery-01.jpg, before.jpg, after.jpg, etc.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE_PHOTOS = require(path.join(ROOT, "js", "photo-config.js"));

function walk(obj) {
  const out = [];
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...walk(value));
    } else if (typeof value === "string") {
      out.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "string") out.push(v);
      });
    }
  }
  return out;
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main() {
  const sourceDir = path.join(ROOT, "client-photos");
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
    console.log("Created client-photos/. Add JPG/PNG/WebP files named like hero.jpg, slide-01.jpg, etc.");
    return;
  }

  const available = new Set(
    fs
      .readdirSync(sourceDir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .map((f) => f.toLowerCase())
  );

  if (!available.size) {
    console.log("No images in client-photos/. Add files and run again.");
    return;
  }

  let copied = 0;
  let skipped = 0;
  const targets = [...new Set(walk(SITE_PHOTOS))];

  for (const destPath of targets) {
    const filename = path.basename(destPath);
    const src = path.join(sourceDir, filename);
    const destFull = path.join(ROOT, destPath);

    if (!available.has(filename.toLowerCase())) {
      skipped++;
      continue;
    }

    try {
      copyFile(src, destFull);
      copied++;
      console.log(`✓ ${destPath}`);
    } catch (e) {
      console.log(`✗ ${destPath} (${e.message})`);
    }
  }

  console.log(`\nDone. ${copied} copied, ${skipped} waiting for files in client-photos/.`);
  console.log("Refresh the site. Unmatched slots keep current placeholder images.");
}

main();
