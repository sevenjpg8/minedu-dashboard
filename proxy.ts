import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("auth_token")?.value

  // Ignorar assets y API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Si no hay token e intenta ir al dashboard → redirige al login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Si tiene token e intenta ir al login → redirige al dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 🔹 Si hay token, verificamos el rol
  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
      const rol_id = decoded.rol_id

      // 🔒 Restricciones para ESPECIALISTA (rol_id = 2)
      if (rol_id === 2 && pathname.startsWith("/dashboard/encuestas")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

    } catch (error) {
      console.error("Error decodificando token:", error)
      // Si el token está corrupto o inválido → cerrar sesión
      const res = NextResponse.redirect(new URL("/login", req.url))
      res.cookies.delete("auth_token")
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
