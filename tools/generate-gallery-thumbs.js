#!/usr/bin/env node
/**
 * Generate -thumb.jpg previews for gallery mosaic (faster page loads).
 * Usage: node tools/generate-gallery-thumbs.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const GALLERY_ROOT = path.join(ROOT, "images", "gallery");
const THUMB_MAX = 520;
const JPEG_QUALITY = 82;

function thumbPath(srcPath) {
  const ext = path.extname(srcPath);
  return srcPath.slice(0, -ext.length) + "-thumb" + ext;
}

function generateThumb(srcPath) {
  const dest = thumbPath(srcPath);
  const tmp = dest + ".tmp.jpg";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execSync(`sips -s format jpeg -s formatOptions ${JPEG_QUALITY} "${srcPath}" --out "${tmp}"`, {
    stdio: "pipe",
  });
  execSync(`sips -Z ${THUMB_MAX} "${tmp}"`, { stdio: "pipe" });
  fs.renameSync(tmp, dest);
  return dest;
}

let count = 0;
for (const dir of fs.readdirSync(GALLERY_ROOT)) {
  const folder = path.join(GALLERY_ROOT, dir);
  if (!fs.statSync(folder).isDirectory()) continue;

  for (const file of fs.readdirSync(folder)) {
    if (!/\.jpe?g$/i.test(file) || file.includes("-thumb")) continue;
    const src = path.join(folder, file);
    generateThumb(src);
    count += 1;
  }
}

console.log(`✓ ${count} thumbnails generated`);
