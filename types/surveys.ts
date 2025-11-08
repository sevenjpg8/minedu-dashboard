export interface Answer {
  id: number
  text: string
  nextQuestionIds?: number[]
}

export interface Question {
  id: number
  prefix?: string | null
  text: string
  description?: string
  answers?: Answer[]
}

export interface Survey {
  id: number
  title: string
  description: string
  status: "Activa" | "Inactiva"
  startDate: string
  endDate: string
  questions?: Question[]
}

export interface FormData {
  title: string
  description: string
  startDate: string
  endDate: string
  active: boolean
}
