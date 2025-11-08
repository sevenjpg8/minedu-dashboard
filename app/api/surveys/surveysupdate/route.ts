// app/api/surveys/actualizar/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function PUT(req: Request) {
  try {
    console.log("📩 Recibida solicitud PUT para actualizar encuesta")

    const data = await req.json()
    const { id, title, description, startDate, endDate, active, questions } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de encuesta requerido" }, { status: 400 })
    }

    const surveyId = Number(id)

    // 1️⃣ Actualizar la encuesta principal
    await dbQuery(
      `
      UPDATE minedu.surveys
      SET title=$1, description=$2, starts_at=$3, ends_at=$4, is_active=$5, updated_at=NOW()
      WHERE id=$6
      `,
      [title, description, startDate, endDate, active ?? true, surveyId]
    )
    console.log("✅ Encuesta actualizada correctamente")

    // 2️⃣ Obtener preguntas existentes
    const existingQuestionsRes = await dbQuery(
      `SELECT id FROM minedu.questions WHERE survey_id=$1`,
      [surveyId]
    )
    const existingQuestionIds = existingQuestionsRes.rows.map((q: any) => q.id)

    // 3️⃣ Eliminar preguntas que ya no existan
    const newIds = questions.map((q: any) => q.id).filter((qid: any) => qid)
    const toDelete = existingQuestionIds.filter((qid: number) => !newIds.includes(qid))

    if (toDelete.length > 0) {
      await dbQuery(
        `DELETE FROM minedu.answers WHERE question_id = ANY($1::int[])`,
        [toDelete]
      )
      await dbQuery(
        `DELETE FROM minedu.options WHERE question_id = ANY($1::int[])`,
        [toDelete]
      )
      await dbQuery(
        `DELETE FROM minedu.questions WHERE id = ANY($1::int[])`,
        [toDelete]
      )
      console.log("🗑️ Preguntas y opciones eliminadas:", toDelete)
    }

    // 4️⃣ Actualizar o insertar preguntas
    for (const q of questions) {
      if (q.id && existingQuestionIds.includes(q.id)) {
        // actualizar pregunta existente
        await dbQuery(
          `UPDATE minedu.questions
           SET text=$1, prefix=$2, updated_at=NOW()
           WHERE id=$3`,
          [q.text, q.prefix ?? null, q.id]
        )
        // eliminar opciones viejas
        await dbQuery(`DELETE FROM minedu.options WHERE question_id=$1`, [q.id])
        // insertar nuevas opciones
        if (q.answers && q.answers.length > 0) {
          const optsQuery = q.answers
            .map((a: any, i: number) => `($1, $${i + 2}, NOW(), NOW())`)
            .join(", ")
          const params = [q.id, ...q.answers.map((a: any) => a.text)]
          await dbQuery(
            `INSERT INTO minedu.options (question_id, text, created_at, updated_at) VALUES ${optsQuery}`,
            params
          )
        }
      } else {
        // nueva pregunta
        const insertQuestionRes = await dbQuery(
          `INSERT INTO minedu.questions (survey_id, dimension_id, text, prefix, type, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'multiple_choice', NOW(), NOW())
           RETURNING id`,
          [surveyId, 1, q.text, q.prefix ?? null]
        )
        const newQuestionId = insertQuestionRes.rows[0].id

        if (q.answers && q.answers.length > 0) {
          const optsQuery = q.answers
            .map((a: any, i: number) => `($1, $${i + 2}, NOW(), NOW())`)
            .join(", ")
          const params = [newQuestionId, ...q.answers.map((a: any) => a.text)]
          await dbQuery(
            `INSERT INTO minedu.options (question_id, text, created_at, updated_at) VALUES ${optsQuery}`,
            params
          )
        }
      }
    }

    console.log("✅ Todo actualizado correctamente")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error al actualizar encuesta:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
