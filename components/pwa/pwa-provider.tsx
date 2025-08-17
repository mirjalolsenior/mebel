"use client"

import type React from "react"

import { useEffect } from "react"
import { useDueDateNotifications } from "@/hooks/use-due-date-notifications"

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  // Initialize due date notifications
  useDueDateNotifications()

  useEffect(() => {
    // Prevent zoom on double tap for better mobile experience
    let lastTouchEnd = 0
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener("touchend", preventZoom, { passive: false })

    return () => {
      document.removeEventListener("touchend", preventZoom)
    }
  }, [])

  return <>{children}</>
}
