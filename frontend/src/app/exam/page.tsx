'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import type { Exam, Question, ExamResult } from '@/types'

type Stage = 'select' | 'solving' | 'result'

export default function ExamPage() {
  const [stage, setStage] = useState<Stage>('select')
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedAnswer: number }>>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ExamResult | null>(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/api/exams/management')
      setExams(response.data)
    } catch (error) {
      console.error('Sınavlar yüklenemedi:', error)
      alert('Sınavlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExam = async (exam: Exam) => {
    try {
      setLoading(true)
      setSelectedExam(exam)

      const response = await axios.get(`http://localhost:5000/api/questions/exam/${exam.id}`)
      setQuestions(response.data)

      if (response.data.length === 0) {
        alert('Bu sınava ait soru bulunamadı')
        return
      }

      setAnswers([])
      setCurrentIndex(0)
      setStage('solving')
    } catch (error) {
      console.error('Sorular yüklenemedi:', error)
      alert('Sorular yüklenemedi')
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
        examId: selectedExam!.id,
        answers,
      })
      setResult(response.data)
      setStage('result')
    } catch (error) {
      console.error('Sınav gönderilemedi:', error)
      alert('Sınav gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  // Sınav Seçimi Sayfası
  if (stage === 'select' || !selectedExam) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-800">Sınav Seç</h1>
            <a href="/">
              <button className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition">
                ← Ana Sayfaya Dön
              </button>
            </a>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-xl text-gray-700">Sınavlar yükleniyor...</div>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sınav Bulunamadı</h2>
              <p className="text-gray-600">Henüz sınav eklenmemiş. Lütfen daha sonra tekrar deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => handleSelectExam(exam)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-left hover:border-blue-400 border-2 border-transparent"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{exam.title}</h3>
                  {exam.description && (
                    <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-blue-600 font-semibold">📝 {exam.questionCount} soru</p>
                    <p className="text-green-600 font-semibold mt-2">→ Sınava Başla</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Sınav Çözme Sayfası
  if (stage === 'solving') {
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-gray-700">Sorular yükleniyor...</div>
        </div>
      )
    }

    const currentQuestion = questions[currentIndex]
    const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedExam.title}</h1>
              <p className="text-gray-600 mt-1">Soru {currentIndex + 1} / {questions.length}</p>
            </div>
            <a href="/">
              <button className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition">
                ← Çık
              </button>
            </a>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-semibold">
                {answers.length} / {questions.length} cevaplanmış
              </span>
              <span className="text-gray-600">
                %{Math.round((answers.length / questions.length) * 100)}
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {currentIndex + 1}. {currentQuestion.text}
            </h2>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition ${
                    currentAnswer?.selectedAnswer === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition ${
                        currentAnswer?.selectedAnswer === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {currentAnswer?.selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-800 text-lg">{String.fromCharCode(65 + index)}) {option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
              >
                ← Önceki
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading || answers.length !== questions.length}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Gönderiliyor...' : '✓ Sınavı Gönder'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Sonraki →
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Sorulara Hızlı Erişim</h3>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full h-10 rounded-lg font-semibold text-sm transition ${
                    index === currentIndex
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : answers.some((a) => a.questionId === questions[index].id)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                  title={`Soru ${index + 1}`}
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

  // Sonuç Sayfası
  if (stage === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Sınav Tamamlandı! ✓
          </h1>

          <div className="text-center mb-12">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-3xl text-gray-700 mb-4">
              Başarı Oranı: %{Math.round((result.score / result.totalQuestions) * 100)}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg mb-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🤖 AI Geri Bildirimi
            </h2>
            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
              {result.feedback}
            </div>
          </div>

          <div className="flex gap-4">
            <a href="/" className="flex-1">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
                Ana Sayfaya Dön
              </button>
            </a>
            <button
              onClick={() => {
                setStage('select')
                setSelectedExam(null)
                setAnswers([])
                setCurrentIndex(0)
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Başka Sınav Çöz
            </button>
          </div>
        </div>
      </div>
    )
  }
}

