// app/api/resultados/export/ugel/[id]/route.ts
import { dbQuery } from "@/app/config/connection";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: surveyId } = await context.params;

    const { searchParams } = new URL(req.url);

    const dreId = searchParams.get("dre");
    const ugelId = searchParams.get("ugel");

    if (!dreId) return new Response("Falta dre", { status: 400 });
    if (!ugelId) return new Response("Falta ugel", { status: 400 });

    const query = `
      SELECT
        dres.name AS dre_nombre,
        ugel.name AS ugel_nombre,
        sp.survey_id,
        q.id AS question_id,
        q.text AS question_text,
        o.id AS option_id,
        o.text AS option_text,
        COUNT(*) AS cantidad
      FROM minedu.answers a
      LEFT JOIN minedu.questions q ON q.id = a.question_id
      LEFT JOIN minedu.options o ON o.id = a.option_id
      LEFT JOIN minedu.survey_participations sp ON sp.id = a.survey_participation_id
      LEFT JOIN minedu.ugel_new ugel ON ugel.id = sp.ugel_id
      LEFT JOIN minedu.dres dres ON dres.id = sp.dre_id
      WHERE 
        sp.survey_id = $1
        AND sp.dre_id = $2
        AND sp.ugel_id = $3
        AND sp.completed_at IS NOT NULL
      GROUP BY 
        dres.name, ugel.name, sp.survey_id, q.id, q.text, o.id, o.text
      ORDER BY 
        dres.name, ugel.name, q.id, o.id
    `;

    const res = await dbQuery(query, [surveyId, dreId, ugelId]);
    const rows = res.rows;

    if (rows.length === 0) {
      return new Response(null, { status: 204 });
    }

    const headers = [
      "dre", "ugel", "encuesta",
      "pregunta_id", "pregunta",
      "opcion_id", "opcion", "cantidad"
    ];

    let csv = "\uFEFF" + headers.join(";") + "\n";

    for (const r of rows) {
      csv += [
        JSON.stringify(r.dre_nombre || ""),
        JSON.stringify(r.ugel_nombre || ""),
        r.survey_id,
        r.question_id,
        JSON.stringify(r.question_text || ""),
        r.option_id,
        JSON.stringify(r.option_text || ""),
        r.cantidad
      ].join(";") + "\n";
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=reporte_dre_ugel.csv",
      },
    });

  } catch (e) {
    console.error(e);
    return new Response("Error interno", { status: 500 });
  }
}
