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

  function galleryOpen() {
    return document.body.classList.contains("gallery-open");
  }

  function lightboxOpen() {
    return document.getElementById("magazine-lightbox")?.classList.contains("show");
  }

  function preloadSpreadImages(index) {
    [index - 1, index, index + 1].forEach((i) => {
      const spread = spreads[i];
      if (!spread || spread.classList.contains("magazine-spread--gallery")) return;
      spread.querySelectorAll(".magazine-photo-main[src]").forEach((img) => {
        if (img.complete || !img.src) return;
        const preload = new Image();
        preload.decoding = "async";
        preload.src = img.src;
      });
    });
  }

  function setActive(index) {
    activeIndex = Math.max(0, Math.min(index, total - 1));
    const current = spreads[activeIndex];

    spreads.forEach((s, j) => s.classList.toggle("is-active", j === activeIndex));
    railDots.forEach((dot, j) => dot.classList.toggle("is-active", j === activeIndex));

    if (pageNum) pageNum.textContent = String(activeIndex + 1).padStart(2, "0");
    if (spreadLabel) {
      spreadLabel.textContent = current?.dataset.spreadLabel || "";
    }
    if (progressFill) progressFill.style.height = `${((activeIndex + 1) / total) * 100}%`;
    if (prevBtn) prevBtn.disabled = activeIndex === 0;
    if (nextBtn) nextBtn.disabled = activeIndex === total - 1;

    preloadSpreadImages(activeIndex);
    if (current?.classList.contains("magazine-spread--gallery")) {
      hydrateVisibleGalleryThumbs(current);
    }
  }

  function goTo(index) {
    const target = spreads[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(index);
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (galleryOpen() || lightboxOpen()) return;
      let best = null;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!best || entry.intersectionRatio > best.ratio) {
          best = { el: entry.target, ratio: entry.intersectionRatio };
        }
      });
      if (best) {
        const idx = spreads.indexOf(best.el);
        if (idx >= 0) setActive(idx);
      }
    },
    { root: book, threshold: [0.25, 0.4, 0.55] }
  );

  spreads.forEach((s) => io.observe(s));
  railDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.spreadIndex);
      if (!Number.isNaN(idx)) goTo(idx);
    });
  });

  setActive(0);

  prevBtn?.addEventListener("click", () => goTo(activeIndex - 1));
  nextBtn?.addEventListener("click", () => goTo(activeIndex + 1));
  tapNext?.addEventListener("click", () => goTo(activeIndex + 1));
  tapPrev?.addEventListener("click", () => goTo(activeIndex - 1));

  document.addEventListener("keydown", (e) => {
    if (galleryOpen() || lightboxOpen()) return;
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
  initGalleryThumbLazy();
  initMagazineGallery();
}

function hydrateImg(img) {
  const src = img.dataset.src;
  if (!src || img.src) return;
  img.src = src;
  img.removeAttribute("data-src");
}

function hydrateVisibleGalleryThumbs(spread) {
  spread.querySelectorAll(".magazine-gallery-thumb img[data-src]").forEach((img) => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight + 320 && rect.bottom > -320) hydrateImg(img);
  });
}

function initGalleryThumbLazy() {
  const imgs = [...document.querySelectorAll(".magazine-gallery-thumb img[data-src]")];
  if (!imgs.length) return;

  if (!("IntersectionObserver" in window)) {
    imgs.forEach(hydrateImg);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hydrateImg(entry.target);
        io.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "280px 0px", threshold: 0.01 }
  );

  imgs.forEach((img) => io.observe(img));
}

function initPhotoFraming() {
  const images = document.querySelectorAll(".magazine-photo-main");

  function apply(img) {
    const frame = img.closest(".magazine-art-frame");
    if (!frame || !img.naturalWidth) return;

    const focal = img.dataset.focal;

    const ar = img.naturalWidth / img.naturalHeight;
    frame.classList.remove("is-landscape", "is-wide-portrait");

    if (ar > 1.05) {
      frame.classList.add("is-landscape");
    } else if (ar < 0.68) {
      frame.classList.add("is-wide-portrait");
    }

    const position = focal || (ar > 1.05 ? "center center" : ar < 0.68 ? "center 32%" : "center 38%");
    img.style.objectPosition = position;
  }

  images.forEach((img) => {
    if (img.complete) apply(img);
    else img.addEventListener("load", () => apply(img), { once: true });
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
    const src = el.dataset.gallerySrc || el.querySelector("img")?.src || "";
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
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      requestAnimationFrame(() => {
        lightboxImg.style.opacity = "1";
        lightboxImg.style.transform = "scale(1)";
      });
    };

    if (lightboxImg.src === item.src) show();
    else {
      lightboxImg.onload = () => {
        lightboxImg.onload = null;
        show();
      };
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    }

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
      lightboxImg.src = "";
      lightboxImg.style.opacity = "";
      lightboxImg.style.transform = "";
    }
  }

  triggers.forEach((el) => {
    el.addEventListener("click", () => {
      const src = el.dataset.gallerySrc || el.querySelector("img")?.src;
      const i = srcIndex.get(src) ?? 0;
      openLightbox(i);
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
