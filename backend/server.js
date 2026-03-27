import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import questionsRouter from './routes/questions.js'
import examsRouter from './routes/exams.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/questions', questionsRouter)
app.use('/api/exams', examsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running' })
})

// Server başlat
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor`)
  console.log('API Endpoints:')
  console.log('  GET    /api/questions')
  console.log('  POST   /api/questions')
  console.log('  PUT    /api/questions/:id')
  console.log('  DELETE /api/questions/:id')
  console.log('  POST   /api/exams/submit')
  console.log('  GET    /api/exams/history')
})
