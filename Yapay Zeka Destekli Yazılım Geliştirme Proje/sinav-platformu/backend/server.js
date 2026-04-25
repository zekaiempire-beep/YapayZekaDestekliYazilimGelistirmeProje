import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import questionsRouter from './routes/questions.js'
import examsRouter from './routes/exams.js'
import examsManagementRouter from './routes/exams-management.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/exams/management', examsManagementRouter) // Sınav yönetimi
app.use('/api/questions', questionsRouter)               // Soru yönetimi
app.use('/api/exams', examsRouter)                       // Sınav çözme & sonuçlar

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running' })
})

// Server başlat
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor`)
  console.log('API Endpoints:')
  console.log('  GET    /api/exams/management          # Tüm sınavları getir')
  console.log('  POST   /api/exams/management          # Yeni sınav oluştur')
  console.log('  PUT    /api/exams/management/:id      # Sınavı güncelle')
  console.log('  DELETE /api/exams/management/:id      # Sınavı sil')
  console.log('  GET    /api/questions/exam/:examId    # Sınavın sorularını getir')
  console.log('  POST   /api/questions                 # Yeni soru ekle')
  console.log('  PUT    /api/questions/:id             # Soruyu güncelle')
  console.log('  DELETE /api/questions/:id             # Soruyu sil')
  console.log('  POST   /api/exams/submit              # Sınav sonucunu gönder')
  console.log('  GET    /api/exams/results/:examId     # Sınavın sonuçlarını getir')
  console.log('  GET    /api/exams/:resultId           # Belirli sonucu getir')
})

