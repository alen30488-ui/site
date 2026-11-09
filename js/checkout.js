/* Ежевика — оформление заказа */
(() => {
const E = window.EZH, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = $('#co-root'), DAY = E.DAY, NB = '\u00a0', esc = E.esc, money = E.money, pl = E.pl;
const ps = E.params();
const doneNum = ps.get('done');

if (!E.requireAuth()) return;

/* ---------- состояние (переживает перезагрузку вкладки) ---------- */
const SS = window.sessionStorage;
const st = Object.assign({ type: 'pickup', addr: null, day: 0, slot: 3, pay: null, rec: null }, (() => { try { return JSON.parse(SS.getItem('ezh:co') || '{}'); } catch (e) { return {}; } })());
const save = () => { try { SS.setItem('ezh:co', JSON.stringify(st)); } catch (e) { /* нет хранилища */ } };

const SLOTS = ['09:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00', '21:00–23:00'];
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const BR = { visa: 'VISA', mir: 'МИР', mc: 'MC' }, BRN = { visa: 'Visa', mir: 'МИР', mc: 'Mastercard' };
const luhn = n => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return s % 10 === 0; };
const brandOf = d => d[0] === '4' ? 'visa' : d[0] === '2' ? 'mir' : d[0] === '5' ? 'mc' : '';
const digits = s => String(s || '').replace(/\D/g, '');

const items = () => E.cart.items().filter(x => x.sel !== false);
const opts = () => ({ promo: E.get('promo', null), berries: E.get('useberries', false), courier: st.type === 'courier' });
const calc = () => E.calc(items(), opts());
const addrs = () => E.get('addresses', { points: [], courier: [] });
const courierList = () => addrs().courier || [];
const cards = () => E.get('cards', []);
const maxDays = () => Math.max(1, ...items().map(x => x.p.days));
const dayList = () => Array.from({ length: 7 }, (_, i) => maxDays() + i);
const curAddr = () => { const l = courierList(); return l.find(c => c.id === st.addr) || l.find(c => c.def) || l[0] || null; };
const addrStr = c => `${c.city}, ${c.street}${c.apt ? ', ' + (/^\d/.test(c.apt) ? 'кв.' + NB + c.apt : c.apt) : ''}`;
const addrMeta = c => [c.entrance && 'подъезд ' + c.entrance, c.floor && 'этаж ' + c.floor, c.intercom && 'домофон ' + c.intercom, c.comment].filter(Boolean).join(' · ') || 'Без уточнений для курьера';
const payDefault = () => { const c = cards(); return c.length ? 'card:' + (c.find(x => x.def) || c[0]).id : 'sbp'; };
const payKey = () => { const c = cards(); if (!st.pay || (st.pay.startsWith('card:') && !c.some(x => 'card:' + x.id === st.pay))) st.pay = payDefault(); return st.pay; };
const ptIc = p => `<span class="pt-ic${p.type === 'Постамат' ? ' locker' : ''}">${p.type === 'Постамат' ? E.icon('box', 'i-20') : E.berry()}</span>`;
const dayOf = n => { const d = E.addDays(n); return { d, wd: WD[d.getDay()], dm: d.getDate() + NB + MS[d.getMonth()] }; };
const dlvText = () => {
  if (st.type === 'courier') { const n = dayList()[st.day] || maxDays(); return `${E.dayLabel(n)}, ${SLOTS[st.slot] || SLOTS[3]}`; }
  return 'Доставим ' + E.dayLow(maxDays());
};

/* ---------- 1. способ получения ---------- */
function dlvHTML() {
  const r = calc(), pt = E.point(), saved = (addrs().points || []).filter(id => E.PT[id] && id !== pt.id).slice(0, 3);
  const cour = st.type === 'courier', c = curAddr(), cFree = r.sum - r.gift - r.promo >= 1000;
  if (cour && c) st.addr = c.id;
  return `<h2><span class="step-n">1</span>Способ получения</h2>
  <div class="opts" role="radiogroup" aria-label="Способ получения">
    <label class="opt${cour ? '' : ' on'}"><input type="radio" name="dtype" value="pickup"${cour ? '' : ' checked'}><span class="opt-ic">${E.icon('store')}</span><div><b>В пункт выдачи</b><span>Доставим ${E.dayLow(maxDays())} · хранение 7 дней</span></div><span class="opt-pr free">бесплатно</span></label>
    <label class="opt${cour ? ' on' : ''}"><input type="radio" name="dtype" value="courier"${cour ? ' checked' : ''}><span class="opt-ic">${E.icon('truck')}</span><div><b>Курьером</b><span>${E.dayLabel(maxDays())} или позже, в удобный интервал</span></div><span class="opt-pr${cFree ? ' free' : ''}">${cFree ? 'бесплатно' : money(99)}</span></label>
  </div>
  ${cour ? `<div class="co-courier">
    <div><div class="co-lbl">Адрес доставки</div>
      <div class="addr-list" role="radiogroup" aria-label="Адрес доставки">${courierList().map(a => `<label class="co-addr${c && a.id === c.id ? ' on' : ''}"><input type="radio" name="caddr" value="${a.id}"${c && a.id === c.id ? ' checked' : ''}><span class="pt-ic">${E.icon('home', 'i-20')}</span><div><b>${esc(addrStr(a))}</b><small>${esc(addrMeta(a))}</small></div><button type="button" class="icon-btn" data-editaddr="${a.id}" aria-label="Изменить адрес">${E.icon('edit', 'i-18')}</button><span class="rd" aria-hidden="true"></span></label>`).join('')}
        <button type="button" class="co-addr co-addr-add" data-addaddr><span class="pt-ic">${E.icon('plus', 'i-20')}</span><div><b>Добавить адрес</b><small>Улица, дом, квартира и подсказки курьеру</small></div></button></div></div>
    <div><div class="co-lbl">Дата доставки</div><div class="day-chips" role="radiogroup" aria-label="Дата доставки">${dayList().map((n, i) => { const d = dayOf(n); return `<button type="button" class="day${i === st.day ? ' on' : ''}" data-day="${i}" role="radio" aria-checked="${i === st.day}"><span>${n === 1 ? 'завтра' : d.wd}</span><b>${d.dm}</b></button>`; }).join('')}</div></div>
    <div><div class="co-lbl">Время доставки</div><div class="slots" role="radiogroup" aria-label="Время доставки">${SLOTS.map((s, i) => `<button type="button" class="chip${i === st.slot ? ' on' : ''}" data-slot="${i}" role="radio" aria-checked="${i === st.slot}">${s}</button>`).join('')}</div></div>
    <div class="note">${E.icon('info')}<div>Курьер позвонит за 30–60 минут до приезда. Можно проверить товар при получении и сразу отказаться от неподошедшего.</div></div>
  </div>` : `<div class="co-pt">${ptIc(pt)}<div><b>${esc(pt.addr)}</b><span>${esc(pt.city)} · ${esc(pt.type)} · ${esc(pt.hours)}${pt.metro ? ' · ' + esc(pt.metro) : ''}</span><span class="co-pt-r">${E.STAR}${E.rate(pt.rating)} · примерка и возврат на месте</span></div><button type="button" class="btn btn-outline btn-sm" data-pick>Изменить</button></div>
    ${saved.length ? `<div class="co-saved"><span>Мои пункты:</span>${saved.map(id => `<button type="button" class="chip" data-setpt="${id}">${E.icon('pin')}${esc(E.PT[id].addr)}</button>`).join('')}</div>` : ''}`}`;
}

/* ---------- 2. товары ---------- */
function itemsHTML() {
  const l = items(), n = l.reduce((s, x) => s + x.qty, 0);
  const thumb = x => `<a class="co-thumb" href="${E.url.p(x.p.id)}" title="${esc(x.p.name)}"><img src="${x.p.img}" alt="" loading="lazy">${x.qty > 1 ? `<b>×${x.qty}</b>` : ''}</a>`;
  let groups;
  if (st.type === 'courier') groups = [[`Привезём ${dlvText().replace(/^./, ch => ch.toLowerCase())}`, l]];
  else { const g = {}; l.forEach(x => { (g[x.p.days] = g[x.p.days] || []).push(x); }); groups = Object.keys(g).sort((a, b) => a - b).map(d => [`Доставим в пункт ${E.dayLow(+d)}`, g[d]]); }
  return `<h2><span class="step-n">2</span>Товары<span class="h-cnt">${pl(n, 'товар', 'товара', 'товаров')}</span><a class="link-btn" href="cart.html">Изменить</a></h2>
  <div class="co-items">${groups.map(([t, g]) => `<div><div class="co-group-h">${E.icon('truck')}<b>${t}</b><span>${pl(g.reduce((s, x) => s + x.qty, 0), 'товар', 'товара', 'товаров')}</span></div><div class="co-thumbs">${g.map(thumb).join('')}</div></div>`).join('')}</div>
  <details class="co-det"><summary>Состав заказа${E.icon('chev-d', 'i-18')}</summary>
    ${l.map(x => `<div class="co-li"><img src="${x.p.img}" alt="" loading="lazy"><div>${esc(x.p.name)}<span>${[x.size && 'Размер ' + esc(x.size), x.qty + NB + 'шт.', esc((E.S[x.p.seller] || {}).name || '')].filter(Boolean).join(' · ')}</span></div><b>${money(x.p.price * x.qty)}</b></div>`).join('')}</details>`;
}

/* ---------- 3. получатель ---------- */
function recHTML() {
  const u = E.user(), r = st.rec || { name: u.name, surname: u.surname, phone: E.phone(u.phone), email: u.email };
  return `<h2><span class="step-n">3</span>Получатель</h2>
  <form class="co-rec" data-rec novalidate autocomplete="on">
    <div class="f-row2"><div class="field"><label for="co-name">Имя</label><input class="input" id="co-name" name="name" autocomplete="given-name" value="${esc(r.name || '')}"></div><div class="field"><label for="co-sur">Фамилия</label><input class="input" id="co-sur" name="surname" autocomplete="family-name" value="${esc(r.surname || '')}"></div></div>
    <div class="f-row2 co-contacts"><div class="field"><label for="co-phone">Телефон</label><input class="input" id="co-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 999 123-45-67" value="${esc(r.phone || '')}"></div><div class="field"><label for="co-email">Почта для чека</label><input class="input" id="co-email" name="email" type="email" autocomplete="email" value="${esc(r.email || '')}"></div></div>
    <p class="field-hint">${E.icon('phone', 'i-16')}На этот номер придёт SMS с кодом получения, а чек — на почту.</p>
  </form>`;
}

/* ---------- 4. оплата ---------- */
function payHTML() {
  const k = payKey(), r = calc(), cs = cards(), split = Math.ceil(r.total / 4);
  const row = (val, ic, t, s, extra = '') => `<label class="pay-row${k === val ? ' on' : ''}"><input type="radio" name="pay" value="${val}"${k === val ? ' checked' : ''}>${ic}<div class="pr-t"><b>${t}</b><small${extra}>${s}</small></div><span class="rd" aria-hidden="true"></span></label>`;
  return `<h2><span class="step-n">4</span>Способ оплаты</h2>
  <div class="paylist" role="radiogroup" aria-label="Способ оплаты">
    ${cs.map(c => row('card:' + c.id, `<span class="cb cb-${c.brand}">${BR[c.brand]}</span>`, `${BRN[c.brand]} ••••${NB}${c.last4}`, `${c.def ? 'Основная · ' : ''}действует до ${c.exp}`)).join('')}
    ${row('new', `<span class="cb cb-new">${E.icon('plus')}</span>`, 'Новая карта', 'Visa, Mastercard, МИР')}
    ${k === 'new' ? `<div class="newcard-w" data-newcard><div class="newcard">
        <div class="field"><label for="nc-n">Номер карты</label><input class="input" id="nc-n" name="num" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="19"></div>
        <div class="field"><label for="nc-e">Срок</label><input class="input" id="nc-e" name="exp" inputmode="numeric" autocomplete="cc-exp" placeholder="ММ/ГГ" maxlength="5"></div>
        <div class="field"><label for="nc-c">CVC</label><input class="input" id="nc-c" name="cvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="•••" maxlength="3"></div></div>
      <label class="check"><input type="checkbox" name="savecard" checked><span>Сохранить карту для следующих покупок</span></label>
      <p class="field-hint">Демо: подойдёт номер 4242 4242 4242 4242, любой будущий срок и любой CVC. Деньги не списываются.</p></div>` : ''}
    ${row('sbp', `<span class="cb cb-sbp">СБП</span>`, 'СБП', 'Подтвердите оплату в приложении банка')}
    ${row('split', `<span class="cb cb-split">${E.icon('cal')}</span>`, 'Ежевика Сплит', `4 платежа по ${money(split)} — без переплаты`, ' data-split')}
    ${row('cash', `<span class="cb cb-cash">${E.icon('cash')}</span>`, 'При получении', st.type === 'courier' ? 'Картой или наличными курьеру' : 'Картой или наличными в пункте выдачи')}
  </div>`;
}

/* ---------- итог ---------- */
function payLabel(r) {
  const k = payKey();
  if (k === 'cash') return 'Подтвердить заказ';
  if (k === 'split') return `Оплатить ${money(Math.ceil(r.total / 4))} сейчас`;
  return 'Оплатить ' + money(r.total);
}
function sumHTML() {
  const r = calc(), o = opts(), code = o.promo && E.PROMO[o.promo], bal = E.berries.balance();
  const rows = [
    [`Товары, ${r.count}${NB}шт.`, money(r.goods)],
    r.disc ? ['Скидка', `<span class="minus">${money(-r.disc)}</span>`] : null,
    r.gift ? ['Акция 1+1=3', `<span class="minus">${money(-r.gift)}</span>`] : null,
    r.promo ? [`Промокод ${esc(o.promo)}`, `<span class="minus">${money(-r.promo)}</span>`] : null,
    r.berries ? ['Ягодками', `<span class="minus">${money(-r.berries)}</span>`] : null,
    [st.type === 'courier' ? 'Доставка курьером' : 'Доставка в пункт выдачи', r.delivery ? money(r.delivery) : '<span class="free">бесплатно</span>'],
  ].filter(Boolean);
  const promo = code
    ? `<div class="promo-ok"><div><b class="pc">${E.icon('check-c', 'i-18')}${esc(o.promo)}</b><small>${esc(code.title)}</small></div><button type="button" data-promo-x aria-label="Убрать промокод">${E.icon('close', 'i-18')}</button></div>${r.promoErr ? `<div class="promo-err">${esc(r.promoErr)}</div>` : ''}`
    : `<form class="promo-f" data-promo-f novalidate><input class="input" name="code" placeholder="Промокод" autocomplete="off" aria-label="Промокод" maxlength="20"><button class="btn btn-outline" type="submit">Применить</button></form><div class="promo-err" data-promo-err hidden></div>`;
  const berry = bal
    ? `<label class="berry-sw">${E.berry()}<div><b>Списать ягодки</b><small>${!r.berriesMax ? `На счёте ${pl(bal, 'ягодка', 'ягодки', 'ягодок')}` : r.berriesMax < bal ? `Спишем ${E.fmt(r.berriesMax)} из ${pl(bal, 'ягодки', 'ягодок', 'ягодок')} — до 30% заказа` : `Спишем все ${pl(bal, 'ягодку', 'ягодки', 'ягодок')}: 1 ягодка = 1 ₽`}</small></div><span class="switch"><input type="checkbox" data-berries${o.berries ? ' checked' : ''}${r.berriesMax ? '' : ' disabled'} aria-label="Списать ягодки"></span></label>`
    : `<div class="berry-sw">${E.berry()}<div><b>Ягодок пока нет</b><small>Начислим ${pl(r.earn, 'ягодку', 'ягодки', 'ягодок')} за этот заказ</small></div></div>`;
  const hint = st.type === 'courier' && r.delivery ? `<div class="co-hint">${E.icon('truck', 'i-18')}Добавьте товаров ещё на ${money(1000 - (r.sum - r.gift - r.promo))} — доставка курьером станет бесплатной</div>` : '';
  return `<div class="sum-box co-sum">
    <h2>Ваш заказ</h2>
    ${rows.map(([a, b]) => `<div class="sum-row"><span>${a}</span><span>${b}</span></div>`).join('')}
    ${hint}
    <div class="sum-total"><span>Итого</span><b>${money(r.total)}</b></div>
    ${r.earn ? `<div class="sum-earn">${E.berry()}<span>Начислим <b>+${pl(r.earn, 'ягодку', 'ягодки', 'ягодок')}</b> после получения</span></div>` : ''}
    <div class="note note-err co-err" data-coerr hidden>${E.icon('alert')}<div></div></div>
    <button type="button" class="btn btn-primary btn-lg btn-block" data-pay>${payLabel(r)}</button>
    <p class="sum-note">Нажимая кнопку, вы принимаете <a href="legal.html?doc=terms" target="_blank">условия покупки</a> и <a href="legal.html?doc=privacy" target="_blank">политику обработки данных</a></p>
    <div class="sum-blk">${promo}</div>
    <div class="sum-blk">${berry}</div>
    <div class="co-safe">${E.icon('shield', 'i-18')}<span>Безопасная оплата: данные карты передаются по защищённому соединению</span></div>
  </div>`;
}
function barHTML() {
  const r = calc();
  return `<div><b>${money(r.total)}</b><span>${pl(r.count, 'товар', 'товара', 'товаров')} · ${esc(dlvText())}</span></div><button type="button" class="btn btn-primary" data-pay>${payKey() === 'cash' ? 'Подтвердить' : 'Оплатить'}</button>`;
}

/* ---------- отрисовка ---------- */
let doneView = false;
const sec = id => doneView ? null : $('#' + id);
function renderDlv() { const s = sec('co-dlv'); if (s) s.innerHTML = dlvHTML(); }
function renderItems() { const s = sec('co-items'); if (s) s.innerHTML = itemsHTML(); }
function renderPay() { const s = sec('co-pay'); if (s) s.innerHTML = payHTML(); }
function renderSum() {
  const s = sec('co-side'); if (!s) return;
  const pf = $('[data-promo-f] input', s), pv = pf && pf.value, foc = pf && document.activeElement === pf;
  s.innerHTML = sumHTML();
  if (pv) { const n = $('[data-promo-f] input', s); if (n) { n.value = pv; if (foc) n.focus(); } }
  const sp = $('[data-split]'); if (sp) sp.textContent = `4 платежа по ${money(Math.ceil(calc().total / 4))} — без переплаты`;
  let bar = $('.co-bar'); if (!bar) { bar = document.createElement('div'); bar.className = 'co-bar'; document.body.appendChild(bar); }
  bar.innerHTML = barHTML(); document.body.classList.add('has-cobar');
}
function renderAll() {
  if (doneView) return;
  save();
  const all = E.cart.items(), l = items();
  if (!l.length) {
    $$('.co-bar').forEach(b => b.remove()); document.body.classList.remove('has-cobar');
    root.innerHTML = `${E.crumbs([['Корзина', 'cart.html'], ['Оформление заказа']])}${E.empty({ icon: 'bag', title: all.length ? 'Выберите товары для заказа' : 'Оформлять пока нечего', text: all.length ? 'Отметьте в корзине товары, которые хотите заказать сейчас, — остальные подождут там же.' : 'Корзина пуста. Добавьте товары — и возвращайтесь к оформлению.', btns: all.length ? '<a class="btn btn-primary btn-lg" href="cart.html">В корзину</a>' : '<a class="btn btn-primary btn-lg" href="index.html">На главную</a><a class="btn btn-secondary btn-lg" href="catalog.html?flag=discount">Скидки дня</a>' })}`;
    return;
  }
  root.innerHTML = `${E.crumbs([['Корзина', 'cart.html'], ['Оформление заказа']])}
  <div class="page-h"><h1>Оформление заказа</h1><a class="link-btn co-backl" href="cart.html">${E.icon('chev-l', 'i-18')}Вернуться в корзину</a></div>
  <div class="co">
    <div class="co-main">
      <section class="co-sec" id="co-dlv"></section>
      <section class="co-sec" id="co-items"></section>
      <section class="co-sec" id="co-rec">${recHTML()}</section>
      <section class="co-sec" id="co-pay"></section>
    </div>
    <aside class="co-side" id="co-side" aria-label="Итого"></aside>
  </div>`;
  renderDlv(); renderItems(); renderPay(); renderSum();
  E.maskPhone($('#co-phone'));
}

/* ---------- адрес курьера ---------- */
function addrModal(id) {
  const a = addrs(), c = (a.courier || []).find(x => x.id === id) || { city: E.point().city };
  const fld = (n, l, ph = '') => `<div class="field"><label for="ad-${n}">${l}</label><input class="input" id="ad-${n}" name="${n}" value="${esc(c[n] || '')}" placeholder="${ph}"></div>`;
  const m = E.modal({ title: id ? 'Изменить адрес' : 'Новый адрес', html: `<form class="m-form" data-af novalidate>
    <div class="field"><label for="ad-city">Город</label><select class="input" id="ad-city" name="city">${E.cities().map(x => `<option${x === c.city ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
    ${fld('street', 'Улица и дом', 'ул. Тверская, 7')}
    <div class="f-row4">${fld('apt', 'Квартира / офис')}${fld('entrance', 'Подъезд')}${fld('floor', 'Этаж')}${fld('intercom', 'Домофон')}</div>
    ${fld('comment', 'Комментарий курьеру', 'Например: позвонить за 30 минут')}
    <label class="check"><input type="checkbox" name="def"${c.def || !(a.courier || []).length ? ' checked' : ''}><span>Сделать основным</span></label></form>`,
  foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-asave>Сохранить</button>' });
  const f = $('[data-af]', m.el);
  f.addEventListener('input', e => E.fieldErr(e.target, ''));
  f.addEventListener('submit', e => { e.preventDefault(); $('[data-asave]', m.el).click(); });
  $('[data-asave]', m.el).addEventListener('click', () => {
    const v = n => f[n].value.trim();
    if (v('street').length < 5 || !/\d/.test(v('street'))) { E.fieldErr(f.street, 'Укажите улицу и номер дома'); f.street.focus(); return; }
    const n = { id: id || 'a' + Date.now(), city: v('city'), street: v('street'), apt: v('apt'), entrance: v('entrance'), floor: v('floor'), intercom: v('intercom'), comment: v('comment'), def: f.def.checked };
    let l = (a.courier || []).slice();
    if (n.def) l.forEach(x => { x.def = false; });
    l = id ? l.map(x => x.id === id ? n : x) : l.concat(n);
    if (!l.some(x => x.def)) l[0].def = true;
    E.set('addresses', Object.assign(a, { courier: l }));
    st.addr = n.id; m.close(); E.toast(id ? 'Адрес обновлён' : 'Адрес добавлен', { icon: 'home' });
    renderDlv(); renderItems(); renderSum();
  });
}

/* ---------- проверка и оплата ---------- */
function showErr(msg) { const n = $('[data-coerr]'); if (!n) return; n.hidden = !msg; $('div', n).textContent = msg || ''; }
function readRec() {
  const f = $('[data-rec]'); if (!f) return st.rec;
  st.rec = { name: f.name.value.trim(), surname: f.surname.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim() };
  return st.rec;
}
function validate() {
  const errs = [];
  if (st.type === 'courier' && !curAddr()) errs.push(['co-dlv', 'Добавьте адрес доставки для курьера', $('[data-addaddr]')]);
  const r = readRec(), f = $('[data-rec]');
  const fe = [['name', r.name ? '' : 'Укажите имя'], ['phone', digits(r.phone).length === 11 ? '' : 'Введите номер телефона полностью'], ['email', !r.email || E.validEmail(r.email) ? '' : 'Проверьте адрес почты']];
  fe.forEach(([k, m]) => E.fieldErr(f[k], m));
  const bad = fe.find(x => x[1]); if (bad) errs.push(['co-rec', 'Проверьте данные получателя', f[bad[0]]]);
  let card = null;
  if (payKey() === 'new') {
    const w = $('[data-newcard]'), num = $('[name=num]', w), exp = $('[name=exp]', w), cvc = $('[name=cvc]', w);
    const d = digits(num.value), [mm, yy] = exp.value.split('/').map(Number), now = new Date();
    const ce = [[num, d.length === 16 && luhn(d) && brandOf(d) ? '' : 'Проверьте номер карты'],
      [exp, mm && mm <= 12 && yy && (2000 + yy) * 12 + mm >= now.getFullYear() * 12 + now.getMonth() + 1 ? '' : 'Проверьте срок'],
      [cvc, cvc.value.length === 3 ? '' : '3 цифры']];
    ce.forEach(([i, m]) => E.fieldErr(i, m));
    const cb = ce.find(x => x[1]);
    if (cb) errs.push(['co-pay', 'Проверьте данные карты', cb[0]]);
    else card = { brand: brandOf(d), last4: d.slice(-4), exp: exp.value, save: $('[name=savecard]', w).checked };
  }
  if (errs.length) {
    const [id, msg, el] = errs[0];
    showErr(errs.length > 1 ? msg + ' и другие поля выше' : msg);
    if (matchMedia('(max-width:1023px)').matches) E.toast(msg, { icon: 'alert' });
    sec(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (el && el.focus) setTimeout(() => el.focus({ preventScroll: true }), 350);
    sec(id).classList.remove('co-shake'); void sec(id).offsetWidth; sec(id).classList.add('co-shake');
    return null;
  }
  showErr('');
  return { card };
}

function sbpModal(total, onPaid) {
  const banks = ['Сбербанк', 'Т-Банк', 'ВТБ', 'Альфа-Банк', 'Газпромбанк', 'Райффайзен'];
  const m = E.modal({ title: 'Оплата через СБП', cls: 'm-sbp', html: `<div class="sbp">
    <div class="sbp-qr">${E.qr('sbp' + total + Date.now())}</div>
    <div class="sbp-t"><div class="sbp-sum">${money(total)}</div><p>Отсканируйте QR-код камерой телефона или выберите банк — откроется приложение с готовым платежом.</p>
      <div class="chips">${banks.map(b => `<button type="button" class="chip" data-bank>${b}</button>`).join('')}</div></div></div>
    <p class="field-hint">Демо: нажмите на любой банк или «Я оплатил(а)» — деньги не списываются.</p>`,
  foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-sbpok>Я оплатил(а)</button>' });
  m.el.addEventListener('click', e => { if (e.target.closest('[data-bank],[data-sbpok]')) { m.close(); onPaid(); } });
}

function processing(text, ms, cb) {
  const ov = document.createElement('div'); ov.className = 'processing'; ov.setAttribute('role', 'status');
  ov.innerHTML = `<div class="spinner"></div><span>${text}</span>`;
  document.body.appendChild(ov); E.lock(true);
  setTimeout(() => { E.lock(false); ov.remove(); cb(); }, ms);
}

function place() {
  const v = validate(); if (!v) return;
  const r = calc(), k = payKey(), go = () => processing(k === 'cash' ? 'Подтверждаем заказ…' : k === 'split' ? 'Оформляем оплату частями…' : 'Проводим оплату…', k === 'cash' ? 900 : 1500, () => finish(v, r));
  if (k === 'sbp') sbpModal(r.total, go); else go();
}

function finish(v, r) {
  const l = items(), k = payKey(), o = opts(), num = E.newOrderNum(), rec = readRec();
  const n = st.type === 'courier' ? (dayList()[st.day] || maxDays()) : maxDays();
  const slot = SLOTS[st.slot] || SLOTS[3];
  const dlv = E.addDays(n); dlv.setHours(st.type === 'courier' ? +slot.slice(0, 2) : 14, 0, 0, 0);
  let cardLabel = null;
  if (k.startsWith('card:')) { const c = cards().find(x => 'card:' + x.id === k); if (c) cardLabel = BRN[c.brand] + ' •• ' + c.last4; }
  if (k === 'new' && v.card) {
    cardLabel = BRN[v.card.brand] + ' •• ' + v.card.last4;
    if (v.card.save) { const cs = cards(); cs.push({ id: 'c' + Date.now(), brand: v.card.brand, last4: v.card.last4, exp: v.card.exp, def: !cs.length }); E.set('cards', cs); }
  }
  const c = curAddr();
  const order = {
    num, created: Date.now(),
    items: l.map(x => ({ id: x.p.id, qty: x.qty, size: x.size || null, price: x.p.price, old: x.p.old })),
    type: st.type, point: st.type === 'pickup' ? E.point().id : null,
    address: st.type === 'courier' && c ? addrStr(c) : null, slot: st.type === 'courier' ? slot : null,
    dlv: dlv.getTime(), keep: st.type === 'pickup' ? dlv.getTime() + 7 * DAY : null,
    code: String(1000 + Math.floor(Math.random() * 9000)),
    pay: k.startsWith('card:') || k === 'new' ? 'card' : k, card: cardLabel,
    recipient: { name: (rec.name + ' ' + rec.surname).trim(), phone: '+' + digits(rec.phone) },
    sums: { goods: r.goods, disc: r.disc, promo: r.promo, gift: r.gift, berries: r.berries, delivery: r.delivery, total: r.total },
    promo: r.promo ? o.promo : null, earn: r.earn,
  };
  E.set('orders', E.get('orders', []).concat(order));
  if (r.berries) E.berries.add(-r.berries, 'Оплата заказа ' + num);
  E.cart.remove(l.map(x => x.key));
  if (r.promo) E.set('promo', null);
  E.set('useberries', false);
  st.pay = null; st.rec = null; st.day = 0; try { SS.removeItem('ezh:co'); } catch (e) { /* нет хранилища */ }
  history.replaceState(null, '', 'checkout.html?done=' + encodeURIComponent(num));
  scrollTo(0, 0);
  renderDone(num, true);
}

/* ---------- заказ оформлен ---------- */
function renderDone(num, fresh) {
  doneView = true;
  $$('.co-bar').forEach(b => b.remove()); document.body.classList.remove('has-cobar');
  const o = E.order(num);
  if (!o) { root.innerHTML = `${E.crumbs([['Оформление заказа']])}${E.empty({ icon: 'box', title: 'Заказ не найден', text: 'Возможно, ссылка устарела. Все заказы — в личном кабинете.', btns: '<a class="btn btn-primary btn-lg" href="account.html#orders">Мои заказы</a><a class="btn btn-secondary btn-lg" href="index.html">На главную</a>' })}`; return; }
  const pt = o.point && E.PT[o.point], n = o.items.reduce((s, x) => s + x.qty, 0);
  const payT = o.pay === 'cash' ? `При получении — ${money(o.sums.total)}` : o.pay === 'sbp' ? `СБП — ${money(o.sums.total)}, оплачено` : o.pay === 'split' ? `Ежевика Сплит — первый платёж ${money(Math.ceil(o.sums.total / 4))} списан, ещё 3 раз в две недели` : `${o.card ? 'Карта ' + esc(o.card) : 'Картой'} — ${money(o.sums.total)}, оплачено`;
  document.title = 'Заказ оформлен — Ежевика';
  root.innerHTML = `<div class="success">
    <div class="succ-ic${fresh ? ' pop' : ''}">${E.icon('check')}</div>
    <h1>Заказ оформлен!</h1>
    <p>Номер заказа <b>${o.num}</b>. ${o.type === 'pickup' ? 'Пришлём SMS, когда он приедет в пункт выдачи.' : 'Курьер позвонит за 30–60 минут до приезда.'} Следить за статусом можно в <a href="account.html#orders">личном кабинете</a>.</p>
    <div class="succ-card">
      <div class="succ-row">${E.icon(o.type === 'pickup' ? 'pin' : 'truck')}<div><span>${o.type === 'pickup' ? 'Пункт выдачи' : 'Доставка курьером'}</span><b>${o.type === 'pickup' && pt ? esc(pt.city + ', ' + pt.addr) : esc(o.address || '')}</b><span>${o.type === 'pickup' ? `Доставим ${E.dayLow(E.dayDiff(o.dlv))} · хранение до ${E.dm(o.keep)}${pt ? ' · ' + esc(pt.hours) : ''}` : `${E.dayLabel(E.dayDiff(o.dlv))}, ${esc(o.slot)}`}</span></div></div>
      <div class="succ-row">${E.icon('user')}<div><span>Получатель</span><b>${esc(o.recipient.name)}, ${esc(E.phone(o.recipient.phone))}</b></div></div>
      <div class="succ-row">${E.icon(o.pay === 'cash' ? 'cash' : o.pay === 'sbp' ? 'zap' : o.pay === 'split' ? 'cal' : 'card')}<div><span>Оплата</span><b>${payT}</b></div></div>
      <div class="succ-row">${E.icon('bag')}<div><span>${pl(n, 'товар', 'товара', 'товаров')}</span><div class="co-thumbs">${o.items.slice(0, 8).map(x => { const p = E.P[x.id]; return p ? `<a class="co-thumb" href="${E.url.p(p.id)}" title="${esc(p.name)}"><img src="${p.img}" alt="" loading="lazy">${x.qty > 1 ? `<b>×${x.qty}</b>` : ''}</a>` : ''; }).join('')}</div></div></div>
      ${o.earn ? `<div class="succ-row">${E.berry()}<div><span>Ягодный клуб</span><b>Начислим +${pl(o.earn, 'ягодку', 'ягодки', 'ягодок')} после получения</b></div></div>` : ''}
    </div>
    <div class="succ-btns"><a class="btn btn-primary btn-lg" href="account.html#order/${encodeURIComponent(o.num)}">Отследить заказ</a><a class="btn btn-secondary btn-lg" href="index.html">Продолжить покупки</a></div>
  </div>
  <section class="sec co-recs">${E.secH('Вам может понравиться', 'catalog.html?flag=hit')}${E.rail(Object.values(E.P).filter(p => !o.items.some(x => x.id === p.id) && p.flags && p.flags.includes('hit')).sort((a, b) => b.sold - a.sold).slice(0, 12).map(p => E.card(p)).join(''))}</section>`;
  E.initRails(root);
  if (fresh) E.toast('Заказ ' + o.num + ' оформлен', { icon: 'check' });
}

/* ---------- события ---------- */
const applyPromo = (val, form) => {
  const err = $('[data-promo-err]'), c = E.promoCode(val);
  if (!String(val || '').trim()) { if (err) { err.hidden = false; err.textContent = 'Введите промокод'; } return; }
  if (!c) { if (err) { err.hidden = false; err.textContent = 'Промокод не найден или срок его действия истёк'; } if (form) form.code.focus(); return; }
  E.set('promo', c);
  const r = calc();
  E.toast(r.promoErr ? 'Промокод сохранён, но пока не применён' : 'Промокод применён: −' + money(r.promo).replace('−', ''), { icon: r.promoErr ? 'info' : 'check' });
};
root.addEventListener('change', e => {
  const t = e.target;
  if (t.name === 'dtype') { st.type = t.value; save(); renderDlv(); renderItems(); renderSum(); const p = $('[name=pay][value=cash]'); if (p) $('small', p.closest('.pay-row')).textContent = st.type === 'courier' ? 'Картой или наличными курьеру' : 'Картой или наличными в пункте выдачи'; return; }
  if (t.name === 'caddr') { st.addr = t.value; save(); renderDlv(); return; }
  if (t.name === 'pay') { st.pay = t.value; save(); renderPay(); renderSum(); if (t.value === 'new') setTimeout(() => { const i = $('#nc-n'); if (i) i.focus(); }, 30); return; }
  if (t.matches('[data-berries]')) { E.set('useberries', t.checked); return; }
});
root.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-pick]')) { E.pickup(id => { const a = addrs(); a.points = [id].concat((a.points || []).filter(x => x !== id)).slice(0, 5); E.set('addresses', a); }); return; }
  const sp = t.closest('[data-setpt]'); if (sp) { E.set('point', sp.dataset.setpt); E.toast('Пункт выдачи: ' + esc(E.PT[sp.dataset.setpt].addr), { icon: 'pin' }); return; }
  const ed = t.closest('[data-editaddr]'); if (ed) { e.preventDefault(); addrModal(ed.dataset.editaddr); return; }
  if (t.closest('[data-addaddr]')) { addrModal(); return; }
  const d = t.closest('[data-day]'); if (d) { st.day = +d.dataset.day; save(); renderDlv(); renderItems(); renderSum(); return; }
  const s = t.closest('[data-slot]'); if (s) { st.slot = +s.dataset.slot; save(); renderDlv(); renderItems(); renderSum(); return; }
  if (t.closest('[data-promo-x]')) { E.set('promo', null); E.toast('Промокод убран', { icon: 'info' }); return; }
});
document.addEventListener('click', e => { if (e.target.closest('[data-pay]')) place(); });
root.addEventListener('submit', e => {
  const f = e.target.closest('[data-promo-f]'); if (f) { e.preventDefault(); applyPromo(f.code.value, f); return; }
  if (e.target.closest('[data-rec]')) { e.preventDefault(); place(); }
});
root.addEventListener('input', e => {
  const t = e.target;
  if (t.closest('[data-promo-f]')) { const err = $('[data-promo-err]'); if (err) err.hidden = true; return; }
  if (t.closest('[data-rec]')) { E.fieldErr(t, ''); readRec(); save(); showErr(''); return; }
  if (t.closest('[data-newcard]')) {
    E.fieldErr(t, ''); showErr('');
    if (t.name === 'num') { const d = digits(t.value).slice(0, 16); t.value = d.replace(/(\d{4})(?=\d)/g, '$1 '); }
    if (t.name === 'exp') { let d = digits(t.value).slice(0, 4); if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2); t.value = d; }
    if (t.name === 'cvc') t.value = digits(t.value).slice(0, 3);
  }
});

if (doneNum) { renderDone(doneNum, false); return; }
E.on('promo', () => { renderDlv(); renderSum(); });
E.on('useberries', renderSum);
E.on('point', () => { renderDlv(); renderItems(); });
E.on('cart', renderAll);
E.on('session', () => { if (!E.user()) location.replace(E.loginUrl('checkout.html')); });
renderAll();
})();
