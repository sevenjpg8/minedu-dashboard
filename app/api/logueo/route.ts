import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Validar campos
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Por favor, completa todos los campos" },
        { status: 400 }
      );
    }

    // 2️⃣ Buscar usuario
    const query = `
      SELECT id, password, rol_id
      FROM minedu.usuarios
      WHERE email = $1
      LIMIT 1;
    `;
    const result = await dbQuery(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 3️⃣ Validar contraseña
    if (password !== user.password) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 4️⃣ Crear token
    const payload = {
      id: user.id,
      rol_id: user.rol_id,
    };
    const token = Buffer.from(JSON.stringify(payload)).toString("base64");

    // 5️⃣ Configurar cookie
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: payload,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: false, // Cambiar a true en producción
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (err) {
    console.error("Error en /api/logueo:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
