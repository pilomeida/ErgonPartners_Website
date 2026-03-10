/* ── ERGON PARTNERS — Full-screen section navigation ─────────── */
(function () {
  'use strict';

  const DURATION       = 780;  // ms — must match CSS transition
  const WHEEL_MIN      = 40;   // deltaY threshold to trigger

  function isMobile() { return window.innerWidth <= 768; }

  let sections = [];
  let current  = 0;
  let locked   = false;
  let dots     = [];

  /* ── Position all sections without/with animation ───────────── */
  function place() {
    sections.forEach((s, i) => {
      s.classList.remove('cur', 'above');
      if      (i < current) s.classList.add('above');
      else if (i === current) s.classList.add('cur');
      // sections after current stay at default (translateY 100vh via CSS)
    });
    updateDots();
    updateNavHighlight();
  }

  /* ── Navigate to section n ──────────────────────────────────── */
  function goTo(n) {
    if (locked || n === current || n < 0 || n >= sections.length) return;
    locked  = true;
    current = n;
    place();
    history.replaceState(null, '', '#' + sections[n].id);
    setTimeout(() => {
      locked = false;
      triggerFadeIn();
    }, DURATION * 0.55);
    setTimeout(() => { locked = false; }, DURATION + 20);
  }

  /* ── Fade-in .fi elements in current section ────────────────── */
  function triggerFadeIn() {
    const s = sections[current];
    if (!s) return;
    s.querySelectorAll('.fi').forEach(el => {
      el.classList.remove('in');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    });
  }

  /* ── Dot indicator ──────────────────────────────────────────── */
  function buildDots() {
    const container = document.querySelector('.page-dots');
    if (!container) return;
    container.innerHTML = '';
    dots = sections.map((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot';
      btn.setAttribute('aria-label', 'Ir para secção ' + (i + 1));
      btn.addEventListener('click', () => goTo(i));
      container.appendChild(btn);
      return btn;
    });
    updateDots();
  }

  function updateDots() {
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.classList.toggle('on-dark', sections[i] && sections[i].id === 'inicio');
    });
  }

  /* ── Active nav highlight ───────────────────────────────────── */
  function updateNavHighlight() {
    const id  = sections[current] ? sections[current].id : '';
    const OQF = ['o-modelo','como-funciona','que-empresas','transicao','faq'];
    const QS  = ['origem','pedro','investidores'];

    document.querySelectorAll('header nav a').forEach(link => {
      const href = (link.getAttribute('href') || '').replace(/^.*\//, ''); // strip path
      let active = false;

      if (href === '#' + id) active = true;
      if (href.startsWith('o-que-fazemos') && OQF.includes(id)) active = true;
      if (href.startsWith('quem-somos')    && QS.includes(id))  active = true;
      if (href === '#inicio' && ['inicio', 'visao-geral'].includes(id)) active = true;
      if (href === '#contacto' && id === 'contacto') active = true;

      link.classList.toggle('active', active);
    });
  }

  /* ── Wheel ──────────────────────────────────────────────────── */
  window.addEventListener('wheel', e => {
    if (isMobile()) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) < WHEEL_MIN) return;
    goTo(e.deltaY > 0 ? current + 1 : current - 1);
  }, { passive: false });

  /* ── Keyboard ───────────────────────────────────────────────── */
  window.addEventListener('keydown', e => {
    if (isMobile()) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
  });

  /* ── Touch ──────────────────────────────────────────────────── */
  let touchY0 = 0;
  window.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (isMobile()) return;
    const diff = touchY0 - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* ── Intercept same-page anchor clicks ─────────────────────── */
  function bindSamePageLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        if (isMobile()) return; // let native anchor scroll work on mobile
        const id  = link.getAttribute('href').slice(1);
        const idx = sections.findIndex(s => s.id === id);
        if (idx >= 0) { e.preventDefault(); goTo(idx); }
      });
    });
  }

  /* ── Hamburger ──────────────────────────────────────────────── */
  function bindHamburger() {
    const btn = document.getElementById('hbg');
    const mob = document.getElementById('mob-nav');
    if (!btn || !mob) return;
    btn.addEventListener('click', () => mob.classList.toggle('open'));
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
  }

  /* ── FAQ accordion ──────────────────────────────────────────── */
  function bindFAQ() {
    document.querySelectorAll('.faq-q').forEach(q => {
      q.addEventListener('click', () => {
        const item   = q.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── Init ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    sections = [...document.querySelectorAll('section[id]')];
    if (!sections.length) return;

    // Resolve start section from URL hash
    const hash = location.hash.slice(1);
    if (hash) {
      const idx = sections.findIndex(s => s.id === hash);
      if (idx >= 0) current = idx;
    }

    // Place instantly (no animation on load)
    sections.forEach(s => s.classList.add('no-anim'));
    place();
    // Re-enable transitions after two frames (ensures no flash)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sections.forEach(s => s.classList.remove('no-anim'));
    }));

    buildDots();
    bindSamePageLinks();
    bindHamburger();
    bindFAQ();

    // Fire fade-in for initial section
    setTimeout(triggerFadeIn, 120);
  });

})();
