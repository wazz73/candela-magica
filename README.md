# Candela Magica

Sito vetrina per candele artigianali. HTML, CSS e JavaScript puri, senza build.

Per vederlo apri `index.html` nel browser.

- `index.html`: struttura e testi
- `style.css`: grafica
- `script.js`: prodotti (array `PRODUCTS` in cima al file), carrello, animazioni

## App (PWA)

Il sito è anche un'app installabile su telefono e computer (`manifest.webmanifest`, `sw.js`, icone in `assets/icons/`).
Funziona solo quando il sito è pubblicato su **https** (o su `localhost`); aprendo `index.html` come file non si installa.

Prova in locale:

    python3 -m http.server 8000

poi apri http://localhost:8000.

Quando modifichi il sito, aumenta `VERSION` in `sw.js` così chi ha l'app riceve l'aggiornamento.
