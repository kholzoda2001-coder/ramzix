/* RamzIx — қисмҳои умумӣ: сарлавҳа, меню, поёни саҳифа, иконкаҳо */

const ICONS = `
<svg width="0" height="0" style="position:absolute">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-cart" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 7H6"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9.2-9.4A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 9.2 4.3C19.5 15.4 12 20 12 20Z"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></symbol>
  <symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.4"/></symbol>
  <symbol id="i-headset" viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a3 3 0 0 1-3 3h-3"/></symbol>
  <symbol id="i-wa" viewBox="0 0 24 24"><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z"/><path d="M9 8.5c0 3.3 3.2 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.3-2.3l.9-1-1-2z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></symbol>
  <symbol id="i-card" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/></symbol>
  <symbol id="i-return" viewBox="0 0 24 24"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="m8 5-4 4 4 4"/></symbol>
  <symbol id="i-zoom" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></symbol>
  <symbol id="i-battery" viewBox="0 0 24 24"><rect x="2.5" y="7" width="17" height="10" rx="2"/><path d="M22 10.5v3M6 10v4M9.5 10v4"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></symbol>
  <symbol id="i-plug" viewBox="0 0 24 24"><path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5"/></symbol>
  <symbol id="i-store" viewBox="0 0 24 24"><path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/></symbol>
</svg>`;

const LOGO = `
<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
  <rect width="48" height="48" rx="11" fill="#13294b"/>
  <path d="M14 36V12h12.5a7.5 7.5 0 0 1 2.2 14.7L35 36h-7l-5.6-8.6H20.5V36z" fill="#fff"/>
  <path d="M20.5 17.5v5.6h5.6a2.8 2.8 0 0 0 0-5.6z" fill="#13294b"/>
  <path d="M5 16h7M3 21h9M6 26h6" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round"/>
</svg>`;

/* Парчамҳо — SVG-и соддакардашуда */
const FLAGS = {
  ae: `<svg viewBox="0 0 12 6" preserveAspectRatio="none" width="100%" height="100%"><rect width="12" height="2" fill="#00732f"/><rect y="2" width="12" height="2" fill="#fff"/><rect y="4" width="12" height="2" fill="#000"/><rect width="3" height="6" fill="#ff0000"/></svg>`,
  cn: `<svg viewBox="0 0 30 20" preserveAspectRatio="none" width="100%" height="100%"><rect width="30" height="20" fill="#de2910"/><path fill="#ffde00" d="m5 2 1.2 3.6H10L7 7.8l1.1 3.6L5 9.2l-3.1 2.2L3 7.8 0 5.6h3.8z"/><circle cx="11" cy="2.5" r=".9" fill="#ffde00"/><circle cx="13" cy="4.8" r=".9" fill="#ffde00"/><circle cx="13" cy="7.8" r=".9" fill="#ffde00"/><circle cx="11" cy="10" r=".9" fill="#ffde00"/></svg>`,
  tr: `<svg viewBox="0 0 30 20" preserveAspectRatio="none" width="100%" height="100%"><rect width="30" height="20" fill="#e30a17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#e30a17"/><path fill="#fff" d="m17.5 10 3.8-1.2-2.3 3.2V8l2.3 3.2z"/></svg>`,
  tj: `<svg viewBox="0 0 28 14" preserveAspectRatio="none" width="100%" height="100%"><rect width="28" height="4" fill="#cc0000"/><rect y="4" width="28" height="6" fill="#fff"/><rect y="10" width="28" height="4" fill="#006600"/><path d="M11.8 8.3h4.4l-.4-1.6-.9.7-.9-1.3-.9 1.3-.9-.7z" fill="#f8c300"/><g fill="#f8c300"><circle cx="10.8" cy="6.6" r=".35"/><circle cx="11.3" cy="5.6" r=".35"/><circle cx="12.4" cy="5" r=".35"/><circle cx="14" cy="4.8" r=".35"/><circle cx="15.6" cy="5" r=".35"/><circle cx="16.7" cy="5.6" r=".35"/><circle cx="17.2" cy="6.6" r=".35"/></g></svg>`,
};

const icon = (id, cls = "icon") => `<svg class="${cls}"><use href="#i-${id}"/></svg>`;

