import { dbQuery } from "@/app/config/connection";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: schoolId } = await context.params; 
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get("encuesta");
    const dreId = searchParams.get("dre");
    const ugelId = searchParams.get("ugel");

    if (!surveyId) return new Response("Falta encuesta", { status: 400 });
    if (!schoolId) return new Response("Falta colegio", { status: 400 });

    // Consulta a la DB
    let query = `
      SELECT
        dres.name AS dre_nombre,
        ugel.name AS ugel_nombre,
        school.name AS colegio_nombre,
        sp.survey_id,
        q.text AS question_text,
        o.text AS option_text,
        COUNT(*) AS cantidad
      FROM minedu.answers a
      LEFT JOIN minedu.questions q ON q.id = a.question_id
      LEFT JOIN minedu.options o ON o.id = a.option_id
      LEFT JOIN minedu.survey_participations sp ON sp.id = a.survey_participation_id
      LEFT JOIN minedu.school_new school ON school.id = sp.school_id
      LEFT JOIN minedu.ugel_new ugel ON ugel.id = sp.ugel_id
      LEFT JOIN minedu.dres dres ON dres.id = sp.dre_id
      WHERE sp.survey_id = $1
        AND sp.school_id = $2
        AND sp.completed_at IS NOT NULL
    `;

    const params: any[] = [surveyId, schoolId];
    let idx = 3;

    if (dreId) { query += ` AND sp.dre_id = $${idx++}`; params.push(dreId); }
    if (ugelId) { query += ` AND sp.ugel_id = $${idx++}`; params.push(ugelId); }

    query += `
      GROUP BY 
        dres.name, ugel.name, school.name, 
        sp.survey_id, q.id, o.id, q.text, o.text
      ORDER BY 
        q.id, o.id
    `;

    const res = await dbQuery(query, params);
    if (res.rows.length === 0) return new Response("No hay datos", { status: 204 });

    // CSV con BOM
    const headers = ["colegio", "ugel", "dre", "encuesta", "pregunta", "opcion", "cantidad"];
    let csv = "\uFEFF" + headers.join(";") + "\n";

    for (const r of res.rows) {
      const row = [
        JSON.stringify(r.colegio_nombre || ""),
        JSON.stringify(r.ugel_nombre || ""),
        JSON.stringify(r.dre_nombre || ""),
        r.survey_id,
        JSON.stringify(r.question_text || ""),
        JSON.stringify(r.option_text || ""),
        r.cantidad
      ];
      csv += row.join(";") + "\n";
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=reporte_colegio_${schoolId}.csv`,
      },
    });

  } catch (e) {
    console.error(e);
    return new Response("Error interno", { status: 500 });
  }
}
