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
  menuBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("show");
    document.body.classList.toggle("menu-open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    })
  );

  document.addEventListener("click", (e) => {
    if (!mobileMenu.classList.contains("show")) return;
    const insideMenu = mobileMenu.contains(e.target);
    const clickedBtn = menuBtn.contains(e.target);
    if (insideMenu || clickedBtn) return;
    mobileMenu.classList.remove("show");
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !mobileMenu.classList.contains("show")) return;
    mobileMenu.classList.remove("show");
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && mobileMenu.classList.contains("show")) {
      mobileMenu.classList.remove("show");
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

const topbar = document.querySelector(".topbar");
const galleryHeader = document.querySelector(".gallery-page .nav");
const handleScrollHeader = () => {
  const scrolled = window.scrollY > 24;
  if (topbar) topbar.classList.toggle("scrolled", scrolled);
  if (galleryHeader) galleryHeader.classList.toggle("scrolled", scrolled);
};
window.addEventListener("scroll", handleScrollHeader, { passive: true });
handleScrollHeader();

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
  const baWrap = document.querySelector(".ba-wrap");
  const baAfter = document.getElementById("ba-after");
  const baDivider = document.getElementById("ba-divider");
  const baHandle = document.getElementById("ba-handle");
  const baPanel = baOverlay?.querySelector(".ba-panel");
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
  let pointerTracking = false;

  function scheduleAdvance() {
    clearTimeout(timer);
    timer = setTimeout(() => go(i + 1), 6500);
  }

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
    scheduleAdvance();
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
    if (baRange) baRange.value = String(Math.round(pct));
  }

  function setBeforeAfterFromClientX(clientX) {
    if (!baWrap) return;
    const rect = baWrap.getBoundingClientRect();
    if (!rect.width) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    updateBeforeAfter(pct);
  }

  let baDragging = false;
  if (baWrap) {
    baWrap.addEventListener(
      "pointerdown",
      (e) => {
        if (!baOverlay?.classList.contains("show")) return;
        baDragging = true;
        baWrap.setPointerCapture(e.pointerId);
        setBeforeAfterFromClientX(e.clientX);
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false }
    );
    baWrap.addEventListener(
      "pointermove",
      (e) => {
        if (!baDragging) return;
        setBeforeAfterFromClientX(e.clientX);
        e.preventDefault();
      },
      { passive: false }
    );
    const endBaDrag = (e) => {
      if (!baDragging) return;
      baDragging = false;
      try {
        baWrap.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer may already be released */
      }
    };
    baWrap.addEventListener("pointerup", endBaDrag);
    baWrap.addEventListener("pointercancel", endBaDrag);
    baWrap.addEventListener("lostpointercapture", () => {
      baDragging = false;
    });
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

  function handleSwipe(dx, dy) {
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

  function capturePoint(clientX, clientY) {
    touchStartX = clientX;
    touchStartY = clientY;
    clearTimeout(timer);
  }

  function onTouchStart(e) {
    const touch = e.changedTouches?.[0] || e.touches?.[0];
    if (!touch) return;
    capturePoint(touch.clientX, touch.clientY);
  }

  function onTouchEnd(e) {
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    handleSwipe(touch.clientX - touchStartX, touch.clientY - touchStartY);
    scheduleAdvance();
  }

  function onPointerDown(e) {
    if (e.pointerType !== "touch") return;
    pointerTracking = true;
    capturePoint(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    if (!pointerTracking || e.pointerType !== "touch") return;
    pointerTracking = false;
    handleSwipe(e.clientX - touchStartX, e.clientY - touchStartY);
    scheduleAdvance();
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
      updateBeforeAfter(50);
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
    baRange.addEventListener("change", (e) => updateBeforeAfter(e.target.value));
    ["touchstart", "touchmove", "touchend"].forEach((evt) => {
      baRange.addEventListener(evt, (e) => e.stopPropagation());
    });
  }
  if (baPanel) {
    baPanel.addEventListener("click", (e) => e.stopPropagation());
    if (!baPanel.querySelector(".ba-hint")) {
      const baHint = document.createElement("p");
      baHint.className = "ba-hint";
      baHint.textContent = "Drag on the image to compare before and after";
      baPanel.appendChild(baHint);
    }
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

  const leftPanel = document.querySelector(".gallery-page .left");
  const rightPanel = document.querySelector(".gallery-page .right");
  const galleryBtn = document.getElementById("gallery-open");
  const baBtn = document.getElementById("ba-open");
  const commissionBtn = leftPanel?.querySelector(".cta");

  if (window.matchMedia("(max-width: 640px)").matches) {
    if (galleryBtn) galleryBtn.textContent = "Gallery";
    if (baBtn) baBtn.textContent = "Compare";
    if (commissionBtn) commissionBtn.textContent = "Inquire";

    if (leftPanel && !leftPanel.querySelector(".info-toggle")) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "info-toggle";
      toggle.textContent = "More";
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", () => {
        const open = leftPanel.classList.toggle("details-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Less" : "More";
      });
      leftPanel.querySelector(".cta-row")?.appendChild(toggle);
    }

    if (dots && !document.querySelector(".slide-progress")) {
      const progress = document.createElement("div");
      progress.className = "slide-progress";
      progress.setAttribute("aria-hidden", "true");
      document.body.appendChild(progress);
      meta.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.className = "dot" + (idx === 0 ? " active" : "");
        dot.addEventListener("click", () => go(idx));
        progress.appendChild(dot);
      });
    }
  }

  let swipeZone = document.querySelector(".gallery-page .swipe-zone");
  if (!swipeZone) {
    swipeZone = document.createElement("div");
    swipeZone.className = "swipe-zone";
    swipeZone.setAttribute("aria-hidden", "true");
    document.body.appendChild(swipeZone);
  }

  const swipeTargets = [swipeZone, ...slides];
  swipeTargets.forEach((surface) => {
    surface.addEventListener("touchstart", onTouchStart, { passive: true });
    surface.addEventListener("touchend", onTouchEnd, { passive: true });
    surface.addEventListener("pointerdown", onPointerDown, { passive: true });
    surface.addEventListener("pointerup", onPointerUp, { passive: true });
  });

  updateBeforeAfter(50);
  go(0);
}
