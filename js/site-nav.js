/* Sync active nav link from URL (static nav is in HTML). */
(function syncNavActive() {
  const path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  if (!page || page === "connieharrisart") page = "index.html";

  document.querySelectorAll(".topbar .nav a, .mobile-menu a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isHome = page === "index.html" && (href === "index.html" || href === "./" || href === "/");
    const active = href === page || isHome;
    link.classList.toggle("active", active);
  });
})();
