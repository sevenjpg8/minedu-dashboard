import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET() {
  try {
    const sql = `
      SELECT 
        d.id,
        d.name,
        COALESCE(SUM(COALESCE(s.cantidad_estudiantes, 0)), 0) AS total_students,
        COALESCE(COUNT(sp.id), 0) AS completed_students
      FROM minedu.dres d
      LEFT JOIN minedu.ugel_new u ON u.dre_id = d.id
      LEFT JOIN minedu.school_new_old s ON s.ugel_id = u.id
      LEFT JOIN minedu.survey_participations sp 
        ON sp.school_id = s.id
        AND sp.completed_at IS NOT NULL
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
