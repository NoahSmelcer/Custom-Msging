// Private messaging must not be stored in Cache Storage. This worker exists only to
// support PWA installation and can be extended later for a carefully reviewed app shell.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* network is the source of truth */ });
