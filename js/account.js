/* Ежевика — личный кабинет */
(() => {
const E = window.EZH, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
if (!E.requireAuth()) return;
const root = $('#acc-root'), DAY = E.DAY, NB = '\u00a0';
const PAY = { card: 'Картой онлайн', sbp: 'СБП', cash: 'При получении', split: 'Частями — Ежевика Сплит' };
const RET_REASONS = ['Не подошёл размер', 'Не понравился товар', 'Брак или повреждение', 'Не соответствует описанию', 'Привезли не тот товар', 'Другое'];
const pill = st => `<span class="pill pill-${E.ST[st].c}"><i></i>${E.ST[st].t}</span>`;
const P = id => E.P[id];
const money = E.money, pl = E.pl, esc = E.esc;
const dmy = ts => E.dm(ts) + (new Date(ts).getFullYear() !== new Date().getFullYear() ? ' ' + new Date(ts).getFullYear() : '');
const tm = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

/* ---------- псевдо-QR по коду ---------- */
const qr = E.qr;

/* ---------- данные кабинета ---------- */
const orders = () => E.orders();
const doneItems = () => { const out = [], seen = new Set(); orders().filter(o => o.status === 'done').forEach(o => o.items.forEach(it => { if (!seen.has(it.id) && P(it.id)) { seen.add(it.id); out.push({ it, o }); } })); return out; };
const myRevs = () => E.get('myreviews', []);
const waitRev = () => { const r = new Set(myRevs().map(x => x.pid)); return doneItems().filter(x => !r.has(x.it.id)); };
const SEED_RET = [{ id: 'В-208841', num: 'ЕЖ-4790004', pid: 1050, size: null, qty: 1, reason: 'Брак или повреждение', comment: 'Одна кружка пришла со сколом на ручке', created: Date.now() - 19 * DAY, sum: 2190, refund: 'card', seed: true }];
const returns = () => SEED_RET.concat(E.get('returns', [])).map(r => { const age = Date.now() - r.created; r.st = age < 2 * 36e5 ? 'review' : age < DAY ? 'approved' : 'refunded'; return r; }).sort((a, b) => b.created - a.created);
const RST = { review: ['На рассмотрении', 'blue'], approved: ['Одобрен — сдайте товар', 'violet'], refunded: ['Деньги возвращены', 'green'] };
const canReturn = () => { const used = new Set(returns().map(r => r.num + ':' + r.pid)); const out = []; orders().filter(o => o.status === 'done' && Date.now() - o.dlv < 14 * DAY).forEach(o => o.items.forEach(it => { if (!used.has(o.num + ':' + it.id) && P(it.id)) out.push({ o, it }); })); return out; };

function notifs() {
  const l = [], now = Date.now();
  orders().forEach(o => {
    const pt = o.point && E.PT[o.point];
    if (o.status === 'cancelled') l.push({ id: 'cnl-' + o.num, ic: 'xc', t: 'Заказ отменён', p: o.pay === 'cash' ? `${o.num}: оплачивать ничего не нужно` : `${o.num}: деньги вернутся ${o.pay === 'sbp' ? 'на счёт' : 'на карту'} в течение 1–3 дней`, ts: o.cancelledAt || o.created + 36e5, href: '#order/' + o.num });
    else if (o.status === 'ready') l.push({ id: 'rdy-' + o.num, ic: 'box', t: 'Заказ готов к выдаче', p: `${o.num} ждёт вас по адресу ${pt ? pt.addr : ''}. Код получения — ${o.code}`, ts: Math.min(now - 2 * 36e5, o.dlv), href: '#order/' + o.num });
    else if (o.status === 'shipping') l.push({ id: 'shp-' + o.num, ic: 'truck', t: 'Заказ передан в доставку', p: `${o.num}: доставим ${E.dayLow(E.dayDiff(o.dlv))}`, ts: Math.min(now - 36e5, o.created + 8 * 36e5), href: '#order/' + o.num });
    if (!o.seed) l.push({ id: 'new-' + o.num, ic: 'check-c', t: 'Заказ оформлен', p: `${o.num} на ${money(o.sums.total)} — мы уже передали его продавцам`, ts: o.created, href: '#order/' + o.num });
  });
  l.push({ id: 's1', ic: 'tag', t: 'Снизилась цена на товар из избранного', p: '«Портативная колонка Sonora Go» подешевела на 10% — успейте купить по акции', ts: now - 5 * 36e5, href: 'product.html?id=1005' });
  l.push({ id: 's2', ic: 'percent', t: 'Распродажа 11.11 уже идёт', p: 'Скидки до 80% и промокод ЕЖЕВИКА: −10% на заказ до 3 000 ₽', ts: now - 26 * 36e5, href: 'promo.html' });
  l.push({ id: 's3', ic: 'star-o', t: '+50 ягодок за отзыв', p: 'Спасибо за отзыв о кедах! Ягодки уже на вашем счёте', ts: now - 2 * DAY, href: '#berries' });
  l.push({ id: 's4', ic: 'crown', t: 'Новый уровень в Ягодном клубе', p: 'Вы достигли уровня «Спелая ягода»: кешбэк 5% на все покупки', ts: now - 23 * DAY, href: 'club.html' });
  return l.sort((a, b) => b.ts - a.ts);
}
const readSet = () => new Set(E.get('nread', []));
const isUnread = n => !readSet().has(n.id) && Date.now() - n.ts < 4 * DAY;
const unread = () => notifs().filter(isUnread).length;

/* ---------- каркас ---------- */
const NAV = [
  ['overview', 'Обзор', 'home'], ['orders', 'Заказы', 'box', () => orders().filter(o => E.ACTIVE.includes(o.status)).length, 'g'],
  ['purchases', 'Покупки', 'bag'], ['returns', 'Возвраты', 'ret'], ['reviews', 'Отзывы', 'star-o', () => waitRev().length, 'g'],
  ['berries', 'Ягодки', 'berry'], ['addresses', 'Адреса доставки', 'pin'], ['payments', 'Способы оплаты', 'card'],
  ['notifications', 'Уведомления', 'bell', unread], ['settings', 'Профиль и настройки', 'gear'],
];
let route = 'overview', arg = '', ordTab = 'all', ordQ = '';
function parse() {
  const h = decodeURIComponent(location.hash.slice(1));
  const [r, a] = h.split('/');
  route = NAV.some(n => n[0] === r) || r === 'order' ? r : 'overview';
  arg = a || '';
  return !h || h === 'menu';
}
function side() {
  const u = E.user(), lv = E.club.level();
  return `<aside class="acc-side" aria-label="Меню кабинета">
    <div class="acc-user"><div class="acc-u-top">${E.avatar(u.name + ' ' + u.surname)}<div><b>${esc(u.name)} ${esc(u.surname)}</b><span>${esc(u.email)}</span></div></div>
      <a class="acc-bal" href="#berries">${E.berry()}<div><b>${pl(E.berries.balance(), 'ягодка', 'ягодки', 'ягодок')}</b><span>${esc(lv.name)} · кешбэк ${lv.rate}%</span></div></a></div>
    <nav class="acc-nav">${NAV.map(([k, t, i, c, g]) => { const n = c ? c() : 0; const on = route === k || (route === 'order' && k === 'orders'); return `<a href="#${k}" class="${on ? 'on' : ''}"${on ? ' aria-current="page"' : ''}>${i === 'berry' ? E.berry('bi') : E.icon(i)}${t}${n ? `<span class="cnt${g ? ' cnt-g' : ''}">${n}</span>` : ''}</a>`; }).join('')}
      <span class="sep"></span><button type="button" class="out" data-logout>${E.icon('logout')}Выйти</button></nav>
  </aside>`;
}
const back = (href = '#menu', t = 'Профиль') => `<a class="acc-back link-btn" href="${href}">${E.icon('chev-l', 'i-18')}${t}</a>`;
const head = (t, extra = '') => `${back()}<div class="acc-h"><h1>${t}</h1>${extra}</div>`;

function render(scroll) {
  const menu = parse();
  const view = { overview, orders: ordersV, order: orderV, purchases, returns: returnsV, reviews, berries, addresses, payments, notifications, settings }[route] || overview;
  root.innerHTML = `${E.crumbs([['Личный кабинет', route === 'overview' ? '' : 'account.html#overview']].concat(route === 'overview' ? [] : [[(NAV.find(n => n[0] === route) || ['', route === 'order' ? 'Заказ ' + arg : ''])[1]]]))}<div class="acc${menu ? ' show-menu' : ''}">${side()}<section class="acc-main">${view()}</section></div>`;
  E.initRails(root);
  if (scroll) window.scrollTo({ top: 0 });
  document.title = (route === 'order' ? 'Заказ ' + arg : (NAV.find(n => n[0] === route) || [, 'Личный кабинет'])[1]) + ' — Ежевика';
}

/* ---------- карточка заказа (список) ---------- */
function dlvLine(o) {
  const pt = o.point && E.PT[o.point];
  const where = o.type === 'pickup' ? `${E.icon('pin')}<div class="ord-dl-t"><span>Пункт выдачи · ${esc(pt ? pt.addr : '')}</span>` : `${E.icon('truck')}<div class="ord-dl-t"><span>Курьером · ${esc(o.address || '')}</span>`;
  const st = o.status;
  const when = st === 'ready' ? `<b>Ждёт до ${E.dm(o.keep || o.dlv + 7 * DAY)} · код ${o.code}</b>` : st === 'done' ? `<b>Получен ${dmy(o.dlv)}</b>` : st === 'cancelled' ? `<b>Отменён ${dmy(o.cancelledAt || o.created)}</b>` : `<b>${o.type === 'courier' ? E.dayLabel(E.dayDiff(o.dlv)) + ', ' + esc(o.slot || '') : 'Доставим ' + E.dayLow(E.dayDiff(o.dlv))}</b>`;
  return `<div class="ord-dl">${where}<i aria-hidden="true">·</i>${when}</div></div>`;
}
function ordCard(o) {
  const n = o.items.reduce((s, x) => s + x.qty, 0), show = o.items.slice(0, 5);
  return `<article class="ord">
    <div class="ord-h"><a class="ord-n" href="#order/${o.num}">Заказ ${o.num}</a><span class="ord-d">от ${dmy(o.created)}</span>${pill(o.status)}</div>
    ${dlvLine(o)}
    <div class="ord-thumbs">${show.map(x => `<a href="${E.url.p(x.id)}" title="${esc(P(x.id).name)}"><img src="${P(x.id).img}" alt="" loading="lazy"></a>`).join('')}${o.items.length > 5 ? `<a class="more-n" href="#order/${o.num}">+${o.items.length - 5}</a>` : ''}</div>
    <div class="ord-f"><div class="ord-sum">${pl(n, 'товар', 'товара', 'товаров')} · <b>${money(o.sums.total)}</b></div>
      ${o.status === 'ready' ? `<button type="button" class="btn btn-primary btn-sm" data-code="${o.num}">${E.icon('qr', 'i-18')}Код получения</button>` : ''}
      ${['done', 'cancelled'].includes(o.status) ? `<button type="button" class="btn btn-outline btn-sm" data-repeat="${o.num}">${E.icon('refresh', 'i-18')}Повторить</button>` : ''}
      <a class="btn btn-secondary btn-sm" href="#order/${o.num}">Подробнее</a></div>
  </article>`;
}

/* ---------- обзор ---------- */
function overview() {
  const u = E.user(), os = orders(), act = os.filter(o => E.ACTIVE.includes(o.status)), ready = os.filter(o => o.status === 'ready');
  const lv = E.club.level(), nx = E.club.next(), sp = E.club.spent();
  const pct = nx ? Math.min(100, Math.round((sp - lv.from) / (nx.from - lv.from) * 100)) : 100;
  const h = new Date().getHours(), hi = h < 6 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
  const recent = E.recent.list().slice(0, 12);
  return `${head(`${hi}, ${esc(u.name)}!`)}
  <div class="stat-cards">
    <a class="stat" href="#orders">${E.icon('box')}<b>${act.length}</b><span>${E.plural(act.length, 'активный заказ', 'активных заказа', 'активных заказов')}</span></a>
    <a class="stat" href="#berries">${E.berry()}<b>${E.fmt(E.berries.balance())}</b><span>ягодок на счёте</span></a>
    <a class="stat" href="favorites.html">${E.icon('heart')}<b>${E.fav.list().length}</b><span>в избранном</span></a>
    <a class="stat" href="#reviews">${E.icon('star-o')}<b>${waitRev().length}</b><span>ждут отзыва</span></a>
  </div>
  ${ready.map(o => { const pt = E.PT[o.point]; return `<div class="ord-code acc-ready"><div class="qrbox">${qr(o.code)}</div><div class="oc-t"><span class="oc-l">Заказ ${o.num} готов к выдаче</span><div class="code">${o.code}</div><span>${esc(pt.addr)}, ${esc(pt.hours)} · хранится до ${E.dm(o.keep || o.dlv + 7 * DAY)}</span></div><a class="btn btn-outline" href="#order/${o.num}">Подробнее</a></div>`; }).join('')}
  <div class="acc-sec"><div class="sec-h sm"><h2>Активные заказы</h2><a class="sec-more" href="#orders">Все заказы${E.icon('chev-r', 'i-18')}</a></div>
    ${act.length ? act.slice(0, 3).map(ordCard).join('') : `<div class="card-b acc-none">${E.icon('box')}<div><b>Активных заказов нет</b><span>Самое время выбрать что-нибудь приятное</span></div><a class="btn btn-secondary btn-sm" href="index.html">За покупками</a></div>`}</div>
  <div class="acc-grid2 acc-sec">
    <div class="card-b"><h3>${E.berry('bi')}Ягодный клуб<a class="link-btn" href="club.html">О клубе</a></h3>
      <div class="lvl-now"><b>${esc(lv.name)}</b><span>Кешбэк ${lv.rate}% ягодками</span></div>
      <div class="lvl"><div class="lvl-bar"><i style="width:${pct}%"></i></div><div class="lvl-meta"><span>${money(sp)} покупок</span><span>${nx ? 'До «' + esc(nx.name) + '» — ' + money(nx.from - sp) : 'Максимальный уровень'}</span></div></div></div>
    <div class="card-b"><h3>${E.icon('percent')}Ваши промокоды<a class="link-btn" href="promo.html">Все акции</a></h3>
      <div class="my-codes">${[['ЕЖЕВИКА', '−10% на заказ', 'до 30 ноября'], ['ЯГОДА500', '−500 ₽ от 3 000 ₽', 'до 15 декабря']].map(([c, t, d]) => `<div class="my-code"><div><b>${c}</b><span>${t} · ${d}</span></div><button type="button" class="btn btn-outline btn-sm" data-copy="${c}">${E.icon('copy', 'i-18')}Копировать</button></div>`).join('')}</div></div>
  </div>
  ${recent.length ? `<section class="acc-sec">${E.secH('Вы недавно смотрели')}${E.rail(recent.map(p => E.card(p)).join(''))}</section>` : ''}`;
}

/* ---------- заказы ---------- */
function ordersV() {
  const all = orders();
  const tabs = [['all', 'Все', all], ['active', 'Активные', all.filter(o => E.ACTIVE.includes(o.status))], ['done', 'Полученные', all.filter(o => o.status === 'done')], ['cancelled', 'Отменённые', all.filter(o => o.status === 'cancelled')]];
  const cur = tabs.find(t => t[0] === ordTab) || tabs[0];
  const q = E.norm(ordQ);
  const list = cur[2].filter(o => !q || E.norm(o.num).includes(q) || o.items.some(it => E.norm(P(it.id).name).includes(q)));
  return `${head('Заказы', `<a class="btn btn-secondary" href="#returns">${E.icon('ret', 'i-18')}Возвраты</a>`)}
  <div class="acc-tools"><div class="chips chips-scroll">${tabs.map(([k, t, l]) => `<button type="button" class="chip${k === cur[0] ? ' on' : ''}" data-otab="${k}">${t}<small>${l.length}</small></button>`).join('')}</div>
    <label class="acc-search">${E.icon('search', 'i-18')}<input class="input" type="search" placeholder="Номер заказа или товар" value="${esc(ordQ)}" data-oq aria-label="Поиск по заказам"></label></div>
  ${list.length ? list.map(ordCard).join('') : E.empty({ icon: 'box', title: q ? 'Ничего не нашли' : 'Здесь пока пусто', text: q ? 'Проверьте номер заказа или название товара' : 'Когда появятся заказы с таким статусом, они будут здесь', btns: q ? '<button type="button" class="btn btn-secondary" data-oq-clear>Сбросить поиск</button>' : '<a class="btn btn-primary" href="index.html">За покупками</a>' })}`;
}

function timeline(o) {
  const pick = o.type === 'pickup';
  const steps = [['Оформлен', o.created], ['Собран', o.created + 8 * 36e5], ['В пути', o.created + 9 * 36e5], [pick ? 'В пункте выдачи' : 'У курьера', o.dlv], ['Получен', o.status === 'done' ? o.dlv + (pick ? DAY : 0) : null]];
  if (o.status === 'cancelled') {
    return `<div class="tl tl-2">${[['Оформлен', o.created, 'done'], ['Отменён', o.cancelledAt || o.created + 2 * 36e5, 'cancel']].map(([t, ts, c]) => `<div class="tl-step ${c}"><span class="tl-dot">${E.icon(c === 'cancel' ? 'close' : 'check')}</span><b>${t}</b>${dmy(ts)}, ${tm(ts)}</div>`).join('')}</div>`;
  }
  const idx = { new: 0, assembling: 1, shipping: 2, ready: 3, done: 5 }[o.status];
  return `<div class="tl">${steps.map(([t, ts], i) => { const c = i < idx ? 'done' : i === idx ? 'cur' : ''; return `<div class="tl-step ${c}"><span class="tl-dot">${i < idx ? E.icon('check') : ''}</span><b>${t}</b>${i <= idx && ts ? dmy(Math.min(ts, Date.now())) : i === 3 ? 'ожидается ' + E.dm(o.dlv) : ''}</div>`; }).join('')}</div>`;
}
function orderV() {
  const o = E.order(arg);
  if (!o) return `${back('#orders', 'Заказы')}${E.empty({ icon: 'box', title: 'Заказ не найден', text: 'Возможно, ссылка устарела. Все ваши заказы — в разделе «Заказы».', btns: '<a class="btn btn-primary" href="#orders">К заказам</a>' })}`;
  const pt = o.point && E.PT[o.point], n = o.items.reduce((s, x) => s + x.qty, 0), revd = new Set(myRevs().map(r => r.pid));
  const retd = new Set(returns().filter(r => r.num === o.num).map(r => r.pid));
  const canRet = o.status === 'done' && Date.now() - o.dlv < 14 * DAY;
  const s = o.sums;
  const rows = [[`Товары, ${n} шт.`, money(s.goods)], s.disc ? ['Скидка', `<span class="minus">${money(-s.disc)}</span>`] : 0, s.gift ? ['Акция 1+1=3', `<span class="minus">${money(-s.gift)}</span>`] : 0, s.promo ? [`Промокод${o.promo ? ' ' + esc(o.promo) : ''}`, `<span class="minus">${money(-s.promo)}</span>`] : 0, s.berries ? ['Ягодками', `<span class="minus">${money(-s.berries)}</span>`] : 0, ['Доставка', s.delivery ? money(s.delivery) : '<span class="free">бесплатно</span>']].filter(Boolean);
  return `<a class="link-btn od-back" href="#orders">${E.icon('chev-l', 'i-18')}Все заказы</a>
  <div class="acc-h od-h"><h1>Заказ ${o.num}</h1>${pill(o.status)}<span class="ord-d">от ${dmy(o.created)}, ${tm(o.created)}</span></div>
  ${o.status === 'ready' && pt ? `<div class="ord-code"><div class="qrbox">${qr(o.code)}</div><div class="oc-t"><span class="oc-l">Код получения</span><div class="code">${o.code}</div><span>Покажите QR-код или назовите код в пункте выдачи. Заказ хранится до ${E.dm(o.keep || o.dlv + 7 * DAY)}</span></div></div>` : ''}
  <div class="card-b od-tl">${timeline(o)}</div>
  <div class="od-grid">
    <div class="card-b"><h3>Состав заказа<span class="h-sub">${pl(n, 'товар', 'товара', 'товаров')}</span></h3>
      ${o.items.map(it => { const p = P(it.id); if (!p) return ''; return `<div class="od-item"><a class="co-thumb" href="${E.url.p(p.id)}"><img src="${p.img}" alt="" loading="lazy"></a><div><a class="ci-t" href="${E.url.p(p.id)}">${esc(p.name)}</a><div class="ci-attr">${it.size ? `<span>Размер: ${esc(it.size)}</span>` : ''}<span>${it.qty} × ${money(it.price)}</span><span>${esc((E.S[p.seller] || {}).name || '')}</span></div>
        <div class="od-btns">${o.status === 'done' ? (revd.has(p.id) ? `<span class="pill pill-green">${E.icon('check', 'i-16')}Отзыв оставлен</span>` : `<button type="button" class="btn btn-secondary btn-sm" data-review="${p.id}">${E.icon('star-o', 'i-18')}Оценить</button>`) : ''}
          ${canRet && !retd.has(p.id) ? `<button type="button" class="btn btn-outline btn-sm" data-ret="${o.num}:${p.id}">${E.icon('ret', 'i-18')}Вернуть</button>` : ''}${retd.has(p.id) ? `<span class="pill pill-violet">Оформлен возврат</span>` : ''}
          <button type="button" class="btn btn-outline btn-sm" data-again="${p.id}" data-size="${esc(it.size || '')}">${E.icon('cart', 'i-18')}Купить снова</button></div></div>
        <div class="od-pr">${money(it.price * it.qty)}<s>${money(it.old * it.qty)}</s></div></div>`; }).join('')}
    </div>
    <div class="od-side">
      <div class="card-b"><h3>${o.type === 'pickup' ? 'Пункт выдачи' : 'Доставка курьером'}</h3><div class="kv">
        ${o.type === 'pickup' && pt ? `<div><span>Адрес</span><b>${esc(pt.city)}, ${esc(pt.addr)}</b></div><div><span>Режим работы</span><b>${esc(pt.hours)}${pt.metro ? ' · ' + esc(pt.metro) : ''}</b></div>` : `<div><span>Адрес</span><b>${esc(o.address || '')}</b></div><div><span>Интервал</span><b>${E.dm(o.dlv)}, ${esc(o.slot || '')}</b></div>`}
        <div><span>Получатель</span><b>${esc(o.recipient.name)}, ${esc(fmtPhone(o.recipient.phone))}</b></div></div></div>
      <div class="card-b"><h3>Оплата</h3>${rows.map(([a, b]) => `<div class="sum-row"><span>${a}</span><span>${b}</span></div>`).join('')}
        <div class="sum-total"><span>Итого</span><b>${money(s.total)}</b></div>
        <div class="od-pay">${E.icon(o.pay === 'cash' ? 'cash' : o.pay === 'sbp' ? 'zap' : 'card', 'i-18')}${esc(PAY[o.pay] || 'Картой онлайн')}${o.card ? ' · ' + esc(o.card) : ''}${o.status === 'cancelled' ? ' · <span class="free">возвращено</span>' : o.pay === 'cash' && o.status !== 'done' ? ' · оплата при получении' : ' · оплачено'}</div>
        ${o.earn && o.status !== 'cancelled' ? `<div class="sum-earn">${E.berry()}<span>${o.status === 'done' ? 'Начислено' : 'Начислим после получения'} <b>+${pl(o.earn, 'ягодку', 'ягодки', 'ягодок')}</b></span></div>` : ''}</div>
      <div class="od-acts">
        ${['new', 'assembling', 'shipping'].includes(o.status) ? `<button type="button" class="btn btn-outline btn-block danger-b" data-cancel="${o.num}">${E.icon('xc', 'i-18')}Отменить заказ</button>` : ''}
        <button type="button" class="btn btn-secondary btn-block" data-repeat="${o.num}">${E.icon('refresh', 'i-18')}Повторить заказ</button>
        <button type="button" class="btn btn-outline btn-block" data-act="chat">${E.icon('chat', 'i-18')}Написать в поддержку</button></div>
    </div>
  </div>`;
}
const fmtPhone = p => { const d = String(p || '').replace(/\D/g, ''); return d.length === 11 ? `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}` : p; };

/* ---------- покупки ---------- */
function purchases() {
  const l = doneItems();
  return `${head('Покупки', `<span class="cnt-h">${pl(l.length, 'товар', 'товара', 'товаров')}</span>`)}
  ${l.length ? `<div class="grid grid-acc">${l.map(({ it, o }) => E.card(P(it.id), { extra: `<div class="pur-m">Получен ${dmy(o.dlv)}</div>` })).join('')}</div>` : E.empty({ icon: 'bag', title: 'Покупок пока нет', text: 'Здесь появятся товары из полученных заказов — их будет удобно купить снова.', btns: '<a class="btn btn-primary" href="index.html">За покупками</a>' })}`;
}

/* ---------- возвраты ---------- */
function returnsV() {
  const l = returns(), can = canReturn();
  return `${head('Возвраты', can.length ? `<button type="button" class="btn btn-primary" data-ret="">${E.icon('ret', 'i-18')}Оформить возврат</button>` : '')}
  <div class="note acc-sec0">${E.icon('info')}<div><b>Вернуть товар можно в течение 14 дней</b> после получения. Деньги придут за 1–3 дня после того, как вы сдадите товар в любом пункте выдачи Ежевики.</div></div>
  ${l.length ? `<div class="ret-list">${l.map(r => { const p = P(r.pid); if (!p) return ''; const [t, c] = RST[r.st]; return `<article class="ret">
    <a class="co-thumb" href="${E.url.p(p.id)}"><img src="${p.img}" alt="" loading="lazy"></a>
    <div class="ret-b"><div class="ret-h"><b>Заявка ${esc(r.id)}</b><span class="pill pill-${c}"><i></i>${t}</span></div><a class="ci-t" href="${E.url.p(p.id)}">${esc(p.name)}</a>
      <div class="ci-attr"><span>Заказ ${esc(r.num)}</span><span>от ${dmy(r.created)}</span><span>${esc(r.reason)}</span></div>
      <p class="ret-s">${r.st === 'review' ? 'Проверяем заявку — обычно это занимает до 2 часов.' : r.st === 'approved' ? 'Заявка одобрена. Сдайте товар в любой пункт выдачи в течение 7 дней — назовите номер заявки.' : `${money(r.sum)} вернули ${r.refund === 'berries' ? 'ягодками' : 'на карту'} ${dmy(r.created + DAY)}.`}</p></div>
    <div class="od-pr">${money(r.sum)}</div></article>`; }).join('')}</div>` : E.empty({ icon: 'ret', title: 'Возвратов нет', text: 'Если товар не подошёл, оформите возврат из заказа — это займёт минуту.' })}`;
}
function returnModal(pre) {
  const can = canReturn(); if (!can.length) { E.toast('Нет товаров, которые можно вернуть', { icon: 'info' }); return; }
  const m = E.modal({ title: 'Оформление возврата', html: `<form class="m-form" data-rform novalidate>
    <div class="field"><span class="lbl">Товар</span><div class="ret-pick">${can.map(({ o, it }, i) => { const p = P(it.id), k = o.num + ':' + it.id; return `<label class="ret-opt"><input type="radio" name="item" value="${k}"${(pre ? pre === k : i === 0) ? ' checked' : ''}><span class="co-thumb"><img src="${p.img}" alt=""></span><span><b>${esc(p.name)}</b><small>${o.num} · ${money(it.price * it.qty)}</small></span></label>`; }).join('')}</div></div>
    <div class="field"><label for="rt-r">Причина</label><select class="input" id="rt-r" name="reason"><option value="">Выберите причину</option>${RET_REASONS.map(r => `<option>${r}</option>`).join('')}</select></div>
    <div class="field"><label for="rt-c">Комментарий</label><textarea class="input" id="rt-c" name="comment" maxlength="500" placeholder="Опишите, что не так — так мы быстрее одобрим заявку"></textarea></div>
    <div class="field"><span class="lbl">Как вернуть деньги</span><div class="seg seg-f"><button type="button" class="on" data-refund="card">На карту</button><button type="button" data-refund="berries">Ягодками +5%</button></div></div>
    </form>`, foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-rsend>Отправить заявку</button>' });
  let refund = 'card';
  m.el.addEventListener('click', e => {
    const rf = e.target.closest('[data-refund]'); if (rf) { refund = rf.dataset.refund; $$('[data-refund]', m.el).forEach(b => b.classList.toggle('on', b === rf)); }
    if (e.target.closest('[data-rsend]')) {
      const f = $('[data-rform]', m.el), k = (f.item.value || ($('input[name=item]:checked', f) || {}).value || '');
      if (!f.reason.value) { E.fieldErr(f.reason, 'Укажите причину возврата'); return; }
      if (f.reason.value === 'Другое' && f.comment.value.trim().length < 5) { E.fieldErr(f.comment, 'Опишите причину в комментарии'); return; }
      const [num, pid] = k.split(':'), o = E.order(num), it = o.items.find(x => x.id === +pid);
      const sum = it.price * it.qty, r = { id: 'В-' + String(208900 + Math.floor(Math.random() * 90000)), num, pid: +pid, size: it.size, qty: it.qty, reason: f.reason.value, comment: f.comment.value.trim(), created: Date.now(), sum: refund === 'berries' ? Math.round(sum * 1.05) : sum, refund };
      E.set('returns', E.get('returns', []).concat(r));
      m.close(); E.toast(`Заявка ${r.id} отправлена — ответим в течение 2 часов`, { icon: 'ret' });
      if (route !== 'returns') location.hash = '#returns'; else render();
    }
  });
  m.el.addEventListener('change', e => { if (e.target.name === 'reason') E.fieldErr(e.target, ''); });
}

/* ---------- отзывы ---------- */
function reviews() {
  const w = waitRev(), mine = myRevs();
  return `${head('Отзывы')}
  <div class="card-b acc-sec0"><h3>Ждут вашей оценки<span class="h-sub">${w.length ? '+50 ягодок за отзыв с текстом' : ''}</span></h3>
    ${w.length ? w.map(({ it, o }) => { const p = P(it.id); return `<div class="rv-wait"><a class="co-thumb" href="${E.url.p(p.id)}"><img src="${p.img}" alt="" loading="lazy"></a><div><a class="ci-t" href="${E.url.p(p.id)}">${esc(p.name)}</a><div class="ci-attr"><span>Получен ${dmy(o.dlv)}</span></div></div><button type="button" class="btn btn-secondary btn-sm" data-review="${p.id}">${E.icon('star-o', 'i-18')}Оценить</button></div>`; }).join('') : `<p class="m-text">Все покупки оценены — спасибо! Отзывы помогают другим покупателям.</p>`}</div>
  <div class="card-b acc-sec"><h3>Мои отзывы<span class="h-sub">${mine.length || ''}</span></h3>
    ${mine.length ? mine.map(r => { const p = P(r.pid); if (!p) return ''; return `<div class="my-rv"><a class="co-thumb" href="${E.url.p(p.id)}#reviews"><img src="${p.img}" alt="" loading="lazy"></a><div><div class="my-rv-h"><a class="ci-t" href="${E.url.p(p.id)}#reviews">${esc(p.name)}</a><button type="button" class="icon-btn danger" data-rvdel="${r.key}" aria-label="Удалить отзыв">${E.icon('trash', 'i-18')}</button></div>
      <div class="my-rv-m">${E.stars(r.r, 'stars-sm')}<span>${dmy(r.t0)}</span><span class="pill pill-green">Опубликован</span></div>${r.t ? `<p>${esc(r.t)}</p>` : ''}${r.pros ? `<p><b>Достоинства:</b> ${esc(r.pros)}</p>` : ''}${r.cons ? `<p><b>Недостатки:</b> ${esc(r.cons)}</p>` : ''}</div></div>`; }).join('') : '<p class="m-text">Вы ещё не оставляли отзывов.</p>'}</div>`;
}
function reviewModal(pid) {
  const p = P(pid), u = E.user(); let rate = 0;
  const m = E.modal({ title: 'Отзыв о товаре', html: `<div class="rv-prod"><span class="co-thumb"><img src="${p.img}" alt=""></span><b>${esc(p.name)}</b></div>
    <form class="m-form" data-rf novalidate><div class="field"><span class="lbl">Ваша оценка</span><div class="rate-in" role="radiogroup" aria-label="Оценка">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-rate="${i}" role="radio" aria-checked="false" aria-label="${i} из 5">${E.icon('star-o')}</button>`).join('')}</div></div>
    <div class="field"><label for="rv-p">Достоинства</label><input class="input" id="rv-p" name="pros" maxlength="120"></div>
    <div class="field"><label for="rv-c">Недостатки</label><input class="input" id="rv-c" name="cons" maxlength="120"></div>
    <div class="field"><label for="rv-t">Комментарий</label><textarea class="input" id="rv-t" name="t" maxlength="1000" placeholder="Расскажите, как товар показал себя в деле"></textarea><span class="field-hint">За отзыв с текстом начислим 50 ягодок</span></div></form>`,
  foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-send>Опубликовать</button>' });
  m.el.addEventListener('click', e => {
    const b = e.target.closest('[data-rate]');
    if (b) { rate = +b.dataset.rate; $$('[data-rate]', m.el).forEach(x => { x.classList.toggle('on', +x.dataset.rate <= rate); x.setAttribute('aria-checked', +x.dataset.rate === rate); }); const fe = $('.rate-in', m.el).parentElement.querySelector('.field-err'); if (fe) fe.remove(); }
    if (e.target.closest('[data-send]')) {
      const f = $('[data-rf]', m.el), t = f.t.value.trim();
      if (!rate) { const fl = $('.rate-in', m.el).parentElement; if (!$('.field-err', fl)) fl.insertAdjacentHTML('beforeend', '<span class="field-err">Поставьте оценку от 1 до 5</span>'); return; }
      if (t && t.length < 10) { E.fieldErr(f.t, 'Напишите хотя бы пару предложений — от 10 символов'); return; }
      E.set('myreviews', [{ key: 'my-' + Date.now(), pid: p.id, r: rate, t, pros: f.pros.value.trim(), cons: f.cons.value.trim(), name: u.name + (u.surname ? ' ' + u.surname[0] + '.' : ''), t0: Date.now() }].concat(myRevs()));
      if (t) E.berries.add(50, 'Отзыв о товаре «' + p.name + '»');
      m.close(); E.toast(t ? 'Спасибо за отзыв! +50 ягодок уже на счёте' : 'Спасибо за оценку!', { icon: 'star-o' }); render();
    }
  });
}

/* ---------- ягодки ---------- */
function berries() {
  const lv = E.club.level(), nx = E.club.next(), sp = E.club.spent(), log = E.berries.log();
  const pct = nx ? Math.min(100, Math.round((sp - lv.from) / (nx.from - lv.from) * 100)) : 100;
  return `${head('Ягодки', '<a class="btn btn-secondary" href="club.html">Как это работает</a>')}
  <div class="bhero"><div><div class="bal">${E.berry()}<div><b>${E.fmt(E.berries.balance())}</b><span>${E.plural(E.berries.balance(), 'ягодка', 'ягодки', 'ягодок')} на счёте · 1 ягодка = 1 ₽</span></div></div>
    <p class="bh-note">Списывайте ягодками до 30% стоимости заказа. Ягодки действуют 365 дней с момента начисления.</p></div>
    <div class="bhero-lvl"><small>Ваш уровень</small><b>${esc(lv.name)} · ${lv.rate}%</b><div class="lvl"><div class="lvl-bar"><i style="width:${pct}%"></i></div><div class="lvl-meta"><span>${money(sp)}</span><span>${nx ? 'до ' + esc(nx.name) + ': ' + money(nx.from - sp) : 'максимум'}</span></div></div></div></div>
  <div class="acc-grid2 acc-sec">${[['star-o', 'Отзывы', '50 ягодок за отзыв с текстом о купленном товаре', '#reviews'], ['users', 'Пригласите друга', '300 ягодок вам и другу после его первого заказа', '']].map(([i, t, d, h]) => `<${h ? `a href="${h}"` : 'button type="button" data-invite'} class="card-b earn-w">${E.icon(i)}<div><b>${t}</b><span>${d}</span></div>${E.icon('chev-r', 'i-20')}</${h ? 'a' : 'button'}>`).join('')}</div>
  <div class="card-b acc-sec"><h3>История начислений</h3><div class="tbl-wrap"><table class="tbl hist"><thead><tr><th>Дата</th><th>Операция</th><th style="text-align:right">Ягодки</th></tr></thead><tbody>
    ${log.map(x => `<tr><td class="nw">${dmy(x.t)}</td><td>${esc(x.title)}</td><td style="text-align:right" class="${x.v > 0 ? 'plus' : 'minus'}">${x.v > 0 ? '+' : '−'}${E.fmt(Math.abs(x.v))}</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- адреса ---------- */
function addresses() {
  const a = E.get('addresses', { points: [], courier: [] }), cur = E.point().id;
  const pts = [...new Set([cur].concat(a.points || []))].filter(id => E.PT[id]);
  return `${head('Адреса доставки')}
  <div class="card-b acc-sec0"><h3>Пункты выдачи<button type="button" class="link-btn" data-addpt>${E.icon('plus', 'i-18')}Добавить</button></h3>
    ${pts.map(id => { const p = E.PT[id], def = id === cur; return `<div class="addr-card${def ? ' def' : ''}"><span class="pt-ic${/постамат/i.test(p.type) ? ' locker' : ''}">${E.icon(/постамат/i.test(p.type) ? 'box' : 'store')}</span><div><b>${esc(p.addr)}${def ? ' <span class="pill pill-violet">Основной</span>' : ''}</b><span>${esc(p.city)} · ${esc(p.type)} · ${esc(p.hours)}${p.metro ? ' · ' + esc(p.metro) : ''}</span></div>
      <div class="acts">${def ? '' : `<button type="button" class="btn btn-outline btn-sm" data-ptdef="${id}">Сделать основным</button><button type="button" class="icon-btn danger" data-ptdel="${id}" aria-label="Удалить пункт">${E.icon('trash', 'i-18')}</button>`}</div></div>`; }).join('')}</div>
  <div class="card-b acc-sec"><h3>Адреса для курьера<button type="button" class="link-btn" data-addr="">${E.icon('plus', 'i-18')}Добавить</button></h3>
    ${(a.courier || []).length ? a.courier.map(c => `<div class="addr-card${c.def ? ' def' : ''}"><span class="pt-ic">${E.icon('home')}</span><div><b>${esc(c.city)}, ${esc(c.street)}${c.apt ? ', ' + esc(/^\d/.test(c.apt) ? 'кв. ' + c.apt : c.apt) : ''}${c.def ? ' <span class="pill pill-violet">Основной</span>' : ''}</b><span>${[c.entrance && 'подъезд ' + c.entrance, c.floor && 'этаж ' + c.floor, c.intercom && 'домофон ' + c.intercom, c.comment].filter(Boolean).map(esc).join(' · ') || 'Без уточнений'}</span></div>
      <div class="acts">${c.def ? '' : `<button type="button" class="btn btn-outline btn-sm" data-adef="${c.id}">Основной</button>`}<button type="button" class="icon-btn" data-addr="${c.id}" aria-label="Изменить адрес">${E.icon('edit', 'i-18')}</button><button type="button" class="icon-btn danger" data-adel="${c.id}" aria-label="Удалить адрес">${E.icon('trash', 'i-18')}</button></div></div>`).join('') : '<p class="m-text">Добавьте адрес, чтобы заказывать доставку курьером.</p>'}</div>`;
}
function addrModal(id) {
  const a = E.get('addresses', { points: [], courier: [] }), c = (a.courier || []).find(x => x.id === id) || { city: 'Москва' };
  const fld = (n, l, ph = '', w = '') => `<div class="field${w}"><label for="ad-${n}">${l}</label><input class="input" id="ad-${n}" name="${n}" value="${esc(c[n] || '')}" placeholder="${ph}"></div>`;
  const m = E.modal({ title: id ? 'Изменить адрес' : 'Новый адрес', html: `<form class="m-form" data-af novalidate>
    <div class="field"><label for="ad-city">Город</label><select class="input" id="ad-city" name="city">${E.cities().map(x => `<option${x === c.city ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
    ${fld('street', 'Улица и дом', 'ул. Тверская, 7')}
    <div class="f-row4">${fld('apt', 'Квартира / офис')}${fld('entrance', 'Подъезд')}${fld('floor', 'Этаж')}${fld('intercom', 'Домофон')}</div>
    <div class="field"><label for="ad-comment">Комментарий курьеру</label><input class="input" id="ad-comment" name="comment" value="${esc(c.comment || '')}" placeholder="Например: позвонить за 30 минут"></div>
    <label class="check"><input type="checkbox" name="def"${c.def || !(a.courier || []).length ? ' checked' : ''}><span>Сделать основным</span></label></form>`,
  foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-asave>Сохранить</button>' });
  $('[data-asave]', m.el).addEventListener('click', () => {
    const f = $('[data-af]', m.el), v = n => f[n].value.trim();
    if (v('street').length < 5) { E.fieldErr(f.street, 'Укажите улицу и номер дома'); f.street.focus(); return; }
    const n = { id: id || 'a' + Date.now(), city: v('city'), street: v('street'), apt: v('apt'), entrance: v('entrance'), floor: v('floor'), intercom: v('intercom'), comment: v('comment'), def: f.def.checked };
    let l = (a.courier || []).filter(x => x.id !== n.id); if (n.def) l.forEach(x => { x.def = false; }); l = id ? (a.courier || []).map(x => x.id === id ? n : Object.assign(x, n.def ? { def: false } : {})) : l.concat(n);
    if (!l.some(x => x.def) && l[0]) l[0].def = true;
    E.set('addresses', Object.assign(a, { courier: l })); m.close(); E.toast(id ? 'Адрес обновлён' : 'Адрес добавлен', { icon: 'home' }); render();
  });
}

/* ---------- оплата ---------- */
const BR = { visa: 'VISA', mir: 'МИР', mc: 'Mastercard' };
const luhn = n => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return s % 10 === 0; };
function payments() {
  const cards = E.get('cards', []), u = E.user();
  return `${head('Способы оплаты')}
  <div class="bcards">${cards.map(c => `<div><div class="bank bank-${c.brand}"><div class="bank-top"><b>${BR[c.brand]}</b>${c.def ? '<span class="def">Основная</span>' : ''}</div><div class="bank-num">•••• ${c.last4}</div><div class="bank-bot"><span>${esc((u.name + ' ' + u.surname).toUpperCase())}</span><span>${c.exp}</span></div></div>
    <div class="bank-acts">${c.def ? '' : `<button type="button" class="btn btn-outline btn-sm" data-cdef="${c.id}">Сделать основной</button>`}<button type="button" class="btn btn-outline btn-sm danger-b" data-cdel="${c.id}">${E.icon('trash', 'i-16')}Удалить</button></div></div>`).join('')}
    <button type="button" class="bank-add" data-cadd>${E.icon('plus')}Добавить карту<small>Visa, Mastercard, МИР</small></button></div>
  <div class="card-b acc-sec"><h3>Другие способы</h3>${[['zap', 'СБП', 'Оплата через приложение банка без ввода карты'], ['cal', 'Ежевика Сплит', 'Оплата частями: 4 платежа раз в две недели без переплаты'], ['cash', 'При получении', 'Картой или наличными в пункте выдачи и курьеру']].map(([i, t, d]) => `<div class="set-row"><div class="sr-ic">${E.icon(i)}<div><b>${t}</b><span>${d}</span></div></div><span class="pill pill-green">Доступно</span></div>`).join('')}</div>
  <p class="acc-fine">${E.icon('lock', 'i-16')}Данные карт хранятся у платёжного провайдера по стандарту PCI DSS — Ежевика не видит полный номер карты.</p>`;
}
function cardModal() {
  const m = E.modal({ title: 'Новая карта', html: `<form class="m-form" data-cf novalidate><div class="bank bank-new" data-cprev><div class="bank-top"><b data-cbr>Карта</b></div><div class="bank-num" data-cnum>•••• •••• •••• ••••</div><div class="bank-bot"><span>${esc((E.user().name + ' ' + E.user().surname).toUpperCase())}</span><span data-cexp>ММ/ГГ</span></div></div>
    <div class="field"><label for="cd-n">Номер карты</label><input class="input" id="cd-n" name="num" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="19"></div>
    <div class="f-row2"><div class="field"><label for="cd-e">Срок действия</label><input class="input" id="cd-e" name="exp" inputmode="numeric" autocomplete="cc-exp" placeholder="ММ/ГГ" maxlength="5"></div><div class="field"><label for="cd-c">CVC</label><input class="input" id="cd-c" name="cvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="•••" maxlength="3"></div></div>
    <p class="field-hint">Демо: подойдёт любой корректный номер, например 4242 4242 4242 4242. Деньги не списываются.</p></form>`,
  foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-csave>Привязать карту</button>' });
  const f = $('[data-cf]', m.el);
  const brand = d => d[0] === '4' ? 'visa' : d[0] === '2' ? 'mir' : d[0] === '5' ? 'mc' : '';
  f.addEventListener('input', e => {
    const t = e.target; E.fieldErr(t, '');
    if (t.name === 'num') { const d = t.value.replace(/\D/g, '').slice(0, 16); t.value = d.replace(/(\d{4})(?=\d)/g, '$1 '); const b = brand(d); $('[data-cprev]', m.el).className = 'bank ' + (b ? 'bank-' + b : 'bank-new'); $('[data-cbr]', m.el).textContent = b ? BR[b] : 'Карта'; $('[data-cnum]', m.el).textContent = (d + '•'.repeat(16 - d.length)).replace(/(.{4})(?=.)/g, '$1 '); }
    if (t.name === 'exp') { let d = t.value.replace(/\D/g, '').slice(0, 4); if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2); t.value = d; $('[data-cexp]', m.el).textContent = d || 'ММ/ГГ'; }
    if (t.name === 'cvc') t.value = t.value.replace(/\D/g, '').slice(0, 3);
  });
  $('[data-csave]', m.el).addEventListener('click', () => {
    const d = f.num.value.replace(/\D/g, ''), [mm, yy] = f.exp.value.split('/').map(Number), now = new Date();
    let ok = true;
    if (d.length !== 16 || !luhn(d) || !brand(d)) { E.fieldErr(f.num, 'Проверьте номер карты'); ok = false; }
    if (!mm || mm > 12 || !yy || (2000 + yy) * 12 + mm < now.getFullYear() * 12 + now.getMonth() + 1) { E.fieldErr(f.exp, 'Проверьте срок действия'); ok = false; }
    if (f.cvc.value.length !== 3) { E.fieldErr(f.cvc, '3 цифры на обороте'); ok = false; }
    if (!ok) return;
    const cards = E.get('cards', []);
    cards.push({ id: 'c' + Date.now(), brand: brand(d), last4: d.slice(-4), exp: f.exp.value, def: !cards.length });
    E.set('cards', cards); m.close(); E.toast('Карта •••• ' + d.slice(-4) + ' привязана', { icon: 'card' }); render();
  });
}

/* ---------- уведомления ---------- */
function notifications() {
  const l = notifs(), un = l.filter(isUnread).length;
  return `${head('Уведомления', un ? '<button type="button" class="btn btn-secondary" data-nall>Прочитать все</button>' : '')}
  <div class="notifs">${l.map(n => `<a class="notif${isUnread(n) ? ' unread' : ''}" href="${n.href}" data-nid="${n.id}"><span class="notif-ic">${E.icon(n.ic)}</span><div><b>${esc(n.t)}</b><p>${esc(n.p)}</p><small>${E.when(n.ts)}, ${tm(n.ts)}</small></div></a>`).join('')}</div>`;
}

/* ---------- настройки ---------- */
function settings() {
  const u = E.user(), s = E.get('settings', { email: true, sms: true, push: true, news: false });
  const sw = (k, t, d) => `<label class="set-row"><div><b>${t}</b><span>${d}</span></div><span class="switch"><input type="checkbox" data-set="${k}"${s[k] ? ' checked' : ''} aria-label="${t}"></span></label>`;
  return `${head('Профиль и настройки')}
  <form class="card-b acc-sec0" data-prof novalidate><h3>Личные данные</h3>
    <div class="prof-grid">
      <div class="field"><label for="pf-n">Имя</label><input class="input" id="pf-n" name="name" value="${esc(u.name)}" autocomplete="given-name"></div>
      <div class="field"><label for="pf-s">Фамилия</label><input class="input" id="pf-s" name="surname" value="${esc(u.surname)}" autocomplete="family-name"></div>
      <div class="field"><label for="pf-b">Дата рождения</label><input class="input" id="pf-b" name="birthday" type="date" value="${esc(u.birthday || '')}"><span class="field-hint">Пришлём подарок от Ягодного клуба</span></div>
      <div class="field"><span class="lbl">Пол</span><div class="seg seg-f" data-gender>${[['f', 'Женский'], ['m', 'Мужской']].map(([k, t]) => `<button type="button" data-g="${k}" class="${u.gender === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="field"><label for="pf-p">Телефон</label><input class="input" id="pf-p" name="phone" type="tel" value="${esc(fmtPhone(u.phone))}" data-phone autocomplete="tel"></div>
      <div class="field"><label for="pf-e">Электронная почта</label><input class="input" id="pf-e" name="email" type="email" value="${esc(u.email)}" autocomplete="email"></div>
    </div>
    <div class="prof-f"><button class="btn btn-primary" type="submit">Сохранить изменения</button><span class="field-hint">Покупатель с ${u.since || 2021} года</span></div>
  </form>
  <div class="card-b acc-sec"><h3>Уведомления</h3>${sw('push', 'Push-уведомления', 'Статусы заказов и ответы продавцов')}${sw('sms', 'SMS', 'Коды получения и важные изменения по заказам')}${sw('email', 'Электронная почта', 'Чеки, документы и статусы возвратов')}${sw('news', 'Скидки и новости', 'Персональные предложения и распродажи — не чаще раза в неделю')}</div>
  <div class="card-b acc-sec"><h3>Безопасность</h3>
    <div class="set-row"><div><b>Пароль</b><span>Последнее изменение — 3 месяца назад</span></div><button type="button" class="btn btn-outline btn-sm" data-pass>Изменить</button></div>
    <div class="set-row"><div><b>Активные сеансы</b><span>Этот браузер · ${esc(navigator.platform || 'устройство')} · сейчас</span></div><button type="button" class="btn btn-outline btn-sm" data-allout>Выйти везде</button></div>
    <div class="set-row"><div><b>Удаление аккаунта</b><span>Удалим заказы, ягодки и данные с этого устройства</span></div><button type="button" class="btn btn-outline btn-sm danger-b" data-delacc>Удалить</button></div></div>`;
}
function passModal() {
  const m = E.modal({ title: 'Смена пароля', html: `<form class="m-form" data-pf novalidate><div class="field"><label for="ps-o">Текущий пароль</label><input class="input" id="ps-o" name="old" type="password" autocomplete="current-password"></div><div class="field"><label for="ps-n">Новый пароль</label><input class="input" id="ps-n" name="nw" type="password" autocomplete="new-password" placeholder="Не меньше 6 символов"></div><div class="field"><label for="ps-r">Повторите пароль</label><input class="input" id="ps-r" name="rp" type="password" autocomplete="new-password"></div></form>`, foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-psave>Сохранить</button>' });
  $('[data-psave]', m.el).addEventListener('click', () => {
    const f = $('[data-pf]', m.el); let ok = true;
    if (f.old.value !== E.DEMO.pass) { E.fieldErr(f.old, 'Неверный пароль. В демо — demo123'); ok = false; } else E.fieldErr(f.old, '');
    if (f.nw.value.length < 6) { E.fieldErr(f.nw, 'Не меньше 6 символов'); ok = false; } else E.fieldErr(f.nw, '');
    if (f.rp.value !== f.nw.value) { E.fieldErr(f.rp, 'Пароли не совпадают'); ok = false; } else E.fieldErr(f.rp, '');
    if (!ok) return;
    m.close(); E.toast('Готово! В демо-версии для входа по-прежнему используется пароль demo123', { icon: 'lock' });
  });
}

/* ---------- события ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-logout]')) { E.confirm({ title: 'Выйти из аккаунта?', text: 'Корзина и избранное сохранятся на этом устройстве.', ok: 'Выйти', onOk: () => { E.logout(); E.flash('Вы вышли из аккаунта', { icon: 'logout' }); location.href = 'index.html'; } }); return; }
  const ot = t.closest('[data-otab]'); if (ot) { ordTab = ot.dataset.otab; render(); return; }
  if (t.closest('[data-oq-clear]')) { ordQ = ''; render(); return; }
  const cd = t.closest('[data-code]'); if (cd) { const o = E.order(cd.dataset.code), pt = E.PT[o.point]; E.modal({ title: 'Код получения', cls: 'm-code', html: `<div class="code-m"><div class="qrbox">${qr(o.code)}</div><div class="code">${o.code}</div><p class="m-text">Заказ ${o.num} · ${esc(pt.addr)}<br>Хранится до ${E.dm(o.keep || o.dlv + 7 * DAY)}</p></div>` }); return; }
  const rp = t.closest('[data-repeat]'); if (rp) { const o = E.order(rp.dataset.repeat); o.items.forEach(it => { if (P(it.id)) E.cart.add(it.id, it.size, it.qty, true); }); E.toast(`Добавили в корзину ${pl(o.items.reduce((s, x) => s + x.qty, 0), 'товар', 'товара', 'товаров')}`, { icon: 'cart', action: ['В корзину', 'cart.html'] }); return; }
  const ag = t.closest('[data-again]'); if (ag) { E.cart.add(+ag.dataset.again, ag.dataset.size || null); return; }
  const cn = t.closest('[data-cancel]'); if (cn) { const num = cn.dataset.cancel; E.confirm({ title: 'Отменить заказ?', text: `Заказ ${num} будет отменён, деньги вернутся на карту в течение 1–3 дней. Списанные ягодки вернём сразу.`, ok: 'Отменить заказ', cancel: 'Не отменять', danger: true, onOk: () => { E.cancelOrder(num); E.toast('Заказ ' + num + ' отменён', { icon: 'xc' }); render(); } }); return; }
  const rv = t.closest('[data-review]'); if (rv) { reviewModal(+rv.dataset.review); return; }
  const rt = t.closest('[data-ret]'); if (rt) { returnModal(rt.dataset.ret); return; }
  const rd = t.closest('[data-rvdel]'); if (rd) { E.confirm({ title: 'Удалить отзыв?', text: 'Отзыв исчезнет со страницы товара. Начисленные ягодки останутся у вас.', ok: 'Удалить', danger: true, onOk: () => { E.set('myreviews', myRevs().filter(r => r.key !== rd.dataset.rvdel)); E.toast('Отзыв удалён', { icon: 'trash' }); render(); } }); return; }
  if (t.closest('[data-addpt]')) { E.pickup(id => { const a = E.get('addresses', { points: [], courier: [] }); a.points = [...new Set([id].concat(a.points || []))]; E.set('addresses', a); render(); }, { title: 'Добавить пункт выдачи' }); return; }
  const pd = t.closest('[data-ptdef]'); if (pd) { E.set('point', pd.dataset.ptdef); E.toast('Основной пункт выдачи изменён', { icon: 'pin' }); render(); return; }
  const px = t.closest('[data-ptdel]'); if (px) { const a = E.get('addresses', { points: [], courier: [] }); a.points = (a.points || []).filter(x => x !== px.dataset.ptdel); E.set('addresses', a); E.toast('Пункт удалён из списка', { icon: 'trash' }); render(); return; }
  const ad = t.closest('[data-addr]'); if (ad) { addrModal(ad.dataset.addr); return; }
  const adf = t.closest('[data-adef]'); if (adf) { const a = E.get('addresses'); a.courier.forEach(x => { x.def = x.id === adf.dataset.adef; }); E.set('addresses', a); render(); return; }
  const adl = t.closest('[data-adel]'); if (adl) { E.confirm({ title: 'Удалить адрес?', text: 'Адрес пропадёт из списка доставки курьером.', ok: 'Удалить', danger: true, onOk: () => { const a = E.get('addresses'); a.courier = a.courier.filter(x => x.id !== adl.dataset.adel); if (a.courier.length && !a.courier.some(x => x.def)) a.courier[0].def = true; E.set('addresses', a); render(); } }); return; }
  if (t.closest('[data-cadd]')) { cardModal(); return; }
  const cdf = t.closest('[data-cdef]'); if (cdf) { const c = E.get('cards', []); c.forEach(x => { x.def = x.id === cdf.dataset.cdef; }); E.set('cards', c); render(); return; }
  const cdl = t.closest('[data-cdel]'); if (cdl) { E.confirm({ title: 'Удалить карту?', text: 'Карту можно будет привязать снова при оформлении заказа.', ok: 'Удалить', danger: true, onOk: () => { let c = E.get('cards', []).filter(x => x.id !== cdl.dataset.cdel); if (c.length && !c.some(x => x.def)) c[0].def = true; E.set('cards', c); E.toast('Карта удалена', { icon: 'trash' }); render(); } }); return; }
  if (t.closest('[data-nall]')) { E.set('nread', notifs().map(n => n.id)); render(); return; }
  const ni = t.closest('[data-nid]'); if (ni) { E.set('nread', [...readSet(), ni.dataset.nid]); if (ni.getAttribute('href').startsWith('#')) { e.preventDefault(); const h = ni.getAttribute('href'); if (location.hash === h) render(); else location.hash = h; } return; }
  if (t.closest('[data-invite]')) { E.copy(location.origin + location.pathname.replace(/[^/]*$/, '') + 'index.html?ref=ANNA300', 'Ссылка-приглашение скопирована'); return; }
  const g = t.closest('[data-g]'); if (g) { $$('[data-g]').forEach(b => b.classList.toggle('on', b === g)); return; }
  if (t.closest('[data-pass]')) { passModal(); return; }
  if (t.closest('[data-allout]')) { E.confirm({ title: 'Выйти на всех устройствах?', text: 'Понадобится снова войти на каждом устройстве, включая это.', ok: 'Выйти везде', onOk: () => { E.logout(); E.flash('Вы вышли на всех устройствах', { icon: 'logout' }); location.href = 'login.html'; } }); return; }
  if (t.closest('[data-delacc]')) { E.confirm({ title: 'Удалить аккаунт?', text: 'Демо-данные (заказы, отзывы, адреса, карты) на этом устройстве будут сброшены. Действие нельзя отменить.', ok: 'Удалить аккаунт', danger: true, onOk: () => { Object.keys(localStorage).filter(k => k.startsWith('ezh:')).forEach(k => localStorage.removeItem(k)); E.logout(); E.flash('Аккаунт удалён, демо-данные сброшены', { icon: 'trash' }); location.href = 'index.html'; } }); }
});
document.addEventListener('input', e => { if (e.target.matches('[data-oq]')) { ordQ = e.target.value; const pos = e.target.selectionStart; render(); const i = $('[data-oq]'); i.focus(); i.setSelectionRange(pos, pos); } });
document.addEventListener('change', e => { const t = e.target; if (t.matches('[data-set]')) { const s = E.get('settings', {}); s[t.dataset.set] = t.checked; E.set('settings', s); E.toast('Настройки уведомлений сохранены', { icon: 'bell' }); } });
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-prof]'); if (!f) return; e.preventDefault();
  const v = n => f[n].value.trim(), ph = v('phone').replace(/\D/g, '');
  let ok = true;
  [['name', v('name') ? '' : 'Укажите имя'], ['phone', ph.length === 11 ? '' : 'Введите номер полностью'], ['email', E.validEmail(v('email')) ? '' : 'Проверьте адрес почты']].forEach(([k, m]) => { E.fieldErr(f[k], m); if (m) ok = false; });
  if (!ok) return;
  const g = $('[data-g].on'); E.set('profile', Object.assign(E.get('profile', {}), { name: v('name'), surname: v('surname'), birthday: v('birthday'), phone: '+' + ph, email: v('email'), gender: g ? g.dataset.g : '' }));
  E.toast('Данные профиля сохранены', { icon: 'check' }); render();
});
window.addEventListener('hashchange', () => render(true));
E.on('session', () => { if (!E.user()) location.replace('login.html'); });
E.on('fav', () => { if (route === 'overview' || route === 'purchases') render(); });
render();
$$('[data-phone]', root).forEach(E.maskPhone);
document.addEventListener('focusin', e => { if (e.target.matches('[data-phone]') && !e.target._m) { e.target._m = 1; E.maskPhone(e.target); } });
})();
