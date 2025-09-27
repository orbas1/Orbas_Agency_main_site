(function () {
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  const tiltParent = document.querySelector('[data-tilt-parent]');
  const tiltCard = document.querySelector('[data-tilt-card]');
  const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounters(entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const container = entry.target;
      const valueEl = container.querySelector('[data-counter-value]');
      const targetValue = parseFloat(valueEl.dataset.counterValue || '0');
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = targetValue < 10 ? (targetValue * eased).toFixed(1) : Math.round(targetValue * eased);
        valueEl.textContent = value;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          valueEl.textContent = targetValue % 1 === 0 ? Math.round(targetValue).toString() : targetValue.toFixed(1);
        }
      }

      requestAnimationFrame(update);
      observer.unobserve(container);
    });
  }

  if (counters.length && !preferReducedMotion) {
    const observer = new IntersectionObserver(animateCounters, {
      rootMargin: '0px 0px -20% 0px',
      threshold: 0.4
    });
    counters.forEach((counter) => observer.observe(counter));
  } else if (counters.length) {
    counters.forEach((counter) => {
      const valueEl = counter.querySelector('[data-counter-value]');
      if (!valueEl) return;
      const targetValue = parseFloat(valueEl.dataset.counterValue || '0');
      valueEl.textContent = targetValue % 1 === 0 ? Math.round(targetValue).toString() : targetValue.toFixed(1);
    });
  }

  if (tiltParent && tiltCard && !preferReducedMotion) {
    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    function updateTilt() {
      const rotateX = targetY * 10;
      const rotateY = targetX * -12;
      tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
      rafId = requestAnimationFrame(updateTilt);
    }

    function handlePointer(event) {
      const rect = tiltParent.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      targetX = Math.max(-0.5, Math.min(0.5, x - 0.5));
      targetY = Math.max(-0.5, Math.min(0.5, y - 0.5));
    }

    function resetTilt() {
      targetX = 0;
      targetY = 0;
    }

    tiltParent.addEventListener('pointermove', handlePointer);
    tiltParent.addEventListener('pointerleave', resetTilt);
    tiltParent.addEventListener('touchmove', (event) => {
      if (!event.touches.length) return;
      handlePointer(event.touches[0]);
    }, { passive: true });
    tiltParent.addEventListener('touchend', resetTilt);

    rafId = requestAnimationFrame(updateTilt);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        tiltCard.style.transform = '';
      } else if (!rafId) {
        rafId = requestAnimationFrame(updateTilt);
      }
    });
  }
})();
