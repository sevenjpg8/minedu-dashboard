// app/api/reportes/route.ts
import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

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

    // ✅ 1. Obtener participaciones de la encuesta
    const participationsQuery = `
      SELECT id, survey_id, school_id, education_level, grade
      FROM minedu.survey_participations
      WHERE survey_id = $1
    `;
    const participationsRes = await dbQuery(participationsQuery, [surveyId]);
    let participations = participationsRes.rows;

    if (participations.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    let filtered = participations;

    // ✅ FILTROS

    // ✅ Filtro por DRE → obtener UGELs → obtener colegios → filtrar participaciones
    if (dreId) {
      const ugelsRes = await dbQuery(
        "SELECT id FROM minedu.ugel_new WHERE dre_id = $1",
        [dreId]
      );
      const ugelIds = ugelsRes.rows.map(r => r.id);

      if (ugelIds.length > 0) {
        const schoolsRes = await dbQuery(
          "SELECT id FROM minedu.school_new WHERE ugel_id = ANY($1)",
          [ugelIds]
        );
        const schoolsIds = schoolsRes.rows.map(r => r.id);

        filtered = filtered.filter(p => schoolsIds.includes(p.school_id));
      }
    }

    // ✅ Filtro por UGEL
    if (ugelId) {
      const schoolsRes = await dbQuery(
        "SELECT id FROM minedu.school_new WHERE ugel_id = $1",
        [ugelId]
      );

      const schoolIds = schoolsRes.rows.map(r => r.id);
      filtered = filtered.filter(p => schoolIds.includes(p.school_id));
    }

    // ✅ Filtro por Colegio
    if (schoolId) {
      filtered = filtered.filter(
        p => String(p.school_id) === String(schoolId)
      );
    }

    // ✅ Filtro por Nivel educativo
    if (nivelEducativo) {
      filtered = filtered.filter(
        p => p.education_level.toLowerCase() === nivelEducativo.toLowerCase()
      );
    }

    // ✅ Filtro por Grado
    if (grado) {
      filtered = filtered.filter(p => p.grade === grado);
    }

    if (filtered.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    // ✅ 3. Obtener respuestas de las participaciones filtradas
    const participationIds = filtered.map(p => p.id);

    const answersQuery = `
      SELECT 
        a.id,
        q.text AS question_text,
        o.text AS option_text
      FROM minedu.answers a
      LEFT JOIN minedu.questions q ON q.id = a.question_id
      LEFT JOIN minedu.options o ON o.id = a.option_id
      WHERE a.survey_participation_id = ANY($1)
    `;

    const answersRes = await dbQuery(answersQuery, [participationIds]);
    const answers = answersRes.rows;

    if (answers.length === 0) {
      return NextResponse.json({ success: true, charts: [] });
    }

    // ✅ 4. Agrupar por pregunta y opción
    const grouped: Record<string, Record<string, number>> = {};

    for (const row of answers) {
      const pregunta = row.question_text || "Sin pregunta";
      const opcion = row.option_text || "Sin opción";

      if (!grouped[pregunta]) grouped[pregunta] = {};
      if (!grouped[pregunta][opcion]) grouped[pregunta][opcion] = 0;

      grouped[pregunta][opcion]++;
    }

    // ✅ 5. Convertir formato para Recharts
    const charts = Object.entries(grouped).map(([pregunta, opciones]) => ({
      question: pregunta,
      data: Object.entries(opciones).map(([name, count]) => ({
        name,
        "# de Respuestas": count,
      })),
    }));

    return NextResponse.json({ success: true, charts });
  } catch (err) {
    console.error("❌ Error en /api/reportes:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
