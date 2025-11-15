import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    // 1. Totales por nivel (solo estudiantes que completaron)
    const nivelQuery = `
      SELECT
        education_level,
        COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL
      GROUP BY education_level;
    `;
    const { rows: niveles } = await dbQuery(nivelQuery);

    // 2. Totales por grado y sección para primaria
    const primariaGradosQuery = `
      SELECT grade, COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL AND education_level ILIKE 'primaria'
      GROUP BY grade
      ORDER BY grade;
    `;
    const { rows: primariaGrados } = await dbQuery(primariaGradosQuery);

    const primariaSeccionesQuery = `
      SELECT grade, section, COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL AND education_level ILIKE 'primaria'
      GROUP BY grade, section
      ORDER BY grade, section;
    `;
    const { rows: primariaSecciones } = await dbQuery(primariaSeccionesQuery);

    // 3. Totales por grado y sección para secundaria
    const secundariaGradosQuery = `
      SELECT grade, COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL AND education_level ILIKE 'secundaria'
      GROUP BY grade
      ORDER BY grade;
    `;
    const { rows: secundariaGrados } = await dbQuery(secundariaGradosQuery);

    const secundariaSeccionesQuery = `
      SELECT grade, section, COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL AND education_level ILIKE 'secundaria'
      GROUP BY grade, section
      ORDER BY grade, section;
    `;
    const { rows: secundariaSecciones } = await dbQuery(secundariaSeccionesQuery);

    // 4. Totales nacionales
    const nacionalQuery = `
      SELECT COUNT(*) AS total
      FROM minedu.survey_participations
      WHERE completed_at IS NOT NULL;
    `;
    const { rows: nacionalRows } = await dbQuery(nacionalQuery);
    const totalNacional = nacionalRows[0]?.total ?? 0;

    return NextResponse.json({
      totals: {
        primaria: {
          grados: primariaGrados,
          secciones: primariaSecciones,
          total: niveles.find((n) => n.education_level.toLowerCase() === "primaria")?.total ?? 0,
        },
        secundaria: {
          grados: secundariaGrados,
          secciones: secundariaSecciones,
          total: niveles.find((n) => n.education_level.toLowerCase() === "secundaria")?.total ?? 0,
        },
        nacional: totalNacional,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error obteniendo totales" }, { status: 500 });
  }
}
