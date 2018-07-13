const staticCacheName = 'restaurant-cache-v2';

const imageCache = 'restaurant-imgs';


let allCaches = [staticCacheName, imageCache];

const toCache = [
  '/',
  './restaurant.html',
  './css/styles.css',
  './js/bundle_main.js',
  './js/bundle_restaurant.js',
  './img/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName)
    .then((cache) => {
      console.log("the cache is open");
      return cache.addAll(toCache);
    }).catch((err) => console.log("Error installing", err))
  );
});


self.addEventListener('fetch', (event) => {
  var url = new URL(event.request.url);

  if(url.pathname.startsWith('/img/')){
    event.respondWith(serveImage(event.request));
    return;
  }

    event.respondWith(
        caches.open(staticCacheName)
        .then((cache)  => {
            return cache.match(event.request)
            .then((response)  => {
                return response || fetch(event.request)
                .then((response) => {
                  let responseCopy = response.clone();
                    cache.put(event.request, responseCopy);
                    return response;
                });
            });
        })
    );
});


self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.filter(function(key) {
          return key.startsWith('restaurant-') &&
                 !allCaches.includes(key);
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
       self.skipWaiting();
    }
});

//Saves images in seperate cache
function serveImage(request) {

  return caches.open(imageCache)
  .then((cache) => {
    return cache.match(request.url)
    .then((response) => {
      if(response) return response;
      return fetch(request.url)
      .then((networkResponse) => {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      }).catch((err) => console.log('sw serve image error', err));
    });
  });
}

/* I was greatly helped with this by the old files from the "Introducing the Service Worker" lessons from earlier in the course and 
this page from Google https://developers.google.com/web/fundamentals/primers/service-workers/*/