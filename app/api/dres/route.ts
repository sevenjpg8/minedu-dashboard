import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET() {
  try {
    const sql = `
      WITH aggregated_schools AS (
        SELECT
          COALESCE(NULLIF(TRIM(s.cod_mod::text), ''), s.id::text) AS modular_code,
          s.ugel_id,
          SUM(COALESCE(s.cantidad_estudiantes, 0)) AS total_students
        FROM minedu.school_new s
        GROUP BY modular_code, s.ugel_id
      ),
      completed AS (
        SELECT
          COALESCE(NULLIF(TRIM(s.cod_mod::text), ''), s.id::text) AS modular_code,
          s.ugel_id,
          COUNT(sp.id) AS completed_students
        FROM minedu.school_new s
        LEFT JOIN minedu.survey_participations sp
          ON sp.school_id = s.id
          AND sp.completed_at IS NOT NULL
        GROUP BY modular_code, s.ugel_id
      )
      SELECT 
        d.id,
        d.name,
        COALESCE(SUM(agg.total_students), 0) AS total_students,
        COALESCE(SUM(comp.completed_students), 0) AS completed_students
      FROM minedu.dres d
      LEFT JOIN minedu.ugel_new u ON u.dre_id = d.id
      LEFT JOIN aggregated_schools agg ON agg.ugel_id = u.id
      LEFT JOIN completed comp
        ON comp.ugel_id = u.id
        AND comp.modular_code = agg.modular_code
      GROUP BY d.id, d.name
      ORDER BY d.name ASC
    `

    const result = await dbQuery(sql)

    return NextResponse.json(result.rows)
  } catch (err) {
    console.error("Error cargando DRE:", err)
    return NextResponse.json({ error: "No se pudieron cargar las DRE" }, { status: 500 })
  }
}
