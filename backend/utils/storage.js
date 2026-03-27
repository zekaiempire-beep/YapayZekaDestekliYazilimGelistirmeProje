import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const EXAMS_FILE = path.join(__dirname, '../data/exams.json')
const QUESTIONS_FILE = path.join(__dirname, '../data/questions.json')
const RESULTS_FILE = path.join(__dirname, '../data/results.json')

// Dosyalar yoksa oluştur
const ensureFiles = () => {
  if (!fs.existsSync(EXAMS_FILE)) {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify([], null, 2))
  }
  if (!fs.existsSync(QUESTIONS_FILE)) {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify([], null, 2))
  }
  if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2))
  }
}

// SINAVLAR
export const getExams = () => {
  ensureFiles()
  const data = fs.readFileSync(EXAMS_FILE, 'utf-8')
  return JSON.parse(data)
}

export const saveExams = (exams) => {
  ensureFiles()
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2))
}

// SORULAR (sınava göre filtreli)
export const getQuestions = (examId = null) => {
  ensureFiles()
  const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
  let questions = JSON.parse(data)
  
  if (examId) {
    questions = questions.filter(q => q.examId === examId)
  }
  
  return questions
}

export const saveQuestions = (questions) => {
  ensureFiles()
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2))
}

// SONUÇLAR
export const getResults = (examId = null) => {
  ensureFiles()
  const data = fs.readFileSync(RESULTS_FILE, 'utf-8')
  let results = JSON.parse(data)
  
  if (examId) {
    results = results.filter(r => r.examId === examId)
  }
  
  return results
}

export const saveResults = (results) => {
  ensureFiles()
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
}
