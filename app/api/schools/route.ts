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
      whereClause = `WHERE s.ugel_id = $1`
      params.push(ugelId)
    }

    const sql = `
      SELECT 
        s.id, 
        s.name,
        COALESCE(s.cantidad_estudiantes, 0) AS total_students,
        COALESCE(COUNT(sp.id), 0) AS completed_students
      FROM minedu.school_new s
      LEFT JOIN minedu.survey_participations sp 
        ON sp.school_id = s.id
        AND sp.completed_at IS NOT NULL
      ${whereClause}
      GROUP BY s.id, s.name, s.cantidad_estudiantes
      ORDER BY s.name ASC
    `

    const result = await dbQuery(sql, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error cargando colegios:", error)
    return NextResponse.json({ error: "No se pudieron cargar los colegios" }, { status: 500 })
  }
}
