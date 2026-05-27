const SITE_NAV = [
  { href: "index.html", label: "Home" },
  { href: "murals.html", label: "Murals" },
  { href: "faux-finishes.html", label: "Wall Finishes" },
  { href: "bas-relief.html", label: "Bas Relief" },
  { href: "cabinet-finishes.html", label: "Cabinets" },
  { href: "ceilings-floors.html", label: "Ceilings & Floors" },
  { href: "classes.html", label: "Classes" },
  { href: "contact.html", label: "Contact" },
];

function currentPage() {
  const file = window.location.pathname.split("/").pop();
  return !file || file === "/" ? "index.html" : file;
}

function navLinksHtml() {
  const page = currentPage();
  return SITE_NAV.map(({ href, label }) => {
    const active = page === href;
    return `<a href="${href}"${active ? ' class="active"' : ''}>${label}</a>`;
  }).join("");
}

function renderSiteNav() {
  const header = document.querySelector("header.topbar");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!header) return;

  const links = navLinksHtml();
  header.innerHTML = `
    <a class="brand" href="index.html">Connie Harris</a>
    <button class="menu-btn" id="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false">Menu</button>
    <nav class="nav" aria-label="Primary">${links}</nav>
  `;
  if (mobileMenu) mobileMenu.innerHTML = links;
}

renderSiteNav();
