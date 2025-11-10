import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    const sql = `
      SELECT id, name
      FROM minedu.dres
      ORDER BY name ASC
    `;

    const result = await dbQuery(sql);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error cargando DRE:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar las DRE" },
      { status: 500 }
    );
  }
}
