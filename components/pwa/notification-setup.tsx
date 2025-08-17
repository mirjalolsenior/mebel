"use client"

import { useState } from "react"
import { usePWA } from "@/hooks/use-pwa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, X, BellRing } from "lucide-react"

export function NotificationSetup() {
  const { notificationPermission, requestNotificationPermission } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (notificationPermission === "granted" || notificationPermission === "denied" || dismissed) {
    return null
  }

  const handleEnable = async () => {
    const granted = await requestNotificationPermission()
    if (!granted) {
      setDismissed(true)
    }
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <BellRing className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Bildirishnomalar</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-blue-800 dark:text-blue-200">
          Muddat yaqinlashganda bildirishnoma olish uchun ruxsat bering. Bugun va ertaga berish kerak bo'lgan tovarlar
          haqida xabar beramiz.
        </CardDescription>
        <div className="flex space-x-2">
          <Button onClick={handleEnable} className="bg-blue-600 hover:bg-blue-700">
            <Bell className="h-4 w-4 mr-2" />
            Ruxsat berish
          </Button>
          <Button variant="outline" onClick={() => setDismissed(true)}>
            Hozir emas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
