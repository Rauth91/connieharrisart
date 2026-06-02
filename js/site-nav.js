/* Sync active nav link from URL. Nav markup comes from HTML (run tools/sync-nav.js after edits). */
(function syncNavActive() {
  const config = window.SITE_NAV;
  if (!config) return;

  function applyActive() {
    const path = window.location.pathname;
    let page = path.split("/").pop() || "index.html";
    if (!page || page === "connieharrisart") page = "index.html";

    const hash = window.location.hash;
    const workPages = new Set((window.SITE_PRACTICES || []).map((p) => p.href));

    document.querySelectorAll(".topbar .nav a, .mobile-menu a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      let active = false;

      if (href === "index.html#work") {
        active = workPages.has(page) || (page === "index.html" && (hash === "#work" || !hash || hash === "#"));
      } else if (href === "index.html#studio") {
        active = page === "index.html" && hash === "#studio";
      } else {
        active = href === page;
      }

      link.classList.toggle("active", active);
    });
  }

  applyActive();
  window.addEventListener("hashchange", applyActive);
})();
