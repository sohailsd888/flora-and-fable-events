/* ==========================================================================
   CELESTIA — Interactive Multi-Set 3D Photo Stack Controller
   Smoothly cycles across 3 curated wedding photo sets with mouse tilt depth
   ========================================================================== */
(() => {
  "use strict";

  const stacks = document.querySelectorAll(".wedding-stack");
  if (!stacks.length) return;

  stacks.forEach((stack) => {
    const groups = [...stack.querySelectorAll(".wedding-stack-group")];
    const prevBtn = stack.querySelector(".wedding-stack-prev");
    const nextBtn = stack.querySelector(".wedding-stack-next");
    const countDisplay = stack.querySelector(".wedding-stack-count");
    const labelDisplay = stack.querySelector(".wedding-stack-label");

    if (!groups.length) return;

    let currentIndex = 0;

    function updateStack(newIndex) {
      if (newIndex < 0) newIndex = groups.length - 1;
      if (newIndex >= groups.length) newIndex = 0;
      currentIndex = newIndex;

      groups.forEach((g, i) => {
        g.setAttribute("data-active", String(i === currentIndex));
      });

      if (countDisplay) {
        countDisplay.textContent = `0${currentIndex + 1} / 0${groups.length}`;
      }
      if (labelDisplay) {
        labelDisplay.textContent = groups[currentIndex].dataset.label || "";
      }
    }

    prevBtn?.addEventListener("click", () => updateStack(currentIndex - 1));
    nextBtn?.addEventListener("click", () => updateStack(currentIndex + 1));

    // Click any card in stack to cycle if desired on touch
    const cards = stack.querySelectorAll(".wedding-pop-card");
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const rect = card.getBoundingClientRect();
        const ox = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const oy = -(e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.setProperty("--depth-x", `${(oy * 10).toFixed(1)}deg`);
        card.style.setProperty("--depth-y", `${(ox * 10).toFixed(1)}deg`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--depth-x", "0deg");
        card.style.setProperty("--depth-y", "0deg");
      });
    });

    updateStack(0);
  });
})();
