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

const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("show"));
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.remove("show"))
  );
}

function initGalleryPage({ meta }) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.getElementById("dots");
  const k = document.getElementById("k");
  const t = document.getElementById("t");
  const d = document.getElementById("d");
  const n = document.getElementById("n");
  if (!slides.length || !dots || !k || !t || !d || !n || !meta?.length) return;

  const galleryOpen = document.getElementById("gallery-open");
  const galleryOverlay = document.getElementById("gallery-overlay");
  const galleryClose = document.getElementById("gallery-close");
  const baOpen = document.getElementById("ba-open");
  const baOverlay = document.getElementById("ba-overlay");
  const baClose = document.getElementById("ba-close");
  const baRange = document.getElementById("ba-range");
  const baAfter = document.getElementById("ba-after");
  const baDivider = document.getElementById("ba-divider");
  const baHandle = document.getElementById("ba-handle");
  const galleryImages = document.querySelectorAll(".gallery-item img");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxCount = document.getElementById("lightbox-count");
  const lightboxCaption = document.getElementById("lightbox-caption");

  let i = 0;
  let timer;
  let lightboxIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function go(x) {
    clearTimeout(timer);
    i = (x + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle("active", j === i));
    document.querySelectorAll(".dot").forEach((el, j) => el.classList.toggle("active", j === i));
    k.textContent = meta[i][0];
    t.innerHTML = meta[i][1];
    d.textContent = meta[i][2];
    n.textContent = String(i + 1).padStart(2, "0");
    t.classList.remove("shimmer");
    void t.offsetWidth;
    t.classList.add("shimmer");
    timer = setTimeout(() => go(i + 1), 6500);
  }

  slides.forEach((_, x) => {
    const el = document.createElement("div");
    el.className = "dot" + (x === 0 ? " active" : "");
    el.onclick = () => go(x);
    dots.appendChild(el);
  });

  function updateBeforeAfter(v) {
    if (!baAfter || !baDivider || !baHandle) return;
    const pct = Math.max(0, Math.min(100, Number(v)));
    baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
    baDivider.style.left = `${pct}%`;
    baHandle.style.left = `${pct}%`;
  }

  function renderLightbox(index) {
    if (!galleryImages.length || !lightboxImage || !lightboxCount || !lightboxCaption) return;
    const total = galleryImages.length;
    lightboxIndex = (index + total) % total;
    const img = galleryImages[lightboxIndex];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "Expanded gallery artwork";
    lightboxCount.textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    lightboxCaption.textContent = img.alt || `Piece ${String(lightboxIndex + 1).padStart(2, "0")}`;
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
  }

  function onTouchStart(e) {
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function onTouchEnd(e) {
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    if (lightbox?.classList.contains("show")) {
      if (dx < 0) renderLightbox(lightboxIndex + 1);
      if (dx > 0) renderLightbox(lightboxIndex - 1);
      return;
    }
    if (galleryOverlay?.classList.contains("show") || baOverlay?.classList.contains("show")) return;
    if (dx < 0) go(i + 1);
    if (dx > 0) go(i - 1);
  }

  if (galleryOpen && galleryOverlay) {
    galleryOpen.addEventListener("click", (e) => {
      e.preventDefault();
      galleryOverlay.classList.add("show");
      galleryOverlay.setAttribute("aria-hidden", "false");
    });
    galleryOverlay.addEventListener("click", (e) => {
      if (e.target === galleryOverlay) {
        galleryOverlay.classList.remove("show");
        galleryOverlay.setAttribute("aria-hidden", "true");
      }
    });
  }
  if (galleryClose && galleryOverlay) {
    galleryClose.addEventListener("click", () => {
      galleryOverlay.classList.remove("show");
      galleryOverlay.setAttribute("aria-hidden", "true");
    });
  }

  if (baOpen && baOverlay) {
    baOpen.addEventListener("click", (e) => {
      e.preventDefault();
      baOverlay.classList.add("show");
      baOverlay.setAttribute("aria-hidden", "false");
    });
    baOverlay.addEventListener("click", (e) => {
      if (e.target === baOverlay) {
        baOverlay.classList.remove("show");
        baOverlay.setAttribute("aria-hidden", "true");
      }
    });
  }
  if (baClose && baOverlay) {
    baClose.addEventListener("click", () => {
      baOverlay.classList.remove("show");
      baOverlay.setAttribute("aria-hidden", "true");
    });
  }
  if (baRange) {
    baRange.addEventListener("input", (e) => updateBeforeAfter(e.target.value));
  }

  galleryImages.forEach((img, idx) =>
    img.addEventListener("click", () => {
      renderLightbox(idx);
      if (lightbox) {
        lightbox.classList.add("show");
        lightbox.setAttribute("aria-hidden", "false");
      }
    })
  );
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => renderLightbox(lightboxIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => renderLightbox(lightboxIndex + 1));
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (lightbox?.classList.contains("show")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") renderLightbox(lightboxIndex - 1);
      if (e.key === "ArrowRight") renderLightbox(lightboxIndex + 1);
      return;
    }
    if (e.key === "Escape" && baOverlay?.classList.contains("show")) {
      baOverlay.classList.remove("show");
      baOverlay.setAttribute("aria-hidden", "true");
      return;
    }
    if (e.key === "ArrowRight") go(i + 1);
    if (e.key === "ArrowLeft") go(i - 1);
  });

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });

  updateBeforeAfter(50);
  go(0);
}
