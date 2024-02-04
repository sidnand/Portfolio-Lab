const CACHE_NAME = 'portfolio-lab-cache';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.css',
    '/src/js/main.js',
    '/src/js/form.js',
    '/src/js/ui.js',
    '/src/js/util.js',
    '/src/img/icon.svg',
    '/src/py/main.py',

    '/src/libs/css/pyscript_2022.12.1.css',
    '/src/libs/js/pyodide_0.22.1.js',
    '/src/libs/js/pyscript_2022.12.1.js',

    '/src/libs/wheels/portfolioperformance-1.0.0-py3-none-any.whl',
    '/src/libs/wheels/quadprog-0.1.11-cp310-cp310-emscripten_3_1_27_wasm32.whl',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});