import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // 👈 params es una Promesa
) {
  const { id } = await context.params // 👈 aquí se hace el await correctamente
  const idNumber = Number(id)

  const { data, error } = await supabase
    .from("surveys")
    .select("id, title, description, starts_at, ends_at, is_active")
    .eq("id", idNumber)
    .single()

  if (error) {
    console.error("Error cargando encuesta:", error)
    return NextResponse.json(
      { error: "No se pudo cargar la encuesta" },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      { error: "Encuesta no encontrada" },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}
