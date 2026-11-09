/* Ежевика — вход и регистрация */
(() => {
const E = window.EZH, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = $('#login-root');
const ps = E.params();
const safeNext = n => (n && /^[a-z0-9-]+\.html([?#].*)?$/i.test(n) && !/^login\.html/i.test(n)) ? n : 'account.html';
const next = safeNext(ps.get('next'));
let tab = ps.get('tab') === 'reg' ? 'reg' : 'in', method = 'pass', smsTimer = null;

const PERKS = [['wallet', 'Кешбэк ягодками до 7% с каждой покупки'], ['truck', 'Статусы доставки и история заказов'], ['percent', 'Персональные скидки и промокоды'], ['heart', 'Избранное и корзина на всех устройствах']];
const promo = `<div class="auth-promo"><h2>Войдите и получайте больше от покупок</h2><p>Один аккаунт — для заказов, возвратов, отзывов и Ягодного клуба.</p><ul>${PERKS.map(([i, t]) => `<li><span>${E.icon(i)}</span>${t}</li>`).join('')}</ul><img src="img/b/hero-club.webp" alt="" loading="lazy"></div>`;
const demo = `<div class="demo-box">${E.berry()}<div>Демо-доступ: <code>demo@ezhevika.ru</code><br>пароль <code>demo123</code></div><button type="button" class="btn btn-secondary btn-sm" data-fill>Заполнить</button></div>`;
const soc = `<div class="or">или войдите через</div><div class="soc-login">
  <button type="button" class="btn btn-outline" data-soc="VK ID"><span class="soc-ic" style="background:#0077FF">VK</span>VK ID</button>
  <button type="button" class="btn btn-outline" data-soc="Яндекс ID"><span class="soc-ic" style="background:#FC3F1D">Я</span>Яндекс</button>
  <button type="button" class="btn btn-outline" data-soc="Сбер ID"><span class="soc-ic" style="background:#21A038">С</span>Сбер ID</button></div>`;
const legal = `<p class="auth-legal">Продолжая, вы соглашаетесь с <a href="legal.html?doc=terms">условиями использования</a> и <a href="legal.html?doc=privacy">политикой конфиденциальности</a></p>`;

function formIn() {
  if (method === 'sms') return `<form class="auth-f" data-f="sms" novalidate>
    <div class="field"><label for="l-phone">Номер телефона</label><input class="input" id="l-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 999 123-45-67" data-phone></div>
    <div class="field" data-code-f hidden><label for="l-code">Код из SMS</label><input class="input otp-in" id="l-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="4" placeholder="• • • •"><span class="field-hint" data-sms-hint></span></div>
    <label class="check"><input type="checkbox" name="remember" checked><span>Запомнить меня</span></label>
    <div class="note note-err" data-err hidden>${E.icon('alert')}<div></div></div>
    <button class="btn btn-primary btn-lg btn-block" type="submit" data-sms-btn>Получить код</button>
    <button type="button" class="link-btn auth-switch" data-method="pass">${E.icon('lock', 'i-18')}Войти по паролю</button>
  </form>
  <div class="demo-box">${E.berry()}<div>Демо: номер <code>+7 999 123-45-67</code>, код из SMS <code>1234</code></div><button type="button" class="btn btn-secondary btn-sm" data-fill-sms>Заполнить</button></div>`;
  return `<form class="auth-f" data-f="pass" novalidate>
    <div class="field"><label for="l-login">Телефон или электронная почта</label><input class="input" id="l-login" name="login" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="demo@ezhevika.ru"></div>
    <div class="field"><label for="l-pass">Пароль</label><div class="pass-w"><input class="input" id="l-pass" name="pass" type="password" autocomplete="current-password" placeholder="Пароль"><button type="button" class="pass-eye" data-eye aria-label="Показать пароль" aria-pressed="false">${E.icon('eye', 'i-20')}</button></div></div>
    <div class="auth-row"><label class="check"><input type="checkbox" name="remember" checked><span>Запомнить меня</span></label><button type="button" class="link-btn" data-forgot>Забыли пароль?</button></div>
    <div class="note note-err" data-err hidden>${E.icon('alert')}<div></div></div>
    <button class="btn btn-primary btn-lg btn-block" type="submit">Войти</button>
    <button type="button" class="link-btn auth-switch" data-method="sms">${E.icon('phone', 'i-18')}Войти по коду из SMS</button>
  </form>${demo}`;
}
function formReg() {
  return `<form class="auth-f" data-f="reg" novalidate>
    <div class="f-row2"><div class="field"><label for="r-name">Имя</label><input class="input" id="r-name" name="name" autocomplete="given-name" placeholder="Анна"></div><div class="field"><label for="r-sur">Фамилия</label><input class="input" id="r-sur" name="surname" autocomplete="family-name" placeholder="Ягодкина"></div></div>
    <div class="field"><label for="r-phone">Телефон</label><input class="input" id="r-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 999 123-45-67" data-phone></div>
    <div class="field"><label for="r-email">Электронная почта</label><input class="input" id="r-email" name="email" type="email" autocomplete="email" placeholder="anna@mail.ru"></div>
    <div class="field"><label for="r-pass">Пароль</label><div class="pass-w"><input class="input" id="r-pass" name="pass" type="password" autocomplete="new-password" placeholder="Не меньше 6 символов"><button type="button" class="pass-eye" data-eye aria-label="Показать пароль" aria-pressed="false">${E.icon('eye', 'i-20')}</button></div><div class="pw-meter" data-pw><i></i><i></i><i></i></div></div>
    <label class="check"><input type="checkbox" name="news" checked><span>Получать персональные скидки и новости по почте</span></label>
    <label class="check"><input type="checkbox" name="agree"><span>Принимаю <a href="legal.html?doc=terms" target="_blank">условия</a> и даю согласие на обработку <a href="legal.html?doc=privacy" target="_blank">персональных данных</a></span></label>
    <div class="note note-err" data-err hidden>${E.icon('alert')}<div></div></div>
    <button class="btn btn-primary btn-lg btn-block" type="submit">Зарегистрироваться</button>
  </form>
  <div class="note auth-demo-n">${E.icon('info')}<div>Это демо-версия: новые аккаунты не создаются. После регистрации откроется демо-кабинет с вашим именем.</div></div>`;
}

function render() {
  clearInterval(smsTimer);
  const u = E.user();
  if (u) {
    root.innerHTML = `<div class="auth">${promo}<div class="auth-card auth-done"><span class="auth-ok">${E.avatar(u.name + ' ' + u.surname, 'ava-lg')}</span><h1>Вы уже вошли</h1><p class="sub-t">${E.esc(u.name)} ${E.esc(u.surname)} · ${E.esc(u.email)}</p><div class="auth-done-b"><a class="btn btn-primary btn-lg btn-block" href="${next}">${next === 'account.html' ? 'В личный кабинет' : 'Продолжить'}</a><button type="button" class="btn btn-secondary btn-lg btn-block" data-out>Войти в другой аккаунт</button></div></div></div>`;
    return;
  }
  root.innerHTML = `<div class="auth">${promo}<div class="auth-card">
    <h1>${tab === 'reg' ? 'Регистрация' : 'Вход в Ежевику'}</h1>
    <p class="sub-t">${tab === 'reg' ? 'Займёт минуту — и можно копить ягодки' : (ps.get('next') ? 'Войдите, чтобы продолжить — корзина сохранится' : 'Заказы, ягодки и избранное в одном месте')}</p>
    <div class="seg" role="tablist"><button type="button" role="tab" aria-selected="${tab === 'in'}" class="${tab === 'in' ? 'on' : ''}" data-tab="in">Вход</button><button type="button" role="tab" aria-selected="${tab === 'reg'}" class="${tab === 'reg' ? 'on' : ''}" data-tab="reg">Регистрация</button></div>
    ${tab === 'reg' ? formReg() : formIn()}
    ${tab === 'in' ? soc : ''}
    ${legal}
  </div></div>`;
  $$('[data-phone]', root).forEach(E.maskPhone);
  const first = $('.auth-f .input', root); if (first && matchMedia('(pointer:fine)').matches) first.focus({ preventScroll: true });
}

const showErr = (f, msg) => { const n = $('[data-err]', f); if (!n) return; n.hidden = !msg; $('div', n).innerHTML = msg || ''; };
const done = (remember, msg) => {
  const u = E.user();
  E.flash(msg || ('Здравствуйте, ' + (u ? u.name : '') + '! Вы вошли в аккаунт'), { icon: 'check' });
  location.href = next;
};
const digits = v => String(v || '').replace(/\D/g, '').replace(/^8/, '7');

function submitPass(f) {
  const l = f.login.value.trim(), p = f.pass.value;
  E.fieldErr(f.login, l ? '' : 'Введите телефон или почту'); E.fieldErr(f.pass, p ? '' : 'Введите пароль');
  if (!l || !p) { showErr(f, ''); (l ? f.pass : f.login).focus(); return; }
  const btn = $('[type=submit]', f); btn.disabled = true; btn.classList.add('loading'); btn.textContent = 'Входим…';
  setTimeout(() => {
    if (E.login(l, p, f.remember.checked)) { done(f.remember.checked); return; }
    btn.disabled = false; btn.classList.remove('loading'); btn.textContent = 'Войти';
    showErr(f, '<b>Неверный логин или пароль.</b> Для демо используйте <code>demo@ezhevika.ru</code> и пароль <code>demo123</code>.');
    f.pass.select();
  }, 450);
}
function submitSms(f) {
  const ph = digits(f.phone.value), codeF = $('[data-code-f]', f), btn = $('[data-sms-btn]', f);
  if (ph.length !== 11) { E.fieldErr(f.phone, 'Введите номер полностью'); f.phone.focus(); return; }
  E.fieldErr(f.phone, '');
  if (codeF.hidden) {
    if (ph !== '79991234567') { showErr(f, 'В демо-версии вход по SMS работает для номера <code>+7 999 123-45-67</code>.'); return; }
    showErr(f, ''); codeF.hidden = false; btn.textContent = 'Войти'; f.code.focus();
    let left = 59; const hint = $('[data-sms-hint]', f);
    const tick = () => { hint.innerHTML = left > 0 ? `Код отправлен на ${E.esc(f.phone.value)}. Повторно — через 0:${String(left).padStart(2, '0')}` : 'Не пришёл код? <button type="button" class="link-btn" data-resend>Отправить ещё раз</button>'; left--; if (left < -1) clearInterval(smsTimer); };
    tick(); clearInterval(smsTimer); smsTimer = setInterval(tick, 1000);
    E.toast('Демо: код из SMS — 1234', { icon: 'chat' });
    return;
  }
  const c = f.code.value.trim();
  if (c.length < 4) { E.fieldErr(f.code, 'Введите 4 цифры из SMS'); f.code.focus(); return; }
  if (c !== '1234') { E.fieldErr(f.code, 'Неверный код. В демо-версии код — 1234'); f.code.select(); return; }
  E.fieldErr(f.code, '');
  if (E.login('+79991234567', E.DEMO.pass, f.remember.checked)) done(f.remember.checked);
}
function submitReg(f) {
  const v = n => f[n].value.trim();
  const errs = {
    name: v('name') ? '' : 'Укажите имя',
    phone: digits(v('phone')).length === 11 ? '' : 'Введите номер телефона полностью',
    email: E.validEmail(v('email')) ? '' : 'Проверьте адрес почты',
    pass: f.pass.value.length >= 6 ? '' : 'Пароль — не меньше 6 символов',
  };
  Object.entries(errs).forEach(([k, m]) => E.fieldErr(f[k], m));
  const bad = Object.keys(errs).find(k => errs[k]);
  if (bad) { f[bad].focus(); showErr(f, ''); return; }
  if (!f.agree.checked) { showErr(f, 'Чтобы продолжить, примите условия и согласие на обработку данных'); return; }
  showErr(f, '');
  E.login(E.DEMO.login, E.DEMO.pass, true);
  const prof = { name: v('name'), surname: v('surname'), email: v('email'), phone: '+' + digits(v('phone')) };
  E.set('profile', Object.assign({}, E.get('profile', {}), prof));
  E.berries.add(300, 'Приветственный бонус за регистрацию');
  done(true, 'Добро пожаловать, ' + v('name') + '! Начислили 300 ягодок за регистрацию');
}

function forgot() {
  const m = E.modal({ title: 'Восстановление пароля', html: `<form class="m-form" data-fg novalidate><p class="m-text">Укажите почту или телефон — пришлём ссылку для сброса пароля.</p><div class="field"><label for="fg-l">Телефон или почта</label><input class="input" id="fg-l" name="l" autocomplete="username" value="${E.esc(($('#l-login') || {}).value || '')}"></div><button class="btn btn-primary btn-lg btn-block" type="submit">Отправить ссылку</button></form>` });
  const f = $('[data-fg]', m.el); f.l.focus();
  f.addEventListener('submit', e => {
    e.preventDefault();
    const l = f.l.value.trim();
    if (!l || (!E.validEmail(l) && digits(l).length !== 11)) { E.fieldErr(f.l, 'Введите почту или номер телефона'); return; }
    $('.m-body', m.el).innerHTML = `<div class="m-done">${E.icon('mail')}<h4>Ссылка отправлена</h4><p class="m-text">Проверьте ${E.validEmail(l) ? 'почту ' + E.esc(l) : 'SMS на номере ' + E.esc(l)}. В демо-версии пароль не меняется: используйте <b>demo123</b>.</p><button type="button" class="btn btn-secondary btn-lg btn-block" data-close>Понятно</button></div>`;
  });
}

document.addEventListener('click', e => {
  const t = e.target;
  const tb = t.closest('[data-tab]'); if (tb) { tab = tb.dataset.tab; render(); return; }
  const mt = t.closest('[data-method]'); if (mt) { method = mt.dataset.method; render(); return; }
  const eye = t.closest('[data-eye]'); if (eye) { const inp = eye.parentElement.querySelector('input'), show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; eye.setAttribute('aria-pressed', show); eye.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль'); eye.innerHTML = E.icon(show ? 'eye-off' : 'eye', 'i-20'); return; }
  if (t.closest('[data-fill]')) { const f = $('[data-f=pass]'); f.login.value = E.DEMO.login; f.pass.value = E.DEMO.pass; E.fieldErr(f.login, ''); E.fieldErr(f.pass, ''); showErr(f, ''); $('[type=submit]', f).focus(); return; }
  if (t.closest('[data-fill-sms]')) { const f = $('[data-f=sms]'); f.phone.value = '+7 999 123-45-67'; E.fieldErr(f.phone, ''); showErr(f, ''); if (!$('[data-code-f]', f).hidden) f.code.value = '1234'; $('[data-sms-btn]', f).focus(); return; }
  if (t.closest('[data-resend]')) { const f = $('[data-f=sms]'); $('[data-code-f]', f).hidden = true; submitSms(f); return; }
  if (t.closest('[data-forgot]')) { forgot(); return; }
  const s = t.closest('[data-soc]'); if (s) { E.toast(`Вход через ${s.dataset.soc} недоступен в демо-версии — используйте демо-логин`, { icon: 'info' }); return; }
  if (t.closest('[data-out]')) { E.logout(); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-f]'); if (!f) return;
  e.preventDefault();
  ({ pass: submitPass, sms: submitSms, reg: submitReg })[f.dataset.f](f);
});
document.addEventListener('input', e => {
  const t = e.target, f = t.closest('[data-f]'); if (!f) return;
  if (t.classList.contains('err')) E.fieldErr(t, '');
  if (t.name === 'code') { t.value = t.value.replace(/\D/g, '').slice(0, 4); if (t.value.length === 4) submitSms(f); }
  if (f.dataset.f === 'reg' && t.name === 'pass') { const v = t.value, sc = (v.length >= 6) + (v.length >= 10) + (/\d/.test(v) && /[a-zа-я]/i.test(v)); const m = $('[data-pw]', f); m.dataset.s = v ? Math.max(1, sc) : 0; }
});
E.on('session', () => { if (!E.user()) render(); });
render();
})();
