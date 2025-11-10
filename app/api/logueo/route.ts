import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function POST(req: Request) {
  try {
    console.log("🔹 [LOGIN] Petición recibida");

    const { email, password } = await req.json();
    console.log("📩 Datos recibidos:", { email, password });

    if (!email || !password) {
      console.warn("⚠️ Faltan credenciales");
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

    console.log("🔍 Ejecutando consulta SQL:", sql, "con parámetros:", [email]);
    const result = await dbQuery(sql, [email]);

    console.log("📊 Resultado de la consulta:", result.rows);

    const user = result.rows[0];

    if (!user) {
      console.warn("❌ Usuario no encontrado para el email:", email);
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    console.log("👤 Usuario encontrado:", user);

    if (password !== user.password) {
      console.warn("🚫 Contraseña incorrecta para:", email);
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      rol_id: user.rol_id,
    };

    console.log("🧩 Payload para token:", payload);

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    console.log("🔑 Token codificado:", encoded);

    const response = NextResponse.json({ message: "Login exitoso" });

    response.cookies.set("auth_token", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    console.log("🍪 Cookie configurada correctamente");

    return response;
  } catch (err) {
    console.error("💥 Error en login:", err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
