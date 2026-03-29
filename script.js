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
