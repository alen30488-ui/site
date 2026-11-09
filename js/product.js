/* Ежевика — страница товара: галерея, размеры, покупка, доставка, описание, характеристики, отзывы и вопросы. */
(() => {
'use strict';
const E = window.EZH, D = E.D, $ = E.$, $$ = E.$$;
const root = $('#pp-root'); if (!root) return;
const id = +E.params().get('id'), p = E.P[id];
if (!p) {
  document.title = 'Товар не найден — Ежевика';
  root.innerHTML = `<div class="wrap">${E.crumbs([['Товар не найден', null]])}${E.empty({ icon: 'search', title: 'Товар не найден', text: 'Возможно, он закончился или ссылка устарела. Посмотрите похожие товары в каталоге.', btns: '<a class="btn btn-primary" href="catalog.html">В каталог</a><a class="btn btn-outline" href="index.html">На главную</a>' })}</div>`;
  return;
}
const cat = E.C[p.cat], seller = E.S[p.seller], disc = E.disc(p);
const R = E.rng(p.id * 7919);
const pick = a => a[Math.floor(R() * a.length)];
let size = null;
E.recent.add(p.id);
document.title = `${p.name} — купить за ${E.fmt(p.price)} ₽ на Ежевике`;

/* ---------- справочные тексты ---------- */
const COUNTRY = ['Россия', 'Китай', 'Турция', 'Узбекистан', 'Беларусь', 'Вьетнам', 'Италия', 'Корея'];
const EXTRA = {
  wear: 'Модель свободно сочетается с базовым гардеробом. Ткань не теряет форму после стирки, а швы обработаны аккуратно, без торчащих ниток.',
  shoes: 'Колодка повторяет естественную форму стопы, поэтому обувь не нужно разнашивать. Подошва гнётся в месте сгиба и не скользит.',
  tech: 'Товар поставляется в оригинальной упаковке производителя, с инструкцией на русском языке и официальной гарантией.',
  home: 'Подходит для повседневного использования и в подарок: товар упакован в фирменную коробку, которую не стыдно вручить.',
  kids: 'Материалы безопасны для детей и подтверждены сертификатами соответствия. Без острых краёв и мелких деталей.',
  beauty: 'Средство протестировано дерматологами. Срок годности после вскрытия указан на упаковке. Участвует в акции «1+1=3».',
  sport: 'Выдерживает регулярные тренировки дома и в зале. Материал легко протирается и не впитывает запахи.',
  pets: 'Проверено нашими хвостатыми тестировщиками: питомцы быстро привыкают, а материалы легко чистятся.',
  food: 'Хранится при комнатной температуре. Отличный вариант для подарочной корзины к праздникам.',
  books: 'Бумага плотная, без просвечивания. Красивое оформление — можно дарить без дополнительной упаковки.',
};
const PERKS = {
  wear: ['Можно примерить в пункте выдачи перед оплатой', 'Соответствует размерной сетке — проверьте таблицу размеров', 'Бережная доставка в чехле, без заломов'],
  shoes: ['Бесплатная примерка в пункте выдачи', 'Натуральные материалы и мягкая стелька', 'Возврат, если размер не подошёл'],
  tech: ['Официальная гарантия производителя', 'Проверяем каждый товар перед отправкой', 'Можно оплатить частями без переплаты'],
  home: ['Безопасные материалы для дома', 'Надёжная упаковка — доставим без сколов', 'Подходит в подарок'],
  kids: ['Сертифицировано для детей', 'Гипоаллергенные материалы', 'Яркий подарок на праздник'],
  beauty: ['Оригинальная продукция от официального поставщика', 'Третий товар в подарок по акции 1+1=3', 'Хранение с соблюдением температурного режима'],
  sport: ['Проверено на прочность', 'Удобно хранить и брать с собой', 'Подходит для начинающих и профи'],
  pets: ['Безопасно для животных', 'Легко мыть и чистить', 'Рекомендуют ветеринары'],
  food: ['Свежая партия', 'Красивая подарочная упаковка', 'Хранится без холодильника'],
  books: ['Качественная печать', 'Плотная бумага', 'Подойдёт в подарок'],
};
const QA = {
  wear: [['Маломерит или большемерит?', 'Размер соответствует таблице. Если сомневаетесь между двумя размерами, рекомендуем выбрать больший.'], ['Можно ли стирать в машинке?', 'Да, в деликатном режиме при 30 °C. Не отжимайте на высоких оборотах.']],
  shoes: [['Подойдёт на широкую стопу?', 'Колодка средней полноты. При широкой стопе советуем взять на размер больше.'], ['Есть ли утеплитель?', 'Информацию об утеплителе смотрите в характеристиках. Модель рассчитана на сезон, указанный в описании.']],
  tech: [['Есть ли официальная гарантия?', 'Да, гарантия производителя — 12 месяцев. Гарантийный талон лежит в коробке.'], ['Работает с iPhone и Android?', 'Да, устройство совместимо с iOS 15+ и Android 9+.']],
  home: [['Какие точные размеры?', 'Все размеры указаны в характеристиках. Допустимое отклонение — до 1 см.'], ['Есть ли подарочная упаковка?', 'Товар упакован в фирменную коробку, дополнительно можно заказать подарочный пакет.']],
  kids: [['С какого возраста можно?', 'Рекомендуемый возраст указан в характеристиках. Все материалы безопасны для детей.'], ['Есть ли сертификат?', 'Да, товар сертифицирован по ТР ТС, копию сертификата пришлём по запросу.']],
  beauty: [['Подходит для чувствительной кожи?', 'Да, средство гипоаллергенно. Перед первым использованием советуем сделать тест на запястье.'], ['Какой срок годности?', 'Не менее 18 месяцев с даты доставки.']],
  sport: [['Какая максимальная нагрузка?', 'Допустимая нагрузка указана в характеристиках. Для домашних тренировок запас прочности достаточный.'], ['Удобно ли хранить?', 'Да, товар компактный и легко помещается в шкаф или под кровать.']],
  pets: [['Подойдёт для крупного питомца?', 'Ориентируйтесь на размеры в характеристиках — для питомцев до 8 кг подходит отлично.'], ['Можно стирать?', 'Да, съёмные части можно стирать при 30 °C.']],
  food: [['Какой срок годности?', 'Срок годности — не менее 6 месяцев на момент доставки.'], ['Есть ли аллергены?', 'Состав и возможные аллергены указаны на упаковке и в характеристиках.']],
  books: [['Какая плотность бумаги?', 'Плотность бумаги — 100 г/м², чернила не просвечивают.'], ['Подойдёт для подарка?', 'Да, красивое оформление и плотная обложка.']],
};
const rg = D.reviews[p.rg] ? p.rg : 'home';

/* ---------- отзывы ---------- */
const dist = (() => { const d = Math.max(0, Math.min(1, p.rating - 4)); let w = [0.45 + 0.5 * d, 0.36 - 0.24 * d, 0.11 - 0.08 * d, 0.05 - 0.035 * d, 0.03 - 0.02 * d]; const s = w.reduce((a, b) => a + b, 0); return w.map(x => x / s); })();
const myRevs = () => E.get('myreviews', []).filter(r => r.pid === p.id);
const genRevs = (() => {
  const pool = D.reviews[rg], n = Math.min(p.reviews, 24), out = [];
  const OPEN = ['', '', 'Заказываю здесь не первый раз. ', 'Пришло быстрее, чем обещали. ', 'Упаковано аккуратно, без повреждений. ', 'По акции цена была очень приятная. ', 'Выбирали долго и остановились на этом варианте. ', 'Забираю заказы в пункте у дома — удобно. '];
  const CLOSE = ['', '', ' Рекомендую!', ' Буду заказывать ещё.', ' Спасибо продавцу!', ' За свою цену — отлично.', ' Советую к покупке.'];
  const NEG = ['Ожидала большего.', 'В целом нормально, но есть нюансы.', 'Качество среднее за свои деньги.', 'Есть небольшие недочёты.'];
  const gender = t => /(Взяла|заказала|Ожидала|Муж )/.test(t) ? 'f' : /(доволен|ожидал\b|Брал )/.test(t) ? 'm' : '';
  const half = D.names.length / 2;
  const order = pool.map((_, i) => i).sort(() => R() - 0.5);
  const used = new Set();
  for (let i = 0; i < n; i++) {
    const x = R(); let r = 5, acc = 0; for (let k = 0; k < 5; k++) { acc += dist[k]; if (x <= acc) { r = 5 - k; break; } }
    const src = pool[order[i % order.length]];
    const neg = r <= 3;
    let t;
    for (let tries = 0; tries < 8; tries++) {
      t = neg ? NEG[Math.floor(R() * NEG.length)] + ' ' + (src.cons ? 'Минус: ' + src.cons.toLowerCase() + '.' : 'Доставили быстро.') : OPEN[Math.floor(R() * OPEN.length)] + src.t + CLOSE[Math.floor(R() * CLOSE.length)];
      if (!used.has(t)) break;
    }
    used.add(t);
    const g = gender(t), ni = g === 'f' ? Math.floor(R() * half) : g === 'm' ? half + Math.floor(R() * half) : Math.floor(R() * D.names.length);
    const ago = Math.floor(R() * 160) + 1;
    out.push({ key: p.id + '-' + i, name: D.names[ni] + ' ' + 'АБВГДЕЗИКЛМНОПРСТ'[Math.floor(R() * 17)] + '.', r, t, pros: neg ? '' : src.pros, cons: src.cons, t0: Date.now() - ago * E.DAY - Math.floor(R() * 8e7),
      likes: Math.floor(R() * (r >= 4 ? 60 : 14)), size: p.sizes ? p.sizes[Math.floor(R() * p.sizes.length)] : null, fit: p.sizes ? ['Соответствует размеру', 'Соответствует размеру', 'Немного маломерит', 'Соответствует размеру'][Math.floor(R() * 4)] : null,
      ans: (r <= 3 || R() < 0.18) ? (r <= 3 ? 'Спасибо за обратную связь! Передали замечание поставщику. Если товар не подошёл, оформите возврат в личном кабинете — вернём деньги за 1–3 дня.' : 'Спасибо за тёплый отзыв! Рады, что покупка понравилась.') : null });
  }
  return out;
})();
let rvFilter = 'all', rvSort = 'useful', rvShown = 6;

/* ---------- разметка ---------- */
const specs = p.specs.concat([['Бренд', p.brand], ['Цвет', p.color], ['Страна производства', COUNTRY[p.id % COUNTRY.length]], p.rg === 'tech' ? ['Гарантия', '12 месяцев'] : null, ['Артикул', p.article], ['Продавец', seller.name]].filter(Boolean));
const dlRow = ([k, v]) => `<div class="dl-row"><dt>${E.esc(k)}</dt><span class="lead"></span><dd>${E.esc(v)}</dd></div>`;
const slides = [['', `<img src="${p.img}" alt="${E.esc(p.name)}" width="480" height="640" fetchpriority="high">`], ['z1', `<img src="${p.img}" alt="${E.esc(p.name)} — детали" width="480" height="640" loading="lazy">`], ['z2', `<img src="${p.img}" alt="${E.esc(p.name)} — крупный план" width="480" height="640" loading="lazy">`],
  ['info-slide', `<div>${E.berry()}<h3>Почему ${E.esc(p.brand)} выбирают на Ежевике</h3></div><ul><li><span>Средняя оценка</span><b>${E.rate(p.rating)} из 5 · ${E.pl(p.reviews, 'оценка', 'оценки', 'оценок')}</b></li><li><span>Уже купили</span><b>${E.pl(p.sold, 'раз', 'раза', 'раз')}</b></li><li><span>Доставка</span><b>${E.dayLabel(p.days)} — бесплатно в пункт выдачи</b></li></ul>`]];
const sameSub = D.products.filter(x => x.id !== p.id && x.cat === p.cat).sort((a, b) => (b.sub === p.sub) - (a.sub === p.sub) || b.sold - a.sold).slice(0, 12);
const bySeller = D.products.filter(x => x.id !== p.id && x.seller === p.seller && !sameSub.includes(x)).sort((a, b) => b.sold - a.sold).slice(0, 12);
const qaList = (QA[rg] || QA.home).map(([q, a], i) => ({ q, a, name: D.names[(p.id + i * 7) % D.names.length], t0: Date.now() - (12 + i * 17 + p.id % 9) * E.DAY }));
const myQa = () => E.get('qa', []).filter(x => x.pid === p.id);

root.innerHTML = `<div class="wrap">${E.crumbs([[cat.name, E.url.cat(cat.id)], [E.subName(p.cat, p.sub), E.url.cat(p.cat, p.sub)]])}
<div class="pp">
  <div class="gal">
    <div class="gal-thumbs" role="tablist" aria-label="Фото товара">${slides.map(([c], i) => `<button type="button" class="${c === 'info-slide' ? 'ti' : c}${i ? '' : ' on'}" data-go="${i}" aria-label="Фото ${i + 1}">${c === 'info-slide' ? E.icon('info') : `<img src="${p.img}" alt="" loading="lazy">`}</button>`).join('')}</div>
    <div class="gal-main">
      <div class="gal-track" tabindex="0" aria-label="Галерея">${slides.map(([c, h]) => `<div class="gal-slide ${c}">${h}</div>`).join('')}</div>
      ${p.flags && p.flags[0] ? `<span class="flag flag-${p.flags[0]}">${E.FLAGS[p.flags[0]]}</span>` : ''}${disc >= 5 ? `<span class="off">−${disc}%</span>` : ''}
      <button type="button" class="fav${E.fav.has(p.id) ? ' on' : ''}" data-fav="${p.id}" aria-label="В избранное" aria-pressed="${E.fav.has(p.id)}">${E.icon('heart', 'i-22')}</button>
      <button type="button" class="gal-arr l" data-step="-1" aria-label="Предыдущее фото">${E.icon('chev-l')}</button><button type="button" class="gal-arr r" data-step="1" aria-label="Следующее фото">${E.icon('chev-r')}</button>
      <div class="gal-dots">${slides.map((s, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>
    </div>
  </div>
  <div class="pi">
    <a class="pi-brand" href="${E.url.brand(p.brand)}">${E.esc(p.brand)}${E.icon('check-c', 'i-18')}</a>
    <h1>${E.esc(p.name)}</h1>
    <div class="pi-meta"><a href="#reviews">${E.stars(p.rating)}<b>${E.rate(p.rating)}</b><span class="muted">${E.pl(p.reviews, 'оценка', 'оценки', 'оценок')}</span></a>
      <span class="pi-sold">${E.icon('flame', 'i-18')}Купили ${E.pl(p.sold, 'раз', 'раза', 'раз')}</span>
      <span class="muted">Артикул <button type="button" data-copy="${p.article}" title="Скопировать артикул">${p.article}${E.icon('copy', 'i-16')}</button></span></div>
    <div class="pi-blk"><div class="pi-blk-h"><span>Цвет: <b>${E.esc(p.color)}</b></span></div><div class="color-row"><span class="sw on${D.colors[p.color] === 'conic' ? ' sw-conic' : ''}" style="${D.colors[p.color] === 'conic' ? '' : 'background:' + (D.colors[p.color] || '#ccc')}" title="${E.esc(p.color)}"></span></div></div>
    ${p.sizes ? `<div class="pi-blk" id="sizes"><div class="pi-blk-h"><span>Размер: <b data-size-l>не выбран</b></span><button type="button" class="link-btn" data-act="sizetable" data-sz="${p.id}">${E.icon('ruler', 'i-18')}Таблица размеров</button></div>
      <div class="sizes">${p.sizes.map(s => { const na = (p.soldOut || []).includes(s); return `<button type="button" class="size${na ? ' na' : ''}" data-size="${s}"${na ? ' disabled aria-disabled="true"' : ''} aria-pressed="false">${s}${na ? '<small>нет</small>' : ''}</button>`; }).join('')}</div></div>` : ''}
    <div class="pi-blk"><div class="pi-blk-h"><b>О товаре</b><a class="link-btn" href="#specs">Все характеристики${E.icon('chev-r', 'i-16')}</a></div><dl class="dl">${specs.slice(0, 5).map(dlRow).join('')}</dl></div>
    <div class="pi-perks"><div class="perk">${E.icon('truck')}<b>Доставка ${E.dayLow(p.days)}</b>Бесплатно в пункт выдачи</div><div class="perk">${E.icon('ret')}<b>Возврат 14 дней</b>Если товар не подойдёт</div><div class="perk">${E.icon('shield')}<b>Оригинал</b>Проверенный продавец</div></div>
  </div>
  <aside class="buybox" aria-label="Покупка">
    <div class="bb-price"><b>${E.money(p.price)}</b><s>${E.money(p.old)}</s>${disc >= 5 ? `<span class="bb-off">−${disc}%</span>` : ''}</div>
    <div class="bb-club" data-club></div>
    <div class="bb-btns" data-buy></div>
    <div class="bb-size-warn" role="alert">Выберите размер, чтобы добавить товар в корзину</div>
    <div class="bb-dl">
      <div class="bb-dl-i">${E.icon('pin')}<div><b>Пункт выдачи — ${E.dayLow(p.days)}, бесплатно</b><span data-addr-pt></span> <button type="button" data-act="pickup">Изменить</button></div></div>
      <div class="bb-dl-i">${E.icon('truck')}<div><b>Курьером — ${E.dayLow(p.days + 1)}</b><span>${p.price >= 1000 ? 'Бесплатно' : '99 ₽, бесплатно от 1 000 ₽'}</span></div></div>
      <div class="bb-dl-i">${E.icon('ret')}<div><b>Лёгкий возврат</b><span>14 дней на возврат, примерка в пункте выдачи</span></div></div>
    </div>
    <a class="seller-c" href="catalog.html?seller=${seller.id}"><span class="seller-ava">${E.esc(seller.name[0])}</span><div><b>${E.esc(seller.name)}</b><span class="sc-m">${E.STAR}<em>${E.rate(seller.rating)}</em> · ${E.esc(seller.about)}</span></div>${E.icon('chev-r', 'i-20')}</a>
  </aside>
</div></div>
<nav class="pp-nav" aria-label="Разделы товара"><div class="wrap"><a href="#desc">Описание</a><a href="#specs">Характеристики</a><a href="#reviews">Отзывы<span>${E.fmt(p.reviews)}</span></a><a href="#qa">Вопросы<span data-qa-n>${qaList.length + myQa().length}</span></a></div></nav>
<div class="wrap">
  <section class="pp-sec" id="desc"><h2>Описание</h2><div class="pp-desc"><div><p>${E.esc(p.desc)}</p><p>${EXTRA[rg]}</p></div><ul>${(PERKS[rg] || PERKS.home).map(x => `<li>${E.icon('check-c')}${x}</li>`).join('')}</ul></div></section>
  <section class="pp-sec" id="specs"><h2>Характеристики</h2><dl class="specs">${specs.map(dlRow).join('')}</dl></section>
  <section class="pp-sec" id="reviews"><h2>Отзывы о товаре</h2><div class="rv">
    <div class="rv-sum"><div class="rv-big"><b>${E.rate(p.rating)}</b><div>${E.stars(p.rating, 'stars-lg')}<span class="rv-n">${E.pl(p.reviews, 'оценка', 'оценки', 'оценок')}</span></div></div>
      <div class="bars">${dist.map((v, i) => `<div class="bar-row"><span>${5 - i}${E.STAR}</span><span class="bar"><i style="width:${Math.round(v * 100)}%"></i></span><span>${Math.round(v * 100)}%</span></div>`).join('')}</div>
      <button type="button" class="btn btn-primary btn-block" data-write>${E.icon('edit', 'i-18')}Написать отзыв</button></div>
    <div data-rv></div></div></section>
  <section class="pp-sec" id="qa"><h2>Вопросы о товаре</h2><div class="qa" data-qa></div><button type="button" class="btn btn-outline mt16" data-ask>${E.icon('chat', 'i-18')}Задать вопрос</button></section>
  ${sameSub.length ? `<section class="sec">${E.secH('Похожие товары', E.url.cat(p.cat, p.sub))}${E.rail(sameSub.map(x => E.card(x)).join(''))}</section>` : ''}
  ${bySeller.length >= 4 ? `<section class="sec">${E.secH('Ещё у продавца ' + E.esc(seller.name), 'catalog.html?seller=' + seller.id, 'В магазин')}${E.rail(bySeller.map(x => E.card(x)).join(''))}</section>` : ''}
  <section class="sec" data-recent-s hidden></section>
</div>`;
document.body.insertAdjacentHTML('beforeend', `<div class="buybar" data-buybar><div class="bbp"><b>${E.money(p.price)}</b><s>${E.money(p.old)}</s></div><div class="bb-in-wrap" data-buy-m></div></div>`);
document.body.classList.add('has-buybar');

/* ---------- галерея ---------- */
const track = $('.gal-track', root), n = slides.length;
const cur = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
const go = i => { i = (i + n) % n; track.scrollTo({ left: i * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
track.addEventListener('scroll', E.debounce(() => { const i = cur(); $$('.gal-thumbs button', root).forEach((b, j) => b.classList.toggle('on', j === i)); $$('.gal-dots i', root).forEach((d, j) => d.classList.toggle('on', j === i)); }, 40), { passive: true });
track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur() - 1); } });
root.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(+g.dataset.go); const s = e.target.closest('[data-step]'); if (s) go(cur() + +s.dataset.step); });
$$('.gal-thumbs button', root).forEach(b => b.addEventListener('mouseenter', () => { if (matchMedia('(pointer:fine)').matches) go(+b.dataset.go); }));
$$('.gal-slide img', root).forEach(im => im.addEventListener('click', () => {
  if (!matchMedia('(min-width: 768px)').matches) return;
  const views = slides.filter(([c]) => c !== 'info-slide');
  let vi = Math.min(cur(), views.length - 1);
  const m = E.modal({ title: E.esc(p.name), wide: true, cls: 'm-zoom', html: `<div class="zoom-wrap"><div class="zoom-th">${views.map(([c], i) => `<button type="button" class="${c}${i === vi ? ' on' : ''}" data-zi="${i}" aria-label="Фото ${i + 1}"><img src="${p.img}" alt=""></button>`).join('')}</div><div class="zoom-box ${views[vi][0]}" data-zbox><img src="${p.img}" alt="${E.esc(p.name)}" class="zoom-img"><span class="zoom-hint">${E.icon('search', 'i-18')}Наведите, чтобы увеличить</span></div></div>` });
  const box = $('[data-zbox]', m.el), img = $('img', box);
  box.addEventListener('mousemove', e => { const r = box.getBoundingClientRect(); img.style.transformOrigin = `${((e.clientX - r.left) / r.width * 100).toFixed(1)}% ${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`; });
  box.addEventListener('mouseenter', () => box.classList.add('zin'));
  box.addEventListener('mouseleave', () => { box.classList.remove('zin'); img.style.transformOrigin = ''; });
  m.el.addEventListener('click', e => { const b = e.target.closest('[data-zi]'); if (!b) return; vi = +b.dataset.zi; box.className = 'zoom-box ' + views[vi][0]; $$('[data-zi]', m.el).forEach(x => x.classList.toggle('on', x === b)); });
}));

