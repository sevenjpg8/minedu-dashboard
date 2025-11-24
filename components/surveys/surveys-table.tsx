"use client"
import { Trash2, Edit2 } from "lucide-react"
import type { Survey } from "@/types/surveys"

interface SurveysTableProps {
  surveys: Survey[]
  loading: boolean
  onEdit: (survey: Survey) => void
  onDelete: (id: number) => void
}

export function SurveysTable({ surveys, loading, onEdit, onDelete }: SurveysTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">TITULO</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">NIVEL</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ESTADO</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">FECHAS</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center py-6 text-gray-500">
                Cargando encuestas...
              </td>
            </tr>
          ) : surveys.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-6 text-gray-500">
                No hay encuestas registradas aún
              </td>
            </tr>
          ) : (
            surveys.map((survey) => (
              <tr key={survey.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900 font-medium">{survey.title}</p>
                    <p className="text-gray-600 text-sm">{survey.description}</p>
                  </div>
                </td>

                {/* 👇 NUEVA COLUMNA NIVEL */}
                <td className="px-6 py-4 text-gray-700 text-sm">
                  {survey.level || "—"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-block ${survey.status === "Activa" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      } text-xs font-semibold px-3 py-1 rounded-full`}
                  >
                    {survey.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  <p>Inicio: {survey.startDate || "-"}</p>
                  <p>Fin: {survey.endDate || "-"}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEdit(survey)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(survey.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
