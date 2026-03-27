import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getExams, saveExams, getQuestions, saveQuestions } from '../utils/storage.js'

const router = Router()

// Tüm sınavları getir
router.get('/', (req, res) => {
  try {
    const exams = getExams()
    res.json(exams)
  } catch (error) {
    res.status(500).json({ error: 'Sınavlar getirilemedi' })
  }
})

// Yeni sınav oluştur
router.post('/', (req, res) => {
  try {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Sınav adı gereklidir' })
    }

    const exams = getExams()
    const newExam = {
      id: uuidv4(),
      title,
      description: description || '',
      createdAt: new Date().toISOString(),
      questionCount: 0,
    }

    exams.push(newExam)
    saveExams(exams)

    res.status(201).json(newExam)
  } catch (error) {
    res.status(500).json({ error: 'Sınav oluşturulamadı' })
  }
})

// Sınavı güncelle
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, description } = req.body

    const exams = getExams()
    const examIndex = exams.findIndex((e) => e.id === id)

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    exams[examIndex] = {
      ...exams[examIndex],
      title: title || exams[examIndex].title,
      description: description !== undefined ? description : exams[examIndex].description,
    }

    saveExams(exams)
    res.json(exams[examIndex])
  } catch (error) {
    res.status(500).json({ error: 'Sınav güncellenemedi' })
  }
})

// Sınavı sil
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params

    const exams = getExams()
    const filteredExams = exams.filter((e) => e.id !== id)

    if (filteredExams.length === exams.length) {
      return res.status(404).json({ error: 'Sınav bulunamadı' })
    }

    // Sınava ait soruları da sil
    const questions = getQuestions()
    const filteredQuestions = questions.filter((q) => q.examId !== id)
    saveQuestions(filteredQuestions)

    saveExams(filteredExams)
    res.json({ message: 'Sınav silindi' })
  } catch (error) {
    res.status(500).json({ error: 'Sınav silinemedi' })
  }
})

export default router
