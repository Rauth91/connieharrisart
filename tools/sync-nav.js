#!/usr/bin/env node
/**
 * Regenerate header + mobile nav on every page from js/site-config.js
 * Usage: node tools/sync-nav.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { SITE_NAV } = require(path.join(ROOT, "js", "site-config.js"));

const HEAD_SCRIPTS =
  '  <script src="js/site-config.js?v=20260531"></script>\n  <script src="js/site-nav.js?v=20260531" defer></script>\n';

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

const ACTIVE = Object.fromEntries(SITE_NAV.map((item) => [item.href, item.href]));

function syncFile(filePath) {
  const name = path.basename(filePath);
  const active = ACTIVE[name];
  if (!active) return false;

  let text = fs.readFileSync(filePath, "utf8");

  text = text.replace(/\s*<script src="js\/site-config\.js[^"]*"><\/script>\s*/g, "");
  text = text.replace(/\s*<script src="js\/site-nav\.js[^"]*"><\/script>\s*/g, "");
  text = text.replace(/<header class="topbar">[\s\S]*?<\/header>\s*/g, "");
  text = text.replace(/<div class="mobile-menu" id="mobile-menu">[\s\S]*?<\/div>\s*/g, "");

  const bodyMatch = text.match(/<body[^>]*>/);
  if (!bodyMatch) {
    console.log(`✗ no body tag: ${name}`);
    return false;
  }

  const insertAt = bodyMatch.index + bodyMatch[0].length;
  const block = navBlock(active);
  text = text.slice(0, insertAt) + "\n" + block + "\n" + text.slice(insertAt);

  text = text.replace("</head>", HEAD_SCRIPTS + "</head>");

  fs.writeFileSync(filePath, text);
  console.log(`✓ ${name}`);
  return true;
}

fs.readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"))
  .forEach((f) => syncFile(path.join(ROOT, f)));
