import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const QUESTIONS_FILE = path.join(__dirname, '../data/questions.json')
const EXAMS_FILE = path.join(__dirname, '../data/exams.json')

// Dosyalar yoksa oluştur
const ensureFiles = () => {
  if (!fs.existsSync(QUESTIONS_FILE)) {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify([], null, 2))
  }
  if (!fs.existsSync(EXAMS_FILE)) {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify([], null, 2))
  }
}

export const getQuestions = () => {
  ensureFiles()
  const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
  return JSON.parse(data)
}

export const saveQuestions = (questions) => {
  ensureFiles()
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2))
}

export const getExams = () => {
  ensureFiles()
  const data = fs.readFileSync(EXAMS_FILE, 'utf-8')
  return JSON.parse(data)
}

export const saveExams = (exams) => {
  ensureFiles()
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2))
}
