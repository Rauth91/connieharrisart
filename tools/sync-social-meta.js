#!/usr/bin/env node
/**
 * Sync favicon links and Open Graph image tags across all HTML pages.
 * Usage: node tools/sync-social-meta.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://rauth91.github.io/connieharrisart";

const FAVICON_BLOCK = `<link rel="icon" href="images/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="images/favicon-32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="images/apple-touch-icon.png" sizes="180x180" />`;

const OG_IMAGE_BLOCK = `<meta property="og:image" content="${ORIGIN}/images/og-share.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Hand-painted mural by Connie Harris, decorative artist in Louisiana" />
<meta name="twitter:image" content="${ORIGIN}/images/og-share.jpg" />`;

const PAGE_URLS = {
  "index.html": `${ORIGIN}/`,
  "murals.html": `${ORIGIN}/murals.html`,
  "faux-finishes.html": `${ORIGIN}/faux-finishes.html`,
  "bas-relief.html": `${ORIGIN}/bas-relief.html`,
  "cabinet-finishes.html": `${ORIGIN}/cabinet-finishes.html`,
  "ceilings-floors.html": `${ORIGIN}/ceilings-floors.html`,
  "chinoiserie.html": `${ORIGIN}/chinoiserie.html`,
  "classes.html": `${ORIGIN}/classes.html`,
  "contact.html": `${ORIGIN}/contact.html`,
};

function stripOld(lines) {
  return lines.filter((line) => {
    if (/rel="icon"/i.test(line) || /apple-touch-icon/i.test(line)) return false;
    if (/property="og:image"/i.test(line)) return false;
    if (/og:image:(width|height|alt)/i.test(line)) return false;
    if (/name="twitter:image"/i.test(line)) return false;
    return true;
  });
}

function ensureOgType(lines) {
  if (lines.some((l) => /property="og:type"/i.test(l))) return lines;
  const idx = lines.findIndex((l) => /property="og:title"/i.test(l));
  if (idx === -1) return lines;
  const out = [...lines];
  out.splice(idx, 0, '<meta property="og:type" content="website" />');
  return out;
}

function ensureTwitterCard(lines) {
  if (lines.some((l) => /name="twitter:card"/i.test(l))) return lines;
  const idx = lines.findIndex((l) => /name="twitter:image"/i.test(l));
  if (idx === -1) return lines;
  const out = [...lines];
  out.splice(idx, 0, '<meta name="twitter:card" content="summary_large_image" />');
  return out;
}

function ensureOgUrl(lines, url) {
  const cleaned = lines.filter((l) => !/property="og:url"/i.test(l));
  const idx = cleaned.findIndex((l) => /property="og:image"/i.test(l));
  if (idx === -1) return cleaned;
  const out = [...cleaned];
  out.splice(idx, 0, `<meta property="og:url" content="${url}" />`);
  return out;
}

for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, "utf8");
  const headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
  if (!headMatch) continue;

  let head = headMatch[0];
  let lines = head.split("\n");

  lines = stripOld(lines);
  lines = ensureOgType(lines);

  const themeIdx = lines.findIndex((l) => /name="theme-color"/i.test(l));
  const titleIdx = lines.findIndex((l) => /<title>/i.test(l));
  const insertAt = themeIdx !== -1 ? themeIdx : titleIdx !== -1 ? titleIdx : 6;

  const ogLines = OG_IMAGE_BLOCK.split("\n");
  lines.splice(insertAt, 0, ...ogLines);
  lines = ensureTwitterCard(lines);
  lines = ensureOgUrl(lines, PAGE_URLS[file] || `${ORIGIN}/${file}`);

  const favInsert = lines.findIndex((l) => /<title>/i.test(l));
  const favLines = FAVICON_BLOCK.split("\n");
  lines.splice(favInsert !== -1 ? favInsert : insertAt, 0, ...favLines);

  const newHead = lines.join("\n");
  html = html.replace(headMatch[0], newHead);
  fs.writeFileSync(filePath, html);
  console.log(`  ✓ ${file}`);
}

console.log("Social meta synced.");
