import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const idNumber = Number(id)

  // 🧠 1. Obtener la encuesta base
  const { data: survey, error: surveyError } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", idNumber)
    .single()

  if (surveyError || !survey) {
    console.error("❌ Error obteniendo encuesta:", surveyError)
    return NextResponse.json({ error: "No se pudo cargar la encuesta" }, { status: 500 })
  }

  // 🧠 2. Obtener preguntas relacionadas
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(`
      id,
      prefix,
      text
    `)
    .eq("survey_id", idNumber)

  if (questionsError) {
    console.error("❌ Error obteniendo preguntas:", questionsError)
  }

  // 🧠 3. Obtener opciones para cada pregunta
  const questionIds = questions?.map(q => q.id) ?? []
  let options: any[] = []

  if (questionIds.length > 0) {
    const { data: optionsData, error: optionsError } = await supabase
      .from("options")
      .select(`id, text, question_id`)
      .in("question_id", questionIds)

    if (optionsError) {
      console.error("❌ Error obteniendo opciones:", optionsError)
    } else {
      options = optionsData ?? []
    }
  }

  console.log("🧩 ID encuesta:", idNumber)
console.log("🧩 Preguntas encontradas:", questions)

  // 🧩 Combinar preguntas con sus opciones
  const questionsWithOptions = questions?.map(q => ({
    ...q,
    options: options.filter(o => o.question_id === q.id)
  })) ?? []

  // 🧩 Resultado final
  return NextResponse.json({
    ...survey,
    questions: questionsWithOptions
  })
}
