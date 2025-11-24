// app/api/surveys/crear/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { title, description, startDate, endDate, active, level, questions } = data

    // 1️⃣ Crear la encuesta
    const insertSurveyQuery = `
      INSERT INTO minedu.surveys
        (title, description, starts_at, ends_at, is_active, level, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id
    `

    const surveyResult = await dbQuery(insertSurveyQuery, [
      title,
      description,
      startDate,
      endDate,
      active ?? true,
      level // <-- primaria o secundaria
    ])

    const surveyId = surveyResult.rows[0].id

    // 2️⃣ Insertar preguntas y mapear ids temporales a ids reales
    const questionIdMap: Record<number, number> = {}

    for (const q of questions) {
      const insertQuestionQuery = `
        INSERT INTO minedu.questions
          (survey_id, dimension_id, text, type, prefix, "order")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `
      const questionResult = await dbQuery(insertQuestionQuery, [
        surveyId,
        1,
        q.text,
        "multiple_choice",
        q.prefix,
        q.order ?? 0,
      ])

      const questionId = questionResult.rows[0].id
      questionIdMap[q.id] = questionId
    }

    // 3️⃣ Insertar opciones
    for (const q of questions) {
      const questionId = questionIdMap[q.id]

      if (q.answers && q.answers.length > 0) {
        for (const a of q.answers) {
          const nextQuestionId =
            a.nextQuestionIds && a.nextQuestionIds.length > 0
              ? questionIdMap[a.nextQuestionIds[0]] || null
              : null

          const insertOptionQuery = `
            INSERT INTO minedu.options (question_id, text, next_question_id)
            VALUES ($1, $2, $3)
          `
          await dbQuery(insertOptionQuery, [questionId, a.text, nextQuestionId])
        }
      }
    }

    return NextResponse.json({ success: true, surveyId })
  } catch (error: any) {
    console.error("❌ Error al crear encuesta:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
