// app/api/surveys/crear/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { title, description, startDate, endDate, active, questions } = data

    // 1️⃣ Crear la encuesta
    const insertSurveyQuery = `
      INSERT INTO minedu.surveys
        (title, description, starts_at, ends_at, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id
    `
    const surveyResult = await dbQuery(insertSurveyQuery, [
      title,
      description,
      startDate,
      endDate,
      active ?? true,
    ])
    const surveyId = surveyResult.rows[0].id

    // 2️⃣ Insertar preguntas
    for (const q of questions) {
      const insertQuestionQuery = `
        INSERT INTO minedu.questions
          (survey_id, dimension_id, text, type, prefix, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `
      const questionResult = await dbQuery(insertQuestionQuery, [
        surveyId,
        1, // valor temporal para dimension_id
        q.text,
        "multiple_choice", // valor por defecto
        q.prefix,
        q.order ?? 0,
      ])
      const questionId = questionResult.rows[0].id

      // 3️⃣ Insertar opciones
      if (q.answers && q.answers.length > 0) {
        const values = q.answers
          .map((a: any, idx: number) =>
            `(${questionId}, $${idx + 1}, NOW(), NOW())`
          )
          .join(", ")

        const params = q.answers.map((a: any) => a.text)
        const insertOptionsQuery = `
          INSERT INTO minedu.options (question_id, text, created_at, updated_at)
          VALUES ${values}
        `
        await dbQuery(insertOptionsQuery, params)
      }
    }

    return NextResponse.json({ success: true, surveyId })
  } catch (error: any) {
    console.error("❌ Error al crear encuesta:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
