const CACHE_NAME = 'sala-ana-v1';
const urlsToCache = [
  '/',
  '/login',
  '/alunos-adm',
  '/agendamento',
  '/relatorio-diario'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
