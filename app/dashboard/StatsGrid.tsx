"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import {
  BarChart,
  Bar,
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
import { Users, BookOpen, Building2, MapPin, Search, Filter, TrendingUp } from "lucide-react"

interface StatsGridProps {
  codigoDirector: string
}

interface NivelData {
  education_level: string
  total_grados: number
  total_secciones: number
  total_participaciones: number
}

interface Totales {
  total_colegios: number
  total_ugeles: number
  total_dres: number
}

interface ColegioData {
  id: string
  nombre: string
  ugel: string
  dre: string
  provincia: string
  estudiantes: number
  locales: number
  grados: number
  porcentaje_participacion: number
}

export default function StatsGridImproved({ codigoDirector }: StatsGridProps) {
  const [niveles, setNiveles] = useState<NivelData[]>([])
  const [totales, setTotales] = useState<Totales | null>(null)
  const [colegios, setColegios] = useState<ColegioData[]>([])
  const [filtroUGEL, setFiltroUGEL] = useState("")
  const [filtroBusqueda, setFiltroBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/director-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo_director: codigoDirector }),
        })
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
        const data = await res.json()
        setNiveles(data.niveles || [])
        setTotales(data.totales || null)
        setColegios(data.colegios || generateMockColegios())
      } catch (err) {
        console.error("Error al obtener estadísticas:", err)
        setColegios(generateMockColegios())
      } finally {
        setLoading(false)
      }
    }
    if (codigoDirector) fetchStats()
  }, [codigoDirector])

  const generateMockColegios = (): ColegioData[] => [
    {
      id: "C001",
      nombre: "IE Mariscal Castilla",
      ugel: "UGEL 01",
      dre: "DRE Lima",
      provincia: "Lima",
      estudiantes: 520,
      locales: 3,
      grados: 5,
      porcentaje_participacion: 95,
    },
    {
      id: "C002",
      nombre: "IE Francisco Bolognesi",
      ugel: "UGEL 02",
      dre: "DRE Lima",
      provincia: "Lima",
      estudiantes: 480,
      locales: 2,
      grados: 5,
      porcentaje_participacion: 88,
    },
    {
      id: "C003",
      nombre: "IE Jorge Basadre",
      ugel: "UGEL 03",
      dre: "DRE Lima",
      provincia: "Huaura",
      estudiantes: 350,
      locales: 2,
      grados: 4,
      porcentaje_participacion: 92,
    },
    {
      id: "C004",
      nombre: "IE Garcilaso de la Vega",
      ugel: "UGEL 01",
      dre: "DRE Lima",
      provincia: "Lima",
      estudiantes: 620,
      locales: 4,
      grados: 6,
      porcentaje_participacion: 97,
    },
    {
      id: "C005",
      nombre: "IE Técnica San Felipe",
      ugel: "UGEL 02",
      dre: "DRE Lima",
      provincia: "Lima",
      estudiantes: 450,
      locales: 2,
      grados: 5,
      porcentaje_participacion: 85,
    },
  ]

  const colegiosFiltrados = colegios.filter((c) => {
    const cumpleUGEL = !filtroUGEL || c.ugel === filtroUGEL
    const cumpleBusqueda = !filtroBusqueda || c.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
    return cumpleUGEL && cumpleBusqueda
  })

  const ugelUnicas = [...new Set(colegios.map((c) => c.ugel))]
  const dreUnicas = [...new Set(colegios.map((c) => c.dre))]

  const totalEstudiantesRegional = colegiosFiltrados.reduce((sum, c) => sum + c.estudiantes, 0)
  const totalColegiosRegional = colegiosFiltrados.length
  const totalLocalesRegional = colegiosFiltrados.reduce((sum, c) => sum + c.locales, 0)
  const promParticipacion =
    colegiosFiltrados.length > 0
      ? Math.round(colegiosFiltrados.reduce((sum, c) => sum + c.porcentaje_participacion, 0) / colegiosFiltrados.length)
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const chartData = niveles.map((n) => ({
    name: n.education_level,
    participantes: n.total_participaciones,
    grados: n.total_grados,
    secciones: n.total_secciones,
  }))

  const datosGraficoColegios = colegiosFiltrados.map((c) => ({
    nombre: c.nombre.substring(0, 12),
    estudiantes: c.estudiantes,
    participacion: c.porcentaje_participacion,
  }))

  const datosDistribucionDRE = dreUnicas.map((dre) => ({
    nombre: dre,
    value: colegiosFiltrados.filter((c) => c.dre === dre).reduce((sum, c) => sum + c.estudiantes, 0),
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="w-full space-y-6 p-6">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-4xl font-bold text-foreground">Panel de Gestión Educativa Regional</h1>
        <p className="text-muted-foreground">Consolidación de datos de múltiples instituciones educativas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Building2}
          title="Colegios"
          value={totalColegiosRegional}
          color="bg-blue-50 dark:bg-blue-950"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          icon={Users}
          title="Estudiantes"
          value={totalEstudiantesRegional}
          color="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          icon={MapPin}
          title="Locales"
          value={totalLocalesRegional}
          color="bg-amber-50 dark:bg-amber-950"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          icon={BookOpen}
          title="Promedio Est."
          value={totalColegiosRegional > 0 ? Math.round(totalEstudiantesRegional / totalColegiosRegional) : 0}
          color="bg-purple-50 dark:bg-purple-950"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <MetricCard
          icon={TrendingUp}
          title="Part. Promedio"
          value={promParticipacion}
          color="bg-rose-50 dark:bg-rose-950"
          iconColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="border border-border rounded-lg bg-card p-4 space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <Filter className="h-5 w-5 text-primary" />
          <span>Filtros de Búsqueda</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar institución..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filtroUGEL}
            onChange={(e) => setFiltroUGEL(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las UGELs</option>
            {ugelUnicas.map((ugel) => (
              <option key={ugel} value={ugel}>
                {ugel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border border-border rounded-lg bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold text-lg">
            <div className="flex items-center gap-3">
              <BarChart className="h-5 w-5 text-primary" />
              <span>Estadísticas por Nivel Educativo</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 border-t border-border">
            <div className="space-y-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        color: "var(--color-foreground)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="participantes" fill="#3b82f6" name="Participantes" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="grados" fill="#10b981" name="Grados" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="secciones" fill="#f59e0b" name="Secciones" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold">Nivel Educativo</th>
                      <th className="px-4 py-3 text-center font-semibold">Participantes</th>
                      <th className="px-4 py-3 text-center font-semibold">Grados</th>
                      <th className="px-4 py-3 text-center font-semibold">Secciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {niveles.map((n, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{n.education_level}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {n.total_participaciones}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {n.total_grados}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {n.total_secciones}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {totales && (
          <AccordionItem value="item-2" className="border border-border rounded-lg bg-card overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold text-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Resumen de Instituciones</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Locales Educativos</p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totales.total_colegios}</p>
                    </div>
                    <Building2 className="h-10 w-10 text-blue-300 dark:text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">UGEL</p>
                      <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                        {totales.total_ugeles}
                      </p>
                    </div>
                    <MapPin className="h-10 w-10 text-emerald-300 dark:text-emerald-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">DRE</p>
                      <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{totales.total_dres}</p>
                    </div>
                    <BookOpen className="h-10 w-10 text-amber-300 dark:text-amber-600" />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="item-3" className="border border-border rounded-lg bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold text-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Análisis de Participación</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {niveles.map((n, idx) => {
                const percentage = totales
                  ? Math.round(
                      (n.total_participaciones / niveles.reduce((sum, x) => sum + x.total_participaciones, 0)) * 100,
                    )
                  : 0
                return (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{n.education_level}</h3>
                      <span className="text-sm font-bold text-primary">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{n.total_participaciones} estudiantes</p>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-multi-colegios" className="border border-border rounded-lg bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold text-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Análisis Comparativo de Instituciones</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 border-t border-border">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <h3 className="font-semibold mb-4 text-foreground">Estudiantes por Institución</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosGraficoColegios} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis
                        dataKey="nombre"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="var(--color-muted-foreground)"
                      />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                      />
                      <Bar dataKey="estudiantes" fill="#3b82f6" name="Estudiantes" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-80">
                  <h3 className="font-semibold mb-4 text-foreground">Distribución por DRE</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosDistribucionDRE}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {datosDistribucionDRE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Resumen por Dirección Regional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dreUnicas.map((dre) => {
                    const colegiosDRE = colegiosFiltrados.filter((c) => c.dre === dre)
                    const estudiantesDRE = colegiosDRE.reduce((sum, c) => sum + c.estudiantes, 0)
                    return (
                      <div
                        key={dre}
                        className="p-4 border border-border/50 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <p className="font-semibold text-foreground mb-2">{dre}</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            Colegios: <span className="font-semibold text-foreground">{colegiosDRE.length}</span>
                          </p>
                          <p>
                            Estudiantes:{" "}
                            <span className="font-semibold text-foreground">{estudiantesDRE.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-registro-colegios"
          className="border border-border rounded-lg bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold text-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Registro Detallado de Instituciones ({colegiosFiltrados.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 border-t border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Institución</th>
                    <th className="px-4 py-3 text-left font-semibold">UGEL</th>
                    <th className="px-4 py-3 text-left font-semibold">DRE</th>
                    <th className="px-4 py-3 text-center font-semibold">Estudiantes</th>
                    <th className="px-4 py-3 text-center font-semibold">Locales</th>
                    <th className="px-4 py-3 text-center font-semibold">Grados</th>
                    <th className="px-4 py-3 text-center font-semibold">Participación</th>
                  </tr>
                </thead>
                <tbody>
                  {colegiosFiltrados.map((colegio, idx) => (
                    <tr key={colegio.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-muted-foreground">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3 font-medium">{colegio.nombre}</td>
                      <td className="px-4 py-3">{colegio.ugel}</td>
                      <td className="px-4 py-3">{colegio.dre}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                          {colegio.estudiantes}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
                          {colegio.locales}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                          {colegio.grados}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
                          {colegio.porcentaje_participacion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  title,
  value,
  color,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  color: string
  iconColor: string
}) {
  return (
    <div className={`${color} rounded-lg p-6 border border-border`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  )
}
