//dashboard/encuestas/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Trash2, Edit2, X, Plus } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { getSurveys, type Survey as SurveyBase } from "@/lib/getSurveys"

interface Question {
  id: number
  text: string
}

interface Survey extends SurveyBase {
  questions?: Question[]
}

export default function EncuestasPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    is_active: false,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")

  useEffect(() => {
    const fetchSurveys = async () => {
      const data = await getSurveys()
      const formatted = data.map((s) => ({
        ...s,
        questions: [],
      }))
      setSurveys(formatted)
      setLoading(false)
    }

    fetchSurveys()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleEdit = async (survey: Survey) => {
    setEditingId(survey.id)
    setFormData({
      title: survey.title,
      description: survey.description,
      starts_at: survey.starts_at,
      ends_at: survey.ends_at,
      is_active: survey.is_active,
    })

    // 🔹 Obtener preguntas reales de esta encuesta
    const { data: preguntas, error } = await supabase
      .from("questions")
      .select("id, text")
      .eq("survey_id", survey.id)
      .order("id", { ascending: true })

    if (!error && preguntas) {
      setQuestions(preguntas)
    } else {
      console.error("Error cargando preguntas:", error)
      setQuestions([])
    }

    setShowModal(true)
  }


  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const question: Question = {
        id: questions.length + 1,
        text: newQuestion,
      }
      setQuestions([...questions, question])
      setNewQuestion("")
    }
  }

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // 🔹 Actualizar encuesta existente
      const { error: updateError } = await supabase
        .from("surveys")
        .update({
          title: formData.title,
          description: formData.description,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at,
          is_active: formData.is_active,
        })
        .eq("id", editingId)

      if (updateError) {
        console.error("Error actualizando encuesta:", updateError)
        return
      }

      // 🔹 Actualizar preguntas (borrar y volver a insertar)
      await supabase.from("questions").delete().eq("survey_id", editingId)
      if (questions.length > 0) {
        const nuevasPreguntas = questions.map((q) => ({
          survey_id: editingId,
          text: q.text,
          type: "multiple_choice", // tipo genérico por defecto
          order: q.id,
        }))
        await supabase.from("questions").insert(nuevasPreguntas)
      }
    } else {
      // 🔹 Crear encuesta nueva
      const { data: nuevaEncuesta, error: insertError } = await supabase
        .from("surveys")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            starts_at: formData.starts_at,
            ends_at: formData.ends_at,
            is_active: formData.is_active,
            unique_link_slug: crypto.randomUUID(),
          },
        ])
        .select("id")
        .single()

      if (insertError) {
        console.error("Error insertando encuesta:", insertError)
        return
      }

      if (nuevaEncuesta && questions.length > 0) {
        const preguntasConId = questions.map((q) => ({
          survey_id: nuevaEncuesta.id,
          text: q.text,
          type: "multiple_choice",
          order: q.id,
        }))
        await supabase.from("questions").insert(preguntasConId)
      }
    }

    // Refrescar lista
    const refreshed = await getSurveys()
    setSurveys(refreshed)
    handleCloseModal()
  }


  const handleDelete = (id: number) => {
    setSurveys(surveys.filter((survey) => survey.id !== id))
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ title: "", description: "", starts_at: "", ends_at: "", is_active: false })
    setQuestions([])
    setNewQuestion("")
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">TÍTULO</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ESTADO</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">FECHAS</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-gray-900 font-medium">{survey.title}</p>
                  <p className="text-gray-600 text-sm">{survey.description}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block ${
                      survey.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    } text-xs font-semibold px-3 py-1 rounded-full`}
                  >
                    {survey.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  <p>Inicio: {survey.starts_at}</p>
                  <p>Fin: {survey.ends_at}</p>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CREAR/EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-50 p-4">
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
                    name="starts_at"
                    value={formData.starts_at}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
                  <input
                    type="date"
                    name="ends_at"
                    value={formData.ends_at}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Activa
                </label>
              </div>

              {/* Sección de preguntas */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Preguntas</h3>

                <div className="space-y-3 mb-4">
                  {questions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{question.text}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddQuestion())}
                    placeholder="Ingrese una nueva pregunta"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Añadir
                  </button>
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
    </div>
  )
}