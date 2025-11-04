import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  if (!token) {
    return NextResponse.json({ rol_id: null }, { status: 401 })
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    return NextResponse.json({ rol_id: decoded.rol_id })
  } catch {
    return NextResponse.json({ rol_id: null }, { status: 400 })
  }
}
