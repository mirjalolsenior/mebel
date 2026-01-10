// Firebase configuration for client-side
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getMessaging, getToken, onMessage, Messaging, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app: FirebaseApp | null = null
let messaging: Messaging | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null
  }

  if (!app) {
    const apps = getApps()
    if (apps.length === 0) {
      // Validate required config
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
        console.warn("[FCM] Firebase config is incomplete. Push notifications will not work.")
        return null
      }
      app = initializeApp(firebaseConfig)
    } else {
      app = apps[0]
    }
  }

  return app
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") {
    return null
  }

  if (messaging) {
    return messaging
  }

  const isMessagingSupported = await isSupported()
  if (!isMessagingSupported) {
    console.warn("[FCM] Firebase Messaging is not supported in this browser")
    return null
  }

  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) {
    return null
  }

  try {
    messaging = getMessaging(firebaseApp)
    return messaging
  } catch (error) {
    console.error("[FCM] Failed to initialize Firebase Messaging:", error)
    return null
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const messagingInstance = await getFirebaseMessaging()
    if (!messagingInstance) {
      return null
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error("[FCM] VAPID key is not configured")
      return null
    }

    // Check if service worker is registered
    if (!("serviceWorker" in navigator)) {
      console.error("[FCM] Service Workers not supported")
      return null
    }

    const registration = await navigator.serviceWorker.ready

    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      console.log("[FCM] FCM Token obtained:", token.substring(0, 20) + "...")
      return token
    } else {
      console.warn("[FCM] No registration token available")
      return null
    }
  } catch (error: any) {
    console.error("[FCM] Error getting FCM token:", error)
    
    // Provide helpful error messages
    if (error.code === "messaging/permission-default") {
      console.error("[FCM] Notification permission not granted. Request permission first.")
    } else if (error.code === "messaging/permission-blocked") {
      console.error("[FCM] Notification permission is blocked. User needs to enable it in browser settings.")
    }
    
    return null
  }
}

export function onFCMMessage(callback: (payload: any) => void): (() => void) | null {
  if (typeof window === "undefined") {
    return null
  }

  getFirebaseMessaging()
    .then((messagingInstance) => {
      if (messagingInstance) {
        onMessage(messagingInstance, callback)
      }
    })
    .catch((error) => {
      console.error("[FCM] Error setting up message listener:", error)
    })

  return () => {
    // Cleanup if needed
  }
}

export { firebaseConfig }
