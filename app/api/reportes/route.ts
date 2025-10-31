import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

interface AnswerRow {
  id: number
  question: { text: string } | null
  option: { text: string } | null
  survey_participation: {
    survey_id: number
    school_id: number
    education_level: string
    grade: string
    school?: {
      id: number
      ugel?: {
        id: number
        dre?: { id: number }
      }
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

    // 1️⃣ Obtener colegios válidos desde encuesta_relacionada
    const { data: colegiosValidos, error: colegiosError } = await supabase
      .from("encuesta_relacionada")
      .select("school_id")

    if (colegiosError) throw colegiosError
    if (!colegiosValidos || colegiosValidos.length === 0) {
      return NextResponse.json({ success: true, charts: [] })
    }

    const colegiosIds = colegiosValidos.map((c) => Number(c.school_id))

    // 2️⃣ Query principal — ahora con relaciones reales
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
          grade,
          school:school_id(
            id,
            ugel:ugels!schools_ugel_id_fkey(
              id,
              dre:dre_id(id)
            )
          )
        )
      `)
      .eq("survey_participation.survey_id", surveyId)
      .in("survey_participation.school_id", colegiosIds)

    // 3️⃣ Filtros jerárquicos
    if (dreId) query = query.eq("survey_participation.school.ugel.dre.id", dreId)
    if (ugelId) query = query.eq("survey_participation.school.ugel.id", ugelId)
    if (schoolId) query = query.eq("survey_participation.school_id", schoolId)
    if (nivelEducativo) query = query.eq("survey_participation.education_level", nivelEducativo)
    if (grado) query = query.eq("survey_participation.grade", grado)

    const { data, error } = await query.returns<AnswerRow[]>()

    if (error) throw error
    if (!data || data.length === 0)
      return NextResponse.json({ success: true, charts: [] })

    // 4️⃣ Agrupar resultados
    const agrupado: Record<string, Record<string, number>> = {}

    for (const row of data) {
      const pregunta = row.question?.text || "Sin pregunta"
      const opcion = row.option?.text || "Sin opción"

      if (!agrupado[pregunta]) agrupado[pregunta] = {}
      if (!agrupado[pregunta][opcion]) agrupado[pregunta][opcion] = 0

      agrupado[pregunta][opcion]++
    }

    // 5️⃣ Formato final para los gráficos
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
