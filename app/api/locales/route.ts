// app/api/locales/route.ts
import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    const query = `
      WITH participaciones AS (
        SELECT DISTINCT 
          sp.school_id,
          sp.education_level
        FROM minedu.survey_participations sp
        WHERE sp.school_id IS NOT NULL
      )

      -- PRIMARIA
      SELECT
        'Solo Primaria' AS categoria,
        COUNT(DISTINCT CASE WHEN p.education_level ILIKE '%primaria%' THEN p.school_id END)::int AS total,
        COUNT(DISTINCT CASE WHEN p.education_level ILIKE '%primaria%' AND s.gestion ILIKE '%Pública%' THEN p.school_id END)::int AS publica,
        COUNT(DISTINCT CASE WHEN p.education_level ILIKE '%primaria%' AND s.gestion ILIKE '%Privada%' THEN p.school_id END)::int AS privada
      FROM participaciones p
      JOIN minedu.school_new s ON s.id = p.school_id

      UNION ALL

      -- SECUNDARIA
      SELECT
        'Solo Secundaria' AS categoria,
        COUNT(DISTINCT CASE WHEN p.education_level ILIKE '%secundaria%' THEN p.school_id END)::int AS total,
        COUNT(DISTINCT CASE WHEN p.education_level ILIKE '%secundaria%' AND s.gestion ILIKE '%Pública%' THEN p.school_id END)::int AS publica,
        COUNT(DISTINCT CASE WHEN p.education_level ILIKE '%secundaria%' AND s.gestion ILIKE '%Privada%' THEN p.school_id END)::int AS privada
      FROM participaciones p
      JOIN minedu.school_new s ON s.id = p.school_id

      UNION ALL

      -- UGEL
      SELECT
        'A nivel de UGEL' AS categoria,
        COUNT(DISTINCT s.ugel_id)::int AS total,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%Pública%' THEN s.ugel_id END)::int AS publica,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%Privada%' THEN s.ugel_id END)::int AS privada
      FROM participaciones p
      JOIN minedu.school_new s ON s.id = p.school_id
      WHERE s.ugel_id IS NOT NULL

      UNION ALL

      -- DRE
      SELECT
        'A nivel de DRE' AS categoria,
        COUNT(DISTINCT u.dre_id)::int AS total,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%Pública%' THEN u.dre_id END)::int AS publica,
        COUNT(DISTINCT CASE WHEN s.gestion ILIKE '%Privada%' THEN u.dre_id END)::int AS privada
      FROM participaciones p
      JOIN minedu.school_new s ON s.id = p.school_id
      JOIN minedu.ugel_new u ON u.id = s.ugel_id
      WHERE u.dre_id IS NOT NULL;
    `;

    const { rows } = await dbQuery(query);

    const colegios = {
      total: rows
        .filter(r => r.categoria === 'Solo Primaria' || r.categoria === 'Solo Secundaria')
        .reduce((acc, r) => ({
          total: acc.total + Number(r.total),
          publica: acc.publica + Number(r.publica),
          privada: acc.privada + Number(r.privada),
        }), { total: 0, publica: 0, privada: 0 })
    };

    const ugelRow = rows.find(r => r.categoria === 'A nivel de UGEL') ?? { total: 0, publica: 0, privada: 0 };
    const dreRow = rows.find(r => r.categoria === 'A nivel de DRE') ?? { total: 0, publica: 0, privada: 0 };

    const totalNacional = rows
      .filter(r => r.categoria === "Solo Primaria" || r.categoria === "Solo Secundaria")
      .reduce(
        (acc, r) => ({
          total: acc.total + r.total,
          publica: acc.publica + r.publica,
          privada: acc.privada + r.privada,
        }),
        { total: 0, publica: 0, privada: 0 }
      );


    return NextResponse.json({
      locales: rows,
      total: {
        total: totalNacional.total,
        publica: totalNacional.publica,
        privada: totalNacional.privada,
      },
       totales: {
         colegios,
         ugel: {
           total: Number(ugelRow.total ?? 0),
           publica: Number(ugelRow.publica ?? 0),
           privada: Number(ugelRow.privada ?? 0)
         },
         dre: {
           total: Number(dreRow.total ?? 0),
           publica: Number(dreRow.publica ?? 0),
           privada: Number(dreRow.privada ?? 0)
         }
       }
    });
  } catch (error: any) {
    console.error("❌ Error obteniendo locales:", error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? "Error obteniendo locales" },
      { status: 500 }
    );
  }
}
