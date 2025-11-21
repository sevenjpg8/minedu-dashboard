// app/dashboard/visor-logs/page.tsx
"use client"

import { useState, useMemo, Dispatch, SetStateAction, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"

type LogLevel = "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "DEBUG"

interface Log {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  user?: string
}

const getLevelColor = (level: LogLevel) => {
  const colors = {
    INFO: "bg-blue-100 text-blue-700 border-blue-300",
    WARNING: "bg-amber-100 text-amber-700 border-amber-300",
    ERROR: "bg-red-100 text-red-700 border-red-300",
    SUCCESS: "bg-green-100 text-green-700 border-green-300",
    DEBUG: "bg-purple-100 text-purple-700 border-purple-300",
  }
  return colors[level]
}

export default function LogsViewer() {
  const [dateFilter, setDateFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [logs, setLogs] = useState<Log[]>([])
  const itemsPerPage = 15

  const fetchLogs = async () => {
    let url = "/api/logs"

    if (dateFilter) {
      url += `?date_from=${dateFilter}&date_to=${dateFilter}`
    }

    const res = await fetch(url)
    const data = await res.json()
    setLogs(data.logs)
  }

  useEffect(() => {
    fetchLogs()
  }, [dateFilter])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs()
    }, 5000)

    return () => clearInterval(interval)
  }, [dateFilter])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      let matchesDate = true;

      if (dateFilter) {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        matchesDate = logDate === dateFilter;
      }

      const matchesLevel =
      levelFilter === "all" ? true : log.level === levelFilter

      const matchesSearch = searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase())
      : true

      return matchesDate && matchesLevel && matchesSearch
    })
  }, [logs, dateFilter, levelFilter, searchQuery])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)
  const maxVisible = 5

  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)

  // Ajustar si estamos al inicio y no hay suficientes páginas
  if (endPage - startPage < maxVisible - 1) {
  startPage = Math.max(1, endPage - maxVisible + 1)
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  )

  const handleClear = () => {
    setDateFilter("")
    setLevelFilter("all")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const handleFilterChange = <T,>(value: unknown, setter: Dispatch<SetStateAction<T>>) => {
    setter(value as unknown as T)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Visor de Logs del Sistema</h1>
          <p className="text-gray-600">Explora, filtra y busca a través de los logs de encuestas nacionales</p>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Aviso Importante:</span> Se están realizando mejoras en este módulo para la
            visualización de información relevante (15/11 al 20/11).
          </p>
        </div>

        {/* Filters Card */}
        <Card className="border-gray-200 bg-gray-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleFilterChange(e.target.value, setDateFilter)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nivel</label>
                <Select value={levelFilter} onValueChange={(value) => handleFilterChange(value, setLevelFilter)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="SUCCESS">Éxito</SelectItem>
                    <SelectItem value="WARNING">Advertencia</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Buscar Mensaje</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Escribe para buscar..."
                    value={searchQuery}
                    onChange={(e) => handleFilterChange(e.target.value, setSearchQuery)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 pl-10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-end">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nivel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mensaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`${getLevelColor(log.level)} border`}>
                            {log.level}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                          {new Date(log.timestamp).toLocaleString("es-PE", {
                            timeZone: "America/Lima",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{log.message}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron logs que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Mostrando {filteredLogs.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredLogs.length)} de{" "}
            {filteredLogs.length} registros
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {visiblePages.map((page) => (
                <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                    currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white"
                    }
                >
                    {page}
                </Button>
                ))}
            </div>

            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total de registros: {filteredLogs.length}</span>
          <span>Última actualización: hace 2 minutos</span>
        </div>
      </div>
    </div>
  )
}
