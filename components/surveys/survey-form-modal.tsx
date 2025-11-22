"use client"

import type React from "react"
import { X, Plus, Edit2, Settings, Trash2 } from "lucide-react"
import type { Question, FormData } from "@/types/surveys"

interface SurveyFormModalProps {
  isOpen: boolean
  editingId: number | null
  formData: FormData
  questions: Question[]
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onAddQuestion: () => void
  onOpenQuestionsModal: () => void
  onOpenAnswersModal: (questionId: number) => void
  onOpenEditQuestionModal: (question: Question) => void
  onDeleteQuestion: (id: number) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function SurveyFormModal({
  isOpen,
  editingId,
  formData,
  questions,
  onInputChange,
  onAddQuestion,
  onOpenQuestionsModal,
  onOpenAnswersModal,
  onOpenEditQuestionModal,
  onDeleteQuestion,
  onSubmit,
  onClose,
}: SurveyFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {editingId ? `Editando Encuesta: ${formData.title}` : "Crear Nueva Encuesta"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el título de la encuesta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese la descripción de la encuesta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={onInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Activa
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel Educativo
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>


          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Preguntas ({questions.length})</h3>
              <button
                type="button"
                onClick={onOpenQuestionsModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Añadir Pregunta
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-700">
                💡 <span className="font-semibold">Tip:</span> Si quieres volver a editar el orden o descripcion de la
                pregunta, haz clic en "Añadir Pregunta".
              </p>
            </div>

            <div className="space-y-2">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="text-gray-700">
                      {index + 1}. {question.text}
                    </p>
                    {question.answers && question.answers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{question.answers.length} opciones de respuesta</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEditQuestionModal(question)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar pregunta"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAnswersModal(question.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Gestionar respuestas"
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay preguntas añadidas aún</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Guardar Encuesta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
