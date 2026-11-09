# -*- coding: utf-8 -*-
"""Контентные страницы «Ежевики»: акции, бренды, клуб, помощь, пункты выдачи, продавцам, о компании, документы, 404."""
from collections import Counter, defaultdict

def build(g):
    for k, v in g.items():
        if not k.startswith('__'): globals()[k] = v
    promo(); brands(); club(); help_page(); pickup(); sellers(); about(); legal(); e404()

def tag(icon, text): return f'<span class="tag">{ic(icon)}{text}</span>'
def until(days, prefix='до '): return f'<span data-until="{days}" data-prefix="{prefix}"></span>'

# ---------------- акции ----------------
def promo():
    codes = [
        ('−10%', 'ЕЖЕВИКА', 'На весь заказ, скидка до 3 000 ₽', 52),
        ('−500 ₽', 'ЯГОДА500', 'На заказ от 3 000 ₽', 21),
        ('−15%', 'НОВЫЙГОД', 'На товары раздела «Новый год»', 52),
        ('−300 ₽', 'WELCOME', 'На первый заказ от 1 500 ₽', 80),
    ]
    ch = ''.join(f'''<div class="code-c"><span class="val">{v}</span><div class="cd-name"><span>{c}</span><button type="button" data-copy="{c}">{ic('copy', 'i-16')}Копировать</button></div><p>{t}</p><small>Действует {until(d)}</small></div>''' for v, c, t, d in codes)
    acts = [
        ('beauty', '#FFE6F1', 'Красота 1+1=3', 'Положите в корзину три товара для красоты — самый дешёвый достанется бесплатно. Скидка применится автоматически.', 'catalog.html?cat=beauty', 21, 'beauty'),
        ('tech', '#ECE7FF', 'Техника до −50%', 'Наушники, умные часы и гаджеты от официальных поставщиков с гарантией до 2 лет.', 'catalog.html?cat=electronics', 6, 'tech'),
        ('outer', '#E5EDFF', 'Пуховики и парки', 'Тёплая коллекция для всей семьи: пуховики, парки и пальто со скидкой до −45%.', 'catalog.html?sub=outer', 14, 'wear'),
        ('ny', '#F1EAFF', 'Новогодняя ярмарка', 'Ёлки, гирлянды и подарки. По промокоду НОВЫЙГОД — ещё −15% на весь раздел.', 'catalog.html?cat=newyear', 52, 'home'),
        ('kitchen', '#FFEEE2', 'Всё для кухни', 'Чугунные кастрюли, ножи и сервировка для праздничного стола — до −40%.', 'catalog.html?cat=kitchen', 10, 'home'),
        ('kids', '#EAF2FF', 'Детский мир', 'Игрушки, конструкторы и одежда для малышей — подарки к Новому году заранее.', 'catalog.html?cat=kids', 18, 'kids'),
        ('shoes', '#FFE8F2', 'Обувь на зиму', 'Ботинки, сапоги и кроссовки — бесплатная примерка в пунктах выдачи.', 'catalog.html?cat=shoes', 12, 'wear'),
        ('sport', '#EEE9FF', 'Спорт дома', 'Коврики, гантели и фитнес-резинки, чтобы тренироваться без абонемента.', 'catalog.html?cat=sport', 9, 'sport'),
        ('pets', '#FFF4E0', 'Для питомцев', 'Лежанки, когтеточки и игрушки для кошек и собак со скидкой до −30%.', 'catalog.html?cat=pets', 15, 'home'),
    ]
    ah = ''.join(f'''<a class="act" href="{h}" data-tags="{tg}"><div class="act-v" style="background:{bg}"><span class="tag">{ic('clock')}{until(d)}</span><h3>{t}</h3><img src="img/c/pr-{k}.webp" alt="" loading="lazy" decoding="async"></div>
      <div class="act-b"><p>{p}</p><div class="act-f"><span>{ic('tag', 'i-16')} {d} {plural(d, 'день', 'дня', 'дней')} до конца</span><span class="link-btn">Смотреть{ic('chev-r', 'i-18')}</span></div></div></a>''' for k, bg, t, p, h, d, tg in acts)
    filt = ''.join(f'<button type="button" class="chip{" on" if i == 0 else ""}" data-tf="{k}">{n}</button>' for i, (k, n) in enumerate([('', 'Все акции'), ('wear', 'Одежда и обувь'), ('tech', 'Техника'), ('home', 'Дом и кухня'), ('beauty', 'Красота'), ('kids', 'Детям'), ('sport', 'Спорт')]))
    content = f'''<div class="wrap">
{crumbs([('Акции и промокоды', None)])}
<section class="band">
  <img src="img/b/hero-sale.webp" alt="" width="952" height="800" fetchpriority="high">
  {tag('flame', '11.11 · Всемирный день шопинга')}
  <h1>Распродажа года — скидки до −70%</h1>
  <p>Тысячи товаров по сниженным ценам, промокоды и подарки. Успейте до окончания акции.</p>
  <div class="band-cta"><a class="btn btn-white btn-lg" href="catalog.html?sort=discount">Смотреть все скидки{ic('arrow-r')}</a><div class="timer"><span>До конца акции</span><div class="cd" data-cd="sale"></div></div></div>
</section>
<section class="sec" id="codes">{sec_h('Промокоды', extra='<span class="sec-sub">Введите код в корзине — скидка пересчитается автоматически</span>')}<div class="codes">{ch}</div></section>
<section class="sec" id="actions">{sec_h('Акции')}<div class="chips chips-scroll act-filter">{filt}</div><div class="actions">{ah}</div></section>
<section class="sec">{sec_h('Самые большие скидки', 'catalog.html?sort=discount')}<div data-prods="discount" data-n="12"></div></section>
<section class="sec">{sec_h('Как работают акции')}{faq([
    ('Можно ли применить несколько промокодов?', 'К одному заказу применяется один промокод. Он суммируется со скидками на товары, акцией «1+1=3» и оплатой ягодками.'),
    ('Как работает акция «Красота 1+1=3»?', 'Добавьте в корзину три товара из раздела «Красота». Самый дешёвый из каждой тройки станет бесплатным — это видно в корзине в строке «Подарок по акции».'),
    ('Почему промокод не применяется?', 'Проверьте условия: минимальную сумму заказа, раздел товаров и срок действия. Если всё верно, а код не работает, напишите нам в <a href="#" data-act="chat">чат поддержки</a>.'),
    ('Вернутся ли деньги за акционный товар при возврате?', 'Да. Мы вернём сумму, которую вы фактически заплатили за товар с учётом скидки. Списанные ягодки вернутся на бонусный счёт.'),
])}</section>
</div>'''
    page('promo.html', 'promo', 'Акции и промокоды', 'Распродажа 11.11 на Ежевике: скидки до 70%, промокоды, акция 1+1=3 на красоту и новогодняя ярмарка.', content, 'pages')

