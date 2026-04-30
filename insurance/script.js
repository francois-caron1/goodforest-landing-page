/**
 * Goodforest — Landing Page
 * Scroll-triggered fade-in with staggered siblings
 */

// ─── Challenge row scroll-highlight ──────────────────────────────────────────
(function () {
  'use strict';
  const rows = document.querySelectorAll('.challenge-row');
  if (!rows.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Row entered the trigger zone — activate
          entry.target.classList.add('is-highlighted');
        } else if (entry.boundingClientRect.top > 0) {
          // Row exited below viewport bottom (user scrolled back up) — de-activate
          entry.target.classList.remove('is-highlighted');
        }
        // top < 0: row exited past the top — stay highlighted
      });
    },
    { threshold: 0, rootMargin: '0px 0px -30% 0px' }
  );

  rows.forEach((row) => observer.observe(row));
})();

// ─── Nav scroll state ─────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 60);
});

(function () {
  'use strict';

  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  // Apply stagger delay to siblings within the same parent grid/container
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
    {
      threshold: 0.1,
      rootMargin: '0px 0px -48px 0px',
    }
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

// ─── Contact modal ────────────────────────────────────────────────────────────
(function () {
  'use strict';

  const overlay = document.getElementById('contactModal');
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('modalSuccess');
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
    // Reset form state for next open
    if (form) form.style.display = '';
    if (success) success.hidden = true;
    if (form) form.reset();
  }

  // Trigger buttons
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close button
  closeBtn && closeBtn.addEventListener('click', closeModal);

  // Click outside card
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  // Form submit via Formspree AJAX
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
        submitBtn.textContent = 'Send — we\'ll get back to you within 24h';
        alert('Something went wrong. Please try again or email us at contact@goodforest.fr');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send — we\'ll get back to you within 24h';
      alert('Network error. Please try again or email us at contact@goodforest.fr');
    }
  });
})();

// ─── Order modal (Get started / Get a heatmap) ────────────────────────────────
initModal(
  'orderModal',
  'orderForm',
  'orderSuccess',
  'data-modal-order',
  'Submit my order request'
);
