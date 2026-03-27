export interface Exam {
  id: string
  title: string
  description: string
  createdAt: string
  questionCount: number
}

export interface Question {
  id: string
  examId: string
  text: string
  options: string[]
  correctAnswer: number
}

export interface ExamResult {
  id: string
  examId: string
  timestamp: string
  score: number
  totalQuestions: number
  feedback: string
  answers: Array<{
    questionId: string
    selectedAnswer: number
  }>
}
