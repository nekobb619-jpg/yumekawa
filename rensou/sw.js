/* ことばつなぎ：オフライン用。ファイルを かえたら V を 上げる。 */
var V = "kt-2026-11-18-1";
var FILES = ["./", "index.html", "words.js", "manifest.json", "icon-192.png", "icon-512.png", "icon-180.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // ネットが あれば 新しい ものを とって キャッシュも 更新、なければ キャッシュ
  e.respondWith(fetch(e.request).then(function (r) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); return r; }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
