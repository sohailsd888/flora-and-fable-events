/* ==========================================================================
   CELESTIA — Rich Micro-Interactions & Motion Effects Controller
   (Cursor Aura, Magnetic Buttons, Masked Heading Reveals, Curtain Wipes,
    Champagne Click Ripples, and Circular SVG Scroll-to-Top Ring)
   ========================================================================== */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 1. Floating Circular SVG Scroll-to-Top Progress Ring
  const topBtn = document.createElement("button");
  topBtn.className = "back-to-top-ring";
  topBtn.type = "button";
  topBtn.setAttribute("aria-label", "Back to top");
  topBtn.innerHTML = `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle class="ring-track" cx="24" cy="24" r="22"></circle>
      <circle class="ring-fill" cx="24" cy="24" r="22"></circle>
    </svg>
    <span>&uarr;</span>
  `;
  document.body.appendChild(topBtn);

  const ringFill = topBtn.querySelector(".ring-fill");
  const circumference = 2 * Math.PI * 22;

  function syncTopRing() {
    const scrollTop = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(1, scrollTop / maxScroll);
    ringFill.style.strokeDashoffset = (circumference * (1 - pct)).toFixed(2);
    topBtn.classList.toggle("show", scrollTop > 320);
  }
  window.addEventListener("scroll", syncTopRing, { passive: true });
  syncTopRing();

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // 2. Champagne Ripple Click Wave on Buttons & Filter Pills
  document.querySelectorAll(".btn, .calc-pill, .loginbtn").forEach((el) => {
    el.classList.add("ripple-host");
    el.addEventListener("pointerdown", (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${e.clientX - rect.left - size / 2}px`;
      wave.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove());
    });
  });

  if (reduceMotion) return;

  // 3. Subtle Magnetic Pull on Primary Buttons (Clean native cursor, no trailing circles)
  if (finePointer) {
    // Magnetic button pull
    document.querySelectorAll(".btn-primary, .btn-emerald, .loginbtn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.14;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // 4. Smooth Heading Enhancements (Non-destructive)
  // Headings and editorial figures are preserved natively so content is always 100% visible
})();
