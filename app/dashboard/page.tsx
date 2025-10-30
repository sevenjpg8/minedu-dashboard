"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, BarChart3, Users, FileText, School } from "lucide-react"

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState("total")

  // Datos de ejemplo que varían según el filtro
  const getStats = () => {
    const stats = {
      total: {
        encuestas: 1247,
        estudiantes: 15430,
        respuestas: 125430,
        colegios: 89,
        tasaRespuesta: 85.2,
        cambioEncuestas: 15.2,
        cambioEstudiantes: 12.5,
        cambioRespuestas: 18.3,
        cambioColegios: 5.2,
      },
      mensual: {
        encuestas: 189,
        estudiantes: 2850,
        respuestas: 23850,
        colegios: 15,
        tasaRespuesta: 82.1,
        cambioEncuestas: 8.4,
        cambioEstudiantes: 6.2,
        cambioRespuestas: 10.5,
        cambioColegios: -2.1,
      },
      semanal: {
        encuestas: 47,
        estudiantes: 920,
        respuestas: 5920,
        colegios: 4,
        tasaRespuesta: 78.5,
        cambioEncuestas: -2.1,
        cambioEstudiantes: 3.5,
        cambioRespuestas: 1.2,
        cambioColegios: 0,
      },
    }
    return stats[timeFilter as keyof typeof stats]
  }

  const stats = getStats()

  const StatCard = ({ icon: Icon, label, value, unit = "", change, isPositive = true, highlight = false }: any) => (
    <div
      className={`rounded-lg p-6 ${highlight ? "border-2 border-blue-300 bg-blue-50" : "bg-white border border-gray-200"} shadow-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value.toLocaleString()}
            {unit}
          </p>
        </div>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      {change !== undefined && (
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? "+" : ""}
          {change}% vs. período anterior
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Encuestas</h1>
          <p className="text-gray-600 mt-1">Resumen de participación y respuestas</p>
        </div>
        <div className="flex gap-2">
          {["total", "mensual", "semanal"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeFilter === filter
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjeta principal grande */}
      <div className="bg-white rounded-lg border-2 border-blue-300 p-8 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Encuestas - {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total de Encuestas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.encuestas.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Estudiantes Participantes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.estudiantes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Cambio vs. período anterior</p>
            <div
              className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full font-bold text-lg ${
                stats.cambioEncuestas >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {stats.cambioEncuestas >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {stats.cambioEncuestas >= 0 ? "+" : ""}
              {stats.cambioEncuestas}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas medianas */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={BarChart3}
          label="Total"
          value={stats.encuestas}
          change={stats.cambioEncuestas}
          isPositive={stats.cambioEncuestas >= 0}
          highlight={true}
        />
        <StatCard
          icon={Users}
          label="Estudiantes Participantes"
          value={stats.estudiantes}
          change={stats.cambioEstudiantes}
          isPositive={stats.cambioEstudiantes >= 0}
        />
        <StatCard
          icon={FileText}
          label="Total de Respuestas"
          value={stats.respuestas}
          change={stats.cambioRespuestas}
          isPositive={stats.cambioRespuestas >= 0}
        />
      </div>

      {/* Grid de tarjetas inferiores */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <School className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Colegios Registrados</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.colegios}</p>
          <p className="text-gray-600 text-sm mt-2">Instituciones educativas participantes</p>
          <div
            className={`inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-sm font-semibold ${
              stats.cambioColegios >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {stats.cambioColegios >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {stats.cambioColegios >= 0 ? "+" : ""}
            {stats.cambioColegios}%
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Tasa de Respuesta</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.tasaRespuesta}%</p>
          <p className="text-gray-600 text-sm mt-2">Porcentaje de participación promedio</p>
        </div>
      </div>
    </div>
  )
}
