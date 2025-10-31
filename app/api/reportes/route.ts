import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

interface AnswerRow {
  id: number
  question: { text: string }[] | { text: string } | null
  option: { text: string }[] | { text: string } | null
  survey_participation: {
    survey_id: number
    school_id: number
    education_level: string
    grade: string
    school?: {
      ugel_id: number
      ugel?: { dre_id: number }
    }
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get("encuesta")
    const dreId = searchParams.get("dre")
    const ugelId = searchParams.get("ugel")
    const schoolId = searchParams.get("colegio")
    const nivelEducativo = searchParams.get("nivelEducativo")
    const grado = searchParams.get("grado")

    if (!surveyId) {
      return NextResponse.json({ success: false, message: "Falta encuesta" }, { status: 400 })
    }

    // 1️⃣ Obtener colegios válidos
    const { data: colegiosValidos, error: colegiosError } = await supabase
      .from("encuesta_relacionada")
      .select("school_id")

    if (colegiosError) throw colegiosError
    if (!colegiosValidos || colegiosValidos.length === 0) {
      return NextResponse.json({ success: true, charts: [] })
    }

    const colegiosIds = colegiosValidos.map((c) => Number(c.school_id))

    // 2️⃣ Query principal
    let query = supabase
      .from("answers")
      .select(`
        id,
        question:question_id(text),
        option:option_id(text),
        survey_participation:survey_participation_id(
          survey_id,
          school_id,
          education_level,
          grade
        )
      `)
      .eq("survey_participation.survey_id", surveyId)
      .in("survey_participation.school_id", colegiosIds)


    if (dreId) query = query.eq("survey_participation.school.ugel.dre_id", dreId)
    if (ugelId) query = query.eq("survey_participation.school.ugel_id", ugelId)
    if (schoolId) query = query.eq("survey_participation.school_id", schoolId)
    if (nivelEducativo) query = query.eq("survey_participation.education_level", nivelEducativo)
    if (grado) query = query.eq("survey_participation.grade", grado)

    const { data, error } = await query.returns<AnswerRow[]>()

    if (error) throw error
    if (!data || data.length === 0)
      return NextResponse.json({ success: true, charts: [] })

    // 3️⃣ Agrupar resultados
    const agrupado: Record<string, Record<string, number>> = {}

    for (const row of data) {
      const pregunta =
        Array.isArray(row.question)
          ? row.question[0]?.text || "Sin pregunta"
          : row.question?.text || "Sin pregunta"

      const opcion =
        Array.isArray(row.option)
          ? row.option[0]?.text || "Sin opción"
          : row.option?.text || "Sin opción"

      if (!agrupado[pregunta]) agrupado[pregunta] = {}
      if (!agrupado[pregunta][opcion]) agrupado[pregunta][opcion] = 0

      agrupado[pregunta][opcion]++
    }

    // 4️⃣ Formato final
    const charts = Object.entries(agrupado).map(([pregunta, opciones]) => ({
      question: pregunta,
      data: Object.entries(opciones).map(([name, count]) => ({
        name,
        "# de Respuestas": count,
      })),
    }))

    return NextResponse.json({ success: true, charts })
  } catch (err) {
    console.error("Error en /api/reportes:", err)
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}