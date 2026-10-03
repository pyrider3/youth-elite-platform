import { n as gsap, t as ScrollTrigger } from './vendor-gsap-DyNVl9q7.js';

// Source is deliberately readable: the delivered static site needs no build tool.
gsap.registerPlugin(ScrollTrigger);
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const chapters = $$('.chapter');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 760px)');
const coarse = matchMedia('(pointer: coarse)');
const motionButton = $('.motion-btn');
let manualReduced = false;
try { manualReduced = localStorage.getItem('youth-club-reduced-motion') === 'true'; } catch {}
let reduced = motionPreference.matches || manualReduced;
let animationContext;
let ambientFrame = 0;
let lastFrame = 0;
let scrollFrame = 0;
const visible = new Set();
const loops = new Map();

function updateProgress() {
  scrollFrame = 0;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  document.documentElement.style.setProperty('--progress', Math.min(1, Math.max(0, scrollY / max)));
  let active = 0;
  chapters.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= innerHeight * .45) active = index;
  });
  $('[data-now]').textContent = String(active + 1).padStart(2, '0');
  $$('.index a').forEach((link, i) => {
    if (i === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
}, { passive: true });

const menu = $('.index');
const menuButton = $('.menu-btn');
function setMenu(open, restoreFocus = false) {
  menu.classList.toggle('open', open);
  menu.inert = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '关闭 ×' : '目录 ＋';
  document.body.classList.toggle('menu-open', open);
  $('main').inert = open;
  if (open) $('.index a').focus({ preventScroll: true });
  else if (restoreFocus) menuButton.focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
document.addEventListener('keydown', event => {
  if (!menu.classList.contains('open')) return;
  if (event.key === 'Escape') { setMenu(false, true); return; }
  if (event.key === 'Tab') {
    const controls = [menuButton, ...$$('a', menu)];
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  }
});
$$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  setMenu(false);
  history.pushState(null, '', link.hash);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  window.scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: reduced ? 'instant' : 'smooth' });
}));

// Photos use a native modal; opening an image never sends files anywhere.
const photoDialog = $('.photo-dialog');
let photoTrigger;
function openPhoto(image, trigger) {
  photoTrigger = trigger;
  $('img', photoDialog).src = image.src;
  $('img', photoDialog).alt = image.alt;
  $('figcaption', photoDialog).textContent = image.alt;
  photoDialog.showModal();
  document.body.style.overflow = 'hidden';
}
for (const image of $$('.fair-rail img, .ticket-stream img')) {
  const button = document.createElement('button');
  button.className = 'photo-card';
  button.type = 'button';
  button.setAttribute('aria-label', `查看大图：${image.alt}`);
  image.before(button);
  button.append(image);
  const label = document.createElement('span');
  label.className = 'photo-label';
  label.textContent = image.alt;
  button.append(label);
  button.addEventListener('click', () => openPhoto(image, button));
}
const hint = document.createElement('p');
hint.className = 'gallery-hint';
hint.textContent = '现场影像，持续放映 · 点击照片查看大图';
$('.fair-rail').after(hint);
// Two identical groups make a seamless, automatic filmstrip.
const rail = $('.fair-rail');
const film = document.createElement('div'); film.className = 'film-track';
const group = document.createElement('div'); group.className = 'film-group';
while (rail.firstChild) group.append(rail.firstChild);
const duplicate = group.cloneNode(true);
duplicate.setAttribute('aria-hidden', 'true');
$$('button', duplicate).forEach(button => {
  button.tabIndex = -1;
  button.addEventListener('click', () => openPhoto($('img', button), button));
});
film.append(group, duplicate); rail.append(film);

$('.photo-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => { if (event.target === photoDialog) photoDialog.close(); });
photoDialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  photoTrigger?.focus({ preventScroll: true });
});
$$('main img').forEach(image => { image.loading = 'lazy'; image.decoding = 'async'; });

$$('.dept-toggle').forEach(button => button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  const detail = document.getElementById(button.getAttribute('aria-controls'));
  detail.hidden = !open;
  button.closest('article').classList.toggle('expanded', open);
  $('span', button).textContent = open ? '−' : '＋';
  ScrollTrigger.refresh();
  updateProgress();
}));
$$('.path-option').forEach(button => {
  button.addEventListener('click', () => {
    $$('.path-option').forEach(other => other.classList.toggle('active', other === button));
  });
});
$$('.equal-nodes i').forEach((node, index) => node.style.setProperty('--node', index));

