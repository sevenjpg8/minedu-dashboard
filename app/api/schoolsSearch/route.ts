// app/api/schoolsSearch/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ugelId = searchParams.get("ugelId")
    const query = searchParams.get("query")

    if (!ugelId || !query) {
      return NextResponse.json([])
    }

    const sql = `
      SELECT id, name, nivel_educativo
      FROM minedu.school_new_old
      WHERE ugel_id = $1
        AND name ILIKE $2
      ORDER BY name ASC
      LIMIT 20
    `

    const params = [Number(ugelId), `%${query}%`]

    const result = await dbQuery(sql, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("❌ Error en /api/schoolsSearch:", error)
    return NextResponse.json([], { status: 500 })
  }
}
