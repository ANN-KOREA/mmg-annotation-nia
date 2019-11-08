(function () {
    'use strict';
    self.addEventListener('activate', event => {
        event.waitUntil(clients.claim());
    });
    self.addEventListener('fetch', function (event) {
        event.respondWith(
            caches.open('dcm').then(function (cache) {
                return cache.match(event.request.url).then(function (response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(function (response) {
                        if (event.request.url.indexOf('.dcm') > -1) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    });
                });
            })
        );
    });
})();