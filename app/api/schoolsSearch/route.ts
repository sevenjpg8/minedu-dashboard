// app/api/schoolsSearch/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ugelId = searchParams.get("ugelId")
  const query = searchParams.get("query")

  if (!ugelId || !query) {
    return NextResponse.json([])
  }

  try {
    // Buscar colegios de la UGEL cuyo nombre contenga el texto buscado
    const { data, error } = await supabase
      .from("school_new")
      .select("id, name, nivel_educativo")
      .eq("ugel_id", Number(ugelId))
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(20) // límite para autocompletado

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("Error en /api/schoolsSearch:", err)
    return NextResponse.json([], { status: 500 })
  }
}
