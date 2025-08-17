"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Service worker functionality will be available when deployed to production
    console.log("[PWA] Service worker registration disabled in preview environment")

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error)
    }

    return false
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("[PWA] This browser does not support notifications")
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission === "granted"
    } catch (error) {
      console.error("[PWA] Notification permission request failed:", error)
      return false
    }
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationPermission !== "granted") {
      console.warn("[PWA] Notification permission not granted")
      return
    }

    try {
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        ...options,
      })
    } catch (error) {
      console.error("[PWA] Failed to show notification:", error)
    }
  }

  return {
    isInstallable,
    isInstalled,
    installApp,
    notificationPermission,
    requestNotificationPermission,
    showNotification,
  }
}
