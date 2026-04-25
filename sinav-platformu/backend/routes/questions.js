import { Router } from 'express'
import prisma from '../utils/prisma.js'

const router = Router()

// Bir sınavın sorularını getir
router.get('/exam/:examId', async (req, res) => {
  try {
    const { examId } = req.params
    const questions = await prisma.question.findMany({
      where: { examId },
      orderBy: { createdAt: 'asc' }
    })
    console.log('GET /api/questions/exam/:examId - Döndürülen sorular:', JSON.stringify(questions, null, 2))
    res.json(questions)
  } catch (error) {
    console.error('Sorular getirilemedi:', error)
    res.status(500).json({ error: 'Sorular getirilemedi' })
  }
})

// Yeni soru ekle
router.post('/', async (req, res) => {
  try {
    const { examId, text, topic, options, correctAnswer } = req.body

    console.log('=== POST /api/questions DEBUG ===')
    console.log('Gelen body:', req.body)
    console.log('Topic değeri:', topic)
    console.log('Topic type:', typeof topic)
    console.log('Topic length:', topic?.length)
    console.log('Topic trimmed:', topic?.trim())

    // Validasyon
    if (!examId || !text || !options || options.length !== 4 || correctAnswer === undefined) {
      return res.status(400).json({ error: 'Geçersiz soru verisi' })
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ error: 'Geçersiz doğru cevap indeksi' })
    }

    // Sınavın var olduğunu kontrol et
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    const topicToSave = topic && topic.trim() ? topic.trim() : null
    console.log('Kaydedilecek topic:', topicToSave)

    const newQuestion = await prisma.question.create({
      data: {
        examId,
        text,
        topic: topicToSave,
        options,
        correctAnswer: parseInt(correctAnswer),
      }
    })

    console.log('Kaydedilen soru:', newQuestion)
    console.log('=== END DEBUG ===')

    res.status(201).json(newQuestion)
  } catch (error) {
    console.error('Soru eklenemedi:', error)
    res.status(500).json({ error: 'Soru eklenemedi' })
  }
})

// Soruyu güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { text, topic, options, correctAnswer } = req.body

    // Validasyon
    if (!text || !options || options.length !== 4 || correctAnswer === undefined) {
      return res.status(400).json({ error: 'Geçersiz soru verisi' })
    }

    const question = await prisma.question.findUnique({ where: { id } })
    if (!question) {
      return res.status(404).json({ error: 'Soru bulunamadı' })
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        text,
        topic: topic && topic.trim() ? topic.trim() : null,
        options,
        correctAnswer: parseInt(correctAnswer),
      }
    })

    res.json(updatedQuestion)
  } catch (error) {
    console.error('Soru güncellenemedi:', error)
    res.status(500).json({ error: 'Soru güncellenemedi' })
  }
})

// Soruyu sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const question = await prisma.question.findUnique({ where: { id } })
    if (!question) {
      return res.status(404).json({ error: 'Soru bulunamadı' })
    }

    await prisma.question.delete({ where: { id } })
    res.json({ message: 'Soru silindi' })
  } catch (error) {
    console.error('Soru silinemedi:', error)
    res.status(500).json({ error: 'Soru silinemedi' })
  }
})

export default router


