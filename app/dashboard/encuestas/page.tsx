"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Trash2, Edit2, X, Plus, GripVertical, Settings, ChevronLeft, ChevronRight } from "lucide-react"

interface Answer {
  id: number
  text: string
}

interface Question {
  id: number
  prefix?: string | null
  text: string
  description?: string
  answers?: Answer[]
}

interface Survey {
  id: number
  title: string
  description: string
  status: "Activa" | "Inactiva"
  startDate: string
  endDate: string
  questions?: Question[]
}

export default function EncuestasPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch("/api/surveys")
        const data = await response.json()
        if (Array.isArray(data)) {
          setSurveys(
            data.map((s: any) => ({
              id: s.id,
              title: s.title,
              description: s.description ?? "",
              status: s.is_active ? "Activa" : "Inactiva",
              startDate: s.starts_at?.split("T")[0] ?? "",
              endDate: s.ends_at?.split("T")[0] ?? "",
            }))
          )
        }
      } catch (err) {
        console.error("Error cargando encuestas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSurveys()
  }, [])

  // --- PAGINACIÓN (solo front) ---
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5) // default: 5 por página

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1
    return Math.max(1, Math.ceil(surveys.length / pageSize))
  }, [surveys.length, pageSize])

  // Ajusta currentPage si cambia surveys / pageSize
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
    if (surveys.length === 0) setCurrentPage(1)
  }, [surveys.length, totalPages, currentPage])

  const displayedSurveys = useMemo(() => {
    if (pageSize <= 0) return surveys
    const start = (currentPage - 1) * pageSize
    return surveys.slice(start, start + pageSize)
  }, [surveys, currentPage, pageSize])

  // Funciones de paginación
  const gotoPage = (page: number) => {
    const p = Math.min(Math.max(1, page), totalPages)
    setCurrentPage(p)
  }

  const handlePageSizeChange = (value: number) => {
    // Si selecciona 0 -> mostrar todos
    setPageSize(value)
    setCurrentPage(1)
  }

  // ----------------------------------

  const [showModal, setShowModal] = useState(false)
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [showAnswersModal, setShowAnswersModal] = useState(false)
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)
  const [newQuestionPrefix, setNewQuestionPrefix] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState("")
  const [editingQuestionPrefix, setEditingQuestionPrefix] = useState("")
  const [editingQuestionDescription, setEditingQuestionDescription] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    active: false,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newQuestionDescription, setNewQuestionDescription] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [newAnswer, setNewAnswer] = useState("")
  const [draggedAnswerIndex, setDraggedAnswerIndex] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

