export const dynamic = "force-dynamic"

export async function GET() {
  // Get Firebase config from environment variables
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  }

  const serviceWorkerCode = `
// Firebase Cloud Messaging Service Worker
// This service worker handles FCM push notifications

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  projectId: "${firebaseConfig.projectId}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
  appId: "${firebaseConfig.appId}",
  measurementId: "${firebaseConfig.measurementId}"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background message:', payload)

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Sherdor Mebel'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Yangi xabar',
    icon: payload.notification?.icon || payload.data?.icon || '/icon-192.jpg',
    badge: payload.notification?.badge || payload.data?.badge || '/icon-192.jpg',
    tag: payload.data?.tag || 'sherdor-mebel',
    requireInteraction: payload.data?.requireInteraction !== false,
    data: {
      url: payload.data?.url || payload.data?.click_action || '/',
      ...payload.data
    }
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Look for existing window with matching URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      
      // No existing window, open new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }).catch((error) => {
      console.error('[FCM SW] Error handling notification click:', error)
    })
  )
})

console.log('[FCM SW] Firebase Messaging Service Worker initialized')
`

  return new Response(serviceWorkerCode, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
