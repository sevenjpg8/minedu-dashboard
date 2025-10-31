import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const surveyId = searchParams.get("encuesta")
  const dreId = searchParams.get("dre")
  const ugelId = searchParams.get("ugel")
  const schoolId = searchParams.get("colegio")
  const nivelEducativo = searchParams.get("nivelEducativo")
  const grado = searchParams.get("grado")

  try {
    let query = supabase
      .from("answers")
      .select(`
        question_id,
        questions (id, text),
        options (id, text),
        survey_participations!inner (
          survey_id,
          school_id,
          schools!inner (
            id,
            ugel_id,
            ugeles!inner (dre_id),
            nivel_educativo,
            grado
          )
        )
      `)

    if (surveyId) query = query.eq("survey_participations.survey_id", surveyId)
    if (dreId) query = query.eq("survey_participations.schools.ugeles.dre_id", dreId)
    if (ugelId) query = query.eq("survey_participations.schools.ugel_id", ugelId)
    if (schoolId) query = query.eq("survey_participations.school_id", schoolId)
    if (nivelEducativo) query = query.eq("survey_participations.schools.nivel_educativo", nivelEducativo)
    if (grado) query = query.eq("survey_participations.schools.grado", grado)

    const { data, error } = await query

    if (error) throw error

    // Agrupamos resultados
    const grouped = data.reduce((acc: any, row: any) => {
      const qid = row.questions.id
      const qtext = row.questions.text
      const optText = row.options?.text ?? "Sin respuesta"

      if (!acc[qid]) acc[qid] = { question: qtext, results: {} }
      acc[qid].results[optText] = (acc[qid].results[optText] || 0) + 1
      return acc
    }, {})

    // Formateamos para frontend
    const formatted = Object.values(grouped).map((q: any) => ({
      title: q.question,
      data: Object.entries(q.results).map(([name, count]) => ({
        name,
        "# de Respuestas": count,
      })),
    }))

    return NextResponse.json({ success: true, charts: formatted })
  } catch (err) {
    console.error("Error en /api/reportes:", err)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
