/**
 * Goodforest — Landing Page
 * Scroll-triggered fade-in with staggered siblings
 */

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
