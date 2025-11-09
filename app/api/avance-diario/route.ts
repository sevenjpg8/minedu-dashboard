// app/api/avance-diario/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET() {
  try {
    // 🔹 Consulta: contar encuestas completadas por día y tipo de gestión
    const query = `
      SELECT 
        TO_CHAR(completed_at, 'FMDay') AS day_name,
        s.gestion,
        COUNT(*) AS total
      FROM minedu.survey_participations sp
      JOIN minedu.school_new s ON sp.school_id = s.id
      WHERE completed_at IS NOT NULL
      GROUP BY day_name, s.gestion
      ORDER BY MIN(completed_at)
    `

    const result = await dbQuery(query)

    const dayMap: Record<string, string> = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
    }


    const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

    // Inicializamos datos por día
    const dataByDay = daysOrder.map((d) => ({
      day: d,
      total: 0,
      public: 0,
      private: 0,
    }))

    result.rows.forEach((row: any) => {
      const dayNameEng = row.day_name.trim()
      const dayName = dayMap[dayNameEng] || dayNameEng

      const index = dataByDay.findIndex((d) => d.day === dayName)
      if (index !== -1) {
        const gestion = (row.gestion || "").toLowerCase()

        if (gestion.includes("privada")) dataByDay[index].private += Number(row.total)
        else dataByDay[index].public += Number(row.total) // todo lo demás lo consideramos pública

        dataByDay[index].total += Number(row.total)
      }
    })

    return NextResponse.json({ avance: dataByDay })
  } catch (err: any) {
    console.error("Error obteniendo avance diario:", err)
    return NextResponse.json({ error: "Error al obtener el avance diario" }, { status: 500 })
  }
}
