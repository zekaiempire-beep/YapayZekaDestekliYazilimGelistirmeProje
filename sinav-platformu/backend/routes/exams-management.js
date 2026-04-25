import { Router } from 'express'
import prisma from '../utils/prisma.js'

const router = Router()

// Tüm sınavları getir
router.get('/', async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedExams = exams.map(exam => ({
      ...exam,
      questionCount: exam._count.questions
    }))

    res.json(formattedExams)
  } catch (error) {
    console.error('Sınavlar getirilemedi:', error)
    res.status(500).json({ error: 'Sınavlar getirilemedi' })
  }
})

// Yeni sınav oluştur
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Sınav adı gereklidir' })
    }

    const newExam = await prisma.exam.create({
      data: {
        title,
        description: description || '',
      }
    })

    res.status(201).json({ ...newExam, questionCount: 0 })
  } catch (error) {
    console.error('Sınav oluşturulamadı:', error)
    res.status(500).json({ error: 'Sınav oluşturulamadı' })
  }
})

// Sınavı güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description } = req.body

    const exam = await prisma.exam.findUnique({ where: { id } })
    if (!exam) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        title: title || exam.title,
        description: description !== undefined ? description : exam.description,
      }
    })

    res.json(updatedExam)
  } catch (error) {
    console.error('Sınav güncellenemedi:', error)
    res.status(500).json({ error: 'Sınav güncellenemedi' })
  }
})

// Sınavı sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const exam = await prisma.exam.findUnique({ 
      where: { id },
      include: { questions: true }
    })

    if (!exam) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    await prisma.exam.delete({ where: { id } })
    res.json({ message: 'Sınav silindi' })
  } catch (error) {
    console.error('Sınav silinemedi:', error)
    res.status(500).json({ error: 'Sınav silinemedi' })
  }
})

export default router

