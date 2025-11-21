import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const query = `
      SELECT id, email, rol_id, rol, created_at, updated_at
      FROM minedu.usuarios
      ORDER BY id ASC;
    `;
    const { rows } = await dbQuery(query);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET usuarios error:", error);
    return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, rol_id, rol } = await req.json();

    if (!email || !password || !rol_id || !rol) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Validar email único
    const emailCheck = await dbQuery(
      `SELECT id FROM minedu.usuarios WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return NextResponse.json({ error: "El email ya existe" }, { status: 409 });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO minedu.usuarios (email, password, rol_id, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, rol_id, rol, created_at;
    `;

    const { rows } = await dbQuery(insertQuery, [
      email,
      hashedPassword,
      rol_id,
      rol,
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST usuarios error:", error);
    return NextResponse.json({ error: "Error creando usuario" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, email, rol_id, rol } = await req.json();

    if (!id || !email || !rol_id || !rol) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const updateQuery = `
      UPDATE minedu.usuarios
      SET email = $1,
          rol_id = $2,
          rol = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, email, rol_id, rol, updated_at;
    `;

    const { rows } = await dbQuery(updateQuery, [email, rol_id, rol, id]);

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT usuarios error:", error);
    return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const deleteQuery = `
      DELETE FROM minedu.usuarios
      WHERE id = $1;
    `;

    await dbQuery(deleteQuery, [id]);

    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("DELETE usuarios error:", error);
    return NextResponse.json({ error: "Error eliminando usuario" }, { status: 500 });
  }
}
