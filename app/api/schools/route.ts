// app/api/colegios/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ugelId = searchParams.get("ugelId")

    let sql = `
      SELECT id, name
      FROM minedu.school_new
    `
    const params: any[] = []

    if (ugelId) {
      sql += ` WHERE ugel_id = $1`
      params.push(ugelId)
    }

    sql += ` ORDER BY name ASC`

    const result = await dbQuery(sql, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("❌ Error cargando colegios:", error)
    return NextResponse.json(
      { error: "No se pudieron cargar los colegios" },
      { status: 500 }
    )
  }
}
