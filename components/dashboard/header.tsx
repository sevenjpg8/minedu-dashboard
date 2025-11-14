"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // 🔹 Cerrar dropdown si se hace clic fuera
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

  // 🔹 Menús según rol
  const menuItems =
    rol === "admin"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/encuestas", label: "Encuestas" },
          { href: "/dashboard/resultados", label: "Resultados" },
          { href: "/dashboard/tabla-progreso", label: "Progreso" },
          { href: "/dashboard/importar", label: "Importar Colegios" },
        ]
      : rol === "especialista"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/resultados", label: "Resultados" },
          { href: "/dashboard/tabla-progreso", label: "Progreso" },
        ]
      : []

  if (!rol) return <div className="p-4 text-center">Cargando menú...</div>

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between relative">
      {/* 🔹 LOGO o título */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-lg font-semibold text-blue-600">MINEDU</span>
      </div>

      {/* 🔹 Navegación desktop */}
      <nav className="hidden md:flex gap-8">
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

      {/* 🔹 Perfil y dropdown */}
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
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
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

      {/* 🔹 Menú móvil */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md z-10 md:hidden animate-fade-in">
          <nav className="flex flex-col p-4 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-2 rounded-md font-medium ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
