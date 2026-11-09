/* Ежевика — главная страница: слайдер, подборки товаров, персональный блок клуба. */
(() => {
'use strict';
const E = window.EZH, D = E.D, $ = E.$, $$ = E.$$;
const P = D.products;
const has = (p, f) => (p.flags || []).includes(f);
const top = (f, n = 12, sort = (a, b) => b.sold - a.sold) => P.filter(f).sort(sort).slice(0, n);

/* ---------- подборки ---------- */
const LISTS = {
  hits: { get: () => top(p => has(p, 'hit')), grid: true },
  ny: { get: () => top(p => p.cat === 'newyear') },
  cozy: { get: () => top(p => p.cat === 'home' || p.cat === 'furniture' || (p.cat === 'kitchen' && p.sub !== 'knives')) },
  deals: { get: () => P.filter(p => p.reviews > 300).sort((a, b) => E.disc(b) - E.disc(a) || b.sold - a.sold).slice(0, 6), grid: true },
  new: { get: () => top(p => has(p, 'new') || p.age < 15, 12, (a, b) => a.age - b.age) },
  appl: { get: () => top(p => p.cat === 'appliances') },
  recent: { get: () => E.recent.list().slice(0, 12) },
};
function renderLists() {
  $$('[data-list]').forEach(el => {
    const l = LISTS[el.dataset.list]; if (!l) return;
    const items = l.get();
    if (el.dataset.list === 'recent') { const s = el.closest('[data-recent]'); if (s) s.hidden = items.length < 2; if (items.length < 2) return; }
    el.innerHTML = l.grid ? E.grid(items, 'grid-home') : E.rail(items.map(p => E.card(p)).join(''));
  });
  E.initRails();
}

/* ---------- клубный баннер ---------- */
function renderClub() {
  const b = $('[data-club]'); if (!b) return;
  const u = E.user(); if (!u) return;
  const lv = E.club.level(), nx = E.club.next(), bal = E.berries.balance();
  b.querySelector('.club-ic').innerHTML = E.berry('berry-c');
  b.querySelector('h3').textContent = `${u.name}, у вас ${E.pl(bal, 'ягодка', 'ягодки', 'ягодок')}`;
  b.querySelector('p').innerHTML = `Уровень «${lv.name}» — кешбэк ${lv.rate}% с каждой покупки.` + (nx ? ` До уровня «${nx.name}» осталось ${E.money(nx.from - E.club.spent())}.` : ' Это максимальный уровень клуба!');
  const a = b.querySelector('.btn'); a.href = 'account.html#berries'; a.innerHTML = 'Мои ягодки' + E.icon('arrow-r');
}

/* ---------- слайдер ---------- */
function slider() {
  const hero = $('.hero'); if (!hero) return;
  const track = $('.hero-track', hero), slides = $$('.slide', hero), dots = $$('.dots button', hero), n = slides.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer = null, paused = false;
  const go = (k, anim = true) => {
    i = (k + n) % n;
    track.style.transition = anim ? '' : 'none';
    track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, j) => { s.setAttribute('aria-hidden', j !== i); $$('a,button', s).forEach(a => { a.tabIndex = j === i ? 0 : -1; }); });
    dots.forEach((d, j) => { d.classList.toggle('on', j === i); if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    const next = slides[(i + 1) % n].querySelector('img'); if (next) next.loading = 'eager';
  };
  const play = () => { clearInterval(timer); if (!reduce && !paused && !document.hidden) timer = setInterval(() => go(i + 1), 6500); };
  $('.arr.l', hero).onclick = () => { go(i - 1); play(); };
  $('.arr.r', hero).onclick = () => { go(i + 1); play(); };
  dots.forEach((d, j) => { d.onclick = () => { go(j); play(); }; });
  hero.addEventListener('mouseenter', () => { paused = true; play(); });
  hero.addEventListener('mouseleave', () => { paused = false; play(); });
  hero.addEventListener('focusin', () => { paused = true; play(); });
  hero.addEventListener('focusout', () => { paused = false; play(); });
  document.addEventListener('visibilitychange', play);
  hero.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { go(i - 1); play(); } if (e.key === 'ArrowRight') { go(i + 1); play(); } });
  // свайп
  let x0 = null, y0 = 0, dx = 0, drag = false, moved = false;
  hero.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; if (e.target.closest('.arr,.dots')) return; x0 = e.clientX; y0 = e.clientY; dx = 0; drag = false; moved = false; });
  hero.addEventListener('pointermove', e => {
    if (x0 == null) return; dx = e.clientX - x0;
    if (!drag && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) { drag = true; moved = true; clearInterval(timer); try { hero.setPointerCapture(e.pointerId); } catch (er) { /* нет захвата */ } }
    if (drag) { track.style.transition = 'none'; track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`; }
  });
  const end = () => { if (x0 == null) return; x0 = null; if (drag) { const w = hero.clientWidth; go(dx < -w * 0.15 ? i + 1 : dx > w * 0.15 ? i - 1 : i); play(); } drag = false; };
  hero.addEventListener('pointerup', end); hero.addEventListener('pointercancel', end);
  hero.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  $$('img', hero).forEach(im => im.addEventListener('dragstart', e => e.preventDefault()));
  window.addEventListener('load', () => setTimeout(() => $$('img', hero).forEach(im => { im.loading = 'eager'; }), 1500));
  go(0, false); play();
}

renderLists(); renderClub(); slider(); E.timers();
E.on('session', () => { renderClub(); });
E.on('recent', () => { const el = $('[data-list="recent"]'); if (el) { el.innerHTML = ''; renderLists(); } });
window.addEventListener('pageshow', e => { if (e.persisted) { renderLists(); E.updateBadges(); } });
})();
