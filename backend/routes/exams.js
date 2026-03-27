import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getQuestions, getResults, saveResults } from '../utils/storage.js'
import { analyzeExamAnswers } from '../utils/claudeAnalyzer.js'

const router = Router()

// Sınav sonuçlarını gönder
router.post('/submit', async (req, res) => {
  try {
    const { examId, answers } = req.body

    if (!examId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Geçersiz sınav verisi' })
    }

    const questions = getQuestions(examId)

    // Validasyonlar
    if (questions.length === 0) {
      return res.status(400).json({ error: 'Bu sınav için soru bulunamadı' })
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({ error: 'Tüm sorulara cevap vermelisiniz' })
    }

    // Claude'a analiz ettir
    const result = await analyzeExamAnswers(questions, answers)

    // Sınav sonucunu kaydet
    const results = getResults()
    const examRecord = {
      id: uuidv4(),
      examId,
      timestamp: new Date().toISOString(),
      score: result.score,
      totalQuestions: result.totalQuestions,
      feedback: result.feedback,
      answers: answers,
    }

    results.push(examRecord)
    saveResults(results)

    res.json({
      id: examRecord.id,
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

// Bir sınavın sonuçlarını getir
router.get('/results/:examId', (req, res) => {
  try {
    const { examId } = req.params
    const results = getResults(examId)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: 'Sonuçlar getirilemedi' })
  }
})

// Belirli sonucu getir
router.get('/:resultId', (req, res) => {
  try {
    const { resultId } = req.params
    const results = getResults()
    const result = results.find((r) => r.id === resultId)

    if (!result) {
      return res.status(404).json({ error: 'Sonuç bulunamadı' })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Sonuç getirilemedi' })
  }
})

export default router

