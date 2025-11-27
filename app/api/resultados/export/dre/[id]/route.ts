// app/api/resultados/export/dre/[id]/route.ts
import { dbQuery } from "@/app/config/connection";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context;
    const { id: surveyId } = await params;

    const { searchParams } = new URL(req.url);
    const dreId = searchParams.get("dre");

    if (!dreId) {
      return new Response("Falta dre", { status: 400 });
    }

    const query = `
      SELECT
        dres.name AS dre_nombre,
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
      LEFT JOIN minedu.dres dres ON dres.id = sp.dre_id
      WHERE 
        sp.survey_id = $1
        AND sp.dre_id = $2
        AND sp.completed_at IS NOT NULL
      GROUP BY 
        dres.name, sp.survey_id, q.id, q.text, o.id, o.text
      ORDER BY 
        dres.name, q.id, o.id
    `;

    const res = await dbQuery(query, [surveyId, dreId]);
    const rows = res.rows;

    if (rows.length === 0) {
      return new Response(null, { status: 204 }); // ← sin body
    }

    const headers = ["dre", "encuesta", "pregunta", "opcion", "cantidad"];
    let csv = "\uFEFF" + headers.join(";") + "\n";

    for (const r of rows) {
      csv += [
        JSON.stringify(r.dre_nombre || ""),
        r.survey_id,
        JSON.stringify(r.question_text || ""),
        JSON.stringify(r.option_text || ""),
        r.cantidad
      ].join(";") + "\n";
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=reporte_dre.csv",
      },
    });

  } catch (e) {
    console.error(e);
    return new Response("Error interno", { status: 500 });
  }
}
