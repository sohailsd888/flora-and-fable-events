/* ==========================================================================
   AURA & VOW — Couples Client Portal & Dashboard Controller
   Interactive checklist, vendor management, budget, and demo payments
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const safeStorage = (() => {
    try {
      const s = window.localStorage;
      s.setItem('__test', '1');
      s.removeItem('__test');
      return s;
    } catch {
      const mem = {};
      return {
        getItem: (k) => mem[k] || null,
        setItem: (k, v) => { mem[k] = String(v); },
        removeItem: (k) => { delete mem[k]; }
      };
    }
  })();

  // 1. Tab Navigation
  function selectTab(tabId, updateHash = true) {
    const targetView = $(`#view-${tabId}`);
    if (!targetView) return;

    $$('.portal-view').forEach((view) => view.classList.toggle('active', view === targetView));
    $$('.portal-link').forEach((link) => link.classList.toggle('active', link.dataset.tab === tabId));

    const linkEl = $(`.portal-link[data-tab="${tabId}"]`);
    const breadcrumb = $('#tabBreadcrumb');
    if (breadcrumb && linkEl) {
      breadcrumb.textContent = linkEl.textContent.trim().replace(/^[\s\S]*?\s{2,}/, '').trim();
    }

    if (updateHash) {
      history.replaceState(null, '', '#' + tabId);
    }

    $('.portal-sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $$('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });

  // Mobile sidebar toggle
  $('#mobilePortalMenu')?.addEventListener('click', () => {
    $('.portal-sidebar')?.classList.toggle('open');
  });

  // 2. Interactive Checklist with LocalStorage
  const defaultChecked = [0, 1, 2, 4, 7];
  let savedChecks = [];
  try {
    const parsed = JSON.parse(safeStorage.getItem('aura-checklist'));
    savedChecks = Array.isArray(parsed) ? parsed : defaultChecked;
  } catch {
    savedChecks = defaultChecked;
  }

  const checkboxes = $$('.checklist-row input[type="checkbox"]');
  function updateChecklistProgress() {
    let completed = 0;
    checkboxes.forEach((cb, idx) => {
      const isChecked = savedChecks.includes(idx);
      cb.checked = isChecked;
      cb.closest('.checklist-row')?.classList.toggle('checked', isChecked);
      if (isChecked) completed++;
    });

    const total = checkboxes.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;

    const bar = $('#checklistProgressBar');
    if (bar) bar.style.width = `${pct}%`;
    const label = $('#checklistProgressLabel');
    if (label) label.textContent = `${completed} of ${total} Milestones Complete (${pct}%)`;
    const statVal = $('#metricChecklistVal');
    if (statVal) statVal.textContent = `${pct}%`;
  }

  checkboxes.forEach((cb, idx) => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!savedChecks.includes(idx)) savedChecks.push(idx);
      } else {
        savedChecks = savedChecks.filter((i) => i !== idx);
      }
      safeStorage.setItem('aura-checklist', JSON.stringify(savedChecks));
      updateChecklistProgress();
      if (window.toast) window.toast('Planning checklist updated & saved.');
    });
  });

  updateChecklistProgress();

  // 3. Demo Payment Simulation
  const isPaid = safeStorage.getItem('aura-demo-deposit-paid') === 'yes';
  function updatePaymentUI() {
    const depositStatus = $('#depositStatus');
    const depositBtn = $('#demoPayDepositBtn');
    if (depositStatus && isPaid) {
      depositStatus.textContent = 'Paid (Demo)';
      depositStatus.className = 'payment-status-pill paid';
    }
    if (depositBtn && isPaid) {
      depositBtn.textContent = 'Deposit Paid ✓';
      depositBtn.disabled = true;
      depositBtn.style.opacity = '0.6';
    }
  }

  updatePaymentUI();

  $('#demoPayDepositBtn')?.addEventListener('click', () => {
    safeStorage.setItem('aura-demo-deposit-paid', 'yes');
    if (window.toast) window.toast('Deposit payment simulated successfully! Receipt recorded.');
    setTimeout(() => location.reload(), 1200);
  });

  // 4. Download Statement
  $('#downloadStatementBtn')?.addEventListener('click', () => {
    const content = [
      '==============================================================',
      '     FLORA & FABLE EVENTS — LUXURY WEDDINGS & CELEBRATIONS STATEMENT        ',
      '==============================================================',
      'Couple: Aarav & Ananya (Hindu Vivah) / Zayd & Fatima (Muslim Nikah)',
      'Destination: Udaipur City Palace & Lake Como Estates',
      'Wedding Date: September 18, 2027',
      'Principal Atelier Director: Flora & Fable Senior Concierge',
      '--------------------------------------------------------------',
      'TOTAL COMMITTED INVESTMENT: $185,000 USD',
      'TOTAL PAID TO DATE:        $115,000 USD',
      'REMAINING INSTALLMENT:     $70,000 USD (Due 30 Days Prior)',
      '--------------------------------------------------------------',
      'CONFIRMED VENDORS:',
      '1. Venue: Villa Balbiano (Exclusive 3-Day Buyout)',
      '2. Floral Architecture: Maison des Fleurs Haute Floral',
      '3. Gastronomy: Chef Massimo Ferrari 3-Star Michelin Tasting',
      '4. Cinema & Photo: Vogue Weddings Master Editorial Team',
      '5. Music: Milan Symphony Strings & Acoustic Jazz Serenade',
      '==============================================================',
      'Generated from your Flora & Fable Luxury Couples Suite.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Flora-and-Fable-Wedding-Statement.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (window.toast) window.toast('Wedding statement downloaded successfully.');
  });

  // Read URL Hash on load
  const currentHash = location.hash.replace('#', '');
  if (currentHash && $(`#view-${currentHash}`)) {
    selectTab(currentHash, false);
  }

  // 5. Couple Profile Dropdown & Sign Out Flow
  const userDropdown = $('#userDropdown');
  const userMenuToggle = $('#userMenuToggle');

  function setUserMenuOpen(isOpen) {
    if (!userDropdown || !userMenuToggle) return;
    userDropdown.classList.toggle('open', isOpen);
    userMenuToggle.setAttribute('aria-expanded', String(isOpen));
  }

  userMenuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextState = !userDropdown.classList.contains('open');
    setUserMenuOpen(nextState);
  });

  document.addEventListener('click', (e) => {
    if (userDropdown?.classList.contains('open') && !userDropdown.contains(e.target)) {
      setUserMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && userDropdown?.classList.contains('open')) {
      setUserMenuOpen(false);
      userMenuToggle?.focus();
    }
  });

  // Close dropdown when selecting a tab from inside the menu
  $$('#userDropdownMenu [data-tab]').forEach((item) => {
    item.addEventListener('click', () => setUserMenuOpen(false));
  });

  // Download statement from dropdown
  $$('[data-action="download-statement"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setUserMenuOpen(false);
      $('#downloadStatementBtn')?.click();
    });
  });

  // Sign Out action (from dropdown or sidebar)
  function handleSignOut() {
    setUserMenuOpen(false);
    safeStorage.removeItem('celestia-signed-in'); safeStorage.removeItem('ff-signed-in');
    if (window.toast) {
      window.toast('Signed out of Couples Suite. Redirecting to login...');
    }
    setTimeout(() => {
      window.location.href = 'login.html?signedout=1';
    }, 850);
  }

  $$('[data-action="signout"]').forEach((btn) => {
    btn.addEventListener('click', handleSignOut);
  });

})();
