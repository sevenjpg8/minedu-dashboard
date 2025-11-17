// app/api/resultados/route.ts
import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

interface AnswerRow {
  id: string;
  survey_participation_id: string;
  question_id: number | null;
  question_text: string | null;
  option_text: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get("encuesta");
    const dreId = searchParams.get("dre");
    const ugelId = searchParams.get("ugel");
    const schoolId = searchParams.get("colegio");
    const nivelEducativo = searchParams.get("nivelEducativo");
    const grado = searchParams.get("grado");

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

    if (nivelEducativo) {
      query += ` AND LOWER(education_level) = LOWER($${index++})`;
      params.push(nivelEducativo);
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

    const answersRes = await dbQuery(
      `
      SELECT
        a.id,
        a.survey_participation_id,
        a.question_id,
        q.text AS question_text,
        o.text AS option_text
      FROM minedu.answers a
      LEFT JOIN minedu.questions q ON q.id = a.question_id
      LEFT JOIN minedu.options o ON o.id = a.option_id
      WHERE a.survey_participation_id = ANY($1::uuid[])
      `,
      [participationIds]
    );

    const data: AnswerRow[] = answersRes.rows;

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    const agrupado: Record<string, Record<string, number>> = {};

    for (const row of data) {
      const pregunta = row.question_text || "Sin pregunta";
      const opcion = row.option_text || "Sin opción";

      if (!agrupado[pregunta]) agrupado[pregunta] = {};
      if (!agrupado[pregunta][opcion]) agrupado[pregunta][opcion] = 0;

      agrupado[pregunta][opcion]++;
    }

    const charts = Object.entries(agrupado).map(([pregunta, opciones]) => {
      const firstRow = data.find((r) => r.question_text === pregunta);
      return {
        id: firstRow?.question_id ?? 0,
        question: pregunta,
        data: Object.entries(opciones).map(([name, count]) => ({
          name,
          "# de Respuestas": count,
        })),
      };
    });

    return NextResponse.json({ success: true, charts });

  } catch (err) {
    console.error("Error en /api/resultados:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", detail: String(err) },
      { status: 500 }
    );
  }
}
