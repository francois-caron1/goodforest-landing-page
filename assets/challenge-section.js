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
 *       // Optional: one continuous line + a single dot that snaps to
 *       // whichever stage is currently reached (same accumulation state
 *       // as the label coloring), instead of a static dot per stage.
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

    initScrollSync(split, config.progressCursor ? timeline.dot : null);
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

  function initScrollSync(split, progressDotEl) {
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

    // maxStage is the single source of truth for both the label accumulation
    // below and the progress dot (when present) - the dot is positioned on
    // whichever .timeline-item this same value points to, never computed
    // from a separate scroll-percentage reading, so the two can't drift
    // apart.
    function syncTimeline() {
      let maxStage = 0;
      points.forEach((point) => {
        if (!point.classList.contains('is-reached')) return;
        maxStage = Math.max(maxStage, parseInt(point.dataset.maxStage, 10) || 0);
      });

      let reachedItem = null;
      timelineItems.forEach((item) => {
        const stage = parseInt(item.dataset.stage, 10);
        const isReached = stage <= maxStage;
        item.classList.toggle('is-reached', isReached);
        if (stage === maxStage) reachedItem = item;
      });

      if (progressDotEl) updateProgressDot(progressDotEl, reachedItem);
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

  // Snaps the progress dot onto the timeline row that matches maxStage - the
  // same value that drives which rows are colored - rather than any
  // independent position calculation. CSS handles the glide between two
  // resting positions (see .timeline-progress-dot's transition).
  function updateProgressDot(dotEl, reachedItem) {
    if (!reachedItem) {
      dotEl.style.opacity = '0';
      return;
    }
    dotEl.style.opacity = '1';
    dotEl.style.top = reachedItem.offsetTop + 4 + 'px'; // matches the per-stage dot's own top: 4px
    dotEl.style.background = getComputedStyle(reachedItem).getPropertyValue('--stage-color').trim();
  }

  global.renderChallengeSection = renderChallengeSection;
})(window);
