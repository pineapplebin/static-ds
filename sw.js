var CACHE_NAME = "v4";

var urlsToCache = [
  "/",
  "index.html",
  "manifest.json",
  "assets/app.js",
  "assets/localforage.js",
  "assets/pako.min.js",
  "assets/dark.css",
  "assets/icon.png",
  "assets/nds.js",
  "assets/nds.wasm",
];

self.addEventListener("install", function (event) {
  console.log("Updating...");
  var urlsAddVersion = urlsToCache.map(function (url) {
    return url + "?ver=" + CACHE_NAME;
  });
  // Perform install steps
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log("Opened cache");
        return cache.addAll(urlsAddVersion);
      })
      .then(() => {
        console.log("Cache downloaded");
        self.skipWaiting();
      })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches
      .match(event.request, {
        ignoreSearch: true,
      })
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        console.log("cache miss", event.request.url);
        return fetch(event.request);
      })
  );
});

self.addEventListener("activate", function (event) {
  console.log("activated, remove unused cache...");
  var cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            console.log(cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  postMsg({ msg: "Updated!" });
});

function postMsg(obj) {
  clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((arr) => {
      for (client of arr) {
        client.postMessage(obj);
      }
    });
}
