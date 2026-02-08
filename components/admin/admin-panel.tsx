"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Database, Users, Package, FileText, CheckSquare, Edit2 } from "lucide-react"
import { AdminSelectiveDeletion } from "./admin-selective-deletion"
import { AdminEditPanel } from "./admin-edit-panel"

interface AdminPanelProps {
  onLogout: () => void
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("edit")

  return (
    <div className="min-h-screen p-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Tizim boshqaruvi va sozlamalari</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="animate-float bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Chiqish
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card animate-slideIn">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jami foydalanuvchilar</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Users className="w-8 h-8 text-primary animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slideIn" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktiv modullar</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Package className="w-8 h-8 text-primary animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slideIn" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ma'lumotlar bazasi</p>
                  <p className="text-2xl font-bold">Faol</p>
                </div>
                <Database className="w-8 h-8 text-green-500 animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slideIn" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hisobotlar</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FileText className="w-8 h-8 text-primary animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Tahrirlash</TabsTrigger>
            <TabsTrigger value="selective">Tanlab ochirish</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Card className="glass-card animate-slideIn border-blue-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Edit2 className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-blue-700">Ma'lumotlarni tahrirlash</CardTitle>
                </div>
                <CardDescription className="text-blue-600">
                  Xatoliklarni tuzatish va ma'lumotlarni yangilash
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminEditPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selective" className="space-y-6">
            <Card className="glass-card animate-slideIn border-orange-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-orange-700">Tanlab ochirish</CardTitle>
                </div>
                <CardDescription className="text-orange-600">
                  Har bir jadvaldan kerakli elementlarni tanlab oching. Xavfsizroq usul.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSelectiveDeletion />
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  )
}
