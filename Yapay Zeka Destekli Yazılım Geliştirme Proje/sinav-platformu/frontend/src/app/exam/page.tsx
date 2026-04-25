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
  const [candidateName, setCandidateName] = useState<string>('')

  useEffect(() => {
    const savedName = localStorage.getItem('candidateName')
    if (savedName) {
      setCandidateName(savedName)
    }
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

  // Navbar Component
  const Navbar = () => (
    <nav className="bg-white/10 backdrop-blur border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-2 rounded-lg">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Sınav Platformu</h1>
            <p className="text-purple-200 text-xs">AI Destekli</p>
          </div>
        </a>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
            <span className="text-xl">👤</span>
            <span className="text-white font-semibold">{candidateName || 'Öğrenci'}</span>
          </div>
          <a href="/">
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105">
              Çıkış
            </button>
          </a>
        </div>
      </div>
    </nav>
  )

  // Sınav Seçimi Sayfası
  if (stage === 'select' || !selectedExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4 rounded-xl">
                <span className="text-4xl">📚</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Sınav Seçin</h1>
                <p className="text-purple-200 mt-2">Çözmek istediğiniz sınavı seçerek başlayın</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-purple-300 border-t-pink-500 rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-purple-200 animate-pulse">Sınavlar yükleniyor...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white/10 backdrop-blur rounded-3xl border-2 border-white/20 p-12 text-center">
              <span className="text-6xl mb-6 inline-block">📭</span>
              <h2 className="text-3xl font-bold text-white mb-3">Sınav Bulunamadı</h2>
              <p className="text-purple-200 text-lg">Henüz sınav eklenmemiş. Lütfen daha sonra tekrar deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, index) => (
                <button
                  key={exam.id}
                  onClick={() => handleSelectExam(exam)}
                  className="group text-left transform transition duration-300 hover:scale-105"
                >
                  <div className="bg-white/10 backdrop-blur rounded-2xl border-2 border-white/20 hover:border-purple-400 p-8 h-full transition duration-300 hover:shadow-2xl hover:bg-white/15">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-full">
                        SINAV {index + 1}
                      </span>
                      <span className="text-2xl">📖</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition">
                      {exam.title}
                    </h3>

                    {/* Description */}
                    {exam.description && (
                      <p className="text-purple-200 text-sm mb-6 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    {/* Question Count */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <div className="flex-1">
                        <p className="text-purple-200 text-xs font-semibold uppercase mb-1">Soru Sayısı</p>
                        <p className="text-2xl font-bold text-white">📝 {exam.questionCount}</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg group-hover:shadow-lg transition">
                        <span className="text-xl">→</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Footer Info */}
          {!loading && exams.length > 0 && (
            <div className="mt-12 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6 text-center">
              <p className="text-purple-200 flex items-center justify-center gap-2">
                <span className="text-xl">💡</span>
                Toplamda <span className="font-bold text-white mx-1">{exams.length}</span> sınav bulunmaktadır. 
                Başlamak için bir sınav seçin.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    )
  }

  // Sınav Çözme Sayfası
  if (stage === 'solving') {
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-xl text-white animate-pulse">Sorular yükleniyor...</div>
        </div>
      )
    }

    const currentQuestion = questions[currentIndex]
    const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)
    const progressPercent = ((currentIndex + 1) / questions.length) * 100
    const answeredPercent = (answers.length / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{selectedExam.title}</h1>
                <p className="text-purple-200 text-sm mt-1">Soru {currentIndex + 1} / {questions.length}</p>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <p className="text-purple-200 text-sm">Cevaplanmış</p>
              <p className="text-2xl font-bold text-white">{answers.length}/{questions.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <p className="text-purple-200 text-sm">İlerleme</p>
              <p className="text-2xl font-bold text-white">{Math.round(progressPercent)}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20 col-span-2 md:col-span-1">
              <p className="text-purple-200 text-sm">Başarı</p>
              <p className="text-2xl font-bold text-white">{Math.round(answeredPercent)}%</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20 mb-8">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-200 text-sm font-medium">Soru İlerlemesi</span>
                  <span className="text-white text-sm font-bold">{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-200 text-sm font-medium">Cevaplanan Sorular</span>
                  <span className="text-white text-sm font-bold">{answers.length}/{questions.length}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${answeredPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-10 mb-8 transform transition">
            {/* Question Number Badge */}
            <div className="flex items-start justify-between mb-6">
              <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-full text-sm">
                SORU {currentIndex + 1}
              </span>
              {currentQuestion.topic && (
                <span className="inline-block bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-full text-xs">
                  📖 {currentQuestion.topic}
                </span>
              )}
            </div>

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition duration-300 transform hover:scale-102 ${
                    currentAnswer?.selectedAnswer === index
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg scale-102'
                      : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold transition ${
                        currentAnswer?.selectedAnswer === index
                          ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`text-lg font-medium ${
                      currentAnswer?.selectedAnswer === index
                        ? 'text-gray-900'
                        : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                ← Önceki Soru
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading || answers.length !== questions.length}
                  className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg disabled:transform-none text-lg"
                >
                  {loading ? '⏳ Gönderiliyor...' : '✓ Sınavı Gönder'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                  Sonraki Soru →
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-8">
            <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
              <span className="text-xl">🧭</span> Sorulara Hızlı Erişim
            </h3>
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full aspect-square rounded-lg font-bold text-sm transition transform hover:scale-110 ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ring-2 ring-white shadow-lg scale-110'
                      : answers.some((a) => a.questionId === questions[index].id)
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/20'
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
      </div>
    )
  }

  // Sonuç Sayfası
  if (stage === 'result' && result) {
    const successRate = Math.round((result.score / result.totalQuestions) * 100)
    const isExcellent = successRate >= 90
    const isGood = successRate >= 70
    const isAverage = successRate >= 50
    
    // DEBUG
    console.log('=== RESULT DEBUG ===')
    console.log('Result:', result)
    console.log('Score:', result.score)
    console.log('Total Questions:', result.totalQuestions)
    console.log('Success Rate:', successRate)
    console.log('First Answer:', result.answers?.[0])
    
    // Backend'den gelen isCorrect field'ını kullan
    const wrongAnswers = (result.answers || []).filter((a) => {
      const isWrong = !a.isCorrect
      console.log(`Q${a.questionId}: isCorrect=${a.isCorrect} | isWrong=${isWrong}`)
      return isWrong
    })
    
    console.log('Wrong Answers Count:', wrongAnswers.length)
    console.log('Correct Answers Count:', (result.answers || []).filter(a => a.isCorrect).length)
    console.log('=== END DEBUG ===')

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navbar />
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Main Score Card */}
            <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Score Circle */}
              <div className="lg:col-span-1 flex items-center justify-center">
                <div className="relative w-72 h-72">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={
                        isExcellent
                          ? 'url(#gradientGreen)'
                          : isGood
                          ? 'url(#gradientBlue)'
                          : isAverage
                          ? 'url(#gradientYellow)'
                          : 'url(#gradientOrange)'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(successRate / 100) * 565} 565`}
                      strokeLinecap="round"
                      style={{
                        transition: 'stroke-dasharray 1s ease-out',
                      }}
                    />
                    <defs>
                      <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                      <linearGradient id="gradientYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                      <linearGradient id="gradientOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold text-white">{successRate}%</div>
                    <div className="text-white/60 text-sm mt-2">Başarı Oranı</div>
                  </div>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
                {/* Main Message */}
                <div className="mb-6">
                  <div className="text-5xl mb-3">
                    {isExcellent ? '🏆' : isGood ? '⭐' : isAverage ? '👍' : '📝'}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">Sınav Tamamlandı!</h1>
                  <p className="text-white/70 text-lg">
                    {isExcellent && '🎉 Harika bir performans! Bu sonuçları görmekten çok mutluyuz.'}
                    {isGood && !isExcellent && '👏 Çok güzel bir sonuç! Devam edin, daha iyi olabilirsiniz.'}
                    {isAverage && !isGood && '💪 İyi bir çabadır! Biraz daha pratik ile çok daha iyi olabilirsiniz.'}
                    {!isAverage && '📚 Daha fazla çalışmaya devam edin, iyileşmek için potansiyeliniz var!'}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur border border-green-400/30 rounded-xl p-4">
                    <p className="text-green-200 text-xs font-semibold uppercase mb-1">Doğru</p>
                    <p className="text-3xl font-bold text-green-400">{result.score}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur border border-red-400/30 rounded-xl p-4">
                    <p className="text-red-200 text-xs font-semibold uppercase mb-1">Yanlış</p>
                    <p className="text-3xl font-bold text-red-400">{result.totalQuestions - result.score}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur border border-purple-400/30 rounded-xl p-4">
                    <p className="text-purple-200 text-xs font-semibold uppercase mb-1">Toplam</p>
                    <p className="text-3xl font-bold text-purple-400">{result.totalQuestions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Yanlış Sorular & AI Feedback Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Left: Yanlış Sorular */}
              {wrongAnswers.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur rounded-2xl p-6 border border-red-400/20 sticky top-20">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">❌</span> Yanlış Sorular
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {wrongAnswers.map((answer, idx) => (
                        <div 
                          key={answer.questionId} 
                          className="bg-white/5 hover:bg-white/10 backdrop-blur rounded-lg p-3 border border-red-400/20 transition cursor-pointer group"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-bold text-red-400 mt-1">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80 line-clamp-2 group-hover:text-white transition">
                                {answer.questionText}
                              </p>
                              {answer.topic && answer.topic !== 'Bilinmiyor' && (
                                <span className="text-xs text-blue-300 mt-1 inline-block">
                                  📖 {answer.topic}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Right: Detailed Wrong Answers & AI Feedback */}
              <div className={wrongAnswers.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {wrongAnswers.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">📋</span> Detaylı İnceleme
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {wrongAnswers.map((answer, idx) => (
                        <div
                          key={answer.questionId}
                          className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur rounded-xl p-5 border border-white/10 hover:border-white/20 transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-semibold flex-1">
                              <span className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm mr-2 font-bold">
                                S{idx + 1}
                              </span>
                              {answer.questionText}
                            </h3>
                            {answer.topic && answer.topic !== 'Bilinmiyor' && (
                              <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded whitespace-nowrap ml-2">
                                {answer.topic}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {answer.options.map((option, i) => {
                              const isCorrect = i === answer.correctAnswer
                              const isSelected = i === answer.selectedAnswer
                              return (
                                <div
                                  key={i}
                                  className={`p-3 rounded-lg text-sm font-medium transition ${
                                    isCorrect
                                      ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50 text-green-100'
                                      : isSelected
                                      ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border border-red-400/50 text-red-100'
                                      : 'bg-white/5 border border-white/10 text-white/60'
                                  }`}
                                >
                                  <span className="font-bold">{String.fromCharCode(65 + i)})</span> {option}
                                  {isCorrect && ' ✓'}
                                  {isSelected && ' ✗'}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                {result.topicBasedFeedback && Object.keys(result.topicBasedFeedback).length > 0 ? (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🤖</span> Konu Bazında Tavsiyeler
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(result.topicBasedFeedback).map(([topic, feedback]) => (
                        <div
                          key={topic}
                          className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur rounded-xl p-6 border border-orange-400/30 hover:border-orange-400/50 transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-orange-300">{topic}</h3>
                            <span className="text-xs bg-orange-500/30 text-orange-200 px-2 py-1 rounded">
                              {feedback.wrongCount} soru
                            </span>
                          </div>
                          <p className="text-white/80 mb-3">{feedback.suggestions}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                            <div className="flex items-center gap-1">
                              <span>📚</span> Ders notlarını gözden geçirin
                            </div>
                            <div className="flex items-center gap-1">
                              <span>✍️</span> Benzer sorularla pratik yapın
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🎥</span> Video dersler izleyin
                            </div>
                            <div className="flex items-center gap-1">
                              <span>👥</span> Grup çalışması yapın
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : wrongAnswers.length === 0 ? (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur rounded-2xl p-8 border border-green-400/30">
                    <h2 className="text-2xl font-bold text-green-300 mb-2 flex items-center gap-2">
                      <span className="text-3xl">🎉</span> Mükemmel Performans!
                    </h2>
                    <p className="text-white/80">
                      Tüm soruları doğru cevapladığınız için tebrikler! Bu konuda oldukça iyi bir anlayış sergilemişsiniz. Böyle devam edin! 🚀
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur rounded-2xl p-8 border border-purple-400/30">
                    <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                      <span className="text-3xl">🤖</span> AI Geri Bildirimi
                    </h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-xl border-l-4 border-purple-500">
                      {result.feedback}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setStage('select')
                  setSelectedExam(null)
                  setAnswers([])
                  setCurrentIndex(0)
                }}
                className="flex-1 max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg"
              >
                📝 Başka Sınav Çöz
              </button>
              <a href="/" className="flex-1 max-w-sm">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg">
                  🏠 Anasayfaya Dön
                </button>
              </a>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