/* ---------- размеры и покупка ---------- */
const key = () => E.ck(p.id, size);
const sizeWarn = on => { $('.bb-size-warn', root).classList.toggle('show', on); const sz = $('#sizes'); if (sz) sz.classList.toggle('warn', on); };
function buyHTML(mobile) {
  const inCart = p.sizes ? (size && E.cart.has(p.id, size)) : E.cart.has(p.id);
  const q = inCart ? (E.cart.raw().find(x => E.ck(x.id, x.size) === key()) || {}).qty || 0 : 0;
  const fav = E.fav.has(p.id);
  const main = inCart
    ? `<div class="bb-in"><div class="qty"><button type="button" data-q="-1" aria-label="Меньше">${E.icon('minus', 'i-18')}</button><span aria-live="polite">${q}</span><button type="button" data-q="1" aria-label="Больше"${q >= 10 ? ' disabled' : ''}>${E.icon('plus', 'i-18')}</button></div><a class="btn btn-primary btn-lg" href="cart.html">${mobile ? 'В корзине' : 'Перейти в корзину'}</a></div>`
    : `<button type="button" class="btn btn-primary btn-lg${mobile ? '' : ' btn-block'}" data-buy-add>${E.icon('cart')}Добавить в корзину</button>`;
  if (mobile) return main;
  return main + `<div class="bb-row"><button type="button" class="btn btn-secondary btn-lg" data-buy-now>Купить сейчас</button><button type="button" class="btn btn-outline btn-lg fav-b${fav ? ' on' : ''}" data-fav="${p.id}" aria-label="${fav ? 'Убрать из избранного' : 'В избранное'}" aria-pressed="${fav}">${E.icon('heart')}</button></div>`;
}
function renderBuy() {
  $('[data-buy]', root).innerHTML = buyHTML(false);
  $('[data-buy-m]').innerHTML = buyHTML(true);
  const lv = E.user() ? E.club.rate() : 7, pts = Math.floor(p.price * lv / 100);
  $('[data-club]', root).innerHTML = `${E.berry()}<span>${E.user() ? `<b>+${E.pl(pts, 'ягодка', 'ягодки', 'ягодок')}</b> за покупку` : `До <b>${E.pl(pts, 'ягодки', 'ягодок', 'ягодок')}</b> кешбэка`}</span><a href="club.html">${E.user() ? 'Мой уровень' : 'Ягодный клуб'}</a>`;
  const pt = E.point(); $('[data-addr-pt]', root).textContent = pt.addr + ', ' + pt.hours;
}
const selectSize = s => { size = s; $$('.sizes [data-size]', root).forEach(b => { b.classList.toggle('on', b.dataset.size === s); b.setAttribute('aria-pressed', b.dataset.size === s); }); $('[data-size-l]', root).textContent = s; sizeWarn(false); renderBuy(); };
const needSize = mobile => {
  if (!p.sizes || size) return false;
  if (mobile || !matchMedia('(min-width: 768px)').matches) E.sizePicker(p, s => { selectSize(s); E.cart.add(p.id, s); });
  else { sizeWarn(true); $('#sizes').scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  return true;
};
document.addEventListener('click', e => {
  const t = e.target;
  const sz = t.closest('.pp .sizes [data-size]'); if (sz && !sz.disabled) { selectSize(sz.dataset.size); return; }
  if (t.closest('[data-buy-add]')) { if (needSize(!!t.closest('[data-buybar]'))) return; E.cart.add(p.id, size); return; }
  const q = t.closest('[data-q]'); if (q && (t.closest('[data-buy]') || t.closest('[data-buybar]'))) { const it = E.cart.raw().find(x => E.ck(x.id, x.size) === key()); if (it) E.cart.set(key(), it.qty + +q.dataset.q); return; }
  if (t.closest('[data-buy-now]')) {
    if (needSize()) return;
    if (!E.cart.has(p.id, size)) E.cart.add(p.id, size, 1, true);
    E.cart.sel('*', false); E.cart.sel(key(), true);
    location.href = E.user() ? 'checkout.html' : E.loginUrl('checkout.html');
  }
  if (t.closest('[data-write]')) writeReview();
  if (t.closest('[data-ask]')) ask();
});
E.on('cart', renderBuy); E.on('fav', renderBuy); E.on('point', renderBuy); E.on('session', renderBuy);
renderBuy();

/* ---------- отзывы ---------- */
const likes = () => E.get('rvlikes', {});
function revHTML(r, mine) {
  const lk = likes()[r.key] || 0;
  return `<article class="review${mine ? ' rv-mine' : ''}"><div class="rv-h">${E.avatar(r.name)}<div><div class="rv-name">${E.esc(r.name)}${mine ? ' <span class="pill pill-violet">Ваш отзыв</span>' : ''}</div><div class="rv-date">${E.when(r.t0)}</div></div>${E.stars(r.r, 'stars-sm')}</div>
    ${r.size || r.fit ? `<div class="rv-tags">${r.size ? `<span>Размер: ${r.size}</span>` : ''}${r.fit ? `<span>${r.fit}</span>` : ''}<span>Цвет: ${E.esc(p.color)}</span></div>` : ''}
    ${r.t ? `<p class="rv-t">${E.esc(r.t)}</p>` : ''}${r.pros ? `<p class="rv-pc"><b>Достоинства:</b> ${E.esc(r.pros)}</p>` : ''}${r.cons ? `<p class="rv-pc"><b>Недостатки:</b> ${E.esc(r.cons)}</p>` : ''}
    ${r.ans ? `<div class="rv-ans"><b>Ответ продавца ${E.esc(seller.name)}</b>${r.ans}</div>` : ''}
    ${mine ? `<div class="rv-act"><span class="muted" style="font-size:13px">${r.mod ? 'Опубликован' : 'На модерации · появится для всех в течение суток'}</span><button type="button" data-rvdel="${r.key}">${E.icon('trash')}Удалить</button></div>`
      : `<div class="rv-act"><span class="muted" style="font-size:13px">Отзыв полезен?</span><button type="button" class="${lk === 1 ? 'on' : ''}" data-like="${r.key}" data-v="1" aria-pressed="${lk === 1}">${E.icon('like')}${r.likes + (lk === 1 ? 1 : 0)}</button><button type="button" class="${lk === -1 ? 'on' : ''}" data-like="${r.key}" data-v="-1" aria-pressed="${lk === -1}">${E.icon('dislike')}${Math.floor(r.likes / 9) + (lk === -1 ? 1 : 0)}</button></div>`}</article>`;
}
function renderReviews() {
  const mine = myRevs().map(r => Object.assign({ mine: true }, r));
  let l = genRevs.slice();
  if (rvFilter === '5' || rvFilter === '4') l = l.filter(r => r.r === +rvFilter);
  if (rvFilter === '3') l = l.filter(r => r.r <= 3);
  const S = { useful: (a, b) => b.likes - a.likes, new: (a, b) => b.t0 - a.t0, high: (a, b) => b.r - a.r || b.t0 - a.t0, low: (a, b) => a.r - b.r || b.t0 - a.t0 };
  l.sort(S[rvSort]);
  const cnt = k => k === 'all' ? genRevs.length : genRevs.filter(r => k === '3' ? r.r <= 3 : r.r === +k).length;
  $('[data-rv]', root).innerHTML = `<div class="rv-tools"><div class="chips chips-scroll">${[['all', 'Все'], ['5', '5 ★'], ['4', '4 ★'], ['3', '3 ★ и ниже']].map(([k, t]) => `<button type="button" class="chip${rvFilter === k ? ' on' : ''}" data-rvf="${k}"${cnt(k) || k === 'all' ? '' : ' disabled'}>${t}<small>${cnt(k)}</small></button>`).join('')}</div>
    <label class="sort-w"><span>Сортировка</span><select class="input" data-rvs aria-label="Сортировка отзывов">${[['useful', 'Сначала полезные'], ['new', 'Сначала новые'], ['high', 'С высокой оценкой'], ['low', 'С низкой оценкой']].map(([k, t]) => `<option value="${k}"${rvSort === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label></div>
    ${rvFilter === 'all' ? mine.map(r => revHTML(r, true)).join('') : ''}
    ${l.slice(0, rvShown).map(r => revHTML(r)).join('') || '<p class="no-res">Отзывов с такой оценкой пока нет.</p>'}
    ${l.length > rvShown ? `<div class="more-wrap"><button type="button" class="btn btn-outline" data-rvmore>Показать ещё отзывы · ${l.length - rvShown}</button></div>` : (l.length >= 30 ? '<p class="field-hint mt16">Показаны последние 30 отзывов из ' + E.fmt(p.reviews) + '</p>' : '')}`;
}
root.addEventListener('change', e => { if (e.target.matches('[data-rvs]')) { rvSort = e.target.value; renderReviews(); } });
root.addEventListener('click', e => {
  const t = e.target;
  const f = t.closest('[data-rvf]'); if (f) { rvFilter = f.dataset.rvf; rvShown = 6; renderReviews(); return; }
  if (t.closest('[data-rvmore]')) { rvShown += 10; renderReviews(); return; }
  const lk = t.closest('[data-like]'); if (lk) { const l = likes(), k = lk.dataset.like, v = +lk.dataset.v; l[k] = l[k] === v ? 0 : v; E.set('rvlikes', l); renderReviews(); return; }
  const d = t.closest('[data-rvdel]'); if (d) E.confirm({ title: 'Удалить отзыв?', text: 'Отзыв исчезнет со страницы товара. Начисленные ягодки останутся у вас.', ok: 'Удалить', danger: true, onOk: () => { E.set('myreviews', E.get('myreviews', []).filter(r => r.key !== d.dataset.rvdel)); renderReviews(); E.toast('Отзыв удалён', { icon: 'trash' }); } });
});
function needLogin(what) {
  if (E.user()) return false;
  E.confirm({ title: 'Войдите в аккаунт', text: `Чтобы ${what}, войдите в Ежевику. В демо-версии: demo@ezhevika.ru / demo123.`, ok: 'Войти', onOk: () => { location.href = E.loginUrl(E.here()); } });
  return true;
}
function writeReview() {
  if (needLogin('написать отзыв')) return;
  const u = E.user();
  const m = E.modal({ title: 'Отзыв о товаре', html: `<div class="mini"><img src="${p.img}" alt=""><div><div class="mini-t clamp2">${E.esc(p.name)}</div></div></div>
    <form class="m-form" data-rf novalidate><div class="field"><span class="lbl">Ваша оценка</span><div class="rate-in" role="radiogroup" aria-label="Оценка">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-rate="${i}" role="radio" aria-checked="false" aria-label="${i} из 5"><svg class="i" viewBox="0 0 24 24"><path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/></svg></button>`).join('')}</div></div>
    <div class="field"><label for="rv-pros">Достоинства</label><input class="input" id="rv-pros" name="pros" maxlength="200" placeholder="Что понравилось"></div>
    <div class="field"><label for="rv-cons">Недостатки</label><input class="input" id="rv-cons" name="cons" maxlength="200" placeholder="Что можно улучшить"></div>
    <div class="field"><label for="rv-t">Комментарий</label><textarea class="input" id="rv-t" name="t" maxlength="1500" placeholder="Расскажите, как вам товар: качество, размер, впечатления"></textarea><span class="field-hint">За отзыв с текстом начислим 50 ягодок</span></div></form>`,
    foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-send>Опубликовать</button>' });
  let rate = 0;
  m.el.addEventListener('click', e => {
    const b = e.target.closest('[data-rate]');
    if (b) { rate = +b.dataset.rate; $$('[data-rate]', m.el).forEach(x => { const on = +x.dataset.rate <= rate; x.classList.toggle('on', on); x.setAttribute('aria-checked', +x.dataset.rate === rate); }); $('.rate-in', m.el).closest('.field').querySelector('.field-err')?.remove(); }
    if (e.target.closest('[data-send]')) {
      const f = $('[data-rf]', m.el), t = f.t.value.trim();
      if (!rate) { const fl = $('.rate-in', m.el).closest('.field'); if (!$('.field-err', fl)) fl.insertAdjacentHTML('beforeend', '<span class="field-err">Поставьте оценку от 1 до 5</span>'); return; }
      if (t && t.length < 10) { E.fieldErr(f.t, 'Напишите хотя бы пару предложений — от 10 символов'); return; }
      const l = E.get('myreviews', []);
      l.unshift({ key: 'my-' + Date.now(), pid: p.id, r: rate, t, pros: f.pros.value.trim(), cons: f.cons.value.trim(), name: u.name + (u.surname ? ' ' + u.surname[0] + '.' : ''), t0: Date.now() });
      E.set('myreviews', l);
      if (t) E.berries.add(50, 'Отзыв о товаре «' + p.name + '»');
      m.close(); rvFilter = 'all'; renderReviews();
      E.toast(t ? 'Спасибо за отзыв! +50 ягодок уже на счёте' : 'Спасибо за оценку!', { icon: 'star-o' });
      $('#reviews').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ---------- вопросы ---------- */
function renderQa() {
  const mine = myQa();
  $('[data-qa]', root).innerHTML = mine.map(x => `<div class="qa-i"><div class="qa-q">${E.icon('chat')}${E.esc(x.q)}</div><div class="qa-m">Вы · ${E.when(x.t0)} · <span class="violet">ждёт ответа продавца</span></div></div>`).join('')
    + qaList.map(x => `<div class="qa-i"><div class="qa-q">${E.icon('chat')}${E.esc(x.q)}</div><div class="qa-m">${x.name} · ${E.when(x.t0)}</div><div class="qa-a"><b>${E.esc(seller.name)}</b>${x.a}</div></div>`).join('');
  $('[data-qa-n]').textContent = qaList.length + mine.length;
}
function ask() {
  if (needLogin('задать вопрос продавцу')) return;
  const m = E.modal({ title: 'Вопрос о товаре', html: `<form class="m-form" data-qf novalidate><p class="m-text">Продавец обычно отвечает в течение дня. Ответ придёт в уведомления.</p><div class="field"><label for="qa-t">Ваш вопрос</label><textarea class="input" id="qa-t" name="q" maxlength="500" placeholder="Например: подойдёт ли в подарок?"></textarea></div></form>`,
    foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-send>Отправить</button>' });
  $('[data-send]', m.el).onclick = () => {
    const ta = $('#qa-t', m.el), q = ta.value.trim();
    if (q.length < 5) { E.fieldErr(ta, 'Слишком короткий вопрос'); return; }
    const l = E.get('qa', []); l.unshift({ pid: p.id, q, t0: Date.now() }); E.set('qa', l);
    m.close(); renderQa(); E.toast('Вопрос отправлен продавцу', { icon: 'chat' });
  };
}

/* ---------- навигация по разделам и недавние ---------- */
const navLinks = $$('.pp-nav a', root), secs = navLinks.map(a => $(a.getAttribute('href')));
const spy = () => { const y = window.scrollY + 160; let k = -1; secs.forEach((s, i) => { if (s && s.offsetTop <= y) k = i; }); navLinks.forEach((a, i) => a.classList.toggle('on', i === k)); };
window.addEventListener('scroll', E.debounce(spy, 50), { passive: true });
const rec = E.recent.list().filter(x => x.id !== p.id).slice(0, 12);
if (rec.length >= 2) { const s = $('[data-recent-s]', root); s.hidden = false; s.innerHTML = E.secH('Вы недавно смотрели') + E.rail(rec.map(x => E.card(x)).join('')); }
renderReviews(); renderQa(); E.initRails(root);
window.addEventListener('pageshow', e => { if (e.persisted) { renderBuy(); E.refreshCards(); E.updateBadges(); } });
})();
