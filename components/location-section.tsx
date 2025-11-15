"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts"

interface LocationItem {
  categoria: string
  total: number
  publica: number
  privada: number
}


export default function LocationsSection({ 
    locationsData = [],
    locationsTotal = { total: 0, publica: 0, privada: 0 } 
}: { 
    locationsData: LocationItem[]
    locationsTotal: { total: number; publica: number; privada: number }
}) {
    const primaryBlue = "#1e40af"
    const accentRed = "#dc2626"
    const borderGray = "#e5e7eb"

    return (
        <Card className="border">
            <CardHeader>
                <CardTitle className="text-xl">II. Total de Locales Educativos</CardTitle>
                <CardDescription>Desglose por gestión</CardDescription>
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
    )
}
