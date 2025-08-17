"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"

type Order = Database["public"]["Tables"]["orders"]["Row"]
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"]

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  // Create order
  const createOrder = async (order: OrderInsert) => {
    try {
      const { data, error } = await supabase.from("orders").insert(order).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Xatolik yuz berdi" }
    }
  }

  // Update order
  const updateOrder = async (id: string, updates: OrderUpdate) => {
    try {
      const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Xatolik yuz berdi" }
    }
  }

  // Delete order
  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id)
      if (error) throw error
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" }
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          fetchOrders() // Refetch all orders on any change
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  }
}
