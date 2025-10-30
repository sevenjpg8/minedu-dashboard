"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Aquí iría la lógica de autenticación
    console.log("Login attempt:", { email, password, rememberMe })
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-15 h-15 rounded flex items-center justify-center">
              <img
                src="https://minedu.anccas.org/images/logo.png"
                alt="Logo Ministerio de Educación"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Remember Me Checkbox 
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                Remember me
              </label>
            </div>*/}

            {/* Footer with Links and Button */}
            <div className="flex items-center justify-between pt-4">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                ¿Olvido su contraseña?
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-gray-800 hover:bg-gray-900 text-white px-6">
                {isLoading ? "Logging in..." : "INGRESAR"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
