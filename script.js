// ===== Prodotti (modifica qui nomi, prezzi e descrizioni) =====
const PRODUCTS = [
  { id: 1, name: "Notte di Lavanda", notes: "Lavanda · Camomilla · Vaniglia", desc: "Per sere lente e sonni profondi.", price: 24, cat: "relax", color: "#b9a3d9", badge: "Più amata" },
  { id: 2, name: "Agrumi di Sicilia", notes: "Arancia · Bergamotto · Limone", desc: "Una sferzata di sole in ogni stanza.", price: 22, cat: "energia", color: "#f6b955" },
  { id: 3, name: "Bosco Incantato", notes: "Cedro · Muschio · Pino", desc: "Il profumo del bosco dopo la pioggia.", price: 26, cat: "casa", color: "#7fa889" },
  { id: 4, name: "Rosa Antica", notes: "Rosa · Peonia · Legno di sandalo", desc: "Romantica, morbida, senza tempo.", price: 25, cat: "relax", color: "#e8a3a8" },
  { id: 5, name: "Menta & Eucalipto", notes: "Menta · Eucalipto · Rosmarino", desc: "Respira a pieni polmoni, concentrati.", price: 22, cat: "energia", color: "#8ccfc2", badge: "Novità" },
  { id: 6, name: "Focolare d'Inverno", notes: "Cannella · Chiodi di garofano · Ambra", desc: "Calore e coccole nelle giornate fredde.", price: 28, cat: "casa", color: "#c98257", badge: "Edizione limitata" },
];

const fmt = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const $ = (s) => document.querySelector(s);

// ===== Griglia prodotti =====
function renderProducts(filter = "tutte") {
  const grid = $("#product-grid");
  const list = filter === "tutte" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);
  grid.innerHTML = list.map((p, i) => `
    <article class="card" style="animation-delay:${i * 0.07}s">
      <div class="card-visual" style="background:radial-gradient(circle at 50% 75%, ${p.color}55, transparent 65%)">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <div class="jar" style="background:linear-gradient(90deg, ${p.color}cc, ${p.color}, ${p.color}aa)">
          <span class="mini-flame" style="animation-delay:-${i * 0.3}s"></span>
          <span class="jar-label">${p.name}</span>
        </div>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="notes">${p.notes}</p>
        <p class="desc">${p.desc}</p>
        <div class="card-foot">
          <span class="price">${fmt(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Aggiungi</button>
        </div>
      </div>
    </article>`).join("");
}

document.querySelectorAll(".filter").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  })
);

// ===== Carrello =====
let cart = [];
try { cart = JSON.parse(localStorage.getItem("cm-cart")) || []; } catch { cart = []; }

function saveCart() {
  try { localStorage.setItem("cm-cart", JSON.stringify(cart)); } catch {}
}

function renderCart() {
  const items = $("#cart-items");
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find((p) => p.id === i.id).price, 0);
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = count;
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
  });
  $("#cart-total").textContent = fmt(total);

  if (!cart.length) {
    items.innerHTML = `<li class="empty">Il carrello è vuoto.<br>Accendi un po' di magia ✦</li>`;
    return;
  }
  items.innerHTML = cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return `<li class="cart-item">
      <span class="dot" style="background:${p.color}"></span>
      <div class="info"><strong>${p.name}</strong><span>${fmt(p.price)}</span></div>
      <div class="qty">
        <button data-act="dec" data-id="${p.id}" aria-label="Diminuisci">−</button>
        <span>${i.qty}</span>
        <button data-act="inc" data-id="${p.id}" aria-label="Aumenta">+</button>
      </div>
    </li>`;
  }).join("");
}

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart(); renderCart();
  toast(`${PRODUCTS.find((p) => p.id === id).name} aggiunta al carrello ✦`);
}

$("#product-grid").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(+btn.dataset.id);
});

$("#cart-items").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const item = cart.find((i) => i.id === +btn.dataset.id);
  item.qty += btn.dataset.act === "inc" ? 1 : -1;
  if (item.qty <= 0) cart = cart.filter((i) => i !== item);
  saveCart(); renderCart();
});

const openCart = (open) => {
  $("#cart").classList.toggle("open", open);
  $("#cart").setAttribute("aria-hidden", !open);
  $("#overlay").classList.toggle("show", open);
};
$(".cart-btn").addEventListener("click", () => openCart(true));
$(".cart-close").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));

