// app/api/resultados/route.ts
import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

interface AnswerRow {
  id: string;
  survey_participation_id: string;
  question_id: number | null;
  option_id: number | null;
  question_text: string | null;
  option_text: string | null;
  respuesta_count: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get("encuesta");
    const dreId = searchParams.get("dre");
    const ugelId = searchParams.get("ugel");
    const schoolId = searchParams.get("colegio");
    const grado = searchParams.get("grado");
    const nivelEducativo = searchParams.get("nivelEducativo");

    if (!surveyId) {
      return NextResponse.json(
        { success: false, message: "Falta encuesta" },
        { status: 400 }
      );
    }

    let query = `
      SELECT 
        id,
        survey_id,
        school_id,
        dre_id,
        ugel_id,
        education_level,
        grade
      FROM minedu.survey_participations
      WHERE survey_id = $1
        AND completed_at IS NOT NULL
    `;

    const params: any[] = [surveyId];
    let index = 2;

    if (dreId) {
      query += ` AND dre_id = $${index++}`;
      params.push(dreId);
    }

    if (ugelId) {
      query += ` AND ugel_id = $${index++}`;
      params.push(ugelId);
    }

    if (schoolId) {
      query += ` AND school_id = $${index++}`;
      params.push(schoolId);
    }

    if (grado) {
      query += ` AND grade = $${index++}`;
      params.push(grado);
    }

    const participationsRes = await dbQuery(query, params);
    const participations = participationsRes.rows;

    console.log("📊 Participaciones filtradas:", participations.length);

    if (participations.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    const participationIds = participations.map((p) => String(p.id));

    let answersQuery = `
      SELECT 
        a.question_id,
        a.option_id,
        q.text AS question_text,
        o.text AS option_text,
        COUNT(*) AS respuesta_count
      FROM minedu.answers a
      LEFT JOIN minedu.questions q ON q.id = a.question_id
      LEFT JOIN minedu.options o ON o.id = a.option_id
      WHERE a.survey_participation_id = ANY($1::uuid[])
      GROUP BY a.question_id, a.option_id, q.text, o.text
      ORDER BY a.question_id, a.option_id
    `;


    const answersRes = await dbQuery(answersQuery, [participationIds]);

    const data: AnswerRow[] = answersRes.rows;

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    const agrupado: Record<string, Record<string, number>> = {};

    for (const row of data) {
      const pregunta = row.question_text || "Sin pregunta";
      const opcion = row.option_text || "Sin opción";

      if (!agrupado[pregunta]) agrupado[pregunta] = {};

      // Usamos el conteo real que nos da SQL
      agrupado[pregunta][opcion] = Number(row.respuesta_count || 0);
    }


    const charts = Object.entries(agrupado)
    .map(([pregunta, opciones]) => {
      const firstRow = data.find((r) => r.question_text === pregunta);
      return {
        id: firstRow?.question_id ?? 0,  // ahora sí tiene valor real
        question: pregunta,
        data: Object.entries(opciones)
          .sort(([aName], [bName]) => {
            const optionA = data.find(r => r.question_text === pregunta && r.option_text === aName)?.option_id ?? 0;
            const optionB = data.find(r => r.question_text === pregunta && r.option_text === bName)?.option_id ?? 0;
            return optionA - optionB;
          })
          .map(([name, count]) => ({
            name,
            "# de Respuestas": count,
          })),
      };
    })
    .sort((a, b) => a.id - b.id);

    return NextResponse.json({ success: true, charts });

  } catch (err) {
    console.error("Error en /api/resultados:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", detail: String(err) },
      { status: 500 }
    );
  }
}
