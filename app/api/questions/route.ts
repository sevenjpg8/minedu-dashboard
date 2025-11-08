import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    // ✅ Traer preguntas + opciones en una sola consulta
    const sql = `
      SELECT 
        q.id AS question_id,
        q.survey_id,
        q.prefix,
        q.text AS question_text,
        o.id AS option_id,
        o.text AS option_text
      FROM minedu.questions q
      LEFT JOIN minedu.options o ON o.question_id = q.id
      ORDER BY q.id ASC, o.id ASC;
    `;

    const result = await dbQuery(sql);

    const rows = result.rows;

    // ✅ Agrupar preguntas + opciones
    const grouped: any = {};

    for (const row of rows) {
      const qid = row.question_id;

      if (!grouped[qid]) {
        grouped[qid] = {
          id: qid,
          survey_id: row.survey_id,
          prefix: row.prefix,
          text: row.question_text,
          options: [],
        };
      }

      if (row.option_id) {
        grouped[qid].options.push({
          id: row.option_id,
          text: row.option_text,
        });
      }
    }

    const formatted = Object.values(grouped);

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("❌ Error cargando preguntas:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar las preguntas" },
      { status: 500 }
    );
  }
}
