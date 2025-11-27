import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET() {
  try {
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
          LOWER(regexp_replace(regexp_replace(TRIM(COALESCE(s.name, '')), '\\s+', ' ', 'g'), '[^a-z0-9 ]', '', 'g')) AS name_key,
          COALESCE(ea.total_students, 0) AS cantidad_estudiantes
        FROM minedu.school_new s
        LEFT JOIN ea_totals ea ON ea.school_id = s.id
      ),
      aggregated_schools AS (
        SELECT
          ugel_id,
          name_key,
          SUM(cantidad_estudiantes) AS total_students
        FROM school_base
        GROUP BY ugel_id, name_key
      ),
      completed AS (
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
        d.id,
        d.name,
        COALESCE(SUM(agg.total_students), 0) AS total_students,
        COALESCE(SUM(comp.completed_students), 0) AS completed_students
      FROM minedu.dres d
      LEFT JOIN minedu.ugel_new u ON u.dre_id = d.id
      LEFT JOIN aggregated_schools agg ON agg.ugel_id = u.id
      LEFT JOIN completed comp
        ON comp.ugel_id = u.id
        AND comp.name_key = agg.name_key
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
