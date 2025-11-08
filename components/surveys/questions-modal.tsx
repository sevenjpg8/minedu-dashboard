"use client"

import type React from "react"
import { X, Plus, GripVertical, Edit2, Trash2 } from "lucide-react"
import type { Question } from "@/types/surveys"

interface QuestionsModalProps {
  isOpen: boolean
  questions: Question[]
  newQuestion: string
  newQuestionPrefix: string
  draggedIndex: number | null
  onNewQuestionChange: (value: string) => void
  onNewQuestionPrefixChange: (value: string) => void
  onAddQuestion: () => void
  onDeleteQuestion: (id: number) => void
  onEditQuestion: (question: Question) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (index: number) => void
  onClose: () => void
}

export function QuestionsModal({
  isOpen,
  questions,
  newQuestion,
  newQuestionPrefix,
  draggedIndex,
  onNewQuestionChange,
  onNewQuestionPrefixChange,
  onAddQuestion,
  onDeleteQuestion,
  onEditQuestion,
  onDragStart,
  onDragOver,
  onDrop,
  onClose,
}: QuestionsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .question-item {
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            animation: slideIn 0.2s ease-out;
          }
          .question-item.dragging {
            opacity: 0.4;
            transform: scale(0.95);
          }
        `}</style>

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Gestionar Preguntas</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              💡 <span className="font-semibold">Tip:</span> Puede desplazar o mover el orden de las preguntas
              arrastrando desde el icono de agarre (≡) a la izquierda de cada pregunta.
            </p>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(index)}
                  className={`question-item flex items-start justify-between bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-lg border border-blue-200 cursor-move hover:shadow-md ${
                    draggedIndex === index ? "dragging" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical
                      size={20}
                      className="text-blue-600 mt-1 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-600 mb-1">Pregunta {index + 1}</p>
                      <p className="text-gray-800">{question.text}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEditQuestion(question)}
                    className="text-blue-600 hover:text-blue-800 ml-4 mt-1 flex-shrink-0 transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(question.id)}
                    className="text-red-600 hover:text-red-800 ml-2 mt-1 flex-shrink-0 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay preguntas añadidas aún</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Pregunta</label>
            <div className="space-y-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => onNewQuestionChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onAddQuestion()}
                placeholder="Escriba la pregunta"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Escriba el prefijo o tema de la pregunta"
                value={newQuestionPrefix}
                onChange={(e) => onNewQuestionPrefixChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={onAddQuestion}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Añadir
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
