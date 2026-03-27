import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { analyzeExamAnswers } from '../utils/claudeAnalyzer.js'

const router = Router()

// Sınav sonuçlarını gönder
router.post('/submit', async (req, res) => {
  try {
    const { examId, answers } = req.body

    if (!examId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Geçersiz sınav verisi' })
    }

    const questions = await prisma.question.findMany({
      where: { examId }
    })

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
    const examResult = await prisma.examResult.create({
      data: {
        examId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        feedback: result.feedback,
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
          }))
        }
      },
      include: {
        answers: true
      }
    })

    res.json({
      id: examResult.id,
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
router.get('/results/:examId', async (req, res) => {
  try {
    const { examId } = req.params
    const results = await prisma.examResult.findMany({
      where: { examId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    })
    res.json(results)
  } catch (error) {
    console.error('Sonuçlar getirilemedi:', error)
    res.status(500).json({ error: 'Sonuçlar getirilemedi' })
  }
})

// Belirli sonucu getir
router.get('/:resultId', async (req, res) => {
  try {
    const { resultId } = req.params
    const result = await prisma.examResult.findUnique({
      where: { id: resultId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    })

    if (!result) {
      return res.status(404).json({ error: 'Sonuç bulunamadı' })
    }

    res.json(result)
  } catch (error) {
    console.error('Sonuç getirilemedi:', error)
    res.status(500).json({ error: 'Sonuç getirilemedi' })
  }
})

export default router


