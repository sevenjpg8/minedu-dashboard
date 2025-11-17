// components/daily-section.tsx
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

const daysOrder = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export default function DailyProgressSection({ data }: any) {
    const [today, setToday] = useState<string | null>(null)
    const primaryBlue = "#1e40af"
    const accentRed = "#dc2626"
    const borderGray = "#e5e7eb"

    useEffect(() => {
        const raw = normalize(
            new Date().toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase()
        )

        const mapToday: Record<string, string> = {
            "lunes": "Lunes",
            "martes": "Martes",
            "miércoles": "Miércoles",
            "miercoles": "Miércoles",
            "jueves": "Jueves",
            "viernes": "Viernes",
            "sábado": "Sábado",
            "sabado": "Sábado",
            "domingo": "Domingo",
        }

        setToday(mapToday[raw] || "Lunes")
    }, [])

    if (!today) return null // evitar SSR y renders incorrectos

    const orderedData = [...data].sort(
        (a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
    )

    const todayIndex = daysOrder.indexOf(today!)
    const rotatedData = [
        ...orderedData.slice(todayIndex + 1),
        ...orderedData.slice(0, todayIndex + 1)
    ]

    const filteredData = rotatedData


    return (
        <Card className="border">
            <CardHeader>
                <CardTitle className="text-xl">III. Avance Diario</CardTitle>
                <CardDescription>Progreso nacional de la encuesta</CardDescription>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
