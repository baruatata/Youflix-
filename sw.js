/* Service worker: ganda la app. Version mpya huhakikisha iPhone inapata code mpya badala ya kutumia ukurasa wa zamani uliokuwa cache. */
var CACHE = "youflix-react-v2";
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

  // Navigation na index.html lazima vichukue toleo jipya kutoka mtandaoni kwanza.
  var networkFirst = r.mode === "navigate" || u.pathname === "/index.html";
  if (networkFirst) {
    e.respondWith(fetch(r).then(function (res) {
      if (res.ok) caches.open(CACHE).then(function (c) { c.put(r, res.clone()); });
      return res;
    }).catch(function () {
      return caches.match(r).then(function (hit) { return hit || caches.match("/index.html"); });
    }));
    return;
  }

  e.respondWith(caches.match(r).then(function (hit) {
    if (hit) return hit;
    return fetch(r).then(function (res) {
      if (res.ok || res.type === "opaque") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(r, copy); });
      }
      return res;
    }).catch(function () { return undefined; });
  }));
});
