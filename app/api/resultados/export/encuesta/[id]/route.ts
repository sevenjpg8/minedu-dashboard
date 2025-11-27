// app/api/resultados/export/encuesta/[id]/route.ts
import { dbQuery } from "@/app/config/connection";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: surveyId } = await context.params;

  if (!surveyId) {
    return new Response("Falta encuesta", { status: 400 });
  }

  const query = `
    SELECT
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
    WHERE 
      sp.survey_id = $1
      AND sp.completed_at IS NOT NULL
    GROUP BY 
      sp.survey_id,
      q.id, q.text,
      o.id, o.text
    ORDER BY 
      q.id, o.id;
  `;

  const res = await dbQuery(query, [surveyId]);
  const rows = res.rows;

  if (rows.length === 0) {
    return new Response("No hay datos", { status: 204 });
  }

  const headers = ["encuesta", "pregunta", "opcion", "cantidad"];
  let csv = "\uFEFF" + headers.join(";") + "\n";   // ← BOM UTF-8

  for (const r of rows) {
    const row = [
      r.survey_id,
      JSON.stringify(r.question_text || ""),
      JSON.stringify(r.option_text || ""),
      r.cantidad,
    ];
    csv += row.join(";") + "\n";
  }

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=reporte_general.csv",
    },
  });
}

