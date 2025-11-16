"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ErrorAlert } from "@/components/ui/error-alert"
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/logueo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push("/dashboard")
      } else {
        const data = await res.json()
        console.warn("⚠️ Error en login:", data)
        setError(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("💥 Error de conexión o en el servidor:", error)
      setError("Error del servidor")
    } finally {
      console.log("⏳ Finalizando proceso de login")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-15 h-15 rounded flex items-center justify-center">
              <img
                src="/logo-minedu.png"
                alt="Logo Ministerio de Educación"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => {
                  console.log("✏️ Escribiendo email:", e.target.value)
                  setEmail(e.target.value)
                }}
                required
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => {
                  console.log("🔐 Escribiendo contraseña:", e.target.value)
                  setPassword(e.target.value)
                }}
                required
                className="w-full"
              />
            </div>

            {/* Footer with Links and Button */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6"
              >
                {isLoading ? "Iniciando sesión..." : "Ingresar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
