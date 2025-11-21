import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dreId = searchParams.get("dreId")

    const params: any[] = []
    let whereClause = ""
    if (dreId) {
      whereClause = `WHERE u.dre_id = $1`
      params.push(dreId)
    }

    const query = `
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
        u.id,
        u.name,
        COALESCE(SUM(agg.total_students), 0) AS total_students,
        COALESCE(SUM(comp.completed_students), 0) AS completed_students
      FROM minedu.ugel_new u
      LEFT JOIN aggregated_schools agg ON agg.ugel_id = u.id
      LEFT JOIN completed comp
        ON comp.ugel_id = u.id
        AND comp.modular_code = agg.modular_code
      ${whereClause}
      GROUP BY u.id, u.name
      ORDER BY u.name ASC
    `

    const res = await dbQuery(query, params)
    return NextResponse.json(res.rows)
  } catch (err) {
    console.error("Error cargando UGEL:", err)
    return NextResponse.json({ error: "No se pudieron cargar las UGEL" }, { status: 500 })
  }
}
