import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase
    .from("dres")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error cargando DRE:", error)
    return NextResponse.json({ error: "No se pudieron cargar las DRE" }, { status: 500 })
  }

  return NextResponse.json(data)
}
