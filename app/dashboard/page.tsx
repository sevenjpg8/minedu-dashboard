// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"

import StudentsSection from "@/components/student-section"
import LocationsSection from "@/components/location-section"
import DailyProgressSection from "@/components/daily-section"
import IncidentsSection from "@/components/incidents-section"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [totals, setTotals] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [locationsData, setLocationsData] = useState<any[]>([])
  const [locationsTotal, setLocationsTotal] = useState({ total: 0, publica: 0, privada: 0 })
  const [dailyProgressData, setDailyProgressData] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [incidentsData, setIncidentsData] = useState<any[]>([])
  const [totalIncidents, setTotalIncidents] = useState(0)
  const limit = 10

  const lightBg = "#f8f9fa"

  const [expandedSubRow, setExpandedSubRow] = useState<"Grado" | "Seccion" | null>(null)


  const toggleSubExpand = (sub: "Grado" | "Seccion") => {
    setExpandedSubRow(expandedSubRow === sub ? null : sub)
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totRes, locRes, avanceRes] = await Promise.all([
          fetch("/api/totales"),
          fetch("/api/locales"),
          fetch("/api/avance-diario"),
        ])

        const totData = await totRes.json()
        const locData = await locRes.json()
        const avanceData = await avanceRes.json()

        setTotals(totData.totals)
        setLocationsData(locData.locales)
        setLocationsTotal(locData.total)
        setDailyProgressData(avanceData.avance)
      } catch (err) {
        setError("Error al cargar los datos del servidor")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(`/api/incidencias?page=${page}&limit=${limit}`)
        const data = await res.json()
        setIncidentsData(data.incidencias)
        setTotalIncidents(data.total)
      } catch (err) {
        console.error(err)
      }
    }

    fetchIncidents()
  }, [page])

  if (loading) {
    return <div className="p-8 text-center text-gray-700">Cargando datos...</div>
  }

  if (error || !totals) {
    return <div className="p-8 text-center text-red-600">{error || "No se encontraron datos"}</div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: lightBg }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-1">Panel de Gestión Educativa Nacional</h1>
          <p className="text-gray-600">Consolidación de datos de múltiples instituciones educativas</p>
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <StudentsSection totals={totals} />
            <LocationsSection locationsData={locationsData} locationsTotal={locationsTotal} />
            <DailyProgressSection data={dailyProgressData} />
            <IncidentsSection
              data={incidentsData}
              total={totalIncidents}
              page={page}
              limit={limit}
              setPage={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}