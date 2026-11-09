# -*- coding: utf-8 -*-
"""Сборка HTML-страниц сайта «Ежевика».
Запуск из корня сайта: python3 _src/build.py — пересоздаёт *.html."""
import json, os, random, re, html
from collections import Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, '..')
NB = '\u00a0'

raw = open(os.path.join(SITE, 'js', 'data.js'), encoding='utf-8').read()
D = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
CATS = {c['id']: c for c in D['cats']}
PRODS = D['products']

def esc(s): return html.escape(str(s), quote=True)
def fmt(n): return re.sub(r'\B(?=(\d{3})+(?!\d))', NB, str(int(round(n))))
def money(n): return fmt(n) + NB + '₽'
def plural(n, f1, f2, f5):
    n = abs(n) % 100; d = n % 10
    if 10 < n < 20: return f5
    if 1 < d < 5: return f2
    if d == 1: return f1
    return f5
def pl(n, f1, f2, f5): return fmt(n) + NB + plural(n, f1, f2, f5)
def ic(n, c=''): return f'<svg class="i {c}" aria-hidden="true"><use href="#i-{n}"></use></svg>'
BERRY = ('<g class="b-leaf"><path d="M16.4 8.3c-.2-1.9.2-3.3 1.2-4.6"/><path d="M17.3 5.6c1.1-2.6 3.5-3.9 6.7-3.6-.8 3-3.3 4.4-6.7 3.6z"/></g>'
         '<g class="b-body"><circle cx="12" cy="11.6" r="3.7"/><circle cx="20" cy="11.6" r="3.7"/><circle cx="8" cy="18.6" r="3.7"/><circle cx="16" cy="18.6" r="3.7"/><circle cx="24" cy="18.6" r="3.7"/><circle cx="12" cy="25.6" r="3.7"/><circle cx="20" cy="25.6" r="3.7"/></g>'
         '<g class="b-hl"><circle cx="10.6" cy="10.2" r="1"/><circle cx="18.6" cy="10.2" r="1"/><circle cx="6.6" cy="17.2" r="1"/><circle cx="14.6" cy="17.2" r="1"/><circle cx="22.6" cy="17.2" r="1"/><circle cx="10.6" cy="24.2" r="1"/><circle cx="18.6" cy="24.2" r="1"/></g>')
def berry(c=''): return f'<svg class="berry {c}" viewBox="0 0 32 32" aria-hidden="true">{BERRY}</svg>'
def crumbs(items):
    s = '<nav class="crumbs" aria-label="Навигационная цепочка"><a href="index.html">Главная</a>'
    for t, h in items:
        s += ic('chev-r', 'i-16') + (f'<a href="{h}">{t}</a>' if h else f'<span>{t}</span>')
    return s + '</nav>'
def sec_h(title, href=None, link='Смотреть все', extra=''):
    more = f'<a class="sec-more" href="{href}">{link}{ic("chev-r", "i-18")}</a>' if href else ''
    return f'<div class="sec-h"><h2>{title}</h2>{extra}{more}</div>'
def faq(items, open_first=False):
    out = []
    for i, (q, a) in enumerate(items):
        a = a if a.lstrip().startswith('<') else f'<p>{a}</p>'
        out.append(f'<details class="faq"{" open" if open_first and i == 0 else ""}><summary>{q}{ic("chev-d", "i-20")}</summary><div class="faq-a">{a}</div></details>')
    return '<div class="faq-list">' + ''.join(out) + '</div>'

def qr_svg(seed=7, n=25):
    r = random.Random(seed); cells = []
    def finder(x0, y0):
        for y in range(7):
            for x in range(7):
                if x in (0, 6) or y in (0, 6) or (2 <= x <= 4 and 2 <= y <= 4): cells.append((x0 + x, y0 + y))
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7)
    busy = lambda x, y: (x < 8 and y < 8) or (x >= n - 8 and y < 8) or (x < 8 and y >= n - 8)
    for y in range(n):
        for x in range(n):
            if not busy(x, y) and r.random() < 0.48: cells.append((x, y))
    path = ''.join(f'M{x} {y}h1v1h-1z' for x, y in cells)
    return f'<svg viewBox="-1 -1 {n + 2} {n + 2}" aria-hidden="true" shape-rendering="crispEdges"><path d="{path}" fill="#16161D"/></svg>'

