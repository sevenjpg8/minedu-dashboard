import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dreId = searchParams.get("dreId")

    let query = `SELECT id, name FROM minedu.ugel_new`
    const params: any[] = []

    if (dreId) {
      query += ` WHERE dre_id=$1`
      params.push(dreId)
    }

    query += ` ORDER BY name ASC`

    const res = await dbQuery(query, params)
    return NextResponse.json(res.rows)
  } catch (err) {
    console.error("Error cargando UGEL:", err)
    return NextResponse.json({ error: "No se pudieron cargar las UGEL" }, { status: 500 })
  }
}
