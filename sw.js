/* Service worker: cache ya ganda la app ili ifunguke offline. Video hazihifadhiwi (kuokoa nafasi). */
var CACHE = "youflix-v11";
var SHELL = ["./", "index.html", "style.css", "app.js", "data.js", "manifest.json", "icon-192.png", "icon-512.png", "img/vazi.jpg", "img/ayesha.jpg", "img/logo-h.png", "img/logo.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  var u = new URL(r.url);
  var isFont = u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (r.method !== "GET" || (u.origin !== location.origin && !isFont)) return; // video na picha za nje: mtandao tu
  e.respondWith(caches.match(r).then(function (hit) {
    var net = fetch(r).then(function (res) {
      if (res.ok || res.type === "opaque") { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
