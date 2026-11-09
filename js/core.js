/* Ежевика — ядро сайта: утилиты, хранилище, корзина, избранное, авторизация,
   шапка, подвал, карточки товаров, модальные окна, уведомления и выбор пункта выдачи. */
(() => {
'use strict';
const D = window.EZH_DATA;
const E = window.EZH = { D };
const NB = '\u00a0';
const DAY = 864e5;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
Object.assign(E, { $, $$, NB, DAY });

/* ---------- форматирование ---------- */
E.fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
E.money = n => (n < 0 ? '−' : '') + E.fmt(Math.abs(n)) + NB + '₽';
E.disc = p => Math.round((p.old - p.price) / p.old * 100);
E.rate = r => (Math.round(r * 10) / 10).toFixed(1).replace('.', ',');
E.plural = (n, f1, f2, f5) => { n = Math.abs(n) % 100; const d = n % 10; if (n > 10 && n < 20) return f5; if (d > 1 && d < 5) return f2; if (d === 1) return f1; return f5; };
E.pl = (n, f1, f2, f5) => E.fmt(n) + NB + E.plural(n, f1, f2, f5);
E.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
E.norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').trim();
E.params = () => new URLSearchParams(location.search);
E.rng = seed => { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
E.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
E.phone = s => { const d = String(s).replace(/\D/g, '').replace(/^8/, '7'); if (d.length < 11) return s; return `+7${NB}${d.slice(1, 4)}${NB}${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`; };

/* ---------- даты ---------- */
const MG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WDS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
E.MG = MG; E.WD = WD; E.WDS = WDS;
E.addDays = (n, from) => { const d = new Date(from || Date.now()); d.setDate(d.getDate() + n); return d; };
E.dm = d => { d = new Date(d); return d.getDate() + NB + MG[d.getMonth()]; };
E.dmy = d => { d = new Date(d); return E.dm(d) + ' ' + d.getFullYear(); };
E.hm = d => { d = new Date(d); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
E.dayDiff = ts => { const a = new Date(ts); a.setHours(0, 0, 0, 0); const b = new Date(); b.setHours(0, 0, 0, 0); return Math.round((a - b) / DAY); };
E.dayLabel = n => n <= 0 ? 'Сегодня' : n === 1 ? 'Завтра' : n === 2 ? 'Послезавтра' : E.dm(E.addDays(n));
E.dayLow = n => n <= 0 ? 'сегодня' : n === 1 ? 'завтра' : n === 2 ? 'послезавтра' : E.dm(E.addDays(n));
E.when = ts => { const n = E.dayDiff(ts); if (n === 0) return 'сегодня'; if (n === -1) return 'вчера'; if (n === 1) return 'завтра'; return E.dm(ts) + (new Date(ts).getFullYear() !== new Date().getFullYear() ? ' ' + new Date(ts).getFullYear() : ''); };

/* ---------- справочники ---------- */
E.P = {}; D.products.forEach(p => { E.P[p.id] = p; });
E.C = {}; D.cats.forEach(c => { E.C[c.id] = c; });
E.S = {}; D.sellers.forEach(s => { E.S[s.id] = s; });
E.PT = {}; D.points.forEach(p => { E.PT[p.id] = p; });
E.subName = (c, s) => ((E.C[c] && E.C[c].subs.find(x => x.id === s)) || {}).name || '';
E.FLAGS = { hit: 'Хит', new: 'Новинка', premium: 'Премиум', eco: 'Эко' };
E.url = {
  p: id => 'product.html?id=' + id,
  cat: (c, s) => 'catalog.html?cat=' + c + (s ? '&sub=' + s : ''),
  q: q => 'catalog.html?q=' + encodeURIComponent(q),
  brand: b => 'catalog.html?brand=' + encodeURIComponent(b),
};

/* ---------- хранилище ---------- */
const memo = {};
const mk = s => { try { const k = 'ezh:t'; s.setItem(k, '1'); s.removeItem(k); return s; } catch (e) { return { getItem: k => (k in memo ? memo[k] : null), setItem: (k, v) => { memo[k] = String(v); }, removeItem: k => { delete memo[k]; } }; } };
let LS, SS;
try { LS = mk(window.localStorage); } catch (e) { LS = mk(null); }
try { SS = mk(window.sessionStorage); } catch (e) { SS = LS; }
E.get = (k, def) => { try { const v = LS.getItem('ezh:' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
E.set = (k, v) => { try { LS.setItem('ezh:' + k, JSON.stringify(v)); } catch (e) { /* переполнено */ } E.emit(k); };
E.del = k => { LS.removeItem('ezh:' + k); E.emit(k); };
E.emit = k => document.dispatchEvent(new CustomEvent('ezh:' + k));
E.on = (k, fn) => document.addEventListener('ezh:' + k, fn);
window.addEventListener('storage', e => { if (e.key && e.key.indexOf('ezh:') === 0) E.emit(e.key.slice(4)); });

/* ---------- иконки ---------- */
const IC = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  'chev-l': '<path d="m15 18-6-6 6-6"/>', 'chev-r': '<path d="m9 18 6-6-6-6"/>', 'chev-d': '<path d="m6 9 6 6 6-6"/>', 'chev-u': '<path d="m18 15-6-6-6 6"/>',
  'arrow-r': '<path d="M5 12h14M13 6l6 6-6 6"/>', 'arrow-l': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  'check-c': '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.3 9.6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.4"/>',
  alert: '<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 16.6v.4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="m9 12 2 2 4-4"/>',
  ret: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>',
  filter: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  sort: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1.5"/>',
  crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 21h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  like: '<path d="M7 10v11H3V10h4zm0 0 4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7"/>',
  dislike: '<path d="M17 14V3h4v11h-4zm0 0-4 8a3 3 0 0 1-3-3v-4H4.5a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.9 3H17"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h3v3h-3z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/>',
  leaf: '<path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16z"/><path d="M5 21l8-8"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>',
  xc: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  nav: '<path d="M3 11l18-8-8 18-2-8-8-2z"/>',
  build: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .6 3.5 2.4 3.5 5.4"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.3-2.4 3.8M12 17h.01"/>',
  file: '<path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>',
  wallet: '<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v4m0 4v2a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M21 12v4h-4a2 2 0 0 1 0-4z"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  refresh: '<path d="M20 11A8 8 0 0 0 5.3 6.3L3 9M3 4v5h5M4 13a8 8 0 0 0 14.7 4.7L21 15M21 20v-5h-5"/>',
  'star-o': '<path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 4-2 6 2 0 4.7-.5 6-2M9 18l-3-3M14 4l6 0 0 6-8 8-6-6z"/><circle cx="15" cy="9" r="1.5"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 5V5L7 10H4a1 1 0 0 0-1 1zM17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13"/>',
};
const BERRY = '<g class="b-leaf"><path d="M16.4 8.3c-.2-1.9.2-3.3 1.2-4.6"/><path d="M17.3 5.6c1.1-2.6 3.5-3.9 6.7-3.6-.8 3-3.3 4.4-6.7 3.6z"/></g><g class="b-body"><circle cx="12" cy="11.6" r="3.7"/><circle cx="20" cy="11.6" r="3.7"/><circle cx="8" cy="18.6" r="3.7"/><circle cx="16" cy="18.6" r="3.7"/><circle cx="24" cy="18.6" r="3.7"/><circle cx="12" cy="25.6" r="3.7"/><circle cx="20" cy="25.6" r="3.7"/></g><g class="b-hl"><circle cx="10.6" cy="10.2" r="1"/><circle cx="18.6" cy="10.2" r="1"/><circle cx="6.6" cy="17.2" r="1"/><circle cx="14.6" cy="17.2" r="1"/><circle cx="22.6" cy="17.2" r="1"/><circle cx="10.6" cy="24.2" r="1"/><circle cx="18.6" cy="24.2" r="1"/></g>';
E.icon = (n, c = '') => `<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"></use></svg>`;
E.STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/></svg>';
E.berry = (c = '') => `<svg class="berry ${c}" viewBox="0 0 32 32" aria-hidden="true">${BERRY}</svg>`;
E.LOGO = (c = '') => `<span class="logo-in ${c}">${E.berry()}<span>ежевика</span></span>`;
(function sprite() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('aria-hidden', 'true'); s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML = Object.keys(IC).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24">${IC[k]}</symbol>`).join('');
  document.body.insertBefore(s, document.body.firstChild);
})();
E.stars = (r, c = '') => { let s = `<span class="stars ${c}" role="img" aria-label="Оценка ${E.rate(r)} из 5">`; for (let i = 1; i <= 5; i++) { const f = Math.max(0, Math.min(1, r - i + 1)); s += `<span class="st"><i style="width:${Math.round(f * 100)}%"></i></span>`; } return s + '</span>'; };

/* ---------- авторизация ---------- */
E.DEMO = { login: 'demo@ezhevika.ru', pass: 'demo123' };
const PROFILE = { name: 'Анна', surname: 'Ягодкина', email: 'demo@ezhevika.ru', phone: '+79991234567', birthday: '1994-03-14', gender: 'f', since: 2021 };
const sess = () => { try { return JSON.parse(LS.getItem('ezh:session') || SS.getItem('ezh:session') || 'null'); } catch (e) { return null; } };
E.user = () => sess() ? Object.assign({}, PROFILE, E.get('profile', {})) : null;
E.login = (login, pass, remember) => {
  const l = E.norm(login).replace(/[\s()\-]/g, '');
  const ok = ['demo@ezhevika.ru', 'demo', '+79991234567', '89991234567', '79991234567'].includes(l) && pass === E.DEMO.pass;
  if (!ok) return false;
  const v = JSON.stringify({ t: Date.now() });
  if (remember) LS.setItem('ezh:session', v); else SS.setItem('ezh:session', v);
  seed(); E.emit('session'); return true;
};
E.logout = () => { LS.removeItem('ezh:session'); SS.removeItem('ezh:session'); E.emit('session'); };
E.here = () => (location.pathname.split('/').pop() || 'index.html') + location.search + location.hash;
E.loginUrl = next => 'login.html?next=' + encodeURIComponent(next || E.here());
E.requireAuth = () => { if (E.user()) return true; location.replace(E.loginUrl()); return false; };
function seed() {
  if (E.get('seeded')) return;
  E.set('addresses', { points: ['pt1', 'pt5', 'pt3'], courier: [
    { id: 'a1', city: 'Москва', street: 'ул. Большая Дмитровка, 12', apt: '48', entrance: '2', floor: '5', intercom: '48К', comment: 'Позвонить за 30 минут', def: true },
    { id: 'a2', city: 'Москва', street: 'Пресненская наб., 10, БЦ «Башня на набережной»', apt: 'офис 1204', entrance: '', floor: '12', intercom: '', comment: 'Пропуск на ресепшене' }] });
  E.set('cards', [{ id: 'c1', brand: 'visa', last4: '4242', exp: '08/28', def: true }, { id: 'c2', brand: 'mir', last4: '1234', exp: '11/27' }]);
  E.set('settings', { email: true, sms: true, push: true, news: false });
  if (!E.get('myreviews', []).length) E.set('myreviews', [{ key: 'my-seed1', pid: 1085, r: 5, t: 'Лёгкие и удобные, сели точно по размеру. Белая кожа легко протирается, за две недели ни одной складки.', pros: 'Удобная колодка, мягкая стелька', cons: '', name: 'Анна Я.', t0: Date.now() - 2 * DAY - 36e5 }]);
  E.set('seeded', 1);
}

/* ---------- заказы ---------- */
const SEED = [
  { num: 'ЕЖ-4815162', ago: 1, items: [[1001, 1], [1031, 1], [1163, 2]], type: 'pickup', point: 'pt1', st: 'shipping', eta: 1, pay: 'card' },
  { num: 'ЕЖ-4815097', ago: 3, items: [[1062, 1, 'M']], type: 'pickup', point: 'pt1', st: 'ready', eta: -1, keep: 4, code: '4821', pay: 'sbp' },
  { num: 'ЕЖ-4802311', ago: 12, items: [[1085, 1, '39'], [1121, 1], [1109, 2], [1032, 1]], type: 'courier', st: 'done', eta: -10, pay: 'card', berries: 300 },
  { num: 'ЕЖ-4790004', ago: 26, items: [[1020, 1], [1050, 1]], type: 'pickup', point: 'pt3', st: 'done', eta: -23, pay: 'card' },
  { num: 'ЕЖ-4771230', ago: 41, items: [[1003, 1]], type: 'pickup', point: 'pt1', st: 'cancelled', eta: -38, pay: 'card' },
  { num: 'ЕЖ-4750008', ago: 63, items: [[1073, 1, 'L'], [1122, 1]], type: 'pickup', point: 'pt2', st: 'done', eta: -60, pay: 'cash' },
];
E.ST = {
  new: { t: 'Оформлен', c: 'blue' }, assembling: { t: 'Собирается', c: 'blue' }, shipping: { t: 'В пути', c: 'violet' },
  ready: { t: 'Готов к выдаче', c: 'green' }, done: { t: 'Получен', c: 'gray' }, cancelled: { t: 'Отменён', c: 'red' },
};
E.ACTIVE = ['new', 'assembling', 'shipping', 'ready'];
const sumItems = items => items.reduce((a, x) => { a.goods += x.old * x.qty; a.sum += x.price * x.qty; a.count += x.qty; return a; }, { goods: 0, sum: 0, count: 0 });
function seedOrder(o) {
  const base = new Date(); base.setHours(11, 20, 0, 0);
  const created = base.getTime() - o.ago * DAY - ((o.ago * 37) % 300) * 6e4;
  const items = o.items.map(([id, qty, size]) => { const p = E.P[id]; return { id, qty, size: size || null, price: p.price, old: p.old }; });
  const s = sumItems(items); const berries = o.berries || 0; const delivery = 0;
  return { num: o.num, seed: true, created, items, type: o.type, point: o.point, address: o.type === 'courier' ? 'Москва, ул. Большая Дмитровка, 12, кв. 48' : null,
    slot: o.type === 'courier' ? '18:00–21:00' : null, dlv: base.getTime() + o.eta * DAY, keep: o.keep ? base.getTime() + o.keep * DAY : null,
    st: o.st, code: o.code || String(1000 + (parseInt(o.num.slice(-4), 10) * 7) % 9000), pay: o.pay, card: o.pay === 'card' ? 'Visa •• 4242' : null,
    recipient: { name: 'Анна Ягодкина', phone: '+79991234567' },
    sums: { goods: s.goods, disc: s.goods - s.sum, promo: 0, gift: 0, berries, delivery, total: s.sum - berries + delivery }, earn: Math.floor((s.sum - berries) * 0.05) };
}
function liveStatus(o) {
  if (o.cancelled) return 'cancelled';
  if (o.st && o.seed) return o.st;
  const el = Date.now() - o.created;
  if (el < 30 * 6e4) return 'new';
  if (el < 8 * 36e5) return 'assembling';
  if (Date.now() < o.dlv) return 'shipping';
  return o.type === 'pickup' && Date.now() < o.dlv + 7 * DAY ? 'ready' : 'done';
}
E.orders = () => {
  const ov = E.get('orderOv', {});
  return SEED.map(seedOrder).concat(E.get('orders', [])).map(o => {
    const v = ov[o.num]; if (v) Object.assign(o, v);
    o.status = liveStatus(o); return o;
  }).sort((a, b) => b.created - a.created);
};
E.order = num => E.orders().find(o => o.num === num);
E.cancelOrder = num => { const ov = E.get('orderOv', {}); ov[num] = Object.assign(ov[num] || {}, { cancelled: true, cancelledAt: Date.now() }); E.set('orderOv', ov);
  const o = E.order(num); if (o && o.sums.berries) E.berries.add(o.sums.berries, 'Возврат ягодок за отменённый заказ ' + num); };
E.newOrderNum = () => 'ЕЖ-' + String(4815200 + Math.floor(Math.random() * 79999));

/* ---------- ягодки и клуб ---------- */
E.LEVELS = [{ n: 1, name: 'Зелёная ягода', from: 0, rate: 3 }, { n: 2, name: 'Спелая ягода', from: 10000, rate: 5 }, { n: 3, name: 'Ежевичный эксперт', from: 50000, rate: 7 }];
E.berries = {
  log() {
    const t = new Date(); t.setHours(12, 0, 0, 0); const at = d => t.getTime() - d * DAY;
    const seedLog = [
      { t: at(2), title: 'Отзыв о товаре «Кеды кожаные белые, унисекс»', v: 50 },
      { t: at(10), title: 'Кешбэк за заказ ЕЖ-4802311', v: 218 },
      { t: at(12), title: 'Оплата заказа ЕЖ-4802311', v: -300 },
      { t: at(23), title: 'Кешбэк за заказ ЕЖ-4790004', v: 532 },
      { t: at(30), title: 'Бонус за вступление в Ягодный клуб', v: 500 },
      { t: at(45), title: 'Подарок на день рождения клуба', v: 250 },
    ];
    return seedLog.concat(E.get('berriesLog', [])).sort((a, b) => b.t - a.t);
  },
  balance() { return E.user() ? Math.max(0, E.berries.log().reduce((s, x) => s + x.v, 0)) : 0; },
  add(v, title) { const l = E.get('berriesLog', []); l.push({ t: Date.now(), title, v }); E.set('berriesLog', l); },
};
E.club = {
  spent() { return E.orders().filter(o => o.status === 'done').reduce((s, o) => s + o.sums.total, 0); },
  level() { const s = E.club.spent(); return E.LEVELS.slice().reverse().find(l => s >= l.from); },
  next() { const l = E.club.level(); return E.LEVELS[l.n] || null; },
  rate() { return E.user() ? E.club.level().rate : 0; },
};

/* ---------- корзина ---------- */
const ck = (id, size) => id + '|' + (size || '');
E.ck = ck;
E.PROMO = {
  'ЕЖЕВИКА': { type: 'pct', v: 10, max: 3000, title: '−10% на весь заказ, до 3 000 ₽' },
  'ЯГОДА500': { type: 'fix', v: 500, min: 3000, title: '−500 ₽ на заказ от 3 000 ₽' },
  'НОВЫЙГОД': { type: 'pct', v: 15, cat: 'newyear', title: '−15% на товары к Новому году' },
  'WELCOME': { type: 'fix', v: 300, min: 1500, title: '−300 ₽ на первый заказ от 1 500 ₽' },
};
const PROMO_ALIAS = { EZHEVIKA: 'ЕЖЕВИКА', YAGODA500: 'ЯГОДА500', NOVYIGOD: 'НОВЫЙГОД', NEWYEAR: 'НОВЫЙГОД', 'ВЕЛКАМ': 'WELCOME' };
E.promoCode = c => { c = String(c || '').toUpperCase().replace(/\s/g, '').replace(/Ё/g, 'Е'); c = PROMO_ALIAS[c] || c; return E.PROMO[c] ? c : null; };
E.cart = {
  raw: () => E.get('cart', []).filter(x => E.P[x.id]),
  save: l => E.set('cart', l),
  items: () => E.cart.raw().map(x => Object.assign({ key: ck(x.id, x.size), p: E.P[x.id] }, x)),
  count: () => E.cart.raw().reduce((s, x) => s + x.qty, 0),
  qty: id => E.cart.raw().filter(x => x.id == id).reduce((s, x) => s + x.qty, 0),
  has: (id, size) => E.cart.raw().some(x => ck(x.id, x.size) === ck(id, size)),
  add(id, size, qty = 1, quiet) {
    const l = E.cart.raw(), k = ck(id, size), f = l.find(x => ck(x.id, x.size) === k);
    if (f) { if (f.qty >= 10) { E.toast('Можно заказать не более 10 шт. одного товара', { icon: 'info' }); return; } f.qty = Math.min(10, f.qty + qty); f.sel = true; f.t = Date.now(); }
    else l.push({ id: +id, size: size || null, qty, sel: true, t: Date.now() });
    E.cart.save(l);
    if (!quiet) E.toast('Товар добавлен в корзину', { img: E.P[id].img, action: ['Перейти', 'cart.html'] });
  },
  set(key, qty) { let l = E.cart.raw(); const f = l.find(x => ck(x.id, x.size) === key); if (!f) return; if (qty <= 0) l = l.filter(x => x !== f); else f.qty = Math.min(10, qty); E.cart.save(l); },
  dec(id) { const l = E.cart.raw().filter(x => x.id == id).sort((a, b) => b.t - a.t); if (l[0]) E.cart.set(ck(l[0].id, l[0].size), l[0].qty - 1); },
  remove(keys) { E.cart.save(E.cart.raw().filter(x => !keys.includes(ck(x.id, x.size)))); },
  sel(key, v) { const l = E.cart.raw(); l.forEach(x => { if (key === '*' || ck(x.id, x.size) === key) x.sel = v; }); E.cart.save(l); },
};
E.calc = (items, o = {}) => {
  const r = { count: 0, goods: 0, sum: 0, gift: 0, promo: 0, promoErr: '', berries: 0, berriesMax: 0, delivery: 0, total: 0, earn: 0 };
  items.forEach(x => { r.count += x.qty; r.goods += x.p.old * x.qty; r.sum += x.p.price * x.qty; });
  r.disc = r.goods - r.sum;
  const units = []; items.forEach(x => { if (x.p.cat === 'beauty') for (let i = 0; i < x.qty; i++) units.push(x.p.price); });
  units.sort((a, b) => b - a); for (let i = 2; i < units.length; i += 3) r.gift += units[i];
  const code = o.promo && E.PROMO[o.promo];
  if (code) {
    const base = code.cat ? items.filter(x => x.p.cat === code.cat).reduce((s, x) => s + x.p.price * x.qty, 0) : r.sum - r.gift;
    if (code.min && r.sum < code.min) r.promoErr = 'Промокод действует для заказов от ' + E.money(code.min);
    else if (code.cat && !base) r.promoErr = 'В корзине нет товаров из раздела «' + E.C[code.cat].name + '»';
    else r.promo = code.type === 'pct' ? Math.min(Math.round(base * code.v / 100), code.max || 1e9) : Math.min(code.v, base);
  }
  const after = Math.max(0, r.sum - r.gift - r.promo);
  r.berriesMax = Math.min(E.berries.balance(), Math.floor(after * 0.3));
  r.berries = o.berries ? r.berriesMax : 0;
  r.delivery = o.courier ? (after >= 1000 ? 0 : 99) : 0;
  r.total = Math.max(0, after - r.berries + r.delivery);
  r.earn = Math.floor((after - r.berries) * E.club.rate() / 100);
  return r;
};

/* ---------- избранное и просмотренное ---------- */
E.fav = {
  list: () => E.get('fav', []).filter(x => E.P[x.id]),
  has: id => E.fav.list().some(x => x.id == id),
  toggle(id, quiet) {
    let l = E.fav.list(); const h = l.some(x => x.id == id);
    l = h ? l.filter(x => x.id != id) : [{ id: +id, t: Date.now() }].concat(l);
    E.set('fav', l);
    if (!quiet) E.toast(h ? 'Удалено из избранного' : 'Добавлено в избранное', h ? { icon: 'heart', action: ['Вернуть', () => E.fav.toggle(id, true)] } : { icon: 'heart', action: ['Открыть', 'favorites.html'] });
    return !h;
  },
};
E.recent = {
  add(id) { const l = E.get('recent', []).filter(x => x != id); l.unshift(+id); E.set('recent', l.slice(0, 18)); },
  list: () => E.get('recent', []).filter(id => E.P[id]).map(id => E.P[id]),
};
E.point = () => E.PT[E.get('point', 'pt1')] || D.points[0];

/* ---------- поиск ---------- */
E.POPULAR = ['пуховик', 'наушники', 'кроссовки', 'ёлка', 'кофемашина', 'плед', 'подарки', 'платье', 'свеча', 'робот-пылесос'];
const stem = t => t.length <= 3 ? t : t.length <= 5 ? t.slice(0, -1) : t.slice(0, -2);
E.tokens = q => E.norm(q).split(/[\s,.;:!?()«»"/+]+/).filter(Boolean).map(stem);
E.hay = p => p._h || (p._h = E.norm([p.name, p.brand, E.C[p.cat].name, E.subName(p.cat, p.sub), p.color, p.article].join(' ')));
E.search = (q, list = D.products) => {
  const tk = E.tokens(q); if (!tk.length) return [];
  return list.map(p => { const h = E.hay(p), n = E.norm(p.name); let sc = 0; for (const t of tk) { if (h.indexOf(t) < 0) return null; sc += n.indexOf(t) >= 0 ? 3 : 1; } return { p, sc: sc + p.sold / 1e6 }; })
    .filter(Boolean).sort((a, b) => b.sc - a.sc).map(x => x.p);
};
E.searchCats = q => {
  const tk = E.tokens(q), out = [];
  D.cats.forEach(c => { if (tk.some(t => E.norm(c.name).indexOf(t) >= 0)) out.push({ n: c.name, h: E.url.cat(c.id), s: 'Категория' });
    c.subs.forEach(s => { if (tk.some(t => E.norm(s.name).indexOf(t) >= 0)) out.push({ n: s.name, h: E.url.cat(c.id, s.id), s: c.name }); }); });
  D.brands.forEach(b => { if (tk.some(t => E.norm(b).indexOf(t) === 0)) out.push({ n: b, h: E.url.brand(b), s: 'Бренд' }); });
  return out.slice(0, 4);
};

/* ---------- уведомления, окна ---------- */
E.toast = (msg, o = {}) => {
  let w = $('.toasts'); if (!w) { w = document.createElement('div'); w.className = 'toasts'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); }
  const t = document.createElement('div'); t.className = 'toast' + (o.type ? ' t-' + o.type : '');
  const act = o.action ? (typeof o.action[1] === 'function' ? `<button type="button">${o.action[0]}</button>` : `<a href="${o.action[1]}">${o.action[0]}</a>`) : '';
  t.innerHTML = (o.img ? `<img src="${o.img}" alt="">` : `<span class="t-ic">${E.icon(o.icon || 'check-c', 'i-20')}</span>`) + `<span class="t-msg">${msg}</span>${act}`;
  if (o.action && typeof o.action[1] === 'function') t.querySelector('button').onclick = () => { o.action[1](); hide(); };
  w.appendChild(t); while (w.children.length > 3) w.firstChild.remove();
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));
  const hide = () => { t.classList.remove('in'); setTimeout(() => t.remove(), 260); };
  setTimeout(hide, o.ms || 3000);
};
let locks = 0;
E.lock = on => {
  const de = document.documentElement;
  if (on && !locks) de.style.setProperty('--sbw', Math.max(0, window.innerWidth - de.clientWidth) + 'px');
  locks = Math.max(0, locks + (on ? 1 : -1));
  de.classList.toggle('lock', locks > 0);
  if (!locks) de.style.setProperty('--sbw', '0px');
};
E.modal = ({ title = '', html = '', foot = '', cls = '', wide = false, onClose } = {}) => {
  const ov = document.createElement('div');
  ov.className = 'm-ovl';
  ov.innerHTML = `<div class="modal ${cls}${wide ? ' m-wide' : ''}" role="dialog" aria-modal="true" aria-label="${E.esc(title.replace(/<[^>]+>/g, ''))}">
    <div class="m-head">${title ? `<h3>${title}</h3>` : '<span></span>'}<button type="button" class="m-x" data-close aria-label="Закрыть">${E.icon('close')}</button></div>
    <div class="m-body">${html}</div>${foot ? `<div class="m-foot">${foot}</div>` : ''}</div>`;
  document.body.appendChild(ov); E.lock(true);
  const prev = document.activeElement;
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('open')));
  const esc = e => { if (e.key === 'Escape' && $$('.m-ovl').pop() === ov) close(); };
  const close = () => { if (ov._closed) return; ov._closed = 1; ov.classList.remove('open'); E.lock(false); document.removeEventListener('keydown', esc); setTimeout(() => ov.remove(), 220); if (prev && prev.focus) prev.focus({ preventScroll: true }); if (onClose) onClose(); };
  document.addEventListener('keydown', esc);
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
  setTimeout(() => { const f = ov.querySelector('[autofocus]') || (matchMedia('(pointer:fine)').matches && ov.querySelector('.m-body input:not([type=checkbox]):not([type=radio]),.m-body textarea')); (f || ov.querySelector('.m-x')).focus({ preventScroll: true }); }, 60);
  return { el: ov.firstElementChild, ov, close };
};
E.confirm = ({ title, text, ok = 'Подтвердить', cancel = 'Отмена', danger, onOk }) => {
  const m = E.modal({ title, cls: 'm-confirm', html: `<p class="m-text">${text}</p>`,
    foot: `<button type="button" class="btn btn-outline" data-close>${cancel}</button><button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${ok}</button>` });
  $('[data-ok]', m.el).onclick = () => { m.close(); onOk && onOk(); };
  return m;
};
E.copy = (text, msg) => {
  const done = () => E.toast(msg || 'Скопировано: ' + E.esc(text), { icon: 'copy' });
  const fb = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { /* нет доступа */ } ta.remove(); done(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fb); else fb();
};

/* ---------- разметка общих блоков ---------- */
E.card = (p, o = {}) => {
  const d = E.disc(p), fav = E.fav.has(p.id), fl = p.flags && p.flags[0];
  return `<article class="pcard" data-pid="${p.id}">
  <a class="pcard-ph" href="${E.url.p(p.id)}" tabindex="-1" aria-hidden="true"><img src="${p.img}" alt="" loading="lazy" decoding="async" width="480" height="640">${fl ? `<span class="flag flag-${fl}">${E.FLAGS[fl]}</span>` : ''}${d >= 5 ? `<span class="off">−${d}%</span>` : ''}</a>
  <button type="button" class="fav${fav ? ' on' : ''}" data-fav="${p.id}" aria-label="${fav ? 'Убрать из избранного' : 'Добавить в избранное'}" aria-pressed="${fav}">${E.icon('heart', 'i-20')}</button>
  <div class="price"><b>${E.money(p.price)}</b><s>${E.money(p.old)}</s></div>
  <a class="pcard-t" href="${E.url.p(p.id)}">${E.esc(p.name)}</a>
  <div class="rate">${E.STAR}<b>${E.rate(p.rating)}</b><span>· ${E.pl(p.reviews, 'оценка', 'оценки', 'оценок')}</span></div>
  ${o.noBuy ? '' : `<div class="pcard-buy">${E.buyBtn(p)}</div>`}${o.extra || ''}</article>`;
};
E.buyBtn = p => {
  const q = E.cart.qty(p.id);
  return q ? `<div class="stepper"><button type="button" data-dec="${p.id}" aria-label="Убрать одну штуку">${E.icon('minus', 'i-18')}</button><a href="cart.html" title="Перейти в корзину">${q}${NB}шт</a><button type="button" data-inc="${p.id}" aria-label="Добавить ещё">${E.icon('plus', 'i-18')}</button></div>`
    : `<button type="button" class="buy" data-add="${p.id}">${E.icon('cart', 'i-18')}В корзину</button>`;
};
E.grid = (list, cls = '') => `<div class="grid ${cls}">${list.map(p => E.card(p)).join('')}</div>`;
E.rail = (html, cls = '') => `<div class="rail ${cls}"><button type="button" class="rail-btn prev" aria-label="Прокрутить назад">${E.icon('chev-l')}</button><div class="rail-track">${html}</div><button type="button" class="rail-btn next" aria-label="Прокрутить вперёд">${E.icon('chev-r')}</button></div>`;
E.secH = (title, href, link = 'Смотреть все', extra = '') => `<div class="sec-h"><h2>${title}</h2>${extra}${href ? `<a class="sec-more" href="${href}">${link}${E.icon('chev-r', 'i-18')}</a>` : ''}</div>`;
E.crumbs = list => `<nav class="crumbs" aria-label="Навигационная цепочка"><a href="index.html">Главная</a>${list.map(([t, h]) => E.icon('chev-r', 'i-16') + (h ? `<a href="${h}">${t}</a>` : `<span>${t}</span>`)).join('')}</nav>`;
E.empty = ({ icon = 'bag', title, text = '', btns = '', cls = '' }) => `<div class="empty ${cls}"><span class="empty-ic">${icon === 'berry' ? E.berry() : E.icon(icon)}</span><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}${btns ? `<div class="empty-btns">${btns}</div>` : ''}</div>`;
E.initRails = (root = document) => $$('.rail', root).forEach(r => {
  if (r._init) return; r._init = 1; const t = $('.rail-track', r);
  const upd = () => { r.classList.toggle('at-start', t.scrollLeft < 6); r.classList.toggle('at-end', t.scrollLeft + t.clientWidth >= t.scrollWidth - 6); };
  t.addEventListener('scroll', upd, { passive: true }); if (window.ResizeObserver) new ResizeObserver(upd).observe(t); upd();
  $('.prev', r).onclick = () => t.scrollBy({ left: -t.clientWidth * 0.9, behavior: 'smooth' });
  $('.next', r).onclick = () => t.scrollBy({ left: t.clientWidth * 0.9, behavior: 'smooth' });
});
E.pickPrice = p => `<div class="price"><b>${E.money(p.price)}</b><s>${E.money(p.old)}</s></div>`;
E.avatar = (name, c = '') => `<span class="ava ${c}">${E.esc((name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase())}</span>`;

/* ---------- размеры ---------- */
E.sizeKind = p => { const s = p.sizes || []; if (!s.length) return null; const n = parseInt(s[0], 10); if (isNaN(n)) return p.cat === 'women' ? 'women' : 'men'; if (p.cat === 'kids') return 'kids'; if (p.cat === 'shoes') return 'shoes'; return 'jeans'; };
E.sizeTable = p => {
  const k = E.sizeKind(p); let head, rows, note;
  if (k === 'women') { head = ['Размер', 'RU', 'Обхват груди', 'Обхват талии', 'Обхват бёдер']; rows = [['XS', '42', '82–86', '62–66', '88–92'], ['S', '44', '86–90', '66–70', '92–96'], ['M', '46', '90–94', '70–74', '96–100'], ['L', '48', '94–98', '74–78', '100–104'], ['XL', '50', '98–102', '78–82', '104–108']]; }
  else if (k === 'men') { head = ['Размер', 'RU', 'Обхват груди', 'Обхват талии', 'Рост']; rows = [['S', '46', '90–94', '78–82', '170–176'], ['M', '48', '94–98', '82–86', '176–182'], ['L', '50', '98–102', '86–90', '176–182'], ['XL', '52', '102–106', '90–94', '182–188'], ['XXL', '54', '106–110', '94–98', '182–188']]; }
  else if (k === 'shoes') { head = ['Размер RU', 'EU', 'Длина стопы, см']; rows = p.sizes.map(s => [s, String(+s + 1), (((+s + 1) * 2 / 3) - 1.5).toFixed(1).replace('.', ',')]); note = 'Измерьте стопу от пятки до кончика самого длинного пальца и выберите ближайшее большее значение.'; }
  else if (k === 'kids') { head = ['Размер', 'Рост, см', 'Возраст']; const age = { 56: '0–1 мес.', 62: '1–3 мес.', 68: '3–6 мес.', 74: '6–9 мес.', 80: '9–12 мес.', 86: '1–1,5 года', 92: '1,5–2 года', 98: '2–3 года', 104: '3–4 года', 110: '4–5 лет' }; rows = p.sizes.map(s => [s, s, age[s] || '']); }
  else { head = ['Размер (W)', 'Обхват талии, см', 'RU']; rows = p.sizes.map(s => [s, Math.round(+s * 2.54) + '', String(+s + 16)]); }
  E.modal({ title: 'Таблица размеров', cls: 'm-sizes', html: `<p class="m-text">${note || 'Все размеры указаны в сантиметрах. Если вы между двумя размерами, выбирайте больший.'}</p><div class="tbl-wrap"><table class="tbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr${(p.soldOut || []).includes(r[0]) ? ' class="muted"' : ''}>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` });
};
E.sizePicker = (p, cb) => {
  const so = p.soldOut || [];
  const m = E.modal({ title: 'Выберите размер', cls: 'm-pick', html: `<div class="mini"><img src="${p.img}" alt=""><div>${E.pickPrice(p)}<div class="mini-t clamp2">${E.esc(p.name)}</div></div></div>
    <div class="sizes">${p.sizes.map(s => `<button type="button" class="size${so.includes(s) ? ' na' : ''}" data-size="${s}"${so.includes(s) ? ' disabled' : ''}>${s}${so.includes(s) ? '<small>нет</small>' : ''}</button>`).join('')}</div>
    <button type="button" class="link-btn" data-act="sizetable" data-sz="${p.id}">${E.icon('ruler', 'i-18')}Таблица размеров</button>`,
    foot: '<button type="button" class="btn btn-primary btn-lg btn-block" data-ok disabled>Добавить в корзину</button>' });
  let sel = null;
  m.el.addEventListener('click', e => {
    const b = e.target.closest('[data-size]');
    if (b) { sel = b.dataset.size; $$('.size', m.el).forEach(x => x.classList.toggle('on', x === b)); $('[data-ok]', m.el).disabled = false; }
    if (e.target.closest('[data-ok]') && sel) { m.close(); if (cb) cb(sel); else E.cart.add(p.id, sel); }
  });
};
E.addFlow = (id, cb) => { const p = E.P[id]; if (p.sizes) E.sizePicker(p, cb); else { E.cart.add(id); if (cb) cb(null); } };

/* ---------- карта и пункты выдачи ---------- */
E.mapSVG = seed => {
  const r = E.rng(seed); const W = 1000, H = 700;
  let s = `<svg class="map-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${W}" height="${H}" fill="#ECEDF2"/>`;
  const a = (r() - 0.5) * 26;
  s += `<g transform="rotate(${a.toFixed(1)} 500 350)" stroke="#fff" stroke-width="6" fill="none">`;
  for (let x = -400; x < 1400; x += 62 + r() * 46) s += `<path d="M${x.toFixed(0)} -400V1100"/>`;
  for (let y = -400; y < 1100; y += 56 + r() * 42) s += `<path d="M-400 ${y.toFixed(0)}H1400"/>`;
  s += '</g>';
  for (let i = 0; i < 6; i++) { const x = r() * 900, y = r() * 620, w = 70 + r() * 170, h = 50 + r() * 120; s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="26" fill="#D9EED6"/>`; }
  const y0 = 140 + r() * 420;
  s += `<path d="M-40 ${y0.toFixed(0)} C 240 ${(y0 - 140 - r() * 80).toFixed(0)}, 430 ${(y0 + 170).toFixed(0)}, 690 ${(y0 + 20).toFixed(0)} S 980 ${(y0 - 70).toFixed(0)}, 1060 ${(y0 + 30).toFixed(0)}" fill="none" stroke="#C9DFF4" stroke-width="44" stroke-linecap="round"/>`;
  const rx = 300 + r() * 70, ry = 210 + r() * 50, cx = 480 + r() * 40, cy = 330 + r() * 40;
  const roads = `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}"/>` + [0, 1, 2, 3].map(i => { const t = (i / 4) * Math.PI + r() * 0.5; return `<path d="M${(cx - Math.cos(t) * 900).toFixed(0)} ${(cy - Math.sin(t) * 900).toFixed(0)}L${(cx + Math.cos(t) * 900).toFixed(0)} ${(cy + Math.sin(t) * 900).toFixed(0)}"/>`; }).join('');
  s += `<g fill="none" stroke="#DCDDE5" stroke-width="20" stroke-linecap="round">${roads}</g><g fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round">${roads}</g><g fill="none" stroke="#FFE9B8" stroke-width="5" stroke-linecap="round" opacity=".9">${roads}</g></svg>`;
  return s;
};
E.pinHTML = (p, on) => `<button type="button" class="mpin${on ? ' on' : ''}${p.type === 'Постамат' ? ' locker' : ''}" style="left:${p.x}%;top:${p.y}%" data-pt="${p.id}" aria-label="${E.esc(p.addr)}"><svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39s13-12.4 13-23A13 13 0 0 0 3 16c0 10.6 13 23 13 23z"/></svg>${p.type === 'Постамат' ? E.icon('box', 'pin-ic') : E.berry('pin-ic')}</button>`;
E.ptRow = (p, on) => `<button type="button" class="pt-row${on ? ' on' : ''}" data-pt="${p.id}"><span class="pt-ic${p.type === 'Постамат' ? ' locker' : ''}">${p.type === 'Постамат' ? E.icon('box', 'i-20') : E.berry()}</span><span class="pt-main"><b>${E.esc(p.addr)}</b><span>${p.type} · ${p.metro ? E.esc(p.metro) + ' · ' : ''}${p.hours}</span></span><span class="pt-rate">${E.STAR}${E.rate(p.rating)}</span></button>`;
E.cities = () => Array.from(new Set(D.points.map(p => p.city)));
E.pickup = (onPick, opts = {}) => {
  let sel = opts.sel || E.point().id, city = E.PT[sel].city, q = '';
  const m = E.modal({ title: opts.title || 'Пункт выдачи', wide: true, cls: 'm-pickup', html: `<div class="pk"><div class="pk-side">
    <div class="chips pk-cities">${E.cities().map(c => `<button type="button" class="chip${c === city ? ' on' : ''}" data-city="${c}">${c}</button>`).join('')}</div>
    <label class="input-ic">${E.icon('search', 'i-18')}<input class="input" type="search" placeholder="Улица, метро или тип пункта" data-pkq></label>
    <div class="seg pk-view"><button type="button" class="on" data-view="list">${E.icon('list', 'i-18')}Списком</button><button type="button" data-view="map">${E.icon('map', 'i-18')}На карте</button></div>
    <div class="pk-list"></div></div><div class="pk-map map"></div></div>`,
    foot: `<div class="pk-sel"></div><button type="button" class="btn btn-primary btn-lg" data-pkok>Заберу отсюда</button>` });
  const el = m.el, list = $('.pk-list', el), map = $('.pk-map', el);
  const pts = () => D.points.filter(p => p.city === city && (!q || E.norm(p.addr + ' ' + p.metro + ' ' + p.type).indexOf(E.norm(q)) >= 0));
  const draw = () => {
    const l = pts();
    list.innerHTML = l.length ? l.map(p => E.ptRow(p, p.id === sel)).join('') : `<p class="pk-none">Ничего не нашлось. Попробуйте другой запрос.</p>`;
    map.innerHTML = E.mapSVG(E.cities().indexOf(city) * 7 + 3) + l.map(p => E.pinHTML(p, p.id === sel)).join('');
    const p = E.PT[sel];
    $('.pk-sel', el).innerHTML = p && p.city === city ? `<b>${E.esc(p.addr)}</b><span>${p.type} · ${p.hours} · хранение 7 дней</span>` : '<span>Выберите пункт на карте или в списке</span>';
    $('[data-pkok]', el).disabled = !(p && p.city === city);
  };
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-city]'); if (c) { city = c.dataset.city; $$('[data-city]', el).forEach(x => x.classList.toggle('on', x === c)); const first = D.points.find(p => p.city === city); if (E.PT[sel].city !== city) sel = first.id; draw(); }
    const pt = e.target.closest('[data-pt]'); if (pt) { sel = pt.dataset.pt; draw(); if (pt.classList.contains('mpin')) { const row = $(`.pt-row[data-pt="${sel}"]`, el); if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }
    const v = e.target.closest('[data-view]'); if (v) { $$('[data-view]', el).forEach(x => x.classList.toggle('on', x === v)); el.classList.toggle('show-map', v.dataset.view === 'map'); }
    if (e.target.closest('[data-pkok]')) { if (!opts.noSave) E.set('point', sel); m.close(); E.toast('Пункт выдачи: ' + E.esc(E.PT[sel].addr), { icon: 'pin' }); if (onPick) onPick(sel); }
  });
  $('[data-pkq]', el).addEventListener('input', E.debounce(e => { q = e.target.value; draw(); }, 120));
  draw();
  return m;
};