const handleEdit = async (survey: Survey) => {
  try {
    setEditingId(survey.id)
    setFormData({
      title: survey.title,
      description: survey.description,
      startDate: survey.startDate,
      endDate: survey.endDate,
      active: survey.status === "Activa",
    })

    // 🔹 Llamar al endpoint que devuelve preguntas y respuestas de esa encuesta
    const res = await fetch(`/api/surveys/${survey.id}`)
    const data = await res.json()

    if (data && Array.isArray(data.questions)) {
      setQuestions(
        data.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          prefix: q.prefix,
          description: q.description,
          answers: q.answers?.map((a: any) => ({
            id: a.id,
            text: a.text,
          })) ?? [],
        }))
      )
    } else {
      setQuestions([])
    }

    setShowModal(true)
  } catch (err) {
    console.error("Error al cargar la encuesta completa:", err)
    alert("No se pudieron cargar las preguntas de la encuesta.")
  }
}


  const handleOpenQuestionsModal = () => {
    setShowQuestionsModal(true)
  }

  const handleOpenEditQuestionModal = (question: Question) => {
    setEditingQuestionId(question.id)
    setEditingQuestionText(question.text)
    setEditingQuestionPrefix(question.prefix || "")
    setEditingQuestionDescription(question.description || "")
    setShowEditQuestionModal(true)
  }

  const handleSaveEditedQuestion = () => {
    if (editingQuestionId && editingQuestionText.trim()) {
      const updatedQuestions = questions.map((q) =>
        q.id === editingQuestionId
          ? {
              ...q,
              text: editingQuestionText,
              prefix: editingQuestionPrefix.trim() || null,
              description: editingQuestionDescription,
            }
          : q
      )
      setQuestions(updatedQuestions)
      setShowEditQuestionModal(false)
      setEditingQuestionId(null)
      setEditingQuestionText("")
      setEditingQuestionPrefix("")
      setEditingQuestionDescription("")
    }
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const question: Question = {
        id: Date.now(),
        text: newQuestion,
        description: newQuestionDescription,
        prefix: newQuestionPrefix.trim() || null,
        answers: [],
      }
      setQuestions([...questions, question])
      setNewQuestion("")
      setNewQuestionDescription("")
      setNewQuestionPrefix("")
    }
  }

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleOpenAnswersModal = (questionId: number) => {
    setSelectedQuestionId(questionId)
    const selectedQuestion = questions.find((q) => q.id === questionId)
    setAnswers(selectedQuestion?.answers || [])
    setShowAnswersModal(true)
  }

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      const answer: Answer = {
        id: Date.now(),
        text: newAnswer,
      }
      setAnswers([...answers, answer])
      setNewAnswer("")
    }
  }

  const handleDeleteAnswer = (id: number) => {
    setAnswers(answers.filter((a) => a.id !== id))
  }

  const handleSaveAnswers = () => {
    if (selectedQuestionId) {
      const updatedQuestions = questions.map((q) => (q.id === selectedQuestionId ? { ...q, answers } : q))
      setQuestions(updatedQuestions)
      setShowAnswersModal(false)
      setSelectedQuestionId(null)
      setAnswers([])
      setNewAnswer("")
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null)
      return
    }

    const newQuestions = [...questions]
    const draggedQuestion = newQuestions[draggedIndex]
    newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(index, 0, draggedQuestion)
    setQuestions(newQuestions)
    setDraggedIndex(null)
  }

  const handleDragStartAnswer = (index: number) => {
    setDraggedAnswerIndex(index)
  }

  const handleDropAnswer = (index: number) => {
    if (draggedAnswerIndex === null || draggedAnswerIndex === index) {
      setDraggedAnswerIndex(null)
      return
    }

    const newAnswers = [...answers]
    const draggedAnswer = newAnswers[draggedAnswerIndex]
    newAnswers.splice(draggedAnswerIndex, 1)
    newAnswers.splice(index, 0, draggedAnswer)
    setAnswers(newAnswers)
    setDraggedAnswerIndex(null)
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const payload = {
      id: editingId, // 👈 Agregar ID para actualización
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      active: formData.active,
      questions: questions.map((q) => ({
        id: q.id, // 👈 mantener ID si existe
        prefix: q.prefix ?? null,
        text: q.text,
        description: q.description,
        answers:
          q.answers?.map((a) => ({
            id: a.id,
            text: a.text,
          })) ?? [],
      })),
    }

    console.log("Enviando encuesta:", payload)

    const response = await fetch(editingId ? "/api/surveysupdate" : "/api/surveyscreate", {
      method: editingId ? "PUT" : "POST", // 👈 usar PUT si edita
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (result.success) {
      alert(editingId ? "✅ Encuesta actualizada correctamente" : "✅ Encuesta creada correctamente")
      setShowModal(false)
      setEditingId(null)
      setFormData({ title: "", description: "", startDate: "", endDate: "", active: false })
      setQuestions([])

      // refrescar lista
      const refreshed = await fetch("/api/surveys")
      const data = await refreshed.json()
      setSurveys(
        data.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description ?? "",
          status: s.is_active ? "Activa" : "Inactiva",
          startDate: s.starts_at?.split("T")[0] ?? "",
          endDate: s.ends_at?.split("T")[0] ?? "",
        }))
      )
    } else {
      alert("❌ Error al guardar la encuesta: " + result.error)
    }
  } catch (err) {
    console.error(err)
    alert("❌ Error inesperado al guardar")
  }
}


  const handleDelete = (id: number) => {
    // Sólo front: eliminar de la lista local
    const newList = surveys.filter((survey) => survey.id !== id)
    setSurveys(newList)

    // ajustar página si era la última y quedó vacía
    const newTotalPages = pageSize > 0 ? Math.max(1, Math.ceil(newList.length / pageSize)) : 1
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ title: "", description: "", startDate: "", endDate: "", active: false })
    setQuestions([])
    setNewQuestion("")
    setNewQuestionDescription("")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Encuestas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Crear Nueva Encuesta
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">TITULO</th>
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
              displayedSurveys.map((survey) => (
                <tr key={survey.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900 font-medium">{survey.title}</p>
                      <p className="text-gray-600 text-sm">{survey.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block ${survey.status === "Activa"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
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
                        onClick={() => handleEdit(survey)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
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

      {/* ---------- CONTROLES DE PAGINACIÓN ---------- */}
      {surveys.length > 0 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600">
            {/* calculo índices mostrados */}
            {(() => {
              const total = surveys.length
              const start = pageSize > 0 ? (currentPage - 1) * pageSize + 1 : 1
              const end = pageSize > 0 ? Math.min(currentPage * pageSize, total) : total
              return `Mostrando ${start}–${end} de ${total}`
            })()}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 mr-2">Filas:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={0}>Todos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => gotoPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded disabled:opacity-50 border"
              title="Primera"
            >
              {"<<"}
            </button>
            <button
              onClick={() => gotoPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded disabled:opacity-50 border flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Anterior
            </button>

            {/* Números de página (limitado a un rango razonable) */}
            <div className="flex items-center gap-1 px-2">
              {(() => {
                const pages: number[] = []
                // mostrar hasta 7 botones: current ±3
                const range = 3
                let start = Math.max(1, currentPage - range)
                let end = Math.min(totalPages, currentPage + range)
                // ajustar si estamos cerca del inicio o final para mostrar siempre hasta 7 si es posible
                if (currentPage <= range) {
                  end = Math.min(totalPages, 1 + range * 2)
                }
                if (currentPage + range > totalPages) {
                  start = Math.max(1, totalPages - range * 2)
                }
                for (let i = start; i <= end; i++) pages.push(i)
                return pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => gotoPage(p)}
                    className={`px-3 py-1 rounded ${p === currentPage ? "bg-blue-600 text-white" : "border"}`}
                  >
                    {p}
                  </button>
                ))
              })()}
            </div>

            <button
              onClick={() => gotoPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded disabled:opacity-50 border flex items-center gap-1"
            >
              Siguiente <ChevronRight size={14} />
            </button>
            <button
              onClick={() => gotoPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded disabled:opacity-50 border"
              title="Última"
            >
              {">>"}
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)]  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? `Editando Encuesta: ${formData.title}` : "Crear Nueva Encuesta"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Activa
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Preguntas ({questions.length})</h3>
                  <button
                    type="button"
                    onClick={handleOpenQuestionsModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Añadir Pregunta
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-700">
                    💡 <span className="font-semibold">Tip:</span> Si quieres volver a editar el orden o descripcion de
                    la pregunta, haz clic en "Añadir Pregunta".
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
                          onClick={() => handleOpenEditQuestionModal(question)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar pregunta"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAnswersModal(question.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Gestionar respuestas"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
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
                  onClick={handleCloseModal}
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
      )}

      {showQuestionsModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)]  flex items-center justify-center z-[60] p-4">
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

              @keyframes smoothMove {
                0% {
                  transform: translateY(0);
                }
                100% {
                  transform: translateY(var(--move-distance, 0px));
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

              .question-item.drag-over {
                transform: translateY(-8px);
              }
            `}</style>

            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Gestionar Preguntas</h2>
              <button onClick={() => setShowQuestionsModal(false)} className="text-gray-500 hover:text-gray-700">
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
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={`question-item flex items-start justify-between bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-lg border border-blue-200 cursor-move hover:shadow-md ${draggedIndex === index ? "dragging" : ""
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
                        onClick={() => handleOpenEditQuestionModal(question)}
                        className="text-blue-600 hover:text-blue-800 ml-4 mt-1 flex-shrink-0 transition-colors"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
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
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddQuestion()}
                    placeholder="Escriba la pregunta"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Escriba el prefijo o tema de la pregunta (por ejemplo: Relaciones entre compañeros)"
                    value={newQuestionPrefix}
                    onChange={(e) => setNewQuestionPrefix(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Añadir
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowQuestionsModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditQuestionModal && editingQuestionId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-end z-[70] p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto slide-in-from-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Edit2 size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">Editar Pregunta</h2>
              </div>
              <button
                onClick={() => {
                  setShowEditQuestionModal(false)
                  setEditingQuestionId(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pregunta</label>
                <input
                  type="text"
                  value={editingQuestionText}
                  onChange={(e) => setEditingQuestionText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Texto de la pregunta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prefijo o Tema</label>
                <textarea
                  value={editingQuestionPrefix}
                  onChange={(e) => setEditingQuestionPrefix(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción adicional - por ejemplo: Relaciones entre compañeros"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditQuestionModal(false)
                    setEditingQuestionId(null)
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditedQuestion}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAnswersModal && selectedQuestionId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)]  flex items-center justify-center z-[70] p-4">
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
              <button
                onClick={() => {
                  setShowAnswersModal(false)
                  setSelectedQuestionId(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-700">
                  💡 <span className="font-semibold">Tip:</span> Agregue las opciones de respuesta para esta pregunta.
                  Puede desplazarlas para cambiar el orden.
                </p>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {answers.length > 0 ? (
                  answers.map((answer, index) => (
                    <div
                      key={answer.id}
                      draggable
                      onDragStart={() => handleDragStartAnswer(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropAnswer(index)}
                      className={`answer-item flex items-start justify-between bg-gradient-to-r from-green-50 to-green-25 p-4 rounded-lg border border-green-200 cursor-move hover:shadow-md ${draggedAnswerIndex === index ? "dragging" : ""
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
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAnswer(answer.id)}
                        className="text-red-600 hover:text-red-800 ml-4 mt-1 flex-shrink-0 transition-colors"
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
                    onChange={(e) => setNewAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddAnswer()}
                    placeholder="Escriba la opción y presione Enter o haga clic en Añadir"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAnswer}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={18} />
                    Añadir
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAnswersModal(false)
                    setSelectedQuestionId(null)
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAnswers}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Guardar Opciones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
