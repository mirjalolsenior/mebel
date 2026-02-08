"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

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
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    setIsPushSupported("serviceWorker" in navigator && "PushManager" in window)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    registerServiceWorker()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      // Use environment check to detect preview mode
      if (typeof window !== "undefined" && window.location.hostname.includes("vusercontent")) {
        console.log("[v0] Service Worker skipped in preview environment - using local notifications only")
        return
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        console.log("[v0] Service Worker registered:", registration)

        if (isPushSupported) {
          const subscription = await registration.pushManager.getSubscription()
          setIsSubscribed(!!subscription)
        }

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000) // Check every minute
      }
    } catch (error) {
      console.error("[v0] Service Worker registration failed:", error)
    }
  }

  const subscribeToPush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("[v0] Push notifications not supported")
        return
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const response = await fetch("/api/push-public-key")
        const { publicKey } = await response.json()

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        // Send subscription to server
        const subscribeResponse = await fetch("/api/push-subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        })

        if (subscribeResponse.ok) {
          setIsSubscribed(true)
          console.log("[v0] Successfully subscribed to push notifications")
        }
      } else {
        setIsSubscribed(true)
        console.log("[v0] Already subscribed to push notifications")
      }
    } catch (error) {
      console.error("[v0] Push subscription error:", error)
      setIsSubscribed(false)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Notify server about unsubscription
        await fetch("/api/push-unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        // Unsubscribe from push manager
        await subscription.unsubscribe()
        setIsSubscribed(false)
        console.log("[v0] Unsubscribed from push notifications")
      }
    } catch (error) {
      console.error("[v0] Push unsubscription error:", error)
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
    }
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        if (isPushSupported) {
          await subscribeToPush()
        }
      }
    } catch (error) {
      console.error("[v0] Notification permission error:", error)
    }
  }

  const sendNotification = (title: string, body: string) => {
    if (notificationPermission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.png",
        badge: "/logo.png",
        vibrate: [100, 50, 100],
      })
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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
