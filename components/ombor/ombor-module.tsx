"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Zap, Ribbon } from "lucide-react"
import { TovarlarModule } from "@/components/tovarlar/tovarlar-module"
import { ZapchastlarModule } from "@/components/zapchastlar/zapchastlar-module"
import { KronkalarModule } from "@/components/kronkalar/kronkalar-module"

export function OmborModule() {
  const [activeSection, setActiveSection] = useState<"tovarlar" | "zapchastlar" | "kronkalar">("tovarlar")

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ombor bo'limlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeSection === "tovarlar" ? "default" : "outline"}
              onClick={() => setActiveSection("tovarlar")}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Tovarlar
            </Button>
            <Button
              variant={activeSection === "zapchastlar" ? "default" : "outline"}
              onClick={() => setActiveSection("zapchastlar")}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Zapchastlar
            </Button>
            <Button
              variant={activeSection === "kronkalar" ? "default" : "outline"}
              onClick={() => setActiveSection("kronkalar")}
              className="flex items-center gap-2"
            >
              <Ribbon className="h-4 w-4" />
              Kronkalar
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeSection === "tovarlar" && <TovarlarModule />}
      {activeSection === "zapchastlar" && <ZapchastlarModule />}
      {activeSection === "kronkalar" && <KronkalarModule />}
    </div>
  )
}
