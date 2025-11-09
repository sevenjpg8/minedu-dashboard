import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection"; // tu helper de conexión

export async function GET() {
  try {
    const query = `
      WITH participaciones AS (
        SELECT DISTINCT sp.school_id
        FROM minedu.survey_participations sp
        WHERE sp.completed_at IS NOT NULL
      )
      SELECT
        'Solo Primaria' AS categoria,
        COUNT(DISTINCT CASE WHEN s.nivel_educativo ILIKE '%primaria%' THEN s.id END) AS total,
        COUNT(DISTINCT CASE WHEN s.nivel_educativo ILIKE '%primaria%' AND s.gestion ILIKE '%directa%' THEN s.id END) AS publica,
        COUNT(DISTINCT CASE WHEN s.nivel_educativo ILIKE '%primaria%' AND s.gestion ILIKE '%privada%' THEN s.id END) AS privada
      FROM minedu.school_new s
      JOIN participaciones p ON p.school_id = s.id

      UNION ALL

      SELECT
        'Solo Secundaria' AS categoria,
        COUNT(DISTINCT CASE WHEN s.nivel_educativo ILIKE '%secundaria%' THEN s.id END) AS total,
        COUNT(DISTINCT CASE WHEN s.nivel_educativo ILIKE '%secundaria%' AND s.gestion ILIKE '%directa%' THEN s.id END) AS publica,
        COUNT(DISTINCT CASE WHEN s.nivel_educativo ILIKE '%secundaria%' AND s.gestion ILIKE '%privada%' THEN s.id END) AS privada
      FROM minedu.school_new s
      JOIN participaciones p ON p.school_id = s.id

      UNION ALL

      SELECT
        'A nivel de UGEL' AS categoria,
        COUNT(DISTINCT s.ugel_id) AS total,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%directa%' THEN s.ugel_id END) AS publica,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%privada%' THEN s.ugel_id END) AS privada
      FROM minedu.school_new s
      JOIN participaciones p ON p.school_id = s.id

      UNION ALL

      SELECT
        'A nivel de DRE' AS categoria,
        COUNT(DISTINCT u.dre_id) AS total,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%directa%' THEN u.dre_id END) AS publica,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%privada%' THEN u.dre_id END) AS privada
      FROM minedu.school_new s
      JOIN minedu.ugel_new u ON u.id = s.ugel_id
      JOIN participaciones p ON p.school_id = s.id;
    `;

    const { rows } = await dbQuery(query);

    // Totales nacionales (sumatoria general)
    const totalNacional = rows.reduce(
      (acc, r) => ({
        total: acc.total + Number(r.total),
        publica: acc.publica + Number(r.publica),
        privada: acc.privada + Number(r.privada),
      }),
      { total: 0, publica: 0, privada: 0 }
    );

    return NextResponse.json({
      locales: rows,
      total: totalNacional,
    });
  } catch (error) {
    console.error("❌ Error obteniendo locales:", error);
    return NextResponse.json(
      { error: "Error obteniendo locales" },
      { status: 500 }
    );
  }
}