/* ---------- шапка ---------- */
const NAV = [['newyear', 'Новый год'], ['women', 'Женщинам'], ['men', 'Мужчинам'], ['kids', 'Детям'], ['shoes', 'Обувь'], ['home', 'Дом'], ['beauty', 'Красота'], ['electronics', 'Электроника'], ['sport', 'Спорт']];
function renderHeader() {
  const host = $('#app-header'); if (!host) return;
  const u = E.user(), pg = document.body.dataset.page, ps = E.params(), cat = pg === 'catalog' ? ps.get('cat') : null;
  host.innerHTML = `<header class="hdr" id="hdr">
  <div class="hdr-top wrap">
    <button type="button" class="burger" data-act="catalog" aria-label="Каталог товаров" aria-expanded="false">${E.icon('menu', 'i-menu')}${E.icon('close', 'i-x')}</button>
    <a class="logo" href="index.html" aria-label="Ежевика — на главную">${E.LOGO()}</a>
    <form class="search" action="catalog.html" method="get" role="search" autocomplete="off">
      <input type="search" name="q" placeholder="Найти на Ежевике" aria-label="Поиск по товарам" enterkeyhint="search" maxlength="80" value="${E.esc(pg === 'catalog' ? ps.get('q') || '' : '')}">
      <button type="button" class="s-clear" aria-label="Очистить поиск">${E.icon('close', 'i-18')}</button>
      <button type="button" class="s-cam" data-act="photo" aria-label="Поиск по фото">${E.icon('camera')}</button>
      <button type="submit" class="go" aria-label="Найти">${E.icon('search', 'i-20')}</button>
      <div class="suggest" hidden></div>
    </form>
    <nav class="hdr-icons" aria-label="Личный раздел">
      <button type="button" class="hi hi-addr" data-act="pickup" aria-label="Адреса">${E.icon('pin')}<span>Адреса</span></button>
      <a class="hi hi-user${pg === 'account' || pg === 'login' ? ' on' : ''}" href="${u ? 'account.html' : 'login.html'}">${E.icon('user')}<span>${u ? E.esc(u.name) : 'Войти'}</span></a>
      <a class="hi hi-fav${pg === 'favorites' ? ' on' : ''}" href="favorites.html">${E.icon('heart')}<span>Избранное</span><b class="badge" data-badge="fav" hidden></b></a>
      <a class="hi hi-cart${pg === 'cart' ? ' on' : ''}" href="cart.html">${E.icon('bag')}<span>Корзина</span><b class="badge" data-badge="cart" hidden></b></a>
    </nav>
  </div>
  <div class="hdr-nav"><div class="wrap hdr-nav-in"><nav class="nav-links" aria-label="Разделы каталога">
    <a class="hot${pg === 'promo' ? ' on' : ''}" href="promo.html">Распродажа 11.11</a>${NAV.map(([id, n]) => `<a href="${E.url.cat(id)}"${cat === id ? ' class="on" aria-current="page"' : ''}>${n}</a>`).join('')}<a href="brands.html"${pg === 'brands' ? ' class="on"' : ''}>Бренды</a></nav>
    <button type="button" class="addr" data-act="pickup">${E.icon('pin', 'i-18')}<span data-addr></span></button></div></div>
  </header><div class="mega" hidden></div>`;
  initSearch(); initScroll();
}
function initScroll() {
  const h = $('#hdr'); let last = -1, tick = false;
  const upd = () => { tick = false; const y = window.scrollY; const c = y > 90; if (c !== last) { h.classList.toggle('compact', c); last = c; } };
  window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
}
function initSearch() {
  const form = $('.hdr .search'), inp = $('input', form), box = $('.suggest', form);
  const hist = () => E.get('searches', []);
  const save = q => { const l = hist().filter(x => E.norm(x) !== E.norm(q)); l.unshift(q); E.set('searches', l.slice(0, 6)); };
  const open = () => { box.hidden = false; form.classList.add('open'); document.body.classList.add('sg-open'); };
  const close = () => { box.hidden = true; form.classList.remove('open'); document.body.classList.remove('sg-open'); };
  const hl = (t, q) => { let s = E.esc(t); E.tokens(q).forEach(k => { if (k.length < 2) return; const i = E.norm(s).indexOf(k); if (i >= 0) s = s.slice(0, i) + '<mark>' + s.slice(i, i + k.length) + '</mark>' + s.slice(i + k.length); }); return s; };
  const render = () => {
    const q = inp.value.trim(); form.classList.toggle('has-q', !!q);
    if (!q) {
      const h = hist();
      box.innerHTML = (h.length ? `<div class="sg-sec"><div class="sg-h">Вы искали<button type="button" data-sgclear>Очистить</button></div>${h.map(x => `<a class="sg-row" href="${E.url.q(x)}">${E.icon('clock', 'i-18')}<span>${E.esc(x)}</span></a>`).join('')}</div>` : '')
        + `<div class="sg-sec"><div class="sg-h">Часто ищут</div><div class="sg-chips">${E.POPULAR.map(x => `<a href="${E.url.q(x)}">${x}</a>`).join('')}</div></div>`;
    } else {
      const res = E.search(q).slice(0, 6), cats = E.searchCats(q);
      box.innerHTML = (cats.length ? `<div class="sg-sec">${cats.map(c => `<a class="sg-row" href="${c.h}">${E.icon('search', 'i-18')}<span>${hl(c.n, q)}</span><small>${c.s}</small></a>`).join('')}</div>` : '')
        + (res.length ? `<div class="sg-sec"><div class="sg-h">Товары</div>${res.map(p => `<a class="sg-p" href="${E.url.p(p.id)}"><img src="${p.img}" alt="" loading="lazy"><span class="sg-pt">${hl(p.name, q)}</span><b>${E.money(p.price)}</b></a>`).join('')}</div>
        <a class="sg-all" href="${E.url.q(q)}">Показать все результаты${E.icon('arrow-r', 'i-18')}</a>` : `<div class="sg-empty">По запросу «${E.esc(q)}» ничего не нашлось. Проверьте написание или попробуйте <a href="${E.url.q('подарки')}">подарки</a>.</div>`);
    }
    open();
  };
  inp.addEventListener('focus', render);
  inp.addEventListener('input', E.debounce(render, 90));
  inp.addEventListener('keydown', e => {
    const items = $$('a.sg-row,a.sg-p,a.sg-all,.sg-chips a', box); const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); items[0].focus(); }
    if (e.key === 'Escape') { close(); inp.blur(); }
    void i;
  });
  box.addEventListener('keydown', e => {
    const items = $$('a.sg-row,a.sg-p,a.sg-all,.sg-chips a', box); const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) inp.focus(); else items[i - 1].focus(); }
    if (e.key === 'Escape') { close(); inp.focus(); }
  });
  box.addEventListener('click', e => { if (e.target.closest('[data-sgclear]')) { e.preventDefault(); E.set('searches', []); render(); inp.focus(); } const a = e.target.closest('a'); if (a && a.href.indexOf('q=') > 0) save(decodeURIComponent(a.href.split('q=')[1].split('&')[0])); });
  $('.s-clear', form).onclick = () => { inp.value = ''; inp.focus(); render(); };
  document.addEventListener('click', e => { if (!form.contains(e.target)) close(); });
  document.addEventListener('focusin', e => { if (!form.contains(e.target)) close(); });
  form.addEventListener('submit', e => { const q = inp.value.trim(); if (!q) { e.preventDefault(); inp.focus(); return; } save(q); });
}

