import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const offset = (page - 1) * limit

    // 🔹 Consulta: traer incidencias ordenadas por últimos envíos
    const query = `
      SELECT id, description, created_at, updated_at
      FROM minedu.incidencias
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `
    const result = await dbQuery(query, [limit, offset])

    // 🔹 Total de incidencias
    const countResult = await dbQuery(`SELECT COUNT(*) FROM minedu.incidencias`)
    const total = Number(countResult.rows[0].count)

    return NextResponse.json({ incidencias: result.rows, total })
  } catch (err: any) {
    console.error("Error obteniendo incidencias:", err)
    return NextResponse.json({ error: "Error al obtener incidencias" }, { status: 500 })
  }
}
