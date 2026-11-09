/* Ежевика — контентные страницы: акции, бренды, клуб, помощь, пункты выдачи, продавцам, о компании, документы, 404 */
(() => {
'use strict';
const E = window.EZH, D = E.D, $ = E.$, $$ = E.$$, esc = E.esc, money = E.money, pl = E.pl, DAY = E.DAY, NB = '\u00a0';
const page = document.body.dataset.page;
const digits = s => String(s || '').replace(/\D/g, '');

/* ---------- даты ---------- */
$$('[data-until]').forEach(el => { el.textContent = (el.dataset.prefix || '') + E.dm(E.addDays(+el.dataset.until)); });
$$('[data-ago]').forEach(el => { el.textContent = E.dmy(Date.now() - el.dataset.ago * DAY); });

/* ---------- подборки товаров ---------- */
const has = (p, f) => (p.flags || []).includes(f);
const PRODS = {
  discount: () => D.products.filter(p => p.reviews > 100).sort((a, b) => E.disc(b) - E.disc(a) || b.sold - a.sold),
  brands: () => { const best = {}; D.products.forEach(p => { if (!best[p.brand] || best[p.brand].sold < p.sold) best[p.brand] = p; }); return Object.values(best).sort((a, b) => b.sold - a.sold); },
  hits: () => D.products.filter(p => has(p, 'hit')).sort((a, b) => b.sold - a.sold),
};
$$('[data-prods]').forEach(el => { const f = PRODS[el.dataset.prods]; if (f) el.innerHTML = E.rail(f().slice(0, +el.dataset.n || 12).map(p => E.card(p)).join('')); });
E.initRails();
E.timers();

/* ---------- маски и проверка форм ---------- */
function bindMasks(r = document) {
  $$('[data-phone]', r).forEach(i => { if (!i._m) { i._m = 1; E.maskPhone(i); } });
  $$('[data-inn]', r).forEach(i => { if (!i._m) { i._m = 1; i.addEventListener('input', () => { i.value = digits(i.value).slice(0, 12); }); } });
}
bindMasks();
function checkForm(f) {
  let first = null;
  $$('input[required],select[required],textarea[required]', f).forEach(i => {
    let m = '';
    const v = i.value.trim();
    if (i.type === 'checkbox') { m = i.checked ? '' : 'Нужно ваше согласие'; i.closest('.check').classList.toggle('err', !!m); if (m && !first) first = i; return; }
    if (!v) m = 'Заполните поле';
    else if (i.matches('[data-phone]') && digits(v).length !== 11) m = 'Введите номер полностью';
    else if (i.matches('[data-email],[type=email]') && !E.validEmail(v)) m = 'Проверьте адрес почты';
    else if (i.matches('[data-inn]') && ![10, 12].includes(digits(v).length)) m = 'ИНН — 10 или 12 цифр';
    E.fieldErr(i, m); if (m && !first) first = i;
  });
  if (first) first.focus();
  return !first;
}
document.addEventListener('input', e => { const t = e.target; if (t.closest('[data-lead],[data-jobf]')) { if (t.type === 'checkbox') t.closest('.check').classList.remove('err'); else E.fieldErr(t, ''); } });
document.addEventListener('change', e => { const t = e.target; if (t.type === 'checkbox' && t.closest('[data-lead],[data-jobf]')) t.closest('.check').classList.toggle('err', t.required && !t.checked); });
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-lead]'); if (!f) return;
  e.preventDefault();
  if (!checkForm(f)) return;
  const card = f.closest('[data-formcard]'), phone = f.phone ? E.phone(f.phone.value) : '', num = 'З-' + String(Date.now()).slice(-6);
  card._orig = card.innerHTML;
  const txt = f.dataset.lead === 'seller' ? `Менеджер позвонит на ${esc(phone)} в течение 1 рабочего дня и поможет подключиться. Пока можно изучить <a href="#tariffs">комиссии</a>.` : `Менеджер позвонит на ${esc(phone)} в течение рабочего дня и расскажет об условиях открытия.`;
  card.innerHTML = `<div class="form-ok" role="status"><div class="succ-ic pop">${E.icon('check')}</div><h3>Заявка ${num} отправлена</h3><p>${txt}</p><button type="button" class="btn btn-secondary mt16" data-lead-again>Отправить ещё одну заявку</button></div>`;
  E.toast('Заявка отправлена', { icon: 'check' });
});
document.addEventListener('click', e => {
  const a = e.target.closest('[data-lead-again]'); if (!a) return;
  const card = a.closest('[data-formcard]'); if (card && card._orig) { card.innerHTML = card._orig; bindMasks(card); }
});

