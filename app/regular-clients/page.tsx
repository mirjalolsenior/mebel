"use client"

import { useState } from "react"
import { useRegularClients } from "@/hooks/use-regular-clients"
import { RegularClientCard } from "@/components/clients/regular-client-card"
import { ClientForm } from "@/components/clients/client-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Database } from "@/lib/supabase/client"

type RegularClient = Database["public"]["Tables"]["regular_clients"]["Row"]

export default function RegularClientsPage() {
  const { regularClients, loading, error, createRegularClient, updateRegularClient, deleteRegularClient } =
    useRegularClients()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<RegularClient | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (client: RegularClient) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu doimiy mijozni o'chirishni xohlaysizmi?")) {
      const { error } = await deleteRegularClient(id)
      if (error) {
        alert("Xatolik: " + error)
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingClient(null)
  }

  const handleFormSubmit = async (data: any) => {
    if (editingClient) {
      return await updateRegularClient(editingClient.id, data)
    } else {
      return await createRegularClient(data)
    }
  }

  // Filter clients
  const filteredClients = regularClients.filter((client) =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate stats
  const totalDelivered = regularClients.reduce((sum, client) => sum + client.delivered_count, 0)
  const totalTapeUsed = regularClients.reduce((sum, client) => sum + client.tape_used_m, 0)
  const totalPaid = regularClients.reduce((sum, client) => sum + client.paid_amount, 0)
  const totalRemaining = regularClients.reduce((sum, client) => sum + client.remaining, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Xatolik: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doimiy mijozlar</h1>
          <p className="text-muted-foreground">Doimiy mijozlar va ularning statistikasi</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Yangi doimiy mijoz</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{totalDelivered}</div>
          <div className="text-sm text-muted-foreground">Jami olib kelgan</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{totalTapeUsed.toFixed(1)}m</div>
          <div className="text-sm text-muted-foreground">Jami lenta</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{totalPaid.toLocaleString()}mln</div>
          <div className="text-sm text-muted-foreground">Jami to'langan</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{totalRemaining.toLocaleString()}mln</div>
          <div className="text-sm text-muted-foreground">Jami qoldi</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Doimiy mijoz nomini qidiring..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{searchTerm ? "Hech narsa topilmadi" : "Hali doimiy mijozlar yo'q"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <RegularClientCard key={client.id} client={client} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Doimiy mijozni tahrirlash" : "Yangi doimiy mijoz"}</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingClient}
            onSuccess={handleFormClose}
            onSubmit={handleFormSubmit}
            title="Doimiy mijoz"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
