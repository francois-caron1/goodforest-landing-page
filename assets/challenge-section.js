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
 *       // Optional: one continuous line + a single dot that glides along it
 *       // based on scroll progress, instead of a static dot per stage.
 *       progressCursor: true,
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
    const timeline = buildTimeline(config.timeline || [], config.progressCursor);
    split.appendChild(timeline.wrap);

    container.appendChild(split);

    initScrollSync(split);

    if (config.progressCursor) {
      initProgressCursor(split, split.querySelectorAll('.timeline-item'), timeline.dot);
    }
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

  function buildTimeline(steps, progressCursor) {
    const wrap = document.createElement('div');
    wrap.className = 'problem-timeline';

    const card = document.createElement('div');
    card.className = 'timeline-card fade-in';

    const items = document.createElement('div');
    items.className = 'timeline-items';
    if (progressCursor) items.classList.add('timeline-items--progress-line');

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

    let track = null;
    let dot = null;
    if (progressCursor) {
      track = document.createElement('div');
      track.className = 'timeline-progress-track';
      // Gradient stops mirror each stage's --stage-color, read straight off
      // the elements just built above so it always matches the real colors,
      // however many stages this particular timeline has.
      const stageColors = Array.from(items.querySelectorAll('.timeline-item')).map(
        (item) => getComputedStyle(item).getPropertyValue('--stage-color').trim()
      );
      if (stageColors.length) {
        track.style.background = 'linear-gradient(to bottom, ' + stageColors.join(', ') + ')';
      }
      items.appendChild(track);

      dot = document.createElement('div');
      dot.className = 'timeline-progress-dot';
      items.appendChild(dot);
    }

    card.appendChild(items);
    wrap.appendChild(card);
    return { wrap: wrap, items: items, track: track, dot: dot };
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

  // Moves a single dot continuously along the timeline's line, in sync with
  // scroll position, instead of the label accumulation's discrete per-stage
  // jumps (that logic, in initScrollSync above, is untouched and keeps
  // driving the label text color/weight independently of this).
  function initProgressCursor(split, timelineItems, dotEl) {
    const list = split.querySelector('.challenge-list');
    if (!list || !dotEl) return;

    const stageColors = Array.from(timelineItems).map((item) =>
      getComputedStyle(item).getPropertyValue('--stage-color').trim()
    );

    let ticking = false;

    function update() {
      ticking = false;
      const rect = list.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      // 0 when the list's top edge sits at the viewport's vertical center
      // (matches the "reached" trigger line), 1 when its bottom edge does -
      // i.e. the same span the discrete accumulation sweeps through, just
      // read continuously instead of point by point.
      let progress = rect.height > 0 ? (viewportMid - rect.top) / rect.height : 0;
      progress = Math.max(0, Math.min(1, progress));

      dotEl.style.top = progress * 100 + '%';

      if (stageColors.length) {
        const idx = Math.min(stageColors.length - 1, Math.floor(progress * stageColors.length));
        dotEl.style.background = stageColors[idx];
      }
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    update();
  }

  global.renderChallengeSection = renderChallengeSection;
})(window);
