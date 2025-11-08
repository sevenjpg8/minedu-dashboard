"use client"

import { X, Edit2 } from "lucide-react"

interface EditQuestionModalProps {
  isOpen: boolean
  questionText: string
  questionPrefix: string
  questionDescription: string
  onQuestionTextChange: (value: string) => void
  onQuestionPrefixChange: (value: string) => void
  onQuestionDescriptionChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export function EditQuestionModal({
  isOpen,
  questionText,
  questionPrefix,
  questionDescription,
  onQuestionTextChange,
  onQuestionPrefixChange,
  onQuestionDescriptionChange,
  onSave,
  onCancel,
}: EditQuestionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-end z-[70] p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto slide-in-from-right">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Edit2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Editar Pregunta</h2>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pregunta</label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => onQuestionTextChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texto de la pregunta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefijo o Tema</label>
            <textarea
              value={questionPrefix}
              onChange={(e) => onQuestionPrefixChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción adicional"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
