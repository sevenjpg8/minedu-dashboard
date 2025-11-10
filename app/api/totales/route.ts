import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    const query = `
      WITH colegios AS (
        SELECT
          gestion,
          COUNT(DISTINCT s.id) AS total_colegios,
          COUNT(DISTINCT u.id) AS total_ugels,
          COUNT(DISTINCT d.id) AS total_dres
        FROM minedu.school_new s
        LEFT JOIN minedu.ugel_new u ON s.ugel_id = u.id
        LEFT JOIN minedu.dres d ON u.dre_id = d.id
        GROUP BY gestion
      )
      SELECT
        COALESCE(SUM(total_colegios), 0) AS colegios_total,
        COALESCE(SUM(CASE WHEN gestion ILIKE '%directa%' THEN total_colegios END), 0) AS colegios_publica,
        COALESCE(SUM(CASE WHEN gestion ILIKE '%privada%' THEN total_colegios END), 0) AS colegios_privada,
        COALESCE(SUM(total_ugels), 0) AS ugels_total,
        COALESCE(SUM(total_dres), 0) AS dres_total
      FROM colegios;
    `;

    const { rows } = await dbQuery(query);
    const row = rows[0];

    return NextResponse.json({
      totals: {
        secciones: { total: 5, publica: 3, privada: 2 },
        grados: { total: 6, publica: 4, privada: 2 },
        primaria: { total: 3, publica: 2, privada: 1 },
        secundaria: { total: 4, publica: 3, privada: 1 },
        locales: {
          total: row.colegios_total,
          publica: row.colegios_publica,
          privada: row.colegios_privada,
        },
        ugels: {
          total: row.ugels_total,
          publica: row.ugels_total - 1,
          privada: 1,
        },
        dres: {
          total: row.dres_total,
          publica: row.dres_total - 1,
          privada: 1,
        },
        colegios: {
          total: row.colegios_total,
          publica: row.colegios_publica,
          privada: row.colegios_privada,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error obteniendo totales" }, { status: 500 });
  }
}
