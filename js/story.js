/* ================================================================
story.js — الحركة والتمرير: Lenis + ScrollTrigger متزامنان.
مبادئ: transform/opacity فقط، power3.out للدخول،
power2.inOut للانتقالات، stagger 0.06، scrub 0.6–1، RTL سليم.
================================================================ */
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis (ملف محلي) + مزامنة ---------- */
  let lenis = null;
  try {
    if (!reduced && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    }
  } catch (e) { lenis = null; }

  /* ---------- اللودر: القبة تُرسم ثم تفتح كبوابة ---------- */
  const loader = $('#loader'), domePath = $('#domeDraw path');
  const fill = $('#loadfill'), ltxt = $('#loadtxt');
  const steps = ['نرسم القبة...', 'الحبوب تتجمع...', 'البوابة بتفتح...'];
  let p = 0;
  if (domePath && !reduced) {
    const len = domePath.getTotalLength();
    domePath.style.strokeDasharray = len; domePath.style.strokeDashoffset = len;
    domePath.getBoundingClientRect();
    domePath.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)';
    domePath.style.strokeDashoffset = '0';
  }
  const tick = setInterval(() => {
    p = Math.min(100, p + 14 + Math.random() * 16);
    if (fill) fill.style.width = p + '%';
    if (ltxt) ltxt.textContent = steps[Math.min(2, Math.floor(p / 38))];
    if (p >= 100) { clearInterval(tick); openGate(); }
  }, reduced ? 60 : 260);
  function openGate() {
    setTimeout(() => {
      loader.classList.add('open');           // البوابة تتفتح
      document.body.classList.add('ready');
      setTimeout(() => { loader.style.display = 'none'; heroIntro(); }, reduced ? 50 : 1100);
    }, 250);
  }
  function heroIntro() {
    if (reduced || !hasGSAP) return;
    gsap.fromTo('.hero-copy > *', { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out' });
    gsap.fromTo('#packStage', { y: 70, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 });
  }

  /* ---------- الهيدر + التقدم ---------- */
  const header = $('#header');
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('solid', y > 40);
    const d = document.documentElement;
    $('#progress').style.width = (y / (d.scrollHeight - innerHeight) * 100) + '%';
  }, { passive: true });

  /* ---------- دخول واحد لكل مشهد ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('.rv').forEach(el => io.observe(el));

  if (!hasGSAP || typeof ScrollTrigger === 'undefined' || reduced) return;

  /* ---------- تقدم عام للمشهد + طاقة الإضاءة ---------- */
  ScrollTrigger.create({
    trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.8,
    onUpdate(self) {
      window.DIWAN_GL.progress = self.progress;
      window.DIWAN_GL.energy = 0.3 + self.progress * 0.5;
    }
  });

  /* ---------- رحلة الحبة: pinned + كاميرا + لون التحميص ---------- */
  const SCENES = [
    { t: 'الحبة الخضراء', d: 'كل فنجان يبدأ من حبة واحدة مختارة بعناية قبل أي نار.', roast: 0.08, steam: 0.15 },
    { t: 'التحميص', d: 'النار الهادية تحوّل اللون من فاتح لغامق — والريحة تملأ المكان.', roast: 0.55, steam: 0.5 },
    { t: 'الطحن', d: 'طحن تركي ناعم على الحجر — تراب غني جاهز للدلة.', roast: 0.7, steam: 0.3 },
    { t: 'التحضير', d: 'تُسكب في الدلة على نار هادية ويتصاعد البخار.', roast: 0.8, steam: 0.9 },
    { t: 'الفنجان بالوش', d: 'وش مظبوط يتقدم في مجلس يليق بيك — تذوق أصل القهوة.', roast: 0.85, steam: 0.6 },
  ];
  const dots = $('#sceneDots'), imgs = $$('.story-media img');
  let cur = -1;
  SCENES.forEach((s, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', s.t);
    b.addEventListener('click', () => setScene(i));
    dots.appendChild(b);
  });
  function setScene(i) {
    if (i === cur) return; cur = i;
    imgs.forEach((im, k) => im.classList.toggle('active', k === i));
    Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === i));
    $('#sceneNum').textContent = '0' + (i + 1);
    $('#sceneTitle').textContent = SCENES[i].t;
    $('#sceneDesc').textContent = SCENES[i].d;
    gsap.fromTo('.scene-card', { x: 26, opacity: 0.5 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power2.inOut' });
  }
  setScene(0);
  ScrollTrigger.create({
    trigger: '#storyPin', start: 'top 65%', end: 'bottom 45%', scrub: 0.8,
    onUpdate(self) {
      const i = Math.min(4, Math.floor(self.progress * 5));
      setScene(i);
      const a = SCENES[i], b = SCENES[Math.min(4, i + 1)], f = (self.progress * 5) % 1;
      window.DIWAN_GL.roastMix = a.roast + (b.roast - a.roast) * f;
      window.DIWAN_GL.steam = a.steam + (b.steam - a.steam) * f;
    }
  });

  /* ---------- طقس القهوة: خطوات scrub ---------- */
  const brewSteps = $$('.brew-step'), brewBar = $('#brewBar');
  if (brewSteps.length) ScrollTrigger.create({
    trigger: '#brew', start: 'top 70%', end: 'bottom 55%', scrub: 0.8,
    onUpdate(self) {
      const i = Math.min(brewSteps.length - 1, Math.floor(self.progress * brewSteps.length));
      brewSteps.forEach((s, k) => s.classList.toggle('on', k <= i));
      if (brewBar) brewBar.style.transform = 'scaleX(' + self.progress + ')';
    }
  });

  /* ---------- parallax خفيف: الهيرو + المجلس ---------- */
  gsap.to('.hero-copy', { y: -60, opacity: 0.3, ease: 'none',
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.8 } });
  gsap.to('.hero-visual', { y: 50, ease: 'none',
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.8 } });
  $$('.council-card img').forEach(im => gsap.fromTo(im, { x: -18 }, { x: 18, ease: 'none',
    scrollTrigger: { trigger: im, scrub: 0.8, start: 'top bottom', end: 'bottom top' } }));

  /* ---------- إضاءة تتبع الماوس ---------- */
  const spot = $('#spotlight');
  if (spot && matchMedia('(hover:hover)').matches) {
    let sx = innerWidth / 2, sy = innerHeight / 3, tx = sx, ty = sy;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      sx += (tx - sx) * 0.07; sy += (ty - sy) * 0.07;
      spot.style.transform = 'translate(' + sx + 'px,' + sy + 'px)';
    });
  }
})();