function renderShell(active) {
  document.body.insertAdjacentHTML("afterbegin", ICONS + `
  <div class="topbar">
    <div class="container">
      <div class="tb-left">
        <span>📦 Таъминоти оптовӣ аз Дубай, Чин ва Туркия</span>
        <span>📞 +992 00 000 00 00</span>
        <span>🕘 Душ–Шан 09:00–19:00</span>
      </div>
      <div class="tb-right">
        <a href="#">Шавед таъминкунанда</a>
        <select aria-label="Забон"><option>Тоҷикӣ</option><option>Русский</option><option>English</option></select>
        <select aria-label="Асъор"><option>TJS сомонӣ</option><option>USD $</option></select>
      </div>
    </div>
  </div>

  <header class="header">
    <div class="container row">
      <button class="burger" aria-label="Меню">${icon("menu")}</button>
      <a href="index.html" class="logo">${LOGO}
        <div><div class="logo-text">Ramz<b>Ix</b></div><div class="logo-sub">Оптовӣ · Бахшоӣ · Боварӣ</div></div>
      </a>
      <form class="search" onsubmit="return false">
        <select aria-label="Категория"><option>Ҳама</option><option>Электроника</option><option>Хона</option><option>Либос</option></select>
        <input placeholder="Ҷустуҷӯи маҳсулот, бренд ё коди артикул…" />
        <button aria-label="Ҷустуҷӯ">${icon("search")}</button>
      </form>
      <div class="h-actions">
        <a href="#" class="h-btn hide-m">${icon("doc")}<div class="lbl"><small>Дархостҳо</small>Нарх (RFQ)</div></a>
        <a href="#" class="h-btn hide-m">${icon("heart")}</a>
        <a href="#" class="h-btn">${icon("user")}<div class="lbl"><small>Хуш омадед</small>Воридшавӣ</div></a>
        <a href="#" class="h-btn">${icon("cart")}<span class="badge" id="cartCount">3</span><div class="lbl"><small>Сабад</small>1 240 смн</div></a>
      </div>
    </div>
  </header>

  <nav class="nav">
    <div class="container">
      <a href="#" class="all-cat">${icon("grid")} Ҳамаи категорияҳо</a>
      <a href="index.html" class="${active === "home" ? "active" : ""}">Асосӣ</a>
      <a href="#">Оптовӣ</a>
      <a href="#">Аз Дубай 🇦🇪</a>
      <a href="#">Аз Чин 🇨🇳</a>
      <a href="#">Аз Туркия 🇹🇷</a>
      <a href="#">Истеҳсоли ватанӣ 🇹🇯</a>
      <a href="#">Брендҳо</a>
      <a href="#">Барои мағозаҳо</a>
      <a href="#" class="nav-hot">🔥 Аксияҳо</a>
    </div>
  </nav>`);

  document.addEventListener("DOMContentLoaded", () => document.body.insertAdjacentHTML("beforeend", `
  <footer class="footer">
    <div class="container">
      <div class="cols">
        <div>
          <a href="index.html" class="logo" style="color:#fff">${LOGO}<div><div class="logo-text">Ramz<b>Ix</b></div><div class="logo-sub">Оптовӣ · Бахшоӣ · Боварӣ</div></div></a>
          <p style="margin:14px 0 0;max-width:340px">Платформаи B2B барои таъмини мағозаҳо, ширкатҳо ва фурӯшандагон бо маҳсулот аз Аморат, Чин, Туркия ва Тоҷикистон.</p>
          <div class="pay-row"><span>Алиф</span><span>DC Pay</span><span>Эсхата</span><span>Visa / MC</span><span>Интиқоли бонкӣ</span><span>Нақд</span></div>
        </div>
        <div><h4>Харидор</h4><a href="#">Чӣ тавр фармоиш диҳам</a><a href="#">Нархҳои оптовӣ</a><a href="#">Пардохт ва фактура</a><a href="#">Ворид кардани фармоиш</a><a href="#">Бозгашти мол</a></div>
        <div><h4>Тиҷорат</h4><a href="#">Ҳисоби бизнес (B2B)</a><a href="#">Шавед таъминкунанда</a><a href="#">Фармоиши махсус (RFQ)</a><a href="#">Логистика ва гумрук</a><a href="#">Шартҳои ҳамкорӣ</a></div>
        <div><h4>Тамос</h4><a href="#">📍 Душанбе, Тоҷикистон</a><a href="#">📍 Дубай, АМА (анбор)</a><a href="#">📞 +992 00 000 00 00</a><a href="#">✉️ info@ramzix.tj</a><a href="#">💬 WhatsApp · Telegram</a></div>
      </div>
      <div class="copy"><span>© 2026 RamzIx. Ҳамаи ҳуқуқҳо ҳифз шудаанд.</span><span>Сиёсати махфият · Шартҳои истифода</span></div>
    </div>
  </footer>

  <a href="#" class="wa-float" aria-label="WhatsApp">${icon("wa")}</a>

  <nav class="bottom-nav">
    <a href="index.html" class="${active === "home" ? "on" : ""}">${icon("home")}Асосӣ</a>
    <a href="#">${icon("grid")}Каталог</a>
    <a href="#">${icon("doc")}Дархостҳо</a>
    <a href="#">${icon("cart")}<span class="badge">3</span>Сабад</a>
    <a href="#">${icon("user")}Профил</a>
  </nav>`));
}

