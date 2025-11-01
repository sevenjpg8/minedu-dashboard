import { supabase } from "@/lib/supabaseClient"

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return Response.json({ success: false, error: "ID de encuesta requerido" }, { status: 400 })
    }

    const surveyId = Number(id)

    // 1️⃣ Obtener las preguntas relacionadas (solo ids)
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id")
      .eq("survey_id", surveyId)

    if (questionsError) throw questionsError

    const questionIds = questions?.map((q: any) => q.id) ?? []

    // 2️⃣ Eliminar respuestas relacionadas
    if (questionIds.length > 0) {
      const { error: delAnswersError } = await supabase
        .from("answers")
        .delete()
        .in("question_id", questionIds)

      if (delAnswersError) throw delAnswersError

      // 3️⃣ Eliminar opciones
      const { error: delOptionsError } = await supabase
        .from("options")
        .delete()
        .in("question_id", questionIds)

      if (delOptionsError) throw delOptionsError

      // 4️⃣ Eliminar preguntas
      const { error: delQuestionsError } = await supabase
        .from("questions")
        .delete()
        .in("id", questionIds)

      if (delQuestionsError) throw delQuestionsError
    }

    // 5️⃣ Eliminar la encuesta
    const { error: delSurveyError } = await supabase
      .from("surveys")
      .delete()
      .eq("id", surveyId)

    if (delSurveyError) throw delSurveyError

    return Response.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error al eliminar encuesta:", error)
    return Response.json({ success: false, error: error.message ?? String(error) }, { status: 500 })
  }
}
