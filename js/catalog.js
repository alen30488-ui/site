/* Ежевика — каталог и поиск: фильтры, сортировка, применённые фильтры, «показать ещё», синхронизация с адресной строкой. */
(() => {
'use strict';
const E = window.EZH, D = E.D, $ = E.$, $$ = E.$$;
const root = $('#cat-root'); if (!root) return;
const ps = E.params();
const B = { cat: ps.get('cat'), sub: ps.get('sub'), q: (ps.get('q') || '').trim(), seller: ps.get('seller'), flag: ps.get('flag') };
if (B.cat && !E.C[B.cat]) B.cat = null;
if (B.seller && !E.S[B.seller]) B.seller = null;
const list = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
const num = v => (v === null || v === '' || isNaN(+v)) ? null : +v;
const F = {
  pmin: num(ps.get('pmin')), pmax: num(ps.get('pmax')),
  brand: new Set(list(ps.get('brand'))), color: new Set(list(ps.get('color'))), size: new Set(list(ps.get('size'))),
  rating: +ps.get('rating') || 0, days: +ps.get('days') || 0, disc: +ps.get('disc') || 0, feat: new Set(list(ps.get('feat'))),
};
let sort = ps.get('sort') || (B.q ? 'rel' : 'pop');
const STEP = 24;
let shown = (history.state && history.state.n) || STEP;
const SORTS = [['pop', 'Популярные'], ['rel', 'По релевантности'], ['price_asc', 'Сначала дешевле'], ['price_desc', 'Сначала дороже'], ['rating', 'С высоким рейтингом'], ['discount', 'По размеру скидки'], ['new', 'Новинки']];
const DAYS = [[1, 'Завтра'], [2, 'До 2 дней'], [3, 'До 3 дней']];
const DISC = [[20, 'от 20%'], [30, 'от 30%'], [40, 'от 40%']];
const RATING = [[4.8, '4,8 и выше'], [4.5, '4,5 и выше'], [4, '4 и выше']];
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/* ---------- базовая выборка ---------- */
let base = B.q ? E.search(B.q) : D.products.slice();
if (B.cat) base = base.filter(p => p.cat === B.cat);
if (B.sub) base = base.filter(p => p.sub === B.sub);
if (B.seller) base = base.filter(p => p.seller === B.seller);
if (B.flag && E.FLAGS[B.flag]) base = base.filter(p => (p.flags || []).includes(B.flag));
const relIdx = new Map(base.map((p, i) => [p.id, i]));
const prices = base.map(p => p.price);
const PMIN = prices.length ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
const PMAX = prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 1000;

const pass = (p, skip) =>
  (skip === 'price' || ((F.pmin == null || p.price >= F.pmin) && (F.pmax == null || p.price <= F.pmax))) &&
  (skip === 'brand' || !F.brand.size || F.brand.has(p.brand)) &&
  (skip === 'color' || !F.color.size || F.color.has(p.color)) &&
  (skip === 'size' || !F.size.size || (p.sizes || []).some(s => F.size.has(s) && !(p.soldOut || []).includes(s))) &&
  (skip === 'rating' || p.rating >= F.rating) &&
  (skip === 'days' || !F.days || p.days <= F.days) &&
  (skip === 'disc' || E.disc(p) >= F.disc) &&
  (skip === 'feat' || [...F.feat].every(f => (p.flags || []).includes(f)));
const facet = (skip, key) => { const c = new Map(); base.forEach(p => { if (!pass(p, skip)) return; [].concat(key(p) || []).forEach(k => c.set(k, (c.get(k) || 0) + 1)); }); return c; };
const SORTF = {
  pop: (a, b) => b.sold - a.sold, rel: (a, b) => relIdx.get(a.id) - relIdx.get(b.id), price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, discount: (a, b) => E.disc(b) - E.disc(a) || b.sold - a.sold, new: (a, b) => a.age - b.age,
};
const results = () => base.filter(p => pass(p)).sort(SORTF[sort] || SORTF.pop);
const activeCount = () => (F.pmin != null || F.pmax != null ? 1 : 0) + F.brand.size + F.color.size + F.size.size + (F.rating ? 1 : 0) + (F.days ? 1 : 0) + (F.disc ? 1 : 0) + F.feat.size;

/* ---------- заголовок ---------- */
const subTitle = B.sub ? (B.cat ? E.subName(B.cat, B.sub) : (D.cats.map(c => c.subs.find(s => s.id === B.sub)).find(Boolean) || {}).name) : '';
function head() {
  const total = base.length, cnt = E.pl(total, 'товар', 'товара', 'товаров');
  if (B.seller) {
    const s = E.S[B.seller], f = E.get('follow', []).includes(s.id);
    return { crumbs: [['Продавцы', null], [E.esc(s.name), null]], title: s.name,
      html: `<div class="cat-band light"><span class="seller-ava">${E.esc(s.name[0])}</span><div><h1>${E.esc(s.name)}</h1><p>${E.STAR.replace('class="star"', 'class="star" style="display:inline;vertical-align:-2px"')} ${E.rate(s.rating)} · ${E.esc(s.about)} · на Ежевике с ${s.since} года · ${cnt}</p></div><button type="button" class="btn ${f ? 'btn-outline' : 'btn-primary'} seller-follow" data-follow="${s.id}">${f ? E.icon('check', 'i-18') + 'Вы подписаны' : E.icon('plus', 'i-18') + 'Подписаться'}</button></div>` };
  }
  if (B.q) return { crumbs: [['Поиск', null]], title: `«${B.q}»`, html: `<div class="page-h"><h1>«${E.esc(B.q)}»</h1><span class="cnt">${total ? 'нашлось ' + cnt : ''}</span></div>` };
  if (B.cat) {
    const c = E.C[B.cat];
    return { crumbs: B.sub ? [[c.name, E.url.cat(c.id)], [E.esc(subTitle), null]] : [[c.name, null]], title: B.sub ? subTitle : c.name,
      html: `<div class="cat-hero"><span class="cat-hero-ic"><img src="img/c/cat-${c.id}.webp" alt="" width="72" height="72"></span><div><h1>${E.esc(B.sub ? subTitle : c.name)}</h1><div class="cnt">${cnt}</div></div></div>` };
  }
  if (B.flag === 'hit') return { crumbs: [['Хиты продаж', null]], title: 'Хиты продаж', html: `<div class="cat-band"><div><h1>Хиты продаж</h1><p>Товары, которые покупают чаще всего · ${cnt}</p></div></div>` };
  if (B.flag === 'new') return { crumbs: [['Новинки', null]], title: 'Новинки', html: `<div class="cat-band"><div><h1>Новинки</h1><p>Свежие поступления от любимых брендов · ${cnt}</p></div></div>` };
  if (B.flag) return { crumbs: [[E.FLAGS[B.flag] || 'Подборка', null]], title: E.FLAGS[B.flag] || 'Подборка', html: `<div class="page-h"><h1>${E.FLAGS[B.flag] || 'Подборка'}</h1><span class="cnt">${cnt}</span></div>` };
  if (B.sub) return { crumbs: [[E.esc(subTitle), null]], title: subTitle, html: `<div class="page-h"><h1>${E.esc(subTitle)}</h1><span class="cnt">${cnt}</span></div>` };
  if (F.brand.size === 1 && activeCount() === 1) { const b = [...F.brand][0]; return { crumbs: [['Бренды', 'brands.html'], [E.esc(b), null]], title: b, html: `<div class="page-h"><h1>${E.esc(b)}</h1><span class="cnt">Официальный магазин бренда</span></div>` }; }
  if (sort === 'discount') return { crumbs: [['Скидки', null]], title: 'Скидки дня', html: `<div class="cat-band"><div><h1>Скидки дня</h1><p>Самые большие скидки на сегодня — цены обновятся в полночь</p></div><div class="timer"><span>До обновления</span><div class="cd" data-cd="midnight" data-mode="hms"></div></div></div>` };
  return { crumbs: [['Каталог', null]], title: 'Каталог товаров', html: `<div class="page-h"><h1>Каталог</h1><span class="cnt">${cnt}</span></div><div class="cat-tiles">${D.cats.map(c => `<a class="cat-tile" href="${E.url.cat(c.id)}"><img src="img/c/cat-${c.id}.webp" alt="" loading="lazy" width="44" height="44">${c.name}</a>`).join('')}</div>` };
}
function subnav() {
  if (!B.cat || B.q || B.seller) return '';
  const c = E.C[B.cat], cnt = s => D.products.filter(p => p.cat === c.id && p.sub === s).length;
  return `<nav class="chips chips-scroll subnav" aria-label="Подкатегории"><a class="chip${B.sub ? '' : ' on'}" href="${E.url.cat(c.id)}">Все</a>${c.subs.filter(s => cnt(s.id)).map(s => `<a class="chip${B.sub === s.id ? ' on' : ''}" href="${E.url.cat(c.id, s.id)}">${s.name}<small>${cnt(s.id)}</small></a>`).join('')}</nav>`;
}

/* ---------- каркас ---------- */
const H = head();
document.title = H.title + (B.q ? ' — поиск на Ежевике' : ' — купить на Ежевике');
root.innerHTML = `${E.crumbs(H.crumbs)}<div data-head>${H.html}</div>${subnav()}
<div class="cat-l"${base.length ? '' : ' hidden'}>
  <aside class="filters" id="filters" aria-label="Фильтры"><div class="f-head"><b>Фильтры</b><button type="button" class="m-x" data-fclose aria-label="Закрыть фильтры">${E.icon('close')}</button></div>
    <div class="f-body"></div>
    <div class="f-foot"><button type="button" class="btn btn-outline" data-freset>Сбросить</button><button type="button" class="btn btn-primary" data-fclose data-fshow>Показать</button></div></aside>
  <div class="cat-main">
    <div class="toolbar"><button type="button" class="btn btn-outline btn-sm f-btn" data-fopen>${E.icon('filter', 'i-18')}Фильтры<b class="f-cnt" hidden></b></button><span class="found" aria-live="polite"></span>
      <label class="sort-w"><span>Сортировка</span><select class="input" data-sort aria-label="Сортировка">${SORTS.filter(([k]) => k !== 'rel' || B.q).map(([k, n]) => `<option value="${k}"${k === sort ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>
    <div class="applied" hidden></div>
    <div data-res></div>
  </div>
</div><div data-none></div>`;
const fbody = $('.f-body', root), res = $('[data-res]', root), app = $('.applied', root), filters = $('#filters');

/* ---------- фильтры ---------- */
const closed = new Set(E.get('fclosed', ['days', 'disc', 'feat']));
const group = (id, title, body, extra = '') => body ? `<div class="fgroup${closed.has(id) ? ' closed' : ''}" data-g="${id}"><button type="button" class="fg-h" aria-expanded="${!closed.has(id)}">${title}${E.icon('chev-d', 'i-18')}</button><div class="fg-body">${body}</div>${extra}</div>` : '';
const chk = (name, val, label, n, on, type = 'checkbox') => `<label class="check"><input type="${type}" name="${name}" value="${E.esc(val)}"${on ? ' checked' : ''}${!n && !on ? ' disabled' : ''}><span>${label}</span><span class="cnt">${n}</span></label>`;
let brandQ = '', brandAll = false;
function renderFilters() {
  let h = '';
  if (!B.cat) {
    const cc = facet(null, p => p.cat), keep = new URLSearchParams(location.search); keep.delete('sub');
    const links = D.cats.filter(c => cc.get(c.id)).map(c => { keep.set('cat', c.id); return `<a href="catalog.html?${keep.toString()}">${c.name}<span>${cc.get(c.id)}</span></a>`; }).join('');
    h += group('cat', 'Категория', links ? `<div class="fg-links">${links}</div>` : '');
  }
  // цена
  const lo = F.pmin == null ? PMIN : F.pmin, hi = F.pmax == null ? PMAX : F.pmax, st = PMAX - PMIN > 20000 ? 500 : 100;
  h += group('price', 'Цена, ₽', `<div class="price-in"><input class="input" type="number" inputmode="numeric" placeholder="от ${E.fmt(PMIN)}" value="${F.pmin == null ? '' : F.pmin}" data-pmin aria-label="Цена от"><input class="input" type="number" inputmode="numeric" placeholder="до ${E.fmt(PMAX)}" value="${F.pmax == null ? '' : F.pmax}" data-pmax aria-label="Цена до"></div>
    <div class="dual"><div class="tr"><i></i></div><input type="range" min="${PMIN}" max="${PMAX}" step="${st}" value="${lo}" data-r0 aria-label="Минимальная цена"><input type="range" min="${PMIN}" max="${PMAX}" step="${st}" value="${hi}" data-r1 aria-label="Максимальная цена"></div>`);
  // бренды
  const bc = facet('brand', p => p.brand), brands = [...new Set(base.map(p => p.brand))].sort((a, b) => (F.brand.has(b) - F.brand.has(a)) || (bc.get(b) || 0) - (bc.get(a) || 0) || a.localeCompare(b));
  if (brands.length > 1 || F.brand.size) {
    const flt = brands.filter(b => !brandQ || E.norm(b).indexOf(E.norm(brandQ)) >= 0), lim = brandAll || brandQ ? flt : flt.slice(0, 6);
    h += group('brand', 'Бренд', (brands.length > 6 ? `<input class="input fg-search" type="search" placeholder="Найти бренд" value="${E.esc(brandQ)}" data-bq aria-label="Найти бренд">` : '')
      + (lim.length ? lim.map(b => chk('brand', b, E.esc(b), bc.get(b) || 0, F.brand.has(b))).join('') : '<span class="muted">Ничего не нашлось</span>')
      + (!brandQ && flt.length > 6 ? `<button type="button" class="fg-more" data-ball>${brandAll ? 'Свернуть' : 'Показать все · ' + flt.length}</button>` : ''));
  }
  // цвет
  const colc = facet('color', p => p.color), cols = [...new Set(base.map(p => p.color))].filter(Boolean).sort((a, b) => (colc.get(b) || 0) - (colc.get(a) || 0));
  if (cols.length > 1) h += group('color', 'Цвет', `<div class="swatches">${cols.map(c => { const hex = D.colors[c] || '#ccc'; return `<button type="button" class="sw${hex === 'conic' ? ' sw-conic' : ''}${F.color.has(c) ? ' on' : ''}" data-color="${E.esc(c)}" style="${hex === 'conic' ? '' : 'background:' + hex}" title="${E.esc(c)} · ${colc.get(c) || 0}" aria-label="${E.esc(c)}" aria-pressed="${F.color.has(c)}"${!colc.get(c) && !F.color.has(c) ? ' disabled' : ''}></button>`; }).join('')}</div>`);
  // размер
  const sc = facet('size', p => (p.sizes || []).filter(s => !(p.soldOut || []).includes(s)));
  const sizes = [...new Set(base.flatMap(p => p.sizes || []))].sort((a, b) => { const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b); return ia >= 0 && ib >= 0 ? ia - ib : ia >= 0 ? -1 : ib >= 0 ? 1 : (+a) - (+b); });
  if (sizes.length) h += group('size', 'Размер', `<div class="chips">${sizes.map(s => `<button type="button" class="chip${F.size.has(s) ? ' on' : ''}" data-size-f="${s}" aria-pressed="${F.size.has(s)}"${!sc.get(s) && !F.size.has(s) ? ' disabled' : ''}>${s}</button>`).join('')}</div>`);
  // рейтинг, доставка, скидка, особенности
  const rc = v => base.filter(p => pass(p, 'rating') && p.rating >= v).length;
  h += group('rating', 'Рейтинг', RATING.map(([v, t]) => chk('rating', v, `${E.STAR}${t}`, rc(v), F.rating === v, 'radio')).join('') + (F.rating ? '<button type="button" class="fg-more" data-clear="rating">Любой рейтинг</button>' : ''));
  const dc = v => base.filter(p => pass(p, 'days') && p.days <= v).length;
  h += group('days', 'Срок доставки', DAYS.map(([v, t]) => chk('days', v, t, dc(v), F.days === v, 'radio')).join('') + (F.days ? '<button type="button" class="fg-more" data-clear="days">Любой срок</button>' : ''));
  const xc = v => base.filter(p => pass(p, 'disc') && E.disc(p) >= v).length;
  h += group('disc', 'Скидка', DISC.map(([v, t]) => chk('disc', v, t, xc(v), F.disc === v, 'radio')).join('') + (F.disc ? '<button type="button" class="fg-more" data-clear="disc">Любая скидка</button>' : ''));
  const fc = facet('feat', p => p.flags || []);
  const feats = Object.keys(E.FLAGS).filter(f => f !== B.flag && (fc.get(f) || F.feat.has(f)));
  if (feats.length) h += group('feat', 'Особенности', feats.map(f => chk('feat', f, E.FLAGS[f], fc.get(f) || 0, F.feat.has(f))).join(''));
  fbody.innerHTML = h;
  dual();
}
function dual() {
  const r0 = $('[data-r0]', fbody), r1 = $('[data-r1]', fbody); if (!r0) return;
  const tr = $('.dual .tr i', fbody), span = PMAX - PMIN || 1;
  const paint = () => { const a = Math.min(+r0.value, +r1.value), b = Math.max(+r0.value, +r1.value); tr.style.left = ((a - PMIN) / span * 100) + '%'; tr.style.right = (100 - (b - PMIN) / span * 100) + '%'; };
  const sync = () => { let a = +r0.value, b = +r1.value; if (a > b) [a, b] = [b, a]; $('[data-pmin]', fbody).value = a > PMIN ? a : ''; $('[data-pmax]', fbody).value = b < PMAX ? b : ''; paint(); };
  [r0, r1].forEach(r => { r.addEventListener('input', sync); r.addEventListener('change', () => { let a = +r0.value, b = +r1.value; if (a > b) [a, b] = [b, a]; F.pmin = a > PMIN ? a : null; F.pmax = b < PMAX ? b : null; update(); }); });
  paint();
}

/* ---------- результаты ---------- */
function renderApplied() {
  const ch = [];
  if (F.pmin != null || F.pmax != null) ch.push(['price', '', 'Цена: ' + (F.pmin != null ? 'от ' + E.fmt(F.pmin) + ' ' : '') + (F.pmax != null ? 'до ' + E.fmt(F.pmax) + ' ' : '') + '₽']);
  F.brand.forEach(b => ch.push(['brand', b, E.esc(b)]));
  F.color.forEach(c => ch.push(['color', c, 'Цвет: ' + E.esc(c)]));
  F.size.forEach(s => ch.push(['size', s, 'Размер ' + s]));
  if (F.rating) ch.push(['rating', '', 'Рейтинг от ' + E.rate(F.rating)]);
  if (F.days) ch.push(['days', '', DAYS.find(d => d[0] === F.days)[1]]);
  if (F.disc) ch.push(['disc', '', 'Скидка от ' + F.disc + '%']);
  F.feat.forEach(f => ch.push(['feat', f, E.FLAGS[f]]));
  app.hidden = !ch.length;
  app.innerHTML = ch.map(([k, v, t]) => `<button type="button" class="chip" data-rm="${k}" data-v="${E.esc(v)}" aria-label="Убрать фильтр ${E.esc(t.replace(/<[^>]+>/g, ''))}">${t}${E.icon('close', 'i-16')}</button>`).join('') + (ch.length > 1 ? '<button type="button" class="chip chip-reset" data-freset>Сбросить всё</button>' : '');
  const fc = $('.f-cnt', root); fc.hidden = !activeCount(); fc.textContent = activeCount();
}
function renderResults() {
  const r = results(), n = Math.min(shown, r.length);
  $('.found', root).textContent = r.length && activeCount() ? 'Найдено ' + E.pl(r.length, 'товар', 'товара', 'товаров') : '';
  $('[data-fshow]', root).textContent = r.length ? 'Показать ' + E.pl(r.length, 'товар', 'товара', 'товаров') : 'Ничего не найдено';
  if (!r.length) {
    res.innerHTML = E.empty({ icon: 'filter', title: 'Ничего не подошло', text: 'Под выбранные фильтры нет товаров. Попробуйте ослабить условия или сбросить фильтры.', btns: '<button type="button" class="btn btn-primary" data-freset>Сбросить фильтры</button>' });
    return;
  }
  res.innerHTML = `<div class="grid">${r.slice(0, n).map(p => E.card(p)).join('')}</div>`
    + (r.length > n ? `<div class="more-wrap"><small>Вы посмотрели ${n} из ${E.pl(r.length, 'товара', 'товаров', 'товаров')}</small><div class="prog"><i style="width:${Math.round(n / r.length * 100)}%"></i></div><button type="button" class="btn btn-outline btn-lg" data-more>Показать ещё</button></div>` : (r.length > STEP ? `<div class="more-wrap"><small>Вы посмотрели все ${E.pl(r.length, 'товар', 'товара', 'товаров')}</small></div>` : ''));
}
function syncUrl() {
  const u = new URLSearchParams();
  ['q', 'cat', 'sub', 'seller', 'flag'].forEach(k => { if (B[k]) u.set(k, B[k]); });
  if (F.pmin != null) u.set('pmin', F.pmin); if (F.pmax != null) u.set('pmax', F.pmax);
  [['brand', F.brand], ['color', F.color], ['size', F.size], ['feat', F.feat]].forEach(([k, s]) => { if (s.size) u.set(k, [...s].join(',')); });
  if (F.rating) u.set('rating', F.rating); if (F.days) u.set('days', F.days); if (F.disc) u.set('disc', F.disc);
  if (sort !== (B.q ? 'rel' : 'pop')) u.set('sort', sort);
  const s = u.toString();
  history.replaceState({ n: shown }, '', 'catalog.html' + (s ? '?' + s : ''));
}
function update(keepShown) {
  if (!keepShown) shown = STEP;
  renderFilters(); renderApplied(); renderResults(); syncUrl();
}
function emptySearch() {
  const none = $('[data-none]', root);
  const hits = D.products.filter(p => (p.flags || []).includes('hit')).sort((a, b) => b.sold - a.sold).slice(0, 12);
  none.innerHTML = E.empty({ icon: 'search', title: B.q ? `По запросу «${E.esc(B.q)}» ничего не нашлось` : 'Здесь пока нет товаров', text: 'Проверьте, нет ли опечатки, или попробуйте поискать что-то из популярного:', btns: `<div class="chips" style="justify-content:center">${E.POPULAR.map(x => `<a class="chip" href="${E.url.q(x)}">${x}</a>`).join('')}</div>` })
    + `<section class="sec">${E.secH('Хиты продаж', 'catalog.html?flag=hit')}${E.rail(hits.map(p => E.card(p)).join(''))}</section>`;
  E.initRails(none);
}

/* ---------- события ---------- */
root.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('[data-sort]')) { sort = t.value; update(); return; }
  if (t.matches('[data-pmin],[data-pmax]')) { let a = num($('[data-pmin]', fbody).value), b = num($('[data-pmax]', fbody).value); if (a != null && b != null && a > b) [a, b] = [b, a]; F.pmin = a != null && a > PMIN ? a : null; F.pmax = b != null && b < PMAX ? b : null; update(); return; }
  if (t.name === 'brand') { t.checked ? F.brand.add(t.value) : F.brand.delete(t.value); update(); return; }
  if (t.name === 'feat') { t.checked ? F.feat.add(t.value) : F.feat.delete(t.value); update(); return; }
  if (t.name === 'rating') { F.rating = +t.value; update(); return; }
  if (t.name === 'days') { F.days = +t.value; update(); return; }
  if (t.name === 'disc') { F.disc = +t.value; update(); }
});
root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-pmin],[data-pmax]')) { e.preventDefault(); e.target.blur(); } });
root.addEventListener('input', E.debounce(e => { if (e.target.matches('[data-bq]')) { brandQ = e.target.value; renderFilters(); const i = $('[data-bq]', fbody); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 150));
root.addEventListener('click', e => {
  const t = e.target;
  const gh = t.closest('.fg-h'); if (gh) { const g = gh.parentElement, id = g.dataset.g; g.classList.toggle('closed'); gh.setAttribute('aria-expanded', !g.classList.contains('closed')); g.classList.contains('closed') ? closed.add(id) : closed.delete(id); E.set('fclosed', [...closed]); return; }
  const sw = t.closest('[data-color]'); if (sw) { const c = sw.dataset.color; F.color.has(c) ? F.color.delete(c) : F.color.add(c); update(); return; }
  const sz = t.closest('[data-size-f]'); if (sz) { const s = sz.dataset.sizeF; F.size.has(s) ? F.size.delete(s) : F.size.add(s); update(); return; }
  if (t.closest('[data-ball]')) { brandAll = !brandAll; renderFilters(); return; }
  const cl = t.closest('[data-clear]'); if (cl) { F[cl.dataset.clear] = 0; update(); return; }
  const rm = t.closest('[data-rm]');
  if (rm) { const k = rm.dataset.rm, v = rm.dataset.v; if (k === 'price') { F.pmin = F.pmax = null; } else if (F[k] instanceof Set) F[k].delete(v); else F[k] = 0; update(); return; }
  if (t.closest('[data-freset]')) { F.pmin = F.pmax = null; F.brand.clear(); F.color.clear(); F.size.clear(); F.feat.clear(); F.rating = F.days = F.disc = 0; brandQ = ''; update(); return; }
  if (t.closest('[data-more]')) { shown += STEP; renderResults(); syncUrl(); const g = $('.grid', res); const c = g && g.children[shown - STEP]; if (c) { const a = c.querySelector('a.pcard-t'); if (a) a.focus({ preventScroll: true }); } return; }
  if (t.closest('[data-fopen]')) { filters.classList.add('open'); E.lock(true); return; }
  if (t.closest('[data-fclose]')) { filters.classList.remove('open'); E.lock(false); if (t.closest('[data-fshow]')) window.scrollTo({ top: root.offsetTop - 20, behavior: 'smooth' }); return; }
  const fl = t.closest('[data-follow]');
  if (fl) { const id = fl.dataset.follow; let l = E.get('follow', []); const on = !l.includes(id); l = on ? l.concat(id) : l.filter(x => x !== id); E.set('follow', l); fl.className = 'btn ' + (on ? 'btn-outline' : 'btn-primary') + ' seller-follow'; fl.innerHTML = on ? E.icon('check', 'i-18') + 'Вы подписаны' : E.icon('plus', 'i-18') + 'Подписаться'; E.toast(on ? 'Вы подписались на магазин — расскажем о новинках и скидках' : 'Вы отписались от магазина', { icon: 'bell' }); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && filters.classList.contains('open')) { filters.classList.remove('open'); E.lock(false); } });
matchMedia('(min-width: 1024px)').addEventListener('change', m => { if (m.matches && filters.classList.contains('open')) { filters.classList.remove('open'); E.lock(false); } });

if (!base.length) emptySearch(); else update(true);
E.timers();
window.addEventListener('pageshow', e => { if (e.persisted) { E.refreshCards(); E.updateBadges(); } });
})();
