// app/api/importar/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No hay datos para importar." }, { status: 400 })
    }

    // Iniciar transacción
    await dbQuery("BEGIN")

    try {
      for (const row of data) {
        const {
          cod_mod,
          anexo,
          education_level,
          name,
          ugel, 
          departamento,
          provincia,
          distrito,
          area,
          codigo_estudiante,
          codigo_director,
          gestion,
          cantidad_estudiantes,
        } = row

        // Validaciones mínimas
        if (!cod_mod || !education_level || !codigo_estudiante) {
          console.warn("Fila omitida por datos incompletos:", row)
          continue
        }

        // Ejecutar la función de inserción
        await dbQuery(
          `
          SELECT minedu.importar_colegio_y_encuesta(
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
          );
          `,
          [
            cod_mod,
            anexo,
            education_level,
            name,
            departamento,
            provincia,
            distrito,
            area,
            codigo_estudiante,
            codigo_director,
            gestion,
            cantidad_estudiantes ? Number(cantidad_estudiantes) : 0,
            ugel,
          ]
        )
      }

      // Confirmar transacción
      await dbQuery("COMMIT")
      return NextResponse.json({ message: "Importación completada correctamente ✅" })
    } catch (err) {
      console.error("Error durante la importación:", err)
      await dbQuery("ROLLBACK")
      return NextResponse.json({ error: "Error al importar los datos." }, { status: 500 })
    }
  } catch (err) {
    console.error("Error general:", err)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
