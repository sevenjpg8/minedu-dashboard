import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const surveyId = Number(id)

    if (isNaN(surveyId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      )
    }

    // ✅ 1. Obtener la encuesta base
    const surveyResult = await dbQuery(
      `SELECT * FROM minedu.surveys WHERE id = $1`,
      [surveyId]
    )

    if (surveyResult.rowCount === 0) {
      return NextResponse.json(
        { error: "No se encontró la encuesta" },
        { status: 404 }
      )
    }

    const survey = surveyResult.rows[0]

    // ✅ 2. Obtener todas las preguntas de la encuesta
    const questionsResult = await dbQuery(
      `
      SELECT id, prefix, text
      FROM minedu.questions
      WHERE survey_id = $1
      ORDER BY id ASC
      `,
      [surveyId]
    )

    const questions = questionsResult.rows

    // ✅ 3. Obtener todas las opciones relacionadas (con el next_question_id incluido)
    const questionIds = questions.map(q => q.id)
    let options: any[] = []

    if (questionIds.length > 0) {
      const optionsResult = await dbQuery(
        `
        SELECT id, text, question_id, next_question_id
        FROM minedu.options
        WHERE question_id = ANY($1)
        `,
        [questionIds]
      )

      options = optionsResult.rows
    }

    // ✅ 4. Combinar preguntas + opciones, y normalizar next_question_id
    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: options
        .filter(o => o.question_id === q.id)
        .map(o => ({
          id: o.id,
          text: o.text,
          nextQuestionIds: o.next_question_id ? [o.next_question_id] : []
        }))
    }))

    // ✅ 5. Respuesta final completa
    return NextResponse.json({
      ...survey,
      questions: questionsWithOptions
    })

  } catch (error) {
    console.error("❌ Error en /api/surveys/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
