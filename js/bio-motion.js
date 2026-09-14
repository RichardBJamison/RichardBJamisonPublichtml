(() => {
  const mqDesktop = window.matchMedia('(min-width: 1025px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const cards = [...document.querySelectorAll('.expertise-card')];
  const grid = document.querySelector('.expertise-grid');
  const items = [...document.querySelectorAll('.timeline-item')];

  const FLIP = [
    [0.30, 0.40],
    [0.40, 0.50],
    [0.50, 0.60],
    [0.40, 0.50],
    [0.50, 0.60],
    [0.60, 0.70]
  ];

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const smooth = (t) => {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const easeOut = (t) => {
    t = clamp(t, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  };
  const span = (p, a, b) => smooth((p - a) / Math.max(0.0001, b - a));
  const spanSlow = (p, a, b) => easeOut((p - a) / Math.max(0.0001, b - a));
  const viewPct = (el) => 1 - (el.getBoundingClientRect().top / window.innerHeight);

  function setFlip(card, deg) {
    card.style.setProperty('--rx', `${deg}deg`);
    const crossed = deg >= 90;
    const front = card.querySelector('.expertise-face-front');
    const back = card.querySelector('.expertise-face-back');
    if (front) front.setAttribute('aria-hidden', crossed ? 'true' : 'false');
    if (back) back.setAttribute('aria-hidden', crossed ? 'false' : 'true');
  }

  function rest() {
    cards.forEach((card) => setFlip(card, 180));
    items.forEach((item) => {
      item.style.setProperty('--dot', '1');
      item.querySelectorAll('.timeline-visual, .timeline-content').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
  }

  function tick() {
    if (mqReduce.matches || !mqDesktop.matches) {
      rest();
      return;
    }

    if (grid && cards.length) {
      const p = viewPct(grid);
      cards.forEach((card, i) => {
        const [a, b] = FLIP[i] || [0.2, 0.5];
        setFlip(card, span(p, a, b) * 180);
      });
    }

    items.forEach((item, i) => {
      const p = viewPct(item);
      const visT = spanSlow(p, 0.22, 0.58);
      const conT = spanSlow(p, 0.42, 0.82);
      const odd = i % 2 === 0;
      const visFrom = odd ? 14 : -14;
      const conFrom = odd ? -14 : 14;
      const vis = item.querySelector('.timeline-visual');
      const con = item.querySelector('.timeline-content');
      if (vis) {
        vis.style.opacity = String(visT);
        vis.style.transform = `translate3d(${(1 - visT) * visFrom}vw, 0, 0)`;
      }
      if (con) {
        con.style.opacity = String(conT);
        con.style.transform = `translate3d(${(1 - conT) * conFrom}vw, 0, 0)`;
      }
      item.style.setProperty('--dot', String(Math.max(visT, conT)));
    });
  }

  let raf = 0;
  const requestTick = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      tick();
    });
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  window.addEventListener('hashchange', requestTick);
  window.addEventListener('load', requestTick);
  mqDesktop.addEventListener('change', requestTick);
  mqReduce.addEventListener('change', requestTick);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(requestTick, {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    });
    if (grid) io.observe(grid);
    items.forEach((el) => io.observe(el));
  }
  requestAnimationFrame(requestTick);
  setTimeout(requestTick, 80);
  tick();
})();
