"use client"

import { X, Link2 } from "lucide-react"
import type { Question } from "@/types/surveys"

interface LinkQuestionsModalProps {
  isOpen: boolean
  questions: Question[]
  selectedNextQuestion: number | null
  onToggleNextQuestion: (questionId: number) => void
  onSave: () => void
  onCancel: () => void
}

export function LinkQuestionsModal({
  isOpen,
  questions,
  selectedNextQuestion,
  onToggleNextQuestion,
  onSave,
  onCancel,
}: LinkQuestionsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Pregunta Siguiente</h2>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              Selecciona la pregunta que debe aparecer cuando se elija esta respuesta.
            </p>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {questions.length > 0 ? (
              questions.map((q, idx) => (
                <label
                  key={q.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="next-question"
                    checked={selectedNextQuestion === q.id}
                    onChange={() => onToggleNextQuestion(q.id)}
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">Pregunta {idx + 1}</p>
                    <p className="text-sm text-gray-600 break-words">{q.text}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay preguntas disponibles</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Guardar Enlace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
