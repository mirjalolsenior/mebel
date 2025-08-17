"use client"

import { useState } from "react"
import { usePWA } from "@/hooks/use-pwa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"

export function InstallPrompt() {
  const { isInstallable, installApp, isInstalled } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || isInstalled || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (!success) {
      setDismissed(true)
    }
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Ilovani o'rnatish</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription>
          Sherdor Mebel ilovasini telefoningizga o'rnating va offline rejimda ham foydalaning.
        </CardDescription>
        <div className="flex space-x-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            O'rnatish
          </Button>
          <Button variant="outline" onClick={() => setDismissed(true)}>
            Keyinroq
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
