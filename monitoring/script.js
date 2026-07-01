/**
 * Goodforest — Monitoring Landing Page
 */

// Challenge section scroll-sync (active point + timeline accumulation) lives
// in assets/challenge-section.js, shared with the insurance-storm page.

// ─── Nav scroll state ─────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ─── Fade-in scroll animations ────────────────────────────────────────────────
(function () {
  'use strict';

  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const parents = new Set(Array.from(fadeEls).map((el) => el.parentElement));
  parents.forEach((parent) => {
    const children = parent.querySelectorAll('.fade-in');
    children.forEach((child, i) => {
      child.style.transitionDelay = i * 0.1 + 's';
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  fadeEls.forEach((el) => observer.observe(el));
})();

// ─── Modal factory ────────────────────────────────────────────────────────────
function initModal(overlayId, formId, successId, triggerAttr, resetLabel) {
  'use strict';

  const overlay  = document.getElementById(overlayId);
  const form     = document.getElementById(formId);
  const success  = document.getElementById(successId);
  const closeBtn = overlay && overlay.querySelector('.modal-close');
  if (!overlay) return;

  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (form) form.style.display = '';
    if (success) success.hidden = true;
    if (form) form.reset();
  }

  document.querySelectorAll('[' + triggerAttr + ']').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn && closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.style.display = 'none';
        success.hidden = false;
        setTimeout(closeModal, 3000);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = resetLabel;
        alert('Something went wrong. Please try again or email us at contact@goodforest.fr');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = resetLabel;
      alert('Network error. Please try again or email us at contact@goodforest.fr');
    }
  });
}

// ─── Modal 1 — Book a demo ────────────────────────────────────────────────────
initModal('demoModal', 'demoForm', 'demoSuccess', 'data-modal-demo', 'Send my request');

// ─── Modal 2 — Free analysis ──────────────────────────────────────────────────
initModal('analysisModal', 'analysisForm', 'analysisSuccess', 'data-modal-analysis', 'Request a callback to get started');

// ─── Price simulator ──────────────────────────────────────────────────────────
(function () {
  'use strict';

  const input   = document.getElementById('simulatorInput');
  const results = document.getElementById('simulatorResults');
  const price   = document.getElementById('priceMonitoring');
  const warn    = document.getElementById('simulatorWarn');
  if (!input) return;

  function getRate(ha) {
    if (ha < 1000)  return 2.99;
    if (ha < 3000)  return 2.49;
    if (ha < 10000) return 2.16;
    return 1.99;
  }

  function calculate() {
    const ha = parseFloat(input.value);

    if (!ha || ha <= 0) {
      results.hidden = true;
      warn.hidden = true;
      return;
    }

    if (ha < 500) {
      results.hidden = true;
      warn.textContent = 'Minimum area: 500 ha';
      warn.hidden = false;
      return;
    }

    warn.hidden = true;
    const cost = Math.round(ha * getRate(ha));
    price.textContent = '€' + cost.toLocaleString('en-GB') + ' / year';
    results.hidden = false;
  }

  let debounceTimer;
  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(calculate, 300);
  });
})();
