"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getFCMToken, onFCMMessage, getFirebaseMessaging } from "@/lib/firebase/config"

interface PWAContextType {
  isInstalled: boolean
  isInstallable: boolean
  installPWA: () => Promise<void>
  notificationPermission: NotificationPermission
  requestNotificationPermission: () => Promise<void>
  sendNotification: (title: string, body: string) => void
  scheduleNotification: (title: string, body: string, delayMinutes: number) => void
  subscribeToPush: () => Promise<void>
  unsubscribeFromPush: () => Promise<void>
  isPushSupported: boolean
  isSubscribed: boolean
  platform: "ios" | "android" | "unknown"
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [platform, setPlatform] = useState<"ios" | "android" | "unknown">("unknown")

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      console.log("[PWA] App running in standalone mode (installed)")
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
      console.log("[PWA] Current notification permission:", Notification.permission)
    }

    // Check if push is supported - CRITICAL: Must check BOTH serviceWorker AND PushManager
    const hasPushSupport = "serviceWorker" in navigator && "PushManager" in window
    setIsPushSupported(hasPushSupport)
    console.log("[PWA] Push API support:", hasPushSupport)

    // Listen for install prompt - IMPORTANT: Only on Android, iOS shows "Add to Home Screen" differently
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log("[PWA] Install prompt available (Android only)")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    detectPlatform()
    registerServiceWorker()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const detectPlatform = () => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform("ios")
      console.log("[PWA] Detected iOS platform")
    } else if (/Android/.test(ua)) {
      setPlatform("android")
      console.log("[PWA] Detected Android platform")
    } else {
      console.log("[PWA] Unknown platform - may be desktop or other device")
    }
  }

  const registerServiceWorker = async () => {
    try {
      // Skip in preview environment
      if (typeof window !== "undefined" && window.location.hostname.includes("vusercontent")) {
        console.log("[PWA] Service Worker skipped in preview environment")
        return
      }

      if (!("serviceWorker" in navigator)) {
        console.warn("[PWA] Service Workers not supported in this browser")
        return
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/", // Critical: Explicit scope ensures SW handles all routes
      })
      console.log("[PWA] Service Worker registered successfully:", registration.scope)

      // Register Firebase Messaging Service Worker
      if (isPushSupported) {
        try {
          // Register Firebase messaging service worker
          await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
            scope: "/",
          })
          console.log("[PWA] Firebase Messaging Service Worker registered")

          // Check for existing FCM token
          const token = await getFCMToken()
          if (token) {
            setIsSubscribed(true)
            console.log("[PWA] Existing FCM token found on load")
          }

          // Set up message listener
          onFCMMessage((payload) => {
            console.log("[PWA] FCM message received:", payload)
            // Message is handled by service worker, but we can handle foreground messages here
          })
        } catch (error) {
          console.warn("[PWA] Failed to check FCM subscription:", error)
        }
      }

      if (platform === "android" && "periodicSync" in registration) {
        try {
          await registration.periodicSync.register("sync-subscriptions", {
            minInterval: 24 * 60 * 60 * 1000,
          })
          console.log("[PWA] Periodic sync registered for Android")
        } catch (error) {
          console.warn("[PWA] Periodic sync registration failed:", error)
        }
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SUBSCRIPTION_ACTIVE") {
          setIsSubscribed(true)
          console.log("[PWA] Service Worker confirmed subscription is active")
        }
      })

      // Check for updates periodically
      const updateInterval = setInterval(() => {
        registration.update()
      }, 60000)

      return () => clearInterval(updateInterval)
    } catch (error) {
      console.error("[PWA] Service Worker registration failed:", error)
    }
  }

  const subscribeToPush = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Workers are not supported")
      }

      if (!("PushManager" in window)) {
        throw new Error("Push Manager is not supported")
      }

      console.log("[PWA] Starting FCM subscription process...")

      // Ensure Firebase Messaging Service Worker is registered
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        })
        console.log("[PWA] Firebase Messaging Service Worker registered")
      } catch (error) {
        console.warn("[PWA] Firebase Messaging SW registration warning:", error)
      }

      // Get FCM token
      const token = await getFCMToken()

      if (!token) {
        throw new Error("Failed to get FCM token. Check notification permissions.")
      }

      console.log("[PWA] FCM token obtained, sending to server...")

      // Generate device ID (simple UUID-like string)
      let deviceId = localStorage.getItem("fcm_device_id")
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("fcm_device_id", deviceId)
      }

      // Send token to server
      const subscribeResponse = await fetch("/api/fcm/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          platform,
          userAgent: navigator.userAgent,
          deviceId,
        }),
      })

      if (subscribeResponse.ok) {
        setIsSubscribed(true)
        console.log("[PWA] Successfully subscribed to FCM push notifications")
      } else {
        const errorData = await subscribeResponse.json()
        throw new Error(errorData.error || "Failed to save FCM token on server")
      }

      // Set up message listener for foreground messages
      onFCMMessage((payload) => {
        console.log("[PWA] FCM foreground message received:", payload)
      })
    } catch (error: any) {
      console.error("[PWA] FCM subscription error:", error)

      // Provide helpful error messages
      if (error.code === "messaging/permission-default") {
        throw new Error("Notification permission not granted. Please grant permission first.")
      } else if (error.code === "messaging/permission-blocked") {
        const errorMsg =
          platform === "ios"
            ? "iOS: Notifications are blocked. Check Settings > Notifications > Sherdor Mebel"
            : "Notifications are blocked. Check browser settings"
        throw new Error(errorMsg)
      } else if (error.message?.includes("token")) {
        throw new Error("Failed to get FCM token. Check Firebase configuration.")
      }

      setIsSubscribed(false)
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        return
      }

      // Get current FCM token
      const token = await getFCMToken()

      if (token) {
        // Notify server to mark token as inactive
        try {
          await fetch("/api/fcm/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              platform,
              isActive: false,
            }),
          })
        } catch (error) {
          console.warn("[PWA] Failed to notify server of unsubscription:", error)
        }

        // Delete token from Firebase (optional - we'll just mark as inactive in DB)
        setIsSubscribed(false)
        console.log("[PWA] Unsubscribed from FCM push notifications")
      }
    } catch (error) {
      console.error("[PWA] FCM unsubscription error:", error)
    }
  }

  const installPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstallable(false)
      setIsInstalled(true)
      setDeferredPrompt(null)
      console.log("[PWA] App installed successfully")
    }
  }

  // Only request after user interaction (button click in NotificationManager)
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("[PWA] Notifications not supported on this browser")
      return
    }

    try {
      console.log("[PWA] Requesting notification permission...")

      if (platform === "ios") {
        console.log("[PWA] iOS: Permission request initiated")
      }

      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      console.log("[PWA] Notification permission result:", permission)

      if (permission === "granted") {
        console.log("[PWA] Permission granted, attempting to subscribe to push...")
        if (isPushSupported) {
          try {
            await subscribeToPush()
          } catch (error) {
            console.error("[PWA] Failed to subscribe after permission grant:", error)
          }
        }
      } else if (permission === "denied") {
        console.warn("[PWA] Notification permission denied by user")
      }
    } catch (error) {
      console.error("[PWA] Notification permission error:", error)
    }
  }

  const sendNotification = (title: string, body: string) => {
    if (notificationPermission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          vibrate: [100, 50, 100],
        })
        console.log("[PWA] Notification sent:", title)
      } catch (error) {
        console.error("[PWA] Failed to send notification:", error)
      }
    }
  }

  const scheduleNotification = (title: string, body: string, delayMinutes: number) => {
    if (notificationPermission === "granted") {
      setTimeout(
        () => {
          sendNotification(title, body)
        },
        delayMinutes * 60 * 1000,
      )
    }
  }

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isInstallable,
        installPWA,
        notificationPermission,
        requestNotificationPermission,
        sendNotification,
        scheduleNotification,
        subscribeToPush,
        unsubscribeFromPush,
        isPushSupported,
        isSubscribed,
        platform,
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider")
  }
  return context
}