# ---------------- бренды ----------------
def brands():
    cnt = Counter(p['brand'] for p in PRODS); sold = Counter()
    cat = defaultdict(Counter)
    for p in PRODS: sold[p['brand']] += p['sold']; cat[p['brand']][p['cat']] += 1
    top = [b for b, _ in sold.most_common(8)]
    strip = ''.join(f'<a class="brand-t bw{i % 4 + 1}" href="catalog.html?brand={esc(b)}"><b>{esc(b)}</b><small>{CATS[cat[b].most_common(1)[0][0]]["name"]}</small></a>' for i, b in enumerate(top))
    groups = defaultdict(list)
    for b in sorted(cnt, key=lambda x: x.lower()): groups[b[0].upper()].append(b)
    letters = ''.join(f'<a href="#bl-{L}"{"" if L in groups else " class=\"dim\" aria-disabled=\"true\" tabindex=\"-1\""}>{L}</a>' for L in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    gh = ''.join(f'<div class="bgroup" id="bl-{L}" data-letter="{L}"><b>{L}</b><div class="blist">' + ''.join(
        f'<a href="catalog.html?brand={esc(b)}" data-b="{esc(b.lower())} {esc(CATS[cat[b].most_common(1)[0][0]]["name"].lower())}">{esc(b)}<span>{cnt[b]}</span></a>' for b in bs) + '</div></div>' for L, bs in sorted(groups.items()))
    content = f'''<div class="wrap">
{crumbs([('Бренды', None)])}
<div class="page-h"><h1>Бренды</h1><span class="cnt">{pl(len(cnt), 'бренд', 'бренда', 'брендов')} · {pl(len(PRODS), 'товар', 'товара', 'товаров')}</span></div>
<section>{sec_h('Популярные бренды', extra='<span class="sec-sub">По количеству покупок за месяц</span>')}<div class="brands-strip">{strip}</div></section>
<section class="sec" id="all">{sec_h('Все бренды')}
  <label class="input-ic brand-q">{ic('search', 'i-20')}<input class="input" type="search" placeholder="Найти бренд или категорию" aria-label="Поиск бренда" data-bq></label>
  <nav class="letters" aria-label="Алфавитный указатель">{letters}</nav>
  <div class="bgroups">{gh}</div>
  <p class="no-res" hidden>Такого бренда пока нет на Ежевике. Попробуйте поискать <a class="link-btn" href="catalog.html">в каталоге</a>.</p>
</section>
<section class="sec">{sec_h('Хиты популярных брендов', 'catalog.html?flag=hit')}<div data-prods="brands" data-n="12"></div></section>
<section class="sec cta-b"><div><h2>Ваш бренд — на Ежевике</h2><p>Подключитесь за 1 день, получите бейдж официального магазина и доступ к 35 млн покупателей.</p></div><a class="btn btn-primary btn-lg" href="sellers.html">Стать продавцом{ic('arrow-r')}</a></section>
</div>'''
    page('brands.html', 'brands', 'Бренды', 'Все бренды Ежевики от A до Z: одежда, техника, косметика и товары для дома от официальных продавцов.', content, 'pages')

# ---------------- клуб ----------------
def club():
    steps = [('Вступите бесплатно', 'Войдите в аккаунт — участие в клубе подключается автоматически и сразу.'),
             ('Покупайте как обычно', 'За каждый полученный заказ начисляем от 3 до 7% стоимости ягодками.'),
             ('Копите ягодки', '1 ягодка = 1 ₽. Ягодки за заказ приходят через 14 дней после получения.'),
             ('Оплачивайте покупки', 'Списывайте ягодки в корзине — до 30% стоимости любого заказа.')]
    st = ''.join(f'<div class="step"><h3>{t}</h3><p>{p}</p></div>' for t, p in steps)
    lv = [
        (1, 'Зелёная ягода', 'Сразу после вступления', 3, ['Кешбэк 3% ягодками', '250 ягодок в подарок на день рождения', 'Доступ к закрытым распродажам']),
        (2, 'Спелая ягода', 'От 10 000 ₽ покупок', 5, ['Кешбэк 5% ягодками', 'Персональные промокоды каждый месяц', 'Ранний доступ к распродажам на 24 часа']),
        (3, 'Ежевичный эксперт', 'От 50 000 ₽ покупок', 7, ['Кешбэк 7% ягодками', 'Хранение заказов в пункте до 14 дней', 'Приоритетная поддержка 24/7']),
    ]
    lvh = ''.join(f'''<div class="level l{n}" data-level="{n}"><span class="pill pill-violet lv-tag" hidden>Ваш уровень</span>{berry()}<h3>{name}</h3><div class="lv-from">{fr}</div>
      <div class="lv-rate">{r}%<small> кешбэк ягодками</small></div><ul>{''.join(f'<li>{ic("check")}{x}</li>' for x in perks)}</ul></div>''' for n, name, fr, r, perks in lv)
    ways = [('star-o', 'Отзыв о товаре', '+50 ягодок за отзыв с текстом, +100 — за отзыв с фото'), ('gift', 'День рождения', '250 ягодок в подарок за 3 дня до праздника'),
            ('users', 'Приглашение друга', '300 ягодок вам и другу после его первого заказа'), ('percent', 'Спецпредложения', 'Повышенный кешбэк до 20% на товары с отметкой клуба')]
    wh = ''.join(f'<div class="feat"><span class="feat-ic">{ic(i)}</span><h3>{t}</h3><p>{p}</p></div>' for i, t, p in ways)
    content = f'''<div class="wrap">
{crumbs([('Ягодный клуб', None)])}
<section class="band">
  <img src="img/b/hero-club.webp" alt="" width="1040" height="800" fetchpriority="high">
  {tag('crown', 'Ягодный клуб')}
  <h1>Возвращаем до 7% ягодками</h1>
  <p>Получайте кешбэк за каждую покупку и оплачивайте ягодками до 30% следующих заказов. Участие бесплатное.</p>
  <div class="band-cta"><a class="btn btn-white btn-lg" href="login.html?next=club.html" data-join>Вступить бесплатно{ic('arrow-r')}</a><a class="btn btn-glass btn-lg" href="#how">Как это работает</a></div>
</section>
<section class="sec" data-me hidden></section>
<section class="sec" id="how">{sec_h('Как это работает')}<div class="steps">{st}</div></section>
<section class="sec" id="levels">{sec_h('Уровни клуба', extra='<span class="sec-sub">Уровень зависит от суммы полученных заказов за всё время</span>')}<div class="levels">{lvh}</div></section>
<section class="sec" id="calc">{sec_h('Сколько ягодок вы получите')}
  <div class="calc">
    <div>
      <label class="lbl" for="cl-sum">Сколько вы тратите на Ежевике в месяц</label>
      <div class="calc-val"><b data-cv>8 000 ₽</b><span class="muted">до 60 000 ₽</span></div>
      <input class="range" id="cl-sum" type="range" min="1000" max="60000" step="500" value="8000" data-cr>
      <div class="lbl mt24">Уровень в клубе</div>
      <div class="seg mt8" data-cl>{''.join(f'<button type="button" data-r="{r}"{" class=\"on\"" if n == 2 else ""}>{name}<span>{r}%</span></button>' for n, name, fr, r, perks in lv)}</div>
    </div>
    <div class="calc-res"><span>Вы получите за год</span><b data-cy>4 800 ягодок</b><div class="row"><span>В месяц</span><b data-cm>400</b></div><div class="row"><span>Это как скидка</span><b data-cp>5%</b></div><div class="row"><span>Можно списать за заказ</span><b>до 30%</b></div></div>
  </div>
</section>
<section class="sec">{sec_h('Как ещё получить ягодки')}<div class="feat-grid c4">{wh}</div></section>
<section class="sec">{sec_h('Частые вопросы')}{faq([
    ('Когда начисляются ягодки?', 'Ягодки за заказ начисляются через 14 дней после получения — после окончания срока возврата. Бонусы за отзывы приходят сразу после модерации.'),
    ('Сколько ягодок можно списать?', 'До 30% стоимости заказа после всех скидок. Включите переключатель «Списать ягодки» в корзине или при оформлении заказа.'),
    ('Сгорают ли ягодки?', 'Ягодки действуют 12 месяцев с момента начисления. Подарочные ягодки на день рождения — 30 дней.'),
    ('Как повысить уровень?', 'Уровень считается по сумме всех полученных заказов. «Спелая ягода» — от 10 000 ₽, «Ежевичный эксперт» — от 50 000 ₽. Уровень не понижается.'),
    ('Что будет с ягодками при отмене заказа?', 'Если вы оплатили часть заказа ягодками, а затем отменили его, ягодки вернутся на счёт сразу.'),
])}</section>
</div>'''
    page('club.html', 'club', 'Ягодный клуб', 'Ягодный клуб Ежевики: кешбэк до 7% ягодками, оплата до 30% заказа, подарки на день рождения и закрытые распродажи.', content, 'pages')

# ---------------- помощь ----------------
HELP = [
    ('order', 'box', 'Заказы', [
        ('Как оформить заказ?', '<p>Добавьте товары в корзину, нажмите «Перейти к оформлению», выберите пункт выдачи или курьерскую доставку и способ оплаты. После подтверждения заказ появится в <a href="account.html#orders">личном кабинете</a>.</p>'),
        ('Как отследить заказ?', 'Статус каждого заказа виден в разделе «Заказы» личного кабинета: «Оформлен», «Собирается», «В пути», «Готов к выдаче». Мы также пришлём уведомление, когда заказ приедет.'),
        ('Можно ли изменить или отменить заказ?', 'Отменить заказ можно до передачи в доставку — кнопкой «Отменить заказ» на странице заказа. Деньги вернутся на карту за 1–3 рабочих дня, ягодки — сразу.'),
        ('Сколько хранится заказ в пункте выдачи?', 'В пункте выдачи — 7 дней, в постамате — 3 дня. Участникам уровня «Ежевичный эксперт» — до 14 дней. Срок можно продлить один раз на странице заказа.'),
    ]),
    ('delivery', 'truck', 'Доставка', [
        ('Сколько стоит доставка?', 'Доставка в пункты выдачи и постаматы бесплатная. Курьерская доставка — 99 ₽, бесплатно для заказов от 1 000 ₽.'),
        ('Как быстро приедет заказ?', 'Срок указан в карточке товара и в корзине: обычно 1–4 дня. В Москве и Санкт-Петербурге многие товары доставляем на следующий день.'),
        ('Можно ли примерить одежду в пункте выдачи?', 'Да, во всех пунктах выдачи есть примерочные. Если вещь не подошла, оставьте её в пункте — деньги вернутся автоматически.'),
        ('Куда вы доставляете?', 'Мы доставляем по всей России. В демо-версии доступны пункты выдачи в Москве, Санкт-Петербурге, Казани, Екатеринбурге, Новосибирске и Краснодаре — смотрите <a href="pickup.html">карту пунктов</a>.'),
    ]),
    ('payment', 'card', 'Оплата', [
        ('Какие способы оплаты доступны?', 'Банковской картой онлайн (Мир, Visa, Mastercard), через СБП, а также картой или наличными при получении в пункте выдачи.'),
        ('Когда списываются деньги?', 'При онлайн-оплате сумма блокируется на карте при оформлении и списывается после сборки заказа. Если товара не окажется в наличии, деньги разблокируются.'),
        ('Как оплатить ягодками?', 'Включите переключатель «Списать ягодки» в корзине. Ягодками можно оплатить до 30% стоимости заказа, 1 ягодка = 1 ₽.'),
        ('Безопасно ли сохранять карту?', 'Мы не храним данные карт: они передаются платёжному партнёру по защищённому протоколу. В личном кабинете хранятся только последние 4 цифры.'),
    ]),
    ('return', 'ret', 'Возврат', [
        ('Как вернуть товар?', '<p>Откройте <a href="account.html#returns">раздел «Возвраты»</a> в личном кабинете, выберите товар и причину возврата и принесите его в любой пункт выдачи в течение 14 дней.</p>'),
        ('Когда вернутся деньги?', 'После приёма товара в пункте выдачи деньги поступят на карту в течение 1–3 рабочих дней. Срок зачисления зависит от банка.'),
        ('Какие товары нельзя вернуть?', 'Нельзя вернуть товары надлежащего качества из перечня, утверждённого законодательством: косметику и парфюмерию во вскрытой упаковке, нижнее бельё, продукты питания.'),
        ('Товар пришёл с браком — что делать?', 'Оформите возврат с причиной «Брак» и приложите фото. Такие возвраты рассматриваем в приоритете — обычно за 24 часа.'),
    ]),
    ('club', 'crown', 'Ягодный клуб', [
        ('Что такое ягодки?', 'Ягодки — бонусы Ежевики. 1 ягодка = 1 ₽. Их начисляют за покупки и отзывы, а тратят на оплату до 30% заказа. Подробнее — на <a href="club.html">странице клуба</a>.'),
        ('Где посмотреть баланс?', 'Баланс и история начислений — в разделе <a href="account.html#berries">«Ягодки»</a> личного кабинета.'),
        ('Почему ягодки ещё не пришли?', 'Ягодки за заказ начисляются через 14 дней после получения, когда закончится срок возврата.'),
    ]),
    ('account', 'user', 'Аккаунт', [
        ('Как войти в личный кабинет?', 'Нажмите «Войти» в шапке сайта и введите почту или телефон и пароль. В демо-версии используйте логин demo@ezhevika.ru и пароль demo123.'),
        ('Как изменить личные данные?', 'Имя, телефон, дату рождения и настройки уведомлений можно изменить в разделе <a href="account.html#settings">«Настройки»</a>.'),
        ('Как удалить аккаунт?', 'Напишите в поддержку — мы удалим аккаунт и все персональные данные в течение 30 дней в соответствии с политикой конфиденциальности.'),
    ]),
]

def help_page():
    topics = ''.join(f'<a class="topic" href="#{k}"><span class="feat-ic">{ic(i)}</span>{t}</a>' for k, i, t, _ in HELP)
    secs = ''.join(f'<section class="sec help-sec" id="{k}" data-hs><h2>{ic(i, "violet")}{t}</h2>{faq(items)}</section>' for k, i, t, items in HELP)
    contacts = f'''<div class="contact"><span class="feat-ic">{ic('phone')}</span><b>8 800 700-12-34</b><span>Бесплатно по России, круглосуточно</span><a class="btn btn-outline btn-sm" href="tel:88007001234">Позвонить</a></div>
<div class="contact"><span class="feat-ic">{ic('chat')}</span><b>Чат с поддержкой</b><span>Отвечаем в среднем за 2 минуты</span><button type="button" class="btn btn-primary btn-sm" data-act="chat">Написать в чат</button></div>
<div class="contact"><span class="feat-ic">{ic('mail')}</span><b>help@ezhevika.ru</b><span>Ответим на почту в течение 24 часов</span><a class="btn btn-outline btn-sm" href="mailto:help@ezhevika.ru">Написать письмо</a></div>'''
    content = f'''<div class="wrap page-top">
{crumbs([('Помощь', None)])}
<section class="help-hero">
  <h1>Чем вам помочь?</h1>
  <p>Ответы на частые вопросы о заказах, доставке, оплате и возврате</p>
  <div class="help-search">{ic('search')}<input class="input" type="search" placeholder="Например, как вернуть товар" aria-label="Поиск по вопросам" data-hq></div>
</section>
<nav class="topics" aria-label="Темы">{topics}</nav>
{secs}
<div class="no-res" hidden><b>Ничего не нашлось.</b> Попробуйте переформулировать вопрос или напишите нам в <button type="button" class="link-btn" data-act="chat">чат поддержки</button>.</div>
<section class="sec help-sec" id="contacts">{sec_h('Не нашли ответ?', extra='<span class="sec-sub">Свяжитесь с нами удобным способом</span>')}<div class="contacts">{contacts}</div></section>
</div>'''
    page('help.html', 'help', 'Помощь покупателям', 'Помощь Ежевики: как оформить и отследить заказ, способы оплаты и доставки, возврат товара, ягодный клуб.', content, 'pages')

# ---------------- пункты выдачи ----------------
def pickup():
    cities = Counter(p['city'] for p in D['points'])
    steps = [('Выберите пункт', 'При оформлении заказа укажите удобный пункт выдачи или постамат на карте.'),
             ('Дождитесь уведомления', 'Мы пришлём сообщение, когда заказ приедет, и код для получения.'),
             ('Назовите код', 'Покажите код из личного кабинета или назовите последние цифры телефона.'),
             ('Примерьте и проверьте', 'Примерьте одежду в примерочной. Если вещь не подошла — оставьте её в пункте.')]
    st = ''.join(f'<div class="step"><h3>{t}</h3><p>{p}</p></div>' for t, p in steps)
    perks = ['Стабильный поток клиентов с первого дня', 'Оборудование и брендирование за наш счёт', 'Вознаграждение от 3,5% с каждой выдачи', 'Обучение и поддержка менеджера 7 дней в неделю']
    content = f'''<div class="wrap">
{crumbs([('Пункты выдачи', None)])}
<div class="page-h"><h1>Пункты выдачи</h1><span class="cnt">{pl(len(D['points']), 'пункт', 'пункта', 'пунктов')} и постаматов в {len(cities)} городах</span></div>
<div class="pk-page" data-pkpage></div>
<section class="sec">{sec_h('Как получить заказ')}<div class="steps">{st}</div></section>
<section class="sec" id="open"><div class="split">
  <div>
    {tag('store', 'Для предпринимателей').replace('class="tag"', 'class="tag tag-l"')}
    <h2 class="split-h">Откройте пункт выдачи Ежевики</h2>
    <p class="split-p">Бизнес с понятной экономикой: мы приводим покупателей, а вы зарабатываете на каждой выдаче. Окупаемость — от 6 месяцев.</p>
    <ul class="checks">{''.join(f'<li>{ic("check-c")}{x}</li>' for x in perks)}</ul>
  </div>
  <div class="form-card" data-formcard>
    <h2>Оставьте заявку</h2><p>Менеджер перезвонит в течение рабочего дня</p>
    <form class="m-form" data-lead="pickup" novalidate>
      <div class="field"><label for="op-name">Имя</label><input class="input" id="op-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="op-phone">Телефон</label><input class="input" id="op-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required data-phone></div>
      <div class="field"><label for="op-city">Город</label><select class="input" id="op-city" name="city">{''.join(f'<option>{c}</option>' for c in cities)}<option>Другой город</option></select></div>
      <div class="field"><label for="op-addr">Адрес помещения</label><input class="input" id="op-addr" name="addr" placeholder="Улица, дом" required></div>
      <label class="check"><input type="checkbox" required name="agree"><span>Согласен с <a href="legal.html?doc=privacy">политикой обработки персональных данных</a></span></label>
      <button class="btn btn-primary btn-lg btn-block">Отправить заявку</button>
    </form>
  </div>
</div></section>
</div>'''
    page('pickup.html', 'pickup', 'Пункты выдачи и постаматы', 'Пункты выдачи и постаматы Ежевики на карте: адреса, часы работы и рейтинг. Бесплатная доставка и примерка.', content, 'pages')

# ---------------- продавцам ----------------
TARIFFS = [('Одежда и обувь', 'wear', 15, 12), ('Электроника', 'tech', 8, 5), ('Бытовая техника', 'tech', 9, 7), ('Красота и здоровье', 'beauty', 14, 11),
           ('Дом и кухня', 'home', 12, 10), ('Детские товары', 'kids', 11, 9), ('Спорт и отдых', 'sport', 12, 10), ('Продукты', 'food', 9, 7),
           ('Зоотовары', 'home', 10, 8), ('Книги и канцтовары', 'books', 10, 8)]

def sellers():
    nums = [('35 млн', 'покупателей заходят на Ежевику каждый месяц'), ('4 000+', 'пунктов выдачи и постаматов по России'),
            ('от 5%', 'комиссия — одна из самых низких на рынке'), ('2 раза', 'в неделю выплачиваем деньги за проданные товары')]
    nh = ''.join(f'<div class="num"><b>{b}</b><span>{s}</span></div>' for b, s in nums)
    feats = [('rocket', 'Быстрый старт', 'Регистрация за 15 минут и первые продажи уже через 3 дня после загрузки товаров.'),
             ('truck', 'Своя логистика', 'Заберём товар с вашего склада или примем на наших фулфилмент-центрах.'),
             ('chart', 'Аналитика продаж', 'Отчёты по спросу, ценам конкурентов и остаткам в личном кабинете продавца.'),
             ('megaphone', 'Продвижение', 'Участвуйте в акциях, запускайте рекламу в поиске и на главной странице.'),
             ('wallet', 'Частые выплаты', 'Выплачиваем деньги дважды в неделю без скрытых комиссий за вывод.'),
             ('shield', 'Защита продавца', 'Компенсируем стоимость товара, если он повреждён на нашем складе.')]
    fh = ''.join(f'<div class="feat"><span class="feat-ic">{ic(i)}</span><h3>{t}</h3><p>{p}</p></div>' for i, t, p in feats)
    steps = [('Зарегистрируйтесь', 'Заполните заявку и подпишите договор онлайн с помощью электронной подписи.'),
             ('Загрузите товары', 'Добавьте карточки вручную, из Excel-шаблона или через API.'),
             ('Отгрузите на склад', 'Привезите товар на склад Ежевики или храните у себя и отгружайте под заказ.'),
             ('Получайте выплаты', 'Следите за продажами в кабинете и получайте деньги дважды в неделю.')]
    sh = ''.join(f'<div class="step"><h3>{t}</h3><p>{p}</p></div>' for t, p in steps)
    trs = ''.join(f'<tr><td>{n}</td><td>{fbo}%</td><td>{fbs}%</td></tr>' for n, _, fbo, fbs in TARIFFS)
    ads = [('search', 'Продвижение в поиске', 'Поднимайте карточки в выдаче по ключевым запросам. Оплата за клики.'),
           ('image', 'Баннеры на главной', 'Охват до 5 млн показов в день на главной и в каталоге.'),
           ('percent', 'Участие в акциях', 'Попадайте в подборки распродаж 11.11, «Чёрной пятницы» и новогодней ярмарки.'),
           ('megaphone', 'Рассылки и push', 'Расскажите о новинках подписчикам бренда в приложении.')]
    ah = ''.join(f'<div class="feat feat-w"><span class="feat-ic">{ic(i)}</span><h3>{t}</h3><p>{p}</p></div>' for i, t, p in ads)
    cats = ''.join(f'<option value="{fbo}|{fbs}">{n}</option>' for n, _, fbo, fbs in TARIFFS)
    content = f'''<div class="wrap">
{crumbs([('Продавцам', None)])}
<section class="band">
  <img src="img/b/hero-sellers.webp" alt="" width="874" height="800" fetchpriority="high">
  {tag('store', 'Ежевика для бизнеса')}
  <h1>Продавайте на Ежевике</h1>
  <p>35 миллионов покупателей, доставка по всей России и выплаты два раза в неделю. Начните продавать за 3 дня.</p>
  <div class="band-cta"><a class="btn btn-white btn-lg" href="#apply">Стать продавцом{ic('arrow-r')}</a><a class="btn btn-glass btn-lg" href="#calc">Рассчитать доход</a></div>
</section>
<section class="sec"><div class="nums">{nh}</div></section>
<section class="sec">{sec_h('Почему продавцы выбирают Ежевику')}<div class="feat-grid">{fh}</div></section>
<section class="sec">{sec_h('Как начать продавать')}<div class="steps">{sh}</div></section>
<section class="sec" id="calc">{sec_h('Калькулятор дохода', extra='<span class="sec-sub">Предварительный расчёт — точные условия в договоре</span>')}
  <div class="calc2">
    <form class="form-grid" data-scalc onsubmit="return false">
      <div class="field span2"><label for="sc-cat">Категория товара</label><select class="input" id="sc-cat" name="cat">{cats}</select></div>
      <div class="field"><label for="sc-price">Цена товара, ₽</label><input class="input" id="sc-price" name="price" type="number" inputmode="numeric" min="100" max="500000" value="2490"></div>
      <div class="field"><label for="sc-qty">Продаж в месяц, шт.</label><input class="input" id="sc-qty" name="qty" type="number" inputmode="numeric" min="1" max="100000" value="300"></div>
      <div class="field span2"><span class="lbl">Схема работы</span><div class="seg" data-scheme><button type="button" class="on" data-s="fbo">Склад Ежевики (FBO)</button><button type="button" data-s="fbs">Свой склад (FBS)</button></div></div>
      <p class="field-hint span2" data-shint>Храним, собираем и доставляем ваш товар. Логистика — 49 ₽ за единицу.</p>
    </form>
    <div class="calc-res"><span>Вы получите за месяц</span><b data-sr>0 ₽</b>
      <div class="row"><span>Выручка</span><b data-s1>0 ₽</b></div><div class="row"><span>Комиссия Ежевики</span><b data-s2>0 ₽</b></div><div class="row"><span>Логистика</span><b data-s3>0 ₽</b></div><div class="row"><span>Выплат в месяц</span><b>8</b></div>
      <a class="btn btn-white btn-block mt16" href="#apply">Подать заявку</a></div>
  </div>
</section>
<section class="sec" id="tariffs">{sec_h('Комиссии по категориям')}<div class="box tariffs"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Категория</th><th>Склад Ежевики (FBO)</th><th>Свой склад (FBS)</th></tr></thead><tbody>{trs}</tbody></table></div></div></section>
<section class="sec" id="ads">{sec_h('Рекламные возможности')}<div class="feat-grid c4">{ah}</div></section>
<section class="sec" id="logistics"><div class="split">
  <div>{tag('truck', 'Доставка для бизнеса').replace('class="tag"', 'class="tag tag-l"')}<h2 class="split-h">Логистика Ежевики для вашего бизнеса</h2>
    <p class="split-p">Доставляйте заказы своих покупателей через сеть Ежевики, даже если продаёте не только у нас: 4 000+ пунктов выдачи, курьеры и экспресс-доставка за 2 часа в городах-миллионниках.</p>
    <ul class="checks">{''.join(f'<li>{ic("check-c")}{x}</li>' for x in ['Забор товара со склада от 1 коробки', 'Хранение на 12 фулфилмент-центрах', 'Отслеживание каждого отправления по API', 'Страхование груза до 1 млн ₽'])}</ul></div>
  <div class="nums nums-2">{''.join(f'<div class="num"><b>{b}</b><span>{s}</span></div>' for b, s in [('12', 'фулфилмент-центров в 9 регионах'), ('1–3 дня', 'средний срок доставки по России'), ('99,4%', 'заказов доставляем вовремя'), ('2 часа', 'экспресс-доставка в крупных городах')])}</div>
</div></section>
<section class="sec" id="apply"><div class="split">
  <div><h2 class="split-h">Начните продавать уже на этой неделе</h2><p class="split-p">Оставьте заявку — менеджер свяжется с вами, поможет подключиться и загрузить первые товары.</p>
    <ul class="checks">{''.join(f'<li>{ic("check-c")}{x}</li>' for x in ['Для ИП, ООО и самозанятых', 'Без абонентской платы', 'Бесплатная фотосъёмка первых 20 товаров', 'Персональный менеджер на первые 3 месяца'])}</ul></div>
  <div class="form-card" data-formcard>
    <h2>Заявка продавца</h2><p>Ответим в течение 1 рабочего дня</p>
    <form class="form-grid" data-lead="seller" novalidate>
      <div class="field span2"><label for="sl-company">Название компании или ИП</label><input class="input" id="sl-company" name="company" autocomplete="organization" required></div>
      <div class="field"><label for="sl-inn">ИНН</label><input class="input" id="sl-inn" name="inn" inputmode="numeric" maxlength="12" placeholder="10 или 12 цифр" required data-inn></div>
      <div class="field"><label for="sl-cat">Категория</label><select class="input" id="sl-cat" name="cat">{''.join(f'<option>{n}</option>' for n, *_ in TARIFFS)}</select></div>
      <div class="field"><label for="sl-name">Контактное лицо</label><input class="input" id="sl-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="sl-phone">Телефон</label><input class="input" id="sl-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required data-phone></div>
      <div class="field span2"><label for="sl-email">Электронная почта</label><input class="input" id="sl-email" name="email" type="email" autocomplete="email" required data-email></div>
      <label class="check span2"><input type="checkbox" required name="agree"><span>Принимаю условия <a href="legal.html?doc=offer">оферты</a> и <a href="legal.html?doc=privacy">политики конфиденциальности</a></span></label>
      <button class="btn btn-primary btn-lg btn-block span2">Отправить заявку</button>
    </form>
  </div>
</div></section>
<section class="sec">{sec_h('Вопросы продавцов')}{faq([
    ('Кто может продавать на Ежевике?', 'Индивидуальные предприниматели, юридические лица и самозанятые, зарегистрированные в России.'),
    ('Какие документы нужны?', 'ИНН, ОГРН или ОГРНИП, банковские реквизиты и сертификаты или декларации соответствия на товары, если они требуются.'),
    ('Сколько стоит подключение?', 'Подключение и размещение товаров бесплатные. Вы платите только комиссию с проданных товаров и логистику.'),
    ('Как часто приходят выплаты?', 'Дважды в неделю — по вторникам и пятницам — за все товары, которые получили покупатели.'),
])}</section>
</div>'''
    page('sellers.html', 'sellers', 'Продавайте на Ежевике', 'Станьте продавцом Ежевики: 35 млн покупателей, комиссия от 5%, выплаты дважды в неделю, логистика по всей России.', content, 'pages')

# ---------------- о компании ----------------
JOBS = [('Frontend-разработчик (React)', 'IT', 'Москва или удалённо', 'от 250 000 ₽'), ('Продуктовый дизайнер', 'IT', 'Москва или удалённо', 'от 220 000 ₽'),
        ('Аналитик данных', 'IT', 'Санкт-Петербург', 'от 180 000 ₽'), ('Менеджер по работе с продавцами', 'Коммерция', 'Москва', 'от 120 000 ₽'),
        ('Категорийный менеджер «Красота»', 'Коммерция', 'Москва', 'от 140 000 ₽'), ('Специалист поддержки', 'Сервис', 'Удалённо', 'от 65 000 ₽'),
        ('Сотрудник пункта выдачи', 'Логистика', 'Москва, Казань, Краснодар', 'от 55 000 ₽'), ('Кладовщик на склад', 'Логистика', 'Подольск', 'от 70 000 ₽')]

def about():
    nums = [('2019', 'год основания — запуск в Москве'), ('35 млн', 'покупателей в месяц'), ('120 000', 'продавцов и брендов'), ('8 500', 'сотрудников по всей стране')]
    nh = ''.join(f'<div class="num"><b>{b}</b><span>{s}</span></div>' for b, s in nums)
    vals = [('heart', 'Забота о покупателе', 'Делаем так, чтобы выбирать было приятно, а возвращать — просто.'), ('users', 'Партнёрство', 'Растём вместе с продавцами и честно делим с ними доход.'),
            ('leaf', 'Ответственность', 'Перерабатываем упаковку и переводим склады на зелёную энергию.'), ('zap', 'Скорость', 'Доставляем за 1 день и быстро выпускаем новые функции.'),
            ('shield', 'Надёжность', 'Проверяем продавцов и гарантируем возврат денег.'), ('spark', 'Открытость', 'Говорим с покупателями и продавцами на одном языке.')]
    vh = ''.join(f'<div class="feat"><span class="feat-ic">{ic(i)}</span><h3>{t}</h3><p>{p}</p></div>' for i, t, p in vals)
    tl = [('2019', 'Первый заказ', 'Запустились в Москве с 300 продавцами и одним складом в Подольске.'), ('2021', 'Ягодный клуб', 'Запустили программу лояльности — сегодня в ней 12 млн участников.'),
          ('2022', '1 000 пунктов выдачи', 'Открыли пункты выдачи в 40 городах и запустили постаматы.'), ('2024', 'Экспресс-доставка', 'Начали доставлять заказы за 2 часа в городах-миллионниках.'),
          ('2026', '35 млн покупателей', 'Ежевика вошла в пятёрку крупнейших маркетплейсов страны.')]
    th = ''.join(f'<div class="tl-i"><b class="y">{y}</b><span class="ln"></span><div><h3>{t}</h3><p>{p}</p></div></div>' for y, t, p in tl)
    deps = ['Все', 'IT', 'Коммерция', 'Сервис', 'Логистика']
    jf = ''.join(f'<button type="button" class="chip{" on" if i == 0 else ""}" data-jf="{"" if i == 0 else d}">{d}</button>' for i, d in enumerate(deps))
    jh = ''.join(f'<div class="job" data-dep="{d}"><div><b>{t}</b><span>{d} · {c}</span></div><span class="salary">{s}</span><button type="button" class="btn btn-secondary btn-sm" data-job="{esc(t)}">Откликнуться</button></div>' for t, d, c, s in JOBS)
    news = [('hero-ny', 'Ежевика открыла новогоднюю ярмарку', 'Более 20 000 товаров к празднику и промокод на −15% для всех покупателей.', 3),
            ('hero-tech', 'Экспресс-доставка техники за 2 часа', 'Теперь смартфоны и ноутбуки можно получить в день заказа в 8 городах.', 12),
            ('hero-sellers', 'Новый фулфилмент-центр в Казани', 'Склад площадью 110 000 м² ускорит доставку в Поволжье до 1 дня.', 27)]
    nwh = ''.join(f'<a class="news-i" href="#press" data-news><div class="nv"><img src="img/b/{im}.webp" alt="" loading="lazy" decoding="async"></div><div><small data-ago="{d}"></small><h3>{t}</h3><p>{p}</p></div></a>' for im, t, p, d in news)
    req = [('Полное наименование', 'ООО «Ежевика Маркет» (демо)'), ('ИНН / КПП', '7700000000 / 770001001'), ('ОГРН', '1197700000000'),
           ('Юридический адрес', '123112, Москва, Пресненская наб., 10'), ('Телефон', '8 800 700-12-34'), ('Почта для прессы', 'press@ezhevika.ru')]
    rh = ''.join(f'<div><span>{k}</span><b>{v}</b></div>' for k, v in req)
    content = f'''<div class="wrap">
{crumbs([('О компании', None)])}
<section class="band band-about">
  <div class="band-art" aria-hidden="true">{berry()}</div>
  {tag('build', 'О компании')}
  <h1>Ежевика — маркетплейс, в котором приятно выбирать</h1>
  <p>Мы соединяем миллионы покупателей с тысячами продавцов по всей России и делаем покупки быстрыми, честными и выгодными.</p>
  <div class="band-cta"><a class="btn btn-white btn-lg" href="#jobs">Вакансии{ic('arrow-r')}</a><a class="btn btn-glass btn-lg" href="#press">Пресс-центр</a></div>
</section>
<section class="sec"><div class="nums">{nh}</div></section>
<section class="sec">{sec_h('Во что мы верим')}<div class="feat-grid">{vh}</div></section>
<section class="sec">{sec_h('Как мы росли')}<div class="tline">{th}</div></section>
<section class="sec" id="jobs">{sec_h('Вакансии', extra=f'<span class="sec-sub">{pl(len(JOBS), "открытая позиция", "открытые позиции", "открытых позиций")}</span>')}<div class="chips chips-scroll job-f">{jf}</div><div class="jobs mt16">{jh}</div></section>
<section class="sec" id="press">{sec_h('Пресс-центр')}<div class="news">{nwh}</div></section>
<section class="sec">{sec_h('Реквизиты')}<div class="req">{rh}</div></section>
<section class="sec cta-b"><div><h2>Станьте частью Ежевики</h2><p>Продавайте товары, откройте пункт выдачи или присоединяйтесь к команде.</p></div><a class="btn btn-primary btn-lg" href="sellers.html">Стать партнёром{ic('arrow-r')}</a></section>
</div>'''
    page('about.html', 'about', 'О компании', 'Ежевика — маркетплейс с доставкой по всей России. История компании, ценности, вакансии и новости.', content, 'pages')

# ---------------- документы ----------------
DOCS = {
 'terms': ('Пользовательское соглашение', 'file', '''
<h2>1. Общие положения</h2><p>Настоящее соглашение регулирует отношения между ООО «Ежевика Маркет» (далее — «Ежевика») и пользователем сайта ezhevika.ru. Используя сайт, вы подтверждаете согласие с условиями соглашения.</p>
<p>Сайт является демонстрационным проектом: товары, цены, продавцы и заказы вымышлены, реальные покупки и оплата не производятся.</p>
<h2>2. Регистрация и аккаунт</h2><ul><li>Для оформления заказов пользователь входит в личный кабинет по номеру телефона или электронной почте.</li><li>Пользователь отвечает за сохранность пароля и все действия в аккаунте.</li><li>Ежевика вправе заблокировать аккаунт при нарушении условий соглашения.</li></ul>
<h2>3. Заказы и доставка</h2><p>Договор купли-продажи заключается между покупателем и продавцом, указанным в карточке товара. Ежевика выступает информационным посредником и обеспечивает доставку заказа.</p><p>Сроки доставки указываются при оформлении заказа и могут меняться в зависимости от региона.</p>
<h2>4. Отзывы и контент</h2><p>Публикуя отзыв, пользователь подтверждает, что отзыв основан на личном опыте, и предоставляет Ежевике право использовать его на сайте. Отзывы с оскорблениями и рекламой не публикуются.</p>
<h2>5. Ответственность</h2><p>Ежевика не несёт ответственности за перебои в работе сайта, вызванные обстоятельствами непреодолимой силы, а также за действия третьих лиц.</p>
<h2>6. Контакты</h2><p>По вопросам соглашения пишите на <a href="mailto:help@ezhevika.ru">help@ezhevika.ru</a>.</p>'''),
 'privacy': ('Политика конфиденциальности', 'lock', '''
<h2>1. Какие данные мы собираем</h2><ul><li>Имя, телефон и электронную почту — для оформления и доставки заказов.</li><li>Адреса доставки и выбранные пункты выдачи.</li><li>Историю заказов и просмотров — для персональных рекомендаций.</li></ul>
<h2>2. Как мы используем данные</h2><p>Данные используются для исполнения заказов, начисления ягодок, информирования о статусе доставки и улучшения сервиса. Рекламные рассылки отправляются только с вашего согласия.</p>
<h2>3. Хранение данных</h2><p>В демо-версии все данные — корзина, избранное, заказы и настройки — хранятся только в вашем браузере (localStorage) и никуда не передаются. Очистите данные сайта в настройках браузера, чтобы удалить их.</p>
<h2>4. Передача третьим лицам</h2><p>Мы передаём данные только продавцам и службам доставки в объёме, необходимом для выполнения заказа, а также по требованию закона.</p>
<h2>5. Ваши права</h2><p>Вы можете запросить копию своих данных, исправить или удалить их, написав на <a href="mailto:privacy@ezhevika.ru">privacy@ezhevika.ru</a>.</p>'''),
 'offer': ('Публичная оферта', 'brief', '''
<h2>1. Предмет оферты</h2><p>Продавец обязуется передать покупателю товар, а покупатель — оплатить и принять его на условиях настоящей оферты. Оформление заказа означает полное принятие условий.</p>
<h2>2. Цена и оплата</h2><ul><li>Цены указаны в рублях с учётом НДС.</li><li>Оплата производится картой онлайн, через СБП или при получении.</li><li>Скидки по промокодам и ягодкам применяются при оформлении заказа.</li></ul>
<h2>3. Доставка</h2><p>Доставка осуществляется в пункты выдачи, постаматы или курьером по адресу покупателя. Доставка в пункты выдачи бесплатная, курьером — 99 ₽ при заказе до 1 000 ₽.</p>
<h2>4. Возврат</h2><p>Товар надлежащего качества можно вернуть в течение 14 дней с момента получения, если сохранены его товарный вид и потребительские свойства. Товар с недостатками принимается в течение гарантийного срока.</p>
<h2>5. Реквизиты</h2><p>ООО «Ежевика Маркет» (демо), ИНН 7700000000, 123112, Москва, Пресненская наб., 10.</p>'''),
}

def legal():
    nav = ''.join(f'<a href="legal.html?doc={k}" data-doc="{k}">{ic(i)}{t}</a>' for k, (t, i, _) in DOCS.items())
    docs = ''.join(f'<article class="prose" data-docbody="{k}"{"" if k == "terms" else " hidden"}><h1 class="doc-h">{t}</h1><p class="muted">Редакция от 1 ноября 2026 года</p>{body}</article>' for k, (t, i, body) in DOCS.items())
    content = f'''<div class="wrap">
{crumbs([('Документы', None)])}
<div class="side-l"><nav class="side-nav" aria-label="Документы">{nav}</nav><div>{docs}</div></div>
</div>'''
    page('legal.html', 'legal', 'Документы', 'Правовые документы Ежевики: пользовательское соглашение, политика конфиденциальности и публичная оферта.', content, 'pages')

# ---------------- 404 ----------------
def e404():
    content = f'''<div class="wrap">
<section class="e404">
  <div class="e404-n" aria-hidden="true">4{berry()}4</div>
  <h1>Такой страницы нет</h1>
  <p>Возможно, её удалили или в адресе опечатка. Найдите нужный товар через поиск или вернитесь на главную.</p>
  <form action="catalog.html" method="get" role="search"><input class="input" type="search" name="q" placeholder="Найти товар" aria-label="Поиск товара" required><button class="btn btn-primary">{ic('search', 'i-20')}Найти</button></form>
  <div class="empty-btns"><a class="btn btn-outline" href="index.html">{ic('home')}На главную</a><a class="btn btn-secondary" href="catalog.html">{ic('grid')}В каталог</a></div>
</section>
<section class="sec">{sec_h('Вам может понравиться', 'catalog.html?flag=hit')}<div data-prods="hits" data-n="12"></div></section>
</div>'''
    page('404.html', '404', 'Страница не найдена', 'Страница не найдена.', content, 'pages', base=True)
