'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import type { Exam, Question, ExamResult } from '@/types'

type Tab = 'exams' | 'results'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('exams')
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [results, setResults] = useState<ExamResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [newExamForm, setNewExamForm] = useState({ title: '', description: '' })
  const [newQuestionForm, setNewQuestionForm] = useState({
    text: '',
    topic: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  })
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/api/exams/management')
      setExams(response.data)
      setSelectedExam(null)
      setQuestions([])
    } catch (error) {
      console.error('Sınavlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async (examId: string) => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/questions/exam/${examId}`)
      setQuestions(response.data)
    } catch (error) {
      console.error('Sorular yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async (examId: string) => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/exams/results/${examId}`)
      setResults(response.data)
    } catch (error) {
      console.error('Sonuçlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam)
    fetchQuestions(exam.id)
    setNewQuestionForm({ text: '', topic: '', options: ['', '', '', ''], correctAnswer: 0 })
    setEditingQuestion(null)
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamForm.title.trim()) {
      alert('Sınav adı gereklidir')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('http://localhost:5000/api/exams/management', {
        title: newExamForm.title,
        description: newExamForm.description,
      })
      setNewExamForm({ title: '', description: '' })
      fetchExams()
    } catch (error) {
      console.error('Sınav oluşturulamadı:', error)
      alert('Sınav oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExam) return

    if (
      !newQuestionForm.text.trim() ||
      newQuestionForm.options.some((opt) => !opt.trim())
    ) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    // Debug logging
    console.log('=== Form Submit Debug ===')
    console.log('Form data:', newQuestionForm)
    console.log('Topic value:', newQuestionForm.topic)
    console.log('Topic length:', newQuestionForm.topic?.length)
    console.log('Topic trimmed:', newQuestionForm.topic?.trim())
    console.log('========================')

    try {
      setLoading(true)
      if (editingQuestion) {
        console.log('Updating question...')
        await axios.put(`http://localhost:5000/api/questions/${editingQuestion}`, {
          text: newQuestionForm.text,
          topic: newQuestionForm.topic,
          options: newQuestionForm.options,
          correctAnswer: newQuestionForm.correctAnswer,
        })
      } else {
        console.log('Creating new question...')
        await axios.post('http://localhost:5000/api/questions', {
          examId: selectedExam.id,
          text: newQuestionForm.text,
          topic: newQuestionForm.topic,
          options: newQuestionForm.options,
          correctAnswer: newQuestionForm.correctAnswer,
        })
      }
      setNewQuestionForm({ text: '', topic: '', options: ['', '', '', ''], correctAnswer: 0 })
      setEditingQuestion(null)
      fetchQuestions(selectedExam.id)
      fetchExams()
    } catch (error) {
      console.error('Soru kaydedilemedi:', error)
      alert('Soru kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuestion = (question: Question) => {
    // Type normalization - backend'den gelen data'yı normalize et
    const correctAnswerNum = typeof question.correctAnswer === 'string' 
      ? parseInt(question.correctAnswer) 
      : question.correctAnswer

    const optionsArray = Array.isArray(question.options) 
      ? question.options 
      : (typeof question.options === 'string' ? JSON.parse(question.options) : [])

    const newForm = {
      text: question.text || '',
      topic: question.topic || '',
      options: optionsArray,
      correctAnswer: correctAnswerNum,
    }

    console.log('Form state before update:', newQuestionForm)
    setNewQuestionForm(newForm)
    console.log('Form state after update:', newForm)
    setEditingQuestion(question.id)
    console.log('Editing question:', question.id)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Soruyu silmek istediğinizden emin misiniz?')) return

    try {
      setLoading(true)
      await axios.delete(`http://localhost:5000/api/questions/${questionId}`)
      if (selectedExam) {
        fetchQuestions(selectedExam.id)
        fetchExams()
      }
    } catch (error) {
      console.error('Soru silinemedi:', error)
      alert('Soru silinemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Sınavı silmek istediğinizden emin misiniz?')) return

    try {
      setLoading(true)
      await axios.delete(`http://localhost:5000/api/exams/management/${examId}`)
      setSelectedExam(null)
      setQuestions([])
      fetchExams()
    } catch (error) {
      console.error('Sınav silinemedi:', error)
      alert('Sınav silinemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🎓 Admin Panel</h1>
            <p className="text-white/60 text-sm mt-1">Sınavları ve soruları yönetin</p>
          </div>
          <a href="/">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition transform hover:scale-105">
              ← Ana Sayfaya Dön
            </button>
          </a>
        </div>

        {/* Tabs */}
        <div className="border-t border-white/10 px-6 py-4 flex gap-2">
          <button
            onClick={() => setTab('exams')}
            className={`px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 ${
              tab === 'exams'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            📝 Sınavları Yönet
          </button>
          <button
            onClick={() => setTab('results')}
            className={`px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 ${
              tab === 'results'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            📊 Yapılan Sınavlar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Sınavları Yönet Tab */}
        {tab === 'exams' && (
          <div className="space-y-8">
            {/* Create Exam Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur rounded-2xl border border-green-400/30 p-8">
                <h2 className="text-2xl font-bold text-green-300 mb-6 flex items-center gap-2">
                  <span className="text-3xl">➕</span> Yeni Sınav
                </h2>
                <form onSubmit={handleCreateExam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Sınav Adı
                    </label>
                    <input
                      type="text"
                      value={newExamForm.title}
                      onChange={(e) =>
                        setNewExamForm({ ...newExamForm, title: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-green-400/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                      placeholder="Örn: Matematik Sınavı"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Açıklama (İsteğe Bağlı)
                    </label>
                    <textarea
                      value={newExamForm.description}
                      onChange={(e) =>
                        setNewExamForm({ ...newExamForm, description: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-green-400/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                      placeholder="Sınav hakkında açıklama..."
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg disabled:scale-100"
                  >
                    {loading ? '⏳ Oluşturuluyor...' : '✓ Yeni Sınav Ekle'}
                  </button>
                </form>
              </div>

              {/* Exams List */}
              <div className="lg:col-span-2 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-3xl">📚</span> Sınavlar ({exams.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {exams.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      <p className="text-lg">📋 Henüz sınav eklenmemiş</p>
                    </div>
                  ) : (
                    exams.map((exam) => (
                      <div
                        key={exam.id}
                        onClick={() => handleSelectExam(exam)}
                        className={`p-4 rounded-xl cursor-pointer transition transform hover:scale-102 border-2 ${
                          selectedExam?.id === exam.id
                            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-white">
                              {exam.title}
                            </h3>
                            {exam.description && (
                              <p className="text-white/60 text-sm mt-1 line-clamp-2">
                                {exam.description}
                              </p>
                            )}
                            <span className="text-purple-300 text-sm mt-2 inline-block">
                              📝 {exam.questionCount} soru
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteExam(exam.id)
                            }}
                            className="text-red-400 hover:text-red-300 font-bold text-xl transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Questions Management */}
            {selectedExam && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Question Form */}
                <div className="lg:col-span-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur rounded-2xl border border-blue-400/30 p-8 h-fit sticky top-32">
                  <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">{editingQuestion ? '✏️' : '➕'}</span>
                    {editingQuestion ? 'Soruyu Düzenle' : 'Soru Ekle'}
                  </h3>

                  <form onSubmit={handleAddQuestion} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-blue-200 uppercase mb-2">
                        Soru Metni
                      </label>
                      <textarea
                        value={newQuestionForm.text}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, text: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition"
                        rows={3}
                        placeholder="Soruyu yazın..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-blue-200 uppercase mb-2">
                        Konu
                      </label>
                      <input
                        type="text"
                        value={newQuestionForm.topic}
                        onChange={(e) =>
                          setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition"
                        placeholder="Örn: Cebir, Tarih"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-blue-200 uppercase mb-2">
                        Seçenekler (A, B, C, D)
                      </label>
                      <div className="space-y-2">
                        {newQuestionForm.options.map((option, index) => (
                          <input
                            key={index}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestionForm.options]
                              newOptions[index] = e.target.value
                              setNewQuestionForm({
                                ...newQuestionForm,
                                options: newOptions,
                              })
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition"
                            placeholder={`${String.fromCharCode(65 + index)})`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-blue-200 uppercase mb-2">
                        Doğru Cevap
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {newQuestionForm.options.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              setNewQuestionForm({
                                ...newQuestionForm,
                                correctAnswer: index,
                              })
                            }
                            className={`py-2 px-3 rounded-lg font-bold transition ${
                              newQuestionForm.correctAnswer === index
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-105 shadow-lg disabled:scale-100 text-sm"
                      >
                        {loading ? '⏳' : editingQuestion ? '✓ Güncelle' : '✓ Ekle'}
                      </button>
                      {editingQuestion && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestion(null)
                            setNewQuestionForm({ text: '', topic: '', options: ['', '', '', ''], correctAnswer: 0 })
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition text-sm"
                        >
                          ✕ İptal
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Questions List */}
                <div className="lg:col-span-2 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">📋</span> Sorular ({questions.length})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {questions.length === 0 ? (
                      <div className="text-center py-12 text-white/40">
                        <p className="text-lg">Henüz soru eklenmemiş</p>
                      </div>
                    ) : (
                      questions.map((question, idx) => (
                        <div
                          key={question.id}
                          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold mr-2">
                                S{idx + 1}
                              </span>
                              <p className="text-white font-medium mt-2 line-clamp-2">
                                {question.text}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {question.topic && question.topic !== 'Bilinmiyor' && (
                              <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs border border-blue-400/30">
                                📖 {question.topic}
                              </span>
                            )}
                            {(!question.topic || question.topic === 'Bilinmiyor') && (
                              <span className="bg-gray-500/30 text-gray-300 px-2 py-1 rounded text-xs border border-gray-400/30">
                                📚 Konu Boş
                              </span>
                            )}
                            <span className="bg-green-500/30 text-green-200 px-2 py-1 rounded text-xs border border-green-400/30">
                              ✓ Doğru: {String.fromCharCode(65 + question.correctAnswer)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {question.options.map((option, i) => {
                              const optionArray = Array.isArray(question.options) 
                                ? question.options 
                                : (typeof question.options === 'string' ? JSON.parse(question.options) : [])
                              return (
                                <div
                                  key={i}
                                  className={`text-xs px-2 py-1 rounded ${
                                    i === question.correctAnswer
                                      ? 'bg-green-500/30 text-green-200 border border-green-400/30'
                                      : 'bg-white/5 text-white/60'
                                  }`}
                                >
                                  <span className="font-bold">{String.fromCharCode(65 + i)})</span> {optionArray[i]}
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 font-semibold py-2 rounded-lg transition text-sm"
                            >
                              ✏️ Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="flex-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 font-semibold py-2 rounded-lg transition text-sm"
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {tab === 'results' && (
          <div className="space-y-6">
            {/* Sınav Seç */}
            <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span> Sınavları Seç
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {exams.length === 0 ? (
                  <p className="text-white/60 col-span-full">Henüz sınav eklenmemiş</p>
                ) : (
                  exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam)
                        fetchResults(exam.id)
                        setSelectedResult(null)
                      }}
                      className={`p-4 rounded-lg font-semibold transition transform hover:scale-105 ${
                        selectedExam?.id === exam.id
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      <div className="text-lg font-bold">{exam.title}</div>
                      <div className="text-xs opacity-75 mt-1">📝 {exam.questionCount} soru</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Sonuçlar Listesi */}
            {selectedExam && (
              <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">📊</span> {selectedExam.title} - Sonuçlar
                </h2>

                {loading ? (
                  <div className="text-center py-12 text-white/60">
                    <p>⏳ Sonuçlar yükleniyor...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-12 text-white/60">
                    <p className="text-lg">📋 Bu sınava ait sonuç bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {results.map((result, idx) => (
                      <button
                        key={result.id}
                        onClick={() => setSelectedResult(result)}
                        className={`w-full text-left p-4 rounded-xl transition transform hover:scale-102 border-2 ${
                          selectedResult?.id === result.id
                            ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                #{idx + 1}
                              </span>
                              <span className="text-white font-bold text-lg">
                                {result.score}/{result.totalQuestions}
                              </span>
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                Math.round((result.score / result.totalQuestions) * 100) >= 70
                                  ? 'bg-green-500/30 text-green-200'
                                  : 'bg-orange-500/30 text-orange-200'
                              }`}>
                                %{Math.round((result.score / result.totalQuestions) * 100)}
                              </span>
                            </div>
                            {result.timestamp && (
                              <p className="text-white/60 text-sm mt-2">
                                📅 {new Date(result.timestamp).toLocaleString('tr-TR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sonuç Detayları */}
            {selectedResult && (
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur rounded-2xl border border-green-400/30 p-8">
                <h3 className="text-2xl font-bold text-green-300 mb-6 flex items-center gap-2">
                  <span className="text-2xl">✅</span> Detaylı Sonuç
                </h3>

                {/* Score Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                    <p className="text-white/60 text-sm font-semibold uppercase mb-2">Doğru Cevaplar</p>
                    <p className="text-3xl font-bold text-green-400">{selectedResult.score}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                    <p className="text-white/60 text-sm font-semibold uppercase mb-2">Toplam Soru</p>
                    <p className="text-3xl font-bold text-white">{selectedResult.totalQuestions}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                    <p className="text-white/60 text-sm font-semibold uppercase mb-2">Başarı Oranı</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      %{Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                  <h4 className="font-bold text-white mb-4">🤖 AI Geri Bildirimi</h4>
                  <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedResult.feedback}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

