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
  topic?: string
  options: string[]
  correctAnswer: number
}

export interface ExamResult {
  id: string
  examId: string
  timestamp?: string
  score: number
  totalQuestions: number
  feedback: string
  topicBasedFeedback?: {
    [topic: string]: {
      topic: string
      wrongCount: number
      questions: Array<{
        questionId: string
        questionText: string
        topic: string
        options: string[]
        correctAnswer: number
        selectedAnswer: number
        isCorrect: boolean
      }>
      suggestions: string
    }
  }
  answers: Array<{
    questionId: string
    questionText: string
    topic?: string
    options: string[]
    correctAnswer: number
    selectedAnswer: number
    isCorrect?: boolean
  }>
}
