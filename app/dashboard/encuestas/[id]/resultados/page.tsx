//dashboard/encuestas/[id]/resultados/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ResultadosPage() {
  const { id } = useParams()
  const [charts, setCharts] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/reportes?encuesta=${id}`)
      const data = await res.json()
      if (data.success) setCharts(data.charts)
    }
    if (id) fetchData()
  }, [id])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Resultados de la Encuesta</h1>

      {charts.map((chart) => (
        <div key={chart.question} className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold mb-3">{chart.question}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="# de Respuestas" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
