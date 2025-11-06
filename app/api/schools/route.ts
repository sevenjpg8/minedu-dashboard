import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ugelId = searchParams.get("ugelId")

  const query = supabase.from("school_new").select("id, name")

  if (ugelId) query.eq("ugel_id", ugelId)

  const { data, error } = await query.order("name", { ascending: true })

  if (error) {
    console.error("Error cargando colegios:", error)
    return NextResponse.json({ error: "No se pudieron cargar los colegios" }, { status: 500 })
  }

  return NextResponse.json(data)
}
