(function initHomePage() {
  if (typeof gsap === "undefined") return;

  const heroArt = document.querySelector(".hero-art img");
  if (heroArt) {
    gsap.fromTo(
      heroArt,
      { scale: 1.03 },
      { scale: 1.08, duration: 28, ease: "none" }
    );
  }
})();
