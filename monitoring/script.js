/**
 * Goodforest — Monitoring Landing Page
 * Fade-in scroll animations · Two contact modals · Price simulator
 */

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
initModal('analysisModal', 'analysisForm', 'analysisSuccess', 'data-modal-analysis', 'Start my free analysis');

// ─── Price simulator ──────────────────────────────────────────────────────────
(function () {
  'use strict';

  const input  = document.getElementById('sim-area');
  const result = document.getElementById('sim-result');
  if (!input || !result) return;

  function compute() {
    const ha = parseInt(input.value, 10);

    if (!ha || ha < 1) {
      result.textContent = '';
      result.className = 'sim-result';
      return;
    }

    if (ha < 1000) {
      result.textContent = 'Minimum area: 1,000 ha';
      result.className = 'sim-result sim-result--warn';
      return;
    }

    let rate;
    if (ha < 3000)       rate = 2.49;
    else if (ha < 10000) rate = 2.16;
    else                 rate = 1.99;

    const cost = Math.round(ha * rate);
    result.textContent = 'Estimated cost: €' + cost.toLocaleString('en') + ' / year';
    result.className = 'sim-result sim-result--ok';
  }

  input.addEventListener('input', compute);
})();
