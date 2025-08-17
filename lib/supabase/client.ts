import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          got_amount: number
          paid_amount: number
          remaining: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          got_amount: number
          paid_amount: number
          due_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          got_amount?: number
          paid_amount?: number
          due_date?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          type: string
          number: string
          got_amount: number
          paid_amount: number
          remaining: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          number: string
          got_amount: number
          paid_amount: number
          due_date?: string | null
        }
        Update: {
          id?: string
          type?: string
          number?: string
          got_amount?: number
          paid_amount?: number
          due_date?: string | null
        }
      }
      regular_clients: {
        Row: {
          id: string
          client_name: string
          delivered_count: number
          tape_used_m: number
          paid_amount: number
          remaining: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          delivered_count: number
          tape_used_m: number
          paid_amount: number
          note?: string | null
        }
        Update: {
          id?: string
          client_name?: string
          delivered_count?: number
          tape_used_m?: number
          paid_amount?: number
          note?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          client_name: string
          delivered_count: number
          tape_used_m: number
          paid_amount: number
          remaining: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          delivered_count: number
          tape_used_m: number
          paid_amount: number
          note?: string | null
        }
        Update: {
          id?: string
          client_name?: string
          delivered_count?: number
          tape_used_m?: number
          paid_amount?: number
          note?: string | null
        }
      }
    }
  }
}
