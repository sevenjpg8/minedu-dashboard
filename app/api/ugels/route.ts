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
      SELECT
        u.id,
        u.name,
        COALESCE(SUM(COALESCE(s.cantidad_estudiantes, 0)), 0) AS total_students,
        COALESCE(COUNT(sp.id), 0) AS completed_students
      FROM minedu.ugel_new u
      LEFT JOIN minedu.school_new_old s ON s.ugel_id = u.id
      LEFT JOIN minedu.survey_participations sp 
        ON sp.school_id = s.id
        AND sp.completed_at IS NOT NULL
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
