"use client"

import { useEffect } from "react"
import { usePWA } from "./use-pwa"
import { useProducts } from "./use-products"
import { useOrders } from "./use-orders"
import { isToday, isTomorrow } from "date-fns"

export function useDueDateNotifications() {
  const { showNotification, notificationPermission } = usePWA()
  const { products } = useProducts()
  const { orders } = useOrders()

  useEffect(() => {
    if (notificationPermission !== "granted") return

    const checkDueDates = () => {
      const now = new Date()
      const todayNotifications: string[] = []
      const tomorrowNotifications: string[] = []

      // Check products
      products.forEach((product) => {
        if (!product.due_date) return

        const dueDate = new Date(product.due_date)

        if (isToday(dueDate)) {
          todayNotifications.push(`Tovar: ${product.name}`)
        } else if (isTomorrow(dueDate)) {
          tomorrowNotifications.push(`Tovar: ${product.name}`)
        }
      })

      // Check orders
      orders.forEach((order) => {
        if (!order.due_date) return

        const dueDate = new Date(order.due_date)

        if (isToday(dueDate)) {
          todayNotifications.push(`Zakaz: ${order.type} #${order.number}`)
        } else if (isTomorrow(dueDate)) {
          tomorrowNotifications.push(`Zakaz: ${order.type} #${order.number}`)
        }
      })

      // Show today notifications
      if (todayNotifications.length > 0) {
        const title = "Bugun berish kerak!"
        const body =
          todayNotifications.length === 1
            ? todayNotifications[0]
            : `${todayNotifications.length} ta element bugun berish kerak`

        showNotification(title, {
          body,
          tag: "due-today",
          requireInteraction: true,
        })
      }

      // Show tomorrow notifications
      if (tomorrowNotifications.length > 0) {
        const title = "Ertaga berish kerak"
        const body =
          tomorrowNotifications.length === 1
            ? tomorrowNotifications[0]
            : `${tomorrowNotifications.length} ta element ertaga berish kerak`

        showNotification(title, {
          body,
          tag: "due-tomorrow",
        })
      }
    }

    // Check immediately
    checkDueDates()

    // Set up interval to check every hour
    const interval = setInterval(checkDueDates, 60 * 60 * 1000)

    // Also check at specific times (9 AM and 6 PM)
    const checkAtSpecificTimes = () => {
      const now = new Date()
      const hour = now.getHours()

      if (hour === 9 || hour === 18) {
        checkDueDates()
      }
    }

    const timeInterval = setInterval(checkAtSpecificTimes, 60 * 1000) // Check every minute

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [products, orders, showNotification, notificationPermission])
}
