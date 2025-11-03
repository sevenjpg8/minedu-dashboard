import { NextResponse } from "next/server"

export async function POST() {
  // 🔹 Crear respuesta
  const response = NextResponse.json({ message: "Logout exitoso" })

  // 🔹 Eliminar cookie (colocando maxAge=0)
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expira inmediatamente
  })

  return response
}
