/* Sync active nav link from URL. Nav markup comes from HTML (run tools/sync-nav.js after edits). */
(function syncNavActive() {
  const config = window.SITE_NAV;
  if (!config) return;

  const path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  if (!page || page === "connieharrisart") page = "index.html";

  document.querySelectorAll(".topbar .nav a, .mobile-menu a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isHome = page === "index.html" && (href === "index.html" || href === "./");
    const active = href === page || isHome;
    link.classList.toggle("active", active);
  });
})();
