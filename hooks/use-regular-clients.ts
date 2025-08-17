"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"

type RegularClient = Database["public"]["Tables"]["regular_clients"]["Row"]
type RegularClientInsert = Database["public"]["Tables"]["regular_clients"]["Insert"]
type RegularClientUpdate = Database["public"]["Tables"]["regular_clients"]["Update"]

export function useRegularClients() {
  const [regularClients, setRegularClients] = useState<RegularClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch regular clients
  const fetchRegularClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("regular_clients")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRegularClients(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  // Create regular client
  const createRegularClient = async (client: RegularClientInsert) => {
    try {
      const { data, error } = await supabase.from("regular_clients").insert(client).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Xatolik yuz berdi" }
    }
  }

  // Update regular client
  const updateRegularClient = async (id: string, updates: RegularClientUpdate) => {
    try {
      const { data, error } = await supabase.from("regular_clients").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Xatolik yuz berdi" }
    }
  }

  // Delete regular client
  const deleteRegularClient = async (id: string) => {
    try {
      const { error } = await supabase.from("regular_clients").delete().eq("id", id)
      if (error) throw error
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" }
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchRegularClients()

    const channel = supabase
      .channel("regular-clients-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "regular_clients",
        },
        (payload) => {
          fetchRegularClients() // Refetch all regular clients on any change
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRegularClients])

  return {
    regularClients,
    loading,
    error,
    createRegularClient,
    updateRegularClient,
    deleteRegularClient,
    refetch: fetchRegularClients,
  }
}
