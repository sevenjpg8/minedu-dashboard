import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    // 📥 Traer todas las preguntas con sus opciones
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        survey_id,
        prefix,
        text,
        options (
          id,
          text
        )
      `)
      .order("id", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("❌ Error cargando preguntas:", err)
    return NextResponse.json(
      { error: "No se pudieron cargar las preguntas" },
      { status: 500 }
    )
  }
}
