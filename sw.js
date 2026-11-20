// Service worker di Candela Magica: rende il sito installabile e utilizzabile offline.
// Quando modifichi il sito, aumenta il numero di versione per aggiornare la cache.
const VERSION = "cm-v2";
const SHELL = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.webmanifest",
  "assets/logo-mark.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Pagine: prima la rete (contenuti aggiornati), se offline la copia salvata.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { caches.open(VERSION).then((c) => c.put("index.html", res.clone())); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // File del sito e font di Google: copia salvata subito, aggiornata in background.
  if (url.origin === location.origin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(req, { ignoreSearch: url.origin === location.origin });
        const network = fetch(req)
          .then((res) => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
