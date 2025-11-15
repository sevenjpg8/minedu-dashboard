"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

export default function DailyProgressSection({ data }: any) {
    const primaryBlue = "#1e40af"
    const accentRed = "#dc2626"
    const borderGray = "#e5e7eb"
    return (
        <Card className="border">
            <CardHeader>
                <CardTitle className="text-xl">III. Avance Diario</CardTitle>
                <CardDescription>Progreso nacional de la encuesta</CardDescription>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
    )
}
