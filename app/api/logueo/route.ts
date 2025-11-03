import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient" // Asegúrate de tener esta instancia

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validación simple
    if (!email || !password) {
      return NextResponse.json({ message: "Faltan credenciales" }, { status: 400 })
    }

    // 🔹 Buscar usuario en la tabla "usuarios"
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 })
    }

    // 🔹 Verificar contraseña (en texto plano por ahora)
    // ⚠️ En producción deberías usar bcrypt.compare(password, user.password)
    if (password !== user.password) {
      return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 })
    }

    // 🔹 Si todo está bien, crear respuesta y guardar cookie
    const response = NextResponse.json({ message: "Login exitoso" })

    response.cookies.set("auth_token", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    })

    return response
  } catch (err) {
    console.error("Error en login:", err)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}
