// app/api/colegios/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ugelId = searchParams.get("ugelId")

    const params: any[] = []
    let whereClause = ""

    if (ugelId) {
      whereClause = `WHERE agg.ugel_id = $1`
      params.push(ugelId)
    }

    const sql = `
      WITH school_base AS (
        SELECT
          s.id,
          s.ugel_id,
          s.name,
          s.cantidad_estudiantes,
          COALESCE((regexp_match(s.name, '^[0-9]+'))[1], s.id::text) AS modular_code
        FROM minedu.school_new s
      ),
      aggregated_schools AS (
        SELECT
          MIN(id)::text AS id,
          ugel_id,
          modular_code,
          MAX(name) AS name,
          SUM(COALESCE(cantidad_estudiantes, 0)) AS total_students
        FROM school_base
        GROUP BY ugel_id, modular_code
      ),
      completions AS (
        SELECT
          sb.ugel_id,
          sb.modular_code,
          COUNT(sp.id) AS completed_students
        FROM school_base sb
        LEFT JOIN minedu.survey_participations sp
          ON sp.school_id = sb.id
          AND sp.completed_at IS NOT NULL
        GROUP BY sb.ugel_id, sb.modular_code
      )
      SELECT 
        agg.id,
        agg.name,
        agg.total_students,
        COALESCE(comp.completed_students, 0) AS completed_students
      FROM aggregated_schools agg
      LEFT JOIN completions comp
        ON comp.ugel_id = agg.ugel_id
        AND comp.modular_code = agg.modular_code
      ${whereClause}
      ORDER BY agg.name ASC
    `

    const result = await dbQuery(sql, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error cargando colegios:", error)
    return NextResponse.json({ error: "No se pudieron cargar los colegios" }, { status: 500 })
  }
}
