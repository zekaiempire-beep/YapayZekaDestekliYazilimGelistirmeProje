'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

interface Answer {
  questionId: string
  selectedAnswer: number
}

interface ExamResult {
  score: number
  totalQuestions: number
  feedback: string
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/api/questions')
      setQuestions(response.data)
    } catch (error) {
      console.error('Sorular yüklenemedi:', error)
      alert('Sorular yüklenemedi. Lütfen sayfayı yenileyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (selectedAnswer: number) => {
    const existingAnswerIndex = answers.findIndex(
      (a) => a.questionId === questions[currentIndex].id
    )

    const newAnswers = [...answers]
    if (existingAnswerIndex > -1) {
      newAnswers[existingAnswerIndex] = {
        questionId: questions[currentIndex].id,
        selectedAnswer,
      }
    } else {
      newAnswers.push({
        questionId: questions[currentIndex].id,
        selectedAnswer,
      })
    }
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (answers.length !== questions.length) {
      alert('Lütfen tüm soruları cevaplayın')
      return
    }

    if (!confirm('Sınavı göndermek istediğinizden emin misiniz?')) return

    try {
      setLoading(true)
      const response = await axios.post('http://localhost:5000/api/exams/submit', {
        answers,
      })
      setResult(response.data)
      setSubmitted(true)
    } catch (error) {
      console.error('Sınav gönderilemedi:', error)
      alert('Sınav gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Yükleniyor...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sınav Bulunamadı</h1>
          <p className="text-gray-600">Henüz soru eklenmemiş. Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Sınav Sonuçları
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-2xl text-gray-700 mb-4">
              Başarı Oranı: %{Math.round((result.score / result.totalQuestions) * 100)}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🤖 AI Geri Bildirimi
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.feedback}
            </div>
          </div>

          <a href="/">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">
              Ana Sayfaya Dön
            </button>
          </a>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-semibold">
              Soru {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-gray-600">
              {answers.length} / {questions.length} cevaplanmış
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left p-4 border-2 rounded-lg transition ${
                  currentAnswer?.selectedAnswer === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      currentAnswer?.selectedAnswer === index
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {currentAnswer?.selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ← Önceki
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading || answers.length !== questions.length}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Gönderiliyor...' : 'Sınavı Gönder'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Sonraki →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Sorular</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-full h-10 rounded-lg font-semibold transition ${
                  index === currentIndex
                    ? 'bg-blue-600 text-white'
                    : answers.some((a) => a.questionId === questions[index].id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
