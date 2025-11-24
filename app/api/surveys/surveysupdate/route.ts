// app/api/surveys/actualizar/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function PUT(req: Request) {
  try {
    const data = await req.json()
    const { id, title, description, startDate, endDate, active, level, questions } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de encuesta requerido" }, { status: 400 })
    }

    // ✅ Validar nivel educativo
    if (!level) {
      return NextResponse.json(
        { success: false, error: "El nivel educativo es requerido" },
        { status: 400 }
      )
    }

    const allowedLevels = ["primaria", "secundaria"]
    if (!allowedLevels.includes(level)) {
      return NextResponse.json(
        { success: false, error: "Nivel educativo inválido" },
        { status: 400 }
      )
    }

    const surveyId = Number(id)

    // 1️⃣ Actualizar encuesta incluyendo LEVEL
    await dbQuery(
      `UPDATE minedu.surveys
       SET title=$1, description=$2, starts_at=$3, ends_at=$4, is_active=$5, level=$6, updated_at=NOW()
       WHERE id=$7`,
      [title, description, startDate, endDate, active ?? true, level, surveyId]
    )

    // 2️⃣ Obtener preguntas existentes
    const existingQuestionsRes = await dbQuery(
      `SELECT id FROM minedu.questions WHERE survey_id=$1`,
      [surveyId]
    )
    const existingQuestionIds = existingQuestionsRes.rows.map((q: any) => q.id)

    const newIds = questions.map((q: any) => q.id).filter((qid: any) => qid)
    const toDelete = existingQuestionIds.filter((qid: number) => !newIds.includes(qid))

    // 3️⃣ Eliminar preguntas que ya no existen
    if (toDelete.length > 0) {
      await dbQuery(`DELETE FROM minedu.options WHERE question_id = ANY($1::int[])`, [toDelete])
      await dbQuery(`DELETE FROM minedu.questions WHERE id = ANY($1::int[])`, [toDelete])
    }

    const questionIdMap: Record<number, number> = {}

    // 4️⃣ Mapear preguntas existentes
    for (const q of questions) {
      if (q.id && existingQuestionIds.includes(q.id)) {
        questionIdMap[q.id] = q.id
      }
    }

    // 5️⃣ Insertar nuevas preguntas
    for (const q of questions) {
      if (!q.id || !existingQuestionIds.includes(q.id)) {
        const insertQuestionRes = await dbQuery(
          `INSERT INTO minedu.questions (survey_id, dimension_id, text, prefix, type)
           VALUES ($1, $2, $3, $4, 'multiple_choice')
           RETURNING id`,
          [surveyId, 1, q.text, q.prefix ?? null]
        )
        const newQuestionId = insertQuestionRes.rows[0].id
        questionIdMap[q.id] = newQuestionId
      }
    }

    // 6️⃣ Insertar/actualizar opciones
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
          `INSERT INTO minedu.options (question_id, text, next_question_id)
           VALUES ($1, $2, $3)`,
          [questionId, a.text, nextQuestionId]
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
