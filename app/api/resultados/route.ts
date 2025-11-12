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

    // Obtener participaciones
    const participationsRes = await dbQuery(
      `SELECT id, survey_id, school_id, education_level, grade
       FROM minedu.survey_participations
       WHERE survey_id = $1`,
      [surveyId]
    );
    const participations = participationsRes.rows;

    if (!participations || participations.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    let filteredParticipations = [...participations];
    console.log("📊 Participaciones totales:", participations.length);

    // 2️⃣ Filtro por DRE
    if (dreId) {
      const ugelsRes = await dbQuery(
        `SELECT id FROM minedu.ugel_new WHERE dre_id = $1`,
        [dreId]
      );
      const ugelIds = ugelsRes.rows.map((u) => Number(u.id));
      console.log("📋 UGEL IDs encontrados:", ugelIds);

      if (ugelIds.length > 0) {
        const schoolsRes = await dbQuery(
          `SELECT id FROM minedu.school_new WHERE ugel_id = ANY($1::int[])`,
          [ugelIds]
        );
        const schoolIds = schoolsRes.rows.map((s) => Number(s.id));
        console.log("🏫 Total colegios encontrados:", schoolIds.length);

        filteredParticipations = filteredParticipations.filter((p) =>
          schoolIds.includes(Number(p.school_id))
        );
        //console.log("🎯Participaciones luego del filtro DRE:", filteredParticipations.length);
      } else {
        filteredParticipations = [];
      }
    }

    // 3️⃣ Filtro por UGEL
    if (ugelId) {
      const schoolsUgelRes = await dbQuery(
        `SELECT id FROM minedu.school_new WHERE ugel_id = $1`,
        [ugelId]
      );
      const schoolsUgelIds = schoolsUgelRes.rows.map((s) => Number(s.id));
      filteredParticipations = filteredParticipations.filter((p) =>
        schoolsUgelIds.includes(Number(p.school_id))
      );
      console.log("Participaciones luego de UGEL:", filteredParticipations.length);
    }

    if (schoolId) {
      filteredParticipations = filteredParticipations.filter(
        (p) => String(p.school_id).trim() === String(schoolId).trim()
      );
      console.log("Participaciones luego de colegio:", filteredParticipations.length);
    }

    if (nivelEducativo) {
      filteredParticipations = filteredParticipations.filter(
        (p) => p.education_level?.toLowerCase() === nivelEducativo.toLowerCase()
      );
    }
    if (grado) {
      filteredParticipations = filteredParticipations.filter(
        (p) => p.grade === grado
      );
    }

    if (filteredParticipations.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    const participationIds = filteredParticipations.map((p) => String(p.id));

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

    // 7️⃣ Agrupar por pregunta y opción
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
