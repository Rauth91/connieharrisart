function initBeforeAfter() {
  document.querySelectorAll("[data-before-after]").forEach((root) => {
    if (root.dataset.baReady) return;
    root.dataset.baReady = "1";

    const range = root.querySelector(".before-after__range");
    const stage = root.querySelector(".before-after__stage");
    const beforeLayer = root.querySelector(".before-after__before-layer");
    if (!range || !stage || !beforeLayer) return;

    const setPosition = (pct) => {
      const value = Math.max(0, Math.min(100, pct));
      range.value = String(value);
      stage.style.setProperty("--ba-position", `${value}%`);
      beforeLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    };

    setPosition(Number(range.value) || 50);

    range.addEventListener("input", () => setPosition(Number(range.value)));
    range.addEventListener("change", () => setPosition(Number(range.value)));

    let dragging = false;

    const positionFromClientX = (clientX) => {
      const rect = stage.getBoundingClientRect();
      if (!rect.width) return;
      setPosition(((clientX - rect.left) / rect.width) * 100);
    };

    const stopDragging = () => {
      dragging = false;
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      root.setPointerCapture?.(e.pointerId);
      positionFromClientX(e.clientX);
      e.preventDefault();
      e.stopPropagation();
    };

    const onPointerMove = (e) => {
      if (!dragging) return;
      positionFromClientX(e.clientX);
      e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!dragging) return;
      stopDragging();
      root.releasePointerCapture?.(e.pointerId);
    };

    stage.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);

    root.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
      },
      true
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBeforeAfter);
} else {
  initBeforeAfter();
}
