function initMagazine() {
  document.documentElement.classList.add("magazine-html");

  const book = document.querySelector(".magazine-book");
  const spreads = [...document.querySelectorAll(".magazine-spread")];
  const pageNum = document.getElementById("magazine-page-num");
  const spreadLabel = document.getElementById("magazine-spread-label");
  const progressFill = document.getElementById("magazine-progress-fill");
  const prevBtn = document.getElementById("magazine-prev");
  const nextBtn = document.getElementById("magazine-next");
  const tapNext = document.getElementById("magazine-tap-next");
  const tapPrev = document.getElementById("magazine-tap-prev");
  const railDots = [...document.querySelectorAll(".magazine-rail-dot")];

  if (!book || !spreads.length) return;

  const total = spreads.length;
  let activeIndex = 0;
  let scrollRaf = 0;

  function galleryOpen() {
    return document.body.classList.contains("gallery-open");
  }

  function lightboxOpen() {
    return document.getElementById("magazine-lightbox")?.classList.contains("show");
  }

  function spreadMainImages(spread) {
    const mains = [...spread.querySelectorAll("img.magazine-photo-main")];
    const compare = [...spread.querySelectorAll(".before-after__img")];
    return [...mains, ...compare];
  }

  function preloadSpreadImages(index) {
    [index - 1, index, index + 1].forEach((i) => {
      const spread = spreads[i];
      if (!spread || spread.classList.contains("magazine-spread--gallery")) return;
      spreadMainImages(spread).forEach((img) => {
        const src = img.getAttribute("src");
        if (!src || img.complete) return;
        const preload = new Image();
        preload.decoding = "async";
        preload.src = src;
      });
    });
  }

  function isGallerySpread(index = activeIndex) {
    return spreads[index]?.classList.contains("magazine-spread--gallery");
  }

  function findActiveSpreadIndex() {
    const focusY = book.scrollTop + book.clientHeight * 0.22;

    for (let idx = 0; idx < spreads.length; idx++) {
      const spread = spreads[idx];
      const top = spread.offsetTop;
      const bottom = top + spread.offsetHeight;
      if (focusY >= top && focusY < bottom) return idx;
    }

    const bookRect = book.getBoundingClientRect();
    const mid = bookRect.top + bookRect.height * 0.42;
    let bestIdx = activeIndex;
    let bestDist = Infinity;

    spreads.forEach((spread, idx) => {
      const rect = spread.getBoundingClientRect();
      const spreadMid = rect.top + rect.height * 0.35;
      const dist = Math.abs(spreadMid - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    return bestIdx;
  }

  function setActive(index, options = {}) {
    const next = Math.max(0, Math.min(index, total - 1));
    if (!options.force && next === activeIndex) return;

    activeIndex = next;
    const current = spreads[activeIndex];

    spreads.forEach((s, j) => s.classList.toggle("is-active", j === activeIndex));
    railDots.forEach((dot, j) => dot.classList.toggle("is-active", j === activeIndex));

    if (pageNum) pageNum.textContent = String(activeIndex + 1).padStart(2, "0");
    if (spreadLabel) spreadLabel.textContent = current?.dataset.spreadLabel || "";
    if (progressFill) progressFill.style.height = `${((activeIndex + 1) / total) * 100}%`;
    if (prevBtn) prevBtn.disabled = activeIndex === 0;
    if (nextBtn) nextBtn.disabled = activeIndex === total - 1;

    document.body.classList.toggle("magazine-on-gallery", isGallerySpread(activeIndex));
    document.body.classList.toggle(
      "magazine-on-compare",
      current?.classList.contains("magazine-spread--compare")
    );

    preloadSpreadImages(activeIndex);
    spreadMainImages(current).forEach((img) => ensurePhotoVisible(img));
  }

  function onBookScroll() {
    if (galleryOpen() || lightboxOpen()) return;
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      setActive(findActiveSpreadIndex());
    });
  }

  function goTo(index) {
    const target = spreads[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(index, { force: true });
  }

  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            if (galleryOpen() || lightboxOpen()) return;
            let best = null;
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              if (!best || entry.intersectionRatio > best.ratio) {
                best = { idx: spreads.indexOf(entry.target), ratio: entry.intersectionRatio };
              }
            });
            if (best && best.idx >= 0) setActive(best.idx);
          },
          { root: book, threshold: [0.2, 0.35, 0.5, 0.65] }
        )
      : null;

  spreads.forEach((s) => io?.observe(s));
  book.addEventListener("scroll", onBookScroll, { passive: true });

  railDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.spreadIndex);
      if (!Number.isNaN(idx)) goTo(idx);
    });
  });

  setActive(0, { force: true });

  prevBtn?.addEventListener("click", () => goTo(activeIndex - 1));
  nextBtn?.addEventListener("click", () => goTo(activeIndex + 1));
  tapNext?.addEventListener("click", (e) => {
    if (isGallerySpread() || e.target.closest("[data-before-after]")) return;
    goTo(activeIndex + 1);
  });
  tapPrev?.addEventListener("click", (e) => {
    if (isGallerySpread() || e.target.closest("[data-before-after]")) return;
    goTo(activeIndex - 1);
  });

  document.addEventListener("keydown", (e) => {
    if (galleryOpen() || lightboxOpen()) return;
    /* On the gallery spread, let arrow keys scroll the page naturally */
    if (isGallerySpread()) return;

    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + 1);
    }
    if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndex - 1);
    }
  });

  initPhotoFraming();
  initGalleryThumbFallback();
  initMagazineGallery();
}

