"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [rol, setRol] = useState<"admin" | "especialista" | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => pathname === path

  // 🔹 Leer cookie y obtener rol
useEffect(() => {
  async function fetchRol() {
    try {
      const res = await fetch("/api/me", { credentials: "include" })
      const data = await res.json()
      if (data.rol_id === 1) setRol("admin")
      else if (data.rol_id === 2) setRol("especialista")
    } catch (e) {
      console.error("Error obteniendo rol:", e)
    }
  }
  fetchRol()
}, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) router.push("/login")
      else alert("Error al cerrar sesión")
    } catch (error) {
      console.error(error)
      alert("Error del servidor")
    }
  }

  // 🔹 Definimos menús según el rol
  const menuItems =
    rol === "admin"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/encuestas", label: "Encuestas" },
          { href: "/dashboard/resultados", label: "Reportes" },
          { href: "/dashboard/tabla-progreso", label: "Progreso" },
          { href: "/dashboard/importar", label: "Importar Colegios" },
        ]
      : rol === "especialista"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/resultados", label: "Reportes" },
          { href: "/dashboard/tabla-progreso", label: "Progreso" },
        ]
      : []

  if (!rol) return <div className="p-4">Cargando menú...</div>

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <nav className="flex gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`pb-4 border-b-2 font-medium transition-colors ${
                isActive(item.href)
                  ? "text-gray-900 border-blue-500"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            {rol === "admin" ? "Admin MINEDU" : "Especialista MINEDU"}
            <ChevronDown size={16} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Configuración
              </a>
              <a
                href="#"
                onClick={handleLogout}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-200"
              >
                Cerrar sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
