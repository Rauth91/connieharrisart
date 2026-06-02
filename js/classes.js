(function initClassesPage() {
  const heroTitle = document.getElementById("hero-title");
  if (!heroTitle) return;

  const runShimmer = () => {
    heroTitle.classList.remove("shimmer");
    void heroTitle.offsetWidth;
    heroTitle.classList.add("shimmer");
  };
  setTimeout(runShimmer, 500);
  setInterval(runShimmer, 7000);
})();
