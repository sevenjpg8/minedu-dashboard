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
      params.push(Number(ugelId))
    }

    const sql = `
      WITH ea_totals AS (
        SELECT
          ea.school_id,
          LOWER(regexp_replace(regexp_replace(TRIM(COALESCE(ea.nombre_colegio, '')), '\\s+', ' ', 'g'), '[^a-z0-9 ]', '', 'g')) AS name_key,
          SUM(COALESCE(ea.cantidad_estudiantes, 0)) AS total_students
        FROM minedu.encuesta_acceso ea
        GROUP BY ea.school_id, name_key
      ),
      school_base AS (
        SELECT
          s.id,
          s.id_unico,
          s.ugel_id,
          s.name,
          s.nivel_educativo,
          LOWER(regexp_replace(regexp_replace(TRIM(COALESCE(s.name, '')), '\\s+', ' ', 'g'), '[^a-z0-9 ]', '', 'g')) AS name_key,
          COALESCE(ea.total_students, 0) AS cantidad_estudiantes
        FROM minedu.school_new s
        LEFT JOIN ea_totals ea ON ea.school_id = s.id
      ),
      aggregated_schools AS (
        SELECT
          MIN(id)::text AS id,
          MIN(id_unico)::text AS id_unico,
          ugel_id,
          MAX(name) AS name,
          MAX(nivel_educativo) AS nivel,
          name_key,
          SUM(cantidad_estudiantes) AS total_students
        FROM school_base
        GROUP BY ugel_id, name_key
      ),
      completions AS (
        SELECT
          sb.ugel_id,
          sb.name_key,
          COUNT(sp.id) AS completed_students
        FROM school_base sb
        LEFT JOIN minedu.survey_participations sp
          ON sp.school_id = sb.id
          AND sp.completed_at IS NOT NULL
        GROUP BY sb.ugel_id, sb.name_key
      )
      SELECT 
        agg.id,
        agg.id_unico,
        agg.name,
        agg.nivel,
        agg.total_students,
        COALESCE(comp.completed_students, 0) AS completed_students
      FROM aggregated_schools agg
      LEFT JOIN completions comp
        ON comp.ugel_id = agg.ugel_id
        AND comp.name_key = agg.name_key
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