# ---------- шаблон страницы ----------
VER = '20261109'
def page(name, page_id, title, desc, content, script=None, body_cls='', notab=False, base=False, full_title=False):
    t = title if full_title else f'{title} — Ежевика'
    scripts = '<script src="js/data.js?v=%s"></script>\n<script src="js/core.js?v=%s"></script>' % (VER, VER)
    if script: scripts += f'\n<script src="js/{script}.js?v={VER}"></script>'
    doc = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{'<base href="/">' if base else ''}<title>{esc(t)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#5E0FCE">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ежевика">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="{esc(t)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="img/b/full-sale.webp">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/inter-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/style.css?v={VER}">
</head>
<body data-page="{page_id}"{f' class="{body_cls}"' if body_cls else ''}{' data-notab' if notab else ''}>
<a class="skip" href="#main">Перейти к содержимому</a>
<div id="app-header"></div>
<main id="main" class="page page-{page_id}">
{content}
</main>
<div id="app-footer"></div>
<noscript><div class="noscript">Для работы магазина включите JavaScript в настройках браузера.</div></noscript>
{scripts}
</body>
</html>
'''
    open(os.path.join(SITE, name), 'w', encoding='utf-8').write(doc)
    print('  ', name, len(doc) // 1024, 'KB')

# ---------- главная ----------
SLIDES = [
    dict(k='sale', c0='#5f10cd', c1='#8213b3', ar=1.19, w=952, tag=ic('flame') + '11.11 · Всемирный день шопинга',
         h='Распродажа года —<br>скидки до −70%', p='Одежда, техника и подарки к Новому году — доставим завтра',
         btn='Перейти к скидкам', href='promo.html', timer=True),
    dict(k='ny', c0='#3e02a5', c1='#7f028c', ar=.932, w=746, tag=ic('gift') + 'Новогодняя ярмарка',
         h='Подарки, ёлки<br>и украшения', p='Идеи к празднику и −15% по промокоду НОВЫЙГОД',
         btn='Выбрать подарки', href='catalog.html?cat=newyear'),
    dict(k='tech', c0='#3007ad', c1='#550fcd', ar=.995, w=796, tag=ic('zap') + 'Неделя техники',
         h='Гаджеты со скидкой<br>до −50%', p='Смартфоны, наушники и часы с официальной гарантией',
         btn='Смотреть технику', href='catalog.html?cat=electronics'),
    dict(k='home', c0='#8232df', c1='#bb54b8', ar=1.44, w=1152, tag=ic('home') + 'Уютная зима',
         h='Всё для тёплого<br>и уютного дома', p='Пледы, свечи, посуда и текстиль — от 290 ₽',
         btn='Создать уют', href='catalog.html?cat=home'),
    dict(k='beauty', c0='#9c0378', c1='#bf167c', ar=1.31, w=1048, tag=ic('spark') + 'Акция 1+1=3',
         h='Третий товар<br>красоты — в подарок', p='Самый дешёвый из трёх товаров — бесплатно',
         btn='К покупкам', href='catalog.html?cat=beauty'),
    dict(k='club', c0='#4c09aa', c1='#8b10a4', ar=1.3, w=1040, tag=ic('crown') + 'Ягодный клуб',
         h='Возвращаем до 7%<br>ягодками', p='Оплачивайте ими до 30% следующих покупок',
         btn='Узнать больше', href='club.html'),
]

def min_price(f): return min(p['price'] for p in PRODS if f(p))

def home():
    sl = []
    for i, s in enumerate(SLIDES):
        timer = '<div class="timer"><span>До конца акции</span><div class="cd" data-cd="sale"></div></div>' if s.get('timer') else ''
        img_attr = 'fetchpriority="high"' if i == 0 else 'loading="lazy"'
        sl.append(f'''<div class="slide" style="--c0:{s['c0']};--c1:{s['c1']};--ar:{s['ar']}" role="group" aria-roledescription="слайд" aria-label="{i + 1} из {len(SLIDES)}"{'' if i == 0 else ' aria-hidden="true"'}>
      <img src="img/b/hero-{s['k']}.webp" alt="" width="{s['w']}" height="800" decoding="async" {img_attr} draggable="false">
      <div class="slide-txt"><span class="tag">{s['tag']}</span><h2 class="slide-h">{s['h']}</h2><p class="slide-p">{s['p']}</p>
        <div class="hero-cta"><a class="btn btn-white btn-lg" href="{s['href']}"{'' if i == 0 else ' tabindex="-1"'}>{s['btn']}{ic('arrow-r')}</a>{timer}</div></div>
    </div>''')
    on = ' class="on" aria-current="true"'
    dots = ''.join(f'<button type="button"{on if i == 0 else ""} aria-label="Слайд {i + 1}"></button>' for i in range(len(SLIDES)))
    outer = min_price(lambda p: p['sub'] == 'outer')
    promos = [
        ('catalog.html?cat=electronics', '#ECE7FF', 'Техника до −50%', 'Наушники, часы и гаджеты', 'tech'),
        ('catalog.html?sub=outer', '#E5EDFF', f'Пуховики от {money(outer)}', 'Тёплая коллекция', 'outer'),
        ('catalog.html?cat=kitchen', '#FFEEE2', 'Всё для кухни', 'Посуда до −40%', 'kitchen'),
        ('catalog.html?cat=beauty', '#FFE6F1', 'Красота 1+1=3', 'Уход и ароматы', 'beauty'),
    ]
    pr = ''.join(f'<a class="promo" href="{h}" style="background:{bg}"><h3>{t}</h3><p>{p}</p><span class="more">Смотреть{ic("chev-r", "i-18")}</span><img src="img/c/pr-{k}.webp" alt="" loading="lazy" decoding="async"></a>' for h, bg, t, p, k in promos)
    order = ['electronics', 'women', 'men', 'shoes', 'home', 'kitchen', 'beauty', 'kids', 'sport', 'appliances', 'newyear', 'acc', 'furniture', 'pets', 'food', 'books', 'tools']
    cats = ''.join(f'<a class="cat" href="catalog.html?cat={c}"><span class="c"><img src="img/c/cat-{c}.webp" alt="" loading="lazy" decoding="async" width="240" height="240"></span>{CATS[c]["name"]}</a>' for c in order)
    rail = lambda inner, cls='': f'<div class="rail {cls}"><button type="button" class="rail-btn prev" aria-label="Прокрутить назад">{ic("chev-l")}</button><div class="rail-track">{inner}</div><button type="button" class="rail-btn next" aria-label="Прокрутить вперёд">{ic("chev-r")}</button></div>'
    # бренды
    sold = Counter(); cnt = Counter()
    for p in PRODS: sold[p['brand']] += p['sold']; cnt[p['brand']] += 1
    top = [b for b, _ in sold.most_common(8)]
    brands = ''.join(f'<a class="brand-t bw{i % 4 + 1}" href="catalog.html?brand={esc(b)}"><b>{esc(b)}</b><small>{pl(cnt[b], "товар", "товара", "товаров")}</small></a>' for i, b in enumerate(top))
    adv = [('truck', 'Доставка от 1 дня', 'Бесплатно в пункты выдачи'), ('ret', 'Возврат 14 дней', 'Без вопросов и комиссий'),
           ('shield', 'Безопасная оплата', 'Картой, через СБП или при получении'), ('berry', 'Кешбэк ягодками', 'До 7% от каждой покупки')]
    advh = ''.join(f'<div class="adv-i"><span class="adv-ic">{berry("berry-c") if i == "berry" else ic(i)}</span><div><b>{t}</b><span>{s}</span></div></div>' for i, t, s in adv)
    deal = (f'<div class="sec-h"><div class="deal-h"><h2>Скидки дня</h2><span class="deal-cd">{ic("clock", "i-18")}Ещё<div class="cd" data-cd="midnight" data-mode="hms"></div></span></div>'
            f'<a class="sec-more" href="catalog.html?sort=discount">Все скидки{ic("chev-r", "i-18")}</a></div>')
    content = f'''<h1 class="sr">Ежевика — маркетплейс одежды, техники и товаров для дома</h1>
<div class="wrap">
  <section class="hero" aria-roledescription="карусель" aria-label="Акции и предложения">
    <div class="hero-track">
    {''.join(sl)}
    </div>
    <button type="button" class="arr l" aria-label="Предыдущий слайд">{ic('chev-l')}</button>
    <button type="button" class="arr r" aria-label="Следующий слайд">{ic('chev-r')}</button>
    <div class="dots">{dots}</div>
  </section>
  <div class="promos">{pr}</div>
  <section class="cats" aria-label="Категории">{rail(cats)}</section>

  <section class="sec">{sec_h('Хиты продаж', 'catalog.html?flag=hit')}<div data-list="hits"></div></section>

  <section class="club-b" data-club>
    <span class="club-ic">{ic("crown")}</span>
    <div><h3>Ягодный клуб — кешбэк до 7% ягодками</h3><p>Бесплатная доставка курьером от 1 000 ₽, закрытые распродажи и подарки на день рождения для участников</p></div>
    <a class="btn btn-dark btn-lg" href="club.html">Вступить бесплатно{ic('arrow-r')}</a>
  </section>

  <section class="sec">{sec_h('Новогодняя ярмарка', 'catalog.html?cat=newyear', 'Все подарки')}<div data-list="ny"></div></section>
  <section class="sec">{sec_h('Тепло и уют для дома', 'catalog.html?cat=home')}<div data-list="cozy"></div></section>
  <section class="sec">{deal}<div data-list="deals"></div></section>
  <section class="sec">{sec_h('Новинки недели', 'catalog.html?flag=new')}<div data-list="new"></div></section>
  <section class="sec">{sec_h('Популярные бренды', 'brands.html', 'Все бренды')}<div class="brands-strip">{brands}</div></section>
  <section class="sec">{sec_h('Техника для дома', 'catalog.html?cat=appliances')}<div data-list="appl"></div></section>
  <section class="sec" data-recent hidden>{sec_h('Вы недавно смотрели')}<div data-list="recent"></div></section>

  <section class="adv" aria-label="Преимущества">{advh}</section>

  <section class="app-b">
    <div><h3>Скачайте приложение Ежевики</h3><p>Отслеживайте заказы, получайте персональные скидки и −300 ₽ на первый заказ по промокоду WELCOME</p>
      <div class="apps"><a href="#" data-act="app">App Store</a><a href="#" data-act="app">Google Play</a><a href="#" data-act="app">RuStore</a></div></div>
    <div class="app-qr">{qr_svg()}<span>Наведите камеру телефона на QR-код, чтобы скачать</span></div>
  </section>
</div>'''
    page('index.html', 'home', 'Ежевика — маркетплейс: одежда, техника, товары для дома с доставкой от 1 дня',
         'Ежевика — маркетплейс с доставкой по всей России: одежда, обувь, электроника, товары для дома и красоты. Скидки до 70%, кешбэк ягодками и бесплатная доставка в пункты выдачи.',
         content, 'home', body_cls='home', full_title=True)

def app_pages():
    page('catalog.html', 'catalog', 'Каталог товаров', 'Каталог Ежевики: фильтры по цене, бренду, цвету и размеру, быстрая доставка в пункты выдачи.',
         '<div class="wrap" id="cat-root"></div>', 'catalog')
    page('product.html', 'product', 'Товар', 'Карточка товара на Ежевике: фото, характеристики, отзывы покупателей и доставка от 1 дня.',
         '<div id="pp-root"></div>', 'product')
    page('cart.html', 'cart', 'Корзина', 'Корзина Ежевики: промокоды, ягодки и бесплатная доставка в пункты выдачи.',
         '<div class="wrap" id="cart-root"></div>', 'cart')
    page('checkout.html', 'checkout', 'Оформление заказа', 'Оформление заказа на Ежевике.',
         '<div class="wrap" id="co-root"></div>', 'checkout', notab=True)
    page('favorites.html', 'favorites', 'Избранное', 'Избранные товары на Ежевике.',
         '<div class="wrap" id="fav-root"></div>', 'favorites')
    page('login.html', 'login', 'Вход и регистрация', 'Войдите в Ежевику, чтобы оформлять заказы, копить ягодки и отслеживать доставку.',
         '<div class="wrap" id="login-root"></div>', 'login')
    page('account.html', 'account', 'Личный кабинет', 'Личный кабинет Ежевики: заказы, ягодки, адреса и способы оплаты.',
         '<div class="wrap" id="acc-root"></div>', 'account')

if __name__ == '__main__':
    import pages_content
    print('Сборка страниц:')
    home(); app_pages(); pages_content.build(globals())
