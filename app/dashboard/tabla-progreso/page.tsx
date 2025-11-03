"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HierarchicalProgressTable } from "@/components/ui/hierarchical-progress-table"
import { BarChart3, Navigation2, TrendingUp } from "lucide-react"

export default function TablaProgresoPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tabla de Progreso de Encuestas</h1>
          <p className="text-slate-600">
            Monitorea en tiempo real el avance de la encuesta nacional por región, unidad de gestión educativa y colegio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Navigation2 className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Navegación Jerárquica</h3>
                  <p className="text-sm text-slate-600">
                    Comienza en Regiones (DRE), luego explora UGELs y finalmente Colegios. Usa el botón "Atrás" para
                    regresar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Progreso en Tiempo Real</h3>
                  <p className="text-sm text-slate-600">
                    Las barras de color indican avance: Verde ≥80%, Amarillo ≥50%, Rojo &lt;50%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="text-purple-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Búsqueda Rápida</h3>
                  <p className="text-sm text-slate-600">
                    Busca por nombre en cualquier nivel. Filtra en tiempo real sin distracciones de otros elementos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Table */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-900">Progreso por Región</CardTitle>
            <CardDescription>Tabla interactiva de DREs, UGELs y Colegios con progreso de encuestas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <HierarchicalProgressTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
