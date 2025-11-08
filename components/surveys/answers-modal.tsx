"use client"

import type React from "react"
import { X, Plus, GripVertical, Trash2, Link2 } from "lucide-react"
import type { Answer } from "@/types/surveys"

interface AnswersModalProps {
  isOpen: boolean
  answers: Answer[]
  newAnswer: string
  draggedAnswerIndex: number | null
  onNewAnswerChange: (value: string) => void
  onAddAnswer: () => void
  onDeleteAnswer: (id: number) => void
  onOpenLinkQuestions: (answerId: number) => void
  onDragStartAnswer: (index: number) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDropAnswer: (index: number) => void
  onSave: () => void
  onCancel: () => void
}

export function AnswersModal({
  isOpen,
  answers,
  newAnswer,
  draggedAnswerIndex,
  onNewAnswerChange,
  onAddAnswer,
  onDeleteAnswer,
  onOpenLinkQuestions,
  onDragStartAnswer,
  onDragOver,
  onDropAnswer,
  onSave,
  onCancel,
}: AnswersModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
        <style>{`
          .answer-item {
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            animation: slideIn 0.2s ease-out;
          }
          .answer-item.dragging {
            opacity: 0.4;
            transform: scale(0.95);
          }
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
        `}</style>

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Opciones de Respuesta</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700">
              💡 <span className="font-semibold">Tip:</span> Agregue las opciones de respuesta para esta pregunta. Puede
              desplazarlas para cambiar el orden. Usa el icono 🔗 para enlazar preguntas siguientes.
            </p>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {answers.length > 0 ? (
              answers.map((answer, index) => (
                <div
                  key={answer.id}
                  draggable
                  onDragStart={() => onDragStartAnswer(index)}
                  onDragOver={onDragOver}
                  onDrop={() => onDropAnswer(index)}
                  className={`answer-item flex items-start justify-between bg-gradient-to-r from-green-50 to-green-25 p-4 rounded-lg border border-green-200 cursor-move hover:shadow-md ${
                    draggedAnswerIndex === index ? "dragging" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical
                      size={20}
                      className="text-green-600 mt-1 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    />
                    <div>
                      <p className="text-sm font-semibold text-green-600 mb-1">Opción {index + 1}</p>
                      <p className="text-gray-800">{answer.text}</p>
                      {answer.nextQuestionIds && answer.nextQuestionIds.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          🔗 {answer.nextQuestionIds.length} pregunta(s) siguiente(s)
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenLinkQuestions(answer.id)}
                    className="text-blue-600 hover:text-blue-800 ml-2 mt-1 flex-shrink-0 transition-colors"
                    title="Enlazar preguntas siguientes"
                  >
                    <Link2 size={20} />
                  </button>
                  <button
                    onClick={() => onDeleteAnswer(answer.id)}
                    className="text-red-600 hover:text-red-800 ml-2 mt-1 flex-shrink-0 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay opciones de respuesta añadidas aún</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Opción de Respuesta</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => onNewAnswerChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onAddAnswer()}
                placeholder="Escriba la opción y presione Enter o haga clic en Añadir"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={onAddAnswer}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                Añadir
              </button>
            </div>
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
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Guardar Opciones
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