/* ---------- акции: фильтр ---------- */
document.addEventListener('click', e => {
  const tf = e.target.closest('[data-tf]'); if (!tf) return;
  $$('[data-tf]').forEach(b => { b.classList.toggle('on', b === tf); b.setAttribute('aria-pressed', b === tf); });
  const k = tf.dataset.tf;
  $$('.act[data-tags]').forEach(a => { a.hidden = !!k && !a.dataset.tags.split(' ').includes(k); });
});

/* ---------- бренды: поиск ---------- */
const bq = $('[data-bq]');
if (bq) {
  const groups = $$('.bgroup'), nores = $('.no-res');
  const run = () => {
    const q = E.norm(bq.value.trim()); let any = 0;
    groups.forEach(g => { let n = 0; $$('.blist a', g).forEach(a => { const ok = !q || E.norm(a.dataset.b).indexOf(q) >= 0; a.hidden = !ok; if (ok) n++; }); g.hidden = !n; any += n; });
    nores.hidden = any > 0;
    $$('.letters a').forEach(l => { const g = $('#bl-' + l.textContent.trim()); const off = !g || g.hidden; l.classList.toggle('dim', off); l.setAttribute('aria-disabled', off); l.tabIndex = off ? -1 : 0; });
  };
  bq.addEventListener('input', E.debounce(run, 100));
  bq.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const a = $('.blist a:not([hidden])'); if (a && $$('.blist a:not([hidden])').length === 1) location.href = a.href; } });
}

/* ---------- ягодный клуб ---------- */
if (page === 'club') {
  const u = E.user(), cr = $('[data-cr]'), cl = $('[data-cl]');
  let rate = u ? E.club.level().rate : 5;
  const upd = () => {
    const v = +cr.value, m = Math.round(v * rate / 100);
    cr.style.setProperty('--p', ((v - cr.min) / (cr.max - cr.min) * 100) + '%');
    $('[data-cv]').textContent = money(v);
    $('[data-cm]').textContent = pl(m, 'ягодка', 'ягодки', 'ягодок');
    $('[data-cy]').textContent = pl(m * 12, 'ягодка', 'ягодки', 'ягодок');
    $('[data-cp]').textContent = rate + '%';
  };
  if (cr) {
    cr.addEventListener('input', upd);
    cl.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; rate = +b.dataset.r; $$('[data-r]', cl).forEach(x => x.classList.toggle('on', x === b)); upd(); });
    $$('[data-r]', cl).forEach(x => x.classList.toggle('on', +x.dataset.r === rate));
    upd();
  }
  if (u) {
    const lv = E.club.level(), nx = E.club.next(), sp = E.club.spent(), bal = E.berries.balance();
    const pct = nx ? Math.min(100, Math.round((sp - lv.from) / (nx.from - lv.from) * 100)) : 100;
    $$('.level').forEach(l => { const on = +l.dataset.level === lv.n; l.classList.toggle('cur', on); const t = $('.lv-tag', l); if (t) t.hidden = !on; });
    const j = $('[data-join]'); if (j) { j.href = 'account.html#berries'; j.innerHTML = 'Мои ягодки' + E.icon('arrow-r'); }
    const me = $('[data-me]');
    if (me) {
      me.hidden = false;
      me.innerHTML = `${E.secH(esc(u.name) + ', вы в клубе', 'account.html#berries', 'История ягодок')}
      <div class="bhero club-me"><div><div class="bal">${E.berry()}<div><b>${E.fmt(bal)}</b><span>${E.plural(bal, 'ягодка', 'ягодки', 'ягодок')} на счёте · 1 ягодка = 1 ₽</span></div></div>
        <p class="bh-note">Можно оплатить до 30% следующего заказа. ${nx ? `До уровня «${esc(nx.name)}» осталось ${money(nx.from - sp)} покупок — тогда кешбэк вырастет до ${nx.rate}%.` : 'У вас максимальный уровень клуба — спасибо, что вы с нами!'}</p></div>
        <div class="bhero-lvl"><small>Ваш уровень</small><b>${esc(lv.name)} · ${lv.rate}%</b><div class="lvl"><div class="lvl-bar"><i style="width:${pct}%"></i></div><div class="lvl-meta"><span>${money(sp)}</span><span>${nx ? 'до ' + esc(nx.name) + ': ' + money(nx.from - sp) : 'максимум'}</span></div></div></div></div>`;
    }
  }
}

