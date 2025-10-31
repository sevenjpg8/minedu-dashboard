import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dreId = searchParams.get("dreId")

  const query = supabase.from("ugels").select("id, name")

  if (dreId) query.eq("dre_id", dreId)

  const { data, error } = await query.order("name", { ascending: true })

  if (error) {
    console.error("Error cargando UGEL:", error)
    return NextResponse.json({ error: "No se pudieron cargar las UGEL" }, { status: 500 })
  }

  return NextResponse.json(data)
}