// Five continuous lanes: opposite directions and independent speeds.
const partners = '中央军委审计署.山西阿尔法无人机科技.中铁十七局.山西三立期货.中化二建.山西省税务局.中国邮政.山西镇飞集团.黄河万家寨水利枢纽.中国核工业二三建设.得力集团.中国土木工程集团.西南证券.HOTWIND 热风.沃尔玛.中国工商银行山西省分行.北京植物医生.山西中德投资集团.宝能集团.招商银行.深圳市信银企业服务.大同证券.卓信大华资产评估.深圳慧通商务.北京极兔供应链.招商中铁控股.山西山控能源集团'.split('.');
const cloud = $('.star-cloud');
cloud.className = 'barrage';
cloud.setAttribute('aria-label', '联系企业名单摘选');
for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
  const names = partners.filter((_, index) => index % 5 === rowIndex);
  const row = document.createElement('div'); row.className = 'barrage-row';
  row.style.setProperty('--duration', `${38 + rowIndex * 5}s`);
  row.style.setProperty('--offset', `${-7 - rowIndex * 8}s`);
  const track = document.createElement('div'); track.className = 'barrage-track';
  const group = document.createElement('div'); group.className = 'barrage-group';
  [...names, ...names].forEach((name, index) => {
    const label = document.createElement('span'); label.className = 'barrage-name'; label.textContent = name;
    if (index >= names.length) label.setAttribute('aria-hidden', 'true');
    group.append(label);
  });
  const clone = group.cloneNode(true); clone.setAttribute('aria-hidden', 'true');
  track.append(group, clone); row.append(track); cloud.append(row);
}

// Build countable spans without changing the supplied metrics or their labels.
const countTargets = [];
$$('.echo-stats>b, .fair-score>b, .talk-head>b, .lecture-poster>b, .base-copy h2 b, .wechat-copy b, .network-copy>b, .partner-total>b').forEach(parent => {
  const node = [...parent.childNodes].find(node => node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent));
  if (!node) return;
  const match = node.textContent.match(/([\d,]+)/);
  if (!match) return;
  const span = document.createElement('span');
  span.className = 'count-value'; span.textContent = match[1];
  const [before, after] = [node.textContent.slice(0, match.index), node.textContent.slice(match.index + match[1].length)];
  node.replaceWith(document.createTextNode(before), span, document.createTextNode(after));
  countTargets.push({ span, value: Number(match[1].replaceAll(',', '')), original: match[1] });
});

