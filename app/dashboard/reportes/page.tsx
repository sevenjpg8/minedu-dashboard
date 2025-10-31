"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const generateChartData = (filterId: string) => {
  const baseData = [
    { name: "Muy en desacuerdo", "# de Respuestas": 0.2 },
    { name: "En desacuerdo", "# de Respuestas": 0.3 },
    { name: "De acuerdo", "# de Respuestas": 0.7 },
    { name: "Muy de acuerdo", "# de Respuestas": 0.8 },
  ]

  // Vary data slightly based on filter selection for demo purposes
  if (filterId) {
    return baseData.map((item) => ({
      ...item,
      "# de Respuestas": Math.min(1, item["# de Respuestas"] + Math.random() * 0.2),
    }))
  }
  return baseData
}

const ChartCard = ({ title, data }: { title: string; data: any[] }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="# de Respuestas" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default function ReportesPage() {
  const [filters, setFilters] = useState({
    encuesta: "",
    dre: "",
    ugel: "",
    colegio: "",
    colegioNombre: "",
    nivelEducativo: "",
    grado: "",
  })

  const [surveys, setSurveys] = useState<any[]>([])
  const [dres, setDres] = useState<any[]>([])
  const [ugels, setUgels] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      encuesta: "",
      dre: "",
      ugel: "",
      colegio: "",
      colegioNombre: "",
      nivelEducativo: "",
      grado: "",
    })
    setUgels([])
    setSchools([])

  }

  // Cargar encuestas y DREs al inicio
  useEffect(() => {
    fetch("/api/surveys").then((res) => res.json()).then(setSurveys)
    fetch("/api/dres").then((res) => res.json()).then(setDres)
  }, [])

  // Cargar UGELs al seleccionar DRE
  useEffect(() => {
    if (!filters.dre) {
      setUgels([])
      setSchools([])
      return
    }
    fetch(`/api/ugels?dreId=${filters.dre}`).then((res) => res.json()).then(setUgels)
  }, [filters.dre])

  // Cargar colegios al seleccionar UGEL
  useEffect(() => {
    if (!filters.ugel) {
      setSchools([])
      return
    }
    fetch(`/api/schools?ugelId=${filters.ugel}`).then((res) => res.json()).then(setSchools)
  }, [filters.ugel])

  const showCharts = filters.encuesta !== ""

  const [filteredSchools, setFilteredSchools] = useState<any[]>([])

  const handleSearchSchool = async (value: string) => {
    handleFilterChange("colegioNombre", value)
    setFilteredSchools([])

    if (!filters.ugel || value.length < 3) return // espera que escriba al menos 3 letras

    const res = await fetch(`/api/schoolsSearch?ugelId=${filters.ugel}&query=${value}`)
    const data = await res.json()
    setFilteredSchools(data)
  }

  function normalizarNivel(nivel: string): string {
    if (!nivel) return ""
    nivel = nivel.toLowerCase()

    if (nivel.includes("inicial")) return "inicial"
    if (nivel.includes("primaria")) return "primaria"
    if (nivel.includes("secundaria")) return "secundaria"

    return ""
  }


  const handleSelectSchool = (school: any) => {
    setFilteredSchools([])
    setFilters((prev) => ({
      ...prev,
      colegio: school.id,
      colegioNombre: school.name,
      nivelEducativo: normalizarNivel(school.nivel_educativo),
    }))
  }

  // 🔹 Determinar los grados disponibles según el nivel
  const level = filters.nivelEducativo || ""
  const gradeOptions =
    level.toLowerCase() === "primaria"
      ? ["1", "2", "3", "4", "5", "6"]
      : level.toLowerCase() === "secundaria"
        ? ["1", "2", "3", "4", "5"]
        : [] // 🔒 si es inicial u otro, no hay grados disponibles

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Opciones Múltiples</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* FILA 1: Encuesta y DRE */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encuesta</label>
            <select
              value={filters.encuesta}
              onChange={(e) => handleFilterChange("encuesta", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccione una encuesta --</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">DRE</label>
            <select
              value={filters.dre}
              onChange={(e) => handleFilterChange("dre", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccione una DRE --</option>
              {dres.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FILA 2: UGEL y Colegio */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">UGEL</label>
            <select
              value={filters.ugel}
              onChange={(e) => handleFilterChange("ugel", e.target.value)}
              disabled={!filters.dre}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Seleccione una UGEL --</option>
              {ugels.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colegio</label>
            <input
              type="text"
              value={filters.colegioNombre || ""}
              onChange={(e) => handleSearchSchool(e.target.value)}
              placeholder="Escribe el nombre del colegio..."
              disabled={!filters.ugel}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            {filteredSchools.length > 0 && (
              <ul className="border rounded mt-2 max-h-60 overflow-y-auto bg-white shadow">
                {filteredSchools.map((s) => (
                  <li
                    key={s.id}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectSchool(s)}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* FILA 3: Nivel educativo (siempre bloqueado) y grado */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Educativo</label>
            <select
              value={filters.nivelEducativo}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            >
              <option value="">-- Nivel automático --</option>
              <option value="inicial">Inicial</option>
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
            <select
              value={filters.grado}
              onChange={(e) => handleFilterChange("grado", e.target.value)}
              disabled={!filters.colegio || level.toLowerCase() === "inicial"} // 🔒 bloqueado si no hay colegio o si el nivel es inicial
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Todos los Grados --</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Gráficos */}
      {showCharts ? (
        <div className="grid grid-cols-2 gap-6">
          <ChartCard title="En mi colegio los y las estudiantes nos llevamos bien" data={generateChartData(filters.encuesta)} />
          <ChartCard title="Mis compañeros(as) se interesan por mí" data={generateChartData(filters.encuesta)} />
          <ChartCard title="Mis compañeros(as) me ayudan cuando lo necesito" data={generateChartData(filters.encuesta)} />
          <ChartCard title="Ayudo a mis compañeros(as) cuando lo necesitan" data={generateChartData(filters.encuesta)} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">Por favor, seleccione una encuesta para ver los resultados.</p>
        </div>
      )}
    </div>
  )
}
