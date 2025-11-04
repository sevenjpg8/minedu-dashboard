import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan credenciales" }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, password, rol_id") // 👈 Traemos también el rol_id
      .eq("email", email)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 })
    }

    if (password !== user.password) {
      return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 })
    }

    // 🔹 Guardamos tanto el id como el rol_id
    const payload = { id: user.id, rol_id: user.rol_id }
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64")

    const response = NextResponse.json({ message: "Login exitoso" })
    response.cookies.set("auth_token", encoded, {
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
