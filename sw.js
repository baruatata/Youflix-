/* Service worker: ganda la app (na faili za /assets zilizojengwa na Vite) zinahifadhiwa ili app ifunguke offline.
   Video na picha za nje hazihifadhiwi (kuokoa nafasi). Fonti za Google zinahifadhiwa baada ya mara ya kwanza. */
var CACHE = "youflix-react-v1";
var SHELL = ["/", "/index.html", "/manifest.json", "/icon-192.png", "/icon-512.png",
  "/img/vazi.jpg", "/img/ayesha.jpg", "/img/logo-h.png", "/img/logo.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  var isFont = u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (r.method !== "GET" || (u.origin !== location.origin && !isFont)) return;
  e.respondWith(caches.match(r).then(function (hit) {
    var net = fetch(r).then(function (res) {
      if (res.ok || res.type === "opaque") { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, copy); }); }
      return res;
    }).catch(function () { return hit || (r.mode === "navigate" ? caches.match("/index.html") : undefined); });
    return hit || net;
  }));
});
