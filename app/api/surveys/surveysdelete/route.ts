// app/api/surveys/eliminar/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de encuesta requerido" }, { status: 400 })
    }

    const surveyId = Number(id)

    // 1️⃣ Obtener IDs de preguntas relacionadas
    const questionsResult = await dbQuery(
      `SELECT id FROM minedu.questions WHERE survey_id = $1`,
      [surveyId]
    )
    const questionIds = questionsResult.rows.map((q: any) => q.id)

    if (questionIds.length > 0) {
      const deleteAnswersQuery = `
        DELETE FROM minedu.answers
        WHERE question_id = ANY($1::int[])
      `
      await dbQuery(deleteAnswersQuery, [questionIds])

      const deleteOptionsQuery = `
        DELETE FROM minedu.options
        WHERE question_id = ANY($1::int[])
      `
      await dbQuery(deleteOptionsQuery, [questionIds])

      const deleteQuestionsQuery = `
        DELETE FROM minedu.questions
        WHERE id = ANY($1::int[])
      `
      await dbQuery(deleteQuestionsQuery, [questionIds])
    }

    const deleteSurveyQuery = `
      DELETE FROM minedu.surveys
      WHERE id = $1
    `
    await dbQuery(deleteSurveyQuery, [surveyId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error al eliminar encuesta:", error)
    return NextResponse.json(
      { success: false, error: error.message ?? String(error) },
      { status: 500 }
    )
  }
}
