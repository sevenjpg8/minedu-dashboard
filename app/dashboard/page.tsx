// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle, ChevronRight } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import React from "react"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [expandedIncident, setExpandedIncident] = useState<number | null>(null)
  const [totals, setTotals] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [locationsData, setLocationsData] = useState<any[]>([])
  const [locationsTotal, setLocationsTotal] = useState({ total: 0, publica: 0, privada: 0 })
  const [dailyProgressData, setDailyProgressData] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [incidentsData, setIncidentsData] = useState<any[]>([])
  const [totalIncidents, setTotalIncidents] = useState(0)
  const limit = 10
  const totalPages = Math.ceil(totalIncidents / limit)

  const primaryBlue = "#1e40af"
  const accentRed = "#dc2626"
  const lightBg = "#f8f9fa"
  const borderGray = "#e5e7eb"

  // 🌲 Estados jerárquicos
  const [expandedRow, setExpandedRow] = useState<"Prim." | "Sec." | null>(null)
  const [expandedSubRow, setExpandedSubRow] = useState<"Grado" | "Seccion" | null>(null)

  const toggleExpand = (row: "Prim." | "Sec.") => {
    setExpandedRow(expandedRow === row ? null : row)
    setExpandedSubRow(null)
  }

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

  const studentsData = [
    { name: "Sección", value: totals.secciones.total, public: totals.secciones.publica, private: totals.secciones.privada },
    { name: "Grado", value: totals.grados.total, public: totals.grados.publica, private: totals.grados.privada },
    { name: "Prim.", value: totals.primaria.total, public: totals.primaria.publica, private: totals.primaria.privada },
    { name: "Sec.", value: totals.secundaria.total, public: totals.secundaria.publica, private: totals.secundaria.privada },
    { name: "Local", value: totals.locales.total, public: totals.locales.publica, private: totals.locales.privada },
    { name: "UGEL", value: totals.ugels.total, public: totals.ugels.publica, private: totals.ugels.privada },
    { name: "DRE", value: totals.dres.total, public: totals.dres.publica, private: totals.dres.privada },
  ]

  const nacionalTotal = totals.colegios.total
  const nacionalPublic = totals.colegios.publica
  const nacionalPrivate = totals.colegios.privada

  return (
    <div className="min-h-screen" style={{ backgroundColor: lightBg }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-1">Panel de Gestión Educativa Nacional</h1>
          <p className="text-gray-600">Consolidación de datos de múltiples instituciones educativas</p>
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* I. Estudiantes */}
            {/* I. Estudiantes */}
            <Card className="border" style={{ borderColor: borderGray }}>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  I. Estudiantes Participantes en la Encuesta
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Desglose jerárquico por nivel, grado, sección, local, UGEL y DRE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderColor: borderGray }} className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Categoría
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          Total
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          Gestión Pública
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          Gestión Privada
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* NIVEL PRIMARIA */}
                      <tr
                        onClick={() => toggleExpand("Prim.")}
                        className="border-b hover:bg-blue-50 cursor-pointer"
                        style={{ borderColor: borderGray }}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium flex items-center gap-2">
                          Prim.
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedRow === "Prim." ? "rotate-90" : ""}`}
                          />
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {totals.primaria.total.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                          {totals.primaria.publica.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                          {totals.primaria.privada.toLocaleString()}
                        </td>
                      </tr>

                      {/* Subniveles Primaria */}
                      {expandedRow === "Prim." && (
                        <>
                          {/* Grado */}
                          <tr
                            onClick={() => toggleSubExpand("Grado")}
                            className="border-b bg-blue-50/30 cursor-pointer"
                            style={{ borderColor: borderGray }}
                          >
                            <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                              Grado
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${expandedSubRow === "Grado" ? "rotate-90" : ""
                                  }`}
                              />
                            </td>
                            <td className="text-right py-2 px-4">
                              {totals.grados.total.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: primaryBlue }}>
                              {totals.grados.publica.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: accentRed }}>
                              {totals.grados.privada.toLocaleString()}
                            </td>
                          </tr>

                          {/* Subniveles dentro de Grado */}
                          {expandedSubRow === "Grado" && (
                            <>
                              {[4, 5, 6].map((grado) => (
                                <tr
                                  key={grado}
                                  className="border-b bg-blue-50/50"
                                  style={{ borderColor: borderGray }}
                                >
                                  <td className="py-2 px-10 text-gray-600">└─ {grado}°</td>
                                  <td className="text-right py-2 px-4">–</td>
                                  <td className="text-right py-2 px-4">–</td>
                                  <td className="text-right py-2 px-4">–</td>
                                </tr>
                              ))}
                            </>
                          )}

                          {/* Sección */}
                          <tr
                            onClick={() => toggleSubExpand("Seccion")}
                            className="border-b bg-blue-50/30 cursor-pointer"
                            style={{ borderColor: borderGray }}
                          >
                            <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                              Sección
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${expandedSubRow === "Seccion" ? "rotate-90" : ""
                                  }`}
                              />
                            </td>
                            <td className="text-right py-2 px-4">
                              {totals.secciones.total.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: primaryBlue }}>
                              {totals.secciones.publica.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: accentRed }}>
                              {totals.secciones.privada.toLocaleString()}
                            </td>
                          </tr>

                          {/* Subniveles dentro de Sección */}
                          {expandedSubRow === "Seccion" && (
                            <>
                              {Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i)).map(
                                (sec) => (
                                  <tr
                                    key={sec}
                                    className="border-b bg-blue-50/50"
                                    style={{ borderColor: borderGray }}
                                  >
                                    <td className="py-2 px-10 text-gray-600">└─ Sección {sec}</td>
                                    <td className="text-right py-2 px-4">–</td>
                                    <td className="text-right py-2 px-4">–</td>
                                    <td className="text-right py-2 px-4">–</td>
                                  </tr>
                                )
                              )}
                            </>
                          )}
                        </>
                      )}

                      {/* NIVEL SECUNDARIA */}
                      <tr
                        onClick={() => toggleExpand("Sec.")}
                        className="border-b hover:bg-blue-50 cursor-pointer"
                        style={{ borderColor: borderGray }}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium flex items-center gap-2">
                          Sec.
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedRow === "Sec." ? "rotate-90" : ""}`}
                          />
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {totals.secundaria.total.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                          {totals.secundaria.publica.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                          {totals.secundaria.privada.toLocaleString()}
                        </td>
                      </tr>

                      {/* Subniveles Secundaria */}
                      {/* Subniveles Primaria */}
                      {expandedRow === "Sec." && (
                        <>
                          {/* Grado */}
                          <tr
                            onClick={() => toggleSubExpand("Grado")}
                            className="border-b bg-blue-50/30 cursor-pointer"
                            style={{ borderColor: borderGray }}
                          >
                            <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                              Grado
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${expandedSubRow === "Grado" ? "rotate-90" : ""
                                  }`}
                              />
                            </td>
                            <td className="text-right py-2 px-4">
                              {totals.grados.total.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: primaryBlue }}>
                              {totals.grados.publica.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: accentRed }}>
                              {totals.grados.privada.toLocaleString()}
                            </td>
                          </tr>

                          {/* Subniveles dentro de Grado */}
                          {expandedSubRow === "Grado" && (
                            <>
                              {[1, 2, 3, 4, 5].map((grado) => (
                                <tr
                                  key={grado}
                                  className="border-b bg-blue-50/50"
                                  style={{ borderColor: borderGray }}
                                >
                                  <td className="py-2 px-10 text-gray-600">└─ {grado}°</td>
                                  <td className="text-right py-2 px-4">–</td>
                                  <td className="text-right py-2 px-4">–</td>
                                  <td className="text-right py-2 px-4">–</td>
                                  <td className="text-right py-2 px-4">–</td>
                                  <td className="text-right py-2 px-4">–</td>
                                </tr>
                              ))}
                            </>
                          )}

                          {/* Sección */}
                          <tr
                            onClick={() => toggleSubExpand("Seccion")}
                            className="border-b bg-blue-50/30 cursor-pointer"
                            style={{ borderColor: borderGray }}
                          >
                            <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                              Sección
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${expandedSubRow === "Seccion" ? "rotate-90" : ""
                                  }`}
                              />
                            </td>
                            <td className="text-right py-2 px-4">
                              {totals.secciones.total.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: primaryBlue }}>
                              {totals.secciones.publica.toLocaleString()}
                            </td>
                            <td className="text-right py-2 px-4" style={{ color: accentRed }}>
                              {totals.secciones.privada.toLocaleString()}
                            </td>
                          </tr>

                          {/* Subniveles dentro de Sección */}
                          {expandedSubRow === "Seccion" && (
                            <>
                              {Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i)).map(
                                (sec) => (
                                  <tr
                                    key={sec}
                                    className="border-b bg-blue-50/50"
                                    style={{ borderColor: borderGray }}
                                  >
                                    <td className="py-2 px-10 text-gray-600">└─ Sección {sec}</td>
                                    <td className="text-right py-2 px-4">–</td>
                                    <td className="text-right py-2 px-4">–</td>
                                    <td className="text-right py-2 px-4">–</td>
                                  </tr>
                                )
                              )}
                            </>
                          )}
                        </>
                      )}

                      {/* LOCAL */}
                      <tr
                        className="border-b hover:bg-blue-50"
                        style={{ borderColor: borderGray }}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">Local</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {totals.locales.total.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                          {totals.locales.publica.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                          {totals.locales.privada.toLocaleString()}
                        </td>
                      </tr>

                      {/* UGEL */}
                      <tr
                        className="border-b hover:bg-blue-50"
                        style={{ borderColor: borderGray }}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">UGEL</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {totals.ugels.total.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                          {totals.ugels.publica.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                          {totals.ugels.privada.toLocaleString()}
                        </td>
                      </tr>

                      {/* DRE */}
                      <tr
                        className="border-b hover:bg-blue-50"
                        style={{ borderColor: borderGray }}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">DRE</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {totals.dres.total.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                          {totals.dres.publica.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                          {totals.dres.privada.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>

                    {/* TOTAL NACIONAL */}
                    <tfoot>
                      <tr
                        style={{ borderColor: borderGray, backgroundColor: "#f3f4f6" }}
                        className="border-t-2"
                      >
                        <td className="py-3 px-4 font-bold text-gray-900">NACIONAL</td>
                        <td className="text-right py-3 px-4 font-bold text-gray-900">
                          {totals.colegios.total.toLocaleString()}
                        </td>
                        <td
                          className="text-right py-3 px-4 font-bold"
                          style={{ color: primaryBlue }}
                        >
                          {totals.colegios.publica.toLocaleString()}
                        </td>
                        <td
                          className="text-right py-3 px-4 font-bold"
                          style={{ color: accentRed }}
                        >
                          {totals.colegios.privada.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>


            {/* II. Locales */}
            <Card className="border" style={{ borderColor: borderGray }}>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">II. Total de Locales Educativos Participantes</CardTitle>
                <CardDescription className="text-gray-600">
                  Desglose por tipo de institución y nivel de gestión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderColor: borderGray }} className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Categoría</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Gestión Pública</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Gestión Privada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationsData.map((item, idx) => (
                        <tr key={idx} style={{ borderColor: borderGray }} className="border-b hover:bg-blue-50">
                          <td className="py-3 px-4 text-gray-900">{item.categoria}</td>
                          <td className="text-right py-3 px-4 font-semibold text-gray-900">{item.total}</td>
                          <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                            {item.publica}
                          </td>
                          <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                            {item.privada}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderColor: borderGray, backgroundColor: "#f3f4f6" }} className="border-t-2">
                        <td className="py-3 px-4 font-bold text-gray-900">Nacional</td>
                        <td className="text-right py-3 px-4 font-bold text-gray-900">{locationsTotal.total}</td>
                        <td className="text-right py-3 px-4 font-bold" style={{ color: primaryBlue }}>
                          {locationsTotal.publica}
                        </td>
                        <td className="text-right py-3 px-4 font-bold" style={{ color: accentRed }}>
                          {locationsTotal.privada}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-center">
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Gestión Pública", value: locationsTotal.publica },
                          { name: "Gestión Privada", value: locationsTotal.privada },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill={primaryBlue} />
                        <Cell fill={accentRed} />
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: `1px solid ${borderGray}` }}
                        labelStyle={{ color: "#111827" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* III. Avance Diario */}
            <Card className="border" style={{ borderColor: borderGray }}>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">III. Avance Diario de Encuestas</CardTitle>
                <CardDescription className="text-gray-600">Progreso de encuestas por día de la semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dailyProgressData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={borderGray} />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: `1px solid ${borderGray}` }}
                      labelStyle={{ color: "#111827" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke={primaryBlue} strokeWidth={3} dot={{ r: 5 }} name="Total" />
                    <Line type="monotone" dataKey="public" stroke="#06b6d4" strokeWidth={2} name="Gestión Pública" />
                    <Line type="monotone" dataKey="private" stroke={accentRed} strokeWidth={2} name="Gestión Privada" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* IV. Incidencias */}
            <Card className="border" style={{ borderColor: borderGray }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <CardTitle className="text-xl text-gray-900">IV. Registro de Incidencias</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Descripción, sección, grado, local educativo y UGEL
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: borderGray }}>
                        <th className="text-left py-3 px-4 font-semibold">Descripción</th>
                        <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidentsData.map((incident) => (
                        <tr key={incident.id} className="hover:bg-blue-50 border-b" style={{ borderColor: borderGray }}>
                          <td className="py-2 px-4">{incident.description}</td>
                          <td className="py-2 px-4">
                            {new Date(incident.created_at).toLocaleString("es-PE", {
                              timeZone: "America/Lima",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Paginación */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Anterior
                    </Button>
                    <span className="flex items-center px-2">
                      {page} / {totalPages}
                    </span>
                    <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                      Siguiente
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "#f0f9ff", borderColor: borderGray }}>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Total de Incidencias:</span> {totalIncidents}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Se muestran las incidencias más recientes primero. Usa la paginación para ver más.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}