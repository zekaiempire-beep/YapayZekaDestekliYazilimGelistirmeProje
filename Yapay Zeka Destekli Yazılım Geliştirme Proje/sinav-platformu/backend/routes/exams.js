import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { analyzeExamAnswers } from '../utils/claudeAnalyzer.js'
import { analyzeExamAnswersWithOllama, checkOllamaConnection } from '../utils/ollamaAnalyzer.js'

const router = Router()

// Sınav sonuçlarını gönder
router.post('/submit', async (req, res) => {
  try {
    const { examId, answers, analyzer = 'ollama' } = req.body

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

    // Seçilen analiz aracını kullan
    let result
    if (analyzer === 'ollama') {
      result = await analyzeExamAnswersWithOllama(questions, answers)
    } else {
      result = await analyzeExamAnswers(questions, answers)
    }

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

    // Konu bazında hatalı soruları grupla
    const topicGroupedAnswers = {}
    const allAnswersData = questions.map((q, idx) => {
      const answer = answers.find(a => a.questionId === q.id)
      
      // Type dönüşümleri
      let correctAnswerNum = Number(q.correctAnswer) ?? 0
      let selectedAnswerNum = Number(answer?.selectedAnswer) ?? -1
      let optionsArray = q.options
      
      // Options string ise parse et
      if (typeof q.options === 'string') {
        try {
          optionsArray = JSON.parse(q.options)
        } catch (e) {
          console.error(`S${idx + 1} Options parse hatası:`, e.message)
          optionsArray = []
        }
      }
      
      // Doğru mu yanlış mı?
      const isCorrect = correctAnswerNum === selectedAnswerNum
      
      console.log(`\n=== SORU ${idx + 1} ===`)
      console.log(`Doğru: ${correctAnswerNum} | Seçilen: ${selectedAnswerNum} | Sonuç: ${isCorrect ? '✅' : '❌'}`)
      console.log(`Options: ${Array.isArray(optionsArray) ? optionsArray.length + ' tane' : 'HATA'}`)
      
      return {
        questionId: q.id,
        questionText: q.text,
        topic: q.topic || 'Bilinmiyor',
        options: optionsArray,
        correctAnswer: correctAnswerNum,
        selectedAnswer: selectedAnswerNum,
        isCorrect
      }
    })

    console.log('\n=== FINAL SONUC ===')
    const correctCount = allAnswersData.filter(a => a.isCorrect).length
    const wrongCount = allAnswersData.filter(a => !a.isCorrect).length
    console.log(`✅ Doğru: ${correctCount} | ❌ Yanlış: ${wrongCount} | Toplam: ${questions.length}`)

    // Yanlış cevapları konu bazında grupla
    allAnswersData.forEach(ans => {
      if (!ans.isCorrect) {
        if (!topicGroupedAnswers[ans.topic]) {
          topicGroupedAnswers[ans.topic] = []
        }
        topicGroupedAnswers[ans.topic].push(ans)
      }
    })

    // Konu bazında feedback'ler
    const topicBasedFeedback = {}
    for (const [topic, wrongQs] of Object.entries(topicGroupedAnswers)) {
      const topicFeedback = {
        topic,
        wrongCount: wrongQs.length,
        questions: wrongQs,
        suggestions: `${topic} ile ilgili ${wrongQs.length} soruyu yanlış cevapladınız. Lütfen bu konuyu tekrar gözden geçirin ve benzer sorularla pratik yapın.`
      }
      topicBasedFeedback[topic] = topicFeedback
    }

    res.json({
      id: examResult.id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      feedback: result.feedback,
      topicBasedFeedback,
      answers: allAnswersData
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

// Ollama bağlantısını kontrol et
router.get('/health/ollama', async (req, res) => {
  try {
    const status = await checkOllamaConnection()
    res.json(status)
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message })
  }
})


