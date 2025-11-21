// app/api/logs/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    // Construcción dinámica del WHERE
    let where = `WHERE (started_at IS NOT NULL OR completed_at IS NOT NULL)`

    if (dateFrom && dateTo) {
      where += ` AND DATE(COALESCE(completed_at, started_at)) BETWEEN '${dateFrom}' AND '${dateTo}'`
    } else if (dateFrom) {
      where += ` AND DATE(COALESCE(completed_at, started_at)) >= '${dateFrom}'`
    } else if (dateTo) {
      where += ` AND DATE(COALESCE(completed_at, started_at)) <= '${dateTo}'`
    }

    const query = `
      SELECT 
        id,
        codigo_estudiante,
        education_level,
        grade,
        section,
        started_at,
        completed_at
      FROM minedu.survey_participations
      ${where}
      ORDER BY COALESCE(completed_at, started_at) DESC
      LIMIT 5000;
    `

    const { rows } = await dbQuery(query)

    const logs = rows.flatMap((row: any) => {
      const baseMsg = `Nivel ${row.education_level}, Grado ${row.grade}${
        row.section ? " Sección " + row.section : ""
      }. Código estudiante: ${row.codigo_estudiante}`

      const events = []

      if (row.started_at) {
        events.push({
          id: `${row.id}-start`,
          timestamp: row.started_at,
          level: "INFO",
          message: `Inicio de encuesta - ${baseMsg}`
        })
      }

      if (row.completed_at) {
        events.push({
          id: `${row.id}-finish`,
          timestamp: row.completed_at,
          level: "SUCCESS",
          message: `Encuesta completada - ${baseMsg}`
        })
      }

      return events
    })

    // Ordenar por fecha descendente
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ logs })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error cargando logs" }, { status: 500 })
  }
}