$("#checkout").addEventListener("click", () => {
  if (!cart.length) return toast("Il carrello è vuoto");
  cart = []; saveCart(); renderCart(); openCart(false);
  toast("Grazie! Il tuo ordine è stato ricevuto 🕯️");
});

// ===== Toast =====
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ===== Candela interattiva: clic per spegnere / riaccendere =====
const heroCandle = $(".hero-candle");
$(".flame").addEventListener("click", toggleFlame);
$(".wick").addEventListener("click", toggleFlame);
function toggleFlame() {
  const turningOff = !heroCandle.classList.contains("off");
  heroCandle.classList.toggle("off");
  $(".hint").textContent = turningOff ? "clicca lo stoppino per riaccendere ✦" : "clicca la fiamma ✦";
  if (turningOff) {
    const wick = $(".wick").getBoundingClientRect();
    const box = heroCandle.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("span");
      s.className = "smoke";
      s.style.left = `${wick.left - box.left - 3}px`;
      s.style.top = `${wick.top - box.top - 10}px`;
      s.style.setProperty("--dx", `${(Math.random() - 0.5) * 60}px`);
      s.style.animationDelay = `${i * 0.15}s`;
      heroCandle.appendChild(s);
      setTimeout(() => s.remove(), 2500);
    }
  }
}

// ===== Scintille fluttuanti =====
const canvas = $("#sparks");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let sparks = [];
function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
function spawn() {
  return {
    x: Math.random() * innerWidth, y: innerHeight + 10,
    r: Math.random() * 1.8 + 0.4, vy: Math.random() * 0.5 + 0.2,
    vx: (Math.random() - 0.5) * 0.3, life: Math.random() * 0.6 + 0.4, t: Math.random() * 100,
  };
}
function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  if (sparks.length < 45) sparks.push(spawn());
  sparks.forEach((s) => {
    s.t += 0.02; s.y -= s.vy; s.x += s.vx + Math.sin(s.t) * 0.2;
    const a = Math.max(0, Math.min(1, s.y / innerHeight)) * s.life;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 196, 100, ${a})`;
    ctx.shadowColor = "rgba(255, 170, 60, .8)"; ctx.shadowBlur = 8;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  });
  sparks = sparks.filter((s) => s.y > -10);
  requestAnimationFrame(tick);
}
if (!reduceMotion) {
  resize(); addEventListener("resize", resize);
  for (let i = 0; i < 30; i++) { const s = spawn(); s.y = Math.random() * innerHeight; sparks.push(s); }
  tick();
}

// ===== Animazioni allo scroll + contatori =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll("section:not(.hero)").forEach((s) => { s.classList.add("reveal"); io.observe(s); });

function countUp(el) {
  const target = +el.dataset.count, start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 1400);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ===== Menu mobile =====
const toggle = $(".menu-toggle");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", open);
  $(".links").classList.toggle("open", open);
});
document.querySelectorAll(".links a").forEach((a) =>
  a.addEventListener("click", () => { toggle.setAttribute("aria-expanded", "false"); $(".links").classList.remove("open"); })
);

// ===== Form =====
$("#nl-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#nl-msg").textContent = "Benvenuto nel cerchio magico! Controlla la tua email ✦";
  e.target.reset();
});
$("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#contact-msg").textContent = "Grazie! Ti risponderemo al più presto 🕯️";
  e.target.reset();
});

// ===== Init =====
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();

// ===== App installabile (PWA) =====
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

const installBtn = $("#install-btn");
let installEvent = null;
const isStandalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;

// Android / Chrome / Edge: mostra il bottone "Installa l'app"
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvent = e;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!installEvent) return;
  installEvent.prompt();
  const { outcome } = await installEvent.userChoice;
  if (outcome === "accepted") installBtn.hidden = true;
  installEvent = null;
});
addEventListener("appinstalled", () => {
  installBtn.hidden = true;
  toast("Candela Magica è sulla tua schermata Home ✦");
});

// iPhone / iPad: Safari non ha il bottone automatico, mostriamo le istruzioni una volta
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let tipSeen = false;
try { tipSeen = localStorage.getItem("cm-ios-tip") === "1"; } catch {}
if (isIOS && !isStandalone && !tipSeen) setTimeout(() => ($("#ios-tip").hidden = false), 4000);
$(".ios-close").addEventListener("click", () => {
  $("#ios-tip").hidden = true;
  try { localStorage.setItem("cm-ios-tip", "1"); } catch {}
});

// Barra in basso dell'app
$(".tab-cart").addEventListener("click", () => openCart(true));
