/* Ежевика — корзина */
(() => {
const E = window.EZH, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = $('#cart-root');

const opts = () => ({ promo: E.get('promo', null), berries: !!E.user() && E.get('useberries', false) });
const selItems = () => E.cart.items().filter(x => x.sel !== false);

/* какие единицы товаров «Красоты» идут в подарок (акция 1+1=3) */
function giftMap(items) {
  const units = []; items.forEach(x => { if (x.p.cat === 'beauty') for (let i = 0; i < x.qty; i++) units.push({ k: x.key, v: x.p.price }); });
  units.sort((a, b) => b.v - a.v);
  const m = {}; for (let i = 2; i < units.length; i += 3) m[units[i].k] = (m[units[i].k] || 0) + 1;
  return m;
}

function rowHTML(x, gifts) {
  const p = x.p, sel = x.sel !== false, fav = E.fav.has(p.id), g = gifts[x.key] || 0;
  const seller = E.S[p.seller];
  return `<div class="ci${sel ? '' : ' unsel'}" data-key="${x.key}">
    <label class="check"><input type="checkbox" data-sel="${x.key}"${sel ? ' checked' : ''} aria-label="Выбрать: ${E.esc(p.name)}"></label>
    <a class="ci-ph" href="${E.url.p(p.id)}"><img src="${p.img}" alt="" loading="lazy" width="96" height="128"></a>
    <div class="ci-main">
      <a class="ci-t" href="${E.url.p(p.id)}">${E.esc(p.name)}</a>
      <div class="ci-attr">${x.size ? `<span>Размер: ${E.esc(x.size)}</span>` : ''}${p.color ? `<span>Цвет: ${E.esc(p.color)}</span>` : ''}${seller ? `<span>${E.esc(seller.name)}</span>` : ''}</div>
      ${g ? `<span class="ci-gift">${E.icon('gift', 'i-16')}${g > 1 ? g + ' шт. в подарок' : '1 шт. в подарок'} · 1+1=3</span>` : ''}
      <div class="ci-acts"><button type="button" data-cfav="${p.id}" class="${fav ? 'on' : ''}" aria-pressed="${fav}">${E.icon('heart')}<span>${fav ? 'В избранном' : 'В избранное'}</span></button><button type="button" class="del" data-del="${x.key}">${E.icon('trash')}<span>Удалить</span></button></div>
    </div>
    <div class="ci-qty"><div class="qty"><button type="button" data-cq="-1" data-k="${x.key}" aria-label="Уменьшить количество"${x.qty <= 1 ? ' disabled' : ''}>${E.icon('minus', 'i-18')}</button><span aria-live="polite">${x.qty}</span><button type="button" data-cq="1" data-k="${x.key}" aria-label="Увеличить количество"${x.qty >= 10 ? ' disabled' : ''}>${E.icon('plus', 'i-18')}</button></div></div>
    <div class="ci-pr"><b>${E.money(p.price * x.qty)}</b><s>${E.money(p.old * x.qty)}</s>${x.qty > 1 ? `<div class="ci-each">${E.money(p.price)} за шт.</div>` : ''}</div>
  </div>`;
}

function sumHTML(items, r) {
  const u = E.user(), o = opts(), code = o.promo && E.PROMO[o.promo];
  const rows = [
    [`Товары, ${E.pl(r.count, 'шт.', 'шт.', 'шт.').replace(/\s?шт\.$/, '')} шт.`, E.money(r.goods)],
    r.disc ? ['Скидка', `<span class="minus">${E.money(-r.disc)}</span>`] : null,
    r.gift ? ['Акция 1+1=3', `<span class="minus">${E.money(-r.gift)}</span>`] : null,
    r.promo ? [`Промокод ${E.esc(o.promo)}`, `<span class="minus">${E.money(-r.promo)}</span>`] : null,
    r.berries ? ['Ягодками', `<span class="minus">${E.money(-r.berries)}</span>`] : null,
    ['Доставка в пункт выдачи', '<span class="free">бесплатно</span>'],
  ].filter(Boolean);
  const promo = code
    ? `<div class="promo-ok"><div><b class="pc">${E.icon('check-c', 'i-18')}${E.esc(o.promo)}</b><small>${E.esc(code.title)}</small></div><button type="button" data-promo-x aria-label="Убрать промокод">${E.icon('close', 'i-18')}</button></div>${r.promoErr ? `<div class="promo-err">${E.esc(r.promoErr)}</div>` : ''}`
    : `<form class="promo-f" data-promo-f novalidate><input class="input" name="code" placeholder="Промокод" autocomplete="off" aria-label="Промокод" maxlength="20"><button class="btn btn-outline" type="submit">Применить</button></form><div class="promo-err" data-promo-err hidden></div><div class="promo-hint">Попробуйте: ${['ЕЖЕВИКА', 'ЯГОДА500', 'НОВЫЙГОД'].map(c => `<button type="button" data-try="${c}">${c}</button>`).join(', ')}</div>`;
  const bal = E.berries.balance();
  const berry = u
    ? (bal ? `<label class="berry-sw">${E.berry()}<div><b>Списать ягодки</b><small>${!r.berriesMax ? `На счёте ${E.pl(bal, 'ягодка', 'ягодки', 'ягодок')}` : r.berriesMax < bal ? `Спишем ${E.fmt(r.berriesMax)} из ${E.pl(bal, 'ягодки', 'ягодок', 'ягодок')} — до 30% заказа` : `Спишем все ${E.pl(bal, 'ягодку', 'ягодки', 'ягодок')}: 1 ягодка = 1 ₽`}</small></div><span class="switch"><input type="checkbox" data-berries${o.berries ? ' checked' : ''}${r.berriesMax ? '' : ' disabled'} aria-label="Списать ягодки"></span></label>`
      : `<div class="berry-sw">${E.berry()}<div><b>Ягодок пока нет</b><small>Начислим ${E.pl(r.earn, 'ягодку', 'ягодки', 'ягодок')} за этот заказ</small></div></div>`)
    : `<a class="berry-sw" href="${E.loginUrl()}">${E.berry()}<div><b>Войдите, чтобы списать ягодки</b><small>И получайте кешбэк до 7% с каждой покупки</small></div>${E.icon('chev-r', 'i-20')}</a>`;
  const earn = u ? (r.earn ? `<div class="sum-earn">${E.berry()}<span>Начислим <b>+${E.pl(r.earn, 'ягодку', 'ягодки', 'ягодок')}</b> после получения</span></div>` : '')
    : `<div class="sum-earn">${E.berry()}<span>Кешбэк до <b>${E.pl(Math.floor(r.total * 0.07), 'ягодки', 'ягодок', 'ягодок')}</b> в <a href="club.html">Ягодном клубе</a></span></div>`;
  return `<div class="sum-box">
    <h2>Ваш заказ</h2>
    ${rows.map(([a, b]) => `<div class="sum-row"><span>${a}</span><span>${b}</span></div>`).join('')}
    <div class="sum-total"><span>Итого</span><b>${E.money(r.total)}</b></div>
    ${earn}
    <button type="button" class="btn btn-primary btn-lg btn-block" data-go-co${r.count ? '' : ' disabled'}>${r.count ? 'Перейти к оформлению' : 'Выберите товары'}</button>
    <div class="sum-blk">${promo}</div>
    <div class="sum-blk">${berry}</div>
    <p class="sum-note">Способ и время доставки выберете на следующем шаге. Оформляя заказ, вы принимаете <a href="legal.html?doc=terms">условия</a>.</p>
  </div>`;
}

function render() {
  const all = E.cart.items();
  document.body.classList.toggle('has-cartbar', !!all.length);
  $$('.cart-bar').forEach(b => b.remove());
  if (!all.length) return renderEmpty();
  const items = all.filter(x => x.sel !== false), r = E.calc(items, opts()), gifts = giftMap(items), pt = E.point();
  const groups = {}; all.forEach(x => { (groups[x.p.days] = groups[x.p.days] || []).push(x); });
  const allSel = all.every(x => x.sel !== false), anySel = all.some(x => x.sel !== false);
  const beautyUnits = items.filter(x => x.p.cat === 'beauty').reduce((s, x) => s + x.qty, 0);
  const left = beautyUnits && beautyUnits % 3 ? 3 - beautyUnits % 3 : 0;
  root.innerHTML = `${E.crumbs([['Корзина']])}
  <div class="page-h"><h1>Корзина</h1><span class="cnt">${E.pl(E.cart.count(), 'товар', 'товара', 'товаров')}</span></div>
  <div class="cart-l">
    <div class="cart-main">
      <div class="cart-box">
        <div class="cart-top"><label class="check"><input type="checkbox" data-all${allSel ? ' checked' : ''}><span>Выбрать все</span></label><button type="button" class="link-btn danger" data-del-sel${anySel ? '' : ' disabled'}>${E.icon('trash', 'i-18')}Удалить выбранные</button></div>
        <div class="c-dlv">${E.icon('pin')}<div>Пункт выдачи: <b>${E.esc(pt.addr)}</b>, ${E.esc(pt.city)} · <span class="free-t">бесплатно</span></div><button type="button" class="link-btn" data-act="pickup">Изменить</button></div>
        ${left ? `<div class="c-promo">${E.icon('gift')}<div><b>Акция 1+1=3 на красоту</b>Добавьте ещё ${E.pl(left, 'товар', 'товара', 'товаров')} из раздела «Красота» — самый недорогой будет в подарок</div><a class="link-btn" href="catalog.html?cat=beauty">Выбрать</a></div>` : ''}
        ${Object.keys(groups).sort((a, b) => a - b).map(d => `<div class="cgroup-h">${E.icon('truck')}Доставка ${E.dayLow(+d)}<span>${E.pl(groups[d].reduce((s, x) => s + x.qty, 0), 'товар', 'товара', 'товаров')}</span></div>${groups[d].map(x => rowHTML(x, gifts)).join('')}`).join('')}
      </div>
    </div>
    <aside class="cart-side" aria-label="Итого">${sumHTML(items, r)}</aside>
  </div>
  <div class="c-recs" data-recs></div>`;
  document.body.insertAdjacentHTML('beforeend', `<div class="cart-bar"><div><b>${E.money(r.total)}</b><span>${E.pl(r.count, 'товар', 'товара', 'товаров')}${r.disc + r.gift + r.promo ? ' · выгода ' + E.money(r.disc + r.gift + r.promo + r.berries) : ''}</span></div><button type="button" class="btn btn-primary" data-go-co${r.count ? '' : ' disabled'}>Оформить</button></div>`);
  renderRecs(all);
}

function renderEmpty() {
  const u = E.user();
  root.innerHTML = `${E.crumbs([['Корзина']])}
  ${E.empty({ icon: 'bag', title: 'В корзине пока пусто', text: u ? 'Загляните на главную — там хиты и скидки дня. Или найдите нужное через поиск.' : 'Войдите, чтобы увидеть товары, которые вы добавляли раньше, — или начните покупки с главной.', btns: u ? '<a class="btn btn-primary btn-lg" href="index.html">На главную</a><a class="btn btn-secondary btn-lg" href="catalog.html?flag=discount">Скидки дня</a>' : `<a class="btn btn-primary btn-lg" href="${E.loginUrl()}">Войти</a><a class="btn btn-secondary btn-lg" href="index.html">На главную</a>` })}
  <div class="c-recs" data-recs></div>`;
  renderRecs([]);
}

function renderRecs(all) {
  const box = $('[data-recs]'); if (!box) return;
  const inCart = new Set(all.map(x => x.p.id)), cats = new Set(all.map(x => x.p.cat));
  const pool = E.cart && Object.values(E.P).filter(p => !inCart.has(p.id));
  let recs = pool.filter(p => cats.has(p.cat)).sort((a, b) => b.sold - a.sold);
  if (recs.length < 12) recs = recs.concat(pool.filter(p => !cats.has(p.cat) && p.flags && p.flags.includes('hit')).sort((a, b) => b.sold - a.sold));
  const fav = E.fav.list().map(x => E.P[x.id]).filter(p => !inCart.has(p.id));
  const rec = E.recent.list().filter(p => !inCart.has(p.id));
  box.innerHTML = (fav.length ? `<section class="sec">${E.secH('Из избранного', 'favorites.html', 'Всё избранное')}${E.rail(fav.slice(0, 12).map(p => E.card(p)).join(''))}</section>` : '')
    + `<section class="sec">${E.secH(all.length ? 'Добавьте к заказу' : 'Хиты Ежевики', all.length ? '' : 'catalog.html?flag=hit')}${E.rail(recs.slice(0, 12).map(p => E.card(p)).join(''))}</section>`
    + (rec.length ? `<section class="sec">${E.secH('Вы недавно смотрели')}${E.rail(rec.slice(0, 12).map(p => E.card(p)).join(''))}</section>` : '');
  E.initRails(box);
}

/* ---------- действия ---------- */
const removeWithUndo = keys => {
  const before = E.cart.raw();
  E.cart.remove(keys);
  E.toast(keys.length > 1 ? `Удалено: ${E.pl(keys.length, 'товар', 'товара', 'товаров')}` : 'Товар удалён из корзины', { icon: 'trash', action: ['Вернуть', () => E.cart.save(before)] });
};
const goCheckout = () => {
  if (!selItems().length) return;
  location.href = E.user() ? 'checkout.html' : E.loginUrl('checkout.html');
};
const applyPromo = (val, form) => {
  const err = $('[data-promo-err]'), c = E.promoCode(val);
  if (!String(val || '').trim()) { if (err) { err.hidden = false; err.textContent = 'Введите промокод'; } return; }
  if (!c) { if (err) { err.hidden = false; err.textContent = 'Промокод не найден или срок его действия истёк'; } if (form) form.code.focus(); return; }
  E.set('promo', c);
  const r = E.calc(selItems(), opts());
  E.toast(r.promoErr ? 'Промокод сохранён, но пока не применён' : 'Промокод применён: −' + E.money(r.promo).replace('−', ''), { icon: r.promoErr ? 'info' : 'check' });
};

document.addEventListener('click', e => {
  const t = e.target;
  const q = t.closest('[data-cq]'); if (q) { const it = E.cart.raw().find(x => E.ck(x.id, x.size) === q.dataset.k); if (it) E.cart.set(q.dataset.k, it.qty + +q.dataset.cq); return; }
  const d = t.closest('[data-del]'); if (d) { removeWithUndo([d.dataset.del]); return; }
  if (t.closest('[data-del-sel]')) {
    const keys = selItems().map(x => x.key); if (!keys.length) return;
    E.confirm({ title: 'Удалить выбранные товары?', text: `Из корзины будет удалено ${E.pl(keys.length, 'позиция', 'позиции', 'позиций')}. Их можно будет вернуть сразу после удаления.`, ok: 'Удалить', danger: true, onOk: () => removeWithUndo(keys) });
    return;
  }
  const f = t.closest('[data-cfav]'); if (f) { E.fav.toggle(f.dataset.cfav); return; }
  if (t.closest('[data-go-co]')) { goCheckout(); return; }
  if (t.closest('[data-promo-x]')) { E.set('promo', null); E.toast('Промокод убран', { icon: 'info' }); return; }
  const tr = t.closest('[data-try]'); if (tr) { applyPromo(tr.dataset.try); return; }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('[data-sel]')) E.cart.sel(t.dataset.sel, t.checked);
  else if (t.matches('[data-all]')) E.cart.sel('*', t.checked);
  else if (t.matches('[data-berries]')) E.set('useberries', t.checked);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-promo-f]'); if (!f) return;
  e.preventDefault(); applyPromo(f.code.value, f);
});
document.addEventListener('input', e => { if (e.target.closest('[data-promo-f]')) { const err = $('[data-promo-err]'); if (err) err.hidden = true; } });

['cart', 'fav', 'promo', 'useberries', 'point', 'session'].forEach(k => E.on(k, render));
render();
})();
