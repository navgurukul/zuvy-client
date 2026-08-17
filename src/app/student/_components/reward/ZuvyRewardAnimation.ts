
import { ZuvyMascot } from './ZuvyMascot';

export interface PlayRewardConfig {
  popupEl: HTMLElement;
  badgeEl: HTMLElement;

  // Optional because feedback modal does not have spark counter
  sparkCountEl?: HTMLElement;

  rows?: NodeListOf<HTMLElement> | HTMLElement[];

  mascotSlotEl: HTMLElement;

  totalSparks: number;
  message?: string;
  onComplete?: () => void;
}

export const mascotInteraction = {
  _mascot: null as ZuvyMascot | null,

  _ensureMascot(slotEl: HTMLElement) {
    if (this._mascot) return this._mascot;

    this._mascot = new ZuvyMascot({
      assetPath: '/assets/mascot',
      container: slotEl,
      autoIdle: true,
    });

    this._mascot.mount();

    return this._mascot;
  },

  enterAndCelebrate(
    slotEl: HTMLElement,
    message?: string,
    onSpoken?: () => void
  ) {
    const mascot = this._ensureMascot(slotEl);

    mascot.show();
    mascot.celebrate();

    setTimeout(() => {
      mascot.talk(message);

      if (onSpoken) {
        onSpoken();
      }
    }, 600);

    return mascot;
  },

  cleanup() {
    if (!this._mascot) return;

    this._mascot.hide();
    this._mascot.destroy();
    this._mascot = null;
  },
};

export const sparkParticleSystem = {
  throwSparks(
    popupEl: HTMLElement,
    originEl: HTMLElement,
    targetEl: HTMLElement,
    onArrive?: () => void
  ) {
    const popupRect = popupEl.getBoundingClientRect();
    const originRect = originEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const start = {
      x:
        originRect.left +
        originRect.width / 2 -
        popupRect.left,

      y:
        originRect.top +
        originRect.height / 2 -
        popupRect.top,
    };

    const end = {
      x:
        targetRect.left +
        targetRect.width / 2 -
        popupRect.left,

      y:
        targetRect.top +
        targetRect.height / 2 -
        popupRect.top,
    };

    const count = 16 + Math.floor(Math.random() * 5);

    let arrivals = 0;
    let firstArrival = true;

    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 170;
      const duration = 650 + Math.random() * 250;

      setTimeout(() => {
        this._animateSpark(
          popupEl,
          start,
          end,
          duration,
          () => {
            arrivals++;

            if (firstArrival) {
              firstArrival = false;

              this._absorb(targetEl);
              this._scatter(popupEl, end);
            }

            if (arrivals === count && onArrive) {
              onArrive();
            }
          }
        );
      }, delay);
    }
  },

  _animateSpark(
    popupEl: HTMLElement,
    start: { x: number; y: number },
    end: { x: number; y: number },
    duration: number,
    onDone: () => void
  ) {
    const spark = document.createElement('span');

    spark.className = 'reward-spark-projectile';

    popupEl.appendChild(spark);

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const bow = (Math.random() - 0.5) * 60;

    const control = {
      x:
        start.x +
        dx * 0.5 +
        dy * 0.15 +
        bow,

      y:
        start.y +
        dy * 0.5 -
        dx * 0.15,
    };

    const t0 = performance.now();

    function tick(now: number) {
      const t = Math.min(
        (now - t0) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - t, 2);

      const mt = 1 - eased;

      const x =
        mt * mt * start.x +
        2 * mt * eased * control.x +
        eased * eased * end.x;

      const y =
        mt * mt * start.y +
        2 * mt * eased * control.y +
        eased * eased * end.y;

      spark.style.transform = `translate(${x}px, ${y}px)`;

      spark.style.opacity =
        t > 0.85
          ? String(1 - (t - 0.85) / 0.15)
          : '1';

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        spark.remove();
        onDone();
      }
    }

    requestAnimationFrame(tick);
  },

  _absorb(targetEl: HTMLElement) {
    const countEl =
      targetEl.querySelector('.reward-spark-count') ||
      targetEl;

    countEl.classList.remove('absorb-pulse');
    targetEl.classList.remove('absorb-glow');

    void targetEl.offsetWidth;

    countEl.classList.add('absorb-pulse');
    targetEl.classList.add('absorb-glow');
  },

  _scatter(
    popupEl: HTMLElement,
    origin: { x: number; y: number }
  ) {
    const count = 9 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      const ember = document.createElement('span');

      ember.className = 'reward-spark-ember';

      const angle =
        Math.random() * Math.PI * 2;

      const distance =
        55 + Math.random() * 65;

      ember.style.setProperty(
        '--px',
        `${Math.cos(angle) * distance}px`
      );

      ember.style.setProperty(
        '--py',
        `${Math.sin(angle) * distance}px`
      );

      ember.style.transform = `translate(${origin.x}px, ${origin.y}px)`;

      popupEl.appendChild(ember);

      ember.addEventListener(
        'animationend',
        () => ember.remove()
      );
    }
  },
};

function _animateSparkCount(
  el: HTMLElement,
  from: number,
  to: number,
  duration: number
) {
  const start = performance.now();

  function tick(now: number) {
    const progress = Math.min(
      (now - start) / duration,
      1
    );

    const eased =
      1 - Math.pow(1 - progress, 3);

    const value = Math.round(
      from + (to - from) * eased
    );

    el.textContent = `+${value}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function _revealRows(
  rows: HTMLElement[],
  onDone: () => void
) {
  if (!rows || rows.length === 0) {
    onDone();
    return;
  }

  rows.forEach((row, i) => {
    setTimeout(() => {
      row.classList.add('visible');

      if (i === rows.length - 1) {
        setTimeout(onDone, 300);
      }
    }, i * 160);
  });
}

export function playRewardAnimation(
  config: PlayRewardConfig
) {
  const {
    popupEl,
    badgeEl,
    sparkCountEl,
    rows = [],
    mascotSlotEl,
    totalSparks,
    message,
    onComplete,
  } = config;

  const rowArray = Array.from(
    rows as HTMLElement[]
  );

  // =========================================================
  // 1. Badge bounce
  // =========================================================

  requestAnimationFrame(() => {
    badgeEl.classList.add('animate');
  });

  // =========================================================
  // 2. Spark counter count-up
  //
  // Only run when sparkCountEl exists.
  // Feedback modal does NOT have spark counter.
  // =========================================================

  if (sparkCountEl) {
    setTimeout(() => {
      _animateSparkCount(
        sparkCountEl,
        0,
        totalSparks,
        1050
      );
    }, 400);
  }

  // =========================================================
  // 3. Breakdown rows reveal
  //    Then mascot enters
  // =========================================================

  setTimeout(() => {
    _revealRows(rowArray, () => {
      mascotInteraction.enterAndCelebrate(
        mascotSlotEl,
        message,
        () => {
          // ===================================================
          // 4. Spark throw
          //
          // Only throw sparks when target exists.
          // Feedback modal has no spark counter.
          // ===================================================

          if (sparkCountEl) {
            sparkParticleSystem.throwSparks(
              popupEl,
              mascotSlotEl,
              sparkCountEl,
              () => {
                if (onComplete) {
                  onComplete();
                }
              }
            );
          } else {
            // Feedback modal
            // No spark animation required.
            if (onComplete) {
              onComplete();
            }
          }
        }
      );
    });
  }, 600);
}

export const ZuvyRewardAnimation = {
  play: playRewardAnimation,
  mascotInteraction,
  sparkParticleSystem,
};