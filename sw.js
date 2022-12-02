// imports
importScripts("js/sw-Utils.js");

const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v4";
const INMUTABLE_CACHE = "inmutable-v4";

const APP_SHELL = [
  "/",
  "index.html",
  "css/style.css",
  "img/favicon.ico",
  "img/avatars/hulk.jpg",
  "img/avatars/ironman.jpg",
  "img/avatars/spiderman.jpg",
  "img/avatars/thor.jpg",
  "img/avatars/wolverine.jpg",
  "js/app.js",
  "js/functions.js",
  "js/sw-Utils.js",
  "js/libs/plugins/mdtoast.min.js",
  "js/libs/plugins/mdtoast.min.css",
];

const APP_SHELL_INMUTABLE = [
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
  "css/animate.css",
  "js/libs/jquery.js",
  "https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js",
  "https://cdn.tailwindcss.com",
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches.open(STATIC_CACHE).then((cache) => {
    cache.addAll(APP_SHELL);
  });
  const cacheInmutable = caches.open(INMUTABLE_CACHE).then((cache) => {
    cache.addAll(APP_SHELL_INMUTABLE);
  });
  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("activate", (e) => {
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes("static")) {
        return caches.delete(key);
      }

      if (key !== DYNAMIC_CACHE && key.includes("dynamic")) {
        return caches.delete(key);
      }
    });
  });
  e.waitUntil(respuesta);
});

self.addEventListener("fetch", (e) => {
  const respuesta = caches.match(e.request).then((resp) => {
    if (resp) {
      return resp;
    } else {
      return fetch(e.request).then((newResp) => {
        return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newResp);
      });
    }
  });
  e.respondWith(respuesta);
});
