import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    const gestionPublicaFilter =
      "translate(lower(coalesce(s.gestion, '')), 'áéíóúÁÉÍÓÚ', 'aeiouaeiou') LIKE '%publica%'";
    const gestionPrivadaFilter =
      "translate((coalesce(s.gestion, '')), 'áéíóúÁÉÍÓÚ', 'aeiouaeiou') LIKE 'Privada'";

    // 1. Totales por nivel (solo estudiantes que completaron)
    const nivelQuery = `
      SELECT
        sp.education_level,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ${gestionPublicaFilter}) AS publica,
        COUNT(*) FILTER (WHERE ${gestionPrivadaFilter}) AS privada
      FROM minedu.survey_participations sp
      LEFT JOIN minedu.school_new s ON s.id = sp.school_id
      WHERE sp.completed_at IS NOT NULL
        AND s.gestion IS NOT NULL
      GROUP BY sp.education_level;
    `;
    const { rows: niveles } = await dbQuery(nivelQuery);

    // 2. Totales por grado y sección para primaria
    const primariaGradosQuery = `
      SELECT
        sp.grade,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ${gestionPublicaFilter}) AS publica,
        COUNT(*) FILTER (WHERE ${gestionPrivadaFilter}) AS privada
      FROM minedu.survey_participations sp
      LEFT JOIN minedu.school_new s ON s.id = sp.school_id
      WHERE sp.completed_at IS NOT NULL
        AND s.gestion IS NOT NULL
        AND sp.education_level ILIKE 'primaria'
        AND sp.grade::text ILIKE ANY(ARRAY['4%', '5%', '6%'])
      GROUP BY sp.grade
      ORDER BY sp.grade;
    `;
    const { rows: primariaGrados } = await dbQuery(primariaGradosQuery);

    const primariaSeccionesQuery = `
      SELECT
        sp.grade,
        sp.section,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ${gestionPublicaFilter}) AS publica,
        COUNT(*) FILTER (WHERE ${gestionPrivadaFilter}) AS privada
      FROM minedu.survey_participations sp
      LEFT JOIN minedu.school_new s ON s.id = sp.school_id
      WHERE sp.completed_at IS NOT NULL
        AND s.gestion IS NOT NULL
        AND sp.education_level ILIKE 'primaria'
        AND sp.grade::text ILIKE ANY(ARRAY['4%', '5%', '6%'])
      GROUP BY sp.grade, sp.section
      ORDER BY sp.grade, sp.section;
    `;
    const { rows: primariaSecciones } = await dbQuery(primariaSeccionesQuery);

    // 3. Totales por grado y sección para secundaria
    const secundariaGradosQuery = `
      SELECT
        sp.grade,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ${gestionPublicaFilter}) AS publica,
        COUNT(*) FILTER (WHERE ${gestionPrivadaFilter}) AS privada
      FROM minedu.survey_participations sp
      LEFT JOIN minedu.school_new s ON s.id = sp.school_id
      WHERE sp.completed_at IS NOT NULL
        AND s.gestion IS NOT NULL
        AND sp.education_level ILIKE 'secundaria'
      GROUP BY sp.grade
      ORDER BY sp.grade;
    `;
    const { rows: secundariaGrados } = await dbQuery(secundariaGradosQuery);

    const secundariaSeccionesQuery = `
      SELECT
        sp.grade,
        sp.section,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ${gestionPublicaFilter}) AS publica,
        COUNT(*) FILTER (WHERE ${gestionPrivadaFilter}) AS privada
      FROM minedu.survey_participations sp
      LEFT JOIN minedu.school_new s ON s.id = sp.school_id
      WHERE sp.completed_at IS NOT NULL
        AND s.gestion IS NOT NULL
        AND sp.education_level ILIKE 'secundaria'
      GROUP BY sp.grade, sp.section
      ORDER BY sp.grade, sp.section;
    `;
    const { rows: secundariaSecciones } = await dbQuery(secundariaSeccionesQuery);

    // 4. Totales nacionales
    const nacionalQuery = `
      SELECT COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL;
    `;
    const { rows: nacionalRows } = await dbQuery(nacionalQuery);
    const totalNacional = Number(nacionalRows[0]?.total ?? 0);

    const normalizeLevel = (level: unknown) =>
      typeof level === "string" ? level.toLowerCase() : "";
    const primariaNivel = niveles.find((n) => normalizeLevel(n.education_level) === "primaria") ?? {};
    const secundariaNivel = niveles.find((n) => normalizeLevel(n.education_level) === "secundaria") ?? {};

    const nacionalPublica = niveles.reduce((acc, nivel) => acc + Number(nivel.publica ?? 0), 0);
    const nacionalPrivada = niveles.reduce((acc, nivel) => acc + Number(nivel.privada ?? 0), 0);

    return NextResponse.json({
      totals: {
        primaria: {
          grados: primariaGrados,
          secciones: primariaSecciones,
          total: Number(primariaNivel.total ?? 0),
          publica: Number(primariaNivel.publica ?? 0),
          privada: Number(primariaNivel.privada ?? 0),
        },
        secundaria: {
          grados: secundariaGrados,
          secciones: secundariaSecciones,
          total: Number(secundariaNivel.total ?? 0),
          publica: Number(secundariaNivel.publica ?? 0),
          privada: Number(secundariaNivel.privada ?? 0),
        },
        nacional: totalNacional,
        colegios: {
          total: totalNacional,
          publica: nacionalPublica,
          privada: nacionalPrivada,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error obteniendo totales" }, { status: 500 });
  }
}
