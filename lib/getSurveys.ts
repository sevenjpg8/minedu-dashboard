// app/lib/dbSurveys.ts
import { dbQuery } from "@/app/config/connection"

export interface Survey {
  id: number
  title: string
  description: string
  unique_link_slug: string
  starts_at: string
  ends_at: string
  is_active: boolean
}

export async function getSurveys(): Promise<Survey[]> {
  try {
    const res = await dbQuery(
      `
        SELECT id, title, description, unique_link_slug, starts_at, ends_at, is_active
        FROM minedu.surveys
        ORDER BY id ASC
      `
    )

    return res.rows
  } catch (err) {
    console.error("Error al obtener encuestas:", err)
    return []
  }
}
