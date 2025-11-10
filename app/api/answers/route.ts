import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("school_id");

  try {
    // Consulta SQL usando schema minedu
    const sql = `
      SELECT 
        a.question_id,
        a.option_id,
        o.text AS option_text,
        q.text AS question_text
      FROM minedu.answers a
      LEFT JOIN minedu.options o ON o.id = a.option_id
      LEFT JOIN minedu.questions q ON q.id = a.question_id
      ${schoolId ? "WHERE a.school_id = $1" : ""}
    `;

    const params = schoolId ? [schoolId] : [];

    const result = await dbQuery(sql, params);

    const data = result.rows;

    // Agrupar por pregunta
    const grouped: any = {};

    data.forEach((row: any) => {
      const qid = row.question_id;
      const qtext = row.question_text;
      const optText = row.option_text ?? "Sin opción";

      if (!grouped[qid]) {
        grouped[qid] = {
          question: qtext,
          results: {},
        };
      }

      grouped[qid].results[optText] =
        (grouped[qid].results[optText] || 0) + 1;
    });

    const formatted = Object.values(grouped).map((q: any) => ({
      question: q.question,
      data: Object.entries(q.results).map(([name, value]) => ({
        name,
        value,
      })),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error en /api/answers:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
