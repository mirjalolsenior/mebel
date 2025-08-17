import { NextResponse } from "next/server"

export async function GET() {
  const swContent = `
const CACHE_NAME = "sherdor-mebel-v1"
const STATIC_CACHE_URLS = [
  "/",
  "/orders",
  "/clients",
  "/regular-clients",
  "/admin",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log("[SW] Static assets cached")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
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
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - network first for API calls, cache first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle Supabase API calls with network-first strategy
  if (url.hostname.includes("supabase")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request)
        }),
    )
    return
  }

  // Handle static assets with cache-first strategy
  if (request.method === "GET") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
      }),
    )
  }
})

// Push notification event
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  let data = {}
  if (event.data) {
    data = event.data.json()
  }

  const options = {
    body: data.body || "Sherdor Mebel bildirishnomasi",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: "view",
        title: "Ko'rish",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Yopish",
      },
    ],
    requireInteraction: true,
    tag: data.tag || "sherdor-notification",
  }

  event.waitUntil(self.registration.showNotification(data.title || "Sherdor Mebel", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked")
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"))
  } else if (event.action === "close") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any pending offline actions here
      console.log("[SW] Processing background sync"),
    )
  }
})
`

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