/* ---------- каталог: мега-меню и мобильное меню ---------- */
const subCount = (c, s) => D.products.filter(p => p.cat === c && (!s || p.sub === s)).length;
function megaPanel(c) {
  const prods = D.products.filter(p => p.cat === c.id).sort((a, b) => b.sold - a.sold).slice(0, 3);
  return `<div class="mp-head"><h3>${c.name}</h3><a href="${E.url.cat(c.id)}">Все товары · ${subCount(c.id)}${E.icon('chev-r', 'i-18')}</a></div>
  <div class="mp-grid"><div class="mp-subs">${c.subs.map(s => `<a href="${E.url.cat(c.id, s.id)}">${s.name}<span>${subCount(c.id, s.id)}</span></a>`).join('')}</div>
  <div class="mp-prods"><div class="mp-ph">Популярное</div>${prods.map(p => `<a class="mp-p" href="${E.url.p(p.id)}"><img src="${p.img}" alt="" loading="lazy"><span><span class="clamp2">${E.esc(p.name)}</span><b>${E.money(p.price)}</b></span></a>`).join('')}</div></div>`;
}
function openMega() {
  const mega = $('.mega'), burger = $('.burger');
  if (!mega.innerHTML) {
    mega.innerHTML = `<div class="mega-in"><div class="wrap mega-wrap"><ul class="mega-cats">${D.cats.map((c, i) => `<li><a href="${E.url.cat(c.id)}" data-mc="${c.id}"${i ? '' : ' class="on"'}><img src="img/c/cat-${c.id}.webp" alt="" loading="lazy">${c.name}${E.icon('chev-r', 'i-16')}</a></li>`).join('')}</ul><div class="mega-panel">${megaPanel(D.cats[0])}</div></div></div>`;
    mega.addEventListener('mouseover', e => { const a = e.target.closest('[data-mc]'); if (a && !a.classList.contains('on')) { $$('[data-mc]', mega).forEach(x => x.classList.toggle('on', x === a)); $('.mega-panel', mega).innerHTML = megaPanel(E.C[a.dataset.mc]); } });
    mega.addEventListener('click', e => { if (e.target === mega) closeMega(); });
  }
  mega.hidden = false; requestAnimationFrame(() => mega.classList.add('open'));
  burger.classList.add('on'); burger.setAttribute('aria-expanded', 'true'); E.lock(true);
  document.addEventListener('keydown', megaEsc);
}
const megaEsc = e => { if (e.key === 'Escape') closeMega(); };
function closeMega() { const mega = $('.mega'); if (!mega || mega.hidden) return; mega.classList.remove('open'); mega.hidden = true; const b = $('.burger'); b.classList.remove('on'); b.setAttribute('aria-expanded', 'false'); E.lock(false); document.removeEventListener('keydown', megaEsc); }
function openDrawer() {
  const u = E.user();
  const dr = document.createElement('div'); dr.className = 'drawer';
  dr.innerHTML = `<div class="dr-panel" role="dialog" aria-modal="true" aria-label="Каталог"><div class="dr-head"><a class="logo logo-dark" href="index.html">${E.LOGO()}</a><button type="button" class="m-x" data-close aria-label="Закрыть">${E.icon('close')}</button></div>
  <div class="dr-views"><div class="dr-view dr-root">
    <a class="dr-user" href="${u ? 'account.html' : 'login.html'}">${u ? E.avatar(u.name + ' ' + u.surname) : `<span class="ava ava-ghost">${E.icon('user', 'i-20')}</span>`}<span><b>${u ? E.esc(u.name + ' ' + u.surname) : 'Войти или зарегистрироваться'}</b><small>${u ? 'Ягодный клуб · ' + E.pl(E.berries.balance(), 'ягодка', 'ягодки', 'ягодок') : 'Скидки и ягодки для участников клуба'}</small></span>${E.icon('chev-r', 'i-18')}</a>
    <div class="dr-h">Каталог</div>
    <div class="dr-list">${D.cats.map(c => `<button type="button" class="dr-row" data-dc="${c.id}"><img src="img/c/cat-${c.id}.webp" alt="" loading="lazy"><span>${c.name}</span>${E.icon('chev-r', 'i-18')}</button>`).join('')}</div>
    <div class="dr-h">Ежевика</div>
    <div class="dr-links">${[['promo.html', 'percent', 'Акции и промокоды'], ['brands.html', 'tag', 'Бренды'], ['club.html', 'crown', 'Ягодный клуб'], ['pickup.html', 'pin', 'Пункты выдачи'], ['help.html', 'help', 'Помощь'], ['sellers.html', 'store', 'Продавайте на Ежевике'], ['about.html', 'build', 'О компании']].map(([h, i, t]) => `<a href="${h}">${E.icon(i, 'i-20')}${t}</a>`).join('')}</div>
  </div><div class="dr-view dr-sub"></div></div></div>`;
  document.body.appendChild(dr); E.lock(true);
  requestAnimationFrame(() => requestAnimationFrame(() => dr.classList.add('open')));
  const close = () => { dr.classList.remove('open'); E.lock(false); document.removeEventListener('keydown', esc); setTimeout(() => dr.remove(), 260); };
  const esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  dr.addEventListener('click', e => {
    if (e.target === dr || e.target.closest('[data-close]')) return close();
    const c = e.target.closest('[data-dc]');
    if (c) { const cat = E.C[c.dataset.dc]; $('.dr-sub', dr).innerHTML = `<button type="button" class="dr-back" data-back>${E.icon('chev-l', 'i-20')}Все категории</button><div class="dr-cat"><img src="img/c/cat-${cat.id}.webp" alt=""><b>${cat.name}</b></div><div class="dr-list"><a class="dr-row dr-all" href="${E.url.cat(cat.id)}"><span>Все товары раздела</span><small>${subCount(cat.id)}</small>${E.icon('chev-r', 'i-18')}</a>${cat.subs.map(s => `<a class="dr-row" href="${E.url.cat(cat.id, s.id)}"><span>${s.name}</span><small>${subCount(cat.id, s.id)}</small>${E.icon('chev-r', 'i-18')}</a>`).join('')}</div>`; dr.classList.add('in-sub'); }
    if (e.target.closest('[data-back]')) dr.classList.remove('in-sub');
  });
}

