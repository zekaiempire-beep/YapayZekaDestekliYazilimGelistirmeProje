import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getQuestions, getExams, saveExams } from '../utils/storage.js'
import { analyzeExamAnswers } from '../utils/claudeAnalyzer.js'

const router = Router()

// Sınav sonuçlarını gönder
router.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Geçersiz cevaplar' })
    }

    const questions = getQuestions()

    // Validasyonlar
    if (questions.length === 0) {
      return res.status(400).json({ error: 'Henüz soru eklenmemiş' })
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({ error: 'Tüm sorulara cevap vermelisiniz' })
    }

    // Claude'a analiz ettir
    const result = await analyzeExamAnswers(questions, answers)

    // Sınav sonucunu kaydet
    const exams = getExams()
    const examRecord = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      score: result.score,
      totalQuestions: result.totalQuestions,
      feedback: result.feedback,
      answers: answers,
    }

    exams.push(examRecord)
    saveExams(exams)

    res.json({
      score: result.score,
      totalQuestions: result.totalQuestions,
      feedback: result.feedback,
    })
  } catch (error) {
    console.error('Sınav gönderilemedi:', error.message)
    res
      .status(500)
      .json({ error: 'Sınav işlenemedi. Lütfen daha sonra tekrar deneyin.' })
  }
})

// Geçmiş sınav sonuçlarını getir (isteğe bağlı)
router.get('/history', (req, res) => {
  try {
    const exams = getExams()
    res.json(exams)
  } catch (error) {
    res.status(500).json({ error: 'Geçmiş sonuçlar getirilemedi' })
  }
})

export default router
