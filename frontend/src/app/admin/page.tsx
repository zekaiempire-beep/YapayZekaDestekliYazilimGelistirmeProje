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
    setNewQuestionForm({ text: '', options: ['', '', '', ''], correctAnswer: 0 })
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

    try {
      setLoading(true)
      if (editingQuestion) {
        await axios.put(`http://localhost:5000/api/questions/${editingQuestion}`, {
          text: newQuestionForm.text,
          options: newQuestionForm.options,
          correctAnswer: newQuestionForm.correctAnswer,
        })
      } else {
        await axios.post('http://localhost:5000/api/questions', {
          examId: selectedExam.id,
          text: newQuestionForm.text,
          options: newQuestionForm.options,
          correctAnswer: newQuestionForm.correctAnswer,
        })
      }
      setNewQuestionForm({ text: '', options: ['', '', '', ''], correctAnswer: 0 })
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
    setNewQuestionForm({
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
    })
    setEditingQuestion(question.id)
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Paneli</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('exams')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              tab === 'exams'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📝 Sınavları Yönet
          </button>
          <button
            onClick={() => setTab('results')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              tab === 'results'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 Yapılan Sınavlar
          </button>
          <a href="/">
            <button className="px-6 py-3 font-semibold bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition">
              ← Ana Sayfaya Dön
            </button>
          </a>
        </div>

        {/* Sınavları Yönet Tab */}
        {tab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Yeni Sınav Oluştur */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">Yeni Sınav Oluştur</h2>
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sınav Adı
                  </label>
                  <input
                    type="text"
                    value={newExamForm.title}
                    onChange={(e) =>
                      setNewExamForm({ ...newExamForm, title: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Matematik Sınavı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama (İsteğe Bağlı)
                  </label>
                  <textarea
                    value={newExamForm.description}
                    onChange={(e) =>
                      setNewExamForm({ ...newExamForm, description: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sınav hakkında açıklama..."
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Oluşturuluyor...' : '+ Yeni Sınav Ekle'}
                </button>
              </form>
            </div>

            {/* Sınavlar Listesi */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6">
                  Sınavlar ({exams.length})
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {exams.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henüz sınav eklenmemiş</p>
                  ) : (
                    exams.map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedExam?.id === exam.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                        onClick={() => handleSelectExam(exam)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                              {exam.title}
                            </h3>
                            {exam.description && (
                              <p className="text-gray-600 text-sm mt-1">{exam.description}</p>
                            )}
                            <p className="text-blue-600 text-sm mt-2">
                              📝 {exam.questionCount} soru
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteExam(exam.id)
                            }}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            ✕ Sil
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seçilen Sınavın Sorularını Yönet */}
        {tab === 'exams' && selectedExam && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Soru Ekle/Düzenle */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                {editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
              </h2>
              <p className="text-gray-600 mb-6">{selectedExam.title}</p>

              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soru Metni
                  </label>
                  <textarea
                    value={newQuestionForm.text}
                    onChange={(e) =>
                      setNewQuestionForm({ ...newQuestionForm, text: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Soruyu yazın..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seçenekler
                  </label>
                  {newQuestionForm.options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <input
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
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Seçenek ${index + 1}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestionForm.correctAnswer === index}
                        onChange={() =>
                          setNewQuestionForm({
                            ...newQuestionForm,
                            correctAnswer: index,
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                        title="Doğru cevap"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {loading ? 'Kaydediliyor...' : editingQuestion ? 'Güncelle' : 'Ekle'}
                  </button>
                  {editingQuestion && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(null)
                        setNewQuestionForm({
                          text: '',
                          options: ['', '', '', ''],
                          correctAnswer: 0,
                        })
                      }}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Sorular Listesi */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">
                Sorular ({questions.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Bu sınava ait soru yok</p>
                ) : (
                  questions.map((question, idx) => (
                    <div
                      key={question.id}
                      className="p-4 border border-gray-300 rounded-lg hover:shadow-md transition"
                    >
                      <p className="font-semibold text-gray-800 mb-2">
                        {idx + 1}. {question.text}
                      </p>
                      <div className="space-y-1 mb-3 text-sm">
                        {question.options.map((option, i) => (
                          <p
                            key={i}
                            className={
                              i === question.correctAnswer
                                ? 'text-green-600 font-semibold'
                                : 'text-gray-600'
                            }
                          >
                            {String.fromCharCode(65 + i)}) {option}
                          </p>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 rounded transition"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={loading}
                          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-sm py-1 rounded transition"
                        >
                          ✕ Sil
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Yapılan Sınavlar Tab */}
        {tab === 'results' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sınavları Seç */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">Sınavları Seç</h2>
              <div className="space-y-2">
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      setSelectedExam(exam)
                      fetchResults(exam.id)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedExam?.id === exam.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-semibold">{exam.title}</div>
                    <div className="text-xs opacity-75">📝 {exam.questionCount} soru</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sonuçlar Listesi */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">
                Yapılan Sınavlar {selectedExam && `- ${selectedExam.title}`}
              </h2>

              {!selectedExam ? (
                <p className="text-gray-500 text-center py-8">Sınav seçin</p>
              ) : results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Bu sınava ait sonuç yok</p>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedResult?.id === result.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-gray-800">
                            {result.score}/{result.totalQuestions} (
                            {Math.round((result.score / result.totalQuestions) * 100)}%)
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            📅{' '}
                            {new Date(result.timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sonuç Detayları */}
              {selectedResult && (
                <div className="mt-8 pt-8 border-t border-gray-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Detaylı Geri Bildirim</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedResult.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

