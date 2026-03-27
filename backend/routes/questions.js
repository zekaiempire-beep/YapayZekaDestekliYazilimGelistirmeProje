import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getQuestions, saveQuestions } from '../utils/storage.js'

const router = Router()

// Tüm soruları getir
router.get('/', (req, res) => {
  try {
    const questions = getQuestions()
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: 'Sorular getirilemedi' })
  }
})

// Yeni soru ekle
router.post('/', (req, res) => {
  try {
    const { text, options, correctAnswer } = req.body

    // Validasyon
    if (!text || !options || options.length !== 4 || correctAnswer === undefined) {
      return res.status(400).json({ error: 'Geçersiz soru verisi' })
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ error: 'Geçersiz doğru cevap indeksi' })
    }

    const questions = getQuestions()
    const newQuestion = {
      id: uuidv4(),
      text,
      options,
      correctAnswer,
    }

    questions.push(newQuestion)
    saveQuestions(questions)

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

    questions[questionIndex] = { id, text, options, correctAnswer }
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
    const filteredQuestions = questions.filter((q) => q.id !== id)

    if (filteredQuestions.length === questions.length) {
      return res.status(404).json({ error: 'Soru bulunamadı' })
    }

    saveQuestions(filteredQuestions)
    res.json({ message: 'Soru silindi' })
  } catch (error) {
    res.status(500).json({ error: 'Soru silinemedi' })
  }
})

export default router