/* ---------- подвал и нижняя панель ---------- */
function renderFooter() {
  const host = $('#app-footer'); if (!host) return;
  const cols = [
    ['Покупателям', [['help.html#order', 'Как сделать заказ'], ['help.html#payment', 'Способы оплаты'], ['help.html#delivery', 'Доставка'], ['help.html#return', 'Возврат товара'], ['pickup.html', 'Пункты выдачи'], ['club.html', 'Ягодный клуб'], ['promo.html', 'Акции и промокоды'], ['help.html', 'Вопросы и ответы']]],
    ['Партнёрам', [['sellers.html', 'Продавайте на Ежевике'], ['pickup.html#open', 'Откройте пункт выдачи'], ['sellers.html#ads', 'Рекламные возможности'], ['sellers.html#logistics', 'Доставка для бизнеса']]],
    ['Компания', [['about.html', 'О нас'], ['about.html#jobs', 'Вакансии'], ['about.html#press', 'Пресс-центр'], ['help.html#contacts', 'Контакты'], ['legal.html?doc=terms', 'Документы']]],
  ];
  const y = new Date().getFullYear();
  host.innerHTML = `<footer class="ftr"><div class="wrap">
  <div class="fcols">
    <div class="fbrand"><a class="logo logo-dark" href="index.html" aria-label="Ежевика — на главную">${E.LOGO()}</a><p class="ab">Маркетплейс с доставкой по всей России: тысячи товаров от проверенных продавцов и пункты выдачи рядом с домом</p>
      <div class="socials">${[['VK', 'ВКонтакте'], ['TG', 'Telegram'], ['OK', 'Одноклассники'], ['YT', 'YouTube']].map(([s, t]) => `<a href="#" data-act="social" aria-label="${t}">${s}</a>`).join('')}</div></div>
    ${cols.map(([h, l]) => `<details class="fcol"><summary><h4>${h}</h4>${E.icon('chev-d', 'i-18')}</summary><div class="fcol-l">${l.map(([href, t]) => `<a href="${href}">${t}</a>`).join('')}</div></details>`).join('')}
    <div class="fapp"><h4>Приложение Ежевики</h4><p class="ab">Скидка 300${NB}₽ на первый заказ по промокоду WELCOME</p>
      <div class="apps"><a href="#" data-act="app">App Store</a><a href="#" data-act="app">Google Play</a><a href="#" data-act="app">RuStore</a></div>
      <a class="fphone" href="tel:88007001234">${E.icon('phone', 'i-18')}8 800 700-12-34</a><span class="fnote">Бесплатно по России, круглосуточно</span></div>
  </div>
  <div class="fbot"><span>© ${y} Ежевика. Демонстрационный проект, все данные вымышлены</span><span class="flegal"><a href="legal.html?doc=privacy">Политика конфиденциальности</a><a href="legal.html?doc=terms">Пользовательское соглашение</a><a href="legal.html?doc=offer">Оферта</a></span></div>
  </div></footer>`;
  const mq = matchMedia('(min-width: 768px)');
  const sync = () => $$('.fcol', host).forEach(d => { d.open = mq.matches; });
  sync(); if (mq.addEventListener) mq.addEventListener('change', sync);
  $$('.fcol summary', host).forEach(s => s.addEventListener('click', e => { if (mq.matches) e.preventDefault(); }));
}
function renderTabbar() {
  if (document.body.dataset.notab != null) return;
  document.querySelectorAll('.tabbar').forEach(n => n.remove());
  const pg = document.body.dataset.page, u = E.user();
  const nav = document.createElement('nav'); nav.className = 'tabbar'; nav.setAttribute('aria-label', 'Быстрая навигация');
  const it = [['index.html', 'home', 'Главная', 'home'], ['', 'grid', 'Каталог', 'catalog'], ['cart.html', 'bag', 'Корзина', 'cart'], ['favorites.html', 'heart', 'Избранное', 'favorites'], [u ? 'account.html' : 'login.html', 'user', u ? 'Профиль' : 'Войти', 'account']];
  nav.innerHTML = it.map(([h, i, t, k]) => {
    const on = pg === k || (k === 'account' && pg === 'login') ? ' on' : '';
    const b = k === 'cart' ? '<b class="badge" data-badge="cart" hidden></b>' : k === 'favorites' ? '<b class="badge" data-badge="fav" hidden></b>' : '';
    return k === 'catalog' ? `<button type="button" class="tb${on}" data-act="catalog">${E.icon(i)}<span>${t}</span></button>` : `<a class="tb${on}" href="${h}">${E.icon(i)}<span>${t}</span>${b}</a>`;
  }).join('');
  document.body.appendChild(nav);
}
E.updateBadges = () => {
  const c = E.cart.count(), f = E.fav.list().length, p = E.point();
  $$('[data-badge="cart"]').forEach(b => { b.textContent = c > 99 ? '99+' : c; b.hidden = !c; });
  $$('[data-badge="fav"]').forEach(b => { b.textContent = f > 99 ? '99+' : f; b.hidden = !f; });
  $$('[data-addr]').forEach(a => { a.textContent = p.city + ', ' + p.addr; });
};

