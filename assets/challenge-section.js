/**
 * Goodforest — shared "Challenge" section component
 *
 * Two-column scrollytelling block: a compact list of pain points on the
 * left, a sticky timeline on the right that fills in progressively
 * (checklist-style) as the user scrolls past each point.
 *
 * Usage (see monitoring/index.html or insurance-storm/index.html):
 *
 *   <div id="challenge-section"></div>
 *   <script src="../assets/challenge-section.js"></script>
 *   <script>
 *     renderChallengeSection(document.getElementById('challenge-section'), {
 *       points: [
 *         {
 *           icon: '<svg ...>...</svg>',
 *           title: 'Point title',
 *           text: 'Descriptive paragraph.',
 *           conclusion: 'Bold one-line takeaway.',
 *           maxStage: 2, // colors timeline stages 1..2 once this point is reached
 *         },
 *         // ...
 *       ],
 *       timeline: [
 *         { time: 'D+0', label: 'Storm hits', stage: 'yellow' },
 *         // stage is one of: yellow, amber, orange, orange-red, red, red-dark
 *       ],
 *     });
 *   </script>
 *
 * Requires assets/challenge-section.css to be linked on the page, and must
 * run after the target container exists in the DOM (place the script after
 * the container, or after the container is available).
 */
(function (global) {
  'use strict';

  function renderChallengeSection(container, config) {
    if (!container || !config) return;

    const split = document.createElement('div');
    split.className = 'problem-split';

    split.appendChild(buildChallengeList(config.points || []));
    split.appendChild(buildTimeline(config.timeline || []));

    container.appendChild(split);

    initScrollSync(split);
  }

  function buildChallengeList(points) {
    const list = document.createElement('div');
    list.className = 'challenge-list';

    points.forEach((point) => {
      const el = document.createElement('div');
      el.className = 'challenge-point fade-in';
      el.dataset.maxStage = point.maxStage;
      el.innerHTML =
        '<div class="challenge-point__icon-wrap">' + point.icon + '</div>' +
        '<div class="challenge-point__content">' +
          '<h3 class="challenge-point__title">' + point.title + '</h3>' +
          '<p class="challenge-point__text">' + point.text + '</p>' +
          '<p class="challenge-point__text challenge-point__text--strong">' + point.conclusion + '</p>' +
        '</div>';
      list.appendChild(el);
    });

    return list;
  }

  function buildTimeline(steps) {
    const wrap = document.createElement('div');
    wrap.className = 'problem-timeline';

    const card = document.createElement('div');
    card.className = 'timeline-card fade-in';

    const items = document.createElement('div');
    items.className = 'timeline-items';

    steps.forEach((step, i) => {
      const item = document.createElement('div');
      item.className = 'timeline-item timeline-item--' + step.stage;
      item.dataset.stage = i + 1;
      item.innerHTML =
        '<span class="timeline-item__time">' + step.time + '</span>' +
        '<div class="timeline-item__line"></div>' +
        '<span class="timeline-item__label">' + step.label + '</span>';
      items.appendChild(item);
    });

    card.appendChild(items);
    wrap.appendChild(card);
    return wrap;
  }

  function initScrollSync(split) {
    const points = split.querySelectorAll('.challenge-point');
    const timelineItems = split.querySelectorAll('.timeline-item');
    if (!points.length) return;

    // A point becomes active while it crosses a band centered on the
    // viewport - narrow enough that two neighbors can't both sit in it at
    // once - and drives the left column's "currently focused" styling.
    const focusObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-active', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-44% 0px -44% 0px' }
    );
    points.forEach((point) => focusObserver.observe(point));

    if (!timelineItems.length) return;

    function syncTimeline() {
      let maxStage = 0;
      points.forEach((point) => {
        if (!point.classList.contains('is-reached')) return;
        maxStage = Math.max(maxStage, parseInt(point.dataset.maxStage, 10) || 0);
      });
      timelineItems.forEach((item) => {
        const stage = parseInt(item.dataset.stage, 10);
        item.classList.toggle('is-reached', stage <= maxStage);
      });
    }

    // A point is "reached" once it scrolls above the vertical center of the
    // viewport, and stays reached - like a checklist - until the user
    // scrolls back up past it. Points are checked independently, but since
    // they're stacked top to bottom, reaching point N always implies points
    // 1..N-1 were already reached, so the accumulation falls out naturally.
    const reachObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-reached');
          } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove('is-reached');
          }
        });
        syncTimeline();
      },
      { threshold: 0, rootMargin: '0px 0px -50% 0px' }
    );
    points.forEach((point) => reachObserver.observe(point));
  }

  global.renderChallengeSection = renderChallengeSection;
})(window);