/* ---------- помощь: поиск ---------- */
const hq = $('[data-hq]');
if (hq) {
  const STOP = new Set(['как', 'что', 'где', 'мне', 'мой', 'моя', 'мои', 'ли', 'не', 'на', 'в', 'во', 'с', 'со', 'и', 'а', 'по', 'для', 'о', 'об', 'от', 'до', 'за', 'при', 'у', 'к', 'я', 'это', 'можно', 'ли', 'есть']);
  const secs = $$('[data-hs]').filter(s => s.id !== 'contacts'), nores = $('.no-res'), topics = $('.topics');
  const run = () => {
    const words = E.norm(hq.value).split(/[\s,.;:!?()«»"]+/).filter(w => w && !STOP.has(w));
    const tk = words.map(w => w.length <= 3 ? w : w.length <= 5 ? w.slice(0, -1) : w.slice(0, -2));
    const score = f => { const h = E.norm(f.textContent); return tk.filter(t => h.indexOf(t) >= 0).length; };
    let need = tk.length, total = 0;
    const all = secs.flatMap(s => $$('.faq', s));
    if (tk.length && !all.some(f => score(f) === need)) need = 1;
    secs.forEach(s => { let n = 0; $$('.faq', s).forEach(f => { const ok = !tk.length || score(f) >= need; f.hidden = !ok; if (ok) n++; }); s.hidden = !n; total += n; });
    nores.hidden = !tk.length || total > 0;
    if (topics) topics.hidden = tk.length > 0;
    const qs = f => { const h = E.norm(($('summary', f) || f).textContent); return tk.filter(t => h.indexOf(t) >= 0).length; };
    const rank = f => score(f) * 2 + qs(f) * 3;
    const vis = tk.length ? all.filter(f => !f.hidden).sort((a, b) => rank(b) - rank(a)) : [], first = vis[0];
    const clear = first && (total <= 4 || rank(first) > rank(vis[1]));
    all.forEach(f => { if (f !== first && f._auto) { f.open = false; f._auto = 0; } });
    if (clear && !first.open) { first.open = true; first._auto = 1; }
  };
  hq.addEventListener('input', E.debounce(run, 150));
  const q0 = E.params().get('q'); if (q0) { hq.value = q0; run(); }
}

/* ---------- пункты выдачи ---------- */
const pk = $('[data-pkpage]');
if (pk) {
  let city = E.point().city, sel = E.point().id, q = '', type = '';
  const cnt = c => D.points.filter(p => p.city === c).length;
  pk.innerHTML = `<div class="pk-side">
    <div class="chips pk-cities">${E.cities().map(c => `<button type="button" class="chip${c === city ? ' on' : ''}" data-city="${c}">${c}<small>${cnt(c)}</small></button>`).join('')}</div>
    <div class="pk-tools"><label class="input-ic">${E.icon('search', 'i-18')}<input class="input" type="search" placeholder="Улица, метро или тип пункта" aria-label="Поиск пункта" data-pkq></label>
      <div class="seg pk-types" role="group" aria-label="Тип пункта"><button type="button" class="on" data-type="">Все</button><button type="button" data-type="Пункт выдачи">Пункты</button><button type="button" data-type="Постамат">Постаматы</button></div></div>
    <div class="pk-detail" data-pkdet></div>
    <div class="pk-list" role="list"></div></div>
    <div class="map pk-map" aria-label="Карта пунктов выдачи"></div>`;
  const list = $('.pk-list', pk), map = $('.pk-map', pk), det = $('[data-pkdet]', pk);
  const pts = () => D.points.filter(p => p.city === city && (!type || p.type === type) && (!q || E.norm(p.addr + ' ' + p.metro + ' ' + p.type).indexOf(E.norm(q)) >= 0));
  const draw = () => {
    const l = pts(); if (l.length && !l.some(p => p.id === sel)) sel = l[0].id;
    list.innerHTML = l.length ? l.map(p => E.ptRow(p, p.id === sel)).join('') : '<p class="pk-none">Ничего не нашлось. Попробуйте другой запрос или город.</p>';
    map.innerHTML = E.mapSVG(E.cities().indexOf(city) * 7 + 3) + l.map(p => E.pinHTML(p, p.id === sel)).join('');
    const p = E.PT[sel], mine = E.point().id === sel;
    det.hidden = !(p && l.some(x => x.id === sel));
    if (!det.hidden) det.innerHTML = `<div class="pk-dh">${p.type === 'Постамат' ? `<span class="pt-ic locker">${E.icon('box', 'i-20')}</span>` : `<span class="pt-ic">${E.berry()}</span>`}<div><h3>${esc(p.addr)}</h3><small>${esc(p.city)} · ${p.type}</small></div>${mine ? '<span class="pill pill-violet">Ваш пункт</span>' : ''}</div>
      <div class="meta"><span>${E.icon('clock', 'i-16')}${p.hours}</span>${p.metro ? `<span>${E.icon('pin', 'i-16')}${esc(p.metro)}</span>` : ''}<span>${E.STAR}${E.rate(p.rating)}</span><span>${E.icon('box', 'i-16')}Хранение 7 дней</span>${p.type === 'Постамат' ? '' : `<span>${E.icon('user', 'i-16')}Примерочная</span>`}</div>
      <div class="btns"><button type="button" class="btn btn-primary btn-sm" data-pkset${mine ? ' disabled' : ''}>${mine ? E.icon('check', 'i-18') + 'Выбран для доставки' : 'Заберу отсюда'}</button><a class="btn btn-outline btn-sm" href="https://yandex.ru/maps/?text=${encodeURIComponent(p.city + ', ' + p.addr)}" target="_blank" rel="noopener">${E.icon('nav', 'i-18')}Маршрут</a></div>`;
  };
  pk.addEventListener('click', e => {
    const c = e.target.closest('[data-city]'); if (c) { city = c.dataset.city; $$('[data-city]', pk).forEach(x => x.classList.toggle('on', x === c)); sel = (D.points.find(p => p.city === city && (!type || p.type === type)) || {}).id; draw(); return; }
    const t = e.target.closest('[data-type]'); if (t) { type = t.dataset.type; $$('[data-type]', pk).forEach(x => x.classList.toggle('on', x === t)); draw(); return; }
    const pt = e.target.closest('[data-pt]'); if (pt) { sel = pt.dataset.pt; draw(); if (pt.classList.contains('mpin')) { const row = $(`.pt-row[data-pt="${sel}"]`, list); if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } else if (matchMedia('(max-width:1023px)').matches) det.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    if (e.target.closest('[data-pkset]')) { E.set('point', sel); E.toast('Пункт выдачи: ' + esc(E.PT[sel].addr), { icon: 'pin' }); draw(); }
  });
  $('[data-pkq]', pk).addEventListener('input', E.debounce(e => { q = e.target.value; draw(); }, 120));
  E.on('point', () => { sel = E.point().id; city = E.point().city; $$('[data-city]', pk).forEach(x => x.classList.toggle('on', x.dataset.city === city)); draw(); });
  draw();
}

/* ---------- продавцам: калькулятор ---------- */
const sc = $('[data-scalc]');
if (sc) {
  let scheme = 'fbo';
  const LOG = { fbo: 49, fbs: 29 };
  const HINT = { fbo: 'Храним, собираем и доставляем ваш товар. Логистика — 49 ₽ за единицу.', fbs: 'Храните товар у себя и привозите заказы в пункт приёма. Логистика — 29 ₽ за единицу.' };
  const upd = () => {
    const [fbo, fbs] = sc.elements.cat.value.split('|').map(Number), pct = scheme === 'fbo' ? fbo : fbs;
    const price = Math.min(500000, Math.max(0, +sc.elements.price.value || 0)), qty = Math.min(100000, Math.max(0, +sc.elements.qty.value || 0));
    const rev = price * qty, com = Math.round(rev * pct / 100), log = LOG[scheme] * qty, res = Math.max(0, rev - com - log);
    $('[data-sr]').textContent = money(res);
    $('[data-s1]').textContent = money(rev);
    $('[data-s2]').textContent = '−' + money(com) + NB + '· ' + pct + '%';
    $('[data-s3]').textContent = '−' + money(log);
    $('[data-shint]').textContent = HINT[scheme];
  };
  sc.addEventListener('input', upd); sc.addEventListener('change', upd);
  $('[data-scheme]').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; scheme = b.dataset.s; $$('[data-s]', sc).forEach(x => x.classList.toggle('on', x === b)); upd(); });
  upd();
}

/* ---------- о компании: вакансии и новости ---------- */
const NEWS = {
  'Ежевика открыла новогоднюю ярмарку': ['В разделе «Новый год» собрано более 20 000 товаров: ёлки и гирлянды, ёлочные игрушки, подарочные наборы и всё для праздничного стола.', 'До 31 декабря по промокоду НОВЫЙГОД действует дополнительная скидка 15% на весь раздел, а участники Ягодного клуба получают повышенный кешбэк на подарки.', 'Чтобы подарки успели к празднику, рекомендуем оформлять заказы до 25 декабря — доставка в пункты выдачи остаётся бесплатной.'],
  'Экспресс-доставка техники за 2 часа': ['Смартфоны, ноутбуки, наушники и умные часы теперь можно получить в день заказа: курьер привезёт покупку за 2 часа после оформления.', 'Услуга работает в Москве, Санкт-Петербурге, Казани, Екатеринбурге, Новосибирске, Краснодаре, Нижнем Новгороде и Самаре. Стоимость — 199 ₽, для заказов от 5 000 ₽ — бесплатно.', 'Товары для экспресс-доставки отмечены в каталоге значком молнии.'],
  'Новый фулфилмент-центр в Казани': ['Ежевика открыла фулфилмент-центр площадью 110 000 м² в Казани. Это двенадцатый склад компании и крупнейший в Поволжье.', 'Новый комплекс ускорит доставку в Татарстан, Самарскую, Нижегородскую и Ульяновскую области до одного дня и создаст 2 500 рабочих мест.', 'Продавцы региона смогут сдавать товары на склад без поездок в Москву — приёмка работает круглосуточно.'],
};
document.addEventListener('click', e => {
  const jf = e.target.closest('[data-jf]');
  if (jf) { $$('[data-jf]').forEach(b => b.classList.toggle('on', b === jf)); $$('.job[data-dep]').forEach(j => { j.hidden = !!jf.dataset.jf && j.dataset.dep !== jf.dataset.jf; }); return; }
  const jb = e.target.closest('[data-job]'); if (jb) { jobModal(jb.dataset.job, jb.closest('.job')); return; }
  const nw = e.target.closest('[data-news]'); if (nw) { e.preventDefault(); newsModal(nw); }
});
function jobModal(title, row) {
  const u = E.user() || {}, meta = row ? $('span', row).textContent : '', sal = row ? $('.salary', row).textContent : '';
  const m = E.modal({ title: 'Отклик на вакансию', html: `<form class="m-form" data-jobf novalidate>
    <div class="job-sum"><b>${esc(title)}</b><span>${esc(meta)}${sal ? ' · ' + esc(sal) : ''}</span></div>
    <div class="f-row2"><div class="field"><label for="jb-name">Имя и фамилия</label><input class="input" id="jb-name" name="name" autocomplete="name" required value="${esc(u.name ? u.name + ' ' + u.surname : '')}"></div>
      <div class="field"><label for="jb-phone">Телефон</label><input class="input" id="jb-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required data-phone value="${esc(u.phone ? E.phone(u.phone) : '')}"></div></div>
    <div class="field"><label for="jb-email">Электронная почта</label><input class="input" id="jb-email" name="email" type="email" autocomplete="email" required value="${esc(u.email || '')}"></div>
    <div class="field"><label for="jb-cv">Ссылка на резюме или портфолио</label><input class="input" id="jb-cv" name="cv" type="url" placeholder="https://hh.ru/resume/…"></div>
    <div class="field"><label for="jb-msg">Пара слов о себе</label><textarea class="input" id="jb-msg" name="msg" rows="3" placeholder="Почему вам интересна эта вакансия"></textarea></div>
    <label class="check"><input type="checkbox" name="agree" required checked><span>Согласен на обработку персональных данных</span></label></form>`,
  foot: '<button type="button" class="btn btn-outline" data-close>Отмена</button><button type="button" class="btn btn-primary" data-jsend>Отправить отклик</button>' });
  const f = $('[data-jobf]', m.el); bindMasks(f);
  f.addEventListener('submit', e => { e.preventDefault(); $('[data-jsend]', m.el).click(); });
  $('[data-jsend]', m.el).addEventListener('click', () => { if (!checkForm(f)) return; m.close(); E.toast('Отклик отправлен — HR ответит в течение 3 рабочих дней', { icon: 'check' }); });
}
function newsModal(a) {
  const t = $('h3', a).textContent, img = $('img', a).getAttribute('src'), date = $('small', a).textContent, lead = $('p', a).textContent;
  E.modal({ title: '', cls: 'm-news', html: `<div class="news-m"><div class="nv"><img src="${img}" alt=""></div><small>${esc(date)} · Пресс-центр</small><h2>${esc(t)}</h2><p class="lead">${esc(lead)}</p>${(NEWS[t] || []).map(p => `<p>${esc(p)}</p>`).join('')}<p class="muted">Контакты для СМИ: <a href="mailto:press@ezhevika.ru">press@ezhevika.ru</a></p></div>` });
}

/* ---------- документы ---------- */
const docs = $$('[data-docbody]');
if (docs.length) {
  const show = (k, upd) => {
    if (!docs.some(d => d.dataset.docbody === k)) k = 'terms';
    docs.forEach(d => { d.hidden = d.dataset.docbody !== k; });
    $$('[data-doc]').forEach(a => { const on = a.dataset.doc === k; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const h = $(`[data-docbody="${k}"] .doc-h`); if (h) document.title = h.textContent + ' — Ежевика';
    if (upd) history.replaceState(null, '', 'legal.html?doc=' + k);
  };
  show(E.params().get('doc') || 'terms');
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-doc]'); if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); show(a.dataset.doc, true);
    const body = $(`[data-docbody="${a.dataset.doc}"]`); if (body && body.getBoundingClientRect().top < 0) body.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
})();
