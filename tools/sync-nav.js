#!/usr/bin/env node
/**
 * Regenerate header + mobile nav + footer on every page from js/site-config.js
 * Usage: node tools/sync-nav.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const {
  SITE_NAV,
  SITE_VERSION,
  SITE_PRACTICES,
  SITE_NAV_WORK,
  SITE_TAGLINE,
} = require(path.join(ROOT, "js", "site-config.js"));

const HEAD_SCRIPTS =
  `  <script src="js/site-config.js?v=${SITE_VERSION}"></script>\n` +
  `  <script src="js/site-nav.js?v=${SITE_VERSION}" defer></script>\n`;

function navBlock(activeHref) {
  const links = SITE_NAV.map(({ href, label }) => {
    const active = activeHref && href === activeHref ? ' class="active"' : "";
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

function footerBlock() {
  return `<footer class="footer">
  <p class="footer-tagline">${SITE_TAGLINE}</p>
  <div class="footer-row">
    <span>Connie Harris Art</span>
    <span>St. Gabriel, Louisiana</span>
    <nav class="footer-social">
      <a href="https://www.instagram.com/connieaharrisart/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.facebook.com/connieharrisart/" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.pinterest.com/connieharrisart/" target="_blank" rel="noopener">Pinterest</a>
    </nav>
    <span>© 2026</span>
  </div>
</footer>`;
}

const ACTIVE_BY_PAGE = {
  "index.html": null,
  "classes.html": "classes.html",
  "contact.html": "contact.html",
};
for (const p of SITE_PRACTICES) {
  ACTIVE_BY_PAGE[p.href] = SITE_NAV_WORK;
}

function cleanMarkup(text) {
  text = text.replace(/\s*<script src="js\/site-config\.js[^"]*"><\/script>\s*/g, "");
  text = text.replace(/\s*<script src="js\/site-nav\.js[^"]*"><\/script>\s*/g, "");
  text = text.replace(/<header class="topbar">[\s\S]*?<\/header>\s*/g, "");
  text = text.replace(/<div class="mobile-menu" id="mobile-menu">[\s\S]*?<\/div>\s*/g, "");
  text = text.replace(/<footer class="footer">[\s\S]*?<\/footer>\s*/g, "");
  text = text.replace(/\n<\/header>\s*\n<\/header>\s*/g, "\n");
  text = text.replace(
    /(<div class="mobile-menu" id="mobile-menu">[\s\S]*?<\/div>)\s*\n<\/header>\s*/g,
    "$1\n"
  );
  return text;
}

function syncFile(filePath) {
  const name = path.basename(filePath);
  const active = ACTIVE_BY_PAGE[name];
  if (active === undefined) return false;

  let text = cleanMarkup(fs.readFileSync(filePath, "utf8"));

  const bodyMatch = text.match(/<body[^>]*>/);
  if (!bodyMatch) {
    console.log(`✗ no body tag: ${name}`);
    return false;
  }

  const insertAt = bodyMatch.index + bodyMatch[0].length;
  text = text.slice(0, insertAt) + "\n" + navBlock(active) + "\n" + text.slice(insertAt);
  text = text.replace("</head>", HEAD_SCRIPTS + "</head>");

  const footer = footerBlock();
  if (!text.includes('<footer class="footer">')) {
    if (text.includes('<script src="https://cdn.jsdelivr.net/npm/gsap')) {
      text = text.replace('<script src="https://cdn.jsdelivr.net/npm/gsap', `${footer}\n<script src="https://cdn.jsdelivr.net/npm/gsap`);
    } else if (text.includes('<script src="js/main.js')) {
      text = text.replace('<script src="js/main.js', `${footer}\n<script src="js/main.js`);
    } else {
      text = text.replace("</body>", `${footer}\n</body>`);
    }
  }

  fs.writeFileSync(filePath, text);
  console.log(`✓ ${name}`);
  return true;
}

fs.readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"))
  .forEach((f) => syncFile(path.join(ROOT, f)));
