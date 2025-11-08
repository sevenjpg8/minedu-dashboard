// app/api/surveys/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET() {
  try {
    const result = await dbQuery(
      `
      SELECT 
        id,
        title,
        description,
        starts_at,
        ends_at,
        is_active
      FROM minedu.surveys
      ORDER BY id ASC
      `
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("❌ Error cargando encuestas:", error)
    return NextResponse.json(
      { error: "No se pudieron cargar las encuestas" },
      { status: 500 }
    )
  }
}
