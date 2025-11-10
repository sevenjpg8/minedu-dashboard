import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Faltan credenciales" },
        { status: 400 }
      );
    }

    const sql = `
      SELECT id, password, rol_id
      FROM minedu.usuarios
      WHERE email = $1
      LIMIT 1
    `;

    const result = await dbQuery(sql, [email]);

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    if (password !== user.password) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      rol_id: user.rol_id,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");

    const response = NextResponse.json({ message: "Login exitoso" });

    response.cookies.set("auth_token", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (err) {
    console.error("Error en login:", err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
