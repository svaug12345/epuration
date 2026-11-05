// Service worker : garde une copie des pages visitées pour la consultation hors ligne.
//
// Stratégie « le réseau d'abord » : on demande toujours la version récente,
// et on ne se sert de la copie que si le réseau ne répond pas. Ainsi, une mise à jour
// du site est visible tout de suite, ce qui évite le piège classique des vieilles pages.
const VERSION = '1.3.0';
const CACHE = `epuration-${VERSION}`;

self.addEventListener('install', () => self.skipWaiting());

// À l'activation, on supprime les copies des versions précédentes.
self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evenement) => {
  const { request } = evenement;
  const url = new URL(request.url);
  // Seules les lectures de notre propre site sont concernées. Les vidéos et les
  // présentations sont exclues : trop lourdes pour la mémoire du téléphone.
  if (request.method !== 'GET' || url.origin !== location.origin) return;
  if (/\.(mp4|pptx)$/i.test(url.pathname)) return;

  evenement.respondWith(
    fetch(request)
      .then((reponse) => {
        if (reponse.ok) {
          const copie = reponse.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copie));
        }
        return reponse;
      })
      .catch(() => caches.match(request).then((copie) => copie ?? Response.error())),
  );
});
