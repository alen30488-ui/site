/* Ежевика — избранное */
(() => {
const E = window.EZH, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = $('#fav-root');
const SORTS = [['new', 'Недавно добавленные'], ['price_asc', 'Сначала дешёвые'], ['price_desc', 'Сначала дорогие'], ['discount', 'По размеру скидки'], ['rating', 'По рейтингу']];
let cat = 'all', sort = E.get('favsort', 'new');

/* стабильное «снижение цены» для части товаров — как напоминание в избранном */
const drop = p => (p.id % 9 === 2 || p.id % 9 === 5) ? 3 + p.id % 7 : 0;

function list() {
  const fav = E.fav.list(), t = {}; fav.forEach(x => { t[x.id] = x.t; });
  let l = fav.map(x => E.P[x.id]);
  if (cat === 'drop') l = l.filter(p => drop(p)); else if (cat !== 'all') l = l.filter(p => p.cat === cat);
  const by = {
    new: (a, b) => t[b.id] - t[a.id], price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price,
    discount: (a, b) => E.disc(b) - E.disc(a), rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  };
  return l.sort(by[sort] || by.new);
}

function render() {
  const fav = E.fav.list().map(x => E.P[x.id]);
  if (!fav.length) return renderEmpty();
  const cats = {}; fav.forEach(p => { cats[p.cat] = (cats[p.cat] || 0) + 1; });
  if (cat !== 'all' && cat !== 'drop' && !cats[cat]) cat = 'all';
  const drops = fav.filter(p => drop(p));
  if (cat === 'drop' && !drops.length) cat = 'all';
  const l = list(), u = E.user();
  const avail = l.filter(p => !p.sizes && !E.cart.has(p.id));
  root.innerHTML = `${E.crumbs([['Избранное']])}
  <div class="page-h fav-h"><h1>Избранное</h1><span class="cnt">${E.pl(fav.length, 'товар', 'товара', 'товаров')}</span>
    <div class="fav-acts">
      <label class="sort-w"><span>Сортировка</span><select class="input" data-fsort aria-label="Сортировка">${SORTS.map(([k, n]) => `<option value="${k}"${k === sort ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <button type="button" class="btn btn-primary" data-fall${avail.length ? '' : ' disabled'}>${E.icon('cart', 'i-18')}${avail.length ? 'Добавить все в корзину' : 'Все уже в корзине'}</button>
      <button type="button" class="btn btn-outline btn-ic" data-fshare aria-label="Поделиться подборкой" title="Поделиться">${E.icon('share', 'i-18')}</button>
    </div>
  </div>
  ${u ? '' : `<div class="note fav-note">${E.icon('heart')}<div><b>Избранное хранится на этом устройстве.</b> Войдите, чтобы не потерять подборку и получать уведомления о снижении цен.</div><a class="btn btn-secondary btn-sm" href="${E.loginUrl()}">Войти</a></div>`}
  <div class="fav-tools">
    <div class="chips chips-scroll" role="tablist" aria-label="Категории">
      <button type="button" class="chip${cat === 'all' ? ' on' : ''}" data-fc="all">Все<small>${fav.length}</small></button>
      ${drops.length ? `<button type="button" class="chip chip-drop${cat === 'drop' ? ' on' : ''}" data-fc="drop">${E.icon('tag')}Подешевели<small>${drops.length}</small></button>` : ''}
      ${Object.keys(cats).sort((a, b) => cats[b] - cats[a]).map(c => `<button type="button" class="chip${cat === c ? ' on' : ''}" data-fc="${c}">${E.esc(E.C[c].name)}<small>${cats[c]}</small></button>`).join('')}
    </div>
  </div>
  ${cat === 'drop' ? `<div class="note note-ok">${E.icon('tag')}<div><b>Цены снизились.</b> Эти товары подешевели с момента, как вы добавили их в избранное.</div></div>` : ''}
  <div class="fav-grid">${E.grid(l)}</div>
  <div data-frecs></div>`;
  // метки снижения цены поверх карточек
  $$('.fav-grid .pcard', root).forEach(c => { const p = E.P[c.dataset.pid], d = p && drop(p), pr = $('.price', c); if (d && pr) pr.insertAdjacentHTML('afterend', `<div class="drop-l">${E.icon('chart')}Подешевел на ${d}%</div>`); });
  renderRecs(fav);
}

function renderEmpty() {
  root.innerHTML = `${E.crumbs([['Избранное']])}
  ${E.empty({ icon: 'heart', title: 'В избранном пока пусто', text: 'Нажимайте ♡ на карточках товаров, чтобы собрать подборку и следить за снижением цен.', btns: '<a class="btn btn-primary btn-lg" href="catalog.html">В каталог</a><a class="btn btn-secondary btn-lg" href="catalog.html?flag=hit">Хиты продаж</a>' })}
  <div data-frecs></div>`;
  renderRecs([]);
}

function renderRecs(fav) {
  const box = $('[data-frecs]'); if (!box) return;
  const ids = new Set(fav.map(p => p.id)), cats = new Set(fav.map(p => p.cat));
  const pool = Object.values(E.P).filter(p => !ids.has(p.id));
  let recs = pool.filter(p => cats.has(p.cat)).sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
  if (recs.length < 12) recs = recs.concat(pool.filter(p => !cats.has(p.cat) && p.flags.includes('hit')));
  const rec = E.recent.list().filter(p => !ids.has(p.id));
  box.innerHTML = `<section class="sec">${E.secH(fav.length ? 'Вам может понравиться' : 'Популярное сейчас', fav.length ? '' : 'catalog.html?flag=hit')}${E.rail(recs.slice(0, 12).map(p => E.card(p)).join(''))}</section>`
    + (rec.length ? `<section class="sec">${E.secH('Вы недавно смотрели')}${E.rail(rec.slice(0, 12).map(p => E.card(p)).join(''))}</section>` : '');
  E.initRails(box);
}

document.addEventListener('click', e => {
  const t = e.target;
  const c = t.closest('[data-fc]'); if (c) { cat = c.dataset.fc; render(); return; }
  if (t.closest('[data-fall]')) {
    const l = list().filter(p => !p.sizes && !E.cart.has(p.id)), skipped = list().filter(p => p.sizes && !E.cart.has(p.id)).length;
    l.forEach(p => E.cart.add(p.id, null, 1, true));
    E.toast(`В корзину: ${E.pl(l.length, 'товар', 'товара', 'товаров')}${skipped ? `. Для ${E.pl(skipped, 'товара', 'товаров', 'товаров')} выберите размер на карточке` : ''}`, { icon: 'cart', action: ['Перейти', 'cart.html'] });
    return;
  }
  if (t.closest('[data-fshare]')) { E.copy(location.origin + location.pathname.replace(/[^/]*$/, '') + 'favorites.html', 'Ссылка на подборку скопирована'); }
});
document.addEventListener('change', e => { if (e.target.matches('[data-fsort]')) { sort = e.target.value; E.set('favsort', sort); render(); } });

/* при снятии ♡ карточка плавно исчезает, затем перерисовываем список */
E.on('fav', () => {
  const gone = $$('.fav-grid .pcard').filter(c => !E.fav.has(c.dataset.pid));
  if (gone.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) { gone.forEach(c => c.classList.add('pcard-out')); setTimeout(render, 220); } else render();
});
E.on('cart', () => { const b = $('[data-fall]'); if (b) render(); });
E.on('session', render);
render();
})();
