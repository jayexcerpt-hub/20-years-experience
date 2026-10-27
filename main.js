(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- Mobile menu
  const menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  const setMenu = open => {
    menu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ---- Happiness tooltip (keyboard / touch)
  const tip = $('#tip');
  $('#happyTip').addEventListener('click', () => tip.classList.toggle('show'));
  $('#happyTip').addEventListener('blur', () => tip.classList.remove('show'));

  // ---- Suggestion portal (local only)
  const replies = [
    'Excellent idea! I already knew this.',
    "Please present it again in tomorrow's scrum.",
    'Can AI do this automatically?',
    "Interesting. Let's discuss it after the next performance review.",
    'Thank you for contributing to our culture of innovation.'
  ];
  $('#ideaForm').addEventListener('submit', e => {
    e.preventDefault();
    const out = $('#ideaOut');
    out.textContent = replies[Math.floor(Math.random() * replies.length)];
    if (window.gsap && !reduce) gsap.fromTo(out, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
    $('#idea').value = '';
  });

  // ---- Dodging "teach me" button
  const arena = $('#dodgeArena'), dodge = $('#dodgeBtn'), dodgeOut = $('#dodgeOut');
  const dodgeLines = ['Mujhe sab pata hai.', 'Haan haan, pata tha.', 'Already in my roadmap.', 'Tomorrow\'s scrum, please.', 'Yeh toh 20 saal pehle seekha tha.'];
  let dodges = 0;
  const jump = () => {
    const a = arena.getBoundingClientRect(), b = dodge.getBoundingClientRect();
    const x = Math.random() * (a.width - b.width), y = Math.random() * (a.height - b.height);
    dodge.style.transform = 'none';
    dodge.style.left = x + 'px';
    dodge.style.top = y + 'px';
    dodgeOut.textContent = dodgeLines[dodges++ % dodgeLines.length];
  };
  ['mouseenter', 'touchstart'].forEach(ev => dodge.addEventListener(ev, e => { e.preventDefault(); jump(); }, { passive: false }));
  dodge.addEventListener('click', jump); // keyboard users get the same joke

  // ---- Fake notification stream
  const toastMsgs = [
    '🔔 Performance review scheduled: now.',
    '🤖 AI usage 96%. Why not 100%?',
    '📅 Emergency scrum added to your calendar.',
    '⚠️ Half-day detected. Salary adjusted by the system.',
    '📋 Please explain your work again.',
    '💡 Suggestion rejected: Mujhe sab pata hai.',
    '📉 Performance: still low.'
  ];
  const toasts = $('#toasts');
  let ti = 0;
  const pushToast = () => {
    const el = document.createElement('div');
    el.className = 'glass rounded-xl px-4 py-3 text-sm';
    el.textContent = toastMsgs[ti++ % toastMsgs.length];
    toasts.appendChild(el);
    if (window.gsap && !reduce) gsap.from(el, { x: 40, opacity: 0, duration: .5, ease: 'power3.out' });
    setTimeout(() => {
      if (window.gsap && !reduce) gsap.to(el, { opacity: 0, y: 10, duration: .4, onComplete: () => el.remove() });
      else el.remove();
    }, 4000);
    while (toasts.children.length > 2) toasts.firstChild.remove();
  };
  if (!reduce) setInterval(pushToast, 9000);

  // ---- Counter + bar helpers
  const runCount = el => {
    const to = +el.dataset.to;
    if (!window.gsap || reduce) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
  };
  const runBar = el => {
    if (!window.gsap || reduce) { el.style.transform = 'scaleX(' + el.dataset.w / 100 + ')'; return; }
    gsap.to(el, { scaleX: el.dataset.w / 100, duration: 1.4, ease: 'power3.out' });
  };

  // ---- Recalculate happiness
  $('#recalc').addEventListener('click', () => {
    const out = $('#recalcOut');
    const cards = $$('.metric');
    out.textContent = 'Calculating…';
    if (window.gsap && !reduce) {
      gsap.fromTo(cards, { scale: 1 }, { scale: .96, duration: .15, yoyo: true, repeat: 3, stagger: .06, ease: 'power1.inOut' });
    } else {
      cards.forEach(c => { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); });
    }
    setTimeout(() => {
      out.textContent = 'Calculation complete. Employee happiness could not be found. Please contact management.';
      if (window.gsap && !reduce) gsap.fromTo(out, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' });
    }, reduce ? 0 : 1100);
  });

  // ---- Final fallback if GSAP failed to load
  if (!window.gsap || !window.ScrollTrigger) {
    $$('.count').forEach(runCount);
    $$('.bar i').forEach(runBar);
    $$('.line-inner').forEach(l => (l.style.transform = 'none'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (reduce) {
    $$('.count').forEach(runCount);
    $$('.bar i').forEach(runBar);
    $$('.donut').forEach(d => (d.style.strokeDashoffset = 100 - d.dataset.fill));
    return;
  }

  // ---- Hero
  gsap.set('.line-inner', { yPercent: 110 });
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.line-inner', { yPercent: 0, duration: 1, stagger: .12 }, .1)
    .from('.hero-in', { y: 24, opacity: 0, duration: .8, stagger: .12 }, .5)
    .from('.portrait', { scale: .88, opacity: 0, duration: 1.1 }, .3)
    .from('.badge-float, .dash-float, .chip', { opacity: 0, scale: .8, duration: .7, stagger: .1 }, 1);

  if (!isMobile) {
    gsap.to('.badge-float', { y: -10, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.dash-float', { y: 12, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.chip-a, .chip-c', { y: -8, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.chip-b, .chip-d', { y: 8, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    // parallax glows
    $$('[data-parallax]').forEach(el => gsap.to(el, {
      y: () => 200 * parseFloat(el.dataset.parallax) * 4, ease: 'none',
      scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true }
    }));
  }

  // performance line draws itself
  const pl = $('#perfLine');
  if (pl) {
    const len = pl.getTotalLength();
    gsap.set(pl, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(pl, { strokeDashoffset: 0, duration: 2, delay: 1.2, ease: 'power2.out' });
  }

  // ---- Generic reveals (staggered per row)
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .12, ease: 'power3.out', clearProps: 'transform' })
  });
  gsap.set('.reveal', { opacity: 0 });

  // ---- Counters & bars
  $$('.count').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => runCount(el) }));
  $$('.bar i').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => runBar(el) }));
  $$('.chart-bar').forEach((b, i) => {
    gsap.set(b, { transformOrigin: '50% 100%', scaleY: 0 });
    ScrollTrigger.create({ trigger: b, start: 'top 95%', once: true, onEnter: () => gsap.to(b, { scaleY: 1, duration: .8, delay: i * .1, ease: 'back.out(1.4)' }) });
  });
  $$('.donut').forEach(d => ScrollTrigger.create({ trigger: d, start: 'top 95%', once: true,
    onEnter: () => gsap.to(d, { strokeDashoffset: 100 - d.dataset.fill, duration: 1.4, ease: 'power2.out' }) }));

  // ---- Timelines
  $$('.tl-item').forEach(li => gsap.from(li, { x: -30, opacity: 0, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: li, start: 'top 88%', once: true } }));

  // ---- Workflow steps
  $$('.wf-step').forEach((s, i) => gsap.from(s, { x: i % 2 ? 40 : -40, opacity: 0, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 90%', once: true } }));
  const wf = $('.wf');
  if (wf) gsap.from(wf, { '--p': 0, scrollTrigger: { trigger: wf, start: 'top 80%' } });

  // ---- Button micro-interaction
  if (!isMobile) $$('.btn-lime, .btn-ghost').forEach(b => {
    b.addEventListener('mouseenter', () => gsap.to(b, { scale: 1.05, duration: .2 }));
    b.addEventListener('mouseleave', () => gsap.to(b, { scale: 1, duration: .2 }));
  });

  // ---- Closing quote reveal (word by word)
  const q = $('#finalQuote');
  const words = q.textContent.split(' ');
  q.setAttribute('aria-label', q.textContent);
  q.innerHTML = words.map(w => `<span aria-hidden="true" class="inline-block overflow-hidden align-bottom"><span class="qw inline-block">${w}&nbsp;</span></span>`).join('');
  gsap.from('.qw', { yPercent: 110, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out',
    scrollTrigger: { trigger: q, start: 'top 85%', once: true } });
})();
