"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import StatsGrid from "@/app/dashboard/StatsGrid"

export default function DirectorDashboard() {
  const [accessData, setAccessData] = useState<any>(null)

  useEffect(() => {
    console.log("📊 Cargando dashboard DEMO...")

    // ✅ Datos ficticios del director
    const fakeAccessData = {
      institution: "IE San Martín de Porres",
      level: "Secundaria",
      dre: "DRE Lima",
      ugel: "UGEL 04",
      codigoDirector: "DIR123456",
    }

    // Simulación de carga
    setTimeout(() => {
      setAccessData(fakeAccessData)
      console.log("✅ Datos ficticios cargados:", fakeAccessData)
    }, 800)
  }, [])

  if (!accessData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando datos de demostración...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <br />
      <Card className="p-6 max-w-5xl mx-auto bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {accessData.institution} ({accessData.level})
        </h2>

        <p className="text-gray-600 mb-6">
          DRE: {accessData.dre} • UGEL: {accessData.ugel}
        </p>

        {/* ✅ Pasamos el código ficticio del director */}
        <StatsGrid codigoDirector={accessData.codigoDirector} />
      </Card>
    </main>
  )
}