function ensurePhotoVisible(img) {
  if (!img) return;
  img.classList.add("is-ready");
  if (img.complete && img.naturalWidth) {
    img.classList.add("is-loaded");
  } else {
    img.addEventListener(
      "load",
      () => img.classList.add("is-loaded"),
      { once: true }
    );
    img.addEventListener(
      "error",
      () => img.classList.add("is-error"),
      { once: true }
    );
  }
}

function initGalleryThumbFallback() {
  document.querySelectorAll(".magazine-gallery-thumb").forEach((btn) => {
    const img = btn.querySelector("img");
    const full = btn.dataset.gallerySrc;
    if (!img || !full) return;

    img.addEventListener(
      "error",
      () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "1";
        img.src = full;
      },
      { once: true }
    );
  });
}

function initPhotoFraming() {
  const images = document.querySelectorAll(".magazine-photo-main");

  function apply(img) {
    const frame = img.closest(".magazine-art-frame");
    if (!frame || !img.naturalWidth) return;

    const focal = img.dataset.focal;
    const ar = img.naturalWidth / img.naturalHeight;
    frame.classList.remove("is-landscape", "is-wide-portrait");

    if (ar > 1.05) frame.classList.add("is-landscape");
    else if (ar < 0.68) frame.classList.add("is-wide-portrait");

    const position =
      focal || (ar > 1.05 ? "center center" : ar < 0.68 ? "center 32%" : "center 38%");
    img.style.objectPosition = position;
  }

  images.forEach((img) => {
    ensurePhotoVisible(img);
    if (img.complete) apply(img);
    else {
      img.addEventListener(
        "load",
        () => {
          apply(img);
          img.classList.add("is-loaded");
        },
        { once: true }
      );
    }
  });
}

function initMagazineGallery() {
  const lightbox = document.getElementById("magazine-lightbox");
  const lightboxImg = document.getElementById("magazine-lightbox-img");
  const lightboxCaption = document.getElementById("magazine-lightbox-caption");
  const lightboxMeta = document.getElementById("magazine-lightbox-meta");
  const lightboxClose = document.getElementById("magazine-lightbox-close");
  const lightboxPrev = document.getElementById("magazine-lightbox-prev");
  const lightboxNext = document.getElementById("magazine-lightbox-next");

  const triggers = [...document.querySelectorAll(".magazine-gallery-thumb[data-gallery-src]")];
  if (!triggers.length) return;

  const sources = [];
  const srcIndex = new Map();
  triggers.forEach((el) => {
    const src = el.dataset.gallerySrc || "";
    if (!src || srcIndex.has(src)) return;
    const img = el.querySelector("img");
    srcIndex.set(src, sources.length);
    sources.push({ src, alt: img?.alt || "" });
  });

  let lightboxIndex = 0;

  function renderLightbox(i) {
    if (!lightboxImg) return;
    lightboxIndex = (i + sources.length) % sources.length;
    const item = sources[lightboxIndex];

    lightboxImg.style.opacity = "0";
    lightboxImg.style.transform = "scale(.98)";

    const show = () => {
      requestAnimationFrame(() => {
        lightboxImg.style.opacity = "1";
        lightboxImg.style.transform = "scale(1)";
      });
    };

    const onReady = () => {
      lightboxImg.onload = null;
      lightboxImg.onerror = null;
      show();
    };

    lightboxImg.onload = onReady;
    lightboxImg.onerror = onReady;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;

    if (lightboxImg.complete) onReady();

    if (lightboxCaption) {
      const plain = item.alt.replace(/^[^—]+—\s*/, "").trim();
      lightboxCaption.textContent = plain || item.alt;
    }
    if (lightboxMeta) {
      lightboxMeta.textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(sources.length).padStart(2, "0")}`;
    }
  }

  function openLightbox(i) {
    if (!lightbox) return;
    renderLightbox(i);
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.style.opacity = "";
      lightboxImg.style.transform = "";
    }
  }

  triggers.forEach((el) => {
    el.addEventListener("click", () => {
      const src = el.dataset.gallerySrc;
      if (!src) return;
      openLightbox(srcIndex.get(src) ?? 0);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => renderLightbox(lightboxIndex - 1));
  lightboxNext?.addEventListener("click", () => renderLightbox(lightboxIndex + 1));

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") renderLightbox(lightboxIndex - 1);
    if (e.key === "ArrowRight") renderLightbox(lightboxIndex + 1);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMagazine);
} else {
  initMagazine();
}