/* Маҳсулоти намунавӣ (дар оянда аз API меояд) */
const PRODUCTS = [
  { id: 1, e: "🎧", bg: "#eef2ff", name: "Наушники бесим TWS Pro, ANC, 30 соат", retail: 189, whole: 139, moq: 10, flag: "cn", sold: "2.1k", disc: 18 },
  { id: 2, e: "⌚", bg: "#f1f5f9", name: "Apple Watch Series 10, 46mm, GPS", retail: 3290, whole: 2990, moq: 5, flag: "ae", sold: "640" },
  { id: 3, e: "🔋", bg: "#fef3c7", name: "Power Bank Anker 20 000 mAh, 30W, USB-C", retail: 420, whole: 345, moq: 10, flag: "ae", sold: "1.4k", disc: 12 },
  { id: 4, e: "📱", bg: "#fce7f3", name: "Samsung Galaxy A55, 8/256GB", retail: 4150, whole: 3790, moq: 3, flag: "ae", sold: "310" },
  { id: 5, e: "🍳", bg: "#ecfdf5", name: "Маҷмӯи табақҳо, гранит, 10 адад", retail: 980, whole: 760, moq: 6, flag: "tr", sold: "820" },
  { id: 6, e: "👕", bg: "#e0f2fe", name: "Футболкаи мардона, пахта 100%, Oversize", retail: 120, whole: 68, moq: 20, flag: "tr", sold: "5.3k", disc: 25 },
  { id: 7, e: "🔌", bg: "#f5f3ff", name: "Зарядки тез GaN 65W, 3 порт", retail: 260, whole: 198, moq: 10, flag: "cn", sold: "3.2k" },
  { id: 8, e: "🧴", bg: "#fff1f2", name: "Маҷмӯи нигоҳубини пӯст, 5 маҳсулот", retail: 340, whole: 245, moq: 12, flag: "tr", sold: "970" },
  { id: 9, e: "🍯", bg: "#fffbeb", name: "Асали кӯҳии Тоҷикистон, 1 кг", retail: 150, whole: 115, moq: 24, flag: "tj", sold: "1.8k" },
  { id: 10, e: "💡", bg: "#f0fdf4", name: "Лампаи LED 12W, E27, бастаи 10 адад", retail: 95, whole: 62, moq: 50, flag: "cn", sold: "7.6k", disc: 10 },
];

const fmt = (n) => n.toLocaleString("ru-RU").replace(/,/g, " ");

function productCard(p) {
  return `
  <article class="card p-card">
    <a href="product.html" class="p-img" style="background:${p.bg}">
      <span class="flag-mini">${FLAGS[p.flag]}</span>
      <span class="fav">${icon("heart")}</span>
      ${p.disc ? `<span class="disc">−${p.disc}%</span>` : ""}
      ${p.e}
    </a>
    <div class="p-body">
      <a href="product.html" class="p-name">${p.name}</a>
      <div class="p-price"><b>${fmt(p.retail)} смн</b><span style="font-size:12px;color:var(--muted)">/ дона</span></div>
      <div class="p-whole"><span>Аз ${p.moq} дона</span><b>${fmt(p.whole)} смн</b></div>
      <div class="p-meta"><span>★ 4.8</span><span>${p.sold} фурӯхта шуд</span></div>
    </div>
    <button class="p-add">${icon("cart")} Ба сабад</button>
  </article>`;
}
