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
    res.json(questions)
  } catch (error) {
    console.error('Sorular getirilemedi:', error)
    res.status(500).json({ error: 'Sorular getirilemedi' })
  }
})

// Yeni soru ekle
router.post('/', async (req, res) => {
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
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    const newQuestion = await prisma.question.create({
      data: {
        examId,
        text,
        options,
        correctAnswer,
      }
    })

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
    const { text, options, correctAnswer } = req.body

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
        options,
        correctAnswer,
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


