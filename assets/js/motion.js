/* ==========================================================================
   CELESTIA — Cinema Motion, Floating Rose Petals, Bokeh & Lightbox Engine
   ========================================================================== */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 1. Reading Scroll Progress Bar
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);

  function updateScrollProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
    progressBar.style.width = `${pct.toFixed(1)}%`;
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  // 2. Staggered Grid Reveal Delays
  document.querySelectorAll(".cards-grid, .cards-grid-2, .tiles-grid, .tiles-grid-3, .split-cards-grid, .moodboard-grid").forEach((grid) => {
    [...grid.children].forEach((child, idx) => {
      if (child.classList.contains("reveal")) {
        child.style.setProperty("--stagger", `${(idx % 6) * 85}ms`);
      }
    });
  });

  // 3. Full-Screen Gallery Lightbox Modal (for .moodboard-item)
  const galleryItems = [...document.querySelectorAll(".moodboard-item")];
  if (galleryItems.length) {
    const modal = document.createElement("div");
    modal.className = "lightbox-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox" type="button">&times;</button>
      <button class="lightbox-prev" aria-label="Previous image" type="button">&larr;</button>
      <div class="lightbox-frame">
        <img src="" alt="" />
        <div class="lightbox-caption"></div>
      </div>
      <button class="lightbox-next" aria-label="Next image" type="button">&rarr;</button>
    `;
    document.body.appendChild(modal);

    const lbImg = modal.querySelector("img");
    const lbCap = modal.querySelector(".lightbox-caption");
    let currentIdx = 0;

    function getVisibleItems() {
      return galleryItems.filter((el) => el.style.display !== "none");
    }

    function openLightbox(idx) {
      const list = getVisibleItems();
      if (!list.length) return;
      currentIdx = (idx + list.length) % list.length;
      const item = list[currentIdx];
      const img = item.querySelector("img");
      const title = item.querySelector(".moodboard-title")?.textContent || img?.alt || "";
      const tag = item.querySelector(".moodboard-tag")?.textContent || "";
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = tag ? `${tag} — ${title}` : title;
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const list = getVisibleItems();
        openLightbox(list.indexOf(item));
      });
    });

    modal.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    modal.querySelector(".lightbox-prev").addEventListener("click", () => openLightbox(currentIdx - 1));
    modal.querySelector(".lightbox-next").addEventListener("click", () => openLightbox(currentIdx + 1));
    modal.addEventListener("click", (e) => { if (e.target === modal) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") openLightbox(currentIdx - 1);
      if (e.key === "ArrowRight") openLightbox(currentIdx + 1);
    });
  }

  if (reduceMotion) return;

  // 4. Floating Delicate Rose Petals & Champagne Bokeh Light Canvas
  function initCelebrationCanvas(container) {
    const canvas = document.createElement("canvas");
    canvas.className = "bokeh-canvas";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let visible = true;

    const orbColors = [
      "rgba(239, 225, 198, ", // Champagne
      "rgba(204, 163, 98, ",  // Gold
      "rgba(217, 114, 91, "   // Rose
    ];

    const items = Array.from({ length: 28 }, (_, i) => ({
      isPetal: i % 3 === 0,
      x: Math.random(),
      y: Math.random(),
      r: i % 3 === 0 ? (4 + Math.random() * 4.5) : (2 + Math.random() * 5.5),
      vx: (Math.random() - 0.5) * 0.00028,
      vy: i % 3 === 0 ? (0.00022 + Math.random() * 0.00028) : (-0.00018 - Math.random() * 0.00032),
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.015,
      alpha: 0.16 + Math.random() * 0.34,
      phase: Math.random() * Math.PI * 2,
      color: orbColors[Math.floor(Math.random() * orbColors.length)]
    }));

    function resize() {
      const rect = container.getBoundingClientRect();
      width = canvas.width = Math.max(1, Math.floor(rect.width));
      height = canvas.height = Math.max(1, Math.floor(rect.height));
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      }, { threshold: 0.02 });
      io.observe(container);
    }

    function draw(t) {
      if (visible) {
        ctx.clearRect(0, 0, width, height);
        for (const p of items) {
          p.x += p.vx + Math.sin(t * 0.001 + p.phase) * 0.00012;
          p.y += p.vy;
          p.rot += p.vrot;

          if (p.y < -0.06) { p.y = 1.06; p.x = Math.random(); }
          if (p.y > 1.06) { p.y = -0.06; p.x = Math.random(); }
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;

          const gx = p.x * width;
          const gy = p.y * height;

          if (p.isPetal) {
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(p.rot);
            ctx.fillStyle = `${p.color}${(p.alpha * 0.85).toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r * 1.45, p.r * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            const pulse = 0.72 + 0.28 * Math.sin(t * 0.0018 + p.phase);
            const rad = p.r * (0.9 + 0.2 * pulse);
            const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad * 2.4);
            grad.addColorStop(0, `${p.color}${(p.alpha * pulse).toFixed(3)})`);
            grad.addColorStop(1, `${p.color}0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(gx, gy, rad * 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  document.querySelectorAll(".hero-h1, .hero-gallery, .hero-sd-turnkey, .cta-h1, .cta-about, .cta-services, .cta-contact, .cta-sd-floral, .cta-sd-soirees").forEach(initCelebrationCanvas);

  // 5. Smooth Animated Counters
  const counters = [...document.querySelectorAll(".metric-number, .count-up")];
  if (counters.length && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);

        const raw = el.textContent.trim();
        const match = raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
        if (!match) return;

        const prefix = match[1];
        const target = parseFloat(match[2]);
        const suffix = match[3];
        const decimals = (match[2].split(".")[1] || "").length;
        const duration = 1250;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.textContent = `${prefix}${val.toFixed(decimals)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });

    counters.forEach((c) => countObserver.observe(c));
  }

  // 6. Subtle Scroll Parallax Depth on [data-parallax]
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  if (parallaxEls.length) {
    window.addEventListener("scroll", () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const offset = (rect.top - vh * 0.5) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }, { passive: true });
  }

  // 7. 3D Magnetic Tilt on Cards & Tiles
  if (finePointer) {
    document.querySelectorAll(".feature-card, .tile").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) translateY(-6px) rotateX(${(-py * 4.5).toFixed(2)}deg) rotateY(${(px * 4.5).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
