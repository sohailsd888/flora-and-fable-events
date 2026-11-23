/* ==========================================================================
   AURA & VOW — Main Application Controller
   Theme Toggle (Dark/Light), RTL Toggle, Navigation, Calculator & Interactions
   ========================================================================== */

(() => {
  "use strict";

  // Storage fallback for restricted/sandboxed browser environments
  const storageFallback = () => {
    const memory = {};
    return {
      getItem: (key) => Object.hasOwn(memory, key) ? memory[key] : null,
      setItem: (key, val) => { memory[key] = String(val); },
      removeItem: (key) => { delete memory[key]; }
    };
  };

  const safeStorage = (() => {
    try {
      const s = window.localStorage;
      const testKey = '__aura_storage_test__';
      s.setItem(testKey, '1');
      s.removeItem(testKey);
      return s;
    } catch {
      return storageFallback();
    }
  })();

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const body = document.body;

  // Toast System
  let activeToastTimer = null;
  window.toast = function(message) {
    let t = $('#toast');
    if (!t) return;
    clearTimeout(activeToastTimer);
    t.textContent = message;
    t.classList.add('show');
    activeToastTimer = setTimeout(() => t.classList.remove('show'), 3800);
  };

  // 1. Theme Management (Dark Mode + Light Mode)
  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  };

  const savedTheme = safeStorage.getItem('aura-theme') || 'light';
  applyTheme(savedTheme);

  function syncThemeToggle() {
    const btn = $('#themeToggle');
    if (!btn) return;
    const isDark = document.body.classList.contains('dark');
    btn.textContent = isDark ? '☀' : '◐';
    btn.setAttribute('aria-label', isDark ? 'Toggle light theme' : 'Toggle dark theme');
    btn.title = isDark ? 'Toggle light mode' : 'Toggle dark mode';
  }

  syncThemeToggle();

  $('#themeToggle')?.addEventListener('click', () => {
    const isCurrentlyDark = document.body.classList.contains('dark');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    applyTheme(newTheme);
    safeStorage.setItem('aura-theme', newTheme);
    syncThemeToggle();
    toast(newTheme === 'dark' ? 'Royal Midnight theme activated' : 'Porcelain Silk theme activated');
  });

  // 2. RTL Management
  const savedRtl = safeStorage.getItem('aura-rtl') === 'true';
  if (savedRtl) body.setAttribute('dir', 'rtl');

  function syncRtlToggle() {
    const btn = $('#rtlToggle');
    if (!btn) return;
    const isRtl = body.getAttribute('dir') === 'rtl';
    btn.textContent = isRtl ? 'LTR' : 'RTL';
    btn.setAttribute('aria-label', isRtl ? 'Switch to left-to-right' : 'Switch to right-to-left');
    btn.title = isRtl ? 'Switch to LTR' : 'Switch to RTL layout';
  }

  syncRtlToggle();

  $('#rtlToggle')?.addEventListener('click', () => {
    const isRtl = body.getAttribute('dir') !== 'rtl';
    body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    safeStorage.setItem('aura-rtl', String(isRtl));
    syncRtlToggle();
    toast(isRtl ? 'RTL layout applied' : 'LTR layout applied');
  });

  // 3. Mobile Navigation & Dropdown (Vybeora behavior)
  const menuToggle = $('#menuToggle');
  const nav = $('.nav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  const dropdown = $('.dropdown');
  $('.nav-home')?.addEventListener('click', (e) => {
    if (window.matchMedia('(max-width: 1080px)').matches) {
      e.preventDefault();
      dropdown?.classList.toggle('dropdown-open');
    }
  });

  // 4. Header Shadow on Scroll
  const header = $('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 5. Scroll Reveal — Ensure all content is immediately visible
  $$('.reveal').forEach((el) => el.classList.add('visible'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 100px 0px' });

    $$('.reveal').forEach((el) => observer.observe(el));
  }

  // 6. Dynamic Radial Spotlight Coordinates on Cards
  $$('.feature-card, .tile, .quote-card, .split-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(0);
      const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(0);
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  // 7. Interactive Wedding Planning Budget & Logistics Calculator
  const guestSlider = $('#calcGuests');
  const guestValDisplay = $('#calcGuestsVal');
  const tierPills = $$('.calc-pill');
  const totalDisplay = $('#calcTotalVal');
  const cateringDisplay = $('#calcCateringVal');
  const decorDisplay = $('#calcDecorVal');
  const photoDisplay = $('#calcPhotoVal');
  const conciergeDisplay = $('#calcConciergeVal');

  let currentTier = 'grand'; // 'intimate', 'grand', 'royal'

  const tierRates = {
    intimate: { perGuest: 380, base: 35000, cateringPct: 0.38, decorPct: 0.32, photoPct: 0.16, conciergePct: 0.14 },
    grand:    { perGuest: 560, base: 65000, cateringPct: 0.35, decorPct: 0.35, photoPct: 0.15, conciergePct: 0.15 },
    royal:    { perGuest: 880, base: 120000, cateringPct: 0.34, decorPct: 0.38, photoPct: 0.15, conciergePct: 0.13 }
  };

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  }

  function recalculateBudget() {
    if (!guestSlider || !totalDisplay) return;
    const guests = parseInt(guestSlider.value, 10);
    if (guestValDisplay) guestValDisplay.textContent = `${guests} Guests`;

    const config = tierRates[currentTier];
    const total = config.base + (guests * config.perGuest);

    const catering = total * config.cateringPct;
    const decor = total * config.decorPct;
    const photo = total * config.photoPct;
    const concierge = total * config.conciergePct;

    totalDisplay.textContent = formatCurrency(total);
    if (cateringDisplay) cateringDisplay.textContent = formatCurrency(catering);
    if (decorDisplay) decorDisplay.textContent = formatCurrency(decor);
    if (photoDisplay) photoDisplay.textContent = formatCurrency(photo);
    if (conciergeDisplay) conciergeDisplay.textContent = formatCurrency(concierge);
  }

  guestSlider?.addEventListener('input', recalculateBudget);

  tierPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      tierPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentTier = pill.dataset.tier || 'grand';
      recalculateBudget();
    });
  });

  recalculateBudget();

  // 8. VIP Newsletter & Consultation Form Handlers
  $('#newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail')?.value.trim();
    if (email) {
      safeStorage.setItem('aura-newsletter', email);
      toast('Private lookbook and seasonal trends reserved for your inbox.');
      e.target.reset();
    }
  });

  $('#consultationForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toast('Consultation request received! Our bridal concierge will contact you within 24 hours.');
    e.target.reset();
  });

})();
