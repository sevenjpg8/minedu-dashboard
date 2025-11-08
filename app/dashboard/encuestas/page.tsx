"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Plus } from "lucide-react"
import { SurveysTable } from "@/components/surveys/surveys-table"
import { PaginationControls } from "@/components/surveys/pagination-controls"
import { SurveyFormModal } from "@/components/surveys/survey-form-modal"
import { QuestionsModal } from "@/components/surveys/questions-modal"
import { EditQuestionModal } from "@/components/surveys/edit-question-modal"
import { AnswersModal } from "@/components/surveys/answers-modal"
import { LinkQuestionsModal } from "@/components/surveys/link-questions-modal"
import { SurveyDialogs } from "@/components/surveys/survey-dialogs"
import type { Survey, Question, Answer, FormData } from "@/types/surveys"

export default function EncuestasPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)
  const [showModal, setShowModal] = useState(false)
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [showAnswersModal, setShowAnswersModal] = useState(false)
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)
  const [showLinkQuestionsModal, setShowLinkQuestionsModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    active: false,
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])

  const [editingQuestionText, setEditingQuestionText] = useState("")
  const [editingQuestionPrefix, setEditingQuestionPrefix] = useState("")
  const [editingQuestionDescription, setEditingQuestionDescription] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [newQuestionDescription, setNewQuestionDescription] = useState("")
  const [newQuestionPrefix, setNewQuestionPrefix] = useState("")
  const [newAnswer, setNewAnswer] = useState("")

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedAnswerIndex, setDraggedAnswerIndex] = useState<number | null>(null)
  const [selectedNextQuestion, setSelectedNextQuestion] = useState<number | null>(null)

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
  })

  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  })

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
            })),
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

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1
    return Math.max(1, Math.ceil(surveys.length / pageSize))
  }, [surveys.length, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
    if (surveys.length === 0) setCurrentPage(1)
  }, [surveys.length, totalPages, currentPage])

  const displayedSurveys = useMemo(() => {
    if (pageSize <= 0) return surveys
    const start = (currentPage - 1) * pageSize
    return surveys.slice(start, start + pageSize)
  }, [surveys, currentPage, pageSize])

  const handlePageChange = (page: number) => {
    const p = Math.min(Math.max(1, page), totalPages)
    setCurrentPage(p)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setCurrentPage(1)
  }

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

      const res = await fetch(`/api/surveys/${survey.id}`)
      const data = await res.json()

      if (data && Array.isArray(data.questions)) {
        setQuestions(
          data.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            prefix: q.prefix,
            description: q.description,
            answers:
              q.options?.map((a: any) => ({
                id: a.id,
                text: a.text,
                nextQuestionIds:
                  Array.isArray(a.nextQuestionIds)
                    ? a.nextQuestionIds
                    : a.next_question_id
                      ? [a.next_question_id]
                      : [],
              })) ?? [],
          })),
        )
      }

      else {
        setQuestions([])
      }

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar la encuesta completa:", err)
      setAlertDialog({
        isOpen: true,
        title: "Error",
        message: "No se pudieron cargar las preguntas de la encuesta.",
        type: "error",
      })
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
          : q,
      )
      setQuestions(updatedQuestions)
      setShowEditQuestionModal(false)
      setEditingQuestionId(null)
      setEditingQuestionText("")
      setEditingQuestionPrefix("")
      setEditingQuestionDescription("")
    }
  }

  const handleOpenAnswersModal = (questionId: number) => {
    setSelectedQuestionId(questionId)
    const selectedQuestion = questions.find((q) => q.id === questionId)
    setAnswers(selectedQuestion?.answers || [])
    setShowAnswersModal(true)
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

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      const answer: Answer = {
        id: Date.now(),
        text: newAnswer,
        nextQuestionIds: [],
      }
      setAnswers([...answers, answer])
      setNewAnswer("")
    }
  }

  const handleDeleteAnswer = (id: number) => {
    setAnswers(answers.filter((a) => a.id !== id))
  }

  const handleOpenLinkQuestionsModal = (answerId: number) => {
    setSelectedAnswerId(answerId)
    const answer = answers.find((a) => a.id === answerId)
    setSelectedNextQuestion(answer?.nextQuestionIds?.[0] || null)
    setShowLinkQuestionsModal(true)
  }

  const handleSaveLinkQuestions = () => {
    if (selectedAnswerId) {
      const updatedAnswers = answers.map((a) =>
        a.id === selectedAnswerId ? { ...a, nextQuestionIds: selectedNextQuestion ? [selectedNextQuestion] : [] } : a,
      )
      setAnswers(updatedAnswers)
      setShowLinkQuestionsModal(false)
      setSelectedAnswerId(null)
      setSelectedNextQuestion(null)
    }
  }

  const toggleNextQuestion = (questionId: number) => {
    setSelectedNextQuestion(selectedNextQuestion === questionId ? null : questionId)
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

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ title: "", description: "", startDate: "", endDate: "", active: false })
    setQuestions([])
    setNewQuestion("")
    setNewQuestionDescription("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        id: editingId,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        active: formData.active,
        questions: questions.map((q) => ({
          id: q.id,
          prefix: q.prefix ?? null,
          text: q.text,
          description: q.description,
          answers:
            q.answers?.map((a) => ({
              id: a.id,
              text: a.text,
              nextQuestionIds: a.nextQuestionIds || [],
            })) ?? [],
        })),
      }

      console.log("Enviando encuesta:", payload)

      const response = await fetch(editingId ? "/api/surveys/surveysupdate" : "/api/surveys/surveyscreate", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setTimeout(() => {
          setAlertDialog({
            isOpen: true,
            title: "¡Éxito!",
            message: editingId ? "✅ Encuesta actualizada correctamente" : "✅ Encuesta creada correctamente",
            type: "success",
          })

          setShowModal(false)
          setEditingId(null)
          setFormData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            active: false,
          })
          setQuestions([])

          fetch("/api/surveys")
            .then((response) => response.json())
            .then((data) => {
              if (Array.isArray(data)) {
                setSurveys(
                  data.map((s: any) => ({
                    id: s.id,
                    title: s.title,
                    description: s.description ?? "",
                    status: s.is_active ? "Activa" : "Inactiva",
                    startDate: s.starts_at?.split("T")[0] ?? "",
                    endDate: s.ends_at?.split("T")[0] ?? "",
                  })),
                )
              }
            })
            .catch((err) => console.error("Error cargando encuestas:", err))
            .finally(() => {
              setTimeout(() => setIsSubmitting(false), 300)
            })
        }, 4500)
      } else {
        setAlertDialog({
          isOpen: true,
          title: "Error",
          message: "❌ Error al guardar la encuesta: " + result.error,
          type: "error",
        })
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      setAlertDialog({
        isOpen: true,
        title: "Error",
        message: "❌ Error inesperado al guardar",
        type: "error",
      })
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Encuesta",
      description: "¿Estás seguro que quieres eliminar esta encuesta? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        const previous = surveys
        const newList = surveys.filter((survey) => survey.id !== id)
        setSurveys(newList)

        const newTotalPages = pageSize > 0 ? Math.max(1, Math.ceil(newList.length / pageSize)) : 1
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages)

        try {
          const res = await fetch("/api/surveys/surveysdelete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          })

          const result = await res.json()

          if (!res.ok || !result.success) {
            throw new Error(result?.error || "Error al eliminar encuesta")
          }

          setAlertDialog({
            isOpen: true,
            title: "¡Éxito!",
            message: "Encuesta eliminada correctamente",
            type: "success",
          })
        } catch (err) {
          console.error("Error eliminando encuesta:", err)
          setSurveys(previous)
          const restoredTotalPages = pageSize > 0 ? Math.max(1, Math.ceil(previous.length / pageSize)) : 1
          if (currentPage > restoredTotalPages) setCurrentPage(restoredTotalPages)
          setAlertDialog({
            isOpen: true,
            title: "Error",
            message: "No se pudo eliminar la encuesta. Por favor, inténtalo de nuevo.",
            type: "error",
          })
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  return (
    <div>
      <SurveyDialogs
        confirmDialog={confirmDialog}
        alertDialog={alertDialog}
        isSubmitting={isSubmitting}
        editingId={editingId}
        onConfirmClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onAlertClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        onSubmittingClose={() => setIsSubmitting(false)}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Encuestas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Crear Nueva Encuesta
        </button>
      </div>

      <SurveysTable surveys={displayedSurveys} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

      {surveys.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={surveys.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <SurveyFormModal
        isOpen={showModal}
        editingId={editingId}
        formData={formData}
        questions={questions}
        onInputChange={handleInputChange}
        onAddQuestion={handleAddQuestion}
        onOpenQuestionsModal={() => setShowQuestionsModal(true)}
        onOpenAnswersModal={handleOpenAnswersModal}
        onOpenEditQuestionModal={handleOpenEditQuestionModal}
        onDeleteQuestion={handleDeleteQuestion}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      <QuestionsModal
        isOpen={showQuestionsModal}
        questions={questions}
        newQuestion={newQuestion}
        newQuestionPrefix={newQuestionPrefix}
        draggedIndex={draggedIndex}
        onNewQuestionChange={setNewQuestion}
        onNewQuestionPrefixChange={setNewQuestionPrefix}
        onAddQuestion={handleAddQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onEditQuestion={handleOpenEditQuestionModal}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClose={() => setShowQuestionsModal(false)}
      />

      <EditQuestionModal
        isOpen={showEditQuestionModal}
        questionText={editingQuestionText}
        questionPrefix={editingQuestionPrefix}
        questionDescription={editingQuestionDescription}
        onQuestionTextChange={setEditingQuestionText}
        onQuestionPrefixChange={setEditingQuestionPrefix}
        onQuestionDescriptionChange={setEditingQuestionDescription}
        onSave={handleSaveEditedQuestion}
        onCancel={() => {
          setShowEditQuestionModal(false)
          setEditingQuestionId(null)
        }}
      />

      <AnswersModal
        isOpen={showAnswersModal}
        answers={answers}
        newAnswer={newAnswer}
        draggedAnswerIndex={draggedAnswerIndex}
        onNewAnswerChange={setNewAnswer}
        onAddAnswer={handleAddAnswer}
        onDeleteAnswer={handleDeleteAnswer}
        onOpenLinkQuestions={handleOpenLinkQuestionsModal}
        onDragStartAnswer={handleDragStartAnswer}
        onDragOver={handleDragOver}
        onDropAnswer={handleDropAnswer}
        onSave={handleSaveAnswers}
        onCancel={() => {
          setShowAnswersModal(false)
          setSelectedQuestionId(null)
        }}
      />

      <LinkQuestionsModal
        isOpen={showLinkQuestionsModal}
        questions={questions}
        selectedNextQuestion={selectedNextQuestion}
        onToggleNextQuestion={toggleNextQuestion}
        onSave={handleSaveLinkQuestions}
        onCancel={() => {
          setShowLinkQuestionsModal(false)
          setSelectedAnswerId(null)
          setSelectedNextQuestion(null)
        }}
      />
    </div>
  )
}
