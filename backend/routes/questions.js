import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getQuestions, saveQuestions, getExams, saveExams } from '../utils/storage.js'

const router = Router()

// Bir sınavın sorularını getir
router.get('/exam/:examId', (req, res) => {
  try {
    const { examId } = req.params
    const questions = getQuestions(examId)
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: 'Sorular getirilemedi' })
  }
})

// Yeni soru ekle
router.post('/', (req, res) => {
  try {
    const { examId, text, options, correctAnswer } = req.body

    // Validasyon
    if (!examId || !text || !options || options.length !== 4 || correctAnswer === undefined) {
      return res.status(400).json({ error: 'Geçersiz soru verisi' })
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ error: 'Geçersiz doğru cevap indeksi' })
    }

    // Sınavın var olduğunu kontrol et
    const exams = getExams()
    const examExists = exams.find((e) => e.id === examId)
    if (!examExists) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    const questions = getQuestions()
    const newQuestion = {
      id: uuidv4(),
      examId,
      text,
      options,
      correctAnswer,
    }

    questions.push(newQuestion)
    saveQuestions(questions)

    // Sınav soru sayısını güncelle
    examExists.questionCount = questions.filter((q) => q.examId === examId).length
    saveExams(exams)

    res.status(201).json(newQuestion)
  } catch (error) {
    res.status(500).json({ error: 'Soru eklenemedi' })
  }
})

// Soruyu güncelle
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { text, options, correctAnswer } = req.body

    // Validasyon
    if (!text || !options || options.length !== 4 || correctAnswer === undefined) {
      return res.status(400).json({ error: 'Geçersiz soru verisi' })
    }

    const questions = getQuestions()
    const questionIndex = questions.findIndex((q) => q.id === id)

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Soru bulunamadı' })
    }

    questions[questionIndex] = {
      ...questions[questionIndex],
      text,
      options,
      correctAnswer,
    }
    saveQuestions(questions)

    res.json(questions[questionIndex])
  } catch (error) {
    res.status(500).json({ error: 'Soru güncellenemedi' })
  }
})

// Soruyu sil
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const questions = getQuestions()
    const question = questions.find((q) => q.id === id)

    if (!question) {
      return res.status(404).json({ error: 'Soru bulunamadı' })
    }

    const filteredQuestions = questions.filter((q) => q.id !== id)
    saveQuestions(filteredQuestions)

    // Sınav soru sayısını güncelle
    const exams = getExams()
    const exam = exams.find((e) => e.id === question.examId)
    if (exam) {
      exam.questionCount = filteredQuestions.filter((q) => q.examId === question.examId).length
      saveExams(exams)
    }

    res.json({ message: 'Soru silindi' })
  } catch (error) {
    res.status(500).json({ error: 'Soru silinemedi' })
  }
})

export default router

