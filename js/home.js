(function initHomePage() {
  if (typeof gsap === "undefined") return;

  const heroArt = document.querySelector(".hero-art img");
  if (heroArt) {
    gsap.to(heroArt, {
      scale: 1.08,
      duration: 22,
      ease: "none",
      repeat: -1,
      yoyo: true,
    });
  }

  const heroTitle = document.querySelector(".hero-copy h1");
  if (!heroTitle) return;

  const runShimmer = () => {
    heroTitle.classList.remove("shimmer");
    void heroTitle.offsetWidth;
    heroTitle.classList.add("shimmer");
  };

  setTimeout(runShimmer, 500);
  setInterval(runShimmer, 7000);
})();
