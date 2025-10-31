"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <nav className="flex gap-8">
          <Link
            href="/dashboard"
            className={`pb-4 border-b-2 font-medium transition-colors ${isActive("/dashboard")
                ? "text-gray-900 border-blue-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/encuestas"
            className={`pb-4 border-b-2 font-medium transition-colors ${isActive("/dashboard/encuestas")
                ? "text-gray-900 border-blue-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
          >
            Encuestas
          </Link>
          <Link
            href="/dashboard/reportes"
            className={`pb-4 border-b-2 font-medium transition-colors ${isActive("/dashboard/reportes")
                ? "text-gray-900 border-blue-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
          >
            Reportes
          </Link>
          <Link
            href="/dashboard/importar"
            className={`pb-4 border-b-2 font-medium transition-colors ${
              isActive("/dashboard/importar")
                ? "text-gray-900 border-blue-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Importar Colegios
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
         <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Admin MINEDU
            <ChevronDown size={16} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Perfil
              </a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Configuración
              </a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-200">
                Cerrar sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
