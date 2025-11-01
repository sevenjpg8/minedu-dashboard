import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase
    .from("surveys")
    .select("id, title, starts_at, ends_at, is_active")
    .order("id", { ascending: true })

  if (error) {
    console.error("Error cargando encuestas:", error)
    return NextResponse.json({ error: "No se pudieron cargar las encuestas" }, { status: 500 })
  }

  return NextResponse.json(data)
}