/* ---------- таймеры ---------- */
E.saleEnd = () => { let t = E.get('saleEnd', 0); if (!t || t < Date.now() + 36e5) { t = Date.now() + 2 * DAY + 8 * 36e5 + 30 * 6e4; E.set('saleEnd', t); } return t; };
E.midnight = () => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); };
const pad = n => String(n).padStart(2, '0');
E.cdHTML = (end, mode) => {
  const ms = Math.max(0, end - Date.now()), d = Math.floor(ms / DAY), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  return mode === 'hms' ? `<b>${pad(Math.floor(ms / 36e5))}</b><i>:</i><b>${pad(m)}</b><i>:</i><b>${pad(s)}</b>` : `<b>${pad(d)}</b><small>дн</small><b>${pad(h)}</b><small>ч</small><b>${pad(m)}</b><small>мин</small>`;
};
E.timers = () => {
  const tick = () => $$('[data-cd]').forEach(el => { const end = el.dataset.cd === 'sale' ? E.saleEnd() : E.midnight(); const html = E.cdHTML(end, el.dataset.mode); if (el._h !== html) { el.innerHTML = html; el._h = html; } });
  tick(); clearInterval(E._tm); E._tm = setInterval(tick, 1000);
};

/* ---------- глобальные действия ---------- */
E.acts = {
  catalog: () => { if (matchMedia('(min-width: 1024px)').matches) { const m = $('.mega'); if (m && !m.hidden) closeMega(); else openMega(); } else openDrawer(); },
  pickup: () => E.pickup(),
  photo: () => E.toast('Поиск по фото доступен в приложении Ежевики', { icon: 'camera' }),
  app: () => E.toast('Демо-версия: приложение пока в разработке', { icon: 'info' }),
  social: () => E.toast('Демо-версия: соцсети появятся позже', { icon: 'info' }),
  sizetable: t => E.sizeTable(E.P[t.dataset.sz]),
  chat: () => E.chat(),
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-fav],[data-add],[data-inc],[data-dec],[data-act],[data-copy]');
  if (!t) return;
  const d = t.dataset;
  if (d.fav) { e.preventDefault(); E.fav.toggle(d.fav); }
  else if (d.add) { e.preventDefault(); E.addFlow(d.add); }
  else if (d.inc) { e.preventDefault(); const p = E.P[d.inc]; if (p.sizes) E.sizePicker(p); else E.cart.add(p.id, null, 1, true); }
  else if (d.dec) { e.preventDefault(); E.cart.dec(d.dec); }
  else if (d.copy) { e.preventDefault(); E.copy(d.copy); }
  else if (d.act && E.acts[d.act]) { e.preventDefault(); E.acts[d.act](t, e); }
});
E.refreshCards = () => $$('.pcard[data-pid]').forEach(c => { const b = $('.pcard-buy', c); if (b) b.innerHTML = E.buyBtn(E.P[c.dataset.pid]); });
E.on('cart', () => { E.refreshCards(); E.updateBadges(); });
E.on('fav', () => { $$('[data-fav]').forEach(b => { const on = E.fav.has(b.dataset.fav); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Убрать из избранного' : 'Добавить в избранное'); }); E.updateBadges(); });
E.on('point', E.updateBadges);
E.on('session', () => { renderHeader(); renderTabbar(); E.updateBadges(); });
E.on('profile', () => { renderHeader(); });

/* ---------- чат поддержки (демо) ---------- */
E.chat = () => {
  const m = E.modal({ title: 'Чат с поддержкой', cls: 'm-chat', html: `<div class="chat"><div class="chat-log"><div class="msg bot"><b>Ежевика</b>Здравствуйте! Я виртуальный помощник. Спросите про доставку, возврат, оплату или статус заказа.</div></div>
    <div class="chat-q">${['Где мой заказ?', 'Как вернуть товар?', 'Сколько хранится заказ?', 'Как списать ягодки?'].map(q => `<button type="button" class="chip">${q}</button>`).join('')}</div></div>`,
    foot: '<form class="chat-f"><input class="input" placeholder="Напишите сообщение" aria-label="Сообщение"><button class="btn btn-primary" aria-label="Отправить">' + E.icon('send', 'i-20') + '</button></form>' });
  const log = $('.chat-log', m.el);
  const ans = q => { q = E.norm(q);
    if (/заказ|где|статус|трек/.test(q)) return 'Статус заказа виден в личном кабинете, в разделе «Заказы». Там же — код получения и дата доставки.';
    if (/возвр|вернут/.test(q)) return 'Вернуть товар надлежащего качества можно в течение 14 дней. Оформите возврат в разделе «Возвраты» личного кабинета и принесите товар в любой пункт выдачи.';
    if (/хран|сколько/.test(q)) return 'Заказ хранится в пункте выдачи 7 дней, в постамате — 3 дня. Срок можно продлить один раз в карточке заказа.';
    if (/ягод|балл|бонус|кешб/.test(q)) return 'Ягодками можно оплатить до 30% стоимости заказа: включите переключатель «Списать ягодки» в корзине или при оформлении.';
    if (/оплат|карт|сбп/.test(q)) return 'Оплатить можно картой онлайн, через СБП или при получении — картой либо наличными.';
    return 'Спасибо за вопрос! Это демо-чат, поэтому оператор не подключится. Позвоните нам: 8 800 700-12-34 — это бесплатно.'; };
  const say = t => { log.insertAdjacentHTML('beforeend', `<div class="msg me">${E.esc(t)}</div>`); log.scrollTop = log.scrollHeight; setTimeout(() => { log.insertAdjacentHTML('beforeend', `<div class="msg bot"><b>Ежевика</b>${ans(t)}</div>`); log.scrollTop = log.scrollHeight; }, 600); };
  m.el.addEventListener('click', e => { const c = e.target.closest('.chat-q .chip'); if (c) say(c.textContent); });
  $('.chat-f', m.el).addEventListener('submit', e => { e.preventDefault(); const i = $('input', e.target); if (i.value.trim()) { say(i.value.trim()); i.value = ''; } });
};

/* ---------- формы ---------- */
E.fieldErr = (input, msg) => { const f = input.closest('.field'); if (!f) return; let el = $('.field-err', f); input.classList.toggle('err', !!msg); input.setAttribute('aria-invalid', !!msg); if (msg) { if (!el) { el = document.createElement('span'); el.className = 'field-err'; f.appendChild(el); } el.textContent = msg; } else if (el) el.remove(); };
E.maskPhone = input => input.addEventListener('input', () => {
  let d = input.value.replace(/\D/g, ''); if (!d) { input.value = ''; return; } if (d[0] === '8') d = '7' + d.slice(1); if (d[0] !== '7') d = '7' + d; d = d.slice(0, 11);
  let s = '+7'; if (d.length > 1) s += ' ' + d.slice(1, 4); if (d.length > 4) s += ' ' + d.slice(4, 7); if (d.length > 7) s += '-' + d.slice(7, 9); if (d.length > 9) s += '-' + d.slice(9, 11); input.value = s;
});
E.validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

/* ---------- псевдо-QR (демо) ---------- */
E.qr = code => {
  const N = 25, m = []; let seed = 0; for (const ch of String(code)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < N; y++) { m[y] = []; for (let x = 0; x < N; x++) m[y][x] = rnd() < 0.5; }
  const finder = (ox, oy) => { for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) { const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= N || Y >= N) continue; const b = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)); m[Y][X] = b; } };
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  for (let i = 8; i < N - 8; i++) { m[6][i] = i % 2 === 0; m[i][6] = i % 2 === 0; }
  let d = ''; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m[y][x]) d += `M${x} ${y}h1v1h-1z`;
  return `<svg viewBox="-1 -1 27 27" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}" fill="#16161D"/></svg>`;
};

/* ---------- сообщение после перехода ---------- */
E.flash = (msg, o = {}) => { try { SS.setItem('ezh:flash', JSON.stringify([msg, o])); } catch (e) { /* нет хранилища */ } };

/* ---------- запуск ---------- */
renderHeader(); renderFooter(); renderTabbar(); E.updateBadges();
document.documentElement.classList.add('js');
try { const f = JSON.parse(SS.getItem('ezh:flash') || 'null'); if (f) { SS.removeItem('ezh:flash'); setTimeout(() => E.toast(f[0], f[1]), 250); } } catch (e) { /* пусто */ }
})();