function trackLoop(section, animation) {
  if (!loops.has(section)) loops.set(section, []);
  loops.get(section).push(animation);
  animation.paused(!visible.has(section) || document.hidden);
}
function animateExperience() {
  animationContext?.revert(); loops.clear();
  countTargets.forEach(({ span, original }) => { span.textContent = original; });
  if (reduced) { ScrollTrigger.refresh(); return; }
  animationContext = gsap.context(() => {
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)' }, context => {
      const mobile = context.conditions.mobile;
      const scrub = (id, end = 'bottom bottom') => ({ trigger: id, start: 'top top', end, scrub: .8, invalidateOnRefresh: true });
      gsap.from('.sonic-title h1 span', { y: 42, opacity: 0, filter: 'blur(16px)', duration: 1.5, stagger: .18, ease: 'power3.out', clearProps: 'filter' });
      gsap.from('.hero-eyebrow,.hero-bottom', { opacity: 0, y: 18, duration: 1, delay: .45, stagger: .15 });
      const intro = gsap.timeline({ scrollTrigger: scrub('#s1') });
      intro.to('.sonic-title h1 span:first-child', { xPercent: mobile ? -12 : -23, opacity: .12, scale: 1.08, duration: 1 }, 0)
        .to('.sonic-title h1 span:last-child', { xPercent: mobile ? 12 : 23, opacity: .12, scale: 1.08, duration: 1 }, 0)
        .to('.hero-orbits', { scale: 1.6, rotation: 12, opacity: .25, duration: 1 }, 0)
        .to('.hero-bottom,.hero-eyebrow', { opacity: 0, y: -25, duration: .5 }, 0);
      gsap.from('.official-float', { y: 70, rotationY: mobile ? -8 : -18, rotationX: 8, scale: .9, transformOrigin: '50% 50%', scrollTrigger: { trigger: '#official', start: 'top 90%', end: 'top 5%', scrub: .8 } });
      gsap.from('.official-card-head,.official-status,.official-card h2,.official-lead,.official-records>div,.official-card footer', { y: 22, opacity: 0, stagger: .09, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: '#official', start: 'top 50%', once: true } });
      gsap.from('.official-status i', { scale: .1, rotation: -90, duration: 1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '#official', start: 'top 40%', once: true } });
      gsap.from('.official-award', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, scrollTrigger: { trigger: '#official', start: 'top 25%', once: true } });
      gsap.from('.protocol-traces i', { scaleY: 0, stagger: .12, scrollTrigger: { trigger: '#s2', start: 'top 65%', end: 'top 10%', scrub: .7 } });
      gsap.from('.protocol-core li', { y: 30, opacity: 0, stagger: .12, scrollTrigger: { trigger: '#s2', start: 'top 50%', end: 'top top', scrub: .6 } });
      $$('.kinetic div').forEach((line, i) => gsap.fromTo(line, { xPercent: i % 2 ? -20 : 0 }, { xPercent: i % 2 ? 0 : -20, scrollTrigger: { trigger: '#s2', start: 'top bottom', end: 'bottom top', scrub: 1 } }));
      const equal = gsap.timeline({ scrollTrigger: { trigger: '#s3', start: 'top 55%', end: 'bottom bottom', scrub: .7 } });
      equal.from('.equal-nodes i', { y: i => (i % 2 ? -1 : 1) * (35 + i * 7), scale: .6, stagger: .03, duration: .7 }, 0)
        .from('.equal-links', { scaleX: 0, duration: .4 }, .55)
        .from('.equal-spectrum i', { scaleX: 0, opacity: 0, duration: .5, stagger: .025 }, .4);
      gsap.from('.choice-gate', { clipPath: 'inset(0 48% 0 48%)', opacity: .2, scrollTrigger: { trigger: '#s4', start: 'top 75%', end: 'top 10%', scrub: .8 } });
      gsap.from('.path-option', { x: mobile ? 30 : 70, opacity: 0, stagger: .12, scrollTrigger: { trigger: '#s4', start: 'top 40%', end: 'top top', scrub: .6 } });
      gsap.to('.choice-word', { xPercent: -15, rotation: 8, scrollTrigger: { trigger: '#s4', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      $$('.echo-rings i').forEach((ring, i) => gsap.fromTo(ring, { scale: .4, opacity: 0 }, { scale: 1.4 + i * .12, opacity: .55, scrollTrigger: { trigger: '#s5', start: 'top 75%', end: 'bottom bottom', scrub: .8 + i * .1 } }));
      // Reveal photo cards only vertically; native horizontal scrolling stays usable.
      gsap.from('.fair-rail .photo-card', { y: 45, rotation: 2, opacity: 0, duration: .9, stagger: .06, scrollTrigger: { trigger: '.fair-rail', start: 'top 92%', once: true } });
      gsap.fromTo('.ticket-stream article', { y: 110, rotationX: 28, rotation: i => i % 2 ? 7 : -7, scale: .86, opacity: 0 }, { y: 0, rotationX: 0, rotation: 0, scale: 1, opacity: 1, stagger: .14, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.ticket-stream', start: 'top 90%', end: 'bottom 10%', toggleActions: 'restart none restart reset' } });
      gsap.from('.lecture-shot', { clipPath: 'inset(0 0 100% 0)', scale: .96, scrollTrigger: { trigger: '.lecture-shot', start: 'top 95%', end: 'top 35%', scrub: .7 } });
      gsap.from('.room-sign', { rotationY: -45, x: -30, opacity: 0, duration: 1, scrollTrigger: { trigger: '.room-sign', start: 'top 88%', once: true } });
      gsap.from('.desk-photos img', { y: 60, rotation: i => i % 2 ? 8 : -8, opacity: 0, duration: 1.1, stagger: .12, scrollTrigger: { trigger: '.desk-photos', start: 'top 85%', once: true } });
      gsap.from('.blueprint i', { scaleX: 0, scaleY: 0, stagger: .1, scrollTrigger: { trigger: '.blueprint', start: 'top 90%', end: 'top 30%', scrub: .7 } });
      gsap.to('.blueprint img', { filter: 'grayscale(0)', opacity: 1, scrollTrigger: { trigger: '.blueprint', start: 'top 60%', end: 'top 5%', scrub: 1 } });
      gsap.from('.phone', { rotation: -16, x: mobile ? -35 : -90, opacity: .2, scrollTrigger: { trigger: '.phone', start: 'top 92%', end: 'top 25%', scrub: .8 } });
      gsap.from('.signal-lines i', { scaleX: 0, stagger: .15, scrollTrigger: { trigger: '#s11', start: 'top 70%', end: 'top 5%', scrub: 1 } });
      gsap.from('.portal-frame img', { rotationY: mobile ? -8 : -25, scale: .9, opacity: .3, scrollTrigger: { trigger: '.portal-frame', start: 'top 90%', end: 'top 25%', scrub: .8 } });
      gsap.from('.star-map', { opacity: 0, y: 30, duration: 1, scrollTrigger: { trigger: '.star-map', start: 'top 85%', once: true } });
      gsap.from('.dept-grid article', { y: 35, opacity: 0, stagger: .1, duration: .8, scrollTrigger: { trigger: '.dept-grid', start: 'top 90%', once: true } });
      // The QR image itself has no transformation: only the rings and title move.
      gsap.from('.join-copy h2', { y: 50, opacity: 0, filter: 'blur(12px)', duration: 1.3, clearProps: 'filter', scrollTrigger: { trigger: '#s15', start: 'top 65%', once: true } });
      gsap.from('.join-rings', { scale: 1.8, opacity: 0, scrollTrigger: { trigger: '#s15', start: 'top bottom', end: 'top 10%', scrub: 1 } });
      countTargets.forEach(({ span, value, original }) => {
        const state = { value: 0 };
        gsap.to(state, { value, duration: 1.5, ease: 'power2.out', scrollTrigger: { trigger: span, start: 'top 95%', once: true },
          onUpdate() { span.textContent = original.includes(',') ? Math.round(state.value).toLocaleString('en-US') : String(Math.round(state.value)).padStart(original.startsWith('0') ? original.length : 1, '0'); },
          onComplete() { span.textContent = original; }
        });
      });
      trackLoop($('#s1'), gsap.to('.hero-orbits i', { opacity: .45, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', overwrite: false }));
    });
  });
  ScrollTrigger.refresh();
}

// Local tilt affects only the surface; it never alters paragraph geometry.
const identityCard = $('.official-card');
identityCard.addEventListener('pointermove', event => {
  if (reduced || coarse.matches) return;
  const r = identityCard.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - .5;
  const y = (event.clientY - r.top) / r.height - .5;
  identityCard.style.setProperty('--rx', `${-y * 5}deg`);
  identityCard.style.setProperty('--ry', `${x * 7}deg`);
  identityCard.style.setProperty('--shine', `${50 + x * 60}%`);
});
identityCard.addEventListener('pointerleave', () => { identityCard.style.setProperty('--rx', '0deg'); identityCard.style.setProperty('--ry', '0deg'); });

// One bounded RAF loop for the two canvas scenes. Nothing renders offscreen.
const fields = $$('.wave-field,.join-field').map(canvas => ({ canvas, ctx: canvas.getContext('2d'), section: canvas.closest('.chapter'), w: 0, h: 0, rings: [], points: [], pulseAt: 0 }));
function resizeFields() {
  for (const field of fields) {
    const r = field.canvas.getBoundingClientRect();
    field.w = r.width; field.h = r.height;
    const dpr = Math.min(devicePixelRatio || 1, compact.matches ? 1.25 : 1.7);
    field.canvas.width = Math.round(r.width * dpr); field.canvas.height = Math.round(r.height * dpr);
    field.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    field.points = Array.from({ length: compact.matches ? 26 : 64 }, (_, i) => ({
      x: ((i * .61803398875) % 1) * field.w, y: ((i * .41421356237) % 1) * field.h,
      speed: 2 + (i % 5), size: .65 + (i % 3) * .4, phase: i * 1.71
    }));
  }
}
let lastPointer = 0;
function addRing(event) {
  if (reduced || performance.now() - lastPointer < 150) return;
  lastPointer = performance.now();
  const field = fields[0];
  const rect = field.canvas.getBoundingClientRect();
  field.rings.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, age: 0 });
  if (field.rings.length > 8) field.rings.shift();
  scheduleAmbient();
}
$('#s1').addEventListener('pointermove', event => { if (event.pointerType === 'mouse') addRing(event); }, { passive: true });
$('#s1').addEventListener('pointerdown', addRing, { passive: true });
function scheduleAmbient() {
  if (ambientFrame || reduced || document.hidden || !fields.some(f => f.ctx && visible.has(f.section))) return;
  lastFrame = 0;
  ambientFrame = requestAnimationFrame(renderAmbient);
}
function renderAmbient(now) {
  ambientFrame = 0;
  if (reduced || document.hidden) return;
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 1 / 60;
  lastFrame = now;
  for (const f of fields) {
    if (!f.ctx || !visible.has(f.section)) continue;
    const ctx = f.ctx;
    ctx.clearRect(0, 0, f.w, f.h);
    const joining = f.canvas.classList.contains('join-field');
    if (!joining && now - f.pulseAt > 1900) {
      f.pulseAt = now;
      const step = Math.floor(now / 1900);
      f.rings.push({ x: f.w * (.25 + (step % 3) * .25), y: f.h * (.36 + (step % 2) * .23), age: 0 });
      if (f.rings.length > 8) f.rings.shift();
    }
    for (const p of f.points) {
      p.y -= p.speed * dt;
      if (p.y < 0) p.y = f.h;
      const wave = Math.sin(now / 5500 + p.phase);
      let x = p.x + wave * 18, y = p.y;
      if (joining) {
        // Orbit the QR region without covering its quiet zone.
        const centreX = compact.matches ? f.w * .5 : f.w * .76;
        const centreY = compact.matches ? f.h * .73 : f.h * .5;
        const phase = now / 19000 + p.phase;
        const radius = (compact.matches ? 170 : 230) + (p.phase % 90);
        x = centreX + Math.cos(phase) * radius;
        y = centreY + Math.sin(phase) * radius * .85;
      }
      ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(156,226,245,${.25 + (wave + 1) * .2})`; ctx.fill();
    }
    f.rings = f.rings.filter(r => r.age < 2.6);
    for (const ring of f.rings) {
      ring.age += dt;
      for (let layer = 0; layer < 3; layer++) {
        const radius = ring.age * 90 - layer * 14;
        if (radius <= 0) continue; // Fixes the original negative-radius Canvas exception.
        ctx.beginPath(); ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(133,228,255,${Math.max(0, 1 - ring.age / 2.6) * .25})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
    }
  }
  if (fields.some(f => f.ctx && visible.has(f.section))) ambientFrame = requestAnimationFrame(renderAmbient);
}
new IntersectionObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
    if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
    loops.get(entry.target)?.forEach(loop => loop.paused(!entry.isIntersecting || document.hidden || reduced));
  }
  scheduleAmbient();
}, { threshold: 0 }).observe(document.querySelector('#s1'));
const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
    if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
    loops.get(entry.target)?.forEach(loop => loop.paused(!entry.isIntersecting || document.hidden || reduced));
  }
  scheduleAmbient();
}, { threshold: 0 });
chapters.slice(1).forEach(section => sectionObserver.observe(section));

function syncMotion() {
  reduced = motionPreference.matches || manualReduced;
  document.body.classList.toggle('motion-reduced', reduced);
  motionButton.setAttribute('aria-pressed', String(reduced));
  motionButton.textContent = reduced ? '动态效果：减弱' : '动态效果：开';
  motionButton.title = motionPreference.matches ? '已遵循系统减少动态效果设置' : '切换减少动态效果';
  motionButton.disabled = motionPreference.matches;
  cancelAnimationFrame(ambientFrame); ambientFrame = 0;
  identityCard.style.setProperty('--rx', '0deg'); identityCard.style.setProperty('--ry', '0deg');
  animateExperience(); resizeFields(); updateProgress(); scheduleAmbient();
}
motionButton.addEventListener('click', () => {
  manualReduced = !manualReduced;
  try { localStorage.setItem('youth-club-reduced-motion', String(manualReduced)); } catch {}
  syncMotion();
});
motionPreference.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
  loops.forEach((animations, section) => animations.forEach(animation => animation.paused(document.hidden || reduced || !visible.has(section))));
  if (document.hidden) { cancelAnimationFrame(ambientFrame); ambientFrame = 0; }
  else scheduleAmbient();
});
let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { resizeFields(); ScrollTrigger.refresh(); updateProgress(); }, 180);
});
addEventListener('load', () => { resizeFields(); ScrollTrigger.refresh(); updateProgress(); });
syncMotion();
document.fonts.ready.then(() => { ScrollTrigger.refresh(); });
