// app/api/surveys/actualizar/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function PUT(req: Request) {
  try {
    const data = await req.json()
    const { id, title, description, startDate, endDate, active, questions } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de encuesta requerido" }, { status: 400 })
    }

    const surveyId = Number(id)

    await dbQuery(
      `UPDATE minedu.surveys
       SET title=$1, description=$2, starts_at=$3, ends_at=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6`,
      [title, description, startDate, endDate, active ?? true, surveyId]
    )

    const existingQuestionsRes = await dbQuery(
      `SELECT id FROM minedu.questions WHERE survey_id=$1`,
      [surveyId]
    )
    const existingQuestionIds = existingQuestionsRes.rows.map((q: any) => q.id)

    const newIds = questions.map((q: any) => q.id).filter((qid: any) => qid)
    const toDelete = existingQuestionIds.filter((qid: number) => !newIds.includes(qid))

    if (toDelete.length > 0) {
      await dbQuery(`DELETE FROM minedu.options WHERE question_id = ANY($1::int[])`, [toDelete])
      await dbQuery(`DELETE FROM minedu.questions WHERE id = ANY($1::int[])`, [toDelete])
      console.log("🗑️ Preguntas y opciones eliminadas:", toDelete)
    }

    const questionIdMap: Record<number, number> = {} // id temporal -> id real

    for (const q of questions) {
      if (q.id && existingQuestionIds.includes(q.id)) {
        questionIdMap[q.id] = q.id
      }
    }

    for (const q of questions) {
      if (!q.id || !existingQuestionIds.includes(q.id)) {
        const insertQuestionRes = await dbQuery(
          `INSERT INTO minedu.questions (survey_id, dimension_id, text, prefix, type, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'multiple_choice', NOW(), NOW())
           RETURNING id`,
          [surveyId, 1, q.text, q.prefix ?? null]
        )
        const newQuestionId = insertQuestionRes.rows[0].id
        questionIdMap[q.id] = newQuestionId
      }
    }

    for (const q of questions) {
      const questionId = questionIdMap[q.id]
      if (!q.answers || q.answers.length === 0) continue

      await dbQuery(`DELETE FROM minedu.options WHERE question_id=$1`, [questionId])

      for (const a of q.answers) {
        const nextQuestionId =
          a.nextQuestionIds && a.nextQuestionIds.length > 0
            ? questionIdMap[a.nextQuestionIds[0]] || null
            : null

        await dbQuery(
          `INSERT INTO minedu.options (question_id, text, created_at, updated_at, next_question_id)
           VALUES ($1, $2, NOW(), NOW(), $3)`,
          [questionId, a.text, nextQuestionId]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
