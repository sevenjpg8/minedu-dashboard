"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "./ui/button"

interface IncidentItem {
  id: number
  description: string
  created_at: string
}

export default function IncidentsSection({ data, total, page, limit, setPage }: {
  data: IncidentItem[],
  total: number,
  page: number,
  limit: number,
  setPage: (n: number) => void
}) {
    const totalPages = Math.ceil(total / limit)
    const borderGray = "#e5e7eb"

    return (
        <Card className="border">
            <CardHeader>
                <CardTitle className="text-xl">IV. Incidencias Reportadas</CardTitle>
                <CardDescription>Casos reportados por instituciones educativas</CardDescription>
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
                            {data.map((incident: IncidentItem) => (
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
                        <span className="font-semibold">Total de Incidencias:</span> {total}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Se muestran las incidencias más recientes primero. Usa la paginación para ver más.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
