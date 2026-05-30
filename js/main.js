if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.15,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!menuBtn || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.remove("show");
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("show");
    document.body.classList.toggle("menu-open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!mobileMenu.classList.contains("show")) return;
    if (mobileMenu.contains(event.target) || menuBtn.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("show")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && mobileMenu.classList.contains("show")) closeMenu();
  });
}

initMobileMenu();

const topbar = document.querySelector(".topbar");
const handleScrollHeader = () => {
  if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", handleScrollHeader, { passive: true });
handleScrollHeader();
