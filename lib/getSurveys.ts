// lib/getSurveys.ts
import { supabase } from "./supabaseClient"

export interface Survey {
  id: number
  title: string
  description: string
  unique_link_slug: string
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}


export async function getSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from("surveys")
    .select("id, title, description, unique_link_slug, starts_at, ends_at, is_active, created_at, updated_at")
    .order("id", { ascending: true })

  if (error) {
    console.error("Error al obtener encuestas:", error)
    return []
  }

  return data || []
}

