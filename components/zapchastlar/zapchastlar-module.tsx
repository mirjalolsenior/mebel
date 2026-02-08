"use client"

import { useState } from "react"
import { ZapchastlarStats } from "./zapchastlar-stats"
import { ZapchastlarForm } from "./zapchastlar-form"
import { ZapchastlarHistory } from "./zapchastlar-history"
import { ZapchastlarBalance } from "./zapchastlar-balance"
import { Button } from "@/components/ui/button"
import { BarChart3, Package } from "lucide-react"

export function ZapchastlarModule() {
  const [activeView, setActiveView] = useState<"tarix" | "ombor">("tarix")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <ZapchastlarStats refreshTrigger={refreshTrigger} />

      <ZapchastlarForm onSuccess={handleSuccess} />

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={activeView === "tarix" ? "default" : "outline"}
          onClick={() => setActiveView("tarix")}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Tarix
        </Button>
        <Button
          variant={activeView === "ombor" ? "default" : "outline"}
          onClick={() => setActiveView("ombor")}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Ombor
        </Button>
      </div>

      {activeView === "tarix" ? (
        <ZapchastlarHistory refreshTrigger={refreshTrigger} />
      ) : (
        <ZapchastlarBalance refreshTrigger={refreshTrigger} />
      )}
    </div>
  )
}
