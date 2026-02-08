// Service Worker with Web Push API support for Android and iOS PWA

const CACHE_NAME = "sherdor-mebel-v3"
const urlsToCache = ["/", "/manifest.json", "/mebel-sherdor-logo.png"]
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cache opened")
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn("[SW] Some files failed to cache:", err)
          return Promise.resolve()
        })
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const cache = caches.open(CACHE_NAME)
          cache.then((c) => c.put(event.request, response.clone()))
          return response.clone()
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((response) => response || new Response("Offline"))
      }),
  )
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event)

  let notificationData = {
    title: "Sherdor Mebel",
    body: "Yangi xabar",
    icon: "/mebel-sherdor-logo.png",
    badge: "/mebel-sherdor-logo.png",
    vibrate: [100, 50, 100],
    tag: "sherdor-mebel-notification",
    requireInteraction: true,
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      notificationData.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: {
        dateOfArrival: Date.now(),
        url: "/",
      },
      actions: [
        {
          action: "explore",
          title: "Ko'rish",
          icon: "/mebel-sherdor-logo.png",
        },
        {
          action: "close",
          title: "Yopish",
          icon: "/mebel-sherdor-logo.png",
        },
      ],
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)
  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus()
          }
        }
        // Open new window if no match
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed by user:", event.notification.tag)
})

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data.type === "SYNC_SUBSCRIPTION") {
    // Handle subscription sync if needed
    console.log("[SW] Syncing subscription status")
  }
})
